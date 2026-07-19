import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { useObservatory } from '../state/ObservatoryContext';
import { MAJOR_CITIES, MISSIONS } from '../data/missions';
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

function PlanetBody({
  p,
  selected,
  isHovered,
  onSelect,
  onHover,
  showLabel,
  earthTextures,
}: {
  p: PlanetPosition;
  selected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  showLabel: boolean;
  earthTextures?: { base: THREE.Texture; clouds: THREE.Texture; lights: THREE.Texture };
}) {
  const cfg = getPlanetConfig(p.id);
  const size =
    p.id === 'Sun' ? 1.15
      : p.id === 'Jupiter' ? 0.92
        : p.id === 'Saturn' ? 0.82
          : p.id === 'Earth' ? 0.88
            : p.id === 'Moon' ? 0.20
              : p.id === 'Neptune' || p.id === 'Uranus' ? 0.60
                : p.id === 'Venus' ? 0.52
                  : p.id === 'Mars' ? 0.40
                    : ['Eris', 'Haumea', 'Makemake', 'Sedna'].includes(p.id) ? 0.24
                      : p.id === 'Chiron' ? 0.20 : 0.28;

  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null as any;
    try {
      if (p.id === 'Earth' && earthTextures) return earthTextures as any;
      if (p.id === 'Earth') return { base: earthBaseTexture(), clouds: cloudTexture(), lights: cityLightsTexture() };
      if (p.id === 'Moon') return { base: moonTexture() };
      if (p.id === 'Mars') return { base: marsTexture() };
      if (['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Venus'].includes(p.id)) return { base: gasGiantTexture(cfg.baseColor, p.id === 'Jupiter' ? 9 : p.id === 'Saturn' ? 7 : 6) };
      return null;
    } catch { return null; }
  }, [p.id, cfg.baseColor, earthTextures]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * (cfg.rotationSpeed ?? 0.12);
  });

  const scale: [number, number, number] = p.id === 'Haumea' ? [1.7, 0.82, 0.92] : [1, 1, 1];

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <group ref={groupRef} scale={scale}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
        >
          <sphereGeometry args={[size, p.id === 'Earth' ? 80 : 48, p.id === 'Earth' ? 80 : 48]} />
          <meshStandardMaterial
            color={cfg.baseColor}
            map={textures?.base ?? undefined}
            emissive={p.id === 'Sun' ? cfg.emissive : selected || isHovered ? cfg.baseColor : '#000000'}
            emissiveIntensity={p.id === 'Sun' ? 1.2 : selected || isHovered ? 0.48 : 0}
            roughness={cfg.roughness ?? 0.72}
            metalness={cfg.metalness ?? 0.08}
          />
        </mesh>
        {cfg.hasClouds && (textures as any)?.clouds && <CloudLayer size={size} texture={(textures as any).clouds} speed={p.id === 'Earth' ? 0.16 : 0.38} />}
        {cfg.hasCityLights && (textures as any)?.lights && p.id !== 'Earth' && <CityLightsLayer size={size} texture={(textures as any).lights} />}
        {p.id === 'Earth' && (textures as any)?.lights && <CityLightsLayer size={size} texture={(textures as any).lights} opacity={0.9} />}
        {cfg.hasAurora && p.id === 'Earth' && <Aurora size={size} color={'#22d3ee'} />}
      </group>
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.65 : (cfg.atmosphereStrength ?? 0.6)} power={p.id === 'Sun' ? 1.5 : 2.5} />}
      {p.id === 'Sun' && (<><SunCorona size={size} /><SunDisk size={size} /></>)}
      {cfg.hasRings && (
        <>
          <mesh rotation={[Math.PI / 2.62, 0, 0.18]}>
            <ringGeometry args={[size * 1.38, size * 2.42, 96]} />
            <meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.56} side={THREE.DoubleSide} />
          </mesh>
          <RingGlow inner={size * 1.38} outer={size * 2.42} color={cfg.ringColor ?? '#fde68a'} />
        </>
      )}
      {(selected || isHovered) && (
        <mesh>
          <sphereGeometry args={[size * 1.28, 28, 28]} />
          <meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered ? 0.20 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      {(showLabel || isHovered || selected) && (
        <Html distanceFactor={9} zIndexRange={[0,0]} style={{ pointerEvents: 'none' }}>
          <div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}>
            <span className="obs-label-dot" style={{ background: cfg.baseColor, boxShadow: `0 0 10px ${cfg.baseColor}` }} />
            <span>{p.name}{p.retro ? ' ℞' : ''}</span>
            {isHovered && <span className="obs-label-hint"> · Bodies → {p.id}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

function EarthDetail({ earthPos, earthSize, layers, chart }: { earthPos: [number, number, number]; earthSize: number; layers: any; chart: any }) {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([]);
  const [eonet, setEonet] = useState<EonetEvent[]>([]);
  const [winds, setWinds] = useState<WindSample[]>([]);
  const [iss, setIss] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => { if (layers.earthquakes) fetchEarthquakes().then(setQuakes).catch(()=>{}); else setQuakes([]); }, [layers.earthquakes]);
  useEffect(() => { if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) fetchEonet().then(setEonet).catch(()=>{}); else setEonet([]); }, [layers.eonet, layers.storms, layers.wildfires, layers.volcanoes]);
  useEffect(() => {
    if (!layers.winds) { setWinds([]); return; }
    let cancelled=false;
    fetchRealWindGrid().then(r=>{ if(!cancelled) setWinds(r.length>4?r:[]); }).catch(async()=>{ const g=await fetchGlobalWindGrid(); if(!cancelled) setWinds(g); });
    return ()=>{ cancelled=true; };
  }, [layers.winds]);

  useEffect(() => {
    if (!layers.satellites) return;
    let id:any=null;
    const tick=async()=>{
      try{
        const r=await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if(!r.ok) throw new Error();
        const j=await r.json() as any;
        setIss({ lat: Number(j.latitude), lon: Number(j.longitude) });
      }catch{ const t=Date.now()/1000; setIss({ lat: 51.6*Math.sin(t*0.001), lon: ((t*0.06)%360)-180 }); }
    };
    tick(); id=setInterval(tick,5000);
    return ()=>{ if(id) clearInterval(id); };
  }, [layers.satellites]);

  const acLines = useMemo(() => {
    if (!layers.astroCartography) return [];
    try{
      const planets = chart.planets.filter((p:any)=>p.id!=='Earth' && p.id!=='Sun');
      const jd = jdFromDate(chart.time);
      return computeACLines(jd, planets).slice(0,70);
    }catch{ return []; }
  }, [chart, layers.astroCartography]);

  const R = earthSize;

  return (
    <group position={earthPos}>
      {layers.earthquakes && quakes.slice(0,160).map(q=>{
        const pos=latLonToVector3(q.lat, q.lon, R*1.024);
        const col=(q.mag??0)>5.5?'#ef4444':(q.mag??0)>4.2?'#f97316':'#eab308';
        return (
          <group key={`q-${q.id}`} position={[pos.x,pos.y,pos.z]}>
            <mesh><sphereGeometry args={[0.014 + (q.mag??0)*0.0055, 8,8]} /><meshBasicMaterial color={col} transparent opacity={0.92} /></mesh>
            {(q.mag??0)>5 && <Html distanceFactor={6} style={{pointerEvents:'none'}}><div className="obs-earth-pin" style={{background:col}}>M{(q.mag??0).toFixed(1)}</div></Html>}
          </group>
        );
      })}
      {(layers.eonet||layers.storms||layers.wildfires||layers.volcanoes)&&eonet.slice(0,140).map(ev=>{
        const pos=latLonToVector3(ev.lat, ev.lon, R*1.03);
        const cat=ev.category.toLowerCase();
        let show=true;
        if(cat.includes('storm')&&!layers.storms&&!layers.eonet) show=false;
        if(cat.includes('fire')&&!layers.wildfires&&!layers.eonet) show=false;
        if(cat.includes('volcano')&&!layers.volcanoes&&!layers.eonet) show=false;
        if(!show) return null;
        const col=/storm/.test(cat)?'#22d3ee':/fire/.test(cat)?'#fb923c':/volcano/.test(cat)?'#ef4444':'#a3e635';
        return (<group key={`e-${ev.id}`} position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.012,8,8]}/><meshBasicMaterial color={col} /></mesh><mesh scale={[1.7,1.7,1.7]}><sphereGeometry args={[0.012,8,8]}/><meshBasicMaterial color={col} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>);
      })}
      {layers.cities&&MAJOR_CITIES.slice(0,110).map(c=>{
        const pos=latLonToVector3(c.lat, c.lon, R*1.012);
        return (<group key={`city-${c.name}`} position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.006,6,6]}/><meshBasicMaterial color="#ffffff" transparent opacity={0.74}/></mesh><Html distanceFactor={7} style={{pointerEvents:'none'}}><div className="obs-city-label">{c.name}</div></Html></group>);
      })}
      {layers.winds&&winds.slice(0,96).map((w,i)=>{
        const p1=latLonToVector3(w.lat, w.lon, R*1.034);
        const sp=Math.sqrt(w.u*w.u+w.v*w.v);
        const br=Math.atan2(w.u,w.v);
        const len=Math.min(2.2, sp*0.08+0.16);
        const p2=latLonToVector3(w.lat+Math.cos(br)*len, w.lon+Math.sin(br)*len, R*1.034);
        return <Line key={`wind-${i}`} points={[[p1.x,p1.y,p1.z] as any,[p2.x,p2.y,p2.z] as any]} color={sp>12?'#22d3ee':sp>7?'#7dd3fc':'#fff'} transparent opacity={0.56} lineWidth={sp>12?1.6:1} />;
      })}
      {layers.astroCartography&&acLines.map((line:any,idx:number)=>{
        const pts=line.points.map((p:any)=>{ const v=latLonToVector3(p.lat,p.lon,R*1.02); return [v.x,v.y,v.z] as [number,number,number]; }).filter(Boolean);
        if(pts.length<2) return null;
        return <Line key={`ac-${line.id}-${idx}`} points={pts} color={line.bodyColor||'#38bdf8'} transparent opacity={line.type==='MC'||line.type==='IC'?0.9:0.58} lineWidth={line.type==='MC'?1.8:1} />;
      })}
      {layers.satellites&&iss&&(()=>{
        const pos=latLonToVector3(iss.lat, iss.lon, R*1.16);
        return (<group position={[pos.x,pos.y,pos.z]}><mesh><sphereGeometry args={[0.024,14,14]}/><meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.92}/></mesh><mesh scale={[1.5,1.5,1.5]}><sphereGeometry args={[0.024,12,12]}/><meshBasicMaterial color="#a3e635" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh><Html distanceFactor={5} style={{pointerEvents:'none'}}><div className="obs-label obs-label--planet"><span className="obs-label-dot" style={{background:'#a3e635'}}/>ISS · Layers → Satellites</div></Html></group>);
      })()}
      {layers.missions&&MISSIONS.filter((m:any)=>m.domain==='earth').slice(0,16).map((m:any,i:number)=>{
        const ang=(i/16)*Math.PI*2 + Date.now()*0.00012*(1+i*0.05);
        const r=R*(1.24+(i%4)*0.14);
        const incl=(m as any).inclination?(m as any).inclination*Math.PI/180:0.3;
        const pos=new THREE.Vector3(Math.cos(ang)*r, Math.sin(ang)*Math.sin(incl)*r + Math.cos(incl)*r*0.15*Math.sin(ang*1.3), Math.sin(ang)*r);
        return (<group key={`m-${m.id}`} position={[pos.x,pos.y,pos.z]}><mesh><octahedronGeometry args={[0.018,0]}/><meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.72}/></mesh></group>);
      })}
      {layers.traffic&&MAJOR_CITIES.slice(0,24).map(c=>{
        const pos=latLonToVector3(c.lat,c.lon,R*1.016);
        return (<group key={`traffic-${c.name}`} position={[pos.x,pos.y,pos.z]}><mesh><ringGeometry args={[0.02,0.03,16]}/><meshBasicMaterial color="#f472b6" transparent opacity={0.32} side={THREE.DoubleSide}/></mesh></group>);
      })}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, isHovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; isHovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(() => {
    try { return orbitRingPoints(planetId, date, 180, swiss, zodiac, ayanamsaId).map((p:any)=>[p.x,p.y,p.z] as [number,number,number]); } catch { return []; }
  }, [planetId, date, zodiac, ayanamsaId, swiss]);
  if (pts.length<2) return null;
  const isEarth = planetId==='Earth';
  return (<group onPointerOver={()=>onHover(true)} onPointerOut={()=>onHover(false)}><Line points={pts} color={isHovered?'#e2e8f0':isEarth?'#38bdf8':'#1d2c4e'} transparent opacity={isHovered?1:isEarth?0.9:0.24} lineWidth={isHovered?2.4:isEarth?1.5:0.7} /></group>);
}

