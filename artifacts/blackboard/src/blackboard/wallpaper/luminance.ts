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

/** sRGB channel (0..1) -> linear-light. */
export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
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
 * Pick the monochrome ink pole with the better contrast.
 *
 * `previous` biases the comparison so that an element hovering on the crossover
 * (a resize, a subtle cloud drift) does not flip back and forth. Light ink is
 * the site's default, so it wins ties.
 */
export function inkForLuminance(luminance: number, previous?: InkPolarity): InkPolarity {
  const { light, dark } = inkContrast(luminance);
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
