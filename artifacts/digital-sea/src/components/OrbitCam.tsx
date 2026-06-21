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
  // Flag: set target on the very next frame when camera mode activates
  const needsSync = useRef(false);

  useEffect(() => {
    if (enabled) needsSync.current = true;
  }, [enabled]);

  useFrame(() => {
    if (needsSync.current && orbitRef.current) {
      needsSync.current = false;
      camera.getWorldDirection(_dir);
      // Orbit around a point 10 units ahead of the camera — preserves current view
      orbitRef.current.target
        .copy(camera.position)
        .addScaledVector(_dir, 10);
      orbitRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={enabled}
      enableDamping
      dampingFactor={0.06}
      /* Very slow, deliberate movement */
      rotateSpeed={0.14}
      panSpeed={0.18}
      zoomSpeed={0.22}
      minDistance={1}
      maxDistance={180}
      enablePan
      enableZoom
      enableRotate
      makeDefault={enabled}
    />
  );
}
