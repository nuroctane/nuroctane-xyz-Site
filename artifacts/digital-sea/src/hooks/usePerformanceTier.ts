import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export type PerformanceTier = 'high' | 'medium' | 'low' | 'minimal';

function detectInitialTier(): PerformanceTier {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const navC = navigator as Navigator & { connection?: { effectiveType?: string } };
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const mem = nav.deviceMemory ?? (isMobile ? 2 : 8);
  const cores = nav.hardwareConcurrency ?? (isMobile ? 4 : 8);
  const conn = navC.connection?.effectiveType;

  let score = 0;
  if (mem >= 8) score += 2; else if (mem >= 4) score += 1;
  if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
  if (!isMobile) score += 1;
  if (conn === '4g') score += 1; else if (conn === 'slow-2g' || conn === '2g') score -= 1;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  if (score >= 1) return 'low';
  return 'minimal';
}

function runGPUBenchmark(): Promise<number> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('webgl', { alpha: false });
    if (!ctx) { resolve(0); return; }
    const gl = ctx;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, 'attribute vec2 a; void main(){gl_Position=vec4(a,0,1);}');
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, 'precision highp float; void main(){gl_FragColor=vec4(1,1,1,1);}');
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const times: number[] = [];
    let raf = 0;
    const start = performance.now();
    function frame(now: number) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      times.push(now);
      if (now - start < 200) { raf = requestAnimationFrame(frame); return; }
      cancelAnimationFrame(raf);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      const deltas = times.slice(1).map((t, i) => t - times[i]);
      resolve(deltas.reduce((a, b) => a + b, 0) / deltas.length);
    }
    raf = requestAnimationFrame(frame);
  });
}

// Generate a GPU fingerprint for caching benchmark results
function getGPUFingerprint(): string {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return 'unknown';
  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  return `${vendor}~${renderer}`;
}

export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>(() => detectInitialTier());

  useEffect(() => {
    let cancelled = false;
    const fingerprint = getGPUFingerprint();
    const cacheKey = `gpu-benchmark-${fingerprint}`;
    
    // Check sessionStorage for cached result
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const cachedMs = parseFloat(cached);
      if (!isNaN(cachedMs) && cachedMs > 18) {
        const downgrade: Record<PerformanceTier, PerformanceTier> = {
          high: 'medium', medium: 'low', low: 'minimal', minimal: 'minimal',
        };
        setTier(downgrade[tier]);
        return;
      }
    }

    runGPUBenchmark().then(avgMs => {
      if (cancelled || avgMs === 0) return;
      
      // Cache the result
      sessionStorage.setItem(cacheKey, String(avgMs));
      
      if (avgMs > 18) {
        const downgrade: Record<PerformanceTier, PerformanceTier> = {
          high: 'medium', medium: 'low', low: 'minimal', minimal: 'minimal',
        };
        setTier(downgrade[tier]);
      }
    });
    return () => { cancelled = true; };
  }, [tier]);

  useEffect(() => {
    (window as any).__perfDowngrade = () => setTier('minimal');
    return () => { delete (window as any).__perfDowngrade; };
  }, []);

  return tier;
}

export function FrameMonitor() {
  const samples = useRef<number[]>([]);
  const degraded = useRef(false);

  useFrame((_, delta) => {
    if (degraded.current) return;

    const buf = samples.current;
    buf.push(delta * 1000);
    if (buf.length > 60) buf.shift();
    if (buf.length < 30) return;

    let bad = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] > 22) bad++;
    }
    if (bad > 18) {
      degraded.current = true;
      (window as any).__perfDowngrade?.();
    }
  });

  return null;
}
