import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Mode } from '../../types';

interface Props {
  onFinClick:       () => void;
  onBlogClick:      () => void;
  onPortalsBlurred: () => void;
  scrollProgress:   React.MutableRefObject<number>;
  mode:             Mode;
  finUnlocked:      boolean;
  portalsArmed:     boolean;
}

// ─── BLOG portal (main scroll path) ────────────────────────────────────────
const BLOG_T    = 0.965;
const BLOG_HALF = 0.04;
const BLOG_POS  = new THREE.Vector3(-2.5, 0.2, -204);

// ─── FIN portal (main scroll path) ─────────────────────────────────────────
const FIN_MAIN_T    = 0.980;
const FIN_MAIN_HALF = 0.03;
const FIN_MAIN_POS  = new THREE.Vector3(2.5, 0.2, -207);

// ─── FIN portal (blog path end) ────────────────────────────────────────────
const FIN_BLOG_T    = 0.97;
const FIN_BLOG_HALF = 0.05;
const FIN_BLOG_POS  = new THREE.Vector3(-26, 0.2, -160);

// Portal zone thresholds — when t drops below these, no portal is visible.
// Re-arming fires the moment the user exits this zone after disarming.
const MAIN_ZONE_THRESHOLD = 0.92;
const BLOG_ZONE_THRESHOLD = 0.90;

// ─── Shared Portal component ────────────────────────────────────────────────
function Portal({
  position,
  label,
  onClick,
  computeProx,
  isActive,
}: {
  position:    THREE.Vector3;
  label:       string;
  onClick:     () => void;
  computeProx: () => number;
  isActive:    () => boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outerRef   = useRef<THREE.Mesh>(null);
  const innerRef   = useRef<THREE.Mesh>(null);
  const glowRef    = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const active = isActive();
    const prox   = active ? computeProx() : 0;

    const outer = outerRef.current;
    if (outer) outer.rotation.z = clock.elapsedTime * 0.35;

    const inner = innerRef.current;
    if (inner) inner.rotation.z = -clock.elapsedTime * 0.65;

    const glow = glowRef.current;
    if (glow) {
      const mat = glow.material as THREE.MeshBasicMaterial;
      mat.opacity = prox * 0.22;
    }

    const el = wrapperRef.current;
    if (el) {
      const visOp = Math.min(1, prox * 2.8);
      el.style.opacity       = String(visOp);
      el.style.pointerEvents = visOp > 0.15 ? 'auto' : 'none';
    }

    const outerMat = outer?.material as THREE.MeshBasicMaterial | undefined;
    if (outerMat) outerMat.opacity = prox * 0.90;

    const innerMat = inner?.material as THREE.MeshBasicMaterial | undefined;
    if (innerMat) innerMat.opacity = prox * 0.65;
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <circleGeometry args={[1.2, 48]} />
        <meshBasicMaterial
          color="#0d4a58" transparent opacity={0}
          depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>

      <group>
        <mesh ref={outerRef}>
          <torusGeometry args={[1.05, 0.035, 12, 64]} />
          <meshBasicMaterial
            color="#5de8f0" transparent opacity={0}
            depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <mesh ref={innerRef}>
        <torusGeometry args={[0.75, 0.022, 10, 48]} />
        <meshBasicMaterial
          color="#4a9aaa" transparent opacity={0}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html transform distanceFactor={4.5} zIndexRange={[200, 0]}>
        <div ref={wrapperRef} className="portal-html-wrapper" style={{ opacity: 0, pointerEvents: 'none' }}>
          <button className="portal-btn" onClick={onClick}>
            <span className="portal-btn-label">{label}</span>
          </button>
        </div>
      </Html>
    </group>
  );
}

export function PortalGates({
  onFinClick, onBlogClick, onPortalsBlurred,
  scrollProgress, mode, finUnlocked: _finUnlocked, portalsArmed,
}: Props) {
  // Track whether the user was inside the portal zone last frame.
  // When they leave the zone while portals are disarmed, we re-arm immediately.
  const wasInZone = useRef(false);

  useFrame(() => {
    if (portalsArmed) {
      // Already armed — just keep tracking zone status for the next disarm.
      const t       = scrollProgress.current;
      const isBlog  = mode === 'blog';
      const inZone  = t >= (isBlog ? BLOG_ZONE_THRESHOLD : MAIN_ZONE_THRESHOLD);
      wasInZone.current = inZone;
      return;
    }

    const t      = scrollProgress.current;
    const isBlog = mode === 'blog';
    const inZone = t >= (isBlog ? BLOG_ZONE_THRESHOLD : MAIN_ZONE_THRESHOLD);

    if (wasInZone.current && !inZone) {
      // User just scrolled out of the portal zone → re-arm so portals are
      // live the next time they scroll back into range.
      onPortalsBlurred();
    }
    wasInZone.current = inZone;
  });

  return (
    <>
      {/* BLOG portal — main scroll path */}
      <Portal
        position={BLOG_POS}
        label="BLOG"
        onClick={onBlogClick}
        computeProx={() => {
          const t = scrollProgress.current;
          return Math.max(0, 1 - Math.abs(t - BLOG_T) / BLOG_HALF);
        }}
        isActive={() => portalsArmed && (mode === 'scroll' || mode === 'camera')}
      />

      {/* FIN portal — main scroll path, alongside BLOG */}
      <Portal
        position={FIN_MAIN_POS}
        label="FIN"
        onClick={onFinClick}
        computeProx={() => {
          const t = scrollProgress.current;
          return Math.max(0, 1 - Math.abs(t - FIN_MAIN_T) / FIN_MAIN_HALF);
        }}
        isActive={() => portalsArmed && (mode === 'scroll' || mode === 'camera')}
      />

      {/* FIN portal — blog path, natural conclusion of blog reading */}
      <Portal
        position={FIN_BLOG_POS}
        label="FIN"
        onClick={onFinClick}
        computeProx={() => {
          const t = scrollProgress.current;
          return Math.max(0, 1 - Math.abs(t - FIN_BLOG_T) / FIN_BLOG_HALF);
        }}
        isActive={() => portalsArmed && mode === 'blog'}
      />
    </>
  );
}
