/* ═══════════════════════════════════════════════════════════════════════════
   Wallpaper texture legality.

   WebGL 1 renders a non-power-of-two texture INCOMPLETE if it is given REPEAT
   wrapping or a mipmapped minification filter, and an incomplete texture samples
   as solid BLACK. Nothing throws: `texParameteri` accepts the value, the draw
   succeeds, and the only symptom is a canvas painted black.

   That shipped. Every photographic plate here is NPOT (2560x1080, 1920x1080,
   2560x1440), and the shared plate-scene helper asked for REPEAT — so the canvas
   became an opaque black rectangle sitting on top of a perfectly good plate,
   hiding it. Two wallpapers rendered as empty black screens while every
   DOM-level check reported them healthy, because the ink reads a separate
   mathematical field and never the canvas.

   `textureMode` is that rule pulled out as a pure function, so the behaviour is
   tested directly rather than only through the accident of a caller passing the
   right flag.
   ═══════════════════════════════════════════════════════════════════════════ */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { textureMode } from '../artifacts/blackboard/src/blackboard/wallpaper/gl';

// This runs from the scripts package, so cwd is `scripts/`. Anchor to the file
// instead: a relative path here would silently resolve against the wrong
// directory and the plate check below would find nothing.
const ROOT = join(import.meta.dirname, '..');

/** Sizes that must NOT be allowed REPEAT or mipmaps. */
const NPOT: Array<[string, number, number]> = [
  ['roses plate', 2560, 1080],
  ['lattice plate', 2560, 1080],
  ['japanese plate', 2560, 1440],
  ['forest plate', 1920, 1080],
  ['waves plate', 2560, 1440],
  ['blossom plate', 2560, 1441],
  ['portrait plate', 1080, 1920],
  ['4K plate', 3840, 2160],
];

/** Sizes where tiling must remain available. */
const POT: Array<[string, number, number]> = [
  ['noise map', 256, 256],
  ['phase map', 32, 32],
  ['single pixel', 1, 1],
];

for (const [label, width, height] of NPOT) {
  assert.deepEqual(
    textureMode(width, height, true, true),
    { repeat: false, mipmap: false },
    `${label} (${width}x${height}) is NPOT — REPEAT or mipmaps would render it as solid black`,
  );
}

for (const [label, width, height] of POT) {
  assert.deepEqual(
    textureMode(width, height, true, true),
    { repeat: true, mipmap: true },
    `${label} (${width}x${height}) is POT — tiling must stay available`,
  );
}

// Requesting neither must never gain either.
for (const [, width, height] of [...NPOT, ...POT]) {
  assert.deepEqual(textureMode(width, height, false, false), { repeat: false, mipmap: false });
}

// A failed decode reports 0, and a naive power-of-two test calls 0 a power of
// two because 0 & -1 is 0. It has to read as illegal.
assert.deepEqual(textureMode(0, 0, true, true), { repeat: false, mipmap: false });
assert.deepEqual(textureMode(0, 256, true, true), { repeat: false, mipmap: false });

/* The rule above is only worth anything if the real plates are the sizes it
   covers. Reading their headers keeps the fixtures honest: if a plate were
   later exported at 2048px the unit tests would still pass while testing a
   situation the site no longer has. */
const MEDIA = /\.(webp|png|jpe?g)$/i;
const variantsSource = readFileSync(
  join(ROOT, 'artifacts/blackboard/src/blackboard/wallpaper/variants.ts'),
  'utf8',
);
const declared = [...variantsSource.matchAll(/'(?:\/assets\/blackboard\/[^']+)'/g)].map(m =>
  m[0].slice(1, -1),
);

const read: Array<[string, number, number]> = [];
for (const path of declared) {
  if (!MEDIA.test(path)) continue;
  let bytes: Buffer;
  try {
    bytes = readFileSync(join(ROOT, 'artifacts/blackboard/public', path));
  } catch {
    continue; // a tier that is not built in this checkout
  }
  const size = imageSize(bytes);
  if (size) read.push([path, size[0], size[1]]);
}

