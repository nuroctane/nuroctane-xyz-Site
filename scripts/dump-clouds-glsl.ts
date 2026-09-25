// Dump the clouds wallpaper shaders to .glsl files for inspection in a shader tool.
// Usage: pnpm --filter @workspace/scripts exec tsx dump-clouds-glsl.ts [outDir]
import { VARIANTS } from '../artifacts/blackboard/src/blackboard/wallpaper/variants';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outDir = process.argv[2] ?? tmpdir();
const c = VARIANTS.clouds;
writeFileSync(join(outDir, 'clouds_vert.glsl'), c.vertex);
writeFileSync(join(outDir, 'clouds_frag.glsl'), c.fragment);
console.log('wrote', join(outDir, 'clouds_{vert,frag}.glsl'), c.vertex.length, c.fragment.length);