function AspectLines({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers } = useObservatory();
  const map = useMemo(()=>new Map(chart.planets.map((p:any)=>[p.id,p])), [chart.planets]);
  if (!layers.aspects) return null;
  const aspects = chart.aspects.slice(0,110);
  return (
    <group>
      {aspects.map((hit:any,i:number)=>{
        const a=map.get(hit.a as any) as any; const b=map.get(hit.b as any) as any; if(!a||!b) return null;
        const pts:[number,number,number][]=[[a.helio.x,a.helio.y,a.helio.z],[b.helio.x,b.helio.y,b.helio.z]];
        const id=`${hit.a}-${hit.aspect}-${hit.b}-${i}`;
        const isHover=hoveredId===id;
        return (
          <group key={id}>
            <Line points={pts} color={isHover?'#fff':hit.color||'#38bdf8'} transparent opacity={isHover?1:0.36} lineWidth={isHover?3:1}
              // @ts-ignore
              onPointerOver={(e:any)=>{ e.stopPropagation(); setHoveredId(id); document.body.style.cursor='pointer'; }}
              // @ts-ignore
              onPointerOut={()=>{ setHoveredId(null); document.body.style.cursor='default'; }}
            />
            {isHover && <Html position={[(a.helio.x+b.helio.x)/2,(a.helio.y+b.helio.y)/2+0.35,(a.helio.z+b.helio.z)/2]} style={{pointerEvents:'none'}}><div className="obs-tooltip obs-tooltip--aspect"><div className="obs-tooltip-hd" style={{borderColor:hit.color}}>{hit.label}</div><div>Δ {hit.delta.toFixed(2)}° · Aspects → {hit.aspect}</div></div></Html>}
          </group>
        );
      })}
    </group>
  );
}

