import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

export function LightShafts() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  const { specs, geo, material } = useMemo(() => {
    const rand = (s: number) => {
      let n = s;
      return () => { n = (n * 1664525 + 1013904223) & 0xffffffff; return (n >>> 0) / 0xffffffff; };
    };
    const r = rand(42);
    const specs = Array.from({ length: 28 }, (_, i) => ({
      x:      (r() - 0.5) * 70,
      y:      9 + r() * 9,
      z:      20 - i * 8,
      height: 18 + r() * 16,
      radius: 0.05 + r() * 0.22,
      rotY:   r() * Math.PI,
    }));

    // Unit cylinder (top=1, bottom=1, height=1) — per-instance scale shapes
    // the cone taper and height. This lets all 28 shafts share one geometry.
    const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);

    const material = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#2ad0c8'),
      transparent: true,
      opacity:     0.032,
      side:        THREE.DoubleSide,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    return { specs, geo, material };
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    specs.forEach((s, i) => {
      dummy.position.set(s.x, s.y - s.height / 2, s.z);
      dummy.rotation.set(0, s.rotY, 0);
      // Top radius = s.radius * 0.15, bottom radius = s.radius * 3.5
      // Unit cylinder has r=1, so scale X/Z by the bottom radius and let
      // the taper come from the per-instance top:bottom ratio.
      // Since InstancedMesh can't do per-instance top/bottom, we approximate
      // by scaling to the average radius — visually near-identical at 0.032 opacity.
      dummy.scale.set(s.radius * 1.8, s.height, s.radius * 1.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [specs, dummy]);

  useEffect(() => () => { geo.dispose(); material.dispose(); }, [geo, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, material, specs.length]}
      frustumCulled={false}
    />
  );
}
