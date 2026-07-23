import { useRef, MutableRefObject, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { curve } from '../../data/path';
import { blogCurve } from '../../data/blogPath';
import { nodes } from '../../data/nodes';
import { blogPosts } from '../../data/blogPosts';
import type { Mode } from '../../types';

const _pos = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _pathLook = new THREE.Vector3();
const _nodeLook = new THREE.Vector3();
const _blendedLook = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

interface AttractorNode {
  position: THREE.Vector3;
  scrollStart: number;
  scrollEnd: number;
}

const BLOG_PORTAL_ATTRACTOR: AttractorNode = {
  position: new THREE.Vector3(-2.5, 0.2, -204),
  scrollStart: 0.955,
  scrollEnd: 0.990,
};

const FIN_MAIN_ATTRACTOR: AttractorNode = {
  position: new THREE.Vector3(2.5, 0.2, -207),
  scrollStart: 0.975,
  scrollEnd: 0.999,
};

const FIN_BLOG_ATTRACTOR: AttractorNode = {
  position: new THREE.Vector3(-26, 0.2, -160),
  scrollStart: 0.90,
  scrollEnd: 1.00,
};

const MAIN_MIN_XY = 2.5;

interface Props {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
}

interface CameraState {
  smoothT: number;
  leanX: number;
  smoothLook: THREE.Vector3;
  lookReady: boolean;
  prevRawT: number;
  prevMode: Mode;
  pendingSnap: number;
}

export function CameraRig({ scrollProgress, mode }: Props) {
  const { camera, clock } = useThree();
  const isMobileViewport = useMemo(() => window.innerWidth < 768, []);

  // ── Attractor arrays — built once ──────────────────────────────────────────
  const mainAttractors = useMemo<AttractorNode[]>(() => [
    ...nodes.map(n => ({
      position: n.position,
      scrollStart: n.scrollStart,
      scrollEnd: n.scrollEnd,
    })),
    BLOG_PORTAL_ATTRACTOR,
    FIN_MAIN_ATTRACTOR,
  ], []);

  const blogAttractors = useMemo<AttractorNode[]>(() => [
    ...blogPosts.map(p => ({
      position: p.position,
      scrollStart: p.scrollStart,
      scrollEnd: p.scrollEnd,
    })),
    FIN_BLOG_ATTRACTOR,
  ], []);

  // ── Persistent state across frames ────────────────────────────────────────
  const state = useRef<CameraState>({
    smoothT: 0,
    leanX: 0,
    smoothLook: new THREE.Vector3(),
    lookReady: false,
    prevRawT: 0,
    prevMode: mode,
    pendingSnap: 0,
  });

  // ── Mode transition handling ──────────────────────────────────────────────
  useEffect(() => {
    const prev = state.current.prevMode;
    state.current.prevMode = mode;

    if (mode === 'blog' && prev === 'scroll') {
      state.current.smoothT = 0;
      state.current.leanX = 0;
      state.current.lookReady = false;
      state.current.prevRawT = 0;
    } else if (mode === 'scroll' && prev === 'blog') {
      state.current.pendingSnap = 2;
    }
  }, [mode]);

  // ── Main camera position update (runs every frame) ─────────────────────────
  useFrame(() => {
    if (mode === 'camera') return;

    // Handle deferred snap from blog→scroll transition
    if (state.current.pendingSnap > 0) {
      state.current.pendingSnap--;
      if (state.current.pendingSnap === 0) {
        state.current.smoothT = scrollProgress.current;
        state.current.leanX = 0;
        state.current.lookReady = false;
        state.current.prevRawT = scrollProgress.current;
      }
    }

    const isBlog = mode === 'blog';
    const activeCurve = isBlog ? blogCurve : curve;
    const attractors = isBlog ? blogAttractors : mainAttractors;

    const rawT = scrollProgress.current;

    // ── Velocity-sensitive magnetic T pull ─────────────────────────────────
    const velocity = Math.abs(rawT - state.current.prevRawT);
    state.current.prevRawT = rawT;

    const isProjectZone = !isBlog && rawT >= 0.53 && rawT <= 0.94;
    const isBlogFocus = isBlog && rawT >= 0.05 && rawT <= 0.94;
    const speedFloor = isProjectZone ? 0.38 : isBlogFocus ? 0.32 : 0;
    const speedFactor = Math.max(speedFloor, 1 - velocity * (isProjectZone ? 70 : isBlogFocus ? 82 : 110));

    // Find nearest attractor
    let maxProx = 0;
    let nearestMid = rawT;
    let activePos: THREE.Vector3 | null = null;

    for (const node of attractors) {
      const mid = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.9;
      const prox = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx = prox;
        nearestMid = mid;
        activePos = node.position;
      }
    }

    const pullStrength = maxProx * (isProjectZone ? 0.34 : isBlogFocus ? 0.22 : 0.10) * speedFactor;
    const magneticT = rawT + (nearestMid - rawT) * pullStrength;

    const baseLerp = isProjectZone ? 0.078 : isBlogFocus ? 0.066 : 0.052;
    state.current.smoothT += (magneticT - state.current.smoothT) * baseLerp;

    const t = Math.max(0.001, Math.min(0.999, state.current.smoothT));

    activeCurve.getPoint(t, _pos);
    activeCurve.getTangent(t, _tangent);

    const forwardDist = 4.0 - maxProx * 0.8;
    _pathLook.copy(_pos).addScaledVector(_tangent, forwardDist);

    const elapsed = clock.elapsedTime;
    const driftX = Math.sin(elapsed * 0.13) * 0.09;
    const driftY = Math.cos(elapsed * 0.09) * 0.06;

    const leanTarget = activePos ? activePos.x * 0.06 * maxProx : 0;
    state.current.leanX += (leanTarget - state.current.leanX) * 0.05;

    // ── Camera target: start from path position ────────────────────────────
    _camTarget.set(_pos.x + driftX + state.current.leanX, _pos.y + driftY, _pos.z);

    // ── Lateral approach toward nearest node ───────────────────────────────
    if (activePos && maxProx > 0.08) {
      const mobileFactor = isMobileViewport ? 1.3 : 1;

      const pull = Math.pow(maxProx, isBlogFocus ? 0.86 : isProjectZone ? 0.92 : 1.1) *
        (isBlogFocus ? 0.90 : isProjectZone ? 0.96 : 0.88) * (isMobileViewport ? 1.2 : 1);

      const wantX = _pos.x + (activePos.x - _pos.x) * pull;
      const wantY = _pos.y + (activePos.y - _pos.y) * pull * (isBlogFocus ? 0.58 : isProjectZone ? 0.66 : 0.5);

      const ddx = wantX - activePos.x;
      const ddy = wantY - activePos.y;
      const dd = Math.sqrt(ddx * ddx + ddy * ddy);

      if (dd > 0.001) {
        const minXY = (isBlogFocus ? 4.8 : isProjectZone ? 3.1 : MAIN_MIN_XY) * mobileFactor;
        if (dd < minXY) {
          const s = minXY / dd;
          _camTarget.x = activePos.x + ddx * s;
          _camTarget.y = activePos.y + ddy * s;
        } else {
          _camTarget.x = wantX;
          _camTarget.y = wantY;
        }
      }

      const driftDamp = 1 - maxProx * 0.85;
      _camTarget.x += driftX * driftDamp;
      _camTarget.y += driftY * driftDamp;
    }

    // ── Apply camera position ──────────────────────────────────────────────
    const mobileLerpBoost = isMobileViewport ? 1.4 : 1;
    const xyLerp = (isBlog
      ? baseLerp + maxProx * (isBlogFocus ? 0.11 : 0)
      : baseLerp + maxProx * (isProjectZone ? 0.18 : 0.14)) * mobileLerpBoost;

    camera.position.x += (_camTarget.x - camera.position.x) * xyLerp;
    camera.position.y += (_camTarget.y - camera.position.y) * xyLerp;
    camera.position.z += (_camTarget.z - camera.position.z) * baseLerp;
  });

  // ── Look target update (separate frame callback for clarity) ──────────────
  useFrame(() => {
    if (mode === 'camera') return;

    const isBlog = mode === 'blog';
    const attractors = isBlog ? blogAttractors : mainAttractors;
    const rawT = scrollProgress.current;

    // Re-find nearest attractor for look (could cache, but cheap enough)
    let maxProx = 0;
    let activePos: THREE.Vector3 | null = null;

    for (const node of attractors) {
      const mid = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.9;
      const prox = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx = prox;
        activePos = node.position;
      }
    }

    const elapsed = clock.elapsedTime;
    const driftX = Math.sin(elapsed * 0.13) * 0.09;
    const driftY = Math.cos(elapsed * 0.09) * 0.06;

    if (activePos && maxProx > 0.05) {
      const blend = Math.pow(maxProx, isBlog ? 0.34 : maxProx > 0.5 ? 0.36 : 0.45) *
        (isBlog ? 0.98 : maxProx > 0.5 ? 0.96 : 0.88);
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

    if (!state.current.lookReady) {
      state.current.smoothLook.copy(_pos).addScaledVector(_tangent, 4.0);
      state.current.lookReady = true;
    } else {
      const lookLerp = (isBlog
        ? 0.14 + maxProx * 0.24
        : maxProx > 0.5
          ? 0.08 + maxProx * 0.16
          : 0.05 + maxProx * 0.10) * (isMobileViewport ? 1.5 : 1);
      state.current.smoothLook.lerp(_blendedLook, lookLerp);
    }

    camera.lookAt(state.current.smoothLook);
  });

  // ── Responsive camera FOV ─────────────────────────────────────────────────
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const update = () => {
      const aspect = window.innerWidth / window.innerHeight;
      let fov = 65;
      if (aspect < 1) {
        fov = Math.min(85, 65 / Math.sqrt(aspect));
      }
      if (Math.abs(cam.fov - fov) > 0.5) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [camera]);

  return null;
}