/* ═══════════════════════════════════════════════════════════════════════════
   Wallpaper shader declarations.

   A fragment shader that fails to compile costs the entire program, and the
   render path in BlackboardWallpaper treats a null program as "nothing to
   draw" — so the canvas stays at opacity 0 and the viewer sees whichever static
   plate is underneath. That is a silent, total loss of the animation with no
   error anywhere the visitor can see.

   It happened: `sweep` spliced in COMMON_GLSL, whose coverUv() reads
   `uImageAspect`, and declared only `uAspect`. The clockwise rotation this
   whole variant exists for never reached the screen, while the ink — driven
   separately from liveField, not the canvas — kept flipping correctly and made
   the feature look alive in every DOM-level check.

   Every uniform a shader READS has to be one it DECLARES, so this asserts that
   statically over the final assembled source. Uniform names here are `u` plus a
   capital, which GLSL ES built-ins never are, so the reference scan needs no
   type analysis.
   ═══════════════════════════════════════════════════════════════════════════ */
import assert from 'node:assert/strict';
import { VARIANTS } from '../artifacts/blackboard/src/blackboard/wallpaper/variants';

/** `uniform <type> <name>;` — including sampler2D, which has a capital. */
const DECLARATION = /uniform\s+[A-Za-z_][A-Za-z0-9_]*\s+(u[A-Z][A-Za-z0-9_]*)\s*(\[[^\]]*\])?\s*;/g;

function declaredUniforms(source: string): Set<string> {
  const found = new Set<string>();
  for (const match of source.matchAll(DECLARATION)) found.add(match[1]);
  return found;
}

/**
 * Uniform-shaped identifiers actually referenced. Comments are stripped first:
 * several variants explain a uniform in prose, and a name mentioned only in a
 * comment is not a read that has to resolve.
 */
function referencedUniforms(source: string): Set<string> {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    // The declaration itself is not a reference.
    .replace(DECLARATION, ' ');
  const found = new Set<string>();
  for (const match of code.matchAll(/\b(u[A-Z][A-Za-z0-9_]*)\b/g)) found.add(match[1]);
  return found;
}

let checked = 0;
const ids = Object.keys(VARIANTS) as Array<keyof typeof VARIANTS>;

for (const id of ids) {
  const variant = VARIANTS[id];

  for (const [stage, source] of [['vertex', variant.vertex], ['fragment', variant.fragment]] as const) {
    const declared = declaredUniforms(source);
    const referenced = referencedUniforms(source);
    const missing = [...referenced].filter(name => !declared.has(name)).sort();

    assert.deepEqual(
      missing,
      [],
      `${id}: ${stage} shader reads ${missing.join(', ')} without declaring ${missing.length === 1 ? 'it' : 'them'} — ` +
        'the program will fail to link and the canvas will never paint',
    );
    checked++;
  }

  // The shared block is spliced into every fragment, so the uniform its helper
  // depends on is required even of a variant that never calls the helper. Stated
  // separately from the scan above because that scan cannot see this: a shader
  // that reads nothing from the block still has to compile alongside it.
  if (variant.fragment.includes('coverUv(') || variant.fragment.includes('uniform float uAspect')) {
    assert.ok(
      declaredUniforms(variant.fragment).has('uImageAspect'),
      `${id}: fragment splices COMMON_GLSL, so it must declare uImageAspect even if it never samples`,
    );
  }

  // A video variant has no shader of its own; its fragment is a blank pass and
  // its element does the drawing, so there is nothing further to assert.
  if (variant.video) {
    assert.equal(variant.create.length, 0, `${id}: a video variant must not build a runtime`);
  }
}

// Guards the guard: if the scan stops finding uniforms, the assertions above
// would pass vacuously and report safety that was never checked.
const sample = 'uniform float uTime;\nuniform sampler2D uImage;\nvoid main(){ float x = uTime + uImageAspect; }';
assert.deepEqual([...declaredUniforms(sample)].sort(), ['uImage', 'uTime']);
assert.deepEqual([...referencedUniforms(sample)].sort(), ['uImageAspect', 'uTime']);

console.log(`wallpaper shaders: ${checked} stages across ${ids.length} variants declare every uniform they read`);
assert.ok(checked >= 24, `expected at least 24 shader stages, scanned ${checked}`);
