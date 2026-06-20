import { useMemo } from 'react';
import * as THREE from 'three';

export function LightShafts() {
  const shafts = useMemo(() => {
    const rand = (s: number) => {
      let n = s;
      return () => { n = (n * 1664525 + 1013904223) & 0xffffffff; return (n >>> 0) / 0xffffffff; };
    };
    const r = rand(42);
    // Many more shafts, scattered widely across the full world volume
    return Array.from({ length: 28 }, (_, i) => ({
      x: (r() - 0.5) * 70,
      y: 9 + r() * 9,
      z: 20 - i * 8,
      height: 18 + r() * 16,
      radius: 0.05 + r() * 0.22,
      rotY: r() * Math.PI,
    }));
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#2ad0c8'),
    transparent: true,
    opacity: 0.032,
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
          <cylinderGeometry args={[s.radius * 0.15, s.radius * 3.5, s.height, 6, 1, true]} />
        </mesh>
      ))}
    </>
  );
}
