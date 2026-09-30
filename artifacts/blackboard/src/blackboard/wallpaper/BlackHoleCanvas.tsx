import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useWallpaper } from '../WallpaperProvider';

// Workshop 2847920765: port of ParticleExperiments + ClassDefinitions, without
// p5 or WE's audio bridge. Project properties override the JS initial defaults:
// 1500 white particles, fade .4, clockwise offset .2, centre diameter 75,
// centre jitter .2, particle jitter 0. Saved audioprocessing=false is deliberate.
export function BlackHoleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState(false);
  const { reportFrame } = useWallpaper();
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const sample = document.createElement('canvas');
    const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
    let width = 1920;
    const height = 1080;
    let scale = 1;
    let raf = 0;
    let running = false;
    let lastDraw = 0;
    let lastSample = 0;
    // Seeded PRNG keeps reduced-motion and initial poster poses reproducible.
    let seed = 2847920765;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    type Particle = { x: number; y: number; px: number; py: number; dx: number; dy: number; speed: number };
    const spawn = (): Particle => {
      const x = random() * width; const y = random() * height;
      const angle = random() * Math.PI * 2;
      return { x, y, px: x, py: y, dx: Math.cos(angle), dy: Math.sin(angle), speed: 0.1 + random() * 0.9 };
    };
    let particles: Particle[] = [];
    const tick = () => {
      ctx.fillStyle = 'rgba(10,10,10,0.4)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) p = particles[i] = spawn();
        const oldX = p.x; const oldY = p.y;
        p.x += p.dx * p.speed; p.y += p.dy * p.speed;
        ctx.moveTo(p.px, p.py); ctx.lineTo(oldX, oldY); ctx.lineTo(p.x, p.y);
        p.px = oldX; p.py = oldY;
      }
      ctx.stroke();
      const jitter = random() * 0.2; const jitterAngle = random() * Math.PI * 2;
      ctx.beginPath(); ctx.fillStyle = '#000';
      ctx.arc(width / 2 + jitter * Math.cos(jitterAngle), height / 2 + jitter * Math.sin(jitterAngle), 37.5, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x = p.x - width / 2; const y = p.y - height / 2;
        if (Math.hypot(x, y) < 37.5) { particles[i] = spawn(); continue; }
        const angle = Math.atan2(y, x) - Math.PI * 0.6;
        p.dx = Math.cos(angle); p.dy = 0.5 * Math.sin(angle);
      }
    };
    const report = () => {
      if (!sampleCtx) return;
      sample.width = 48;
      sample.height = Math.max(1, Math.round(48 * canvas.clientHeight / Math.max(1, canvas.clientWidth)));
      sampleCtx.drawImage(canvas, 0, 0, sample.width, sample.height);
      reportFrame(sampleCtx.getImageData(0, 0, sample.width, sample.height).data,
        sample.width, sample.height, canvas.clientWidth, canvas.clientHeight, false);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w; canvas.height = h;
      // Height-normalised source coordinates retain the centre's proportions
      // in portrait, landscape and ultrawide, rather than stretching an ellipse.
      scale = h / height; width = w / scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, width, height);
      seed = 2847920765; particles = Array.from({ length: 1500 }, spawn);
      // A settled initial scene, also used when reduced motion is requested.
      for (let i = 0; i < 180; i++) tick();
      setPainted(true); report();
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < 1000 / 30) return;
      lastDraw = now; tick();
      if (now - lastSample > 180) { lastSample = now; report(); }
    };
    const sync = () => {
      if (document.hidden || reduced) {
        running = false; cancelAnimationFrame(raf);
      } else if (!running) {
        running = true; lastDraw = 0; raf = requestAnimationFrame(loop);
      }
    };
    resize(); sync();
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect(); document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(raf);
    };
  }, [reduced, reportFrame]);
  return <canvas ref={ref} className="bb-wallpaper-canvas" data-native="blackhole" data-painted={painted} />;
}
