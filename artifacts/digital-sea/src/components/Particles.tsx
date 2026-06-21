import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
}

export function Particles({ count = 3000 }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22 + 4;
      positions[i * 3 + 2] = 28 - Math.random() * 220;
      velocities[i] = 0.003 + Math.random() * 0.009;
    }
    return { positions, velocities };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#bdeff2'),
    size: 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.50,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(({ camera }) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const camX = camera.position.x;
    const camY = camera.position.y;
    const camZ = camera.position.z;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= velocities[i];
      arr[i * 3 + 2] += velocities[i] * 0.30;

      // Respawn relative to camera so particles are always in the visible volume
      // even when the user flies far from the starting position in explore mode.
      if (arr[i * 3 + 1] < camY - 14 || arr[i * 3 + 2] > camZ + 8) {
        arr[i * 3 + 0] = camX + (Math.random() - 0.5) * 60;
        arr[i * 3 + 1] = camY + 14 + Math.random() * 8;
        arr[i * 3 + 2] = camZ - Math.random() * 200;
      }
    }
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}
