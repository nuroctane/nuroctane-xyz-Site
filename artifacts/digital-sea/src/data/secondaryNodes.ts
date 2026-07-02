import { nodes } from './nodes';

// Secondary media live in src/assets/secondary-nodes/ so Vite emits each file
// exactly once (the <img> only fetches when a tile actually renders). Drop a new
// image/gif there named "<cardname>-whatever.ext" and it auto-attaches to that card.
const modules = import.meta.glob(
  '../assets/secondary-nodes/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

export interface SecondaryMedia {
  url: string;
  file: string;
  isGif: boolean;
  link?: string;
  linkLabel?: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// The assignment is the filename prefix before the first hyphen. We match it to a
// main card id: exact id first, then normalized substring either way (so "tunerz"
// resolves to the "atxtunerz" card), then by label as a last resort.
function resolveNodeId(prefix: string): string | null {
  const p = norm(prefix);
  if (!p) return null;

  let n = nodes.find((nd) => norm(nd.id) === p);
  if (n) return n.id;

  n = nodes.find((nd) => {
    const nid = norm(nd.id);
    return nid.includes(p) || p.includes(nid);
  });
  if (n) return n.id;

  n = nodes.find((nd) => norm(nd.label).includes(p));
  return n ? n.id : null;
}

function buildMap(): Record<string, SecondaryMedia[]> {
  const map: Record<string, SecondaryMedia[]> = {};
  for (const [path, url] of Object.entries(modules)) {
    const file = path.split('/').pop() ?? path;
    const prefix = file.split('-')[0] ?? '';
    const id = resolveNodeId(prefix);
    if (!id) {
      if (import.meta.env.DEV) {
        console.warn(`[secondary-nodes] no matching card for "${file}" (prefix "${prefix}")`);
      }
      continue;
    }
    (map[id] ??= []).push({ url, file, isGif: /\.gif$/i.test(file) });
  }
  for (const id of Object.keys(map)) {
    map[id].sort((a, b) => a.file.localeCompare(b.file));
  }
  return map;
}

export const secondaryMediaByNode: Record<string, SecondaryMedia[]> = buildMap();

// Synthetic "Recommendations" link card that orbits the Goodreads card and
// navigates to the /books page. Not an image — rendered as a clickable card.
(secondaryMediaByNode['goodreads'] ??= []).push({
  url: '',
  file: 'goodreads-recommendations-link',
  isGif: false,
  link: '/books',
  linkLabel: 'RECOMMENDATIONS',
});

if (import.meta.env.DEV) {
  const summary = Object.fromEntries(
    Object.entries(secondaryMediaByNode).map(([k, v]) => [k, v.map((m) => m.file)]),
  );
  console.info('[secondary-nodes] assignment map:', summary);
}
