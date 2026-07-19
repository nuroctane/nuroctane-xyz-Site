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
      : p.id === 'Jupiter' ? 0.30
        : p.id === 'Saturn' ? 0.26
          : p.id === 'Earth' ? 0.15
            : p.id === 'Neptune' || p.id === 'Uranus' ? 0.19
              : ['Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna'].includes(p.id) ? 0.09
                : p.id === 'Chiron' ? 0.08
                  : 0.11;

  return (
    <group position={[p.helio.x, p.helio.y, p.helio.z]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[size, 40, 40]} />
        <meshStandardMaterial
          color={p.color}
          emissive={p.id === 'Sun' ? p.color : selected ? p.color : '#000'}
          emissiveIntensity={p.id === 'Sun' ? 1.3 : selected ? 0.4 : 0}
          roughness={p.id === 'Sun' ? 1 : 0.35}
          metalness={0.12}
        />
      </mesh>
      {/* Subtle glow */}
      {selected && (
        <mesh>
          <sphereGeometry args={[size * 1.25, 24, 24]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.15} />
        </mesh>
      )}
      {p.id === 'Saturn' && (
        <mesh rotation={[Math.PI / 2.55, 0, 0.15]}>
          <ringGeometry args={[size * 1.35, size * 2.2, 64]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      {showLabel && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="obs-label obs-label--planet">{p.name}{p.retro ? ' ℞' : ''}</div>
        </Html>
      )}
    </group>
  );
}

function OrbitRing({ planetId, date, zodiac, ayanamsaId, swiss }: { planetId: PlanetPosition['id']; date: Date; zodiac: any; ayanamsaId: number; swiss: any }) {
  const pts = useMemo(
    () => orbitRingPoints(planetId, date, 140, swiss, zodiac, ayanamsaId).map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [planetId, date, zodiac, ayanamsaId, swiss],
  );
  if (pts.length < 2) return null;
  const isEarth = planetId === 'Earth';
  return <Line points={pts} color={isEarth ? '#38bdf8' : '#2a3a52'} transparent opacity={isEarth ? 0.85 : 0.32} lineWidth={isEarth ? 1.5 : 0.9} />;
}

function SolarScene() {
  const { chart, layers, selectedPlanet, setSelectedPlanet, time, zodiac, ayanamsaId } = useObservatory() as any;
  const swissRef = useRef<any>(null);
  useMemo(() => {
    import('../lib/swissEngine').then((m) => m.getSwiss().then((s) => (swissRef.current = s)).catch(() => {}));
  }, []);

  const bodies = chart.planets.filter(
    (p: PlanetPosition) => SOLAR_BODIES.includes(p.id as any) || p.id === 'Sun' || p.id === 'Moon' || ['Chiron','Eris','Haumea','Makemake','Sedna','Quaoar','Orcus','Ixion','Varuna','Ceres','Vesta','Pallas','Juno'].includes(p.id),
  );

  const group = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (group.current && layers.orbits) {
      group.current.rotation.y += dt * 0.003;
    }
  });

  return (
    <>
      <color attach="background" args={['#04060a']} />
      <fog attach="fog" args={['#04060a', 18, 90]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={2.6} distance={100} decay={1.8} />
      <directionalLight position={[5, 8, 4]} intensity={0.25} />
      <Stars radius={180} depth={70} count={7000} factor={4} saturation={0} fade speed={0.35} />
      {/* Ecliptic grid subtle */}
      <gridHelper args={[60, 12, '#1e293b', '#0f172a']} position={[0, -0.02, 0]} />
      <group ref={group}>
        {layers.orbits && SOLAR_BODIES.map((id: any) => <OrbitRing key={id} planetId={id} date={time} zodiac={zodiac} ayanamsaId={ayanamsaId} swiss={swissRef.current} />)}
        {layers.planets && bodies.map((p: PlanetPosition) => (
          <PlanetBody key={p.id} p={p} selected={selectedPlanet === p.id} onSelect={() => setSelectedPlanet(p.id)} showLabel={layers.labels} />
        ))}
      </group>
      <OrbitControls enablePan={false} makeDefault minDistance={1.8} maxDistance={70} enableDamping dampingFactor={0.07} autoRotate autoRotateSpeed={0.12} />
    </>
  );
}

export function SolarSystemMode() {
  return (
    <div className="obs-canvas-host obs-canvas-host--solar">
      <Canvas camera={{ position: [0, 9, 18], fov: 48 }} dpr={[1, 1.8]}>
        <SolarScene />
      </Canvas>
    </div>
  );
}
