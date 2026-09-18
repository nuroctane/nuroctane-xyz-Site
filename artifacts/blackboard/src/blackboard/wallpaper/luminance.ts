/* ═══════════════════════════════════════════════════════════════════════════
   Wallpaper luminance field + adaptive ink resolution.

   The wallpapers are photographs, not flat colours: "Black & White Clouds" is
   near-black sky across the whole top of the viewport (sRGB ≈ 0.01) but a
   brilliant white cumulus mass across the bottom (sRGB ≈ 0.46–0.62). A single
   page-wide ink polarity therefore cannot stay legible on both, so ink is
   resolved per UI region from the pixels actually behind it.

   The field is a coarse linear-light luminance grid of the plate, built once
   per variant. It is run through the variant's own tone curve first, because
   a scene's shader may remap the image rather than only displacing it: the
   abstract port lifts mids hard (`c^0.75 * 1.45 + 0.035`), so measuring the
   raw file there would under-report the render by up to ~5x. The clouds port
   is a pure UV distortion, so for it the file IS the render — verified at
   mean luminance 0.301 against the plate's 0.302.
   ═══════════════════════════════════════════════════════════════════════════ */

export type InkPolarity = 'light' | 'dark';

export const INK_LIGHT = '#f2f2f2';
export const INK_DARK = '#0c0c0c';