assert.ok(read.length >= 10, `expected at least 10 image files, read ${read.length}`);

// Large sources are the photographic plates and must be NPOT — that is the case
// the fixtures above exist for. A large POT plate would mean the guard is not
// covering the assets that ship.
//
// Grading LUTs are the one exception, named: a LUT is POT by specification (its
// dimensions address the color cube, not the screen) and is always uploaded
// CLAMP without mipmaps, which is the combination the NPOT rule protects. If a
// second LUT ever ships, extend this list rather than weakening the rule.
const LUTS = new Set(['/assets/blackboard/gears/simple-film.png']);
const bigPot = read
  .filter(([, w, h]) => Math.max(w, h) > 512 && isPot(w) && isPot(h))
  .filter(([path]) => !LUTS.has(path))
  .map(([path, w, h]) => `${path} ${w}x${h}`);
assert.deepEqual(
  bigPot,
  [],
  'a large source is power-of-two; the NPOT fixtures no longer describe the shipped plates',
);

// Small sources are the procedural noise/phase maps. These are deliberately POT:
// they are the ones tiling is actually wanted for, so if they were ever swapped
// for NPOT the other half of the rule would stop being exercised.
const smallPot = read.filter(([, w, h]) => Math.max(w, h) <= 512 && isPot(w) && isPot(h));
assert.ok(
  smallPot.length >= 4,
  `expected the procedural maps to be POT and tiling-eligible, found ${smallPot.length}`,
);

// And the two that actually broke, named, so a regression here is unmistakable.
for (const want of ['/assets/blackboard/roses/roses.webp', '/assets/blackboard/lattice/lattice.webp']) {
  const hit = read.find(([path]) => path === want);
  assert.ok(hit, `${want} not found among the declared images`);
  assert.ok(
    !isPot(hit[1]) || !isPot(hit[2]),
    `${want} is POT — this fixture would no longer catch the black-canvas bug`,
  );
}

console.log(
  `wallpaper textures: NPOT rule verified; ${read.length} images read — ` +
    `${read.length - smallPot.length} NPOT plates (e.g. ${read
      .filter(([, w, h]) => Math.max(w, h) > 512)
      .slice(0, 2)
      .map(([p, w, h]) => `${p.split('/').pop()} ${w}x${h}`)
      .join(', ')}), ${smallPot.length} POT maps`,
);

function isPot(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

/** Width/height straight out of a WebP/PNG/JPEG header. */
function imageSize(bytes: Buffer): [number, number] | null {
  if (bytes.length > 24 && bytes.toString('ascii', 1, 4) === 'PNG') {
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  }
  if (
    bytes.length > 30 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const fourcc = bytes.toString('ascii', 12, 16);
    if (fourcc === 'VP8X') {
      return [
        1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
        1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
      ];
    }
    if (fourcc === 'VP8 ') {
      return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
    }
    if (fourcc === 'VP8L') {
      const bits = bytes.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
  }
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length - 9) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)];
      }
      i += 2 + bytes.readUInt16BE(i + 2);
    }
  }
  return null;
}


