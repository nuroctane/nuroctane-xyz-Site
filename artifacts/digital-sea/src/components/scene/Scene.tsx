import { Canvas, useThree } from "@react-three/fiber";
import {
  Component,
  MutableRefObject,
  Suspense,
  ReactNode,
  useEffect,
} from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { OrbitCam } from "./OrbitCam";
import { Blocks } from "./Blocks";
import { Structures } from "./Structures";
import { Particles } from "./Particles";
import { Nodes } from "./Nodes";
import { BlogNodes } from "./BlogNodes";
import { PortalGates } from "./PortalGates";
import { FakeNodes } from "./FakeNodes";
import { Effects } from "./Effects";
import { SeaColorShift } from "./SeaColorShift";
import { LightShafts } from "./LightShafts";
import type { PerformanceTier } from "../../hooks/usePerformanceTier";
import { FrameMonitor } from "../../hooks/usePerformanceTier";
import type { Mode, Track } from "../../types";
import { SEA_SCENE } from "../../theme/seaTheme";

interface Props {
  scrollProgress: MutableRefObject<number>;
  tier: PerformanceTier;
  mode: Mode;
  activeTrack: Track;
  finUnlocked: boolean;
  portalsArmed: boolean;
  onFinClick: () => void;
  onBlogClick: () => void;
  onPortalsBlurred: () => void;
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
      position: "fixed",
      inset: 0,
      background: SEA_SCENE.background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "1rem",
      fontFamily: "var(--font-body-pixel)",
      color: "#91aaa0",
      fontSize: "0.75rem",
      letterSpacing: "0.1em",
    }}
  >
    <div
      style={{ color: SEA_SCENE.goldBright, fontFamily: "var(--font-system)" }}
    >
      SYS://DIGITAL_SEA
    </div>
    <div>WebGL not available in this environment.</div>
    <div style={{ color: "#91aaa0" }}>
      Open in a modern browser to experience the full 3D scene.
    </div>
  </div>
);

// ── Responsive FOV ─────────────────────────────────────────────────────────
// Three.js fov is vertical.  On a 375×667 phone the horizontal FOV is only
// ~39° vs ~97° on desktop — cards at the edge get clipped.  We widen the
// vertical FOV on portrait screens so horizontal coverage stays reasonable
// (~55° on phone, ~60° on iPad portrait).  Combined with the CameraRig push-
// back (mobileFactor=1.3) cards appear smaller on screen and fit comfortably.
function ResponsiveCamera() {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    const update = () => {
      const aspect = window.innerWidth / window.innerHeight;
      let fov = 65;
      if (aspect < 1) {
        // 65/sqrt(aspect): on 375×667 gives 85° (hFOV~55°), on iPad 768×1024
        // gives 75° (hFOV~60°), on narrow iPhone 414×896 gives 85° (hFOV~46°).
        fov = Math.min(85, 65 / Math.sqrt(aspect));
      }
      if (Math.abs(cam.fov - fov) > 0.5) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cam]);
  return null;
}

export function Scene({
  scrollProgress,
  tier,
  mode,
  activeTrack,
  finUnlocked,
  portalsArmed,
  onFinClick,
  onBlogClick,
  onPortalsBlurred,
}: Props) {
  return (
    <WebGLErrorBoundary fallback={<NoWebGLFallback />}>
      <Canvas
        gl={{
          antialias: tier === "high",
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{ fov: 65, near: 0.1, far: 450, position: [0, 0, 25] }}
        dpr={tier === "high" ? [1, 1.25] : [1, 1]}
        style={{ position: "fixed", inset: 0 }}
      >
        <color attach="background" args={[SEA_SCENE.background]} />
        <fog attach="fog" args={[SEA_SCENE.fog, 30, 220]} />

        <ambientLight intensity={0.28} color={SEA_SCENE.ambient} />
        <directionalLight
          position={[4, 24, 10]}
          intensity={2.25}
          color={SEA_SCENE.goldBright}
        />
        <pointLight
          position={[0, 14, 0]}
          intensity={3.1}
          color={SEA_SCENE.turquoise}
          distance={100}
          decay={2}
        />
        <pointLight
          position={[-12, 5, -50]}
          intensity={2.0}
          color={SEA_SCENE.purple}
          distance={80}
          decay={2}
        />
        <pointLight
          position={[12, 7, -100]}
          intensity={2.05}
          color={SEA_SCENE.gold}
          distance={80}
          decay={2}
        />
        {tier === "high" && (
          <>
            <pointLight
              position={[-8, 9, -150]}
              intensity={1.8}
              color={SEA_SCENE.turquoiseDeep}
              distance={70}
              decay={2}
            />
            <pointLight
              position={[-24, 5, -50]}
              intensity={1.65}
              color={SEA_SCENE.brown}
              distance={70}
              decay={2}
            />
            <pointLight
              position={[-24, 5, -120]}
              intensity={1.7}
              color={SEA_SCENE.purple}
              distance={70}
              decay={2}
            />
          </>
        )}

        <Suspense fallback={null}>
          <Blocks />
          <Structures tier={tier} />
          {tier !== "low" && tier !== "minimal" && <LightShafts />}
          <Particles
            count={
              tier === "high"
                ? 3000
                : tier === "medium"
                  ? 1200
                  : tier === "low"
                    ? 600
                    : 200
            }
          />
          <Nodes
            scrollProgress={scrollProgress}
            mode={mode}
            activeTrack={activeTrack}
            tier={tier}
          />
          <BlogNodes
            scrollProgress={scrollProgress}
            mode={mode}
            activeTrack={activeTrack}
            tier={tier}
          />
          <FakeNodes
            mode={mode}
            count={
              tier === "high"
                ? 60
                : tier === "medium"
                  ? 48
                  : tier === "low"
                    ? 30
                    : 16
            }
            shapeCount={
              tier === "high"
                ? 30
                : tier === "medium"
                  ? 20
                  : tier === "low"
                    ? 12
                    : 6
            }
          />
          <PortalGates
            onFinClick={onFinClick}
            onBlogClick={onBlogClick}
            onPortalsBlurred={onPortalsBlurred}
            scrollProgress={scrollProgress}
            mode={mode}
            finUnlocked={finUnlocked}
            portalsArmed={portalsArmed}
          />
        </Suspense>

        <CameraRig scrollProgress={scrollProgress} mode={mode} />
        <ResponsiveCamera />
        <OrbitCam enabled={mode === "camera"} />
        <SeaColorShift mode={mode} tier={tier} />

        <Effects tier={tier} />
        <FrameMonitor />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
