import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef, Suspense, useState } from 'react';
import * as THREE from 'three';
import { orbitRingPoints } from '../lib/ephemeris';
import { SOLAR_BODIES, type PlanetPosition, type AspectHit } from '../lib/types';
import { useObservatory } from '../state/ObservatoryContext';
import { getPlanetConfig, earthBaseTexture, cloudTexture, gasGiantTexture, cityLightsTexture } from '../lib/planetModels';
import { AtmosphereGlow, SunCorona, RingGlow, CloudLayer, CityLightsLayer, Aurora } from '../lib/planetShaders';

function PlanetBody({
  p,
  selected,
  onSelect,
  showLabel,
  isHovered,
  onHover,
}: {
  p: PlanetPosition;
  selected: boolean;
  onSelect: () => void;
  showLabel: boolean;
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const cfg = getPlanetConfig(p.id);
  const size =
    p.id === 'Sun' ? 0.58
      : p.id === 'Jupiter' ? 0.32
        : p.id === 'Saturn' ? 0.28
          : p.id === 'Earth' ? 0.16
            : p.id === 'Neptune' || p.id === 'Uranus' ? 0.20
              : ['Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna'].includes(p.id) ? 0.09
                : p.id === 'Chiron' ? 0.08
                  : 0.12;

  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null as any;
    try {
      if (p.id === 'Earth') {
        return { base: earthBaseTexture(), clouds: cloudTexture(), lights: cityLightsTexture() };
      }
      if (['Jupiter','Saturn','Uranus','Neptune','Venus','Mars'].includes(p.id)) {
        return { base: gasGiantTexture(cfg.baseColor, p.id === 'Jupiter' ? 7 : p.id === 'Saturn' ? 5 : 3) };
      }
      return null;
    } catch { return null; }
  }, [p.id, cfg.baseColor]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * (cfg.rotationSpeed ?? 0.12);
    }
  });

  const scale: [number, number, number] = p.id === 'Haumea' ? [1.7, 0.8, 0.9] : [1, 1, 1];

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <group ref={groupRef} scale={scale}>
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
            emissiveIntensity={p.id === 'Sun' ? 1.15 : selected || isHovered ? 0.42 : 0}
            roughness={cfg.roughness ?? 0.75}
            metalness={cfg.metalness ?? 0.08}
          />
        </mesh>
        {cfg.hasClouds && textures?.clouds && <CloudLayer size={size} texture={textures.clouds} speed={p.id === 'Earth' ? 0.14 : p.id === 'Jupiter' ? 0.38 : 0.08} />}
        {cfg.hasCityLights && textures?.lights && <CityLightsLayer size={size} texture={textures.lights} />}
        {cfg.hasAurora && <Aurora size={size} color={p.id === 'Earth' ? '#22d3ee' : '#a78bfa'} />}
      </group>

      {cfg.atmosphereColor && <AtmosphereGlow size={size} color={cfg.atmosphereColor} strength={isHovered ? (cfg.atmosphereStrength ?? 0.6) * 1.6 : (cfg.atmosphereStrength ?? 0.6)} power={p.id === 'Sun' ? 1.4 : 2.4} />}
      {p.id === 'Sun' && <SunCorona size={size} />}
      {cfg.hasRings && (
        <>
          <mesh rotation={[Math.PI / 2.55, 0, 0.15]}>
            <ringGeometry args={[size * 1.35, size * 2.35, 96]} />
            <meshBasicMaterial color={cfg.ringColor ?? '#fde68a'} transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
          <RingGlow inner={size * 1.35} outer={size * 2.35} color={cfg.ringColor ?? '#fde68a'} />
        </>
      )}
      {(selected || isHovered) && (
        <mesh>
          <sphereGeometry args={[size * 1.28, 24, 24]} />
          <meshBasicMaterial color={cfg.baseColor} transparent opacity={isHovered ? 0.18 : 0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      {(showLabel || isHovered) && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className={`obs-label obs-label--planet ${isHovered ? 'is-hover' : ''} ${selected ? 'is-active' : ''}`}>
            <span className="obs-label-dot" style={{ background: cfg.baseColor }} />
            {p.name}{p.retro ? ' ℞' : ''} {isHovered ? `· ${cfg.id} toggle → Bodies panel (${cfg.id} ${p.group ?? ''})` : ''}
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss, hovered, onHover }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any; hovered: boolean; onHover: (v: boolean) => void }) {
  const pts = useMemo(
    () => orbitRingPoints(planetId, date, 160, swiss, zodiac, ayanamsaId).map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [planetId, date, zodiac, ayanamsaId, swiss],
  );
  if (pts.length < 2) return null;
  const isEarth = planetId === 'Earth';
  return (
    <group onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}>
      <Line points={pts} color={isEarth ? '#38bdf8' : hovered ? '#e2e8f0' : '#25324a'} transparent opacity={hovered ? 0.95 : isEarth ? 0.9 : 0.28} lineWidth={hovered ? 2.2 : isEarth ? 1.6 : 0.8} />
    </group>
  );
}

