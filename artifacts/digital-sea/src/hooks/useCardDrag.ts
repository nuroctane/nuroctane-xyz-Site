import { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const _r = new THREE.Vector3();
const _u = new THREE.Vector3();
const _delta = new THREE.Vector3();

const HOLD_MS = 280;
// If the pointer moves more than this many px before the hold timer fires,
// the user is orbiting/panning — do NOT activate card drag.
const PRE_HOLD_CANCEL_PX = 10;

/**
 * Shared "hold-to-drag" physics for floating cards in explore mode.
 *
 * Click/tap behaviour (the key fix vs. original):
 *  - setPointerCapture is NOT called on pointerdown. It is delayed until the
 *    hold timer fires AND the pointer hasn't moved beyond PRE_HOLD_CANCEL_PX.
 *    This means a quick tap never captures the pointer, so the anchor's click
 *    event fires cleanly on both desktop and mobile.
 *  - didDrag is set to true only when actual pointer movement occurs in
 *    onPointerMove (after drag mode is active). Holding without moving never
 *    sets didDrag, so onClickCapture never suppresses link navigation.
 *
 * Drag behaviour is unchanged:
 *  - Hold ≥ 280 ms → drag activates, pointer is captured, card moves.
 *  - Any movement while drag is active → didDrag=true → click suppressed on up.
 */
export function useCardDrag(mode: 'scroll' | 'camera') {
  const { camera } = useThree();

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const target   = useRef(new THREE.Vector3());
  const offset   = useRef(new THREE.Vector3());

  const isDragging = useRef(false);
  const didDrag    = useRef(false);
  const holdTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last       = useRef({ x: 0, y: 0 });
  const startPos   = useRef({ x: 0, y: 0 });
  const captured   = useRef<{ el: HTMLElement; id: number } | null>(null);

  const dragDir    = useRef(new THREE.Vector3());
  const dragActive = useRef(false);
  const dragVel    = useRef(0);

  const clearHold = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
  };

  const releaseCapture = () => {
    const cap = captured.current;
    if (cap) {
      try { cap.el.releasePointerCapture(cap.id); } catch (_) {}
      captured.current = null;
    }
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (mode !== 'camera') return;
    // Stop the event from bubbling to the canvas / OrbitControls.
    e.stopPropagation();
    didDrag.current   = false;
    isDragging.current = false;
    last.current      = { x: e.clientX, y: e.clientY };
    startPos.current  = { x: e.clientX, y: e.clientY };
    clearHold();

    // Snapshot el + pointerId for the deferred capture below.
    const el        = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;

    holdTimer.current = setTimeout(() => {
      // If the pointer drifted significantly before the timer fired, the user
      // is attempting an orbit/pan — abort drag activation so OrbitControls
      // can take over on the next interaction.
      const moved = Math.hypot(
        last.current.x - startPos.current.x,
        last.current.y - startPos.current.y,
      );
      if (moved > PRE_HOLD_CANCEL_PX) return;

      isDragging.current = true;
      // Capture ONLY now — a quick tap never sets capture, so the anchor's
      // native click event is never redirected and always fires correctly.
      try { el.setPointerCapture(pointerId); captured.current = { el, id: pointerId }; } catch (_) {}
    }, HOLD_MS);
  }, [mode]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // Always track position so the pre-hold threshold stays accurate.
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };

    if (!isDragging.current) return;
    e.stopPropagation();

    const sensitivity = 0.014;
    camera.getWorldDirection(_r);
    _r.crossVectors(_r, camera.up).normalize();
    _u.copy(camera.up).normalize();
    _delta.set(0, 0, 0)
      .addScaledVector(_r,  dx * sensitivity)
      .addScaledVector(_u, -dy * sensitivity);
    target.current.add(_delta);

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      // Mark as dragged only when the card actually moves — not just on hold.
      // This is what allows onClickCapture to correctly let links through
      // when the user held but didn't actually move the card.
      didDrag.current = true;
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

  // Suppress click only when the card physically moved (didDrag=true).
  // Holding without moving, or a quick tap, leaves didDrag=false so the
  // anchor's href navigates normally.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  }, []);

  useEffect(() => () => { clearHold(); releaseCapture(); }, []);

  useFrame(() => {
    if (modeRef.current !== 'camera') {
      target.current.multiplyScalar(0.92);
      if (target.current.lengthSq() < 1e-6) target.current.set(0, 0, 0);
      isDragging.current = false;
    }
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
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
    },
  };
}
