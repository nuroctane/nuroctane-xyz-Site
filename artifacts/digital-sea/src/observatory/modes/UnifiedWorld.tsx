import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { useObservatory } from '../state/ObservatoryContext';
import { MISSIONS } from '../data/missions';
import { CONSTELLATIONS } from '../data/constellations';
import { fetchEarthquakes, fetchEonet, fetchGlobalWindGrid, fetchRealWindGrid, type QuakeFeature, type EonetEvent, type WindSample } from '../lib/meteo';
import { computeACLines, jdFromDate } from '../lib/astroCartography';
import { raDecToVector } from '../lib/math';
import { orbitRingPoints } from '../lib/ephemeris';
import { SOLAR_BODIES, type PlanetPosition } from '../lib/types';
import { SATELLITE_GROUPS, type SatelliteGroupId } from '../lib/types';
import { getPlanetConfig, gasGiantTexture, moonTexture, marsTexture } from '../lib/planetModels';
import { AtmosphereGlow, SunCorona, RingGlow, Aurora, SunDisk } from '../lib/planetShaders';

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

// ---------- Photoreal Earth - Master quality ----------
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
    if (matRef.current) {
      matRef.current.uniforms.sunDir.value.copy(sunDirRef.current);
    }
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

function PhotorealEarth({
  size,
  time,
  isHovered,
  selected,
  onSelect,
  onHover,
  showLabel,
}: {
  size: number;
  time: Date;
  isHovered: boolean;
  selected: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  showLabel: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sunDirRef = useRef(new THREE.Vector3(5, 0.2, 5));

  // Accurate rotation + orbit: rotation based on time (sidereal), sunDir based on earth-sun vector
  useFrame(() => {
    if (!groupRef.current) return;
    // Earth sidereal rotation: 360.9856 deg per 86164 sec => rad per ms ~ 7.29e-8 * 1000
    const t = time.getTime();
    const angle = ((t / 86400000) * Math.PI * 2 * 1.0027379) % (Math.PI * 2);
    groupRef.current.rotation.y = angle;
    // sun direction from earth to sun (sun at origin, earth at its helio) will be set externally via prop for shader, but we can approximate with rotating sunDir for day/night cycle visual
    // For accurate day/night, sunDir should be opposite of earth pos, but we keep rotating slightly for live feel
    sunDirRef.current.set(Math.cos(angle) * 3 + Math.sin(t * 0.00001) * 0.2, Math.sin(t * 0.00003) * 0.2, Math.sin(angle) * 3).normalize();
  });

  return (
    <group>
      <group ref={groupRef}>
        <group
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
        >
          <Suspense fallback={<mesh><sphereGeometry args={[size,64,64]} /><meshStandardMaterial color="#1d4ed8" /></mesh>}>
            <PhotorealEarthShell size={size} sunDirRef={sunDirRef} />
          </Suspense>
        </group>
      </group>
      <AtmosphereGlow size={size} color="#38bdf8" strength={isHovered ? 1.4 : 0.96} power={2.35} />
      <Aurora size={size} color="#22d3ee" />
      {(selected || isHovered) && (
        <mesh><sphereGeometry args={[size*1.2,32,32]} /><meshBasicMaterial color="#38bdf8" transparent opacity={isHovered?0.13:0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>
      )}
      {(showLabel || isHovered || selected) && (
        <Html distanceFactor={7} style={{pointerEvents:'none'}}><div className={`obs-label obs-label--planet ${isHovered?'is-hover':''} ${selected?'is-active':''}`}><span className="obs-label-dot" style={{background:'#38bdf8', boxShadow:'0 0 12px #38bdf8'}}/>Earth{isHovered?' · Bodies → Earth':''}</div></Html>
      )}
    </group>
  );
}

// ---------- Satellite field with color-coded owner groups ----------
type SatRec = { id: string; name: string; group: SatelliteGroupId; color: string; radius: number; inc: number; raan: number; speed: number; angle: number };

function SatelliteField({ earthRadius, enabledGroups, search, selectedId, setSelectedId, showGroundTrack, showOrbitTrail, followEnabled }: {
  earthRadius: number;
  enabledGroups: Record<SatelliteGroupId, boolean>;
  search: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showGroundTrack: boolean;
  showOrbitTrail: boolean;
  followEnabled: boolean;
}) {
  const countPerGroup = useMemo(() => SATELLITE_GROUPS, []);
  const sats = useMemo<SatRec[]>(() => {
    const out: SatRec[] = [];
    let idx=0;
    for(const g of countPerGroup){
      const n = g.count;
      for(let i=0;i<n;i++){
        const altKm = (()=>{ const r=Math.random(); if(r<0.6) return 400+Math.random()*180; if(r<0.8) return 650+Math.random()*180; if(r<0.92) return 1100+Math.random()*700; return 2000+Math.random()*900; })();
        const factor=1+altKm/6371;
        const radius=earthRadius*factor;
        const inc = (g.id==='starlink'? 53+Math.random()*10 : g.id==='oneweb'? 87.9 + (Math.random()-0.5)*2 : g.id==='gps'? 55+Math.random()*2 : g.id==='galileo'?56+Math.random()*2 : g.id==='glonass'?64.8+Math.random()*2 : Math.random()*Math.PI);
        const incRad = typeof inc==='number'? inc*Math.PI/180 : Math.random()*Math.PI;
        const raan = Math.random()*Math.PI*2;
        const angle = Math.random()*Math.PI*2;
        const speed = 0.35 + Math.random()*0.85 + 1/Math.sqrt(radius*1.4);
        out.push({ id:`${g.id}-${i}-${idx++}`, name:`${g.label.toUpperCase()}-${String(i).padStart(4,'0')}`, group:g.id as SatelliteGroupId, color:g.color, radius, inc: g.id==='debris'? Math.random()*Math.PI : incRad, raan, speed, angle });
      }
    }
    return out;
  }, [countPerGroup, earthRadius]);

  const filtered = useMemo(()=>{
    const q=search.toLowerCase().trim();
    return sats.filter(s=>{
      if(!enabledGroups[s.group]) return false;
      if(!q) return true;
      return s.name.toLowerCase().includes(q) || s.group.includes(q);
    });
  }, [sats, enabledGroups, search]);

  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const anglesRef = useRef<Float32Array>(new Float32Array(sats.length));

  // geometry for all sats but we will update visibility via alpha or positions off-screen if filtered out?
  const geometry = useMemo(()=>{
    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(sats.length*3);
    const col=new Float32Array(sats.length*3);
    for(let i=0;i<sats.length;i++){
      const s=sats[i];
      const c=new THREE.Color(s.color);
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
      // initial random spherical shell
      const phi=Math.acos(2*Math.random()-1); const theta=Math.random()*Math.PI*2;
      pos[i*3]=s.radius*Math.sin(phi)*Math.cos(theta);
      pos[i*3+1]=s.radius*Math.cos(phi);
      pos[i*3+2]=s.radius*Math.sin(phi)*Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    return geo;
  }, [sats]);

  useFrame((_, dt)=>{
    if(!geomRef.current) return;
    const attr=geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const arr=attr.array as Float32Array;
    for(let i=0;i<sats.length;i++){
      const s=sats[i];
      if(!enabledGroups[s.group]){ // hide far away if disabled
        arr[i*3]=9999; arr[i*3+1]=9999; arr[i*3+2]=9999;
        continue;
      }
      anglesRef.current[i]+= dt * s.speed * 0.28;
      const ang=anglesRef.current[i]+s.angle;
      const x0=s.radius*Math.cos(ang);
      const z0=s.radius*Math.sin(ang);
      const y1=z0*Math.sin(s.inc);
      const z1=z0*Math.cos(s.inc);
      const x2=x0*Math.cos(s.raan)-z1*Math.sin(s.raan);
      const z2=x0*Math.sin(s.raan)+z1*Math.cos(s.raan);
      arr[i*3]=x2; arr[i*3+1]=y1; arr[i*3+2]=z2;
    }
    // if filtered by search, hide non-matching as far
    if(search.trim()){
      const q=search.toLowerCase();
      for(let i=0;i<sats.length;i++){
        const s=sats[i];
        if(!s.name.toLowerCase().includes(q) && !s.group.includes(q)){
          arr[i*3]=9999; arr[i*3+1]=9999; arr[i*3+2]=9999;
        }
      }
    }
    attr.needsUpdate=true;
  });

  const selectedSat = useMemo(()=> filtered.find(s=>s.id===selectedId) || sats.find(s=>s.id===selectedId) || null, [filtered, sats, selectedId]);

  // Ground track for selected sat
  const groundTrack = useMemo(()=>{
    if(!selectedSat || !showGroundTrack) return null;
    const pts: [number, number, number][]=[];
    for(let a=0;a<Math.PI*2;a+=0.08){
      const ang=a;
      const x0=selectedSat.radius*Math.cos(ang);
      const z0=selectedSat.radius*Math.sin(ang);
      const y1=z0*Math.sin(selectedSat.inc);
      const z1=z0*Math.cos(selectedSat.inc);
      const x2=x0*Math.cos(selectedSat.raan)-z1*Math.sin(selectedSat.raan);
      const z2=x0*Math.sin(selectedSat.raan)+z1*Math.cos(selectedSat.raan);
      // project to earth surface for ground track
      const norm = Math.sqrt(x2*x2 + y1*y1 + z2*z2);
      const scale = earthRadius*1.008 / norm;
      pts.push([x2*scale, y1*scale, z2*scale]);
    }
    return pts;
  }, [selectedSat, showGroundTrack, earthRadius]);

  const orbitTrail = useMemo(()=>{
    if(!selectedSat || !showOrbitTrail) return null;
    const pts: [number, number, number][]=[];
    for(let a=0;a<Math.PI*2;a+=0.06){
      const x0=selectedSat.radius*Math.cos(a);
      const z0=selectedSat.radius*Math.sin(a);
      const y1=z0*Math.sin(selectedSat.inc);
      const z1=z0*Math.cos(selectedSat.inc);
      const x2=x0*Math.cos(selectedSat.raan)-z1*Math.sin(selectedSat.raan);
      const z2=x0*Math.sin(selectedSat.raan)+z1*Math.cos(selectedSat.raan);
      pts.push([x2,y1,z2]);
    }
    return pts;
  }, [selectedSat, showOrbitTrail]);

  return (
    <>
      <points ref={pointsRef as any} onClick={(e:any)=>{ e.stopPropagation(); /* raycast would need more logic */ }}>
        <primitive object={geometry} ref={geomRef as any} attach="geometry" />
        <pointsMaterial vertexColors size={0.026} sizeAttenuation transparent opacity={0.94} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      {groundTrack && <Line points={groundTrack} color={selectedSat?.color || '#38bdf8'} transparent opacity={0.85} lineWidth={1.4} />}
      {orbitTrail && <Line points={orbitTrail} color={selectedSat?.color || '#e2e8f0'} transparent opacity={0.55} lineWidth={1} />}
      {selectedSat && (
        <Html position={[0,0,0]} style={{pointerEvents:'none'}}><div style={{display:'none'}}>{selectedSat.name}</div></Html>
      )}
    </>
  );
}

// ---------- Distinct layer designs ----------
// Quakes distinct: octahedron with glow + magnitude
function QuakeMarkers({ quakes, earthRadius }: { quakes: QuakeFeature[]; earthRadius: number }) {
  return (
    <>
      {quakes.slice(0,240).map(q=>{
        const pos=latLonToVector3(q.lat, q.lon, earthRadius*1.03);
        const mag=q.mag??0;
        const col=mag>5.5?'#ef4444':mag>4.4?'#f97316':'#eab308';
        return (
          <group key={`q-${q.id}`} position={[pos.x,pos.y,pos.z]}>
            <mesh><octahedronGeometry args={[0.022 + mag*0.007,0]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.0} /></mesh>
            <mesh scale={[1.9,1.9,1.9]}><octahedronGeometry args={[0.022 + mag*0.007,0]} /><meshBasicMaterial color={col} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            {mag>5 && <Html distanceFactor={5} style={{pointerEvents:'none'}}><div className="obs-earth-pin" style={{background:col, boxShadow:`0 0 14px ${col}`}}>M{mag.toFixed(1)}</div></Html>}
          </group>
        );
      })}
    </>
  );
}

// EONET distinct per category
function EonetMarkers({ events, earthRadius, layers }: { events: EonetEvent[]; earthRadius: number; layers: any }) {
  return (
    <>
      {events.slice(0,200).map(ev=>{
        const pos=latLonToVector3(ev.lat, ev.lon, earthRadius*1.036);
        const cat=ev.category.toLowerCase();
        let visible=true;
        if(cat.includes('storm') && !layers.storms && !layers.eonet) visible=false;
        if(cat.includes('fire') && !layers.wildfires && !layers.eonet) visible=false;
        if(cat.includes('volcano') && !layers.volcanoes && !layers.eonet) visible=false;
        if(!visible) return null;

        if(cat.includes('storm')){
          return (
            <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
              <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.020,0.006,8,20]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} /></mesh>
              <mesh><sphereGeometry args={[0.008,8,8]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.8} /></mesh>
              <mesh scale={[1.8,1.8,1.8]}><sphereGeometry args={[0.008,8,8]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            </group>
          );
        }
        if(cat.includes('fire')){
          return (
            <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
              <mesh><tetrahedronGeometry args={[0.020,0]} /><meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={1.1} /></mesh>
              <mesh scale={[1.6,1.6,1.6]}><tetrahedronGeometry args={[0.020,0]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            </group>
          );
        }
        if(cat.includes('volcano')){
          return (
            <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
              <mesh><coneGeometry args={[0.018,0.040,10]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} /></mesh>
              <mesh position={[0,0.028,0]}><sphereGeometry args={[0.006,6,6]} /><meshBasicMaterial color="#fda4af" transparent opacity={0.7} /></mesh>
            </group>
          );
        }
        if(cat.includes('ice')||cat.includes('snow')){
          return (
            <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
              <mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[0.020,12]} /><meshStandardMaterial color="#7dd3fc" transparent opacity={0.85} /></mesh>
            </group>
          );
        }
        if(cat.includes('flood')||cat.includes('sea')){
          return (
            <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
              <mesh><boxGeometry args={[0.028,0.010,0.028]} /><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} /></mesh>
            </group>
          );
        }
        // generic
        const col=cat.includes('drought')?'#fde68a':cat.includes('dust')?'#a3a3a3':cat.includes('temp')?'#f97316':'#a3e635';
        return (
          <group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}>
            <mesh><dodecahedronGeometry args={[0.016,0]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.85} /></mesh>
          </group>
        );
      })}
    </>
  );
}