function ConstellationLines({ radius=115 }: { radius?: number }) {
  const { layers } = useObservatory();
  const lines = useMemo(()=>{
    const out:{pts:[number,number,number][]; id:string}[]=[];
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
  return (<group>{lines.map(l=><Line key={l.id} points={l.pts} color="#7dd3fc" transparent opacity={0.26} lineWidth={0.9} />)}</group>);
}

function CameraFlyController({ earthPos, controlsRef, onFlyingChange }: { earthPos: THREE.Vector3; controlsRef: React.MutableRefObject<any>; onFlyingChange?: (v:boolean)=>void }) {
  const { camera } = useThree();
  const flying = useRef<null | { startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; start: number; dur: number }>(null);

  useEffect(()=>{
    const makeFly = (target: THREE.Vector3, posOffset: THREE.Vector3, dur=1800)=>{
      const curPos=camera.position.clone();
      const curTarget=controlsRef.current?.target?.clone() ?? new THREE.Vector3(0,0,0);
      const endPos=target.clone().add(posOffset);
      flying.current={ startPos:curPos, endPos, startTarget:curTarget, endTarget:target.clone(), start:performance.now(), dur };
      onFlyingChange?.(true);
    };
    const onEarth=()=> makeFly(earthPos, new THREE.Vector3(0,1.35,2.35));
    const onSolar=()=> makeFly(new THREE.Vector3(0,0,0), new THREE.Vector3(0,18,38), 1900);
    // expose helpers
    (window as any).__flyEarth=onEarth; (window as any).__flySolar=onSolar;
    const hEarth=()=>onEarth();
    const hSolar=()=>onSolar();
    window.addEventListener('obs-flyto-earth', hEarth as any);
    window.addEventListener('obs-flyto-solar', hSolar as any);
    // auto focus Earth on first load after short delay so user sees planet immediately
    const t=setTimeout(()=>{ if(!earthPos.equals(new THREE.Vector3(0,0,0))) onEarth(); }, 650);
    return ()=>{ window.removeEventListener('obs-flyto-earth', hEarth as any); window.removeEventListener('obs-flyto-solar', hSolar as any); clearTimeout(t); };
  }, [camera, controlsRef, earthPos, onFlyingChange]);

  useFrame(()=>{
    if(!flying.current) return;
    const f=flying.current;
    const t=Math.min(1,(performance.now()-f.start)/f.dur);
    const ease=t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    camera.position.lerpVectors(f.startPos,f.endPos,ease);
    if(controlsRef.current){ controlsRef.current.target.lerpVectors(f.startTarget,f.endTarget,ease); controlsRef.current.update(); }
    if(t>=1){ flying.current=null; onFlyingChange?.(false); }
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
  // fallback Earth helio if chart missing (should not happen now Earth defaultOn true)
  const fallbackEarth = useMemo(()=>({ x:3.1, y:0, z:0 }),[]);
  const earthHelio = earth ? earth.helio : fallbackEarth;
  const earthPosArr:[number,number,number]=[earthHelio.x,earthHelio.y,earthHelio.z];
  const earthPosVec = useMemo(()=>new THREE.Vector3(earthHelio.x,earthHelio.y,earthHelio.z), [earthHelio.x,earthHelio.y,earthHelio.z]);
  const earthSize=0.88;

  const bodies = useMemo(()=>chart.planets.filter((p:PlanetPosition)=>{
    if(p.id==='Earth' || p.id==='Sun') return true;
    return (enabledBodies as any)[p.id]!==false;
  }).filter((p:PlanetPosition)=> (SOLAR_BODIES.includes(p.id as any) || p.id==='Sun' || ['Moon','Chiron','Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna','Ceres','Vesta','Pallas','Juno','Pholus','Cupido','Hades','Zeus','Kronos','Apollon','Admetos','Vulcanus','Poseidon','Isis','WhiteMoon','Proserpina','Vulcan','MeanNode','TrueNode','SouthNode','MeanLilith','TrueLilith','Priapus','Vertex','EastPoint'].includes(p.id))), [chart.planets, enabledBodies]);

  const earthTextures = useMemo(()=>{
    if(typeof document==='undefined') return undefined;
    try{ return { base: earthBaseTexture(), clouds: cloudTexture(), lights: cityLightsTexture() }; }catch{ return undefined; }
  },[]);

  return (
    <>
      <color attach="background" args={['#02040c']} />
      <fog attach="fog" args={['#02040c', 62, 240]} />
      <ambientLight intensity={0.54} />
      <pointLight position={[0,0,0]} intensity={4.5} distance={200} decay={1.35} color="#fff4d0" />
      <directionalLight position={[14,20,12]} intensity={0.45} color="#cfe8ff" />
      <Stars radius={380} depth={140} count={12000} factor={7} saturation={0} fade speed={0.18} />
      <ConstellationLines radius={120} />

      {bodies.filter((p:PlanetPosition)=>p.id==='Sun').map((p:PlanetPosition)=>(
        <PlanetBody key="Sun" p={{...p, helio:{x:0,y:0,z:0}} as any} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>setSelectedPlanet(p.id)} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} />
      ))}

      {layers.orbits && SOLAR_BODIES.filter(id=>id!=='Earth').map((id:any)=>(
        <OrbitRing key={`orb-${id}`} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit===id} onHover={v=>setHoveredOrbit(v?id:null)} />
      ))}
      {layers.orbits && <OrbitRing planetId={'Earth' as any} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit==='Earth'} onHover={v=>setHoveredOrbit(v?'Earth':null)} />}

      {layers.planets && bodies.filter((p:PlanetPosition)=>p.id!=='Sun').map((p:PlanetPosition)=>(
        <PlanetBody key={p.id} p={p} selected={selectedPlanet===p.id} isHovered={hoveredPlanet===p.id} onSelect={()=>setSelectedPlanet(p.id as any)} onHover={v=>setHoveredPlanet(v?p.id:null)} showLabel={layers.labels} earthTextures={p.id==='Earth'?earthTextures:undefined} />
      ))}

      {/* Earth always visible even if disabled in bodies list – extra guard */}
      {!bodies.find((p:any)=>p.id==='Earth') && (
        <PlanetBody key="Earth-guaranteed" p={{ id:'Earth', name:'Earth', helio: earthHelio, lon:0, lat:0, distAu:1, tropicalLon:0, color:'#38bdf8', group:'personal' } as any} selected={selectedPlanet==='Earth'} isHovered={hoveredPlanet==='Earth'} onSelect={()=>setSelectedPlanet('Earth' as any)} onHover={v=>setHoveredPlanet(v?'Earth':null)} showLabel={layers.labels} earthTextures={earthTextures} />
      )}

      <EarthDetail earthPos={earthPosArr} earthSize={earthSize} layers={layers} chart={chart} />

      <AspectLines hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />

      <mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[66,64]} /><meshBasicMaterial color="#0a1220" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false}/></mesh>
      <gridHelper args={[132,26,0x1a2a44,0x101a2a]} />

      <OrbitControls ref={controlsRef} makeDefault enablePan minDistance={0.95} maxDistance={180} enableDamping dampingFactor={0.082} rotateSpeed={0.54} zoomSpeed={0.96} panSpeed={0.64} />
      <CameraFlyController earthPos={earthPosVec} controlsRef={controlsRef} onFlyingChange={f=>{ if(!f){ /* flying done */ } }} />
    </>
  );
}

