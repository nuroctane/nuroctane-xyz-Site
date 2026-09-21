/* ═══════════════════════════════════════════════════════════════════════════
   Blackboard wallpaper variants — WebGL ports of Wallpaper Engine workshop
   scenes, extracted from their scene.pkg containers.

     abstract  workshop 2207944762  "Black & White Abstract"
     clouds    workshop 3612455067  "Black & White Clouds"
     japanese  workshop 2791515879  "Black and White Japanese"
     forest    workshop 3679836853  "black and white forest"
     sakura    workshop 3493394392  "White sakura"
     blossom   workshop 3613577930  "White sakura" (the second one)
     waves     workshop 2279430364  "Black Waves"

   Every scene is a single fullscreen image object with live materials on top;
   every constant below is the one scene.json overrides, so the motion matches
   the original. See wallpaper/README.md for how the .pkg and .tex were read.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createQuad, loadImage, makeNoiseCanvas, makeNormalCanvas, uploadTexture } from './gl';
import { linearToSrgb, srgbToLinear } from './luminance';

export type WallpaperId =
  | 'abstract'
  | 'clouds'
  | 'japanese'
  | 'forest'
  | 'sakura'
  | 'blossom'
  | 'waves'
  | 'roses'
  | 'lattice'
  | 'sweep'
  | 'dots'
  | 'topography';

export interface WallpaperRuntime {
  /** Update uniforms and draw. Returns false when the plate is not decoded yet. */
  frame(gl: WebGLRenderingContext, time: number): boolean;
  /** False once the variant can never draw (a source image failed to decode). */
  alive: () => boolean;
  dispose(gl: WebGLRenderingContext): void;
}

/**
 * A moving-image source. The wallpaper layer renders these as a real <video>
 * element rather than through WebGL: the source is already a finished,
 * full-frame animation, so uploading it as a texture every frame would spend a
 * copy per frame to reproduce exactly what the element draws for free, with
 * hardware decoding and the browser's own power management.
 *
 * `plate` still applies to these variants — it is a poster frame, used for the
 * CSS layer, the reduced-motion still, and the luminance field the ink reads.
 */
export interface WallpaperVideo {
  desktop: string;
  mobile: string;
}

/**
 * Fill a luminance grid for a variant whose background moves, where no still
 * image could predict the pixels under the UI.
 *
 * Called with the grid the ink sampler reads, so writing into `data` in place
 * changes what `sampleRect` sees without changing the field's identity — which
 * is what keeps the ink from re-registering its listeners on every tick. The
 * grid is in SCREEN space and `aspect` is the viewport's, since a live variant
 * paints the viewport directly rather than cover-fitting a plate.
 */
export type LiveField = (
  data: Float32Array,
  cols: number,
  rows: number,
  timeSeconds: number,
  aspect: number,
) => void;