// Winds highly visible
function WindField({ winds, earthRadius }: { winds: WindSample[]; earthRadius: number }) {
  return (
    <>
      {winds.slice(0,180).map((w,i)=>{
        const p1=latLonToVector3(w.lat, w.lon, earthRadius*1.045);
        const sp=Math.sqrt(w.u*w.u+w.v*w.v);
        const br=Math.atan2(w.u,w.v);
        const len=Math.min(3.2, sp*0.11+0.28);
        const p2=latLonToVector3(w.lat+Math.cos(br)*len, w.lon+Math.sin(br)*len, earthRadius*1.045);
        const mid=new THREE.Vector3((p1.x+p2.x)/2,(p1.y+p2.y)/2,(p1.z+p2.z)/2);
        const dir=new THREE.Vector3().subVectors(p2,p1).normalize();
        const col=sp>14?'#22d3ee':sp>8?'#7dd3fc':'#e0f2fe';
        return (
          <group key={`wind-${i}`}>
            <Line points={[[p1.x,p1.y,p1.z] as any,[p2.x,p2.y,p2.z] as any]} color={col} transparent opacity={0.88} lineWidth={sp>12?3:2} />
            <group position={[p2.x,p2.y,p2.z]}>
              {/* arrow head */}
              <mesh scale={[0.006,0.012,0.006]}><coneGeometry args={[0.5,1.2,6]} /><meshBasicMaterial color={col} /></mesh>
            </group>
            {/* glowing origin dot */}
            <mesh position={[p1.x,p1.y,p1.z]}><sphereGeometry args={[0.005,6,6]} /><meshBasicMaterial color={col} transparent opacity={0.9} /></mesh>
          </group>
        );
      })}
    </>
  );
}

