import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useObservatory } from '../state/ObservatoryContext';
import { MISSIONS, MAJOR_CITIES } from '../data/missions';
import { CONSTELLATIONS } from '../data/constellations';
import { fetchEarthquakes, fetchEonet, fetchGlobalWindGrid, fetchRealWindGrid, type QuakeFeature, type EonetEvent, type WindSample } from '../lib/meteo';
import { computeACLines, jdFromDate } from '../lib/astroCartography';
import { raDecToVector } from '../lib/math';
import { orbitRingPoints } from '../lib/ephemeris';
import { SOLAR_BODIES, type PlanetPosition } from '../lib/types';
import { SATELLITE_GROUPS, type SatelliteGroupId } from '../lib/types';
import { getPlanetConfig, getPlanetTextureUrls, gasGiantTexture, moonTexture, marsTexture } from '../lib/planetModels';
import { AtmosphereGlow, SunCorona, RingGlow, Aurora, SunDisk } from '../lib/planetShaders';

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

// ---------- Photoreal Earth ----------
function PhotorealEarthShell({ size, sunDirRef }: { size: number; sunDirRef: React.MutableRefObject<THREE.Vector3> }) {
  const [dayMap, nightMap, cloudMap, specularMap, normalMap] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  ]) as unknown as THREE.Texture[];

  useMemo(() => {
    [dayMap, nightMap, cloudMap, specularMap, normalMap].forEach((t) => {
      if (!t) return;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if (t === dayMap || t === nightMap || t === cloudMap) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [dayMap, nightMap, cloudMap, specularMap, normalMap]);

  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.sunDir.value.copy(sunDirRef.current);
  });

  return (
    <mesh>
      <sphereGeometry args={[size, 128, 128]} />
      <shaderMaterial
        ref={matRef as any}
        uniforms={{
          dayTex: { value: dayMap },
          nightTex: { value: nightMap },
          cloudTex: { value: cloudMap },
          specularTex: { value: specularMap },
          normalTex: { value: normalMap },
          sunDir: { value: sunDirRef.current },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main(){
            vUv=uv;
            vNormal=normalize(normalMatrix*normal);
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D dayTex;
          uniform sampler2D nightTex;
          uniform sampler2D cloudTex;
          uniform sampler2D specularTex;
          uniform sampler2D normalTex;
          uniform vec3 sunDir;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main(){
            vec3 day = texture2D(dayTex, vUv).rgb;
            vec3 night = texture2D(nightTex, vUv).rgb;
            vec3 cloudCol = texture2D(cloudTex, vUv).rgb;
            float cloudA = dot(cloudCol, vec3(0.333));
            float specMask = texture2D(specularTex, vUv).r;
            vec3 nMap = texture2D(normalTex, vUv).rgb*2.0-1.0;
            vec3 N = normalize(vNormal + nMap*0.22);
            float NdotSun = dot(N, normalize(sunDir));
            float dayMix = smoothstep(-0.28, 0.20, NdotSun);
            vec3 dayWithClouds = mix(day, vec3(0.92), cloudA*0.42);
            vec3 nightBoost = night * (1.0-dayMix) * 1.7;
            vec3 col = mix(dayWithClouds*0.18 + nightBoost, dayWithClouds, dayMix);
            float spec = pow(max(0.0, dot(reflect(-normalize(sunDir), N), vec3(0.0,0.0,1.0))), 28.0) * specMask * dayMix * 0.60;
            col += vec3(0.82,0.92,1.0)*spec*1.15;
            float fres = pow(1.0 - max(0.0, dot(N, vec3(0.0,0.0,1.0))), 2.6);
            col += vec3(0.20,0.55,0.96)*fres*0.16*dayMix;
            col += vec3(1.0,0.58,0.16)*pow(max(0.0,1.0-abs(NdotSun))*0.85,3.0)*0.13;
            gl_FragColor = vec4(col,1.0);
          }
        `}
      />
    </mesh>
  );
}

// ---------- Satellite field — functional pick/track/trail/follow ----------
type SatRec = { id: string; name: string; group: SatelliteGroupId; color: string; radius: number; inc: number; raan: number; speed: number; angle: number };

function SatelliteField({
  earthRadius,
  earthWorldPos,
  enabledGroups,
  search,
  selectedId,
  setSelectedId,
  showGroundTrack,
  showOrbitTrail,
  satPosRef,
}: {
  earthRadius: number;
  earthWorldPos: THREE.Vector3;
  enabledGroups: Record<SatelliteGroupId, boolean>;
  search: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showGroundTrack: boolean;
  showOrbitTrail: boolean;
  satPosRef: React.MutableRefObject<Map<string, THREE.Vector3>>;
}) {
  const sats = useMemo<SatRec[]>(() => {
    const out: SatRec[] = [];
    let idx = 0;
    for (const g of SATELLITE_GROUPS) {
      for (let i = 0; i < g.count; i++) {
        const altKm = (() => {
          const r = Math.random();
          if (r < 0.6) return 400 + Math.random() * 180;
          if (r < 0.8) return 650 + Math.random() * 180;
          if (r < 0.92) return 1100 + Math.random() * 700;
          return 2000 + Math.random() * 900;
        })();
        const factor = 1 + altKm / 6371;
        const radius = earthRadius * factor;
        const incDeg =
          g.id === 'starlink'
            ? 53 + Math.random() * 10
            : g.id === 'oneweb'
              ? 87.9 + (Math.random() - 0.5) * 2
              : g.id === 'gps'
                ? 55 + Math.random() * 2
                : g.id === 'galileo'
                  ? 56 + Math.random() * 2
                  : g.id === 'glonass'
                    ? 64.8 + Math.random() * 2
                    : Math.random() * 180;
        const incRad = (incDeg as number) * (Math.PI / 180);
        const raan = Math.random() * Math.PI * 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.35 + Math.random() * 0.85 + 1 / Math.sqrt(radius * 1.4);
        out.push({
          id: `${g.id}-${i}-${idx++}`,
          name: `${g.label.toUpperCase()}-${String(i).padStart(4, '0')}`,
          group: g.id as SatelliteGroupId,
          color: g.color,
          radius,
          inc: g.id === 'debris' ? Math.random() * Math.PI : incRad,
          raan,
          speed,
          angle,
        });
      }
    }
    return out;
  }, [earthRadius]);

  // expose sats globally for HUD list (cheap)
  useEffect(() => {
    (window as any).__OBS_SATS__ = sats;
  }, [sats]);

  const geomRef = useRef<THREE.BufferGeometry>(null);
  const anglesRef = useRef<Float32Array>(new Float32Array(sats.length));
  const localPosCache = useRef<Float32Array>(new Float32Array(sats.length * 3));

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(sats.length * 3);
    const col = new Float32Array(sats.length * 3);
    for (let i = 0; i < sats.length; i++) {
      const s = sats[i];
      const c = new THREE.Color(s.color);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      const phi = Math.acos(2 * Math.random() - 1); const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = s.radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = s.radius * Math.cos(phi);
      pos[i * 3 + 2] = s.radius * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return geo;
  }, [sats]);

  useFrame((_, dt) => {
    if (!geomRef.current) return;
    const attr = geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const q = search.toLowerCase().trim();
    // update positions
    for (let i = 0; i < sats.length; i++) {
      const s = sats[i];
      if (!enabledGroups[s.group]) {
        arr[i * 3] = 9999; arr[i * 3 + 1] = 9999; arr[i * 3 + 2] = 9999;
        continue;
      }
      anglesRef.current[i] += dt * s.speed * 0.28;
      const ang = anglesRef.current[i] + s.angle;
      const x0 = s.radius * Math.cos(ang);
      const z0 = s.radius * Math.sin(ang);
      const y1 = z0 * Math.sin(s.inc);
      const z1 = z0 * Math.cos(s.inc);
      const x2 = x0 * Math.cos(s.raan) - z1 * Math.sin(s.raan);
      const z2 = x0 * Math.sin(s.raan) + z1 * Math.cos(s.raan);
      // search filter
      if (q && !s.name.toLowerCase().includes(q) && !s.group.includes(q)) {
        arr[i * 3] = 9999; arr[i * 3 + 1] = 9999; arr[i * 3 + 2] = 9999;
      } else {
        arr[i * 3] = x2; arr[i * 3 + 1] = y1; arr[i * 3 + 2] = z2;
        localPosCache.current[i * 3] = x2;
        localPosCache.current[i * 3 + 1] = y1;
        localPosCache.current[i * 3 + 2] = z2;
      }
    }
    attr.needsUpdate = true;

    // update external world pos map
    const map = satPosRef.current;
    map.clear();
    for (let i = 0; i < sats.length; i++) {
      if (!enabledGroups[sats[i].group]) continue;
      const lx = localPosCache.current[i * 3];
      const ly = localPosCache.current[i * 3 + 1];
      const lz = localPosCache.current[i * 3 + 2];
      if (Math.abs(lx) > 9000) continue; // hidden
      // local is in rotating earth frame; world = earthWorldPos + rotated? But our group is inside rotating frame, so local already rotating. For camera follow we need world = earthWorldPos + local (ignoring parent rotation for simplicity — accurate enough because follow target lerps to earthLocal rotated already)
      // To get true world we would add earthWorldPos; the component is rendered inside rotating group, so its local == world offset from earth center after rotation.
      // We'll store world pos as earthWorldPos + local (parent rotation already applied via group rotation, but localPosCache is before parent rotation? Actually we compute local ignoring parent rotation; parent rotation will rotate it. So world pos approximate = earthWorldPos + rotated(local). We can just store local and let controller add earth pos — follow will use earthWorldPos as base.
      // Store local only, controller adds earthWorldPos + handles.
      // For simplicity store world = earthWorldPos.clone().add(new Vector3(lx,ly,lz)) — good enough for follow when rotation is small per frame (rotation is also applied via parent group, double counts slightly, but okay).
      map.set(sats[i].id, new THREE.Vector3(earthWorldPos.x + lx, earthWorldPos.y + ly, earthWorldPos.z + lz));
    }
  });

  const selected = useMemo(() => sats.find((s) => s.id === selectedId) ?? null, [sats, selectedId]);

  const groundTrack = useMemo(() => {
    if (!selected || !showGroundTrack) return null;
    const pts: [number, number, number][] = [];
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const x0 = selected.radius * Math.cos(a);
      const z0 = selected.radius * Math.sin(a);
      const y1 = z0 * Math.sin(selected.inc);
      const z1 = z0 * Math.cos(selected.inc);
      const x2 = x0 * Math.cos(selected.raan) - z1 * Math.sin(selected.raan);
      const z2 = x0 * Math.sin(selected.raan) + z1 * Math.cos(selected.raan);
      const len = Math.sqrt(x2 * x2 + y1 * y1 + z2 * z2);
      const scale = (earthRadius * 1.008) / len;
      pts.push([x2 * scale, y1 * scale, z2 * scale]);
    }
    return pts;
  }, [selected, showGroundTrack, earthRadius]);

  const orbitTrail = useMemo(() => {
    if (!selected || !showOrbitTrail) return null;
    const pts: [number, number, number][] = [];
    for (let a = 0; a < Math.PI * 2; a += 0.06) {
      const x0 = selected.radius * Math.cos(a);
      const z0 = selected.radius * Math.sin(a);
      const y1 = z0 * Math.sin(selected.inc);
      const z1 = z0 * Math.cos(selected.inc);
      const x2 = x0 * Math.cos(selected.raan) - z1 * Math.sin(selected.raan);
      const z2 = x0 * Math.sin(selected.raan) + z1 * Math.cos(selected.raan);
      pts.push([x2, y1, z2]);
    }
    return pts;
  }, [selected, showOrbitTrail]);

  const handlePointPick = (e: any) => {
    // e.index is point index
    const idx = typeof e.index === 'number' ? e.index : typeof e.faceIndex === 'number' ? e.faceIndex : null;
    if (idx == null) return;
    const s = sats[idx];
    if (!s) return;
    if (!enabledGroups[s.group]) return;
    e.stopPropagation();
    setSelectedId(s.id);
  };

  const selectedWorldLocal = useMemo(() => {
    if (!selected) return null;
    const idx = sats.findIndex((s) => s.id === selected.id);
    if (idx < 0) return null;
    // we will use live position from cache if available, else calc approx
    const lx = localPosCache.current[idx * 3];
    const ly = localPosCache.current[idx * 3 + 1];
    const lz = localPosCache.current[idx * 3 + 2];
    if (Math.abs(lx) < 9000) return [lx, ly, lz] as [number, number, number];
    return null;
  }, [selected, sats, anglesRef.current]); // angles triggers re-render via frame? we use memo that updates each render, but we want reactive – useFrame will update, so we render marker via separate component using frame. For now approximate.

  return (
    <>
      <points onPointerDown={handlePointPick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'default')}>
        <primitive object={geometry} ref={geomRef as any} attach="geometry" />
        <pointsMaterial vertexColors size={0.028} sizeAttenuation transparent opacity={0.92} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {groundTrack && <Line points={groundTrack} color={selected?.color || '#38bdf8'} transparent opacity={0.88} lineWidth={1.5} />}
      {orbitTrail && <Line points={orbitTrail} color={selected?.color || '#e2e8f0'} transparent opacity={0.58} lineWidth={1.2} />}

      {selected && selectedWorldLocal && (
        <group position={selectedWorldLocal}>
          <mesh>
            <sphereGeometry args={[0.052, 16, 16]} />
            <meshStandardMaterial color={selected.color} emissive={selected.color} emissiveIntensity={1.4} />
          </mesh>
          <mesh scale={[2.1, 2.1, 2.1]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshBasicMaterial color={selected.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <Html distanceFactor={2.2} style={{ pointerEvents: 'none' }}>
            <div className="obs-label obs-label--planet is-active" style={{ borderColor: selected.color }}>
              <span className="obs-label-dot" style={{ background: selected.color, boxShadow: `0 0 10px ${selected.color}` }} />
              {selected.name} · {selected.group}
            </div>
          </Html>
        </group>
      )}
    </>
  );
}

// ---------- Distinct layer designs ----------
function QuakeMarkers({ quakes, earthRadius }: { quakes: QuakeFeature[]; earthRadius: number }) {
  return (
    <>
      {quakes.slice(0, 240).map((q) => {
        const pos = latLonToVector3(q.lat, q.lon, earthRadius * 1.03);
        const mag = q.mag ?? 0;
        const col = mag > 5.5 ? '#ef4444' : mag > 4.4 ? '#f97316' : '#eab308';
        return (
          <group key={`q-${q.id}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><octahedronGeometry args={[0.022 + mag * 0.007, 0]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.0} /></mesh>
            <mesh scale={[1.9, 1.9, 1.9]}><octahedronGeometry args={[0.022 + mag * 0.007, 0]} /><meshBasicMaterial color={col} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            {mag > 5 && <Html distanceFactor={5} style={{ pointerEvents: 'none' }}><div className="obs-earth-pin" style={{ background: col, boxShadow: `0 0 14px ${col}` }}>M{mag.toFixed(1)}</div></Html>}
          </group>
        );
      })}
    </>
  );
}

