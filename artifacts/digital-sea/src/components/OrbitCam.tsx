import { useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import * as THREE from 'three';

const _dir = new THREE.Vector3();

interface Props {
  enabled: boolean;
}

export function OrbitCam({ enabled }: Props) {
  const { camera, gl } = useThree();

  // Create and fully configure the controls instance during the React render
  // phase (useMemo runs synchronously). The target is set here — before the
  // first useFrame ever fires — so there is zero window in which OrbitControls
  // can update() against the wrong target and swing the camera.
  //
  // When enabled=false we return null so no controls object exists and no
  // update() calls happen; the scroll/CameraRig path owns the camera entirely.
  const controls = useMemo(() => {
    if (!enabled) return null;

    // Capture the camera's exact direction RIGHT NOW (this render was triggered
    // by the mode switch; CameraRig set this in the previous frame).
    camera.getWorldDirection(_dir);

    const oc = new ThreeOrbitControls(camera);

    // Lock the pivot to 10 units directly ahead of the camera.
    // This is the only line that prevents the jump: target must be set
    // before the very first update() call, with no asynchronous gap.
    oc.target.copy(camera.position).addScaledVector(_dir, 10);

    oc.enableDamping = true;
    oc.dampingFactor = 0.08;
    oc.rotateSpeed = 0.5;
    oc.panSpeed = 0.65;
    oc.zoomSpeed = 0.7;
    oc.minDistance = 1;
    oc.maxDistance = 180;
    oc.enablePan = true;
    oc.enableZoom = true;
    oc.enableRotate = true;

    // Sync internal spherical state from the camera's current position
    // relative to the target we just set — before any user input or frame.
    oc.update();

    return oc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // camera is stable; enabled is the only meaningful trigger

  // Connect the domElement and manage touch-action per mode.
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

  // Run update every frame at priority -1 (same as drei's OrbitControls)
  // so damping and user input are processed before the scene renders.
  useFrame(() => {
    if (controls) controls.update();
  }, -1);

  if (!controls) return null;
  return <primitive object={controls} />;
}