export function UnifiedWorld() {
  const { chart } = useObservatory();
  const [mode, setMode]=useState<'solar'|'earth'>('earth');

  return (
    <div className="obs-unified-world">
      <Canvas camera={{ position: [4.2, 3.2, 8.5], fov: 46 }} dpr={[1,1.9]} gl={{ antialias:true, alpha:false, powerPreference:'high-performance', stencil:false, depth:true }} shadows={false}>
        <Suspense fallback={null}>
          <UnifiedScene setFocus={setMode} />
        </Suspense>
      </Canvas>

      <div className="obs-world-ui">
        <button type="button" className={`obs-pill obs-pill--action ${mode==='earth'?'is-active':''}`} onClick={()=>{ setMode('earth'); window.dispatchEvent(new CustomEvent('obs-flyto-earth')); }}>
          🌍 Focus Earth
        </button>
        <button type="button" className={`obs-pill obs-pill--action ${mode==='solar'?'is-active':''}`} onClick={()=>{ setMode('solar'); window.dispatchEvent(new CustomEvent('obs-flyto-solar')); }}>
          ☀️ Solar overview
        </button>
        <span className="obs-pill obs-pill--stats">
          {chart.planets.length} bodies · {chart.aspects.length} aspects · satellites · quakes · EONET · winds · cities — unified
        </span>
      </div>

      <div className="obs-world-hint">
        Drag to orbit · Scroll to zoom · Click planet to select · Hover for details
      </div>
    </div>
  );
}
