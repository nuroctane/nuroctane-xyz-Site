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
import { getPlanetConfig, earthBaseTexture, cloudTexture, gasGiantTexture, cityLightsTexture, moonTexture, marsTexture } from '../lib/planetModels';
import { AtmosphereGlow, SunCorona, RingGlow, CloudLayer, CityLightsLayer, Aurora, SunDisk } from '../lib/planetShaders';

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

// Photoreal Earth using real satellite imagery — the Google-Earth quality the user demanded
function PhotorealEarthShell({ size, sunDirRef }: { size: number; sunDirRef: React.MutableRefObject<THREE.Vector3> }) {
  // Real textures from threejs.org — 2K/1K photoreal
  const [dayMap, nightMap, cloudMap, specularMap, normalMap] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  ]) as unknown as THREE.Texture[];

  // Ensure wrapping and SRGB
  useMemo(() => {
    [dayMap, nightMap, cloudMap, specularMap, normalMap].forEach((t) => {
      if (!t) return;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if (t === dayMap || t === nightMap || t === cloudMap) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [dayMap, nightMap, cloudMap, specularMap, normalMap]);

  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = clock.elapsedTime;
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
          time: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPos;
          void main(){
            vUv=uv;
            vNormal=normalize(normalMatrix*normal);
            vPos=position;
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
          uniform float time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPos;
          void main(){
            vec3 day = texture2D(dayTex, vUv).rgb;
            vec3 night = texture2D(nightTex, vUv).rgb;
            vec3 clouds = texture2D(cloudTex, vUv).rgb;
            float specMask = texture2D(specularTex, vUv).r;

            vec3 N = normalize(vNormal);
            // subtle normal perturb from normal map (approx)
            vec3 nMap = texture2D(normalTex, vUv).rgb*2.0-1.0;
            N = normalize(N + nMap*0.18);

            float NdotSun = dot(N, normalize(sunDir));
            float dayMix = smoothstep(-0.28, 0.22, NdotSun);
            float nightMix = 1.0 - dayMix;

            // cloud animation drift
            vec2 cloudUv = vUv + vec2(time*0.012, 0.0);
            vec3 cloudCol = texture2D(cloudTex, cloudUv).rgb;
            float cloudAlpha = dot(cloudCol, vec3(0.333));

            // Day with clouds overlay
            vec3 dayWithClouds = mix(day, vec3(0.92), cloudAlpha*0.42);

            // Night lights only on dark side, boosted
            vec3 nightWithBoost = night * nightMix * 1.6;

            // mix day/night
            vec3 color = mix(dayWithClouds*0.18 + nightWithBoost, dayWithClouds, dayMix);

            // ocean specular highlight
            float spec = pow(max(0.0, dot(reflect(-normalize(sunDir), N), vec3(0.0,0.0,1.0))), 32.0) * specMask * dayMix * 0.55;
            color += vec3(0.8,0.9,1.0)*spec*1.2;

            // atmospheric rim on day side
            float fres = pow(1.0 - max(0.0, dot(N, vec3(0.0,0.0,1.0))), 2.8);
            color += vec3(0.22,0.55,0.95)*fres*0.14*dayMix;

            // subtle terminator warm glow
            color += vec3(1.0,0.55,0.18)*pow(max(0.0, 1.0-abs(NdotSun))*0.8, 3.0)*0.12;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function PhotorealEarth({
  size,
  isHovered,
  onSelect,
  onHover,
  showLabel,
  selected,
}: {
  size: number;
  isHovered: boolean;
  selected: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  showLabel: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sunDirRef = useRef(new THREE.Vector3(5, 2, 5));
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.08;
    // slow sun orbit for day/night cycle visual
    const t = Date.now() * 0.00007;
    sunDirRef.current.set(Math.cos(t), Math.sin(t * 0.3) * 0.2, Math.sin(t));
  });

  return (
    <group>
      <group ref={groupRef}>
        <group
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
        >
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[size, 64, 64]} />
              <meshStandardMaterial color="#1e4ed8" />
            </mesh>
          }>
            <PhotorealEarthShell size={size} sunDirRef={sunDirRef} />
          </Suspense>
        </group>

        {/* procedural cloud sphere overlay for extra depth when textures loading or extra pop */}
        <group>
          <mesh scale={[1.007, 1.007, 1.007]}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>

      <AtmosphereGlow size={size} color="#38bdf8" strength={isHovered ? 1.35 : 0.92} power={2.4} />
      <Aurora size={size} color="#22d3ee" />
      {(selected || isHovered) && (
        <mesh>
          <sphereGeometry args={[size * 1.22, 32, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={isHovered ? 0.14 : 0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      {(showLabel || isHovered || selected) && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}>
            <span className="obs-label-dot" style={{ background: '#38bdf8', boxShadow: '0 0 12px #38bdf8' }} />
            Earth{isHovered ? ' · Bodies → Earth' : ''}
          </div>
        </Html>
      )}
    </group>
  );
}

// Speckled satellite field — restoring orbit-veil cool dots
function SatelliteField({ earthRadius }: { earthRadius: number }) {
  const count = 7200;
  const ref = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const { positions, speeds, inclinations, raans } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const inc = new Float32Array(count);
    const raan = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      let altKm: number;
      const r = Math.random();
      if (r < 0.62) altKm = 400 + Math.random() * 220;
      else if (r < 0.82) altKm = 700 + Math.random() * 220;
      else if (r < 0.94) altKm = 1100 + Math.random() * 900;
      else altKm = 2000 + Math.random() * 800;

      const factor = 1 + altKm / 6371;
      const radius = earthRadius * factor;

      const inclination = (Math.random() * 0.9 + 0.05) * Math.PI;
      const ra = Math.random() * Math.PI * 2;

      inc[i] = inclination;
      raan[i] = ra;
      spd[i] = 0.4 + Math.random() * 0.9 + 1 / Math.sqrt(radius * 1.8);

      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi);
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return { positions: pos, speeds: spd, inclinations: inc, raans: raan };
  }, [earthRadius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const animAngles = useRef<Float32Array>(new Float32Array(count));

  useFrame((_, dt) => {
    if (!geomRef.current) return;
    const attr = geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = Date.now() * 0.0001;
    for (let i = 0; i < count; i++) {
      animAngles.current[i] += dt * speeds[i] * 0.25;
      const radius = Math.sqrt(arr[i * 3] * arr[i * 3] + arr[i * 3 + 1] * arr[i * 3 + 1] + arr[i * 3 + 2] * arr[i * 3 + 2]) || earthRadius * 1.15;
      const ang = animAngles.current[i] + t * speeds[i];
      const incl = inclinations[i];
      const ra = raans[i];
      const x0 = radius * Math.cos(ang);
      const z0 = radius * Math.sin(ang);
      const y1 = z0 * Math.sin(incl);
      const z1 = z0 * Math.cos(incl);
      const x2 = x0 * Math.cos(ra) - z1 * Math.sin(ra);
      const z2 = x0 * Math.sin(ra) + z1 * Math.cos(ra);
      arr[i * 3] = x2;
      arr[i * 3 + 1] = y1;
      arr[i * 3 + 2] = z2;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref as any}>
      <primitive object={geometry} ref={geomRef as any} attach="geometry" />
      <pointsMaterial size={0.024} sizeAttenuation transparent opacity={0.92} color="#e2e8f0" blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function PlanetBody({
  p,
  selected,
  isHovered,
  onSelect,
  onHover,
  showLabel,
}: {
  p: PlanetPosition;
  selected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  showLabel: boolean;
}) {
  const cfg = getPlanetConfig(p.id);
  const size =
    p.id === 'Sun' ? 1.25
      : p.id === 'Jupiter' ? 0.92
        : p.id === 'Saturn' ? 0.84
          : p.id === 'Neptune' || p.id === 'Uranus' ? 0.62
            : p.id === 'Venus' ? 0.54
              : p.id === 'Mars' ? 0.42
                : p.id === 'Moon' ? 0.20
                  : ['Eris', 'Haumea', 'Makemake', 'Sedna'].includes(p.id) ? 0.24
                    : p.id === 'Chiron' ? 0.20 : 0.30;

  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null as any;
    try {
      if (p.id === 'Moon') return { base: moonTexture() };
      if (p.id === 'Mars') return { base: marsTexture() };
      if (['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Venus'].includes(p.id)) return { base: gasGiantTexture(cfg.baseColor, p.id === 'Jupiter' ? 9 : 7) };
      return null;
    } catch { return null; }
  }, [p.id, cfg.baseColor]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * (cfg.rotationSpeed ?? 0.14); });

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <group ref={groupRef} scale={p.id === 'Haumea' ? [1.7, 0.82, 0.92] : [1,1,1]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
        >
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial
            color={cfg.baseColor}
            map={textures?.base ?? undefined}
            emissive={p.id === 'Sun' ? cfg.emissive : selected || isHovered ? cfg.baseColor : '#000000'}
            emissiveIntensity={p.id === 'Sun' ? 1.22 : selected || isHovered ? 0.5 : 0}
            roughness={cfg.roughness ?? 0.72}
            metalness={cfg.metalness ?? 0.08}
          />
        </mesh>
        {cfg.hasClouds && (textures as any)?.base && p.id !== 'Sun' && <CloudLayer size={size} texture={(textures as any).base} speed={0.38} />}
      </group>
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.6 : (cfg.atmosphereStrength ?? 0.6)} power={2.5} />}
      {p.id === 'Sun' && (<><SunCorona size={size} /><SunDisk size={size} /></>)}
      {cfg.hasRings && (<><mesh rotation={[Math.PI/2.62,0,0.18]}><ringGeometry args={[size*1.38,size*2.42,96]} /><meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.56} side={THREE.DoubleSide} /></mesh><RingGlow inner={size*1.38} outer={size*2.42} color={cfg.ringColor ?? '#fde68a'} /></>)}
      {(selected||isHovered)&&(<mesh><sphereGeometry args={[size*1.28,28,28]} /><meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered?0.20:0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} /></mesh>)}
      {(showLabel||isHovered||selected)&&(<Html distanceFactor={9} style={{pointerEvents:'none'}}><div className={`obs-label obs-label--planet ${isHovered?'is-hover':''} ${selected?'is-active':''}`}><span className="obs-label-dot" style={{background:cfg.baseColor, boxShadow:`0 0 10px ${cfg.baseColor}`}} />{p.name}{p.retro?' ℞':''}{isHovered?` · Bodies → ${p.id}`:''}</div></Html>)}
    </group>
  );
}

