import { useRef, useEffect, useLayoutEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const _dir = new THREE.Vector3();

interface Props {
  enabled: boolean;
}

export function OrbitCam({ enabled }: Props) {
  const { camera, gl } = useThree();
  const orbitRef = useRef<any>(null);
  // Reinforce the target sync for one extra frame after activation
  const syncFrames = useRef(0);

  // three's OrbitControls forces `touch-action: none` on the canvas when it
  // connects — even while disabled. On touch devices that kills native vertical
  // page scroll entirely, so scroll/"swim" mode becomes completely stuck on
  // mobile (desktop wheel scroll is unaffected, hence PC works). Re-assert the
  // right value per mode: `pan-y` hands vertical touch scrolling back to the
  // browser in scroll mode; `none` gives OrbitControls full gesture control in
  // explore mode (where page scroll is already locked via body overflow). This
  // effect runs after the controls' connect, so it wins.
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = enabled ? 'none' : 'pan-y';
    return () => { el.style.touchAction = 'pan-y'; };
  }, [enabled, gl]);

  // Anchor the orbit pivot directly ahead of the camera the instant explore
  // mode activates. OrbitControls defaults its target to world origin (0,0,0);
  // without this the camera would swing to look at the origin on switch.
  // useLayoutEffect fires synchronously after mount, before the first rAF,
  // so the target is set before drei's internal useFrame calls controls.update()
  // — which is what caused the camera to jump/face toward origin on toggle.
  useLayoutEffect(() => {
    if (enabled && orbitRef.current) {
      camera.getWorldDirection(_dir);
      orbitRef.current.target.copy(camera.position).addScaledVector(_dir, 10);
      orbitRef.current.update();
      syncFrames.current = 2;
    }
  }, [enabled, camera]);

  useFrame(() => {
    if (syncFrames.current > 0 && orbitRef.current) {
      syncFrames.current -= 1;
      camera.getWorldDirection(_dir);
      orbitRef.current.target.copy(camera.position).addScaledVector(_dir, 10);
      orbitRef.current.update();
    }
  });

  // Mount OrbitControls ONLY in explore mode. three's OrbitControls forces
  // `touch-action: none` on the canvas the moment it connects, and only restores
  // it on dispose/disconnect (unmount). Keeping it mounted-but-disabled in scroll
  // mode is exactly what froze mobile scrolling — the canvas stayed `none`.
  // Unmounting it in scroll mode hands touch scrolling back to the browser
  // deterministically (the touch-action effect above then sets the precise value).
  if (!enabled) return null;

  return (
    <OrbitControls
      ref={orbitRef}
      enabled
      enableDamping
      dampingFactor={0.08}
      /* Responsive but controllable */
      rotateSpeed={0.5}
      panSpeed={0.65}
      zoomSpeed={0.7}
      minDistance={1}
      maxDistance={180}
      enablePan
      enableZoom
      enableRotate
      makeDefault
    />
  );
}
