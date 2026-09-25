// Generate small WebP copies of the Blackboard's raster marks.
//
// The dock renders every project/social mark at 24px, and the header avatar at
// 56x64, but the sources are full-size art (the Blackjack mark alone is a
// 1254px, 1 MB PNG). Every one of them loaded on the home page. These copies
// are 3x the displayed size, which covers any phone's device pixel ratio.
//
// The originals stay in place: Open Graph cards, the favicon and the Digital
// Sea scene still reference them at full size.
//
// Run after adding or replacing a file in artifacts/blackboard/public/assets/nodes:
//   pnpm --filter @workspace/scripts exec node make-blackboard-icons.mjs
import { mkdirSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const nodes = fileURLToPath(new URL('../artifacts/blackboard/public/assets/nodes/', import.meta.url));
const icons = join(nodes, 'icons');
mkdirSync(icons, { recursive: true });

let written = 0;
for (const file of readdirSync(nodes)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
  await sharp(join(nodes, file))
    .resize(72, 72, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(join(icons, `${parse(file).name}.webp`));
  written += 1;
}

// Header avatar and loading mark: 56x64 CSS pixels at 3x.
await sharp(join(nodes, 'site-logo.png'))
  .resize(168, 192, { fit: 'inside' })
  .webp({ quality: 88, effort: 6 })
  .toFile(join(nodes, 'site-logo-avatar.webp'));

console.log(`wrote ${written} dock icons + site-logo-avatar.webp`);
