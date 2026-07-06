import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOOKS_MD = path.resolve(__dirname, '../../artifacts/digital-sea/src/content/books.md');
const OUTPUT_JSON = path.resolve(__dirname, '../../artifacts/digital-sea/src/data/bookMeta.json');

const GB_BASE = 'https://www.googleapis.com/books/v1/volumes';
const OL_SEARCH = 'https://openlibrary.org/search.json';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY ?? '';
const COVERS_ONLY = process.argv.includes('--covers-only');

interface Book {
  title: string;
  author: string;
  read: boolean;
  note?: string;
}

interface Shelf {
  name: string;
  books: Book[];
}

interface GBVolumeInfo {
  imageLinks?: { thumbnail?: string };
  description?: string;
}
interface GBItems {
  volumeInfo?: GBVolumeInfo;
}
interface GBResponse {
  items?: GBItems[];
}
interface OLDoc {
  cover_i?: number;
}
interface OLResponse {
  docs?: OLDoc[];
}
interface BookMeta {
  cover: string | null;
  desc: string | null;
}

interface OutputJSON {
  version: number;
  generatedAt: string;
  books: Record<string, BookMeta>;
}

function parseBooks(src: string): Shelf[] {
  const lines = src.split('\n');
  const shelves: Shelf[] = [];
  let current: Shelf | null = null;
  for (const l of lines) {
    if (l.startsWith('## ')) {
      if (current) shelves.push(current);
      current = { name: l.replace(/^## /, '').trim(), books: [] };
    } else if (current && l.startsWith('- [') && l.includes('] ')) {
      const read = l.includes('[x]');
      const content = l.replace(/^- \[[ x]\] /, '').trim();
      const sep = content.indexOf(' — ');
      let author = '';
      let title = content;
      if (sep > 0) {
        author = content.slice(0, sep).trim();
        title = content.slice(sep + 3).trim();
      }
      const noteMatch = title.match(/_\((.+?)\)_/);
      let note: string | undefined;
      if (noteMatch) {
        note = noteMatch[1];
        title = title.replace(/_\(.+?\)_/, '').trim();
      }
      current.books.push({ title, author, read, note });
    }
  }
  if (current) shelves.push(current);
  return shelves;
}

function bookKey(title: string, author: string): string {
  return `${title}|${author}`;
}

/** Last failure status per query, for the misses report ("429", "500", "no-item", "network"). */
export const gbLastStatus = new Map<string, string>();

async function fetchGoogleBooks(query: string): Promise<{ cover: string | null; desc: string | null } | null> {
  if (!GOOGLE_BOOKS_API_KEY) return null;
  const url = `${GB_BASE}?q=${encodeURIComponent(query)}&maxResults=1&fields=items(volumeInfo/imageLinks/thumbnail,volumeInfo/description)&key=${GOOGLE_BOOKS_API_KEY}`;
  // 429/5xx are transient (rate limit / server): retry up to 3 times with 2s/4s/8s backoff.
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status >= 500) {
        gbLastStatus.set(query, String(res.status));
        if (attempt < 3) {
          await sleep(2000 * 2 ** attempt);
          continue;
        }
        return null;
      }
      if (!res.ok) {
        gbLastStatus.set(query, String(res.status));
        return null;
      }
      const data = (await res.json()) as GBResponse;
      const item = data.items?.[0]?.volumeInfo;
      if (!item) {
        gbLastStatus.set(query, 'no-item');
        return null;
      }
      gbLastStatus.delete(query);
      const urlRaw = item.imageLinks?.thumbnail ?? null;
      const cover = urlRaw ? urlRaw.replace(/^http:/, 'https:') : null;
      const desc = item.description ?? null;
      return { cover, desc };
    } catch {
      gbLastStatus.set(query, 'network');
      if (attempt < 3) {
        await sleep(2000 * 2 ** attempt);
        continue;
      }
      return null;
    }
  }
  return null;
}

