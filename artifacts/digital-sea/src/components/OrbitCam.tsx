import { useMemo, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

// Scratch vectors — allocated once, reused every frame (no GC pressure)
const _dir     = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right   = new THREE.Vector3();
const _up      = new THREE.Vector3(0, 1, 0);
const _delta   = new THREE.Vector3();

const MOVE_SPEED = 0.28; // units per frame (~17 u/s @ 60 fps)

const MOVE_KEYS = new Set([
  'KeyW','KeyA','KeyS','KeyD',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
]);

interface Props {
  enabled: boolean;
}

export function OrbitCam({ enabled }: Props) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());

  // Create and fully configure the controls instance during the React render
  // phase (useMemo runs synchronously). The target is set here — before the
  // first useFrame ever fires — so there is zero window in which OrbitControls
  // can update() against the wrong target and swing the camera.
  const controls = useMemo(() => {
    if (!enabled) return null;

    camera.getWorldDirection(_dir);

    const oc = new ThreeOrbitControls(camera);
    oc.target.copy(camera.position).addScaledVector(_dir, 10);

    oc.enableDamping  = true;
    oc.dampingFactor  = 0.08;
    oc.rotateSpeed    = 0.5;
    oc.panSpeed       = 0.65;
    oc.zoomSpeed      = 0.7;
    oc.minDistance    = 1;
    oc.maxDistance    = 180;
    oc.enablePan      = true;
    oc.enableZoom     = true;
    oc.enableRotate   = true;

    // Sync internal spherical from current camera state — before any frame fires.
    oc.update();

    return oc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Keyboard listener — only active in explore mode.
  // Arrow keys get preventDefault so they can't accidentally scroll the page.
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      keys.current.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      keys.current.clear();
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [enabled]);

  // Connect the domElement and manage touch-action per mode.
  // touch-action:none gives OrbitControls full gesture ownership on mobile
  // (pinch-to-zoom, two-finger pan) in explore mode.
  useEffect(() => {
    if (!controls) {
      gl.domElement.style.touchAction = 'pan-y';
      return;
    }
    controls.connect(gl.domElement);
    gl.domElement.style.touchAction = 'none';
    return () => {
      controls.dispose();
      gl.domElement.style.touchAction = 'pan-y';
    };
  }, [controls, gl]);

  // Single useFrame at priority -1:
  //  1. controls.update() applies damping + mouse/touch input
  //  2. WASD/arrow movement shifts both camera.position AND controls.target
  //     by the same delta — keeping the orbit pivot in front of the camera
  //     so OrbitControls doesn't snap back to the old pivot next frame.
  useFrame(() => {
    if (!controls) return;
    controls.update();

    const k = keys.current;
    if (k.size === 0) return;

    camera.getWorldDirection(_forward);
    _right.crossVectors(_forward, _up).normalize();
    _delta.set(0, 0, 0);

    if (k.has('KeyW') || k.has('ArrowUp'))    _delta.addScaledVector(_forward,  MOVE_SPEED);
    if (k.has('KeyS') || k.has('ArrowDown'))  _delta.addScaledVector(_forward, -MOVE_SPEED);
    if (k.has('KeyA') || k.has('ArrowLeft'))  _delta.addScaledVector(_right,   -MOVE_SPEED);
    if (k.has('KeyD') || k.has('ArrowRight')) _delta.addScaledVector(_right,    MOVE_SPEED);

    camera.position.add(_delta);
    controls.target.add(_delta);
  }, -1);

  if (!controls) return null;
  return <primitive object={controls} />;
}