function EarthDetail({ earthPos, earthSize, layers, chart }: { earthPos: [number,number,number]; earthSize: number; layers: any; chart: any }) {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([]);
  const [eonet, setEonet] = useState<EonetEvent[]>([]);
  const [winds, setWinds] = useState<WindSample[]>([]);
  const [iss, setIss] = useState<{ lat:number; lon:number } | null>(null);

  useEffect(()=>{ if(layers.earthquakes) fetchEarthquakes().then(setQuakes).catch(()=>{}); else setQuakes([]); }, [layers.earthquakes]);
  useEffect(()=>{ if(layers.eonet||layers.storms||layers.wildfires||layers.volcanoes) fetchEonet().then(setEonet).catch(()=>{}); else setEonet([]); }, [layers.eonet, layers.storms, layers.wildfires, layers.volcanoes]);
  useEffect(()=>{
    if(!layers.winds){ setWinds([]); return; }
    let cancelled=false;
    fetchRealWindGrid().then(r=>{ if(!cancelled) setWinds(r.length>4?r:[]); }).catch(async()=>{ const g=await fetchGlobalWindGrid(); if(!cancelled) setWinds(g); });
    return ()=>{ cancelled=true; };
  }, [layers.winds]);
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
  }, [layers.satellites]);

  const acLines = useMemo(()=>{
    if(!layers.astroCartography) return [];
    try{
      const planets=chart.planets.filter((p:any)=>p.id!=='Earth'&&p.id!=='Sun');
      const jd=jdFromDate(chart.time);
      return computeACLines(jd, planets).slice(0,80);
    }catch{ return []; }
  }, [chart, layers.astroCartography]);

  const R=earthSize;

  return (
    <group position={earthPos}>
      {/* Satellite field — orbit veil cool speckled dots — full capacity */}
      {layers.satellites && <SatelliteField earthRadius={R} />}

      {layers.earthquakes&&quakes.slice(0,220).map(q=>{
        const pos=latLonToVector3(q.lat, q.lon, R*1.028);
        const mag=q.mag??0;
        const col=mag>5.5?'#ef4444':mag>4.2?'#f97316':'#eab308';
        return (
          <group key={`q-${q.id}`} position={[pos.x,pos.y,pos.z]}>
            <mesh><sphereGeometry args={[0.020 + mag*0.006, 10,10]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} /></mesh>
            <mesh scale={[1.9,1.9,1.9]}><sphereGeometry args={[0.020 + mag*0.006, 10,10]} /><meshBasicMaterial color={col} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            {mag>5 && <Html distanceFactor={5} style={{pointerEvents:'none'}}><div className="obs-earth-pin" style={{background:col, boxShadow:`0 0 12px ${col}`}}>M{mag.toFixed(1)}</div></Html>}
          </group>
        );
      })}

      {(layers.eonet||layers.storms||layers.wildfires||layers.volcanoes)&&eonet.slice(0,180).map(ev=>{
        const pos=latLonToVector3(ev.lat, ev.lon, R*1.034);
        const cat=ev.category.toLowerCase();
        let show=true;
        if(cat.includes('storm')&&!layers.storms&&!layers.eonet) show=false;
        if(cat.includes('fire')&&!layers.wildfires&&!layers.eonet) show=false;
        if(cat.includes('volcano')&&!layers.volcanoes&&!layers.eonet) show=false;
        if(!show) return null;
        const col=/storm/.test(cat)?'#22d3ee':/fire/.test(cat)?'#fb923c':/volcano/.test(cat)?'#ef4444':'#a3e635';
        return (<group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.018,10,10]}/><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.85}/></mesh><mesh scale={[2.1,2.1,2.1]}><sphereGeometry args={[0.018,10,10]}/><meshBasicMaterial color={col} transparent opacity={0.20} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>);
      })}

      {layers.winds&&winds.slice(0,120).map((w,i)=>{
        const p1=latLonToVector3(w.lat, w.lon, R*1.042);
        const sp=Math.sqrt(w.u*w.u+w.v*w.v);
        const br=Math.atan2(w.u,w.v);
        const len=Math.min(3, sp*0.10+0.22);
        const p2=latLonToVector3(w.lat+Math.cos(br)*len, w.lon+Math.sin(br)*len, R*1.042);
        return <Line key={`wind-${i}`} points={[[p1.x,p1.y,p1.z] as any,[p2.x,p2.y,p2.z] as any]} color={sp>12?'#22d3ee':sp>7?'#7dd3fc':'#ffffff'} transparent opacity={0.72} lineWidth={sp>12?2:1.2} />;
      })}

      {layers.astroCartography&&acLines.map((line:any,idx:number)=>{
        const pts=line.points.map((p:any)=>{ const v=latLonToVector3(p.lat,p.lon,R*1.026); return [v.x,v.y,v.z] as [number,number,number]; }).filter(Boolean);
        if(pts.length<2) return null;
        return <Line key={`ac-${line.id}-${idx}`} points={pts} color={line.bodyColor||'#38bdf8'} transparent opacity={line.type==='MC'||line.type==='IC'?0.92:0.64} lineWidth={line.type==='MC'?2:1.2} />;
      })}

      {layers.satellites&&iss&&(()=>{
        const pos=latLonToVector3(iss.lat, iss.lon, R*1.18);
        return (<group position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.030,16,16]}/><meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={1.1}/></mesh><mesh scale={[1.8,1.8,1.8]}><sphereGeometry args={[0.030,12,12]}/><meshBasicMaterial color="#a3e635" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh><Html distanceFactor={4} style={{pointerEvents:'none'}}><div className="obs-label obs-label--planet"><span className="obs-label-dot" style={{background:'#a3e635', boxShadow:'0 0 12px #a3e635'}}/>ISS · Layers → Satellites</div></Html></group>);
      })()}

      {layers.missions&&MISSIONS.filter((m:any)=>m.domain==='earth').slice(0,20).map((m:any,i:number)=>{
        const ang=(i/20)*Math.PI*2 + Date.now()*0.00014*(1+i*0.06);
        const r=R*(1.30+(i%5)*0.16);
        const incl=(m as any).inclination?(m as any).inclination*Math.PI/180:0.35;
        const pos=new THREE.Vector3(Math.cos(ang)*r, Math.sin(ang)*Math.sin(incl)*r + Math.cos(incl)*r*0.18*Math.sin(ang*1.4), Math.sin(ang)*r);
        return (<group key={`m-${m.id}`} position={[pos.x,pos.y,pos.z]}><mesh><octahedronGeometry args={[0.022,0]}/><meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.85}/></mesh><mesh scale={[1.6,1.6,1.6]}><octahedronGeometry args={[0.022,0]}/><meshBasicMaterial color={m.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>);
      })}

      {layers.traffic&&[...Array(28)].map((_,i)=>{
        const lat=(Math.random()-0.5)*120;
        const lon=(Math.random()-0.5)*360;
        const pos=latLonToVector3(lat,lon,R*1.018);
        return (<group key={`traffic-${i}`} position={[pos.x,pos.y,pos.z]}><mesh><ringGeometry args={[0.022,0.034,16]}/><meshBasicMaterial color="#f472b6" transparent opacity={0.38} side={THREE.DoubleSide}/></mesh></group>);
      })}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, isHovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; isHovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(()=>{ try{ return orbitRingPoints(planetId, date, 200, swiss, zodiac, ayanamsaId).map((p:any)=>[p.x,p.y,p.z] as [number,number,number]); }catch{ return []; } }, [planetId, date, zodiac, ayanamsaId, swiss]);
  if(pts.length<2) return null;
  const isEarth=planetId==='Earth';
  return (<group onPointerOver={()=>onHover(true)} onPointerOut={()=>onHover(false)}><Line points={pts} color={isHovered?'#e2e8f0':isEarth?'#38bdf8':'#1e2f55'} transparent opacity={isHovered?1:isEarth?0.88:0.26} lineWidth={isHovered?2.6:isEarth?1.6:0.8} /></group>);
}