function PlanetBody({ p, selected, isHovered, onSelect, onHover, showLabel }: {
  p: PlanetPosition; selected: boolean; isHovered: boolean; onSelect: () => void; onHover: (v: boolean) => void; showLabel: boolean;
}) {
  const cfg=getPlanetConfig(p.id);
  const size = p.id==='Sun'?1.28 : p.id==='Jupiter'?0.94 : p.id==='Saturn'?0.86 : p.id==='Neptune'||p.id==='Uranus'?0.62 : p.id==='Venus'?0.54 : p.id==='Mars'?0.42 : p.id==='Moon'?0.20 : ['Eris','Haumea'].includes(p.id)?0.24 : 0.30;
  const textures = useMemo(()=>{ if(typeof document==='undefined') return null as any; try{ if(p.id==='Moon') return {base:moonTexture()}; if(p.id==='Mars') return {base:marsTexture()}; if(['Jupiter','Saturn','Uranus','Neptune','Venus'].includes(p.id)) return {base:gasGiantTexture(cfg.baseColor, p.id==='Jupiter'?9:7)}; return null; }catch{return null;} },[p.id,cfg.baseColor]);
  const ref=useRef<THREE.Group>(null);
  useFrame((_,dt)=>{ if(ref.current) ref.current.rotation.y+=dt*(cfg.rotationSpeed??0.14); });
  return (
    <group position={[p.helio.x,p.helio.y,p.helio.z]}>
      <group ref={ref} scale={p.id==='Haumea'?[1.7,0.82,0.92]:[1,1,1]}>
        <mesh onClick={(e)=>{e.stopPropagation(); onSelect();}} onPointerOver={(e)=>{e.stopPropagation(); document.body.style.cursor='pointer'; onHover(true);}} onPointerOut={()=>{document.body.style.cursor='default'; onHover(false);}}>
          <sphereGeometry args={[size,48,48]} />
          <meshStandardMaterial color={cfg.baseColor} map={textures?.base??undefined} emissive={p.id==='Sun'?cfg.emissive:selected||isHovered?cfg.baseColor:'#000'} emissiveIntensity={p.id==='Sun'?1.24:selected||isHovered?0.52:0} roughness={cfg.roughness??0.72} metalness={cfg.metalness??0.08} />
        </mesh>
      </group>
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered?(cfg.atmosphereStrength??0.6)*1.6:(cfg.atmosphereStrength??0.6)} power={2.5} />}
      {p.id==='Sun' && <><SunCorona size={size} /><SunDisk size={size} /></>}
      {cfg.hasRings && <><mesh rotation={[Math.PI/2.62,0,0.18]}><ringGeometry args={[size*1.38,size*2.42,96]} /><meshBasicMaterial color={cfg.ringColor??'#fde68a'} transparent opacity={0.56} side={THREE.DoubleSide} /></mesh><RingGlow inner={size*1.38} outer={size*2.42} color={cfg.ringColor??'#fde68a'} /></>}
      {(selected||isHovered)&&<mesh><sphereGeometry args={[size*1.28,28,28]} /><meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered?0.20:0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>}
      {(showLabel||isHovered||selected)&&<Html distanceFactor={9} style={{pointerEvents:'none'}}><div className={`obs-label obs-label--planet ${isHovered?'is-hover':''} ${selected?'is-active':''}`}><span className="obs-label-dot" style={{background:cfg.baseColor, boxShadow:`0 0 10px ${cfg.baseColor}`}} />{p.name}{p.retro?' ℞':''}{isHovered?` · Bodies → ${p.id}`:''}</div></Html>}
    </group>
  );
}

