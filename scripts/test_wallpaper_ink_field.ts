/* ═══════════════════════════════════════════════════════════════════════════
   Rendered-frame luminance field.

   The ink decision reads this grid, so its two properties that matter are that
   a cell is the MEAN of the pixels it covers (not a point sample), and that the
   grid is indexed top-down while `gl.readPixels` hands back bottom-up. Getting
   the row order wrong would mirror the field vertically, which is invisible on a
   symmetric wallpaper and badly wrong on one with a bright sky.

   The reason the field is built from rendered pixels at all is worth restating
   as a test: the plate-backed field measured 0.176 where the screen showed 0.111
   on `blossom`, because a scene composites its own layers over the plate. That
   is a property of the source, not something this function can assert, so what
   is checked here is only that the measurement of a given buffer is correct.
   ═══════════════════════════════════════════════════════════════════════════ */
import assert from 'node:assert/strict';
import { buildLuminanceFieldFromPixels, srgbToLinear } from '../artifacts/blackboard/src/blackboard/wallpaper/luminance';

/** Flat RGBA buffer of one grey level. */
function grey(width: number, height: number, level: number): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = level;
    out[i * 4 + 1] = level;
    out[i * 4 + 2] = level;
    out[i * 4 + 3] = 255;
  }
  return out;
}

const near = (a: number, b: number, tol: number, what: string) =>
  assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b}`);

// 1. Black and white are the ends of the range, in linear light.
{
  const black = buildLuminanceFieldFromPixels(grey(8, 8, 0), 8, 8, 800, 600, 4, 4);
  const white = buildLuminanceFieldFromPixels(grey(8, 8, 255), 8, 8, 800, 600, 4, 4);
  assert.ok(black && white);
  assert.equal(black.data[0], 0);
  near(white.data[0], 1, 1e-6, 'white must be 1.0 in linear light');
}

// 2. A cell is the mean of its pixels, averaged in LINEAR light — so a half
//    black / half white cell lands at 0.5, not at the 0.216 that averaging the
//    sRGB bytes (128) would give.
{
  const buf = new Uint8Array(2 * 1 * 4);
  buf.set([255, 255, 255, 255], 0);
  buf.set([0, 0, 0, 255], 4);
  const field = buildLuminanceFieldFromPixels(buf, 2, 1, 200, 100, 1, 1);
  assert.ok(field);
  near(field.data[0], 0.5, 1e-6, 'half white / half black must average to 0.5');
  near(srgbToLinear(128 / 255), 0.2158, 0.001, 'sanity: mid grey is ~0.216, so the two differ');
}

// 3. Mid grey maps to its linear value, not to 128/255.
{
  const field = buildLuminanceFieldFromPixels(grey(4, 4, 128), 4, 4, 400, 300, 2, 2);
  assert.ok(field);
  near(field.data[0], srgbToLinear(128 / 255), 1e-6, 'mid grey must be linearised');
}

// 4. Row order is top-down: row 0 of the field is the FIRST row of the buffer.
//    `readRenderedPixels` is what flips GL's bottom-up readback, so this pins the
//    convention the flip has to land on. Getting it wrong mirrors the field
//    vertically — invisible on a symmetric wallpaper, badly wrong on one with a
//    bright sky.
{
  const w = 4;
  const h = 4;
  const topDown = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const level = y < h / 2 ? 255 : 0;
      const p = (y * w + x) * 4;
      topDown[p] = level; topDown[p + 1] = level; topDown[p + 2] = level; topDown[p + 3] = 255;
    }
  }
  const field = buildLuminanceFieldFromPixels(topDown, w, h, 400, 400, 4, 4);
  assert.ok(field);
  near(field.data[0], 1, 1e-6, 'field row 0 must be the buffer row 0 (bright)');
  near(field.data[(4 - 1) * 4], 0, 1e-6, 'field last row must be dark');

  // And the mirror of that same buffer must produce the mirrored field, which is
  // what proves the function is order-sensitive rather than accidentally symmetric.
  const stride = w * 4;
  const flipped = new Uint8Array(topDown.length);
  for (let y = 0; y < h; y++) {
    flipped.set(topDown.subarray((h - 1 - y) * stride, (h - y) * stride), y * stride);
  }
  const mirror = buildLuminanceFieldFromPixels(flipped, w, h, 400, 400, 4, 4);
  assert.ok(mirror);
  near(mirror.data[0], 0, 1e-6, 'mirrored buffer must give a dark row 0');
}

// 5. The grid is over the VIEWPORT, so sampleRect's cover mapping is the identity
//    and a cell is exactly the same fraction of the screen.
{
  const field = buildLuminanceFieldFromPixels(grey(4, 4, 200), 4, 4, 390, 844, 6, 6);
  assert.ok(field);
  assert.equal(field.imageWidth, 390);
  assert.equal(field.imageHeight, 844);
  assert.equal(field.cols, 6);
  assert.equal(field.rows, 6);
  assert.equal(field.data.length, 36);
}

// 6. A truncated buffer is refused rather than read out of bounds.
{
  assert.equal(buildLuminanceFieldFromPixels(new Uint8Array(16), 8, 8, 100, 100, 4, 4), null);
  assert.equal(buildLuminanceFieldFromPixels(new Uint8Array(0), 0, 0, 100, 100, 4, 4), null);
}

console.log('wallpaper ink field: rendered-pixel bins, linear light, top-down rows, viewport mapping verified');