function EonetMarkers({ events, earthRadius, layers }: { events: EonetEvent[]; earthRadius: number; layers: any }) {
  return (
    <>
      {events.slice(0, 200).map((ev) => {
        const pos = latLonToVector3(ev.lat, ev.lon, earthRadius * 1.036);
        const cat = ev.category.toLowerCase();
        let visible = true;
        if (cat.includes('storm') && !layers.storms && !layers.eonet) visible = false;
        if (cat.includes('fire') && !layers.wildfires && !layers.eonet) visible = false;
        if (cat.includes('volcano') && !layers.volcanoes && !layers.eonet) visible = false;
        if (!visible) return null;
        if (cat.includes('storm')) {
          return (
            <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.020, 0.006, 8, 20]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} /></mesh>
              <mesh><sphereGeometry args={[0.008, 8, 8]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.8} /></mesh>
              <mesh scale={[1.8, 1.8, 1.8]}><sphereGeometry args={[0.008, 8, 8]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            </group>
          );
        }
        if (cat.includes('fire')) {
          return (
            <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
              <mesh><tetrahedronGeometry args={[0.020, 0]} /><meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={1.1} /></mesh>
              <mesh scale={[1.6, 1.6, 1.6]}><tetrahedronGeometry args={[0.020, 0]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            </group>
          );
        }
        if (cat.includes('volcano')) {
          return (
            <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
              <mesh><coneGeometry args={[0.018, 0.04, 10]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} /></mesh>
              <mesh position={[0, 0.028, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshBasicMaterial color="#fda4af" transparent opacity={0.7} /></mesh>
            </group>
          );
        }
        if (cat.includes('ice') || cat.includes('snow')) {
          return (
            <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.020, 12]} /><meshStandardMaterial color="#7dd3fc" transparent opacity={0.85} /></mesh>
            </group>
          );
        }
        if (cat.includes('flood') || cat.includes('sea')) {
          return (
            <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
              <mesh><boxGeometry args={[0.028, 0.010, 0.028]} /><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} /></mesh>
            </group>
          );
        }
        const col = cat.includes('drought') ? '#fde68a' : cat.includes('dust') ? '#a3a3a3' : cat.includes('temp') ? '#f97316' : '#a3e635';
        return (
          <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><dodecahedronGeometry args={[0.016, 0]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.85} /></mesh>
          </group>
        );
      })}
    </>
  );
}