function EarthDetail({ earthPos, earthSize, layers, chart, enabledSatGroups, satSearch, selectedSatId, setSelectedSatId, showGroundTrack, showOrbitTrail, followEnabled }: any) {
  const [quakes, setQuakes]=useState<QuakeFeature[]>([]);
  const [eonet, setEonet]=useState<EonetEvent[]>([]);
  const [winds, setWinds]=useState<WindSample[]>([]);
  const [iss, setIss]=useState<{lat:number;lon:number}|null>(null);

  useEffect(()=>{ if(layers.earthquakes) fetchEarthquakes().then(setQuakes).catch(()=>{}); else setQuakes([]); },[layers.earthquakes]);
  useEffect(()=>{ if(layers.eonet||layers.storms||layers.wildfires||layers.volcanoes) fetchEonet().then(setEonet).catch(()=>{}); else setEonet([]); },[layers.eonet,layers.storms,layers.wildfires,layers.volcanoes]);
  useEffect(()=>{
    if(!layers.winds){ setWinds([]); return; }
    let cancelled=false;
    fetchRealWindGrid().then(r=>{ if(!cancelled) setWinds(r.length>4?r:[]); }).catch(async()=>{ const g=await fetchGlobalWindGrid(); if(!cancelled) setWinds(g); });
    return ()=>{ cancelled=true; };
  },[layers.winds]);
  useEffect(()=>{
    if(!layers.satellites) return;
    let id:any=null;
    const tick=async()=>{
      try{
        const r=await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if(!r.ok) throw new Error();
        const j=await r.json() as any;
        setIss({ lat:Number(j.latitude), lon:Number(j.longitude) });
      }catch{ const t=Date.now()/1000; setIss({ lat:51.6*Math.sin(t*0.001), lon:((t*0.06)%360)-180 }); }
    };
    tick(); id=setInterval(tick,5000);
    return ()=>{ if(id) clearInterval(id); };
  },[layers.satellites]);

  const acLines = useMemo(()=>{
    if(!layers.astroCartography) return [];
    try{
      const planets=chart.planets.filter((p:any)=>p.id!=='Earth'&&p.id!=='Sun');
      const jd=jdFromDate(chart.time);
      return computeACLines(jd, planets).slice(0,80);
    }catch{ return []; }
  },[chart, layers.astroCartography]);

  const R=earthSize;

  return (
    <group position={earthPos}>
      {layers.satellites && <SatelliteField earthRadius={R} enabledGroups={enabledSatGroups} search={satSearch} selectedId={selectedSatId} setSelectedId={setSelectedSatId} showGroundTrack={showGroundTrack} showOrbitTrail={showOrbitTrail} followEnabled={followEnabled} />}
      {layers.earthquakes && <QuakeMarkers quakes={quakes} earthRadius={R} />}
      {(layers.eonet||layers.storms||layers.wildfires||layers.volcanoes) && <EonetMarkers events={eonet} earthRadius={R} layers={layers} />}
      {layers.winds && <WindField winds={winds} earthRadius={R} />}

      {layers.astroCartography && acLines.map((line:any,idx:number)=>{
        const pts=line.points.map((p:any)=>{ const v=latLonToVector3(p.lat,p.lon,R*1.028); return [v.x,v.y,v.z] as [number,number,number]; }).filter(Boolean);
        if(pts.length<2) return null;
        return <Line key={`ac-${line.id}-${idx}`} points={pts} color={line.bodyColor||'#38bdf8'} transparent opacity={line.type==='MC'||line.type==='IC'?0.92:0.66} lineWidth={line.type==='MC'?2.2:1.3} />;
      })}

      {layers.satellites&&iss&&(()=>{
        const pos=latLonToVector3(iss.lat, iss.lon, R*1.20);
        return (<group position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.032,16,16]}/><meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={1.2}/></mesh><mesh scale={[1.9,1.9,1.9]}><sphereGeometry args={[0.032,12,12]}/><meshBasicMaterial color="#a3e635" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh><Html distanceFactor={4} style={{pointerEvents:'none'}}><div className="obs-label obs-label--planet"><span className="obs-label-dot" style={{background:'#a3e635', boxShadow:'0 0 12px #a3e635'}}/>ISS</div></Html></group>);
      })()}

      {layers.missions&&MISSIONS.filter((m:any)=>m.domain==='earth').slice(0,24).map((m:any,i:number)=>{
        const ang=(i/24)*Math.PI*2 + Date.now()*0.00016*(1+i*0.05);
        const r=R*(1.32+(i%6)*0.18);
        const incl=(m as any).inclination?(m as any).inclination*Math.PI/180:0.35;
        const pos=new THREE.Vector3(Math.cos(ang)*r, Math.sin(ang)*Math.sin(incl)*r + Math.cos(incl)*r*0.20*Math.sin(ang*1.5), Math.sin(ang)*r);
        return (<group key={`m-${m.id}`} position={[pos.x,pos.y,pos.z]}><mesh><octahedronGeometry args={[0.024,0]}/><meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.9}/></mesh><mesh scale={[1.7,1.7,1.7]}><octahedronGeometry args={[0.024,0]}/><meshBasicMaterial color={m.color} transparent opacity={0.20} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>);
      })}

      {layers.traffic&&[...Array(32)].map((_,i)=>{
        const lat=(Math.random()-0.5)*130;
        const lon=(Math.random()-0.5)*360;
        const pos=latLonToVector3(lat,lon,R*1.02);
        return (<group key={`traffic-${i}`} position={[pos.x,pos.y,pos.z]}><mesh><ringGeometry args={[0.022,0.036,16]}/><meshBasicMaterial color="#f472b6" transparent opacity={0.42} side={THREE.DoubleSide}/><mesh scale={[1.3,1.3,1]}><ringGeometry args={[0.022,0.036,16]}/><meshBasicMaterial color="#f472b6" transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}/></mesh></mesh></group>);
      })}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, isHovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; isHovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(()=>{ try{ return orbitRingPoints(planetId, date, 220, swiss, zodiac, ayanamsaId).map((p:any)=>[p.x,p.y,p.z] as [number,number,number]); }catch{ return []; } }, [planetId, date, zodiac, ayanamsaId, swiss]);
  if(pts.length<2) return null;
  const isEarth=planetId==='Earth';
  return (<group onPointerOver={()=>onHover(true)} onPointerOut={()=>onHover(false)}><Line points={pts} color={isHovered?'#e2e8f0':isEarth?'#38bdf8':'#1e335f'} transparent opacity={isHovered?1:isEarth?0.9:0.28} lineWidth={isHovered?2.8:isEarth?1.8:0.9} /></group>);
}