export interface LuminanceField {
  cols: number;
  rows: number;
  /** Linear-light luminance, row-major, 0..1. */
  data: Float32Array;
  imageWidth: number;
  imageHeight: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The page's own veiling gradient, as four black-overlay alphas.
 *
 * This is the `.blackboard::after` scrim defined in blackboard.css. It sits ON
 * TOP of the wallpaper, so it is part of what the eye actually sees — and it is
 * not uniform: a radial wash centred at 50% 42% plus a vertical ramp. On a
 * narrow viewport the ellipse compresses and the ramp covers a proportionally
 * larger share of the screen, so the same wallpaper pixel arrives at the eye at
 * a very different brightness on a phone than on a desktop.
 *
 * Modelling only the plate therefore misjudges the ink pole whenever the scrim
 * is doing real work — which is exactly the case on mobile.
 */
export interface ScrimRamp {
  inner: number;
  outer: number;
  top: number;
  bottom: number;
}

const SCRIM_CENTRE_X = 0.5;
const SCRIM_CENTRE_Y = 0.42;
/** Stop position of the outer colour in the radial gradient. */
const SCRIM_OUTER_STOP = 0.74;

export function parseAlpha(token: string): number {
  const text = token.trim();
  if (!text) return 0;
  const open = text.indexOf('(');
  const close = text.lastIndexOf(')');
  if (open < 0 || close < open) {
    // A keyword or an unparsed token: treat a bare colour keyword as opaque.
    return text === 'transparent' || text === 'none' ? 0 : 1;
  }
  const body = text.slice(open + 1, close);

  // Two serialisations reach here and they do not share a separator. The author
  // syntax in blackboard.css is modern space-and-slash — `rgb(0 0 0 / 16%)` —
  // but `getComputedStyle` serialises any value whose syntax is a registered
  // `<color>` back to the legacy comma form, `rgba(0, 0, 0, 0.16)`. Parsing only
  // the slash form silently returns "opaque black", which then darkens every
  // sample to zero and pins the ink pole on light.
  const parts = body.includes('/') ? body.split('/') : body.split(',');
  if (parts.length < 2) return 1;          // rgb(r g b) — no alpha channel

  const value = parts[parts.length - 1].trim();
  if (/^(none|transparent)$/i.test(value)) return 0;
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return 1;
  return value.endsWith('%') ? number / 100 : number;
}

/**
 * Scrim alpha over a viewport-space rect.
 *
 * Mirrors the two gradient layers of `.blackboard::after`. For an ellipse with
 * `farthest-corner`, CSS keeps the ellipse's aspect equal to the box's and grows
 * it until it touches the farthest corner, so the normalised distance from the
 * centre divides by that corner's own distance.
 */
export function scrimAlphaAt(
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
  scrim: ScrimRamp,
): number {
  if (viewportWidth <= 0 || viewportHeight <= 0) return 0;
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const u = (x - viewportWidth * SCRIM_CENTRE_X) / viewportWidth;
  const v = (y - viewportHeight * SCRIM_CENTRE_Y) / viewportHeight;

  const cornerU = Math.max(SCRIM_CENTRE_X, 1 - SCRIM_CENTRE_X);
  const cornerV = Math.max(SCRIM_CENTRE_Y, 1 - SCRIM_CENTRE_Y);
  const corner = Math.hypot(cornerU, cornerV);
  const t = corner > 0 ? Math.hypot(u, v) / corner : 0;
  const radial = scrim.inner + (scrim.outer - scrim.inner) *
    Math.max(0, Math.min(1, t / SCRIM_OUTER_STOP));

  const ramp = scrim.top + (scrim.bottom - scrim.top) *
    Math.max(0, Math.min(1, y / viewportHeight));

  // The radial layer paints first and the ramp second, so the ramp's occluded
  // share is the radial layer's own transparency.
  return radial + ramp * (1 - radial);
}

/**
 * Apply the page scrim to a sampled plate luminance.
 *
 * The field holds linear light, but CSS composites the scrim in sRGB space, so
 * the value round-trips through sRGB for the multiply rather than being
 * attenuated as linear light.
 */
export function applyScrim(linearLuminance: number, scrimAlpha: number): number {
  if (scrimAlpha <= 0) return linearLuminance;
  const composited = linearToSrgb(linearLuminance) * (1 - Math.max(0, Math.min(1, scrimAlpha)));
  return srgbToLinear(composited);
}

/** sRGB channel (0..1) -> linear-light. */
export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Linear-light -> sRGB channel (0..1). Inverse of `srgbToLinear`. */
export function linearToSrgb(channel: number): number {
  const c = Math.max(0, Math.min(1, channel));
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function linearFromHex(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = srgbToLinear(((n >> 16) & 255) / 255);
  const g = srgbToLinear(((n >> 8) & 255) / 255);
  const b = srgbToLinear((n & 255) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const LUM_LIGHT = linearFromHex(INK_LIGHT);
const LUM_DARK = linearFromHex(INK_DARK);

/** WCAG 2.x contrast ratio between two relative luminances. */
export function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Contrast available to each ink pole over a background luminance.
 * Crossover sits at linear L ≈ 0.174 — i.e. the L 0.4–0.7 sRGB band the design
 * skills flag as the danger zone, which is exactly where the cloud mass lands.
 */
export function inkContrast(luminance: number): { light: number; dark: number } {
  return {
    light: contrastRatio(luminance, LUM_LIGHT),
    dark: contrastRatio(luminance, LUM_DARK),
  };
}

/**
 * How much better the dark pole must be before it is preferred.
 *
 * The field describes the WALLPAPER, but the eye sees the COMPOSITE, and the
 * composite includes overlays no wallpaper-derived field can know about — above
 * all the player panel's shadow, which the wallpaper switcher sits directly
 * under. Measured on `blossom`: the field reads about 0.60 (linear) at the
 * switcher where the screen reads 0.34, a ~1.7x darkening contributed by a soft
 * shadow cast by a DIFFERENT element. Neither a plate-derived field nor one read
 * back from the rendered canvas can see it.
 *
 * Every such unmodelled overlay in this design DARKENS — a shadow, dark glass, a
 * scrim; nothing here brightens what is behind it. So the real backdrop is at or
 * below the field's estimate, and the pole that survives a darker backdrop is the
 * light one: dark ink is the pole that fails when the composite comes out darker
 * than expected.
 *
 * At the crossover itself the two poles are equal by definition, so preferring
 * one cannot lose contrast — which is what makes a tie band safe. 1.08 only
 * re-decides the band where the poles are within 8% of each other, i.e. both
 * comfortably legible, so it cannot flip a plate that is decisively bright or
 * decisively dark: `clouds` (dark pole, ~2.4x margin) is untouched.
 */
const INK_DARK_MARGIN = 1.08;

/**
 * Pick the monochrome ink pole with the better contrast.
 *
 * `previous` biases the comparison so that an element hovering on the crossover
 * (a resize, a subtle cloud drift) does not flip back and forth. Pass
 * `undefined` for a FRESH decision — first paint, or the first measurement after
 * the wallpaper itself changed: a variant switch replaces the whole background,
 * so there is nothing to thrash, and carrying the old pole over would let a
 * bright wallpaper inherit light ink from a dark one.
 *
 * With no `previous`, light wins an exact tie — it is the site's default.
 */
export function inkForLuminance(luminance: number, previous?: InkPolarity): InkPolarity {
  const { light, dark } = inkContrast(luminance);
  const prefersDark = dark > light * INK_DARK_MARGIN;
  if (!previous) return prefersDark ? 'dark' : 'light';
  const HYSTERESIS = 1.18;
  if (previous === 'dark') return dark * HYSTERESIS >= light ? 'dark' : 'light';
  return light * HYSTERESIS >= dark ? 'light' : 'dark';
}

/**
 * Downscale `source` to a cols x rows linear-luminance grid.
 *
 * `toneMap` is the variant's sRGB tone curve; its output is clamped to [0,1]
 * before linearising, since the abstract lift overshoots white.
 */
export function buildLuminanceField(
  source: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  toneMap: (srgb: number) => number = value => value,
  cols = 48,
  rows = 27,
): LuminanceField | null {
  if (!imageWidth || !imageHeight) return null;
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);
  const out = new Float32Array(cols * rows);
  const channel = (value: number) => srgbToLinear(Math.min(1, Math.max(0, toneMap(value / 255))));
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    out[i] = 0.2126 * channel(data[p]) + 0.7152 * channel(data[p + 1]) + 0.0722 * channel(data[p + 2]);
  }
  return { cols, rows, data: out, imageWidth, imageHeight };
}

/**
 * Mean linear luminance of the wallpaper behind a viewport-space rect.
 *
 * Mirrors the CSS `background-size: cover` placement, which is how the plate
 * layers and the canvas both map the image onto the viewport.
 */
export function sampleRect(
  field: LuminanceField,
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
): number | null {
  if (viewportWidth <= 0 || viewportHeight <= 0 || rect.width <= 0 || rect.height <= 0) return null;

  const scale = Math.max(viewportWidth / field.imageWidth, viewportHeight / field.imageHeight);
  const drawnWidth = field.imageWidth * scale;
  const drawnHeight = field.imageHeight * scale;
  const originX = (viewportWidth - drawnWidth) / 2;
  const originY = (viewportHeight - drawnHeight) / 2;

  // Viewport px -> normalised image coords.
  const toU = (x: number) => (x - originX) / drawnWidth;
  const toV = (y: number) => (y - originY) / drawnHeight;

  const left = Math.max(rect.left, 0);
  const top = Math.max(rect.top, 0);
  const right = Math.min(rect.left + rect.width, viewportWidth);
  const bottom = Math.min(rect.top + rect.height, viewportHeight);
  if (right <= left || bottom <= top) return null;

  const clamp = (v: number, hi: number) => Math.max(0, Math.min(hi, v));
  const c0 = clamp(Math.floor(toU(left) * field.cols), field.cols - 1);
  const c1 = clamp(Math.ceil(toU(right) * field.cols), field.cols);
  const r0 = clamp(Math.floor(toV(top) * field.rows), field.rows - 1);
  const r1 = clamp(Math.ceil(toV(bottom) * field.rows), field.rows);
  if (c1 <= c0 || r1 <= r0) return null;

  let sum = 0;
  let count = 0;
  for (let row = r0; row < r1; row++) {
    const base = row * field.cols;
    for (let col = c0; col < c1; col++) {
      sum += field.data[base + col];
      count++;
    }
  }
  return count ? sum / count : null;
}