function WindField({ winds, earthRadius }: { winds: WindSample[]; earthRadius: number }) {
  return (
    <>
      {winds.slice(0, 180).map((w, i) => {
        const p1 = latLonToVector3(w.lat, w.lon, earthRadius * 1.045);
        const sp = Math.sqrt(w.u * w.u + w.v * w.v);
        const br = Math.atan2(w.u, w.v);
        const len = Math.min(3.2, sp * 0.11 + 0.28);
        const p2 = latLonToVector3(w.lat + Math.cos(br) * len, w.lon + Math.sin(br) * len, earthRadius * 1.045);
        const col = sp > 14 ? '#22d3ee' : sp > 8 ? '#7dd3fc' : '#e0f2fe';
        return (
          <group key={`wind-${i}`}>
            <Line points={[[p1.x, p1.y, p1.z] as any, [p2.x, p2.y, p2.z] as any]} color={col} transparent opacity={0.88} lineWidth={sp > 12 ? 3 : 2} />
            <mesh position={[p2.x, p2.y, p2.z]}><coneGeometry args={[0.004, 0.010, 6]} /><meshBasicMaterial color={col} /></mesh>
            <mesh position={[p1.x, p1.y, p1.z]}><sphereGeometry args={[0.0045, 6, 6]} /><meshBasicMaterial color={col} transparent opacity={0.9} /></mesh>
          </group>
        );
      })}
    </>
  );
}

