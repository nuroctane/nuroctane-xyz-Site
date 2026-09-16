import { useEffect, useRef, useState } from 'react';
import { createProgram, destroyProgram } from './wallpaper/gl';
import { VARIANTS, WALLPAPER_ORDER, mountVariant } from './wallpaper/variants';
import { useReducedMotion, useWallpaper } from './WallpaperProvider';
import './blackboard-wallpaper.css';

const MOBILE_QUERY = '(max-width: 900px)';

/* ═══════════════════════════════════════════════════════════════════════════
   BLACKBOARD WALLPAPER LAYER

   Two CSS plate layers cross-fade between the Wallpaper Engine ports, and a
   single WebGL canvas on top paints the live scene. The canvas and the plate
   are the same image, so the swap is invisible: the canvas is faded out for the
   duration of a variant change and faded back in on the new scene's first
   frame, while the plates carry the visible transition underneath.

   The canvas is transparent until the scene can actually paint — every sampler
   bound and the plate decoded — so the CSS plate shows through and there is
   never a flash of empty or half-wired background. Reduced motion renders one
   settled still; no WebGL at all falls back to the plates.
   ═══════════════════════════════════════════════════════════════════════════ */
export function BlackboardWallpaper() {
  const { variant, activate } = useWallpaper();
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const [painted, setPainted] = useState(false);
  // Bumped when the browser hands back a lost context, to remount the scene.
  const [generation, setGeneration] = useState(0);

  // Only build the luminance field where the wallpaper actually shows.
  useEffect(() => {
    activate();
  }, [activate]);

  // One context for the life of the layer. Losing it per variant would leave
  // the canvas unable to hand out a second context on the next switch.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return undefined;
    glRef.current = gl;

    // A driver reset or a reclaimed background tab kills the context; without
    // this the canvas would sit blank over the plate for the rest of the visit.
    const onLost = (event: Event) => {
      // preventDefault is what makes the context restorable at all.
      event.preventDefault();
      setPainted(false);
    };
    const onRestored = () => setGeneration(value => value + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      glRef.current = null;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // Mount the active scene onto that context.
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl || gl.isContextLost()) return undefined;

    const scene = VARIANTS[variant];
    const mobileQuery = window.matchMedia(MOBILE_QUERY);

    setPainted(false);
    const program = createProgram(gl, scene.vertex, scene.fragment);
    if (!program) return undefined;
    const mounted = mountVariant(gl, program, scene, mobileQuery.matches);
    if (!mounted) {
      destroyProgram(gl, program);
      return undefined;
    }
    const { runtime, quad } = mounted;

    const resize = () => {
      const renderScale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.7 * (mobileQuery.matches ? 0.8 : 1);
      const width = Math.max(1, Math.round(canvas.clientWidth * renderScale));
      const height = Math.max(1, Math.round(canvas.clientHeight * renderScale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    gl.clearColor(0, 0, 0, 0);

    let raf = 0;
    let lastDraw = 0;
    let running = false;
    let announced = false;

    const renderFrame = (seconds: number) => {
      resize();
      gl.clear(gl.COLOR_BUFFER_BIT);
      const drawn = runtime.frame(gl, seconds);
      if (drawn && !announced) {
        announced = true;
        setPainted(true);
      }
      return drawn;
    };

    // 30fps is plenty for this motion and halves the GPU cost.
    const loop = (now: number) => {
      // A source image that failed to decode can never paint; stop the chain
      // rather than spinning at 30fps forever.
      if (!runtime.alive()) {
        stop();
        return;
      }
      raf = window.requestAnimationFrame(loop);
      if (now - lastDraw < 33) return;
      lastDraw = now;
      renderFrame(now / 1000);
    };
    const start = () => {
      if (running) return;
      running = true;
      lastDraw = 0;
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    let onVisibility: (() => void) | undefined;
    if (reduced) {
      // Retry until the scene can paint, then settle on a single still.
      // Bounded so a plate that never decodes cannot leave a rAF loop running.
      let attempts = 0;
      const still = () => {
        if (renderFrame(37) || !runtime.alive()) return;
        if (attempts++ < 600) raf = window.requestAnimationFrame(still);
      };
      raf = window.requestAnimationFrame(still);
    } else {
      onVisibility = () => {
        if (document.hidden) stop();
        else start();
      };
      document.addEventListener('visibilitychange', onVisibility);
      start();
    }

    const onResize = () => {
      resize();
      if (reduced) renderFrame(37);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      stop();
      runtime.dispose(gl);
      gl.deleteBuffer(quad);
      destroyProgram(gl, program);
    };
  }, [generation, reduced, variant]);

  return (
    <div className="bb-wallpaper" aria-hidden="true">
      {WALLPAPER_ORDER.map(id => (
        <div
          key={id}
          className="bb-wallpaper-plate"
          data-variant={id}
          data-active={id === variant}
        />
      ))}
      <canvas ref={canvasRef} className="bb-wallpaper-canvas" data-painted={painted} />
    </div>
  );
}