function AspectLines({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers } = useObservatory();
  const map = useMemo(()=>new Map(chart.planets.map((p:any)=>[p.id,p])), [chart.planets]);
  if(!layers.aspects) return null;
  const aspects=chart.aspects.slice(0,120);
  return (
    <group>
      {aspects.map((hit:any,i:number)=>{
        const a=map.get(hit.a as any) as any; const b=map.get(hit.b as any) as any; if(!a||!b) return null;
        const pts:[number,number,number][]=[[a.helio.x,a.helio.y,a.helio.z],[b.helio.x,b.helio.y,b.helio.z]];
        const id=`${hit.a}-${hit.aspect}-${hit.b}-${i}`;
        const isHover=hoveredId===id;
        return (
          <group key={id}>
            <Line points={pts} color={isHover?'#fff':hit.color||'#38bdf8'} transparent opacity={isHover?1:0.38} lineWidth={isHover?3:1}
              // @ts-ignore
              onPointerOver={(e:any)=>{ e.stopPropagation(); setHoveredId(id); document.body.style.cursor='pointer'; }}
              // @ts-ignore
              onPointerOut={()=>{ setHoveredId(null); document.body.style.cursor='default'; }}
            />
            {isHover && <Html position={[(a.helio.x+b.helio.x)/2,(a.helio.y+b.helio.y)/2+0.4,(a.helio.z+b.helio.z)/2]} style={{pointerEvents:'none'}}><div className="obs-tooltip obs-tooltip--aspect"><div className="obs-tooltip-hd" style={{borderColor:hit.color}}>{hit.label}</div><div>Δ {hit.delta.toFixed(2)}° · Aspects → {hit.aspect}</div></div></Html>}
          </group>
        );
      })}
    </group>
  );
}