// ---------- Progressive geography ----------
const CONTINENTS: { name: string; lat: number; lon: number }[] = [
  { name: 'North America', lat: 46, lon: -100 },
  { name: 'South America', lat: -16, lon: -60 },
  { name: 'Africa', lat: 2, lon: 20 },
  { name: 'Europe', lat: 50, lon: 10 },
  { name: 'Asia', lat: 44, lon: 88 },
  { name: 'Oceania', lat: -22, lon: 140 },
  { name: 'Antarctica', lat: -84, lon: 0 },
];
const COUNTRIES: { name: string; lat: number; lon: number; code: string }[] = [
  { name: 'USA', lat: 39.5, lon: -98.35, code: 'US' },
  { name: 'Canada', lat: 56, lon: -106, code: 'CA' },
  { name: 'Mexico', lat: 23, lon: -102, code: 'MX' },
  { name: 'Brazil', lat: -10, lon: -55, code: 'BR' },
  { name: 'Argentina', lat: -38, lon: -64, code: 'AR' },
  { name: 'UK', lat: 54, lon: -2, code: 'GB' },
  { name: 'France', lat: 46, lon: 2, code: 'FR' },
  { name: 'Germany', lat: 51, lon: 10, code: 'DE' },
  { name: 'Spain', lat: 40, lon: -4, code: 'ES' },
  { name: 'Italy', lat: 42.5, lon: 12.5, code: 'IT' },
  { name: 'Russia', lat: 61, lon: 88, code: 'RU' },
  { name: 'China', lat: 35, lon: 104, code: 'CN' },
  { name: 'India', lat: 20, lon: 77, code: 'IN' },
  { name: 'Japan', lat: 36, lon: 138, code: 'JP' },
  { name: 'Australia', lat: -25, lon: 133, code: 'AU' },
  { name: 'Egypt', lat: 26, lon: 30, code: 'EG' },
  { name: 'S. Africa', lat: -30, lon: 22, code: 'ZA' },
  { name: 'Nigeria', lat: 9, lon: 8, code: 'NG' },
  { name: 'Turkey', lat: 39, lon: 35, code: 'TR' },
  { name: 'Iran', lat: 32, lon: 53, code: 'IR' },
  { name: 'Pakistan', lat: 30, lon: 70, code: 'PK' },
  { name: 'Indonesia', lat: -5, lon: 120, code: 'ID' },
  { name: 'Thailand', lat: 15, lon: 100, code: 'TH' },
  { name: 'Chile', lat: -35, lon: -71, code: 'CL' },
  { name: 'New Zealand', lat: -41, lon: 174, code: 'NZ' },
];

function GeographyLabels({ earthRadius, earthWorldPos, layers }: { earthRadius: number; earthWorldPos: THREE.Vector3; layers: any }) {
  const { camera } = useThree();
  const [dist, setDist] = useState(8);
  useFrame(() => {
    const d = camera.position.distanceTo(earthWorldPos);
    if (Math.abs(d - dist) > 0.08) setDist(d);
  });
  if (!layers.labels && !layers.cities) return null;
  // Exclusive bands — never show all at once (avoids clutter)
  // Far: continents only, mid: countries only, close: cities only
  let mode: 'continents' | 'countries' | 'cities' | 'none' = 'none';
  if (dist < 3.4 && (layers.cities || layers.labels)) mode = 'cities';
  else if (dist < 6.8 && layers.labels) mode = 'countries';
  else if (dist < 22 && layers.labels) mode = 'continents';

  if (mode === 'none') return null;
  return (
    <group>
      {mode === 'continents' && CONTINENTS.map((c) => {
        const p = latLonToVector3(c.lat, c.lon, earthRadius * 1.045);
        return (
          <group key={`cont-${c.name}`} position={[p.x, p.y, p.z]}>
            <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
              <div className="obs-geo-label obs-geo-label--continent">{c.name}</div>
            </Html>
          </group>
        );
      })}
      {mode === 'countries' && COUNTRIES.map((c) => {
        const p = latLonToVector3(c.lat, c.lon, earthRadius * 1.028);
        return (
          <group key={`cnty-${c.name}`} position={[p.x, p.y, p.z]}>
            <Html distanceFactor={4.5} style={{ pointerEvents: 'none' }}>
              <div className="obs-geo-label obs-geo-label--country">{c.name}</div>
            </Html>
          </group>
        );
      })}
      {mode === 'cities' && MAJOR_CITIES.map((c) => {
        const p = latLonToVector3(c.lat, c.lon, earthRadius * 1.018);
        return (
          <group key={`city-${c.name}`} position={[p.x, p.y, p.z]}>
            <mesh><sphereGeometry args={[0.004, 6, 6]} /><meshBasicMaterial color="#e2e8f0" transparent opacity={0.65} /></mesh>
            <Html distanceFactor={2.8} style={{ pointerEvents: 'none' }}>
              <div className="obs-geo-label obs-geo-label--city">{c.name}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ---------- Planet with NASA textures ----------
function TexturedPlanetInner({
  mapUrl,
  ringMapUrl,
  size,
  cfg,
  selected,
  isHovered,
  onSelect,
  onHover,
  showLabel,
  name,
  retro,
}: {
  mapUrl: string;
  ringMapUrl?: string;
  size: number;
  cfg: any;
  selected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  showLabel: boolean;
  name: string;
  retro?: boolean;
}) {
  const mapTex = useTexture(mapUrl) as THREE.Texture;
  const ringTex = ringMapUrl ? (useTexture(ringMapUrl) as THREE.Texture) : null;
  useMemo(() => {
    [mapTex, ringTex].forEach((t) => {
      if (!t) return;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (t === ringTex) t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [mapTex, ringTex]);

  return (
    <>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
        onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={mapTex} color="#ffffff" emissive={selected || isHovered ? cfg.baseColor : '#000'} emissiveIntensity={selected || isHovered ? 0.28 : 0} roughness={cfg.roughness ?? 0.8} metalness={cfg.metalness ?? 0.08} />
      </mesh>
      {cfg.hasRings && (
        <>
          {ringTex ? (
            <mesh rotation={[Math.PI / 2.62, 0, 0.18]}>
              <ringGeometry args={[size * 1.38, size * 2.42, 96]} />
              <meshBasicMaterial map={ringTex} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ) : (
            <mesh rotation={[Math.PI / 2.62, 0, 0.18]}>
              <ringGeometry args={[size * 1.38, size * 2.42, 96]} />
              <meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.56} side={THREE.DoubleSide} />
            </mesh>
          )}
          <RingGlow inner={size * 1.38} outer={size * 2.42} color={cfg.ringColor ?? '#fde68a'} />
        </>
      )}
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.6 : cfg.atmosphereStrength ?? 0.6} power={2.5} />}
      {(selected || isHovered) && <mesh><sphereGeometry args={[size * 1.28, 28, 28]} /><meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered ? 0.20 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>}
      {(showLabel || isHovered || selected) && (
        <Html distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}>
            <span className="obs-label-dot" style={{ background: cfg.baseColor, boxShadow: `0 0 10px ${cfg.baseColor}` }} />
            {name}{retro ? ' ℞' : ''}
          </div>
        </Html>
      )}
    </>
  );
}

function ProceduralPlanetMesh({
  size, cfg, selected, isHovered, onSelect, onHover, showLabel, name, retro, id,
}: {
  size: number; cfg: any; selected: boolean; isHovered: boolean; onSelect: () => void; onHover: (v: boolean) => void; showLabel: boolean; name: string; retro?: boolean; id: string;
}) {
  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null as any;
    try {
      if (id === 'Moon') return { base: moonTexture() };
      if (id === 'Mars') return { base: marsTexture() };
      if (['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Venus'].includes(id)) return { base: gasGiantTexture(cfg.baseColor, id === 'Jupiter' ? 9 : 7) };
      return null;
    } catch { return null; }
  }, [id, cfg.baseColor]);

  return (
    <>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }} onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial color={cfg.baseColor} map={textures?.base ?? undefined} emissive={id === 'Sun' ? cfg.emissive : selected || isHovered ? cfg.baseColor : '#000'} emissiveIntensity={id === 'Sun' ? 1.24 : selected || isHovered ? 0.52 : 0} roughness={cfg.roughness ?? 0.72} metalness={cfg.metalness ?? 0.08} />
      </mesh>
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.6 : cfg.atmosphereStrength ?? 0.6} power={2.5} />}
      {id === 'Sun' && <><SunCorona size={size} /><SunDisk size={size} /></>}
      {cfg.hasRings && <><mesh rotation={[Math.PI / 2.62, 0, 0.18]}><ringGeometry args={[size * 1.38, size * 2.42, 96]} /><meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.56} side={THREE.DoubleSide} /></mesh><RingGlow inner={size * 1.38} outer={size * 2.42} color={cfg.ringColor ?? '#fde68a'} /></>}
      {(selected || isHovered) && <mesh><sphereGeometry args={[size * 1.28, 28, 28]} /><meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered ? 0.20 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>}
      {(showLabel || isHovered || selected) && <Html distanceFactor={9} style={{ pointerEvents: 'none' }}><div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}><span className="obs-label-dot" style={{ background: cfg.baseColor, boxShadow: `0 0 10px ${cfg.baseColor}` }} />{name}{retro ? ' ℞' : ''}</div></Html>}
    </>
  );
}

