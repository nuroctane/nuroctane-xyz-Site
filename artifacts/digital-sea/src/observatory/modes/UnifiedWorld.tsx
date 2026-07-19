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

// Enhanced planet body with Gargantua-inspired effects, hover, selection
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
    p.id === 'Sun' ? 1.22
      : p.id === 'Jupiter' ? 0.92
        : p.id === 'Saturn' ? 0.78
          : p.id === 'Earth' ? 0.68
            : p.id === 'Moon' ? 0.19
              : p.id === 'Neptune' || p.id === 'Uranus' ? 0.62
                : p.id === 'Venus' ? 0.55
                  : p.id === 'Mars' ? 0.42
                    : ['Eris', 'Haumea', 'Makemake', 'Sedna'].includes(p.id) ? 0.22
                      : p.id === 'Chiron' ? 0.2 : 0.28;

  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null as any;
    try {
      if (p.id === 'Earth' && earthTextures) return earthTextures;
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

  const isEarth = p.id === 'Earth';
  const scale: [number, number, number] = p.id === 'Haumea' ? [1.7, 0.82, 0.92] : [1, 1, 1];

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <group ref={groupRef} scale={scale}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; onHover(false); }}
        >
          <sphereGeometry args={[size, isEarth ? 80 : 48, isEarth ? 80 : 48]} />
          <meshStandardMaterial
            color={cfg.baseColor}
            map={textures?.base ?? undefined}
            emissive={p.id === 'Sun' ? cfg.emissive : selected || isHovered ? cfg.baseColor : '#000000'}
            emissiveIntensity={p.id === 'Sun' ? 1.25 : selected || isHovered ? 0.52 : 0}
            roughness={cfg.roughness ?? 0.72}
            metalness={cfg.metalness ?? 0.08}
          />
        </mesh>
        {cfg.hasClouds && textures?.clouds && <CloudLayer size={size} texture={textures.clouds} speed={isEarth ? 0.16 : 0.38} />}
        {cfg.hasCityLights && textures?.lights && !isEarth && <CityLightsLayer size={size} texture={textures.lights} />}
        {/* For Earth city lights handled in EarthDetail for clarity, but keep glow ring here */}
        {cfg.hasAurora && isEarth && <Aurora size={size} color={'#22d3ee'} />}
        {isEarth && textures?.lights && <CityLightsLayer size={size} texture={textures.lights} opacity={0.88} />}
      </group>
      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.65 : (cfg.atmosphereStrength ?? 0.6)} power={p.id === 'Sun' ? 1.5 : 2.5} />}
      {p.id === 'Sun' && (
        <>
          <SunCorona size={size} />
          <SunDisk size={size} />
        </>
      )}
      {cfg.hasRings && (
        <>
          <mesh rotation={[Math.PI / 2.62, 0, 0.18]}>
            <ringGeometry args={[size * 1.38, size * 2.42, 96]} />
            <meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.58} side={THREE.DoubleSide} />
          </mesh>
          <RingGlow inner={size * 1.38} outer={size * 2.42} color={cfg.ringColor ?? '#fde68a'} />
        </>
      )}
      {(selected || isHovered) && (
        <mesh>
          <sphereGeometry args={[size * 1.26, 28, 28]} />
          <meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered ? 0.20 : 0.11} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      {(showLabel || isHovered || selected) && (
        <Html distanceFactor={10} zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}>
            <span className="obs-label-dot" style={{ background: cfg.baseColor, boxShadow: `0 0 10px ${cfg.baseColor}` }} />
            <span className="obs-label-name">{p.name}{p.retro ? ' ℞' : ''}</span>
            {isHovered && <span className="obs-label-hint"> · Bodies → {p.id} {selected ? 'selected' : ''}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Earth surface detail markers (quakes, EONET, cities, winds, AC, ISS, missions) attached to Earth helio pos
function EarthDetail({ earthPos, earthSize, layers, chart }: { earthPos: [number, number, number]; earthSize: number; layers: any; chart: any }) {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([]);
  const [eonet, setEonet] = useState<EonetEvent[]>([]);
  const [winds, setWinds] = useState<WindSample[]>([]);
  const [iss, setIss] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (layers.earthquakes) fetchEarthquakes().then(setQuakes).catch(() => {});
    else setQuakes([]);
  }, [layers.earthquakes]);

  useEffect(() => {
    if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) fetchEonet().then(setEonet).catch(() => {});
    else setEonet([]);
  }, [layers.eonet, layers.storms, layers.wildfires, layers.volcanoes]);

  useEffect(() => {
    if (!layers.winds) { setWinds([]); return; }
    let cancelled = false;
    fetchRealWindGrid()
      .then((r) => { if (!cancelled) setWinds(r.length > 4 ? r : []); })
      .catch(async () => {
        const g = await fetchGlobalWindGrid();
        if (!cancelled) setWinds(g);
      });
    return () => { cancelled = true; };
  }, [layers.winds]);

  useEffect(() => {
    if (!layers.satellites) return;
    let id: any = null;
    const tick = async () => {
      try {
        const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!r.ok) throw new Error();
        const j = (await r.json()) as any;
        setIss({ lat: Number(j.latitude), lon: Number(j.longitude) });
      } catch {
        const t = Date.now() / 1000;
        setIss({ lat: 51.6 * Math.sin(t * 0.001), lon: ((t * 0.06) % 360) - 180 });
      }
    };
    tick();
    id = setInterval(tick, 5000);
    return () => { if (id) clearInterval(id); };
  }, [layers.satellites]);

  const acLines = useMemo(() => {
    if (!layers.astroCartography) return [];
    try {
      const planets = chart.planets.filter((p: any) => p.id !== 'Earth' && p.id !== 'Sun');
      const jd = jdFromDate(chart.time);
      return computeACLines(jd, planets).slice(0, 70);
    } catch { return []; }
  }, [chart, layers.astroCartography]);

  const earthR = earthSize;

  return (
    <group position={earthPos}>
      {/* Quakes */}
      {layers.earthquakes && quakes.slice(0, 160).map((q) => {
        const pos = latLonToVector3(q.lat, q.lon, earthR * 1.022);
        const mag = q.mag ?? 0;
        const col = mag > 5.5 ? '#ef4444' : mag > 4.2 ? '#f97316' : '#eab308';
        return (
          <group key={`q-${q.id}`} position={[pos.x, pos.y, pos.z]}>
            <mesh>
              <sphereGeometry args={[0.012 + mag * 0.005, 8, 8]} />
              <meshBasicMaterial color={col} transparent opacity={0.92} />
            </mesh>
            {mag > 5 && (
              <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
                <div className="obs-earth-pin" style={{ background: col }}>M{mag.toFixed(1)}</div>
              </Html>
            )}
          </group>
        );
      })}

      {/* EONET disasters */}
      {(layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) && eonet.slice(0, 140).map((ev) => {
        const pos = latLonToVector3(ev.lat, ev.lon, earthR * 1.028);
        const cat = ev.category.toLowerCase();
        let show = true;
        if (cat.includes('storm') && !layers.storms && !layers.eonet) show = false;
        if (cat.includes('fire') && !layers.wildfires && !layers.eonet) show = false;
        if (cat.includes('volcano') && !layers.volcanoes && !layers.eonet) show = false;
        if (!show) return null;
        const col = /storm/.test(cat) ? '#22d3ee' : /fire/.test(cat) ? '#fb923c' : /volcano/.test(cat) ? '#ef4444' : /sea|ice/.test(cat) ? '#38bdf8' : '#a3e635';
        return (
          <group key={`e-${ev.id}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><sphereGeometry args={[0.011, 8, 8]} /><meshBasicMaterial color={col} transparent opacity={0.9} /></mesh>
            <mesh scale={[1.6, 1.6, 1.6]}><sphereGeometry args={[0.011, 8, 8]} /><meshBasicMaterial color={col} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
          </group>
        );
      })}

      {/* Cities */}
      {layers.cities && MAJOR_CITIES.slice(0, 110).map((c) => {
        const pos = latLonToVector3(c.lat, c.lon, earthR * 1.012);
        return (
          <group key={`city-${c.name}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><sphereGeometry args={[0.0055, 6, 6]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.72} /></mesh>
            <Html distanceFactor={7} style={{ pointerEvents: 'none' }}><div className="obs-city-label">{c.name}</div></Html>
          </group>
        );
      })}

      {/* Winds real */}
      {layers.winds && winds.slice(0, 96).map((w, i) => {
        const p1 = latLonToVector3(w.lat, w.lon, earthR * 1.032);
        const speed = Math.sqrt(w.u * w.u + w.v * w.v);
        const bearing = Math.atan2(w.u, w.v);
        const len = Math.min(2.2, speed * 0.08 + 0.15);
        const p2 = latLonToVector3(w.lat + Math.cos(bearing) * len, w.lon + Math.sin(bearing) * len, earthR * 1.032);
        return <Line key={`wind-${i}`} points={[[p1.x, p1.y, p1.z] as any, [p2.x, p2.y, p2.z] as any]} color={speed > 12 ? '#22d3ee' : speed > 7 ? '#7dd3fc' : '#ffffff'} transparent opacity={0.56} lineWidth={speed > 12 ? 1.6 : 1} />;
      })}

      {/* Astro-cartography lines on Earth surface */}
      {layers.astroCartography && acLines.map((line: any, idx: number) => {
        const pts = line.points.map((p: any) => {
          const v = latLonToVector3(p.lat, p.lon, earthR * 1.018);
          return [v.x, v.y, v.z] as [number, number, number];
        }).filter((v: any) => v);
        if (pts.length < 2) return null;
        return <Line key={`ac-${line.id}-${idx}`} points={pts} color={line.bodyColor || '#38bdf8'} transparent opacity={line.type === 'MC' || line.type === 'IC' ? 0.92 : 0.58} lineWidth={line.type === 'MC' ? 1.8 : 1} />;
      })}

      {/* ISS live */}
      {layers.satellites && iss && (() => {
        const pos = latLonToVector3(iss.lat, iss.lon, earthR * 1.14);
        return (
          <group position={[pos.x, pos.y, pos.z]}>
            <mesh><sphereGeometry args={[0.022, 14, 14]} /><meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.9} /></mesh>
            <mesh scale={[1.4, 1.4, 1.4]}><sphereGeometry args={[0.022, 12, 12]} /><meshBasicMaterial color="#a3e635" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <Html distanceFactor={5} style={{ pointerEvents: 'none' }}><div className="obs-label obs-label--planet"><span className="obs-label-dot" style={{ background: '#a3e635' }} />ISS · Layers → Satellites</div></Html>
          </group>
        );
      })()}

      {/* Missions LEO */}
      {layers.missions && MISSIONS.filter((m: any) => m.domain === 'earth').slice(0, 16).map((m: any, i: number) => {
        const ang = (i / 16) * Math.PI * 2 + Date.now() * 0.00012 * (1 + i * 0.05);
        const r = earthR * (1.22 + (i % 4) * 0.12);
        const incl = (m as any).inclination ? (m as any).inclination * Math.PI / 180 : 0.3;
        const pos = new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * Math.sin(incl) * r + Math.cos(incl) * r * 0.15 * Math.sin(ang * 1.3), Math.sin(ang) * r);
        return (
          <group key={`m-${m.id}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><octahedronGeometry args={[0.016, 0]} /><meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.7} /></mesh>
          </group>
        );
      })}

      {/* Traffic hint pulses near major cities when wind disabled */}
      {layers.traffic && MAJOR_CITIES.slice(0, 24).map((c) => {
        const pos = latLonToVector3(c.lat, c.lon, earthR * 1.015);
        return (
          <group key={`traffic-${c.name}`} position={[pos.x, pos.y, pos.z]}>
            <mesh><ringGeometry args={[0.018, 0.028, 16]} /><meshBasicMaterial color="#f472b6" transparent opacity={0.32} side={THREE.DoubleSide} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, isHovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; isHovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(() => {
    try {
      return orbitRingPoints(planetId, date, 180, swiss, zodiac, ayanamsaId).map((p: any) => [p.x, p.y, p.z] as [number, number, number]);
    } catch { return []; }
  }, [planetId, date, zodiac, ayanamsaId, swiss]);
  if (pts.length < 2) return null;
  const isEarth = planetId === 'Earth';
  return (
    <group onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}>
      <Line points={pts} color={isHovered ? '#e2e8f0' : isEarth ? '#38bdf8' : '#1d2c4e'} transparent opacity={isHovered ? 1 : isEarth ? 0.92 : 0.24} lineWidth={isHovered ? 2.4 : isEarth ? 1.5 : 0.7} />
    </group>
  );
}

function AspectLines({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers } = useObservatory();
  const map = useMemo(() => new Map(chart.planets.map((p: any) => [p.id, p])), [chart.planets]);
  if (!layers.aspects) return null;
  const aspects = chart.aspects.slice(0, 110);
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
              color={isHover ? '#ffffff' : hit.color || '#38bdf8'}
              transparent
              opacity={isHover ? 1 : 0.38}
              lineWidth={isHover ? 3 : 1}
              // @ts-ignore drei Line onPointerOver
              onPointerOver={(e: any) => { e.stopPropagation(); setHoveredId(id); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
            />
            {isHover && (
              <Html position={[(a.helio.x + b.helio.x) / 2, (a.helio.y + b.helio.y) / 2 + 0.35, (a.helio.z + b.helio.z) / 2]} style={{ pointerEvents: 'none' }}>
                <div className="obs-tooltip obs-tooltip--aspect">
                  <div className="obs-tooltip-hd" style={{ borderColor: hit.color }}>{hit.label}</div>
                  <div>Δ {hit.delta.toFixed(2)}° · Toggle: Aspects → {hit.aspect} {(hit.enabled === false) ? 'disabled' : 'enabled'}</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function ConstellationLines({ radius = 110 }: { radius?: number }) {
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
  return (
    <group>
      {lines.map((l) => (
        <Line key={l.id} points={l.pts} color="#7dd3fc" transparent opacity={0.28} lineWidth={0.9} />
      ))}
    </group>
  );
}

// Camera fly controller - listens to window custom events
function CameraFlyController({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const { camera } = useThree();
  const flying = useRef<null | { startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; start: number; dur: number }>(null);

  useEffect(() => {
    const onEarth = () => {
      const chart = (window as any).__OBS_CHART__;
      const earthH = chart?.planets?.find((p: any) => p.id === 'Earth')?.helio;
      const ep = earthH ? new THREE.Vector3(earthH.x, earthH.y, earthH.z) : new THREE.Vector3(10.5, 0, 0);
      const curPos = camera.position.clone();
      const curTarget = controlsRef.current?.target?.clone() ?? new THREE.Vector3(0, 0, 0);
      flying.current = { startPos: curPos, endPos: ep.clone().add(new THREE.Vector3(0, 1.6, 2.6)), startTarget: curTarget, endTarget: ep.clone(), start: performance.now(), dur: 1800 };
    };
    const onSolar = () => {
      const curPos = camera.position.clone();
      const curTarget = controlsRef.current?.target?.clone() ?? new THREE.Vector3(0, 0, 0);
      flying.current = { startPos: curPos, endPos: new THREE.Vector3(0, 22, 42), startTarget: curTarget, endTarget: new THREE.Vector3(0, 0, 0), start: performance.now(), dur: 1800 };
    };
    window.addEventListener('obs-flyto-earth', onEarth as any);
    window.addEventListener('obs-flyto-solar', onSolar as any);
    return () => { window.removeEventListener('obs-flyto-earth', onEarth as any); window.removeEventListener('obs-flyto-solar', onSolar as any); };
  }, [camera, controlsRef]);

  useFrame(() => {
    if (!flying.current) return;
    const f = flying.current;
    const t = Math.min(1, (performance.now() - f.start) / f.dur);
    // smooth cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(f.startPos, f.endPos, ease);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(f.startTarget, f.endTarget, ease);
      controlsRef.current.update();
    }
    if (t >= 1) flying.current = null;
  });
  return null;
}

function UnifiedScene() {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId, enabledBodies } = useObservatory() as any;
  const swissRef = useRef<any>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    import('../lib/swissEngine').then((m) => m.getSwiss().then((s) => (swissRef.current = s)).catch(() => {}));
    (window as any).__OBS_CHART__ = chart;
  }, [chart]);

  useEffect(() => { (window as any).__OBS_CHART__ = chart; }, [chart]);

  const earth = chart.planets.find((p: PlanetPosition) => p.id === 'Earth');
  const earthPos: [number, number, number] = earth ? [earth.helio.x, earth.helio.y, earth.helio.z] : [10.5, 0, 0];
  const earthSize = 0.68;

  const bodies = useMemo(() => chart.planets.filter(
    (p: PlanetPosition) => (enabledBodies as any)[p.id] !== false && (SOLAR_BODIES.includes(p.id as any) || p.id === 'Sun' || ['Moon', 'Chiron', 'Eris', 'Haumea', 'Makemake', 'Sedna', 'Quaoar', 'Orcus', 'Ixion', 'Varuna', 'Ceres', 'Vesta', 'Pallas', 'Juno', 'Pholus', 'Cupido', 'Hades', 'Zeus', 'Kronos', 'Apollon', 'Admetos', 'Vulcanus', 'Poseidon', 'Isis', 'WhiteMoon', 'Proserpina', 'Vulcan', 'MeanNode', 'TrueNode', 'SouthNode', 'MeanLilith', 'TrueLilith', 'Priapus', 'Vertex', 'EastPoint'].includes(p.id)),
  ), [chart.planets, enabledBodies]);

  const earthTextures = useMemo(() => {
    if (typeof document === 'undefined') return undefined;
    try { return { base: earthBaseTexture(), clouds: cloudTexture(), lights: cityLightsTexture() }; } catch { return undefined; }
  }, []);

  return (
    <>
      <color attach="background" args={['#02040c']} />
      <fog attach="fog" args={['#02040c', 28, 140]} />
      <ambientLight intensity={0.52} />
      <pointLight position={[0, 0, 0]} intensity={4.2} distance={180} decay={1.4} color="#fff4d0" />
      <directionalLight position={[12, 18, 10]} intensity={0.42} color="#cfe8ff" />
      <Stars radius={320} depth={120} count={14000} factor={7} saturation={0} fade speed={0.18} />
      <ConstellationLines radius={115} />

      {/* Sun at origin - ultimate Gargantua style */}
      {bodies.filter((p: PlanetPosition) => p.id === 'Sun').map((p: PlanetPosition) => (
        <PlanetBody key="Sun" p={{ ...p, helio: { x: 0, y: 0, z: 0 } } as any} selected={selectedPlanet === p.id} isHovered={hoveredPlanet === p.id} onSelect={() => setSelectedPlanet(p.id as any)} onHover={(v) => setHoveredPlanet(v ? p.id : null)} showLabel={layers.labels} />
      ))}

      {/* Orbit trails */}
      {layers.orbits && SOLAR_BODIES.filter((id) => id !== 'Earth').map((id: any) => (
        <OrbitRing key={`orb-${id}`} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit === id} onHover={(v) => setHoveredOrbit(v ? id : null)} />
      ))}
      {earth && layers.orbits && <OrbitRing planetId={'Earth' as any} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} isHovered={hoveredOrbit === 'Earth'} onHover={(v) => setHoveredOrbit(v ? 'Earth' : null)} />}

      {/* Planets */}
      {layers.planets && bodies.filter((p: PlanetPosition) => p.id !== 'Sun').map((p: PlanetPosition) => (
        <PlanetBody
          key={p.id}
          p={p}
          selected={selectedPlanet === p.id}
          isHovered={hoveredPlanet === p.id}
          onSelect={() => setSelectedPlanet(p.id)}
          onHover={(v) => setHoveredPlanet(v ? p.id : null)}
          showLabel={layers.labels}
          earthTextures={p.id === 'Earth' ? earthTextures : undefined}
        />
      ))}

      {/* Earth detail layer - Google-Earth grade */}
      {earth && <EarthDetail earthPos={earthPos} earthSize={earthSize} layers={layers} chart={chart} />}

      {/* Aspect web */}
      <AspectLines hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />

      {/* Ecliptic disc subtle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[58, 64]} />
        <meshBasicMaterial color="#0a1220" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <gridHelper args={[120, 24, 0x1a2a44, 0x101a2a]} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        minDistance={0.92}
        maxDistance={160}
        enableDamping
        dampingFactor={0.082}
        rotateSpeed={0.52}
        zoomSpeed={0.95}
        panSpeed={0.62}
      />
      <CameraFlyController controlsRef={controlsRef} />
    </>
  );
}

export function UnifiedWorld() {
  const { chart } = useObservatory();
  const [mode, setMode] = useState<'solar' | 'earth'>('solar');

  return (
    <div className="obs-unified-world">
      <Canvas camera={{ position: [0, 22, 42], fov: 46 }} dpr={[1, 1.9]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true }} shadows={false}>
        <Suspense fallback={null}>
          <UnifiedScene />
        </Suspense>
      </Canvas>

      <div className="obs-world-ui">
        <button
          type="button"
          className={`obs-pill obs-pill--action ${mode === 'earth' ? 'is-active' : ''}`}
          onClick={() => {
            setMode('earth');
            window.dispatchEvent(new CustomEvent('obs-flyto-earth'));
          }}
        >
          🌍 Focus Earth — Google-Earth grade
        </button>
        <button
          type="button"
          className={`obs-pill obs-pill--action ${mode === 'solar' ? 'is-active' : ''}`}
          onClick={() => {
            setMode('solar');
            window.dispatchEvent(new CustomEvent('obs-flyto-solar'));
          }}
        >
          ☀️ Solar overview
        </button>
        <span className="obs-pill obs-pill--stats">
          Earth + {chart.planets.length} 3D planets · {chart.aspects.length} aspects · satellites · quakes · EONET · winds · AC · cities — one world
        </span>
      </div>

      <div className="obs-world-hint">
        One unified 3D world · Drag orbit · Scroll zoom · Click planet · Earth surface = Google-Earth detail with satellites/weather · Hover for toggle refs · Reactive to zodiac/houses/ayanamsa/chart
      </div>
    </div>
  );
}
