import { useEffect, useRef } from 'react';
import './blackboard-wallpaper.css';

/* ═══════════════════════════════════════════════════════════════════════════
   BLACKBOARD WALLPAPER — WebGL port of Wallpaper Engine workshop item
   2207944762 ("Black & White Abstract"), extracted from its scene.pkg.

   The scene is one fullscreen image with four live effects; the constants
   below are the ones scene.json overrides, so the motion matches the
   original: waterripple (shimmering streaks), drifting clouds, radial
   godrays and a faint shine sweep, all tinted monochrome.

   The canvas is transparent until the texture arrives — the CSS fallback
   (same JPEG) shows through, so there is no flash. Reduced-motion renders
   a single still. No WebGL → pure CSS background.
   ═══════════════════════════════════════════════════════════════════════════ */

const VERTEX_SRC = `
attribute vec2 a_Position;
varying vec2 vUv;
void main() {
  vUv = a_Position * 0.5 + 0.5;
  gl_Position = vec4(a_Position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uNoise;
uniform sampler2D uNormal;
uniform float uTime;
uniform float uMotion;
uniform float uAspect;
uniform float uImageAspect;

vec2 coverUv(vec2 uv) {
  vec2 s = uAspect > uImageAspect
    ? vec2(1.0, uImageAspect / uAspect)
    : vec2(uAspect / uImageAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 rayMarch(vec2 uv, vec2 center, float lengthK, float threshold, float noiseAmount, float intensity) {
  vec2 toC = center - uv;
  float dist = length(toC);
  vec2 dir = toC / max(dist, 1e-4);
  float d = dist * lengthK;
  vec2 sp = uv + dir * d;
  vec2 stepv = dir * d / 23.0;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 24; i++) {
    vec3 s = texture2D(uImage, coverUv(sp)).rgb;
    float lum = dot(s, vec3(0.299, 0.587, 0.114));
    float n = texture2D(uNoise, sp * 1.5 + uTime * 0.02).r;
    float b = smoothstep(threshold, threshold + 0.5, lum) * (1.0 - noiseAmount * n);
    acc += s * b * (float(i) / 23.0);
    sp -= stepv;
  }
  return acc * intensity * 0.092;
}

void main() {
  // waterripple: animationspeed 0.1, scale 1.58, ratio 1.14, strength 0.13^2
  float t2 = uTime * 0.01 * uMotion;
  vec4 rp;
  rp.xy = vUv + vec2(t2);
  rp.zw = vUv * 1.333 - vec2(t2);
  rp *= 1.58;
  rp.xz *= uAspect;
  rp.yw *= 1.14;
  vec3 n1 = texture2D(uNormal, rp.xy).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormal, rp.zw).xyz * 2.0 - 1.0;
  vec3 nrm = normalize(vec3(n1.xy + n2.xy, max(n1.z, 0.35)));
  vec2 uv = coverUv(vUv) + nrm.xy * 0.0169 * uMotion;

  vec3 col = texture2D(uImage, uv).rgb;

  // Exposure lift: the raw plate is very dark; raise mids so the streak
  // texture reads on every display instead of collapsing to black.
  col = pow(max(col, 0.0), vec3(0.75)) * 1.45 + 0.035;

  // clouds: speeds 0.01/-0.02, smoothness (LOD) 1.38, threshold 0.24, alpha 0.5
  vec2 c1 = vUv * 1.6 + uTime * uMotion * vec2(0.01, -0.02);
  vec2 c2 = vec2(-vUv.y, vUv.x) * 2.1 - uTime * uMotion * vec2(0.02, 0.01);
  float cl0 = texture2D(uNoise, c1, 1.38).r;
  float cl1 = texture2D(uNoise, c2, 1.38).r;
  float cloud = smoothstep(0.28, 0.78, cl0 * cl1 * 1.35);
  col = mix(col, vec3(1.0), cloud * (0.32 + (uMotion - 1.0) * 0.07));

  // godrays: raylength 0.51, raythreshold 0.14, noiseamount 0.49, rayintensity 2
  col += rayMarch(vUv, vec2(0.5, 0.58), 0.51, 0.14, 0.49, 2.0);
  // shine: raythreshold 0.35, rayintensity 0.2
  col += rayMarch(vUv, vec2(0.44, 0.48), 0.4, 0.35, 0.25, 0.4);

  // tint: scene.json pins the scheme to gray — render pure monochrome
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = vec3(lum);

  gl_FragColor = vec4(col, 1.0);
}
`;

const DESKTOP_SRC = '/assets/blackboard/wallpaper.jpg';
const MOBILE_SRC = '/assets/blackboard/wallpaper-1280.jpg';
const MOBILE_QUERY = '(max-width: 900px)';