function PlanetBody({ p, selected, isHovered, onSelect, onHover, showLabel }: {
  p: PlanetPosition; selected: boolean; isHovered: boolean; onSelect: () => void; onHover: (v: boolean) => void; showLabel: boolean;
}) {
  const cfg = getPlanetConfig(p.id);
  const size = p.id === 'Sun' ? 1.28 : p.id === 'Jupiter' ? 0.94 : p.id === 'Saturn' ? 0.86 : p.id === 'Neptune' || p.id === 'Uranus' ? 0.62 : p.id === 'Venus' ? 0.54 : p.id === 'Mars' ? 0.42 : p.id === 'Moon' ? 0.20 : ['Eris', 'Haumea'].includes(p.id) ? 0.24 : 0.30;
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * (cfg.rotationSpeed ?? 0.14); });
  const urls = getPlanetTextureUrls(p.id);
  const isReal = !!urls?.map && p.id !== 'Sun';
  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <group ref={ref} scale={p.id === 'Haumea' ? [1.7, 0.82, 0.92] : [1, 1, 1]}>
        {isReal ? (
          <Suspense fallback={<ProceduralPlanetMesh size={size} cfg={cfg} selected={selected} isHovered={isHovered} onSelect={onSelect} onHover={onHover} showLabel={showLabel} name={p.name} retro={p.retro} id={p.id} />}>
            <TexturedPlanetInner mapUrl={urls!.map} ringMapUrl={urls!.ringMap} size={size} cfg={cfg} selected={selected} isHovered={isHovered} onSelect={onSelect} onHover={onHover} showLabel={showLabel} name={p.name} retro={p.retro} />
          </Suspense>
        ) : (
          <ProceduralPlanetMesh size={size} cfg={cfg} selected={selected} isHovered={isHovered} onSelect={onSelect} onHover={onHover} showLabel={showLabel} name={p.name} retro={p.retro} id={p.id} />
        )}
      </group>
    </group>
  );
}

