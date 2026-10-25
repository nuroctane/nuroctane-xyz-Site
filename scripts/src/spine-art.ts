/**
 * Spine art for the Books bookcase: for every book with a known cover, a tiny
 * centre crop of the cover (shared/public/assets/spines/<id>.webp, ~1-2 KB)
 * and a cloth tone + ink sampled from it (shared/content/book-spines.json), so
 * each spine carries its cover's look. Incremental: existing art is kept
 * unless --force. Run after books or covers change:
 *
 *   pnpm --filter @workspace/scripts exec tsx src/spine-art.ts [--force]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const BOOKS = path.join(root, 'shared/content/books.md');
const META = path.join(root, 'artifacts/blackboard/src/data/bookMeta.json');
const OUT_DIR = path.join(root, 'shared/public/assets/spines');
const MAP = path.join(root, 'shared/content/book-spines.json');
const FORCE = process.argv.includes('--force');

/** Same id as spineId() in artifacts/blackboard/src/components/bookshelf/spine.ts. */
export function spineId(title: string, author: string): string {
  let h = 0x811c9dc5;
  const text = `${title}|${author}`;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, '0');
}

function books(): { title: string; author: string }[] {
  const out: { title: string; author: string }[] = [];
  for (const line of readFileSync(BOOKS, 'utf8').split('\n')) {
    const match = line.trim().match(/^- \[[ x]\]\s+(.+)/);
    if (!match) continue;
    const split = match[1].split(' — ');
    const title = (split.slice(1).join(' — ') || split[0]).replace(/_\(.+?\)_/, '').trim();
    out.push({ title, author: split.length > 1 ? split[0].trim() : '' });
  }
  return out;
}

const hex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;

/** The cover's dominant colour as cloth: a little desaturated and darkened so
 * a shelf of covers still reads as one Blackboard bookcase. */
function cloth(r: number, g: number, b: number): { tone: string; ink: string } {
  const grey = 0.299 * r + 0.587 * g + 0.114 * b;
  const mix = (v: number) => (v * 0.78 + grey * 0.22) * 0.9 + 6;
  const [tr, tg, tb] = [mix(r), mix(g), mix(b)];
  const lum = (0.2126 * tr + 0.7152 * tg + 0.0722 * tb) / 255;
  return { tone: hex(tr, tg, tb), ink: lum > 0.52 ? '#1b1a17' : '#efece4' };
}

async function main() {
  const meta = (JSON.parse(readFileSync(META, 'utf8')) as { books: Record<string, { cover: string | null }> }).books;
  const map: Record<string, [string, string]> = existsSync(MAP)
    ? (JSON.parse(readFileSync(MAP, 'utf8')) as { spines: Record<string, [string, string]> }).spines
    : {};
  mkdirSync(OUT_DIR, { recursive: true });

  const todo = books()
    .map((b) => ({ ...b, id: spineId(b.title, b.author), cover: meta[`${b.title}|${b.author}`]?.cover }))
    .filter((b) => b.cover && (FORCE || !map[b.id] || !existsSync(path.join(OUT_DIR, `${b.id}.webp`))));

  let made = 0;
  let failed = 0;
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let b = queue.shift(); b; b = queue.shift()) {
        try {
          // Google's "edge=curl" bakes a page curl into the image.
          const url = b.cover!.replace(/&edge=curl/, '').replace(/^http:/, 'https:');
          const res = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { 'user-agent': 'nuroctane-spine-art' } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const image = sharp(Buffer.from(await res.arrayBuffer()));
          const { dominant } = await image.clone().resize(32, 48, { fit: 'cover' }).stats();
          map[b.id] = Object.values(cloth(dominant.r, dominant.g, dominant.b)) as [string, string];
          // A portrait centre crop: what a spine vignette shows of the cover.
          await image.clone().resize(48, 64, { fit: 'cover', position: 'attention' }).webp({ quality: 58, effort: 6 }).toFile(path.join(OUT_DIR, `${b.id}.webp`));
          made++;
        } catch (err) {
          failed++;
          console.warn(`skip ${b.title}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }),
  );

  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [z]) => a.localeCompare(z)));
  writeFileSync(MAP, `${JSON.stringify({ version: 1, spines: sorted }, null, 0)}\n`);
  console.log(`spine art: ${made} made, ${failed} failed, ${Object.keys(sorted).length} total`);
}

await main();
