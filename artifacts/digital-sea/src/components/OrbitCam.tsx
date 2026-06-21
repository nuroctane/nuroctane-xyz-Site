import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const _dir = new THREE.Vector3();

interface Props {
  enabled: boolean;
}

export function OrbitCam({ enabled }: Props) {
  const { camera } = useThree();
  const orbitRef = useRef<any>(null);
  // Reinforce the target sync for one extra frame after activation
  const syncFrames = useRef(0);

  // Anchor the orbit pivot directly ahead of the camera the instant explore
  // mode activates. OrbitControls defaults its target to world origin (0,0,0);
  // without this the camera would swing to look at the origin on switch — the
  // "jump" where you lose the card you were near. Doing it synchronously in the
  // effect (before the next rAF / OrbitControls.update) keeps the view put.
  useEffect(() => {
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

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={enabled}
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
      makeDefault={enabled}
    />
  );
}