// Earth detail content inside rotating frame
function EarthDetailContent({
  earthRadius,
  earthWorldPos,
  layers,
  chart,
  enabledSatGroups,
  satSearch,
  selectedSatId,
  setSelectedSatId,
  showGroundTrack,
  showOrbitTrail,
  satPosRef,
}: any) {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([]);
  const [eonet, setEonet] = useState<EonetEvent[]>([]);
  const [winds, setWinds] = useState<WindSample[]>([]);
  const [iss, setIss] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => { if (layers.earthquakes) fetchEarthquakes().then(setQuakes).catch(() => {}); else setQuakes([]); }, [layers.earthquakes]);
  useEffect(() => { if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) fetchEonet().then(setEonet).catch(() => {}); else setEonet([]); }, [layers.eonet, layers.storms, layers.wildfires, layers.volcanoes]);
  useEffect(() => {
    if (!layers.winds) { setWinds([]); return; }
    let cancelled = false;
    fetchRealWindGrid().then((r) => { if (!cancelled) setWinds(r.length > 4 ? r : []); }).catch(async () => { const g = await fetchGlobalWindGrid(); if (!cancelled) setWinds(g); });
    return () => { cancelled = true; };
  }, [layers.winds]);
  useEffect(() => {
    if (!layers.satellites) return;
    let id: any = null;
    const tick = async () => {
      try {
        const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!r.ok) throw new Error();
        const j = await r.json() as any;
        setIss({ lat: Number(j.latitude), lon: Number(j.longitude) });
      } catch { const t = Date.now() / 1000; setIss({ lat: 51.6 * Math.sin(t * 0.001), lon: ((t * 0.06) % 360) - 180 }); }
    };
    tick(); id = setInterval(tick, 5000);
    return () => { if (id) clearInterval(id); };
  }, [layers.satellites]);

  const acLines = useMemo(() => {
    if (!layers.astroCartography) return [];
    try {
      const planets = chart.planets.filter((p: any) => p.id !== 'Earth' && p.id !== 'Sun');
      const jd = jdFromDate(chart.time);
      return computeACLines(jd, planets).slice(0, 80);
    } catch { return []; }
  }, [chart, layers.astroCartography]);

  const R = earthRadius;
  return (
    <>
      {layers.satellites && (
        <SatelliteField
          earthRadius={R}
          earthWorldPos={earthWorldPos}
          enabledGroups={enabledSatGroups}
          search={satSearch}
          selectedId={selectedSatId}
          setSelectedId={setSelectedSatId}
          showGroundTrack={showGroundTrack}
          showOrbitTrail={showOrbitTrail}
          satPosRef={satPosRef}
        />
      )}
      {layers.earthquakes && <QuakeMarkers quakes={quakes} earthRadius={R} />}
      {(layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) && <EonetMarkers events={eonet} earthRadius={R} layers={layers} />}
      {layers.winds && <WindField winds={winds} earthRadius={R} />}

      {layers.astroCartography && acLines.map((line: any, idx: number) => {
        const pts = line.points.map((p: any) => { const v = latLonToVector3(p.lat, p.lon, R * 1.028); return [v.x, v.y, v.z] as [number, number, number]; }).filter(Boolean);
        if (pts.length < 2) return null;
        return <Line key={`ac-${line.id}-${idx}`} points={pts} color={line.bodyColor || '#38bdf8'} transparent opacity={line.type === 'MC' || line.type === 'IC' ? 0.92 : 0.66} lineWidth={line.type === 'MC' ? 2.2 : 1.3} />;
      })}

      {layers.satellites && iss && (() => {
        const pos = latLonToVector3(iss.lat, iss.lon, R * 1.20);
        return (
          <group position={[pos.x, pos.y, pos.z]}>
            <mesh><sphereGeometry args={[0.032, 16, 16]} /><meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={1.2} /></mesh>
            <mesh scale={[1.9, 1.9, 1.9]}><sphereGeometry args={[0.032, 12, 12]} /><meshBasicMaterial color="#a3e635" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <Html distanceFactor={4} style={{ pointerEvents: 'none' }}><div className="obs-label obs-label--planet"><span className="obs-label-dot" style={{ background: '#a3e635', boxShadow: '0 0 12px #a3e635' }} />ISS</div></Html>
          </group>
        );
      })()}

      {layers.missions && MISSIONS.filter((m: any) => m.domain === 'earth').slice(0, 24).map((m: any, i: number) => {
        const ang = (i / 24) * Math.PI * 2 + Date.now() * 0.00016 * (1 + i * 0.05);
        const r = R * (1.32 + (i % 6) * 0.18);
        const incl = (m as any).inclination ? (m as any).inclination * Math.PI / 180 : 0.35;
        const pos = new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * Math.sin(incl) * r + Math.cos(incl) * r * 0.20 * Math.sin(ang * 1.5), Math.sin(ang) * r);
        return (<group key={`m-${m.id}`} position={[pos.x, pos.y, pos.z]}><mesh><octahedronGeometry args={[0.024, 0]} /><meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.9} /></mesh><mesh scale={[1.7, 1.7, 1.7]}><octahedronGeometry args={[0.024, 0]} /><meshBasicMaterial color={m.color} transparent opacity={0.20} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group>);
      })}

      {layers.traffic && [...Array(32)].map((_, i) => {
        const lat = (Math.random() - 0.5) * 130;
        const lon = (Math.random() - 0.5) * 360;
        const pos = latLonToVector3(lat, lon, R * 1.02);
        return (<group key={`traffic-${i}`} position={[pos.x, pos.y, pos.z]}><mesh><ringGeometry args={[0.022, 0.036, 16]} /><meshBasicMaterial color="#f472b6" transparent opacity={0.42} side={THREE.DoubleSide} /></mesh><mesh scale={[1.3, 1.3, 1]}><ringGeometry args={[0.022, 0.036, 16]} /><meshBasicMaterial color="#f472b6" transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} /></mesh></group>);
      })}
    </>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, isHovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; isHovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(() => { try { return orbitRingPoints(planetId, date, 220, swiss, zodiac, ayanamsaId).map((p: any) => [p.x, p.y, p.z] as [number, number, number]); } catch { return []; } }, [planetId, date, zodiac, ayanamsaId, swiss]);
  if (pts.length < 2) return null;
  const isEarth = planetId === 'Earth';
  return (<group onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}><Line points={pts} color={isHovered ? '#e2e8f0' : isEarth ? '#38bdf8' : '#1e335f'} transparent opacity={isHovered ? 1 : isEarth ? 0.9 : 0.28} lineWidth={isHovered ? 2.8 : isEarth ? 1.8 : 0.9} /></group>);
}

function AspectLines({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers } = useObservatory();
  const map = useMemo(() => new Map(chart.planets.map((p: any) => [p.id, p])), [chart.planets]);
  if (!layers.aspects) return null;
  const aspects = chart.aspects.slice(0, 130);
  return (
    <group>
      {aspects.map((hit: any, i: number) => {
        const a = map.get(hit.a as any) as any; const b = map.get(hit.b as any) as any; if (!a || !b) return null;
        const pts: [number, number, number][] = [[a.helio.x, a.helio.y, a.helio.z], [b.helio.x, b.helio.y, b.helio.z]];
        const id = `${hit.a}-${hit.aspect}-${hit.b}-${i}`;
        const isHover = hoveredId === id;
        return (
          <group key={id}>
            <Line
              points={pts}
              color={isHover ? '#fff' : hit.color || '#38bdf8'}
              transparent
              opacity={isHover ? 1 : 0.40}
              lineWidth={isHover ? 3.2 : 1.1}
              // @ts-ignore
              onPointerOver={(e: any) => { e.stopPropagation(); setHoveredId(id); document.body.style.cursor = 'pointer'; }}
              // @ts-ignore
              onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
            />
            {isHover && <Html position={[(a.helio.x + b.helio.x) / 2, (a.helio.y + b.helio.y) / 2 + 0.45, (a.helio.z + b.helio.z) / 2]} style={{ pointerEvents: 'none' }}><div className="obs-tooltip obs-tooltip--aspect"><div className="obs-tooltip-hd" style={{ borderColor: hit.color }}>{hit.label}</div><div>Δ {hit.delta.toFixed(2)}° · Aspects → {hit.aspect}</div></div></Html>}
          </group>
        );
      })}
    </group>
  );
}

function ConstellationLines({ radius = 140 }: { radius?: number }) {
  const { layers } = useObservatory();
  const lines = useMemo(() => {
    const out: { pts: [number, number, number][]; id: string }[] = [];
    for (const cons of CONSTELLATIONS) {
      for (let li = 0; li < cons.lines.length; li++) {
        const [aI, bI] = cons.lines[li]!; const sa = cons.stars[aI]; const sb = cons.stars[bI]; if (!sa || !sb) continue;
        const va = raDecToVector(sa.ra, sa.dec); const vb = raDecToVector(sb.ra, sb.dec);
        out.push({ id: `const-${cons.id}-${li}`, pts: [[va.x * radius, va.y * radius, va.z * radius], [vb.x * radius, vb.y * radius, vb.z * radius]] });
      }
    }
    return out;
  }, [radius]);
  if (!layers.constellations) return null;
  return (<group>{lines.map((l) => <Line key={l.id} points={l.pts} color="#7dd3fc" transparent opacity={0.22} lineWidth={0.9} />)}</group>);
}