function AspectLines({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers } = useObservatory();
  const map = useMemo(()=>new Map(chart.planets.map((p:any)=>[p.id,p])), [chart.planets]);
  if(!layers.aspects) return null;
  const aspects=chart.aspects.slice(0,130);
  return (
    <group>
      {aspects.map((hit:any,i:number)=>{
        const a=map.get(hit.a as any) as any; const b=map.get(hit.b as any) as any; if(!a||!b) return null;
        const pts:[number,number,number][]=[[a.helio.x,a.helio.y,a.helio.z],[b.helio.x,b.helio.y,b.helio.z]];
        const id=`${hit.a}-${hit.aspect}-${hit.b}-${i}`;
        const isHover=hoveredId===id;
        return (
          <group key={id}>
            <Line points={pts} color={isHover?'#fff':hit.color||'#38bdf8'} transparent opacity={isHover?1:0.40} lineWidth={isHover?3.2:1.1}
              // @ts-ignore
              onPointerOver={(e:any)=>{ e.stopPropagation(); setHoveredId(id); document.body.style.cursor='pointer'; }}
              // @ts-ignore
              onPointerOut={()=>{ setHoveredId(null); document.body.style.cursor='default'; }}
            />
            {isHover && <Html position={[(a.helio.x+b.helio.x)/2,(a.helio.y+b.helio.y)/2+0.45,(a.helio.z+b.helio.z)/2]} style={{pointerEvents:'none'}}><div className="obs-tooltip obs-tooltip--aspect"><div className="obs-tooltip-hd" style={{borderColor:hit.color}}>{hit.label}</div><div>Δ {hit.delta.toFixed(2)}° · Aspects → {hit.aspect}</div></div></Html>}
          </group>
        );
      })}
    </group>
  );
}

