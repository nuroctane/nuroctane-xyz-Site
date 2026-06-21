import { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const _r = new THREE.Vector3();
const _u = new THREE.Vector3();
const _delta = new THREE.Vector3();

/**
 * Shared "hold-to-drag" physics for floating cards in explore mode.
 *
 * - Hold ~280ms on a card to pick it up, then drag.
 * - Movement is *smoothed*: the raw pointer delta accumulates into a target
 *   offset, and the live offset eases toward it each frame, giving a slow,
 *   flowing, ocean-like motion instead of a 1:1 jump.
 * - Exposes directional info (`dragDir` in screen/local space, plus `dragActive`
 *   and `dragVel`) so a particle wake can stream in the pull direction.
 *
 * The pointer is captured immediately on pointerdown so `pointermove`/`pointerup`
 * always fire on the originating element — this prevents the drag state from
 * getting "stuck" if the pointer leaves the card before release. The hold timer
 * only gates whether movement is *enabled*, not whether events are received.
 */
export function useCardDrag(mode: 'scroll' | 'camera') {
  const { camera } = useThree();

  // Keep mode fresh inside the per-frame loop without re-subscribing
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const target = useRef(new THREE.Vector3());   // accumulated drag target
  const offset = useRef(new THREE.Vector3());   // smoothed live offset (read this)

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const captured = useRef<{ el: HTMLElement; id: number } | null>(null);

  // Wake info: local screen-space pull direction + intensity
  const dragDir = useRef(new THREE.Vector3());
  const dragActive = useRef(false);
  const dragVel = useRef(0);

  const clearHold = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
  };

  const releaseCapture = () => {
    const cap = captured.current;
    if (cap) {
      try { cap.el.releasePointerCapture(cap.id); } catch (_) { /* may have unmounted */ }
      captured.current = null;
    }
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (mode !== 'camera') return;
    e.stopPropagation();
    didDrag.current = false;
    last.current = { x: e.clientX, y: e.clientY };
    // Capture immediately so move/up always land on this element
    const el = e.currentTarget as HTMLElement;
    try { el.setPointerCapture(e.pointerId); captured.current = { el, id: e.pointerId }; } catch (_) { /* ignore */ }
    clearHold();
    holdTimer.current = setTimeout(() => {
      isDragging.current = true;
      didDrag.current = true;
    }, 280);
  }, [mode]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };

    // Screen delta → world space via camera right & up vectors
    const sensitivity = 0.014;
    camera.getWorldDirection(_r);
    _r.crossVectors(_r, camera.up).normalize();
    _u.copy(camera.up).normalize();
    _delta.set(0, 0, 0)
      .addScaledVector(_r, dx * sensitivity)
      .addScaledVector(_u, -dy * sensitivity);
    target.current.add(_delta);

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      // Local/screen-space direction (group billboards to camera, so local XY ≈ screen)
      dragDir.current.set(dx, -dy, 0).normalize();
      dragActive.current = true;
      dragVel.current = Math.min(1, Math.hypot(dx, dy) * 0.06);
    }
  }, [camera]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    clearHold();
    releaseCapture();
    isDragging.current = false;
    if (didDrag.current) e.stopPropagation();
  }, []);

  // Suppress the click that follows a real drag so links don't open mid-move
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  }, []);

  useEffect(() => () => { clearHold(); releaseCapture(); }, []);

  useFrame(() => {
    // Outside explore mode, ease cards back to their authored positions so the
    // scroll composition is never left displaced by an earlier drag.
    if (modeRef.current !== 'camera') {
      target.current.multiplyScalar(0.92);
      if (target.current.lengthSq() < 1e-6) target.current.set(0, 0, 0);
      isDragging.current = false;
    }
    // Flowing ease toward the drag target
    offset.current.lerp(target.current, 0.10);
    if (!isDragging.current) {
      dragVel.current *= 0.9;
      if (dragVel.current < 0.02) dragActive.current = false;
    }
  });

  return {
    offset, isDragging, didDrag,
    dragDir, dragActive, dragVel,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
      // Kill the browser's native link/image drag-and-drop, which otherwise
      // "tears off" a ghost of the anchor instead of moving the card.
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
    },
  };
}
