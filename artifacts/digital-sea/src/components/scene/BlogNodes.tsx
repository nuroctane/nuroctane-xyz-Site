import { useRef, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { blogPosts, BlogPost } from '../../data/blogPosts';
import { BlogCard } from './BlogCard';
import { useCardDrag } from '../../hooks/useCardDrag';
import { DragWake } from './DragWake';
import type { Mode, Track } from '../../types';

const _mat4    = new THREE.Matrix4();
const _up      = new THREE.Vector3(0, 1, 0);
const _qIdle   = new THREE.Quaternion();
const _qFace   = new THREE.Quaternion();
const _qResult = new THREE.Quaternion();
const _euler   = new THREE.Euler();
const _flipQ   = new THREE.Quaternion(0, 1, 0, 0);

const _worldPos = new THREE.Vector3();
const _ndc      = new THREE.Vector3();

function computeBlogProximity(post: BlogPost, t: number): number {
  const mid       = (post.scrollStart + post.scrollEnd) / 2;
  const halfRange = (post.scrollEnd - post.scrollStart) / 2 + 0.044;
  return Math.max(0, Math.min(1, 1 - Math.abs(t - mid) / halfRange));
}

interface SingleBlogNodeProps {
  post:           BlogPost;
  scrollProgress: MutableRefObject<number>;
  index:          number;
  mode:           Mode;
  activeTrack:    Track;
}

function SingleBlogNode({ post, scrollProgress, index, mode, activeTrack }: SingleBlogNodeProps) {
  const groupRef     = useRef<THREE.Group>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const dragWrapRef  = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<THREE.Mesh>(null);
  const modeRef      = useRef(mode);
  modeRef.current    = mode;
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;

  const cssWidthRef    = useRef(0);
  const prevRatioRef   = useRef(0);
  const glitchTimerRef = useRef(0);
  const glitchOffRef   = useRef(0);
  const glitchYOffRef  = useRef(0);

  const drag = useCardDrag(mode);

  const phase = index * 1.374;

  useFrame(({ camera: cam, clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const isBlogTrack =
      modeRef.current === 'blog' ||
      (modeRef.current === 'camera' && activeTrackRef.current === 'blog');
    const isCam = modeRef.current === 'camera' && activeTrackRef.current === 'blog';

    if (!isBlogTrack) {
      group.scale.setScalar(0);
      const el = wrapperRef.current;
      if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
      const ring = ringRef.current;
      if (ring) { (ring.material as THREE.MeshBasicMaterial).opacity = 0; }
      // Reset narrowed width so card re-appears at full default width.
      if (cssWidthRef.current > 0) {
        cssWidthRef.current = 0;
        prevRatioRef.current = 0;
        try { el?.style.removeProperty('--card-width'); } catch {}
      }
      return;
    }

    const t       = scrollProgress.current;
    const p       = computeBlogProximity(post, t);
    const elapsed = clock.elapsedTime;

    const wobble = 1 - p * 0.80;
    const wobX   = Math.sin(elapsed * 0.52 + phase) * 0.14 * wobble;
    const wobZ   = Math.cos(elapsed * 0.38 + phase * 1.21) * 0.10 * wobble;
    const floatY = Math.sin(elapsed * 0.31 + phase * 0.88) * 0.28 * wobble;

    const ox = drag.offset.current.x;
    const oy = drag.offset.current.y;
    const oz = drag.offset.current.z;
    group.position.set(post.position.x + ox, post.position.y + floatY + oy, post.position.z + oz);

    // ── Glitch offset ─────────────────────────────────────────────────────
    if (glitchTimerRef.current > 0) {
      const gt = glitchTimerRef.current;
      group.position.x += glitchOffRef.current  * (gt / 8);
      group.position.y += glitchYOffRef.current * (gt / 8);
      glitchTimerRef.current--;
      glitchOffRef.current  *= 0.72;
      glitchYOffRef.current *= 0.72;
    }

    _euler.set(post.idleRotation.x + wobX, post.idleRotation.y, post.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);

    _mat4.lookAt(group.position, cam.position, _up);
    _qFace.setFromRotationMatrix(_mat4);

    const faceAmt = Math.max(Math.pow(p, 0.55), 0.98);
    _qResult.slerpQuaternions(_qIdle, _qFace, faceAmt);
    _qResult.multiply(_flipQ);
    group.quaternion.copy(_qResult);
    const effectiveP = isCam ? Math.max(p, 0.62) : p;
    let cardScale = 0.5 + effectiveP * 0.5;

    if (isCam && window.innerWidth < 768) {
      const dist = cam.position.distanceTo(group.position);
      const TARGET_DIST = 6;
      const MIN_FACTOR  = 0.25;
      const MAX_FACTOR  = 3.0;
      cardScale *= Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, dist / TARGET_DIST));
    }

    group.scale.setScalar(cardScale);

    // ── Auto-narrow by screen-space projection ────────────────────────────
    try {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      _worldPos.copy(group.position);
      const dist = _worldPos.distanceTo(cam.position);
      if (dist > 0.5 && vw > 0 && vh > 0) {
        _ndc.copy(_worldPos).project(cam);
        if (
          isFinite(_ndc.x) && isFinite(_ndc.z) &&
          _ndc.z > -1 && _ndc.z < 1
        ) {
          const curCssWidth  = cssWidthRef.current || baseCardCssWidth(vw);
          const onScreenW    = curCssWidth * 4.5 * cardScale / dist;
          const cx           = (_ndc.x + 1) / 2 * vw;

          const overflowLeft  = Math.max(0, -(cx - onScreenW / 2));
          const overflowRight = Math.max(0, (cx + onScreenW / 2) - vw);

          if (overflowLeft > 0 || overflowRight > 0) {
            const maxOnScreen  = Math.min(cx, vw - cx) * 2;
            const ratio        = Math.max(0.30, maxOnScreen / onScreenW);
            const newWidth     = Math.round(curCssWidth * ratio);

            if (prevRatioRef.current > 0 && Math.abs(ratio - prevRatioRef.current) > 0.015) {
              const jitter = (Math.random() - 0.5) * 12 * (1 - ratio);
              glitchTimerRef.current = 8;
              glitchOffRef.current   = jitter;
              glitchYOffRef.current  = (Math.random() - 0.5) * 2 * (1 - ratio);
            }
            prevRatioRef.current = ratio;

            cssWidthRef.current = newWidth;
            const wrap = wrapperRef.current;
            if (wrap) wrap.style.setProperty('--card-width', `${newWidth}px`);
          } else if (cssWidthRef.current > 0) {
            const base     = baseCardCssWidth(vw);
            const restoreW = Math.min(base, cssWidthRef.current * 1.06);
            if (restoreW >= base - 0.5) {
              cssWidthRef.current = 0;
              wrapperRef.current?.style.removeProperty('--card-width');
            } else {
              cssWidthRef.current = restoreW;
              wrapperRef.current?.style.setProperty('--card-width', `${restoreW}px`);
            }
          }
        }
      }
    } catch {
      cssWidthRef.current = 0;
      prevRatioRef.current = 0;
      glitchTimerRef.current = 0;
      try { wrapperRef.current?.style.removeProperty('--card-width'); } catch {}
    }

    const el = wrapperRef.current;
    if (el) {
      el.style.opacity       = String(effectiveP);
      el.style.pointerEvents = isCam ? 'auto' : (p > 0.38 ? 'auto' : 'none');
    }

    if (dragWrapRef.current && !drag.isDragging.current) {
      dragWrapRef.current.style.cursor = isCam ? 'grab' : '';
    }

    const ring = ringRef.current;
    if (ring) {
      const mat    = ring.material as THREE.MeshBasicMaterial;
      const target = effectiveP > 0.4 ? 0.55 * effectiveP : 0;
      mat.opacity += (target - mat.opacity) * 0.10;
    }
  });

  return (
    <group ref={groupRef} position={post.position}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.022, 8, 64]} />
        <meshBasicMaterial
          color="#5de8f0" transparent opacity={0}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html center transform distanceFactor={4.5} zIndexRange={[100, 0]}>
        <div
          ref={dragWrapRef}
          {...drag.handlers}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <div ref={wrapperRef} style={{ opacity: 0, pointerEvents: 'none' }}>
            <BlogCard post={post} />
          </div>
        </div>
      </Html>

      <DragWake dirRef={drag.dragDir} activeRef={drag.dragActive} velRef={drag.dragVel} />
    </group>
  );
}

export function BlogNodes({
  scrollProgress,
  mode,
  activeTrack,
}: {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
  activeTrack: Track;
}) {
  return (
    <>
      {blogPosts.map((post, i) => (
        <SingleBlogNode
          key={post.id}
          post={post}
          scrollProgress={scrollProgress}
          index={i}
          mode={mode}
          activeTrack={activeTrack}
        />
      ))}
    </>
  );
}

function baseCardCssWidth(vw: number): number {
  const r = 16;
  if (vw < 480) return vw - 1.1 * r;
  if (vw < 768) return Math.min(430, vw - 1.5 * r);
  return Math.min(560, vw - 2 * r);
}