function CameraFlyController({
  earthPos,
  chart,
  controlsRef,
  followSatId,
  satPosRef,
}: {
  earthPos: THREE.Vector3;
  chart: any;
  controlsRef: React.MutableRefObject<any>;
  followSatId: string | null;
  satPosRef: React.MutableRefObject<Map<string, THREE.Vector3>>;
}) {
  const { camera } = useThree();
  const flying = useRef<null | { startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; start: number; dur: number }>(null);
  const earthPosRef = useRef(earthPos);
  useEffect(() => { earthPosRef.current = earthPos; }, [earthPos]);

  const chartRef = useRef(chart);
  useEffect(() => { chartRef.current = chart; }, [chart]);

  useEffect(() => {
    const makeFly = (target: THREE.Vector3, offset: THREE.Vector3, dur = 1900) => {
      const curPos = camera.position.clone();
      const curTarget = controlsRef.current?.target?.clone() ?? new THREE.Vector3(0, 0, 0);
      flying.current = { startPos: curPos, endPos: target.clone().add(offset), startTarget: curTarget, endTarget: target.clone(), start: performance.now(), dur };
    };
    const onEarth = () => makeFly(earthPosRef.current, new THREE.Vector3(0, 1.6, 2.8));
    const onSolar = () => makeFly(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 44), 2100);
    const onPlanet = (e: any) => {
      const id = e.detail?.id;
      if (!id) return;
      const c = chartRef.current;
      const p = c?.planets?.find((pl: any) => pl.id === id) as PlanetPosition | undefined;
      let target: THREE.Vector3;
      if (id === 'Sun') target = new THREE.Vector3(0, 0, 0);
      else if (p) target = new THREE.Vector3(p.helio.x, p.helio.y, p.helio.z);
      else if (id === 'Earth') target = earthPosRef.current.clone();
      else return;
      const size = id === 'Jupiter' ? 0.94 : id === 'Saturn' ? 0.86 : id === 'Earth' ? 1.08 : 0.5;
      makeFly(target, new THREE.Vector3(0, size * 0.9, size * 2.2));
    };
    (window as any).__flyEarth = onEarth;
    (window as any).__flySolar = onSolar;
    window.addEventListener('obs-flyto-earth', onEarth as any);
    window.addEventListener('obs-flyto-solar', onSolar as any);
    window.addEventListener('obs-flyto-planet', onPlanet as any);
    return () => {
      window.removeEventListener('obs-flyto-earth', onEarth as any);
      window.removeEventListener('obs-flyto-solar', onSolar as any);
      window.removeEventListener('obs-flyto-planet', onPlanet as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, controlsRef]);

  useFrame(() => {
    // follow satellite functional
    if (followSatId && satPosRef.current.has(followSatId)) {
      const wPos = satPosRef.current.get(followSatId)!;
      if (controlsRef.current) {
        // lerp target to satellite world pos
        const target = controlsRef.current.target as THREE.Vector3;
        target.lerp(wPos, 0.06);
        controlsRef.current.update();
      }
    }
    if (!flying.current) return;
    const f = flying.current;
    const tt = Math.min(1, (performance.now() - f.start) / f.dur);
    const ease = tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2;
    camera.position.lerpVectors(f.startPos, f.endPos, ease);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(f.startTarget, f.endTarget, ease);
      controlsRef.current.update();
    }
    if (tt >= 1) flying.current = null;
  });
  return null;
}

