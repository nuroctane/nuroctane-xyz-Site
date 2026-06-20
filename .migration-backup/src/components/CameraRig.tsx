import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MutableRefObject } from 'react';
import { curve } from '../data/path';
import { nodes } from '../data/nodes';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

interface Props {
  scrollProgress: MutableRefObject<number>;
}

export function CameraRig({ scrollProgress }: Props) {
  const { camera } = useThree();
  const clock = useThree((s) => s.clock);
  // Smooth camera T — separate from raw scroll so we can add magnetic snap
  const smoothT = useRef(0);

  useFrame(() => {
    const rawT = scrollProgress.current;

    // Find the node we're closest to and compute magnetic pull toward its midpoint
    let maxProx = 0;
    let nearestMid = rawT;
    for (const node of nodes) {
      const mid = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.75;
      const prox = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx = prox;
        nearestMid = mid;
      }
    }

    // Magnetic target: pulls rawT toward node midpoint proportionally to proximity
    // High proximity = camera lingers at node center; user must scroll past to break free
    const pullStrength = maxProx * 0.42;
    const magneticT = rawT + (nearestMid - rawT) * pullStrength;

    // Smooth lerp toward magnetic target (slower = more dwelling at nodes)
    const lerpSpeed = 0.048 + (1 - maxProx) * 0.032;
    smoothT.current += (magneticT - smoothT.current) * lerpSpeed;

    const t = Math.max(0.001, Math.min(0.999, smoothT.current));
    const lookT = Math.min(0.999, t + 0.016);

    curve.getPoint(t, _pos);
    curve.getPoint(lookT, _look);

    // Subtle sinusoidal drift — underwater current
    const elapsed = clock.elapsedTime;
    const driftX = Math.sin(elapsed * 0.17) * 0.22;
    const driftY = Math.cos(elapsed * 0.11) * 0.13;

    camera.position.lerp(
      _pos.clone().add(new THREE.Vector3(driftX, driftY, 0)),
      0.06
    );
    camera.lookAt(
      _look.clone().add(new THREE.Vector3(driftX * 0.3, driftY * 0.3, 0))
    );
  });

  return null;
}
