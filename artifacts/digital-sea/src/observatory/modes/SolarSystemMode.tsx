import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { orbitRingPoints } from '../lib/ephemeris';
import { SOLAR_BODIES, type PlanetPosition } from '../lib/types';
import { useObservatory } from '../state/ObservatoryContext';

function PlanetBody({
  p,
  selected,
  onSelect,
  showLabel,
}: {
  p: PlanetPosition;
  selected: boolean;
  onSelect: () => void;
  showLabel: boolean;
}) {
  const size =
    p.id === 'Sun' ? 0.55
      : p.id === 'Jupiter' ? 0.28
        : p.id === 'Saturn' ? 0.24
          : p.id === 'Earth' ? 0.14
            : p.id === 'Neptune' || p.id === 'Uranus' ? 0.18
              : p.id === 'Eris' || p.id === 'Haumea' || p.id === 'Makemake' ? 0.09
                : p.id === 'Chiron' ? 0.08
                  : 0.11;

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={p.color}
          emissive={p.id === 'Sun' ? p.color : selected ? p.color : '#000'}
          emissiveIntensity={p.id === 'Sun' ? 1.2 : selected ? 0.35 : 0}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      {p.id === 'Saturn' && (
        <mesh rotation={[Math.PI / 2.6, 0, 0.2]}>
          <ringGeometry args={[size * 1.3, size * 2.1, 64]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      {showLabel && (
        <Html distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div className="obs-label">{p.name}{p.retro ? ' ℞' : ''}</div>
        </Html>
      )}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any }) {
  const pts = useMemo(
    () => orbitRingPoints(planetId, date, 128, swiss, zodiac, ayanamsaId).map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [planetId, date, zodiac, ayanamsaId, swiss],
  );
  if (pts.length < 2) return null;
  return <Line points={pts} color={planetId === 'Earth' ? '#38bdf8' : '#334155'} transparent opacity={planetId === 'Earth' ? 0.75 : 0.45} lineWidth={1} />;
}

function SolarScene() {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId, swissReady } = useObservatory() as any;
  // Pull swiss instance lazily — orbitRingPoints will still work without it
  const swissRef = useRef<any>(null);
  useMemo(() => {
    import('../lib/swissEngine').then((m) => m.getSwiss().then((s) => (swissRef.current = s)).catch(() => {}));
  }, []);

  const bodies = chart.planets.filter(
    (p: PlanetPosition) => SOLAR_BODIES.includes(p.id as any) || p.id === 'Sun' || p.id === 'Moon' || p.id === 'Chiron' || p.id === 'Earth' || ['Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna'].includes(p.id),
  );

  const group = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.005;
  });

  return (
    <>
      <color attach="background" args={['#04060a']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={2.4} distance={80} decay={2} />
      <Stars radius={120} depth={50} count={5000} factor={3} saturation={0} fade speed={0.4} />
      <group ref={group}>
        {layers.orbits &&
          SOLAR_BODIES.map((id: any) => <OrbitRing key={id} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} />)}
        {layers.planets &&
          bodies.map((p: PlanetPosition) => (
            <PlanetBody
              key={p.id}
              p={p}
              selected={selectedPlanet === p.id}
              onSelect={() => setSelectedPlanet(p.id)}
              showLabel={layers.labels}
            />
          ))}
      </group>
      <OrbitControls enablePan makeDefault minDistance={1.2} maxDistance={80} />
    </>
  );
}

export function SolarSystemMode() {
  const { chart, zodiac, ayanamsaId, chartType, heliocentric } = useObservatory();
  return (
    <div className="obs-canvas-host">
      <div className="obs-3d-note">
        3D positions reactive to toggles — zodiac={zodiac} ayan={ayanamsaId} type={chartType} helio={heliocentric ? 'yes' : 'no'} engine={chart.engine} {chart.ayanamsa.toFixed(3)}°
      </div>
      <Canvas camera={{ position: [0, 8, 16], fov: 50 }} dpr={[1, 1.75]}>
        <SolarScene />
      </Canvas>
    </div>
  );
}
