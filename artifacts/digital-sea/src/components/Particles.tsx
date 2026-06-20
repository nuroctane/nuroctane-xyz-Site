import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
}

export function Particles({ count = 3000 }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const initZ = 25;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18 + 4;
      positions[i * 3 + 2] = initZ - Math.random() * 200;
      velocities[i] = 0.004 + Math.random() * 0.010;
    }
    return { positions, velocities };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#7ec8ff'),
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(({ camera }) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const camZ = camera.position.z;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= velocities[i];
      arr[i * 3 + 2] += velocities[i] * 0.35;

      if (arr[i * 3 + 1] < -12 || arr[i * 3 + 2] > camZ + 6) {
        arr[i * 3 + 0] = (Math.random() - 0.5) * 26;
        arr[i * 3 + 1] = 12 + Math.random() * 6;
        arr[i * 3 + 2] = camZ - Math.random() * 185;
      }
    }
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}
