/* ═══════════════════════════════════════════════════════════════════════════
   Blackboard wallpaper variants — WebGL ports of Wallpaper Engine workshop
   scenes, extracted from their scene.pkg containers.

     abstract  workshop 2207944762  "Black & White Abstract"
     clouds    workshop 3612455067  "Black & White Clouds"

   Both scenes are a single fullscreen image object with live materials on top;
   every constant below is the one scene.json overrides, so the motion matches
   the original. See wallpaper/README.md for how the .pkg and .tex were read.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createQuad, loadImage, makeNoiseCanvas, makeNormalCanvas, uploadTexture } from './gl';

export type WallpaperId = 'abstract' | 'clouds';

export interface WallpaperRuntime {
  /** Update uniforms and draw. Returns false when the plate is not decoded yet. */
  frame(gl: WebGLRenderingContext, time: number): boolean;
  /** False once the variant can never draw (a source image failed to decode). */
  alive: () => boolean;
  dispose(gl: WebGLRenderingContext): void;
}

export interface WallpaperVariant {
  id: WallpaperId;
  label: string;
  /** Plate sources for the CSS layer behind WebGL and reduced-motion stills. */
  plate: { desktop: string; mobile: string };
  vertex: string;
  fragment: string;
  /**
   * The sRGB tone curve the fragment shader applies to the plate, so the
   * luminance field behind the adaptive ink predicts what actually reaches the
   * screen rather than the raw file. Identity for a pass-through scene.
   */
  toneMap: (srgb: number) => number;
  create(gl: WebGLRenderingContext, program: WebGLProgram, mobile: boolean): WallpaperRuntime | null;
}

/**
 * Fullscreen quad. `y` is flipped so `vUv` is in IMAGE space — origin top-left,
 * matching how the plates are stored, how CSS lays them out, and what
 * luminance.ts assumes.
 *
 * WebGL uploads a source image's first row to t = 0, and clip-space y = -1 is
 * the BOTTOM of the screen, so the naive `a_Position * 0.5 + 0.5` mapping
 * samples the image upside down. (three.js defaults `texture.flipY` to true for
 * exactly this reason.) The abstract plate is near-symmetric — top quarter mean
 * 24 vs bottom 20 out of 255 — so the flip went unnoticed there; the clouds
 * plate is not, and an inverted sky would also invert the ink decision.
 */
const VERTEX_SRC = `
attribute vec2 a_Position;
varying vec2 vUv;
void main() {
  vUv = vec2(a_Position.x * 0.5 + 0.5, 0.5 - a_Position.y * 0.5);
  gl_Position = vec4(a_Position, 0.0, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   ABSTRACT — workshop 2207944762
   Four live effects over the plate: waterripple (shimmering streaks), drifting
   clouds, radial godrays and a faint shine sweep, all rendered monochrome.
   ═══════════════════════════════════════════════════════════════════════════ */
const PRECISION = `
// highp is optional in GLSL ES 1.00 fragment shaders, so declare it only where
// the compiler advertises support. uTime is plain seconds-since-mount: under
// mediump its ulp reaches ~10s after a few hours in a pinned tab, which would
// quantise every frac()-driven cycle.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