function ConstellationLines({ radius=140 }: { radius?: number }) {
  const { layers } = useObservatory();
  const lines = useMemo(()=>{
    const out:{pts:[number,number,number][];id:string}[]=[];
    for(const cons of CONSTELLATIONS){
      for(let li=0; li<cons.lines.length; li++){
        const [aI,bI]=cons.lines[li]!; const sa=cons.stars[aI]; const sb=cons.stars[bI]; if(!sa||!sb) continue;
        const va=raDecToVector(sa.ra, sa.dec); const vb=raDecToVector(sb.ra, sb.dec);
        out.push({ id:`const-${cons.id}-${li}`, pts:[[va.x*radius,va.y*radius,va.z*radius],[vb.x*radius,vb.y*radius,vb.z*radius]] });
      }
    }
    return out;
  }, [radius]);
  if(!layers.constellations) return null;
  return (<group>{lines.map(l=><Line key={l.id} points={l.pts} color="#7dd3fc" transparent opacity={0.22} lineWidth={0.9} />)}</group>);
}

function CameraFlyController({ earthPos, chart, controlsRef, followSatId, satPositionsRef }: { earthPos: THREE.Vector3; chart: any; controlsRef: React.MutableRefObject<any>; followSatId: string | null; satPositionsRef?: React.MutableRefObject<Map<string, THREE.Vector3>> }) {
  const { camera } = useThree();
  const flying = useRef<null | { startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; start: number; dur: number }>(null);

  useEffect(()=>{
    const makeFly=(target:THREE.Vector3, offset:THREE.Vector3, dur=1900)=>{
      const curPos=camera.position.clone();
      const curTarget=controlsRef.current?.target?.clone() ?? new THREE.Vector3(0,0,0);
      flying.current={ startPos:curPos, endPos:target.clone().add(offset), startTarget:curTarget, endTarget:target.clone(), start:performance.now(), dur };
    };
    const onEarth=()=>makeFly(earthPos, new THREE.Vector3(0,1.6,2.8));
    const onSolar=()=>makeFly(new THREE.Vector3(0,0,0), new THREE.Vector3(0,20,44), 2100);
    const onPlanet=(e:any)=>{
      const id=e.detail?.id;
      if(!id) return;
      const p=chart.planets.find((pl:any)=>pl.id===id) as PlanetPosition | undefined;
      let target: THREE.Vector3;
      if(id==='Sun') target=new THREE.Vector3(0,0,0);
      else if(p) target=new THREE.Vector3(p.helio.x,p.helio.y,p.helio.z);
      else if(id==='Earth') target=earthPos.clone();
      else return;
      const size = id==='Jupiter'?0.94:id==='Saturn'?0.86:id==='Earth'?1.02:0.5;
      makeFly(target, new THREE.Vector3(0,size*0.9,size*2.2));
    };
    (window as any).__flyEarth=onEarth; (window as any).__flySolar=onSolar;
    window.addEventListener('obs-flyto-earth', onEarth as any);
    window.addEventListener('obs-flyto-solar', onSolar as any);
    window.addEventListener('obs-flyto-planet', onPlanet as any);
    const t=setTimeout(()=>{ if(earthPos.length()>0.1) onEarth(); }, 750);
    return ()=>{ window.removeEventListener('obs-flyto-earth', onEarth as any); window.removeEventListener('obs-flyto-solar', onSolar as any); window.removeEventListener('obs-flyto-planet', onPlanet as any); clearTimeout(t); };
  }, [camera, controlsRef, earthPos, chart]);

  useFrame(()=>{
    // follow satellite
    if(followSatId){
      // if follow enabled, we could lerp camera target to satellite pos – simplified: do not auto-move to avoid nausea, but keep target near sat
    }
    if(!flying.current) return;
    const f=flying.current;
    const tt=Math.min(1,(performance.now()-f.start)/f.dur);
    const ease=tt<0.5?4*tt*tt*tt:1-Math.pow(-2*tt+2,3)/2;
    camera.position.lerpVectors(f.startPos,f.endPos,ease);
    if(controlsRef.current){ controlsRef.current.target.lerpVectors(f.startTarget,f.endTarget,ease); controlsRef.current.update(); }
    if(tt>=1) flying.current=null;
  });
  return null;
}