async function fetchOpenLibraryCover(query: string): Promise<string | null> {
  try {
    const url = `${OL_SEARCH}?q=${encodeURIComponent(query)}&fields=cover_i&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OL status ${res.status}`);
    const data = (await res.json()) as OLResponse;
    const coverId = data.docs?.[0]?.cover_i;
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }
    return null;
  } catch {
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Reading books.md...');
  const mdContent = fs.readFileSync(BOOKS_MD, 'utf-8');
  const shelves = parseBooks(mdContent);
  const allBooks = shelves.flatMap(s => s.books);
  const seen = new Set<string>();
  let dupes = 0;
  for (const b of allBooks) {
    const k = bookKey(b.title, b.author);
    if (seen.has(k)) dupes++;
    seen.add(k);
  }
  if (dupes > 0) console.log(`Note: ${dupes} duplicate title|author keys found in books.md (collapsed to shared entries).`);
  console.log(`Found ${allBooks.length} books across ${shelves.length} shelves.`);

  let output: OutputJSON = { version: 1, generatedAt: '', books: {} };
  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      output = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf-8'));
      console.log(`Loaded existing output with ${Object.keys(output.books).length} cached entries.`);
    } catch {
      console.log('Existing output corrupt, starting fresh.');
      output = { version: 1, generatedAt: '', books: {} };
    }
  }

  const toFetch = allBooks.filter(b => {
    const key = bookKey(b.title, b.author);
    if (!(key in output.books)) return true;
    const existing = output.books[key];
    // Complete misses always retry.
    if (existing.cover === null && existing.desc === null) return true;
    // desc-null entries: a cover alone does NOT mean Google Books was tried
    // (the first run may have been Open-Library-only). Re-attempt whenever a
    // GB key is available and descriptions are wanted this run.
    if (existing.desc === null && GOOGLE_BOOKS_API_KEY && !COVERS_ONLY) return true;
    return false;
  });

  if (toFetch.length === 0) {
    console.log('All books already cached. Nothing to fetch.');
    output.generatedAt = new Date().toISOString();
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Output written to ${OUTPUT_JSON}`);
    return;
  }

  console.log(`Need to fetch ${toFetch.length} books (${allBooks.length - toFetch.length} already cached).`);

  if (!GOOGLE_BOOKS_API_KEY) {
    if (COVERS_ONLY) {
      console.warn('WARNING: GOOGLE_BOOKS_API_KEY not set. Running in --covers-only mode (no descriptions, lower-quality covers).');
    } else {
      console.error('FATAL: GOOGLE_BOOKS_API_KEY not set. Descriptions cannot be fetched. Pass --covers-only to run anyway.');
      process.exit(1);
    }
  }

  let coversFound = 0;
  let descsFound = 0;
  const misses: string[] = [];
  const gbStatusByKey = new Map<string, string>();

  const CONCURRENCY = 5;
  const PAUSE_MS = 150;

  for (let i = 0; i < toFetch.length; i += CONCURRENCY) {
    const batch = toFetch.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (b) => {
      const query = b.author
        ? `${b.title} ${b.author}`
        : b.title;
      const key = bookKey(b.title, b.author);

      // Try Google Books first
      let cover: string | null = null;
      let desc: string | null = null;
      const gbResult = await fetchGoogleBooks(query);
      if (gbResult) {
        cover = gbResult.cover;
        desc = gbResult.desc;
      }

      // Fallback to Open Library for cover
      if (!cover) {
        cover = await fetchOpenLibraryCover(query);
      }

      if (cover) coversFound++;
      if (desc) descsFound++;
      if (!cover && !desc) misses.push(key);

      return { key, cover, desc, gbStatus: gbLastStatus.get(query) ?? null };
    }));

    for (const r of results) {
      const prev = output.books[r.key];
      output.books[r.key] = {
        cover: r.cover ?? prev?.cover ?? null,
        desc: r.desc ?? prev?.desc ?? null,
      };
      if (r.gbStatus) gbStatusByKey.set(r.key, r.gbStatus);
    }

    if (i + CONCURRENCY < toFetch.length) {
      await sleep(PAUSE_MS);
    }

    const pct = Math.min(100, Math.round(((i + batch.length) / toFetch.length) * 100));
    process.stdout.write(`\rProgress: ${pct}% (${i + batch.length}/${toFetch.length})`);
  }

  console.log('\n');

  output.generatedAt = new Date().toISOString();
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf-8');

  const noCover = new Array<string>();
  const noDesc = new Array<string>();
  for (const [key, meta] of Object.entries(output.books)) {
    if (!meta.cover) noCover.push(key);
    if (!meta.desc) noDesc.push(key);
  }

  console.log('=== Summary ===');
  console.log(`Total curated books: ${allBooks.length}`);
  console.log(`Unique entries in JSON: ${Object.keys(output.books).length}`);
  console.log(`Covers found: ${Object.keys(output.books).length - noCover.length}`);
  console.log(`Descriptions found: ${Object.keys(output.books).length - noDesc.length}`);
  const missFile = path.resolve(__dirname, '../../artifacts/digital-sea/src/data/bookMeta.misses.txt');
  const missLines = [
    `# Generated ${new Date().toISOString().slice(0, 10)}`,
    `# Total entries: ${Object.keys(output.books).length}`,
    `# ---`,
    `# no cover (${noCover.length})`,
    ...noCover,
    `# ---`,
    `# no description (${noDesc.length}) — [status] is the last Google Books result for this run`,
    ...noDesc.map(k => gbStatusByKey.has(k) ? `${k}  [${gbStatusByKey.get(k)}]` : k),
  ];
  fs.writeFileSync(missFile, missLines.join('\n') + '\n', 'utf-8');
  console.log(`Misses file written to ${missFile}`);
  console.log(`Output written to ${OUTPUT_JSON}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