const ABSTRACT_FRAGMENT = `
${PRECISION}
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

/* ═══════════════════════════════════════════════════════════════════════════
   CLOUDS — workshop 3612455067
   One fullscreen plate with two masked distortion materials. Both masks are
   flow maps whose neutral value is 0.498, so flowMask == 0 outside the cloud
   mass: the cumulus breathes and drifts, the black sky stays perfectly still.
   ═══════════════════════════════════════════════════════════════════════════ */
const CLOUDS_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uShakeMask;
uniform sampler2D uFlowMask;
uniform sampler2D uPhase;
uniform float uTime;
uniform float uMotion;
uniform float uAspect;
uniform float uImageAspect;

#define PI_HALF 1.5707963267948966

float frac(float x) { return x - floor(x); }

vec2 coverUv(vec2 uv) {
  vec2 s = uAspect > uImageAspect
    ? vec2(1.0, uImageAspect / uAspect)
    : vec2(uAspect / uImageAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// effects/shake — scene.json: strength 0.071, speed 0.74, friction "1 1",
// bounds "0 1". DIRECTION stays at its centre default, and NOISE / MASK /
// TIMEOFFSET are off, which also collapses the source's ease branches:
//   mix(1 - (1 - o)^1, o^1, base) === o
// The mask is sampled in object space; the mask is exactly half the plate in
// both axes, so the aspect term the original derives reduces to identity.
//
// The source then runs  o = sin(frac(time / PI_HALF) * PI_HALF)  — a ramp from
// 0 to 1 that resets every pi/2 / 0.74 = 2.12s. Replayed through this port that
// reset measures as a ~10x frame-to-frame spike against the surrounding motion
// (verified in .nur/tmp/sim_clouds.py), i.e. a hard jolt every 2.1s on an
// otherwise calm scene — and one the 192px Steam preview could not resolve.
// Easing the SAME period into a swell keeps the amplitude, the speed and the
// cloud-only gating while removing the step.
vec2 shakeOffset(vec2 uv, float t) {
  float time = 0.74 * t;
  float o = 0.5 - 0.5 * cos(6.283185307179586 * frac(time / PI_HALF));
  vec2 flow = (texture2D(uShakeMask, uv).rg - vec2(0.498)) * 2.0;
  return o * (0.071 * 0.071) * flow;      // strength is applied squared
}

// effects/waterflow — scene.json: strength 0.24, speed 0.2, feather 0.4,
// phasescale 2.0. Four taps half a phase apart, cross-faded, so the phase
// wrap is continuous.
vec3 waterflow(vec2 uv, float t) {
  const float speed = 0.2;
  const float feather = 0.4;
  const float amp = 0.24;
  const float phaseScale = 2.0;

  vec4 cycles = vec4(frac(t * speed),
                     frac(t * speed + 0.5),
                     frac(0.25 + t * speed),
                     frac(0.25 + t * speed + 0.5));
  vec2 bounds = vec2(0.5 - feather, 0.5 + feather);
  float blendA = smoothstep(bounds.x, bounds.y, 2.0 * abs(cycles.x - 0.5));
  float blendB = smoothstep(bounds.x, bounds.y, 2.0 * abs(cycles.z - 0.5));
  vec4 phase = cycles - 0.5;

  float flowPhase = texture2D(uPhase, uv * phaseScale).r;
  vec2 flowMask = (texture2D(uFlowMask, uv).rg - vec2(0.498)) * 2.0;
  float flowAmount = length(flowMask);

  vec2 warp = flowMask * amp * 0.1;
  vec3 albedo = texture2D(uImage, uv).rgb;
  vec3 flowA = mix(texture2D(uImage, uv + warp * phase.x).rgb,
                   texture2D(uImage, uv + warp * phase.y).rgb, blendA);
  vec3 flowB = mix(texture2D(uImage, uv + warp * phase.z).rgb,
                   texture2D(uImage, uv + warp * phase.w).rgb, blendB);
  flowA = mix(flowA, flowB, smoothstep(0.2, 0.8, flowPhase));

  return mix(albedo, flowA, flowAmount);
}

void main() {
  float t = uTime * uMotion;
  vec2 uv = coverUv(vUv);
  vec3 col = waterflow(uv + shakeOffset(uv, t), t);

  // scene.json pins the scheme to grey; the plate is already black and white,
  // so rendering pure monochrome matches both the source and the Blackboard.
  col = vec3(dot(col, vec3(0.299, 0.587, 0.114)));

  gl_FragColor = vec4(col, 1.0);
}
`;

const ABSTRACT_PLATE = {
  desktop: '/assets/blackboard/wallpaper.jpg',
  mobile: '/assets/blackboard/wallpaper-1280.jpg',
};

const CLOUDS_PLATE = {
  desktop: '/assets/blackboard/clouds/clouds.webp',
  mobile: '/assets/blackboard/clouds/clouds-1280.webp',
};

/** Motion amount the abstract scene was tuned with; clouds runs at 1:1. */
const ABSTRACT_MOTION = 2.8;