// Black Waves used CLAMP for its scrolling normal map. After a few minutes
// both samples hit constant edge texels: drawing kept running but motion stopped.
// Exercise the runtime bindings as well as the large-time phase calculation.
const { WAVES } = await import('../artifacts/blackboard/src/blackboard/wallpaper/variants');
const { wavesPhase } = await import('../artifacts/blackboard/src/blackboard/wallpaper/wavesPhase');
const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
const images: FakeImage[] = [];
class FakeImage {
  decoding = '';
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  get width() { return this.src.includes('normal') ? 256 : 2560; }
  get height() { return this.src.includes('normal') ? 256 : 1440; }
  get naturalWidth() { return this.width; }
  get naturalHeight() { return this.height; }
  constructor() { images.push(this); }
}
Object.defineProperty(globalThis, 'Image', { configurable: true, value: FakeImage });
try {
  let unit = 0;
  let lastPhase: [number, number] = [0, 0];
  const wraps: Array<[number, string, string]> = [];
  let draws = 0;
  const gl = {
    TEXTURE0: 0, TEXTURE_2D: 'texture', TEXTURE_WRAP_S: 's', TEXTURE_WRAP_T: 't',
    REPEAT: 'repeat', CLAMP_TO_EDGE: 'clamp', LINEAR: 'linear', TRIANGLE_STRIP: 'strip',
    drawingBufferWidth: 1024, drawingBufferHeight: 1366,
    getUniformLocation: (_program: unknown, name: string) => name,
    uniform1i() {}, uniform1f() {},
    uniform2f: (_name: string, x: number, y: number) => { lastPhase = [x, y]; },
    createTexture: () => ({}), activeTexture: (index: number) => { unit = index; },
    bindTexture() {}, pixelStorei() {}, texImage2D() {},
    texParameteri: (_target: string, param: string, value: string) => {
      if (param === 's' || param === 't') wraps.push([unit, param, value]);
    },
    drawArrays: () => { draws++; }, deleteTexture() {},
  };
  const context = gl as unknown as WebGLRenderingContext;
  const runtime = WAVES.create(context, {} as WebGLProgram, true)!;
  assert.equal(runtime.frame(context, 0), false, 'wait for both textures');
  assert.equal(images.length, 2, 'only the plate and normal map are needed');
  for (const image of images) image.onload?.();
  assert.deepEqual(wraps.filter(([unit]) => unit === 1), [[1, 's', 'repeat'], [1, 't', 'repeat']]);
  assert.deepEqual(wraps.filter(([unit]) => unit === 0), [[0, 's', 'clamp'], [0, 't', 'clamp']]);
  for (const [width, height] of [[375, 812], [768, 1024], [1024, 1366], [1366, 1024], [1920, 1080]]) {
    gl.drawingBufferWidth = width;
    gl.drawingBufferHeight = height;
    const aspect = width / height;
    for (const seconds of [0, 180, 600, 3600, 86400, 604800]) {
      assert(runtime.frame(context, seconds));
      const before = [...lastPhase];
      assert(lastPhase.every(value => value >= 0 && value < 1));
      runtime.frame(context, seconds + 1 / 30);
      assert.notDeepEqual(lastPhase, before, 'motion must advance after minutes, days and suspension');
      // Wrapping each final coordinate preserves the continuous original phase
      // modulo the repeating texture, even on non-square tablets.
      const phase = wavesPhase(seconds, aspect);
      for (const axis of [0, 1]) {
        const unbounded = seconds * 0.12 * 0.12 * 0.3 * (axis === 0 ? aspect : 1.68);
        assert(Math.abs(phase[axis] - (unbounded - Math.floor(unbounded))) < 1e-9);
      }
    }
    // Each axis has a different period. Its wrap must meet the same texture
    // coordinate without a jump, rather than resetting time for both axes.
    for (const factor of [aspect, 1.68]) {
      const period = 1 / (0.12 * 0.12 * 0.3 * factor);
      const axis = factor === aspect ? 0 : 1;
      const before = wavesPhase(period - 0.0001, aspect)[axis];
      const after = wavesPhase(period + 0.0001, aspect)[axis];
      assert((1 - before) + after < 0.00001);
    }
  }
  assert.equal(draws, 60);
  runtime.dispose(context);
  assert(images.every(image => image.onload === null && image.onerror === null));
  console.log('Black Waves: repeating normal map, bounded phase and long-running motion passed at phone/tablet/desktop aspects.');
} finally {
  if (originalImage) Object.defineProperty(globalThis, 'Image', originalImage);
  else delete (globalThis as { Image?: unknown }).Image;
}
