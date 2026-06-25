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

function computeBlogProximity(post: BlogPost, t: number): number {
  const mid       = (post.scrollStart + post.scrollEnd) / 2;
  // Wider window (+0.044 vs old +0.020) keeps blog cards legible longer when
  // the user scrolls back and forth trying to read in full.
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
  const groupRef    = useRef<THREE.Group>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const dragWrapRef = useRef<HTMLDivElement>(null);
  const ringRef     = useRef<THREE.Mesh>(null);
  const modeRef     = useRef(mode);
  modeRef.current   = mode;
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;

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

    _euler.set(post.idleRotation.x + wobX, post.idleRotation.y, post.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);

    _mat4.lookAt(group.position, cam.position, _up);
    _qFace.setFromRotationMatrix(_mat4);

    const faceAmt = Math.max(Math.pow(p, 0.55), 0.9);
    _qResult.slerpQuaternions(_qIdle, _qFace, faceAmt);
    _qResult.multiply(_flipQ);
    group.quaternion.copy(_qResult);
    const effectiveP = isCam ? Math.max(p, 0.62) : p;
    group.scale.setScalar(0.5 + effectiveP * 0.5);

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