export const ABSTRACT: WallpaperVariant = {
  id: 'abstract',
  label: 'Black & White Abstract',
  plate: ABSTRACT_PLATE,
  vertex: VERTEX_SRC,
  fragment: ABSTRACT_FRAGMENT,
  // Matches the shader's exposure lift. The additive godrays on top are not
  // modelled, but they only ever brighten further into light-ink territory.
  toneMap: srgb => Math.pow(srgb, 0.75) * 1.45 + 0.035,
  create(gl, program, mobile) {
    const noise = makeNoiseCanvas(256);
    const normal = makeNormalCanvas(256);
    if (!noise || !normal) return null;

    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uNoise'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uNormal'), 2);

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };
    keep(uploadTexture(gl, 1, noise, true, true));
    keep(uploadTexture(gl, 2, normal, true, false));
    gl.activeTexture(gl.TEXTURE0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMotion = gl.getUniformLocation(program, 'uMotion');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');
    // Keep the ripple and cloud drift consistent across screen sizes.
    gl.uniform1f(uMotion, ABSTRACT_MOTION);

    const image = loadImage(mobile ? ABSTRACT_PLATE.mobile : ABSTRACT_PLATE.desktop);
    let ready = false;
    let failed = false;
    image.onload = () => {
      keep(uploadTexture(gl, 0, image, false, false));
      gl.uniform1f(uImageAspect, image.naturalWidth / image.naturalHeight);
      ready = true;
    };
    image.onerror = () => {
      failed = true;
    };

    return {
      frame(context, time) {
        if (!ready) return false;
        context.uniform1f(uTime, time);
        context.uniform1f(uAspect, context.drawingBufferWidth / context.drawingBufferHeight);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        return true;
      },
      alive: () => !failed,
      dispose(context) {
        image.onload = null;
        image.onerror = null;
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

export const CLOUDS: WallpaperVariant = {
  id: 'clouds',
  label: 'Black & White Clouds',
  plate: CLOUDS_PLATE,
  vertex: VERTEX_SRC,
  fragment: CLOUDS_FRAGMENT,
  // The scene only warps UVs — verified against the raw plate at mean
  // luminance 0.301 vs 0.302 — so the file stands in for the render exactly.
  toneMap: srgb => srgb,
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uShakeMask'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uFlowMask'), 2);
    gl.uniform1i(gl.getUniformLocation(program, 'uPhase'), 3);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMotion = gl.getUniformLocation(program, 'uMotion');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');
    // scene.json timing is used verbatim.
    gl.uniform1f(uMotion, 1.0);

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    const masks = [
      { image: loadImage('/assets/blackboard/clouds/clouds-shake-mask.webp'), unit: 1, repeat: false },
      { image: loadImage('/assets/blackboard/clouds/clouds-waterflow-mask.webp'), unit: 2, repeat: false },
      // The phase map tiles: it is sampled at 2x the object uv.
      { image: loadImage('/assets/blackboard/clouds/clouds-waterflow-phase.png'), unit: 3, repeat: true },
    ];
    const image = loadImage(mobile ? CLOUDS_PLATE.mobile : CLOUDS_PLATE.desktop);

    // Every sampler must hold a real texture before the first frame. Sampling
    // an unbound unit returns (0,0,0,1), which would make flowMask ≈ -1 and
    // draw a fully warped scene that then snaps once the masks arrive.
    let pending = masks.length + 1;
    let ready = false;
    let failed = false;
    const settle = () => {
      if (--pending === 0 && !failed) ready = true;
    };
    const fail = () => {
      failed = true;
    };

    for (const mask of masks) {
      mask.image.onload = () => {
        keep(uploadTexture(gl, mask.unit, mask.image, mask.repeat, false));
        settle();
      };
      mask.image.onerror = fail;
    }
    image.onload = () => {
      keep(uploadTexture(gl, 0, image, false, false));
      gl.uniform1f(uImageAspect, image.naturalWidth / image.naturalHeight);
      settle();
    };
    image.onerror = fail;

    return {
      frame(context, time) {
        if (!ready) return false;
        context.uniform1f(uTime, time);
        context.uniform1f(uAspect, context.drawingBufferWidth / context.drawingBufferHeight);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        return true;
      },
      alive: () => !failed,
      dispose(context) {
        image.onload = null;
        image.onerror = null;
        for (const mask of masks) {
          mask.image.onload = null;
          mask.image.onerror = null;
        }
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

export const VARIANTS: Record<WallpaperId, WallpaperVariant> = {
  abstract: ABSTRACT,
  clouds: CLOUDS,
};

export const WALLPAPER_ORDER: WallpaperId[] = ['abstract', 'clouds'];

export function isWallpaperId(value: unknown): value is WallpaperId {
  return value === 'abstract' || value === 'clouds';
}

/** Compile a variant and bind its fullscreen quad. */
export function mountVariant(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  variant: WallpaperVariant,
  mobile: boolean,
): { runtime: WallpaperRuntime; quad: WebGLBuffer } | null {
  const quad = createQuad(gl, program);
  if (!quad) return null;
  const runtime = variant.create(gl, program, mobile);
  if (!runtime) {
    gl.deleteBuffer(quad);
    return null;
  }
  return { runtime, quad };
}
