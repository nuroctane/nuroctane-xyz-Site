import { Canvas } from '@react-three/fiber';
import { Component, MutableRefObject, Suspense, ReactNode } from 'react';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { Blocks } from './Blocks';
import { Particles } from './Particles';
import { Nodes } from './Nodes';
import { Effects } from './Effects';
import { LightShafts } from './LightShafts';
import { PerformanceTier } from '../hooks/usePerformanceTier';

interface Props {
  scrollProgress: MutableRefObject<number>;
  tier: PerformanceTier;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const NoWebGLFallback = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: '#04091a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#4a7fa8',
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
    }}
  >
    <div style={{ color: '#c0e4ff' }}>SYS://DIGITAL_SEA</div>
    <div>WebGL not available in this environment.</div>
    <div style={{ color: '#4a7fa8' }}>Open in a modern browser to experience the full 3D scene.</div>
  </div>
);

export function Scene({ scrollProgress, tier }: Props) {
  return (
    <WebGLErrorBoundary fallback={<NoWebGLFallback />}>
      <Canvas
        gl={{
          antialias: tier === 'high',
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ fov: 65, near: 0.1, far: 400, position: [0, 0, 25] }}
        dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
        style={{ position: 'fixed', inset: 0 }}
        onCreated={({ gl }) => {
          // Suppress the THREE.Clock deprecation warning
          gl.setPixelRatio(window.devicePixelRatio);
        }}
      >
        {/* Ocean blue deep-sea palette */}
        <color attach="background" args={['#04091a']} />
        <fog attach="fog" args={['#050d20', 28, 185]} />

        {/* Deep ambient — cold ocean blue */}
        <ambientLight intensity={0.2} color="#1a3a70" />

        {/* Key light — bright surface-light shaft from above */}
        <directionalLight position={[3, 22, 8]} intensity={2.2} color="#6cc8ff" />

        {/* Fill lights scattered through the corridor */}
        <pointLight position={[0, 12, 0]} intensity={3.0} color="#a0d8ff" distance={90} decay={2} />
        <pointLight position={[-10, 4, -45]} intensity={1.8} color="#1a6aaa" distance={70} decay={2} />
        <pointLight position={[10, 6, -90]} intensity={1.8} color="#0e4a88" distance={70} decay={2} />
        <pointLight position={[-6, 8, -135]} intensity={1.6} color="#1a6aaa" distance={60} decay={2} />

        <Suspense fallback={null}>
          <Blocks />
          <LightShafts />
          <Particles count={tier === 'high' ? 3000 : 1200} />
          <Nodes scrollProgress={scrollProgress} />
        </Suspense>

        <CameraRig scrollProgress={scrollProgress} />
        <Effects tier={tier} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