function UnifiedScene({ setFocus }: { setFocus: (f:'solar'|'earth'|string)=>void }) {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId, enabledBodies, enabledSatGroups, satSearch, selectedSatId, setSelectedSatId, showGroundTrack, showOrbitTrail, followSat } = useObservatory() as any;
  const swissRef=useRef<any>(null);
  const [hoveredPlanet, setHoveredPlanet]=useState<string|null>(null);
  const [hoveredOrbit, setHoveredOrbit]=useState<string|null>(null);
  const [hoveredAspect, setHoveredAspect]=useState<string|null>(null);
  const controlsRef=useRef<any>(null);

  useEffect(()=>{ import('../lib/swissEngine').then(m=>m.getSwiss().then(s=>swissRef.current=s).catch(()=>{})); }, []);

  const earth = chart.planets.find((p:PlanetPosition)=>p.id==='Earth') as PlanetPosition | undefined;
  const earthHelio = earth?.helio ?? { x:3.1, y:0, z:0 };
  const earthPosArr:[number,number,number]=[earthHelio.x,earthHelio.y,earthHelio.z];
  const earthPosVec = useMemo(()=>new THREE.Vector3(earthHelio.x,earthHelio.y,earthHelio.z), [earthHelio.x,earthHelio.y,earthHelio.z]);
  const earthSize=1.08;

  const bodies = useMemo(()=>chart.planets.filter((p:PlanetPosition)=>{
    if(p.id==='Earth' || p.id==='Sun') return true;
    return (enabledBodies as any)[p.id]!==false;
  }).filter((p:PlanetPosition)=> (SOLAR_BODIES.includes(p.id as any) || p.id==='Sun' || ['Moon','Chiron','Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna','Ceres','Vesta','Pallas','Juno','Pholus'].includes(p.id))), [chart.planets, enabledBodies]);

  return (
    <>
      <color attach="background" args={['#01030a']} />
      <fog attach="fog" args={['#01030a', 80, 300]} />
      <ambientLight intensity={0.58} />
      <pointLight position={[0,0,0]} intensity={5.6} distance={260} decay={1.2} color="#fff4d0" />
      <directionalLight position={[16,24,16]} intensity={0.52} color="#cfe8ff" />
      <Stars radius={460} depth={180} count={15000} factor={7} saturation={0} fade speed={0.16} />
      <ConstellationLines radius={145} />

      {bodies.filter((p:PlanetPosition)=>p.id==='Sun').map((p:PlanetPosition)=>(
        <PlanetBody key="Sun" p={{...p, helio:{x:0,y:0,z:0}} as any} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>{ setSelectedPlanet(p.id); window.dispatchEvent(new CustomEvent('obs-flyto-planet',{detail:{id:'Sun'}})); }} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} />
      ))}

      {layers.orbits && SOLAR_BODIES.filter(id=>id!=='Earth').map((id:any)=>(
        <OrbitRing key={`orb-${id}`} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit===id} onHover={v=>setHoveredOrbit(v?id:null)} />
      ))}
      {layers.orbits && <OrbitRing planetId={'Earth' as any} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit==='Earth'} onHover={v=>setHoveredOrbit(v?'Earth':null)} />}

      <group position={earthPosArr}>
        <PhotorealEarth size={earthSize} time={time} selected={selectedPlanet==='Earth'} isHovered={hoveredPlanet==='Earth'} onSelect={()=>{ setSelectedPlanet('Earth' as any); window.dispatchEvent(new CustomEvent('obs-flyto-earth')); }} onHover={v=>setHoveredPlanet(v?'Earth':null)} showLabel={layers.labels} />
      </group>

      {layers.planets && bodies.filter((p:PlanetPosition)=>p.id!=='Sun' && p.id!=='Earth').map((p:PlanetPosition)=>(
        <PlanetBody key={p.id} p={p} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>{ setSelectedPlanet(p.id as any); window.dispatchEvent(new CustomEvent('obs-flyto-planet',{detail:{id:p.id}})); }} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} />
      ))}

      <EarthDetail earthPos={earthPosArr} earthSize={earthSize} layers={layers} chart={chart} enabledSatGroups={enabledSatGroups} satSearch={satSearch} selectedSatId={selectedSatId} setSelectedSatId={setSelectedSatId} showGroundTrack={showGroundTrack} showOrbitTrail={showOrbitTrail} followEnabled={followSat} />

      <AspectLines hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />

      <mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[80,64]} /><meshBasicMaterial color="#0a1220" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false}/></mesh>
      <gridHelper args={[160,30,0x1b2e57,0x0e1b33]} />

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={1.15} maxDistance={220} enableDamping dampingFactor={0.086} rotateSpeed={0.56} zoomSpeed={1.0} panSpeed={0.68} />
      <CameraFlyController earthPos={earthPosVec} chart={chart} controlsRef={controlsRef} followSatId={followSat?selectedSatId:null} />
    </>
  );
}

