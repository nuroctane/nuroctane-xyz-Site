import { useMemo } from 'react';
import * as THREE from 'three';

const SHAFT_COUNT = 10;

export function LightShafts() {
  const shafts = useMemo(() => {
    const rand = (s: number) => {
      let n = s;
      return () => { n = (n * 1664525 + 1013904223) & 0xffffffff; return (n >>> 0) / 0xffffffff; };
    };
    const r = rand(42);
    return Array.from({ length: SHAFT_COUNT }, (_, i) => ({
      x: (r() - 0.5) * 20,
      y: 9 + r() * 7,
      z: -18 - i * 18,
      height: 16 + r() * 12,
      radius: 0.06 + r() * 0.18,
      rotY: r() * Math.PI,
    }));
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#3a90e0'),
    transparent: true,
    opacity: 0.035,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  return (
    <>
      {shafts.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.y - s.height / 2, s.z]}
          rotation={[0, s.rotY, 0]}
          material={material}
        >
          <cylinderGeometry args={[s.radius * 0.2, s.radius * 3, s.height, 6, 1, true]} />
        </mesh>
      ))}
    </>
  );
}
