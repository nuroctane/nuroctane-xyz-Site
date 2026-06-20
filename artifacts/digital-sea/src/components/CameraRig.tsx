import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MutableRefObject } from 'react';
import { curve } from '../data/path';
import { nodes } from '../data/nodes';

const _pos = new THREE.Vector3();
const _pathLook = new THREE.Vector3();
const _nodeLook = new THREE.Vector3();
const _blendedLook = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

interface Props {
  scrollProgress: MutableRefObject<number>;
}

export function CameraRig({ scrollProgress }: Props) {
  const { camera } = useThree();
  const clock = useThree((s) => s.clock);
  const smoothT = useRef(0);
  const prevRawT = useRef(0);
  const leanX = useRef(0);

  useFrame(() => {
    const rawT = scrollProgress.current;

    // Detect scroll direction — positive = forward, negative = backward
    const scrollDir = rawT - prevRawT.current;
    prevRawT.current = rawT;

    // Find nearest node
    let maxProx = 0;
    let nearestMid = rawT;
    let activePos: THREE.Vector3 | null = null;

    for (const node of nodes) {
      const mid = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.9;
      const prox = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx = prox;
        nearestMid = mid;
        activePos = node.position;
      }
    }

    // Directional magnetic pull: gentle forward snap, minimal backward resistance
    // so scroll-back feels as free as scroll-forward
    const isScrollingBackward = scrollDir < -0.0001;
    const pullStrength = isScrollingBackward ? maxProx * 0.04 : maxProx * 0.20;
    const magneticT = rawT + (nearestMid - rawT) * pullStrength;

    // Faster lerp so camera reacts promptly to direction changes
    const lerpSpeed = isScrollingBackward ? 0.10 : (0.06 + (1 - maxProx) * 0.04);
    smoothT.current += (magneticT - smoothT.current) * lerpSpeed;

    const t = Math.max(0.001, Math.min(0.999, smoothT.current));
    const lookT = Math.min(0.999, t + 0.012);

    curve.getPoint(t, _pos);
    curve.getPoint(lookT, _pathLook);

    const elapsed = clock.elapsedTime;
    const driftX = Math.sin(elapsed * 0.15) * 0.13;
    const driftY = Math.cos(elapsed * 0.10) * 0.09;

    // Small position lean toward active node side
    const leanTarget = activePos ? activePos.x * 0.15 * maxProx : 0;
    leanX.current += (leanTarget - leanX.current) * 0.05;

    _camTarget.set(_pos.x + driftX + leanX.current, _pos.y + driftY, _pos.z);
    camera.position.lerp(_camTarget, 0.07);

    // ── Look-at: blend gaze from path-ahead → active node to center card ───
    if (activePos && maxProx > 0.05) {
      const blend = Math.pow(maxProx, 0.55) * 0.88;
      _nodeLook.set(activePos.x, activePos.y, activePos.z);
      _pathLook.x += driftX * 0.2;
      _pathLook.y += driftY * 0.2;
      _blendedLook.lerpVectors(_pathLook, _nodeLook, blend);
    } else {
      _blendedLook.set(
        _pathLook.x + driftX * 0.2,
        _pathLook.y + driftY * 0.2,
        _pathLook.z,
      );
    }

    camera.lookAt(_blendedLook);
  });

  return null;
}