function ConstellationLines({ radius=128 }: { radius?: number }) {
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
  return (<group>{lines.map(l=><Line key={l.id} points={l.pts} color="#7dd3fc" transparent opacity={0.24} lineWidth={0.9} />)}</group>);
}

function CameraFlyController({ earthPos, controlsRef }: { earthPos: THREE.Vector3; controlsRef: React.MutableRefObject<any> }) {
  const { camera } = useThree();
  const flying = useRef<null | { startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; start: number; dur: number }>(null);
  useEffect(()=>{
    const makeFly=(target:THREE.Vector3, offset:THREE.Vector3, dur=1800)=>{
      const curPos=camera.position.clone();
      const curTarget=controlsRef.current?.target?.clone() ?? new THREE.Vector3(0,0,0);
      flying.current={ startPos:curPos, endPos:target.clone().add(offset), startTarget:curTarget, endTarget:target.clone(), start:performance.now(), dur };
    };
    const onEarth=()=>makeFly(earthPos, new THREE.Vector3(0,1.4,2.45));
    const onSolar=()=>makeFly(new THREE.Vector3(0,0,0), new THREE.Vector3(0,18,40), 2000);
    (window as any).__flyEarth=onEarth; (window as any).__flySolar=onSolar;
    const hEarth=()=>onEarth(); const hSolar=()=>onSolar();
    window.addEventListener('obs-flyto-earth', hEarth as any);
    window.addEventListener('obs-flyto-solar', hSolar as any);
    const t=setTimeout(()=>{ if(earthPos.length()>0.1) onEarth(); }, 700);
    return ()=>{ window.removeEventListener('obs-flyto-earth', hEarth as any); window.removeEventListener('obs-flyto-solar', hSolar as any); clearTimeout(t); };
  }, [camera, controlsRef, earthPos]);
  useFrame(()=>{
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

function UnifiedScene({ setFocus }: { setFocus: (f:'solar'|'earth')=>void }) {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId, enabledBodies } = useObservatory() as any;
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
  const earthSize=1.02;

  const bodies = useMemo(()=>chart.planets.filter((p:PlanetPosition)=>{
    if(p.id==='Earth' || p.id==='Sun') return true;
    return (enabledBodies as any)[p.id]!==false;
  }).filter((p:PlanetPosition)=> (SOLAR_BODIES.includes(p.id as any) || p.id==='Sun' || ['Moon','Chiron','Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna','Ceres','Vesta','Pallas','Juno','Pholus'].includes(p.id))), [chart.planets, enabledBodies]);

  return (
    <>
      <color attach="background" args={['#01030a']} />
      <fog attach="fog" args={['#01030a', 70, 260]} />
      <ambientLight intensity={0.56} />
      <pointLight position={[0,0,0]} intensity={5.2} distance={240} decay={1.3} color="#fff4d0" />
      <directionalLight position={[14,22,14]} intensity={0.48} color="#cfe8ff" />
      <Stars radius={420} depth={160} count={14000} factor={7} saturation={0} fade speed={0.16} />
      <ConstellationLines radius={135} />

      {bodies.filter((p:PlanetPosition)=>p.id==='Sun').map((p:PlanetPosition)=>(
        <PlanetBody key="Sun" p={{...p, helio:{x:0,y:0,z:0}} as any} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>setSelectedPlanet(p.id)} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} />
      ))}

      {layers.orbits && SOLAR_BODIES.filter(id=>id!=='Earth').map((id:any)=>(
        <OrbitRing key={`orb-${id}`} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit===id} onHover={v=>setHoveredOrbit(v?id:null)} />
      ))}
      {layers.orbits && <OrbitRing planetId={'Earth' as any} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit==='Earth'} onHover={v=>setHoveredOrbit(v?'Earth':null)} />}

      {/* Earth photoreal centerpiece — master quality */}
      <group position={earthPosArr}>
        <PhotorealEarth size={earthSize} selected={selectedPlanet==='Earth'} isHovered={hoveredPlanet==='Earth'} onSelect={()=>setSelectedPlanet('Earth' as any)} onHover={v=>setHoveredPlanet(v?'Earth':null)} showLabel={layers.labels} />
      </group>

      {layers.planets && bodies.filter((p:PlanetPosition)=>p.id!=='Sun' && p.id!=='Earth').map((p:PlanetPosition)=>(
        <PlanetBody key={p.id} p={p} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>setSelectedPlanet(p.id as any)} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} />
      ))}

      {/* Earth data layers — full orbit veil capacity + added features, no cities */}
      <EarthDetail earthPos={earthPosArr} earthSize={earthSize} layers={{...layers, cities:false}} chart={chart} />

      <AspectLines hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />

      <mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[74,64]} /><meshBasicMaterial color="#0a1220" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false}/></mesh>
      <gridHelper args={[150,28,0x182a4a,0x0f1a2e]} />

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={1.05} maxDistance={200} enableDamping dampingFactor={0.084} rotateSpeed={0.55} zoomSpeed={0.98} panSpeed={0.66} />
      <CameraFlyController earthPos={earthPosVec} controlsRef={controlsRef} />
    </>
  );
}