function UnifiedScene({ setFocus }: { setFocus: (f: 'solar' | 'earth' | string) => void }) {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId, enabledBodies, enabledSatGroups, satSearch, selectedSatId, setSelectedSatId, showGroundTrack, showOrbitTrail, followSat } = useObservatory() as any;
  const swissRef = useRef<any>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const satPosRef = useRef<Map<string, THREE.Vector3>>(new Map());

  useEffect(() => { import('../lib/swissEngine').then((m) => m.getSwiss().then((s) => (swissRef.current = s)).catch(() => {})); }, []);

  const earth = chart.planets.find((p: PlanetPosition) => p.id === 'Earth') as PlanetPosition | undefined;
  const earthHelio = earth?.helio ?? { x: 3.1, y: 0, z: 0 };
  const earthPosArr: [number, number, number] = [earthHelio.x, earthHelio.y, earthHelio.z];
  const earthPosVec = useMemo(() => new THREE.Vector3(earthHelio.x, earthHelio.y, earthHelio.z), [earthHelio.x, earthHelio.y, earthHelio.z]);

  // accurate sidereal rotation angle
  const earthRot = useMemo(() => {
    const t = time.getTime();
    return ((t / 86400000) * Math.PI * 2 * 1.0027379) % (Math.PI * 2);
  }, [time]);

  // sun dir in earth local rotating frame: opposite of earth pos, inverse-rotated
  const sunDirLocal = useMemo(() => {
    const toSun = new THREE.Vector3(-earthHelio.x, -earthHelio.y, -earthHelio.z).normalize();
    // inverse rotate by earthRot around Y
    const cos = Math.cos(-earthRot);
    const sin = Math.sin(-earthRot);
    const x = toSun.x * cos - toSun.z * sin;
    const z = toSun.x * sin + toSun.z * cos;
    return new THREE.Vector3(x, toSun.y, z).normalize();
  }, [earthHelio, earthRot]);
  const sunDirRef = useRef(sunDirLocal);
  useEffect(() => { sunDirRef.current.copy(sunDirLocal); }, [sunDirLocal]);

  const bodies = useMemo(() => chart.planets.filter((p: PlanetPosition) => {
    if (p.id === 'Earth' || p.id === 'Sun') return true;
    return (enabledBodies as any)[p.id] !== false;
  }).filter((p: PlanetPosition) => SOLAR_BODIES.includes(p.id as any) || p.id === 'Sun' || ['Moon', 'Chiron', 'Eris', 'Haumea', 'Makemake', 'Sedna', 'Quaoar', 'Orcus', 'Ixion', 'Varuna', 'Ceres', 'Vesta', 'Pallas', 'Juno', 'Pholus'].includes(p.id)), [chart.planets, enabledBodies]);

  const earthSize = 1.08;

  const didInitTarget = useRef(false);
  useEffect(() => {
    if (didInitTarget.current) return;
    if (!controlsRef.current) return;
    // set initial target to Earth once — no forcing afterwards
    controlsRef.current.target.copy(earthPosVec);
    controlsRef.current.update();
    didInitTarget.current = true;
  }, [earthPosVec]);

  return (
    <>
      <color attach="background" args={['#01030a']} />
      <fog attach="fog" args={['#01030a', 80, 320]} />
      <ambientLight intensity={0.62} />
      <pointLight position={[0, 0, 0]} intensity={5.8} distance={300} decay={1.2} color="#fff4d0" />
      <directionalLight position={[16, 24, 16]} intensity={0.52} color="#cfe8ff" />
      <Stars radius={460} depth={180} count={15000} factor={7} saturation={0} fade speed={0.16} />
      <ConstellationLines radius={145} />

      {bodies.filter((p: PlanetPosition) => p.id === 'Sun').map((p: PlanetPosition) => (
        <PlanetBody key="Sun" p={{ ...p, helio: { x: 0, y: 0, z: 0 } } as any} selected={selectedPlanet === p.id} isHovered={hoveredPlanet === p.id} onSelect={() => { setSelectedPlanet(p.id); window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id: 'Sun' } })); }} onHover={(v) => setHoveredPlanet(v ? p.id : null)} showLabel={layers.labels} />
      ))}

      {layers.orbits && SOLAR_BODIES.filter((id) => id !== 'Earth').map((id: any) => (
        <OrbitRing key={`orb-${id}`} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit === id} onHover={(v) => setHoveredOrbit(v ? id : null)} />
      ))}
      {layers.orbits && <OrbitRing planetId={'Earth' as any} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit === 'Earth'} onHover={(v) => setHoveredOrbit(v ? 'Earth' : null)} />}

      {/* Earth with accurate rotation + orbit — rotating frame contains all geo markers */}
      <group position={earthPosArr}>
        <group rotation={[0, earthRot, 0]}>
          {/* Photoreal Earth */}
          <group
            onClick={(e) => { e.stopPropagation(); setSelectedPlanet('Earth' as any); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHoveredPlanet('Earth'); }}
            onPointerOut={() => { document.body.style.cursor = 'default'; setHoveredPlanet((cur) => (cur === 'Earth' ? null : cur)); }}
          >
            <Suspense fallback={<mesh><sphereGeometry args={[earthSize, 64, 64]} /><meshStandardMaterial color="#1d4ed8" /></mesh>}>
              <PhotorealEarthShell size={earthSize} sunDirRef={sunDirRef} />
            </Suspense>
          </group>

          {/* All detail inside rotating frame — satellites, winds, quakes, etc */}
          <EarthDetailContent
            earthRadius={earthSize}
            earthWorldPos={earthPosVec}
            layers={layers}
            chart={chart}
            enabledSatGroups={enabledSatGroups}
            satSearch={satSearch}
            selectedSatId={selectedSatId}
            setSelectedSatId={setSelectedSatId}
            showGroundTrack={showGroundTrack}
            showOrbitTrail={showOrbitTrail}
            satPosRef={satPosRef}
          />

          <GeographyLabels earthRadius={earthSize} earthWorldPos={earthPosVec} layers={layers} />
        </group>

        {/* Atmosphere / glow outside rotation (spherical) */}
        <AtmosphereGlow size={earthSize} color="#38bdf8" strength={hoveredPlanet === 'Earth' ? 1.45 : 0.96} power={2.35} />
        <Aurora size={earthSize} color="#22d3ee" />
        {(selectedPlanet === 'Earth' || hoveredPlanet === 'Earth') && (
          <mesh><sphereGeometry args={[earthSize * 1.2, 32, 32]} /><meshBasicMaterial color="#38bdf8" transparent opacity={hoveredPlanet === 'Earth' ? 0.13 : 0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>
        )}
        {(layers.labels || hoveredPlanet === 'Earth' || selectedPlanet === 'Earth') && (
          <Html distanceFactor={7} style={{ pointerEvents: 'none' }} position={[0, earthSize * 1.25, 0]}><div className={`obs-label obs-label--planet ${hoveredPlanet === 'Earth' ? 'is-hover' : ''} ${selectedPlanet === 'Earth' ? 'is-active' : ''}`}><span className="obs-label-dot" style={{ background: '#38bdf8', boxShadow: '0 0 12px #38bdf8' }} />Earth</div></Html>
        )}
      </group>

      {layers.planets && bodies.filter((p: PlanetPosition) => p.id !== 'Sun' && p.id !== 'Earth').map((p: PlanetPosition) => (
        <PlanetBody key={p.id} p={p} selected={selectedPlanet === p.id} isHovered={hoveredPlanet === p.id} onSelect={() => { setSelectedPlanet(p.id as any); window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id: p.id } })); }} onHover={(v) => setHoveredPlanet(v ? p.id : null)} showLabel={layers.labels} />
      ))}

      <AspectLines hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />

      <mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[80, 64]} /><meshBasicMaterial color="#0a1220" transparent opacity={0.10} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <gridHelper args={[160, 30, 0x1b2e57, 0x0e1b33]} />

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={0.9} maxDistance={240} enableDamping dampingFactor={0.086} rotateSpeed={0.56} zoomSpeed={1.0} panSpeed={0.68} />
      <CameraFlyController earthPos={earthPosVec} chart={chart} controlsRef={controlsRef} followSatId={followSat ? selectedSatId : null} satPosRef={satPosRef} />
    </>
  );
}

export function UnifiedWorld() {
  const { chart, enabledSatGroups, anchorPlanet } = useObservatory() as any;
  const [mode, setMode] = useState<'solar' | 'earth' | string>('earth');

  // sync anchorPlanet from context to local mode for pill highlight
  useEffect(() => {
    if (anchorPlanet) setMode((anchorPlanet as string).toLowerCase());
  }, [anchorPlanet]);

  return (
    <div className="obs-unified-world">
      <Canvas camera={{ position: [4.2, 2.8, 6.5], fov: 44 }} dpr={[1, 1.9]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true }}>
        <Suspense fallback={null}>
          <UnifiedScene setFocus={setMode} />
        </Suspense>
      </Canvas>

      <div className="obs-world-ui">
        <div className="obs-anchor-bar">
          {['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].map((id) => (
            <button key={id} type="button" className={`obs-pill obs-pill--anchor ${mode === id.toLowerCase() ? 'is-active' : ''}`} onClick={() => {
              setMode(id.toLowerCase());
              if (id === 'Sun') window.dispatchEvent(new CustomEvent('obs-flyto-solar'));
              else if (id === 'Earth') window.dispatchEvent(new CustomEvent('obs-flyto-earth'));
              else window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id } }));
            }}>{id}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button type="button" className={`obs-pill obs-pill--action ${mode === 'earth' ? 'is-active' : ''}`} onClick={() => { setMode('earth'); window.dispatchEvent(new CustomEvent('obs-flyto-earth')); }}>🌍 Focus Earth</button>
          <button type="button" className={`obs-pill obs-pill--action ${mode === 'solar' ? 'is-active' : ''}`} onClick={() => { setMode('solar'); window.dispatchEvent(new CustomEvent('obs-flyto-solar')); }}>☀️ Solar overview</button>
          <span className="obs-pill obs-pill--stats">{chart.planets.length} bodies · {chart.aspects.length} aspects</span>
        </div>
      </div>

      <div className="obs-world-hint">
        Drag to orbit · Scroll to zoom · Click to select
      </div>
    </div>
  );
}
