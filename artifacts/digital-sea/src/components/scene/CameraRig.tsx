import { useRef, MutableRefObject, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { curve } from '../../data/path';
import { blogCurve } from '../../data/blogPath';
import { nodes } from '../../data/nodes';
import { blogPosts } from '../../data/blogPosts';
import type { Mode } from '../../types';

const _pos         = new THREE.Vector3();
const _tangent     = new THREE.Vector3();
const _pathLook    = new THREE.Vector3();
const _nodeLook    = new THREE.Vector3();
const _blendedLook = new THREE.Vector3();
const _camTarget   = new THREE.Vector3();

interface AttractorNode {
  position:    THREE.Vector3;
  scrollStart: number;
  scrollEnd:   number;
}

// ─── Portal attractors (main path) ────────────────────────────────────────
const BLOG_PORTAL_ATTRACTOR: AttractorNode = {
  position:    new THREE.Vector3(-2.5, 0.2, -204),
  scrollStart: 0.955,
  scrollEnd:   0.990,
};
const FIN_MAIN_ATTRACTOR: AttractorNode = {
  position:    new THREE.Vector3(2.5, 0.2, -207),
  scrollStart: 0.975,
  scrollEnd:   0.999,
};
// ─── Portal attractor (blog path) ─────────────────────────────────────────
const FIN_BLOG_ATTRACTOR: AttractorNode = {
  position:    new THREE.Vector3(-26, 0.2, -160),
  scrollStart: 0.90,
  scrollEnd:   1.00,
};

// Minimum XY distance from camera to node when lateral pull is active.
// Keeps the camera at a comfortable viewing angle rather than clipping
// through the card face.
const MAIN_MIN_XY = 2.5;

interface Props {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
}

export function CameraRig({ scrollProgress, mode }: Props) {
  const { camera } = useThree();
  const clock      = useThree((s) => s.clock);
  const smoothT    = useRef(0);
  const leanX      = useRef(0);
  const smoothLook = useRef(new THREE.Vector3());
  const lookReady  = useRef(false);
  const prevMode   = useRef<Mode>(mode);
  const prevRawT   = useRef(0);
  // > 0 → count down frames, then snap smoothT to scrollProgress on frame 0.
  // Used when blog→scroll so the snap fires AFTER the rAF scroll-restore.
  const pendingSnap = useRef(0);

  // Cache mobile check once — avoids window.innerWidth lookup every frame
  const isMobileViewport = useMemo(() => window.innerWidth < 768, []);

  // ── Attractor arrays — built once, not on every frame ─────────────────────
  const mainAttractors = useMemo<AttractorNode[]>(() => [
    ...nodes.map(n => ({
      position:    n.position,
      scrollStart: n.scrollStart,
      scrollEnd:   n.scrollEnd,
    })),
    BLOG_PORTAL_ATTRACTOR,
    FIN_MAIN_ATTRACTOR,
  ], []);

  const blogAttractors = useMemo<AttractorNode[]>(() => [
    ...blogPosts.map(p => ({
      position:    p.position,
      scrollStart: p.scrollStart,
      scrollEnd:   p.scrollEnd,
    })),
    FIN_BLOG_ATTRACTOR,
  ], []);

  useEffect(() => {
    const prev = prevMode.current;
    prevMode.current = mode;

    if (mode === 'blog' && prev === 'scroll') {
      // Fresh blog entry (via blog portal) — start from the top of the blog path.
      smoothT.current   = 0;
      leanX.current     = 0;
      lookReady.current = false;
      prevRawT.current  = 0;
    } else if (mode === 'scroll' && prev === 'blog') {
      // User returned from blog to main scroll (via ReturnButton or SEA toggle).
      // smoothT carries a blog t-value; schedule a snap to the restored main-track
      // scroll position 2 frames from now so the rAF scroll-restore fires first.
      pendingSnap.current = 2;
    }
    // camera → blog  : smoothT unchanged — camera was frozen at the right position
    // camera → scroll: same — no snap needed
  }, [mode]);

  useFrame(() => {
    if (mode === 'camera') return;

    // Deferred snap: fires 2 frames after blog→scroll (after the rAF restores scroll)
    if (pendingSnap.current > 0) {
      pendingSnap.current--;
      if (pendingSnap.current === 0) {
        smoothT.current   = scrollProgress.current;
        leanX.current     = 0;
        lookReady.current = false;
        prevRawT.current  = scrollProgress.current;
      }
    }

    const isBlog      = mode === 'blog';
    const activeCurve = isBlog ? blogCurve : curve;
    const attractors  = isBlog ? blogAttractors : mainAttractors;

    const rawT = scrollProgress.current;

    // ── Velocity-sensitive magnetic T pull ─────────────────────────────────
    const velocity      = Math.abs(rawT - prevRawT.current);
    prevRawT.current    = rawT;
    const isProjectZone = !isBlog && rawT >= 0.54 && rawT <= 0.94;
    const isBlogFocus   = isBlog && rawT >= 0.05 && rawT <= 0.94;
    const speedFloor    = isProjectZone ? 0.38 : isBlogFocus ? 0.32 : 0;
    const speedFactor   = Math.max(speedFloor, 1 - velocity * (isProjectZone ? 70 : isBlogFocus ? 82 : 110));

    let maxProx    = 0;
    let nearestMid = rawT;
    let activePos: THREE.Vector3 | null = null;

    for (const node of attractors) {
      const mid       = (node.scrollStart + node.scrollEnd) / 2;
      const halfRange = (node.scrollEnd - node.scrollStart) * 0.9;
      const prox      = Math.max(0, 1 - Math.abs(rawT - mid) / halfRange);
      if (prox > maxProx) {
        maxProx    = prox;
        nearestMid = mid;
        activePos  = node.position;
      }
    }

    const pullStrength = maxProx * (isProjectZone ? 0.34 : isBlogFocus ? 0.22 : 0.10) * speedFactor;
    const magneticT    = rawT + (nearestMid - rawT) * pullStrength;

    const baseLerp = isProjectZone ? 0.078 : isBlogFocus ? 0.066 : 0.052;
    smoothT.current += (magneticT - smoothT.current) * baseLerp;

    const t = Math.max(0.001, Math.min(0.999, smoothT.current));

    activeCurve.getPoint(t, _pos);
    activeCurve.getTangent(t, _tangent);

    const forwardDist = 4.0 - maxProx * 0.8;
    _pathLook.copy(_pos).addScaledVector(_tangent, forwardDist);

    const elapsed = clock.elapsedTime;
    const driftX  = Math.sin(elapsed * 0.13) * 0.09;
    const driftY  = Math.cos(elapsed * 0.09) * 0.06;

    const leanTarget = activePos ? activePos.x * 0.06 * maxProx : 0;
    leanX.current   += (leanTarget - leanX.current) * 0.050;

    // ── Camera target: start from path position ────────────────────────────
    _camTarget.set(_pos.x + driftX + leanX.current, _pos.y + driftY, _pos.z);

    // ── Lateral approach ───────────────────────────────────────────────────
    // Pull the camera toward the nearest node's XY position so cards fill the
    // viewport even when the path curves far away (worst case: 4.8 world-units).
    // minXY clamps the minimum camera-to-node XY distance so the camera never
    // clips through the card.
    // On mobile (<768px) we *increase* minXY (push camera back) so cards appear
    // smaller on screen via Html distanceFactor, preventing overflow on narrow
    // viewports.  The wider FOV (see ResponsiveCamera) compensates so the user
    // still sees plenty of the scene.
    if (activePos && maxProx > 0.08) {
      const mobileFactor = isMobileViewport ? 1.3 : 1;

      const pull  = Math.pow(maxProx, isBlogFocus ? 0.86 : isProjectZone ? 0.92 : 1.1) * (isBlogFocus ? 0.90 : isProjectZone ? 0.96 : 0.88) * (isMobileViewport ? 1.2 : 1);
      const wantX = _pos.x + (activePos.x - _pos.x) * pull;
      const wantY = _pos.y + (activePos.y - _pos.y) * pull * (isBlogFocus ? 0.58 : isProjectZone ? 0.66 : 0.5);

      const ddx = wantX - activePos.x;
      const ddy = wantY - activePos.y;
      const dd  = Math.sqrt(ddx * ddx + ddy * ddy);

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

      // Suppress drift when camera is close to a node
      const driftDamp = 1 - maxProx * 0.85;
      _camTarget.x += driftX * driftDamp;
      _camTarget.y += driftY * driftDamp;
    }

    // ── Apply camera position ─────────────────────────────────────────────
    // XY lerp is faster than Z on the main track when proximity is high so
    // the lateral approach actually completes within the card's scroll window.
    // Blog track uses uniform lerp (no lateral pull to fight).
    // On mobile the lerp is boosted so the camera snaps into framing position
    // before the card's scroll window passes.
    const mobileLerpBoost = isMobileViewport ? 1.4 : 1;
    const xyLerp = (isBlog
      ? baseLerp + maxProx * (isBlogFocus ? 0.11 : 0)
      : baseLerp + maxProx * (isProjectZone ? 0.18 : 0.14)) * mobileLerpBoost;
    camera.position.x += (_camTarget.x - camera.position.x) * xyLerp;
    camera.position.y += (_camTarget.y - camera.position.y) * xyLerp;
    camera.position.z += (_camTarget.z - camera.position.z) * baseLerp;

    // ── Look target ────────────────────────────────────────────────────────
    if (activePos && maxProx > 0.05) {
      const blend = Math.pow(maxProx, isBlogFocus ? 0.34 : isProjectZone ? 0.36 : 0.45) * (isBlogFocus ? 0.98 : isProjectZone ? 0.96 : 0.88);
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
      smoothLook.current.copy(_pos).addScaledVector(_tangent, 4.0);
      lookReady.current = true;
    } else {
      // Blog nodes can be up to 90° off the path direction so we use a much
      // faster lookAt so the card is centered on screen before it becomes
      // clearly visible.  Main track cards sit closer to the path and can
      // use a gentler blend.
      const lookLerp = (isBlog
        ? 0.14 + maxProx * 0.24
        : isProjectZone
          ? 0.08 + maxProx * 0.16
          : 0.05 + maxProx * 0.10) * (isMobileViewport ? 1.5 : 1);
      smoothLook.current.lerp(_blendedLook, lookLerp);
    }

    camera.lookAt(smoothLook.current);
  });

  return null;
}