/** Tileable value-noise texture, standing in for WE's util/clouds_256. */
function makeNoiseCanvas(size: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  const octaves = [
    { cells: 4, amp: 0.52 },
    { cells: 8, amp: 0.27 },
    { cells: 16, amp: 0.14 },
    { cells: 32, amp: 0.07 },
  ];
  const grids = octaves.map(({ cells }) => {
    const g = new Float32Array(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    return g;
  });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (let k = 0; k < octaves.length; k++) {
        const { cells, amp } = octaves[k];
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const g = grids[k];
        const r0 = (y0 % cells) * cells;
        const r1 = ((y0 + 1) % cells) * cells;
        const c0 = x0 % cells;
        const c1 = (x0 + 1) % cells;
        const a = g[r0 + c0] + (g[r0 + c1] - g[r0 + c0]) * sx;
        const b = g[r1 + c0] + (g[r1 + c1] - g[r1 + c0]) * sx;
        v += (a + (b - a) * sy) * amp;
      }
      const p = (y * size + x) * 4;
      const val = Math.max(0, Math.min(255, Math.round(v * 255)));
      img.data[p] = val;
      img.data[p + 1] = val;
      img.data[p + 2] = val;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Tileable normal map for the waterripple UV perturbation. */
function makeNormalCanvas(size: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Smooth wrapped height field — two low-frequency octaves.
  const height = new Float32Array(size * size);
  const layers = [
    { cells: 3, amp: 1 },
    { cells: 6, amp: 0.4 },
  ];
  const grids = layers.map(({ cells }) => {
    const g = new Float32Array(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    return g;
  });
  const sample = (x: number, y: number) => {
    let v = 0;
    for (let k = 0; k < layers.length; k++) {
      const { cells, amp } = layers[k];
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const g = grids[k];
      const r0 = (y0 % cells) * cells;
      const r1 = ((y0 + 1) % cells) * cells;
      const c0 = x0 % cells;
      const c1 = (x0 + 1) % cells;
      const a = g[r0 + c0] + (g[r0 + c1] - g[r0 + c0]) * sx;
      const b = g[r1 + c0] + (g[r1 + c1] - g[r1 + c0]) * sx;
      v += (a + (b - a) * sy) * amp;
    }
    return v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = sample(x, y);
    }
  }
  const img = ctx.createImageData(size, size);
  const strength = 3.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = height[y * size + ((x - 1 + size) % size)];
      const r = height[y * size + ((x + 1) % size)];
      const u = height[((y - 1 + size) % size) * size + x];
      const d = height[((y + 1) % size) * size + x];
      let nx = (l - r) * strength;
      let ny = (u - d) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      const p = (y * size + x) * 4;
      img.data[p] = Math.round((nx * 0.5 + 0.5) * 255);
      img.data[p + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      img.data[p + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function uploadTexture(gl: WebGLRenderingContext, index: number, source: TexImageSource, repeat: boolean, mipmap: boolean) {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (mipmap) gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}

export function BlackboardWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;

    let cleanupVisibility: (() => void) | undefined;

    const vert = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram();
    if (!vert || !frag || !program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_Position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uMotion = gl.getUniformLocation(program, 'uMotion');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uNoise'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uNormal'), 2);

    const noiseCanvas = makeNoiseCanvas(256);
    const normalCanvas = makeNormalCanvas(256);
    if (!noiseCanvas || !normalCanvas) return;
    uploadTexture(gl, 1, noiseCanvas, true, true);
    uploadTexture(gl, 2, normalCanvas, true, false);
    gl.activeTexture(gl.TEXTURE0);

    const image: HTMLImageElement = new Image();
    image.decoding = 'async';
    let ready = false;
    image.onload = () => {
      uploadTexture(gl, 0, image, false, false);
      gl.uniform1f(uImageAspect, image.naturalWidth / image.naturalHeight);
      ready = true;
    };

    const resize = () => {
      const mobile = window.matchMedia(MOBILE_QUERY).matches;
      const renderScale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.7 * (mobile ? 0.8 : 1);
      // Keep the stronger ripple and cloud drift consistent across screen sizes.
      gl.uniform1f(uMotion, 2.8);
      const width = Math.max(1, Math.round(canvas.clientWidth * renderScale));
      const height = Math.max(1, Math.round(canvas.clientHeight * renderScale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform1f(uAspect, canvas.width / canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    gl.clearColor(0, 0, 0, 0);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastDraw = 0;
    let running = false;
    const draw = (now: number) => {
      if (!ready) return;
      resize();
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // 30fps is plenty for this motion and halves the GPU cost.
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < 33) return;
      lastDraw = now;
      draw(now);
    };
    const start = () => {
      if (running) return;
      running = true;
      lastDraw = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    if (reduced) {
      // One settled still frame once the texture is up.
      const still = () => {
        if (!ready) { raf = requestAnimationFrame(still); return; }
        draw(37000);
      };
      raf = requestAnimationFrame(still);
    } else {
      const onVisibility = () => {
        if (document.hidden) stop();
        else start();
      };
      document.addEventListener('visibilitychange', onVisibility);
      cleanupVisibility = () => document.removeEventListener('visibilitychange', onVisibility);
      start();
    }

    const onResize = () => { resize(); if (reduced) draw(37000); };
    window.addEventListener('resize', onResize);
    image.onerror = stop;
    image.src = window.matchMedia(MOBILE_QUERY).matches ? MOBILE_SRC : DESKTOP_SRC;

    return () => {
      image.onload = null;
      image.onerror = null;
      window.removeEventListener('resize', onResize);
      stop();
      window.removeEventListener('resize', resize);
      cleanupVisibility?.();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="bb-wallpaper" aria-hidden="true" />;
}