function AspectLines3D({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const { chart, layers, enabledAspects } = useObservatory();
  const map = useMemo(() => new Map(chart.planets.map((p) => [p.id, p])), [chart.planets]);
  if (!layers.aspects) return null;
  // Limit to 80 strongest to keep hoverable performance
  const aspects = chart.aspects.slice(0, 80);

  return (
    <group>
      {aspects.map((hit, i) => {
        const a = map.get(hit.a as any);
        const b = map.get(hit.b as any);
        if (!a || !b) return null;
        const pts: [number, number, number][] = [
          [a.helio.x, a.helio.y, a.helio.z],
          [b.helio.x, b.helio.y, b.helio.z],
        ];
        const id = `${hit.a}-${hit.aspect}-${hit.b}-${i}`;
        const isHover = hoveredId === id;
        const enabled = (enabledAspects as any)[hit.aspect] !== false;
        return (
          <group key={id}>
            <Line
              points={pts}
              color={isHover ? '#ffffff' : hit.color}
              transparent
              opacity={isHover ? 1 : 0.55}
              lineWidth={isHover ? 3 : 1.2}
              onPointerOver={(e: any) => { e.stopPropagation(); setHoveredId(id); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
            />
            {isHover && (
              <Html position={[(a.helio.x + b.helio.x) / 2, (a.helio.y + b.helio.y) / 2 + 0.25, (a.helio.z + b.helio.z) / 2]} style={{ pointerEvents: 'none' }}>
                <div className="obs-tooltip obs-tooltip--aspect">
                  <div className="obs-tooltip-hd" style={{ borderColor: hit.color }}>{hit.label}</div>
                  <div>Angle {hit.angle}° · Δ {hit.delta.toFixed(2)}°</div>
                  <div>Toggle: Aspects panel → {hit.aspect} [{(hit as any).aspect ? '' : ''} {enabled ? 'enabled' : 'disabled'}]</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function SolarScene() {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId } = useObservatory() as any;
  const swissRef = useRef<any>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<string | null>(null);

  useMemo(() => {
    import('../lib/swissEngine').then((m) => m.getSwiss().then((s) => (swissRef.current = s)).catch(() => {}));
  }, []);

  const bodies = chart.planets.filter(
    (p: PlanetPosition) => SOLAR_BODIES.includes(p.id as any) || p.id === 'Sun' || p.id === 'Moon' || ['Chiron','Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna','Ceres','Vesta','Pallas','Juno'].includes(p.id),
  );

  const rot = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (rot.current && layers.orbits) rot.current.rotation.y += dt * 0.0022;
  });

  return (
    <>
      <color attach="background" args={['#04060a']} />
      <fog attach="fog" args={['#04060a', 22, 110]} />
      <ambientLight intensity={0.42} />
      <pointLight position={[0, 0, 0]} intensity={3.4} distance={130} decay={1.6} />
      <directionalLight position={[6, 10, 5]} intensity={0.38} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[28, 64]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <Stars radius={200} depth={90} count={9000} factor={5} saturation={0} fade speed={0.3} />
      <gridHelper args={[70, 14, '#1e293b', '#0f172a']} position={[0, -0.05, 0]} />
      <group ref={rot}>
        {layers.orbits && SOLAR_BODIES.map((id: any) => (
          <OrbitRing key={id} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} hovered={hoveredOrbit===id} onHover={(v)=> setHoveredOrbit(v?id:null)} />
        ))}
        {layers.planets && bodies.map((p: PlanetPosition) => (
          <Suspense key={p.id} fallback={null}>
            <PlanetBody
              p={p}
              selected={selectedPlanet === p.id}
              onSelect={() => setSelectedPlanet(p.id)}
              showLabel={layers.labels}
              isHovered={hoveredPlanet===p.id}
              onHover={(v)=> setHoveredPlanet(v ? p.id : null)}
            />
          </Suspense>
        ))}
        <AspectLines3D hoveredId={hoveredAspect} setHoveredId={setHoveredAspect} />
      </group>
      <OrbitControls enablePan={false} makeDefault minDistance={2} maxDistance={78} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.14} rotateSpeed={0.6} zoomSpeed={0.9} />
    </>
  );
}

export function SolarSystemMode() {
  return (
    <div className="obs-canvas-host obs-canvas-host--solar">
      <Canvas camera={{ position: [0, 10, 20], fov: 46 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
        <SolarScene />
      </Canvas>
      <div className="obs-solar-legend">
        <span>Hover: planets highlight + body toggle ref · orbits highlight · aspect lines highlight with aspect toggle ref — lightweight shader models (512px canvas, Fresnel glow, corona, rings)</span>
      </div>
    </div>
  );
}
