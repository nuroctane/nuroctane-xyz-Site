import { useMemo, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

// Scratch vectors — allocated once, reused every frame
const _dir     = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right   = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);
const _delta   = new THREE.Vector3();

// Generous world-space movement bounds (path goes z≈28 → z≈-182; add headroom)
const XMIN = -45, XMAX = 45;
const YMIN = -22, YMAX = 34;
const ZMIN = -230, ZMAX = 36;

const MOVE_SPEED = 14; // units per second

const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space',
  'ControlLeft', 'ControlRight',
]);

interface Props {
  enabled: boolean;
}

export function OrbitCam({ enabled }: Props) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());

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
    oc.maxDistance    = window.innerWidth < 768 ? 60 : 180;
    oc.enablePan      = true;
    oc.enableZoom     = true;
    oc.enableRotate   = true;
    oc.update();
    return oc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey) return;
      if (e.ctrlKey && e.code !== 'ControlLeft' && e.code !== 'ControlRight') return;
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

  useFrame(({ camera: cam }, delta) => {
    if (!controls) return;

    const k      = keys.current;
    const moving = k.size > 0;

    controls.dampingFactor = moving ? 0.5 : 0.08;
    controls.update();

    if (!moving) return;

    cam.getWorldDirection(_forward);
    _right.crossVectors(_forward, _worldUp).normalize();
    _delta.set(0, 0, 0);

    const speed = MOVE_SPEED * Math.min(delta, 0.1);

    if (k.has('KeyW') || k.has('ArrowUp'))                   _delta.addScaledVector(_forward,  speed);
    if (k.has('KeyS') || k.has('ArrowDown'))                  _delta.addScaledVector(_forward, -speed);
    if (k.has('KeyA') || k.has('ArrowLeft'))                  _delta.addScaledVector(_right,   -speed);
    if (k.has('KeyD') || k.has('ArrowRight'))                 _delta.addScaledVector(_right,    speed);
    if (k.has('Space'))                                        _delta.addScaledVector(_worldUp,  speed);
    if (k.has('ControlLeft') || k.has('ControlRight'))        _delta.addScaledVector(_worldUp, -speed);

    const nx = THREE.MathUtils.clamp(cam.position.x + _delta.x, XMIN, XMAX);
    const ny = THREE.MathUtils.clamp(cam.position.y + _delta.y, YMIN, YMAX);
    const nz = THREE.MathUtils.clamp(cam.position.z + _delta.z, ZMIN, ZMAX);

    const cx = nx - cam.position.x;
    const cy = ny - cam.position.y;
    const cz = nz - cam.position.z;

    cam.position.set(nx, ny, nz);
    controls.target.x += cx;
    controls.target.y += cy;
    controls.target.z += cz;
  }, -1);

  if (!controls) return null;
  return <primitive object={controls} />;
}