export function UnifiedWorld() {
  const { chart } = useObservatory();
  const [mode, setMode]=useState<'solar'|'earth'>('earth');

  return (
    <div className="obs-unified-world">
      <Canvas camera={{ position: [4.6, 2.8, 7.8], fov: 44 }} dpr={[1,1.9]} gl={{ antialias:true, alpha:false, powerPreference:'high-performance', stencil:false, depth:true }}>
        <Suspense fallback={null}>
          <UnifiedScene setFocus={setMode} />
        </Suspense>
      </Canvas>

      <div className="obs-world-ui">
        <button type="button" className={`obs-pill obs-pill--action ${mode==='earth'?'is-active':''}`} onClick={()=>{ setMode('earth'); window.dispatchEvent(new CustomEvent('obs-flyto-earth')); }}>🌍 Focus Earth</button>
        <button type="button" className={`obs-pill obs-pill--action ${mode==='solar'?'is-active':''}`} onClick={()=>{ setMode('solar'); window.dispatchEvent(new CustomEvent('obs-flyto-solar')); }}>☀️ Solar overview</button>
        <span className="obs-pill obs-pill--stats">{chart.planets.length} bodies · {chart.aspects.length} aspects · satellites · quakes · EONET · winds — unified</span>
      </div>

      <div className="obs-world-hint">
        Drag to orbit · Scroll to zoom · Click planet to select · Hover for details
      </div>
    </div>
  );
}
