import { useRef, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { curve } from '../../data/path';
import { nodes } from '../../data/nodes';
import type { Mode } from '../../types';

const _pos         = new THREE.Vector3();
const _pathLook    = new THREE.Vector3();
const _nodeLook    = new THREE.Vector3();
const _blendedLook = new THREE.Vector3();
const _camTarget   = new THREE.Vector3();

interface Props {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
}

export function CameraRig({ scrollProgress, mode }: Props) {
  const { camera } = useThree();
  const clock      = useThree((s) => s.clock);
  const smoothT    = useRef(0);
  const prevRawT   = useRef(0);
  const leanX      = useRef(0);
  const smoothLook = useRef(new THREE.Vector3());
  const lookReady  = useRef(false);

  useFrame(() => {
    if (mode === 'camera') return;

    const rawT      = scrollProgress.current;
    const scrollDir = rawT - prevRawT.current;
    prevRawT.current = rawT;

    let maxProx   = 0;
    let nearestMid = rawT;
    let activePos: THREE.Vector3 | null = null;

    for (const node of nodes) {
      const mid       = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.9;
      const prox      = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx    = prox;
        nearestMid = mid;
        activePos  = node.position;
      }
    }

    const isScrollingBackward = scrollDir < -0.0001;
    const pullStrength  = isScrollingBackward ? maxProx * 0.04 : maxProx * 0.12;
    const magneticT     = rawT + (nearestMid - rawT) * pullStrength;

    const lerpSpeed = isScrollingBackward ? 0.08 : (0.045 + (1 - maxProx) * 0.03);
    smoothT.current += (magneticT - smoothT.current) * lerpSpeed;

    const t     = Math.max(0.001, Math.min(0.999, smoothT.current));
    const lookT = Math.min(0.999, t + 0.012);

    curve.getPoint(t,     _pos);
    curve.getPoint(lookT, _pathLook);

    const elapsed = clock.elapsedTime;
    const driftX  = Math.sin(elapsed * 0.13) * 0.09;
    const driftY  = Math.cos(elapsed * 0.09) * 0.06;

    const leanTarget = activePos ? activePos.x * 0.06 * maxProx : 0;
    leanX.current   += (leanTarget - leanX.current) * 0.035;

    _camTarget.set(_pos.x + driftX + leanX.current, _pos.y + driftY, _pos.z);
    camera.position.lerp(_camTarget, 0.055);

    if (activePos && maxProx > 0.05) {
      // Lower exponent (0.4 vs 0.6) + higher ceiling (0.95) → camera turns
      // toward each card earlier and more decisively as proximity rises.
      const blend = Math.pow(maxProx, 0.4) * 0.95;
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

    if (!lookReady.current) {
      smoothLook.current.copy(_blendedLook);
      lookReady.current = true;
    } else {
      // Lerp faster when a card is close so the camera fully centers on it
      // within the (sometimes narrow) proximity window — key for mobile.
      const lookLerp = 0.05 + maxProx * 0.045;
      smoothLook.current.lerp(_blendedLook, lookLerp);
    }

    camera.lookAt(smoothLook.current);
  });

  return null;
}
