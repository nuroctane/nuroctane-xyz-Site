import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MutableRefObject } from 'react';
import { curve } from '../data/path';
import { nodes } from '../data/nodes';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

interface Props {
  scrollProgress: MutableRefObject<number>;
}

export function CameraRig({ scrollProgress }: Props) {
  const { camera } = useThree();
  const clock = useThree((s) => s.clock);
  const smoothT = useRef(0);
  // Track active node x for lateral lean
  const leanX = useRef(0);

  useFrame(() => {
    const rawT = scrollProgress.current;

    // Find nearest node and its pull
    let maxProx = 0;
    let nearestMid = rawT;
    let activeNodeX = 0;
    for (const node of nodes) {
      const mid = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.75;
      const prox = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx = prox;
        nearestMid = mid;
        activeNodeX = node.position.x;
      }
    }

    // Magnetic snap on Z-path toward node midpoint
    const pullStrength = maxProx * 0.38;
    const magneticT = rawT + (nearestMid - rawT) * pullStrength;
    const lerpSpeed = 0.044 + (1 - maxProx) * 0.030;
    smoothT.current += (magneticT - smoothT.current) * lerpSpeed;

    const t = Math.max(0.001, Math.min(0.999, smoothT.current));
    const lookT = Math.min(0.999, t + 0.014);

    curve.getPoint(t, _pos);
    curve.getPoint(lookT, _look);

    // Subtle underwater drift
    const elapsed = clock.elapsedTime;
    const driftX = Math.sin(elapsed * 0.17) * 0.20;
    const driftY = Math.cos(elapsed * 0.11) * 0.12;

    // X-lean toward active card: camera angles toward the node's side
    // Strength rises with proximity, lean is 30% of the node's x offset
    const targetLeanX = activeNodeX * 0.30 * maxProx;
    leanX.current += (targetLeanX - leanX.current) * 0.04;

    _targetPos.set(
      _pos.x + driftX + leanX.current,
      _pos.y + driftY,
      _pos.z,
    );

    camera.position.lerp(_targetPos, 0.058);
    camera.lookAt(
      _look.x + driftX * 0.25 + leanX.current * 0.4,
      _look.y + driftY * 0.25,
      _look.z,
    );
  });

  return null;
}