export function UnifiedWorld() {
  const { chart, enabledSatGroups } = useObservatory() as any;
  const [mode, setMode]=useState<'solar'|'earth'|string>('earth');

  return (
    <div className="obs-unified-world">
      <Canvas camera={{ position: [4.8,3.0,8.2], fov: 44 }} dpr={[1,1.9]} gl={{ antialias:true, alpha:false, powerPreference:'high-performance', stencil:false, depth:true }}>
        <Suspense fallback={null}>
          <UnifiedScene setFocus={setMode} />
        </Suspense>
      </Canvas>

      <div className="obs-world-ui">
        <div className="obs-anchor-bar">
          {['Sun','Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].map(id=>(
            <button key={id} type="button" className={`obs-pill obs-pill--anchor ${mode===id.toLowerCase()?'is-active':''}`} onClick={()=>{
              setMode(id.toLowerCase());
              if(id==='Sun') window.dispatchEvent(new CustomEvent('obs-flyto-solar'));
              else if(id==='Earth') window.dispatchEvent(new CustomEvent('obs-flyto-earth'));
              else window.dispatchEvent(new CustomEvent('obs-flyto-planet',{detail:{id}}));
            }}>{id}</button>
          ))}
        </div>
        <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
          <button type="button" className={`obs-pill obs-pill--action ${mode==='earth'?'is-active':''}`} onClick={()=>{ setMode('earth'); window.dispatchEvent(new CustomEvent('obs-flyto-earth')); }}>🌍 Focus Earth</button>
          <button type="button" className={`obs-pill obs-pill--action ${mode==='solar'?'is-active':''}`} onClick={()=>{ setMode('solar'); window.dispatchEvent(new CustomEvent('obs-flyto-solar')); }}>☀️ Solar overview</button>
          <span className="obs-pill obs-pill--stats">{chart.planets.length} bodies · {Object.values(enabledSatGroups).filter(Boolean).length}/{SATELLITE_GROUPS.length} sat groups · {chart.aspects.length} aspects — unified</span>
        </div>
      </div>

      <div className="obs-world-hint">
        Drag to orbit · Scroll to zoom · Click planet to anchor · Sats tab for owner filters · Hover for details
      </div>
    </div>
  );
}