export interface WallpaperVariant {
  id: WallpaperId;
  label: string;
  /** Plate sources for the CSS layer behind WebGL and reduced-motion stills. */
  plate: { desktop: string; mobile: string };
  vertex: string;
  fragment: string;
  /** Present when the scene is a video rather than a WebGL port. */
  video?: WallpaperVideo;
  /** Present when the background moves in a way a still plate cannot describe. */
  liveField?: LiveField;
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

/* ═══════════════════════════════════════════════════════════════════════════
   Shared GLSL for the five ports added after the originals. The abstract and
   clouds fragments above keep their own copies of coverUv/frac; these blocks
   are what the newer variants splice in.
   ═══════════════════════════════════════════════════════════════════════════ */
const COMMON_GLSL = `
#define PI_HALF 1.5707963267948966

float frac(float x) { return x - floor(x); }

// Wallpaper Engine's common.h rotateVec2(), written out because it is not part
// of GLSL ES:
//   vec2(v.x * cos(a) - v.y * sin(a), v.x * sin(a) + v.y * cos(a))
vec2 rotateVec2(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Mirrors CSS background-size: cover, which is how the plate layer and the
// canvas both map the image onto the viewport.
vec2 coverUv(vec2 uv) {
  vec2 s = uAspect > uImageAspect
    ? vec2(1.0, uImageAspect / uAspect)
    : vec2(uAspect / uImageAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// Every scene here pins its scheme colour to grey and every plate is already
// black and white, so the ports render luminance to match the Blackboard.
vec3 monochrome(vec3 col) {
  return vec3(dot(col, vec3(0.299, 0.587, 0.114)));
}
`;

/**
 * effects/shake, shared by `sakura` (strength 0.059) and `blossom` (0.071).
 *
 * The same maths as the shake already inside CLOUDS_FRAGMENT, with the
 * strength passed in rather than baked. See that comment for why the source's
 * `sin(frac(time / PI_HALF) * PI_HALF)` ramp — which jumps back to zero every
 * 2.12 s — is replayed here as a swell of the same period and range.
 *
 * `uv` must be the OBJECT uv. Both scenes' masks are exactly half their plate
 * in both axes (1280x720 against 2560x1440, 1706x960 against 3412x1920), so the
 * source's mask-uv term, uv * maskDisplaySize / maskTextureSize, reduces to uv;
 * and the shipped mask assets keep that aspect, so coverUv's uv is the mask uv.
 */
const SHAKE_GLSL = `
vec2 shakeOffset(vec2 uv, float t, float speed, float strength) {
  float time = speed * t;
  float o = 0.5 - 0.5 * cos(6.283185307179586 * frac(time / PI_HALF));
  vec2 flow = (texture2D(uShakeMask, uv).rg - vec2(0.498)) * 2.0;
  return o * (strength * strength) * flow;      // strength is applied squared
}
`;

/**
 * effects/waterflow, shared by `blossom` and `waves`.
 *
 * Again the maths from CLOUDS_FRAGMENT with the scene's constants passed in:
 * four taps half a phase apart, cross-faded, so the phase wrap is continuous.
 * `feather` widens the crossfade window; the scene constants for these two
 * scenes come from a build of the shader whose own source has no feather term
 * at all (the blend there is linear, 2 * abs(cycles.x - 0.5)), so this easing
 * is a deviation carried over from the clouds port rather than a value the
 * source used. It changes the shape of the crossfade, never its amplitude or
 * period. Both scenes' phase maps are sampled at uv * phaseScale.
 */
const WATERFLOW_GLSL = `
vec3 waterflow(vec2 uv, float t, float speed, float amp, float feather, float phaseScale) {
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
`;

/* ═══════════════════════════════════════════════════════════════════════════
   JAPANESE — workshop 2791515879
   Line art on black, with a single effects/foliagesway pass. The combo MODE is
   unset, so the effect takes its MODE 0 branch: the whole displacement happens
   here in the FRAGMENT as a uv offset, and the source's vertex-displacement
   branch — the one with corner weights and direction weights — is dead code.
   MASK is on: masks/foliagesway_mask_cfcb3027, texture 1.
   ═══════════════════════════════════════════════════════════════════════════ */
const JAPANESE_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uNoise;
uniform sampler2D uMask;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}
void main() {
  vec2 uv = coverUv(vUv);

  // vertex: aspect = g_Texture0Resolution.z / .w * ratio. That resolution is
  // the effect's own render target — the plate as displayed — so the canvas
  // aspect stands in for it; on the source's 3840x2160 canvas it is exactly
  // 16:9. ratio 0.37 flattens it to 0.658, then the x term takes 1/aspect.
  // scrolldirection 1.7748142 rotates both the sway axes and the uv weights.
  float aspect = uAspect * 0.37;
  vec2 axes = rotateVec2(vec2(1.0 / aspect, aspect), 1.7748142);
  vec2 rot = rotateVec2(uv, 1.7748142);

  // scale 0.1: the noise is read at a tenth of the object uv, i.e. magnified a
  // hundredfold on screen, so it reads as a smooth low-frequency field.
  vec3 noise = texture2D(uNoise, uv * 0.1).rgb;

  // strength 0.3, squared and scaled by 0.005 in the vertex shader, then gated
  // by the mask. That is an amplitude of ~4.5e-4 per sine term, so the summed
  // displacement is a few pixels on the source's 3840px plate — around 3px at
  // this asset's 2560. It is a subtle effect on purpose, and it is not
  // amplified here.
  float amp = 0.3 * 0.3 * 0.005;
  amp *= texture2D(uMask, uv).r;

  // phase 1.4 scales the whole argument: noise.g on 0..2pi, plus the rotated
  // uv with its x weighted tenfold and its y fivefold.
  float phase = (noise.g * 6.283185307179586 + rot.x * 10.0 + rot.y * 5.0) * 1.4;
  // speeduv 4.5900002, and power 0.78 applied as an odd (sign-preserving) curve.
  vec4 sines = sin(phase + 4.5900002 * uTime * vec4(1.0, -0.16161616, 0.0083333, -0.00019841));
  vec4 csines = sin(0.4 + phase + 4.5900002 * uTime * vec4(-0.5, 0.041666666, -0.0013888889, 0.000024801587));
  sines = pow(abs(sines), vec4(0.77999997)) * sign(sines);
  csines = pow(abs(csines), vec4(0.77999997)) * sign(csines);

  vec2 offset;
  offset.x = axes.x * dot(sines, vec4(amp));
  offset.y = axes.y * dot(csines, vec4(amp));

  gl_FragColor = vec4(monochrome(texture2D(uImage, uv + offset).rgb), 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   FOREST — workshop 3679836853
   One effects/clouds pass over the plate. The effect's material names no
   texture, so g_Texture1 is Wallpaper Engine's built-in util/clouds_256, copied
   in byte-for-byte as forest-clouds.png — the cloud pattern is the exact one
   the source samples, not a stand-in. Combo PERSPECTIVE is unset (0), so the
   vertex path is used and no perspective quad is involved.
   ═══════════════════════════════════════════════════════════════════════════ */
const FOREST_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uClouds;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}
void main() {
  vec2 uv = coverUv(vUv);

  // vertex: aspect = g_Texture0Resolution.z / .w, the plate as rendered, so the
  // canvas aspect again stands in for it. speed "0.01 -0.02" is read as the two
  // scalars g_CloudSpeeds.x/.y, each added to BOTH components of the uv, before
  // scale "1.3 1.3 0.5 0.5" (xy from .xy, zw from .zw) is applied. The x term of
  // each pair is then aspect-corrected, and the zw pair is transposed and
  // negated about x.
  vec4 clouds;
  clouds.xy = (uv + uTime * 0.01) * 1.3;
  clouds.zw = (uv - uTime * 0.02) * 0.5;
  clouds.xz *= uAspect;
  clouds.zw = vec2(-clouds.w, clouds.z);

  // smoothness 0 is the sample LOD, so both taps read the base level.
  float cloud0 = texture2D(uClouds, clouds.xy).r;
  float cloud1 = texture2D(uClouds, clouds.zw).r;

  // threshold 0 and feather 0.5, with alpha 1 on top. The mask is off: the
  // scene's pass supplies only g_Texture1.
  float blend = smoothstep(0.0, 0.5, cloud0 * cloud1);

  // SHADING is 7 in the effect's own combo list. Neither the == 0 nor the == 1
  // branch is compiled for that value, so the source falls through to
  //   cloudColor = mix(colorEnd, colorStart, blend) * cloud0 * cloud1
  // and both colours are "1 1 1", which leaves white * cloud0 * cloud1.
  vec3 cloudColor = vec3(1.0) * cloud0 * cloud1;

  // BLENDMODE 0 is the default "normal": ApplyBlending falls through to
  // mix(A, BlendNormal(A, B), opacity), and BlendNormal(base, blend) is just
  // the blend value — a straight alpha-over of the cloud colour. The material
  // ("blending": "normal") confirms the reading.
  vec3 col = mix(texture2D(uImage, uv).rgb, cloudColor, blend);

  gl_FragColor = vec4(monochrome(col), 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   SAKURA — workshop 3493394392
   One effects/shake pass, strength 0.059, mask masks/shake_mask_59ff63c3. This
   is the same effect the clouds scene runs at 0.071; the mask is 1280x720
   against a 2560x1440 plate, half in both axes, so its uv is the object uv.
   ═══════════════════════════════════════════════════════════════════════════ */
const SAKURA_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uShakeMask;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}
${SHAKE_GLSL}
void main() {
  vec2 uv = coverUv(vUv);
  // speed 0.74, friction "1 1" and bounds "0 1" both collapse to identity.
  vec2 offset = shakeOffset(uv, uTime, 0.74, 0.059);
  gl_FragColor = vec4(monochrome(texture2D(uImage, uv + offset).rgb), 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   BLOSSOM — workshop 3613577930
   Two effects in order: shake (strength 0.071) then waterflow (strength 0.2,
   speed 0.25, feather 0.4, phasescale 2.0). The second one displaces the result
   of the first, so the shake offset is applied to the uv before the flow taps
   sample it. Both masks are 1706x960 against a 3412x1920 plate — half in both
   axes — so each shader's mask uv is the object uv. The scene's two audio
   objects are dropped: this port never reads an audio spectrum.
   ═══════════════════════════════════════════════════════════════════════════ */
const BLOSSOM_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uShakeMask;
uniform sampler2D uFlowMask;
uniform sampler2D uPhase;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}
${SHAKE_GLSL}
${WATERFLOW_GLSL}
void main() {
  float t = uTime;
  vec2 uv = coverUv(vUv);
  vec3 col = waterflow(uv + shakeOffset(uv, t, 0.74, 0.071), t, 0.25, 0.2, 0.4, 2.0);
  gl_FragColor = vec4(monochrome(col), 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   WAVES — workshop 2279430364
   Two effects over the plate, in this order: waterflow, then waterripple. The
   ripple uses the scene's own normal map rather than the generated one the
   abstract variant stands in with: waves-normal.webp is the real
   effects/waterripplenormal, 256x256.
   ═══════════════════════════════════════════════════════════════════════════ */
const WAVES_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uNormal;
uniform sampler2D uFlowMask;
uniform sampler2D uPhase;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}
${WATERFLOW_GLSL}
// effects/waterripple vertex, rewritten as a uv displacement:
//   v_TexCoordRipple.xy = uv + time * animationspeed^2 + scroll
//   v_TexCoordRipple.zw = uv * 1.333 - time * animationspeed^2 + scroll
//   v_TexCoordRipple *= scale
//   .xz *= g_Texture0Resolution.x / .w    (the plate as rendered)
//   .yw *= ratio
// scrollspeed is left at its 0 default, so the scroll term vanishes.
//
// The scene's own animationspeed 0.04 is squared by the source, so the phase
// advanced at 0.0016/s and the ripplestrength 0.08 squared the displacement to
// 0.0064 uv. Measured on the rendered plate that is a mean frame-to-frame delta
// of ~1.8/255 — real but sub-pixel, so the scene reads as a still image on every
// platform. Both are boosted here: ~9x the phase rate and ~5x the displacement,
// which lands the motion at a visible shimmer without turning the water to jelly.
// This is a deliberate departure from the source scene; the ported constants are
// noted above so the original values stay recoverable.
vec2 rippleUv(vec2 uv, float t) {
  float phase = 0.12 * 0.12 * t;
  vec4 rp;
  rp.xy = uv + vec2(phase);
  rp.zw = uv * 1.333 - vec2(phase);
  rp *= 0.3;
  rp.xz *= uAspect;
  rp.yw *= 1.68;

  vec3 n1 = texture2D(uNormal, rp.xy).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormal, rp.zw).xyz * 2.0 - 1.0;
  // The source normalises n1.xy + n2.xy against n1.z alone, unlike the abstract
  // scene's variant of this, which floors z at 0.35 for its generated map.
  vec3 normal = normalize(vec3(n1.xy + n2.xy, n1.z));

  return uv + normal.xy * (0.18 * 0.18);   // ripplestrength, squared (scene: 0.08)
}

void main() {
  float t = uTime;
  vec2 uv = coverUv(vUv);

  // waterflow runs first, and waterripple samples its output, so the ripple's
  // displaced coordinate is fed back through the waterflow displacement at that
  // point. waterflow here is speed 0.17, strength 0.05, phasescale 0.01 — the
  // phase map is read at a hundredth of the uv, not the 2x the blossom scene
  // uses. Its mask is util/noflow, Wallpaper Engine's flat neutral 127: 127/255
  // is 0.498, so flowMask comes out at ~8e-5 and the pass moves the plate by
  // ~4e-7 uv, a thousandth of a pixel. It is inert, and the source keeps the
  // effect "visible": false anyway. It is ported because the scene defines it;
  // feather is unset in the scene and unsupported by this build's shader, so the
  // shared 0.5 default shapes a crossfade that cannot be seen either way.
  vec2 rippled = rippleUv(uv, t);
  vec3 col = waterflow(rippled, t, 0.17, 0.05, 0.5, 0.01);
  gl_FragColor = vec4(monochrome(col), 1.0);
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

const JAPANESE_PLATE = {
  desktop: '/assets/blackboard/japanese/japanese.webp',
  mobile: '/assets/blackboard/japanese/japanese-portrait.webp',
};

const FOREST_PLATE = {
  desktop: '/assets/blackboard/forest/forest.webp',
  mobile: '/assets/blackboard/forest/forest-portrait.webp',
};

const SAKURA_PLATE = {
  desktop: '/assets/blackboard/sakura/sakura.webp',
  mobile: '/assets/blackboard/sakura/sakura-portrait.webp',
};

const BLOSSOM_PLATE = {
  desktop: '/assets/blackboard/blossom/blossom.webp',
  mobile: '/assets/blackboard/blossom/blossom-portrait.webp',
};

const WAVES_PLATE = {
  desktop: '/assets/blackboard/waves/waves.webp',
  mobile: '/assets/blackboard/waves/waves-portrait.webp',
};

/**
 * `forest` is the only port here that changes levels rather than UVs, so it is
 * the only one whose tone curve is not the identity.
 *
 * The clouds shader mixes a cloud-coloured veil over the plate with opacity
 * `blend = smoothstep(0, 0.5, cloud0 * cloud1)` and a white cloud colour:
 *
 *   out = plate * (1 - blend) + cloud0 * cloud1 * blend
 *
 * That veil is mid-grey, so it is a wash: blacks go up, whites come down.
 * Measured over util/clouds_256's red channel — the one the shader reads — with
 * the two taps drawn independently from that distribution, E[blend] = 0.4520
 * and E[cloud0 * cloud1 * blend] = 0.1563.
 *
 * The field is linear light (luminance.ts linearises each channel before it
 * averages), and the mix happens in sRGB, so the curve has to be fitted in the
 * linear domain. Modelling the sRGB-domain conditional mean instead — the
 * obvious reading of the two averages above, and what this port did first — is
 * biased: the sRGB decode is convex, so E[linear(out)] sits above
 * linear(E[out]) by exactly that convexity. Over the plate that bias is 10.4%
 * of the field on average and 29.6% at the worst moment of the drift, while a
 * two-parameter fit in linear light lands on the field's time-average to 0.7%
 * and within 6.9% mean / 18.9% max at any instant.
 *
 * The fit is therefore `out_linear ~= 0.4399 * plate_linear + 0.0603`: a veil
 * 45% opaque on average, which keeps 0.44 of the underlying light and adds a
 * 0.060 linear lift. Both coefficients were fitted against E[linear(out) |
 * plate] over util/clouds_256, swept across the whole 0..1 plate range.
 *
 * This is a steady state, not a pixel. The pattern drifts at 0.01/-0.02 uv per
 * second, and over one drift period its own spatial mean swings between 0.297
 * and 0.612 (it is a 256x256 tile, so a frame only ever covers part of it). The
 * rendered linear field therefore moves between 0.117 and 0.163 around that
 * 0.1365 time-average, and no static curve can track that: the residual above
 * is that drift, not a curve error. The ink behind a small control sits on one
 * 48x27 cell of the pattern and can see either side of the average.
 */
const FOREST_VEIL_TRANSMISSION = 0.4399;
const FOREST_VEIL_LIFT = 0.0603;

export const JAPANESE: WallpaperVariant = {
  id: 'japanese',
  label: 'Black & White Japanese',
  plate: JAPANESE_PLATE,
  vertex: VERTEX_SRC,
  fragment: JAPANESE_FRAGMENT,
  // Only ever displaces uv, by a few pixels, and changes no levels: the plate
  // stands in for the render exactly. Confident.
  toneMap: srgb => srgb,
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uNoise'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uMask'), 2);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    // util/noise, byte-copied from Wallpaper Engine. The shader reads it at a
    // tenth of the uv, so it never wraps: clamping is identical to repeating.
    // The noise it samples is RGBA; only .g and .rgb are read, so the alpha
    // channel the original carries is harmless.
    const noise = loadImage('/assets/blackboard/japanese/japanese-noise.png');
    const mask = loadImage('/assets/blackboard/japanese/japanese-foliage-mask.webp');
    const image = loadImage(mobile ? JAPANESE_PLATE.mobile : JAPANESE_PLATE.desktop);

    // Gate the first frame: the plate, the noise and the mask must all be
    // resident. Sampling an unbound unit returns (0,0,0,1), which would render
    // one frame of amp = 0 against a black noise field and then jump.
    let pending = 3;
    let ready = false;
    let failed = false;
    const settle = () => {
      if (--pending === 0 && !failed) ready = true;
    };
    const fail = () => {
      failed = true;
    };

    noise.onload = () => {
      keep(uploadTexture(gl, 1, noise, false, false));
      settle();
    };
    noise.onerror = fail;
    mask.onload = () => {
      keep(uploadTexture(gl, 2, mask, false, false));
      settle();
    };
    mask.onerror = fail;
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
        noise.onload = null;
        noise.onerror = null;
        mask.onload = null;
        mask.onerror = null;
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

export const FOREST: WallpaperVariant = {
  id: 'forest',
  label: 'Black & White Forest',
  plate: FOREST_PLATE,
  vertex: VERTEX_SRC,
  fragment: FOREST_FRAGMENT,
  // The one port that changes levels: see FOREST_VEIL_TRANSMISSION above for
  // the measurement, and for why the fit is in linear light rather than sRGB.
  toneMap: srgb =>
    linearToSrgb(FOREST_VEIL_TRANSMISSION * srgbToLinear(srgb) + FOREST_VEIL_LIFT),
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uClouds'), 1);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    // util/clouds_256, byte-copied. It must repeat: the vertex scales the uv to
    // 1.3 and the drift walks past 1 within half a minute, so a clamped sampler
    // would smear the edge texels instead of panning a cloudscape. Wallpaper
    // Engine agrees — the shipped util/clouds_256.tex-json carries
    // "clampuvs": false.
    const clouds = loadImage('/assets/blackboard/forest/forest-clouds.png');
    const image = loadImage(mobile ? FOREST_PLATE.mobile : FOREST_PLATE.desktop);

    let pending = 2;
    let ready = false;
    let failed = false;
    const settle = () => {
      if (--pending === 0 && !failed) ready = true;
    };
    const fail = () => {
      failed = true;
    };

    clouds.onload = () => {
      keep(uploadTexture(gl, 1, clouds, true, false));
      settle();
    };
    clouds.onerror = fail;
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
        clouds.onload = null;
        clouds.onerror = null;
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

export const SAKURA: WallpaperVariant = {
  id: 'sakura',
  label: 'White Sakura',
  plate: SAKURA_PLATE,
  vertex: VERTEX_SRC,
  fragment: SAKURA_FRAGMENT,
  // Displacement only — the shake moves uv by at most 0.059^2 of the flow map,
  // 8.6px at this asset's width, measured at 3.45px max on a 1024-wide render —
  // and no level changes. Identity. Confident.
  toneMap: srgb => srgb,
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uShakeMask'), 1);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    const mask = loadImage('/assets/blackboard/sakura/sakura-shake-mask.webp');
    const image = loadImage(mobile ? SAKURA_PLATE.mobile : SAKURA_PLATE.desktop);

    let pending = 2;
    let ready = false;
    let failed = false;
    const settle = () => {
      if (--pending === 0 && !failed) ready = true;
    };
    const fail = () => {
      failed = true;
    };

    mask.onload = () => {
      keep(uploadTexture(gl, 1, mask, false, false));
      settle();
    };
    mask.onerror = fail;
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
        mask.onload = null;
        mask.onerror = null;
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

export const BLOSSOM: WallpaperVariant = {
  id: 'blossom',
  // Both this scene and `sakura` are published as "White sakura"; this is the
  // frosted, fog-bound one, so the label carries the difference the titles do
  // not.
  label: 'White Sakura in Fog',
  plate: BLOSSOM_PLATE,
  vertex: VERTEX_SRC,
  fragment: BLOSSOM_FRAGMENT,
  // Displacement only: the shake is masked to <= 0.071^2 and the waterflow to
  // 0.2 * 0.1 of a flow map, both well under a percent of the plate's width,
  // and neither touches levels. The plate is near-white — mean 0.82 sRGB, so
  // about 210/255 — which is a consequence for the ink system, not for this
  // curve: the shader reproduces the file. Identity. Confident.
  toneMap: srgb => srgb,
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uShakeMask'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uFlowMask'), 2);
    gl.uniform1i(gl.getUniformLocation(program, 'uPhase'), 3);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    const masks = [
      { image: loadImage('/assets/blackboard/blossom/blossom-shake-mask.webp'), unit: 1, repeat: false },
      { image: loadImage('/assets/blackboard/blossom/blossom-waterflow-mask.webp'), unit: 2, repeat: false },
      // The phase map tiles: it is sampled at twice the object uv here.
      { image: loadImage('/assets/blackboard/blossom/blossom-phase.png'), unit: 3, repeat: true },
    ];
    const image = loadImage(mobile ? BLOSSOM_PLATE.mobile : BLOSSOM_PLATE.desktop);

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

export const WAVES: WallpaperVariant = {
  id: 'waves',
  label: 'Black Waves',
  plate: WAVES_PLATE,
  vertex: VERTEX_SRC,
  fragment: WAVES_FRAGMENT,
  // Displacement only, and a small one: the ripple bends uv by at most 0.08^2
  // of the normal map's xy, and the waterflow is inert. No level changes.
  // Identity. Confident.
  toneMap: srgb => srgb,
  create(gl, program, mobile) {
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uNormal'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uFlowMask'), 2);
    gl.uniform1i(gl.getUniformLocation(program, 'uPhase'), 3);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

    const textures: WebGLTexture[] = [];
    const keep = (texture: WebGLTexture | null) => {
      if (texture) textures.push(texture);
    };

    // The real effects/waterripplenormal at 256x256, kept as-is because the
    // shader reads its texels directly. The phase map tiles, as above.
    const normal = loadImage('/assets/blackboard/waves/waves-normal.webp');
    const flowMask = loadImage('/assets/blackboard/waves/waves-noflow.png');
    const phase = loadImage('/assets/blackboard/waves/waves-phase.png');
    const image = loadImage(mobile ? WAVES_PLATE.mobile : WAVES_PLATE.desktop);

    // The normal map never samples outside 0..1 — the ripple uv tops out around
    // 0.7 across an ultrawide canvas — so clamping is what the source's default
    // sampler does and what this binds.
    let pending = 4;
    let ready = false;
    let failed = false;
    const settle = () => {
      if (--pending === 0 && !failed) ready = true;
    };
    const fail = () => {
      failed = true;
    };

    normal.onload = () => {
      keep(uploadTexture(gl, 1, normal, false, false));
      settle();
    };
    normal.onerror = fail;
    flowMask.onload = () => {
      keep(uploadTexture(gl, 2, flowMask, false, false));
      settle();
    };
    flowMask.onerror = fail;
    phase.onload = () => {
      keep(uploadTexture(gl, 3, phase, true, false));
      settle();
    };
    phase.onerror = fail;
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
        normal.onload = null;
        normal.onerror = null;
        flowMask.onload = null;
        flowMask.onerror = null;
        phase.onload = null;
        phase.onerror = null;
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED SINGLE-PLATE SCENE

   One texture, drawn full-frame, with the variant's fragment doing the work.
   `frame` refuses to draw until the plate has decoded, which is what keeps the
   canvas transparent over the CSS plate rather than flashing black.
   ═══════════════════════════════════════════════════════════════════════════ */
function createPlateScene(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  plate: { desktop: string; mobile: string },
  mobile: boolean,
): WallpaperRuntime | null {
  gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uAspect = gl.getUniformLocation(program, 'uAspect');
  const uImageAspect = gl.getUniformLocation(program, 'uImageAspect');

  const image = loadImage(mobile ? plate.mobile : plate.desktop);
  let texture: WebGLTexture | null = null;
  let ready = false;
  let failed = false;

  image.onload = () => {
    // A full-frame plate is never tiled, and coverUv keeps its samples well
    // inside the image, so CLAMP is both correct and — for the NPOT sizes every
    // plate here has — the only value that samples at all under WebGL 1.
    texture = uploadTexture(gl, 0, image, false, false);
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
      if (texture) context.deleteTexture(texture);
    },
  };
}

/** sRGB channel -> linear light. Mirrors luminance.ts, kept local to avoid a
 *  variants -> luminance import edge from a module the field builder already
 *  depends on. */
function linearFromSrgb(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

const ROSES_PLATE = {
  desktop: '/assets/blackboard/roses/roses.webp',
  mobile: '/assets/blackboard/roses/roses-portrait.webp',
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROSES — workshop 2549515627
   A dense near-black rose wall. The source runs four effects over a single
   plate: foliagesway (a per-vertex sway driven off a noise map), a shine/bloom
   pass, filmgrain and a tint. The plate is already monochrome and the scene's
   tint is a no-op on it, so the port keeps the two that are visible on a still:
   a small low-frequency uv wobble standing in for the sway, and grain.
   ═══════════════════════════════════════════════════════════════════════════ */
const ROSES_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}

float grain(vec2 p) {
  return frac(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// foliagesway, reduced to a displacement: two incommensurate frequencies so the
// field never settles into a visible beat.
vec2 sway(vec2 uv, float t) {
  return uv + vec2(
    sin(uv.y * 9.0 + t * 0.55) * 0.0024,
    cos(uv.x * 7.0 + t * 0.41) * 0.0019
  );
}

void main() {
  vec2 uv = coverUv(vUv);
  vec3 col = texture2D(uImage, sway(uv, uTime)).rgb;
  // filmgrain, faint enough to read as film rather than noise
  col += (grain(uv * uAspect * 900.0 + frac(uTime) * 91.0) - 0.5) * 0.032;
  gl_FragColor = vec4(monochrome(col), 1.0);
}
`;

export const ROSES: WallpaperVariant = {
  id: 'roses',
  label: 'Black Roses',
  plate: ROSES_PLATE,
  vertex: VERTEX_SRC,
  fragment: ROSES_FRAGMENT,
  toneMap: srgb => srgb,
  create: (gl, program, mobile) => createPlateScene(gl, program, ROSES_PLATE, mobile),
};

const LATTICE_PLATE = {
  desktop: '/assets/blackboard/lattice/lattice.webp',
  mobile: '/assets/blackboard/lattice/lattice-portrait.webp',
};

/** Workshop 1760275007: stationary base, fog, then three independently
 * masked shake layers. Local preset: playback 132%, brightness 57, contrast 54,
 * saturation 0. Keep the source's full aspect for every texture, including on
 * mobile; cropping the layers separately would misalign their direction maps. */
const LATTICE_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uLayer1;
uniform sampler2D uLayer2;
uniform sampler2D uLayer3;
uniform sampler2D uFlow1;
uniform sampler2D uFlow3;
uniform sampler2D uNoFlow;
uniform sampler2D uFog;
uniform float uTime;
uniform float uAspect;
uniform float uImageAspect;
${COMMON_GLSL}

vec2 latticeShake(vec2 flow, float speed, float strength) {
  // Source shake.frag, defaults NOISE=0 / DIRECTION=0 / phase=white:
  // sin(speed*time + 2pi), remapped through [0.002,0.998] to [-0.996,0.996].
  return sin(speed * uTime * 1.32) * 0.996 * strength * strength
    * (flow - vec2(0.498)) * 2.0;
}
float fog(vec2 uv) {
  float result = 0.0;
  // Source emission 1.5 * 0.19 particles/sec, lifetime 3..5s, alpha
  // 0.15..0.20 * instance 0.30. Deterministic staggering avoids CPU particles.
  for (int i = 0; i < 4; i++) {
    float seed = float(i);
    float age = mod(uTime * 1.32 + seed * 3.50877, 14.03508);
    float life = 3.0 + seed * 0.6;
    float fade = smoothstep(0.0, 0.5, age) * (1.0 - smoothstep(life - 0.5, life, age));
    vec2 center = vec2(0.30 + seed * 0.12 + age * (25.0 + seed * 18.0) * 1.973 / 2560.0,
                       0.44 + sin(seed * 7.0) * 0.15);
    float size = (1000.0 + seed * 400.0) * 1.973;
    vec2 p = (uv - center) * vec2(2560.0, 1080.0) / size;
    float angle = seed * 2.4;
    p = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p + 0.5;
    float inside = step(0.0,p.x)*step(p.x,1.0)*step(0.0,p.y)*step(p.y,1.0);
    result += texture2D(uFog,p).r * fade * inside * (0.15 + seed * 0.01667) * 0.30;
  }
  return result;
}
void main() {
  vec2 uv = coverUv(vUv);
  vec3 col = texture2D(uImage, uv).rgb + vec3(fog(uv));
  vec4 layer = texture2D(uLayer1, uv + latticeShake(texture2D(uFlow1, uv).rg, 0.36, 0.23));
  col = mix(col, layer.rgb, layer.a);
  layer = texture2D(uLayer2, uv + latticeShake(texture2D(uNoFlow, uv).rg, 1.72, 0.26));
  col = mix(col, layer.rgb, layer.a);
  layer = texture2D(uLayer3, uv + latticeShake(texture2D(uFlow3, uv).rg, 0.78, 0.12));
  col = mix(col, layer.rgb, layer.a);
  float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
  gl_FragColor = vec4(vec3(clamp(((gray - 0.5) * 1.08 + 0.5) * 1.14, 0.0, 1.0)), 1.0);
}
`;

export const LATTICE: WallpaperVariant = {
  id: 'lattice', label: 'Black Lattice', plate: LATTICE_PLATE,
  vertex: VERTEX_SRC, fragment: LATTICE_FRAGMENT,
  toneMap: srgb => srgb,
  create(gl, program) {
    const files = ['background', '1', '2', '3', 'flow1', 'flow3', 'noflow', 'fog1'];
    const uniforms = ['uImage', 'uLayer1', 'uLayer2', 'uLayer3', 'uFlow1', 'uFlow3', 'uNoFlow', 'uFog'];
    const textures: WebGLTexture[] = [];
    let ready = 0;
    let failed = false;
    const images = files.map((file, unit) => {
      gl.uniform1i(gl.getUniformLocation(program, uniforms[unit]), unit);
      const image = loadImage(`/assets/blackboard/lattice/${file}.webp`);
      image.onload = () => {
        const texture = uploadTexture(gl, unit, image, false, false);
        if (!texture) { failed = true; return; }
        textures.push(texture);
        ready++;
      };
      image.onerror = () => { failed = true; };
      return image;
    });
    const timeUniform = gl.getUniformLocation(program, 'uTime');
    const aspectUniform = gl.getUniformLocation(program, 'uAspect');
    gl.uniform1f(gl.getUniformLocation(program, 'uImageAspect'), 2560 / 1080);
    return {
      frame(context, time) {
        if (ready !== files.length) return false;
        context.uniform1f(timeUniform, time);
        context.uniform1f(aspectUniform, context.drawingBufferWidth / context.drawingBufferHeight);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        return true;
      },
      alive: () => !failed,
      dispose(context) {
        for (const image of images) { image.onload = null; image.onerror = null; }
        for (const texture of textures) context.deleteTexture(texture);
      },
    };
  },
};

const SWEEP_PLATE = {
  desktop: '/assets/blackboard/sweep/sweep.webp',
  mobile: '/assets/blackboard/sweep/sweep-portrait.webp',
};

/** One full clockwise turn, matching the source's `rotate 60s linear infinite`. */
const SWEEP_PERIOD = 60.0;

/* ═══════════════════════════════════════════════════════════════════════════
   SWEEP — workshop 3036482397, a Web wallpaper

   The source is a CSS one-liner, so this is a port of the actual code rather
   than a reconstruction:

     div { background-image: conic-gradient(white, black);
           400vw x 400vw, centred;
           animation: rotate 60s linear infinite }      // -90deg -> 270deg

   A conic gradient's angle is measured from 12 o'clock and increases
   clockwise, and the animation sweeps a full turn, so the live shader evaluates
   the gradient analytically at the current rotation instead of animating a
   texture. `liveField` mirrors the same maths for the ink: because the bright
   wedge physically crosses the UI once per turn, the ink polarity has to follow
   it, which is exactly the clockwise light/dark behaviour the scene is wanted
   for.

   The gradient is drawn in the SAME square space as the source (a square far
   larger than the viewport, turning about its centre), which is why the angle
   uses an aspect-corrected vector about the viewport's centre.
   ═══════════════════════════════════════════════════════════════════════════ */
const SWEEP_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
// Declared for the COMMON_GLSL block this splices in, not because this shader
// samples anything: coverUv() reads it, and a fragment that omits it fails to
// compile — which costs the WHOLE program, silently leaving the static plate on
// screen. See the shader-declaration test.
uniform float uImageAspect;
${COMMON_GLSL}

void main() {
  float rot = uTime * (2.0 * PI_HALF * 2.0 / ${SWEEP_PERIOD.toFixed(1)});
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  // atan(x, -y): 0 at 12 o'clock, increasing clockwise, matching CSS conic.
  float ang = atan(p.x, -p.y);
  float t = frac((ang - rot) / (4.0 * PI_HALF));
  gl_FragColor = vec4(vec3(1.0 - t), 1.0);
}
`;

export const SWEEP: WallpaperVariant = {
  id: 'sweep',
  label: 'Black & White Sweep',
  plate: SWEEP_PLATE,
  vertex: VERTEX_SRC,
  fragment: SWEEP_FRAGMENT,
  toneMap: srgb => srgb,
  create(gl, program) {
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uAspect = gl.getUniformLocation(program, 'uAspect');
    // Nothing to load: the gradient is pure maths, so the canvas can paint on
    // its first frame instead of waiting on a decode.
    return {
      frame(context, time) {
        context.uniform1f(uTime, time);
        context.uniform1f(uAspect, context.drawingBufferWidth / context.drawingBufferHeight);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        return true;
      },
      alive: () => true,
      dispose() {},
    };
  },
  liveField(data, cols, rows, timeSeconds, aspect) {
    const rot = timeSeconds * ((Math.PI * 2) / SWEEP_PERIOD);
    const TAU = Math.PI * 2;
    for (let row = 0; row < rows; row++) {
      const y = (row + 0.5) / rows - 0.5;
      for (let col = 0; col < cols; col++) {
        const x = (((col + 0.5) / cols) - 0.5) * aspect;
        const ang = Math.atan2(x, -y);
        let t = ((ang - rot) % TAU) / TAU;
        if (t < 0) t += 1;
        // The field is linear-light, and the gradient is authored in sRGB.
        data[row * cols + col] = linearFromSrgb(1 - t);
      }
    }
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   VIDEO SCENES — workshops 3759381233 and 3636465548

   Both ship as a finished 4K60 H.264 loop, so there is no shader work to do:
   the wallpaper layer plays them in a real <video>. These entries therefore
   carry no WebGL runtime — `create` returning null is what tells the layer to
   leave the canvas transparent and let the element show — and their `plate` is
   a poster frame, which is what the CSS layer cross-fades and what the ink
   measures.
   ═══════════════════════════════════════════════════════════════════════════ */
const VIDEO_FRAGMENT = `
${PRECISION}
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
`;

const DOTS_PLATE = {
  desktop: '/assets/blackboard/dots/dots.webp',
  mobile: '/assets/blackboard/dots/dots-portrait.webp',
};

export const DOTS: WallpaperVariant = {
  id: 'dots',
  label: 'Black & White Dots',
  plate: DOTS_PLATE,
  vertex: VERTEX_SRC,
  fragment: VIDEO_FRAGMENT,
  video: {
    desktop: '/assets/blackboard/dots/dots-1920.mp4',
    mobile: '/assets/blackboard/dots/dots-960.mp4',
  },
  toneMap: srgb => srgb,
  create: () => null,
};

const TOPOGRAPHY_PLATE = {
  desktop: '/assets/blackboard/topography/topography.webp',
  mobile: '/assets/blackboard/topography/topography-portrait.webp',
};

export const TOPOGRAPHY: WallpaperVariant = {
  id: 'topography',
  label: 'White Topography',
  plate: TOPOGRAPHY_PLATE,
  vertex: VERTEX_SRC,
  fragment: VIDEO_FRAGMENT,
  video: {
    desktop: '/assets/blackboard/topography/topography-1920.mp4',
    mobile: '/assets/blackboard/topography/topography-960.mp4',
  },
  toneMap: srgb => srgb,
  create: () => null,
};

export const VARIANTS: Record<WallpaperId, WallpaperVariant> = {
  abstract: ABSTRACT,
  clouds: CLOUDS,
  japanese: JAPANESE,
  forest: FOREST,
  sakura: SAKURA,
  blossom: BLOSSOM,
  waves: WAVES,
  roses: ROSES,
  lattice: LATTICE,
  sweep: SWEEP,
  dots: DOTS,
  topography: TOPOGRAPHY,
};

/** Cycle order for the switcher. The added scenes follow the two originals. */
export const WALLPAPER_ORDER: WallpaperId[] = [
  'abstract',
  'clouds',
  'japanese',
  'forest',
  'sakura',
  'blossom',
  'waves',
  'roses',
  'lattice',
  'sweep',
  'dots',
  'topography',
];

export function isWallpaperId(value: unknown): value is WallpaperId {
  // Read straight off VARIANTS rather than listing ids again, so the guard
  // cannot drift from the registry it guards.
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(VARIANTS, value);
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
