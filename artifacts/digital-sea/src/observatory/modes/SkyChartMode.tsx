import { Canvas } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { useMemo } from 'react';
import { CONSTELLATIONS } from '../data/constellations';
import type { PlanetPosition } from '../lib/types';
import { degToRad, raDecToVector } from '../lib/math';
import { useObservatory } from '../state/ObservatoryContext';

const SKY_R = 20;
type Pt = [number, number, number];

function ConstellationLayer() {
  const segments = useMemo(() => {
    const out: Pt[][] = [];
    for (const c of CONSTELLATIONS) {
      for (const [a, b] of c.lines) {
        const sa = c.stars[a];
        const sb = c.stars[b];
        if (!sa || !sb) continue;
        const va = raDecToVector(sa.ra, sa.dec);
        const vb = raDecToVector(sb.ra, sb.dec);
        out.push([
          [va.x * SKY_R, va.y * SKY_R, va.z * SKY_R],
          [vb.x * SKY_R, vb.y * SKY_R, vb.z * SKY_R],
        ]);
      }
    }
    return out;
  }, []);

  return (
    <group>
      {segments.map((pts, i) => (
        <Line key={i} points={pts} color="#7dd3fc" transparent opacity={0.45} lineWidth={1} />
      ))}
    </group>
  );
}

function EclipticRing() {
  const pts = useMemo(() => {
    const arr: Pt[] = [];
    for (let i = 0; i <= 128; i++) {
      const lon = (i / 128) * Math.PI * 2;
      const eps = degToRad(23.4392911);
      const x = Math.cos(lon);
      const y = Math.sin(lon) * Math.cos(eps);
      const z = Math.sin(lon) * Math.sin(eps);
      arr.push([x * SKY_R * 0.98, z * SKY_R * 0.98, y * SKY_R * 0.98]);
    }
    return arr;
  }, []);
  return <Line points={pts} color="#fbbf24" transparent opacity={0.35} lineWidth={1} />;
}

function AspectLines({ planets }: { planets: PlanetPosition[] }) {
  const { chart, layers } = useObservatory();
  const segments = useMemo(() => {
    if (!layers.aspects) return [] as { pts: Pt[]; color: string }[];
    const map = new Map(planets.map((p) => [p.id, p]));
    const out: { pts: Pt[]; color: string }[] = [];
    for (const hit of chart.aspects) {
      const a = map.get(hit.a);
      const b = map.get(hit.b);
      if (!a || !b) continue;
      out.push({
        color: hit.color,
        pts: [
          [a.sky.x * SKY_R * 0.92, a.sky.y * SKY_R * 0.92, a.sky.z * SKY_R * 0.92],
          [b.sky.x * SKY_R * 0.92, b.sky.y * SKY_R * 0.92, b.sky.z * SKY_R * 0.92],
        ],
      });
    }
    return out;
  }, [chart.aspects, planets, layers.aspects]);

  if (!layers.aspects) return null;
  return (
    <group>
      {segments.map((s, i) => (
        <Line key={i} points={s.pts} color={s.color} transparent opacity={0.75} lineWidth={1.5} />
      ))}
    </group>
  );
}

function HouseLines() {
  const { chart, layers } = useObservatory();
  const segments = useMemo(() => {
    if (!layers.houses) return [] as Pt[][];
    return chart.houses.map((h) => {
      const lon = degToRad(h.lon);
      const eps = degToRad(23.4392911);
      const x = Math.cos(lon);
      const y = Math.sin(lon) * Math.cos(eps);
      const z = Math.sin(lon) * Math.sin(eps);
      return [
        [0, 0, 0],
        [x * SKY_R * 0.85, z * SKY_R * 0.85, y * SKY_R * 0.85],
      ] as Pt[];
    });
  }, [chart.houses, layers.houses]);

  if (!layers.houses) return null;
  return (
    <group>
      {segments.map((pts, i) => (
        <Line key={i} points={pts} color="#94a3b8" transparent opacity={0.28} lineWidth={1} />
      ))}
    </group>
  );
}

function PlanetMarkers() {
  const { chart, layers, selectedPlanet, setSelectedPlanet, enabledBodies } = useObservatory();
  const planets = chart.planets.filter(
    (p) => enabledBodies[p.id] !== false && p.id !== 'Earth',
  );

  return (
    <group>
      {layers.planets &&
        planets.map((p) => (
          <group
            key={`${p.id}-${p.name}`}
            position={[p.sky.x * SKY_R * 0.9, p.sky.y * SKY_R * 0.9, p.sky.z * SKY_R * 0.9]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlanet(p.id);
            }}
          >
            <mesh>
              <sphereGeometry args={[selectedPlanet === p.id ? 0.38 : 0.26, 16, 16]} />
              <meshBasicMaterial color={p.color} />
            </mesh>
            {layers.labels && (
              <Html distanceFactor={28} style={{ pointerEvents: 'none' }}>
                <div className="obs-label">{p.name}</div>
              </Html>
            )}
          </group>
        ))}
      <AspectLines planets={planets} />
    </group>
  );
}

function SkyScene() {
  const { layers } = useObservatory();
  return (
    <>
      <color attach="background" args={['#04060a']} />
      <ambientLight intensity={0.4} />
      <Stars radius={60} depth={40} count={6000} factor={2.5} saturation={0} fade speed={0.2} />
      {layers.constellations && <ConstellationLayer />}
      {layers.ecliptic && <EclipticRing />}
      <HouseLines />
      <PlanetMarkers />
      <OrbitControls enablePan makeDefault minDistance={4} maxDistance={45} />
    </>
  );
}

export function SkyChartMode() {
  const { zodiac, ayanamsaId, chartType, houseSystem, chart } = useObservatory();
  return (
    <div className="obs-canvas-host">
      <div className="obs-3d-note">
        Sky reactive — zodiac={zodiac} ayan={ayanamsaId} houses={houseSystem} type={chartType} engine={chart.engine} ayan={chart.ayanamsa.toFixed(4)}° · aspect lines colored correlation
      </div>
      <Canvas camera={{ position: [0, 4, 28], fov: 50 }} dpr={[1, 1.75]}>
        <SkyScene />
      </Canvas>
    </div>
  );
}
