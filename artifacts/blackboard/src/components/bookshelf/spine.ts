/**
 * Every spine's look comes from its title and author, so the shelf is the
 * same on every visit and a book keeps its face as the library grows. A book
 * whose cover is known wears that cover's colour and a vignette of its art
 * (scripts/src/spine-art.ts); the rest get a muted house cloth.
 */
export interface SpineLook {
  width: number;
  height: number;
  tone: string;
  ink: string;
  bands: number;
  bandAt: number;
  /** Seconds offset so long titles do not all scroll in step. */
  drift: number;
}

const TONES: { tone: string; ink: string }[] = [
  { tone: '#d6d0c2', ink: '#1d1c19' }, // bone
  { tone: '#b9b2a2', ink: '#1d1c19' }, // linen
  { tone: '#8f8d88', ink: '#121212' }, // ash
  { tone: '#5c6064', ink: '#ecebe6' }, // slate
  { tone: '#3d4146', ink: '#e7e5df' }, // iron
  { tone: '#2a2a2d', ink: '#d9d6cf' }, // graphite
  { tone: '#18181a', ink: '#cfcbc2' }, // ink
  { tone: '#4b3a37', ink: '#e9e1d6' }, // oxblood, faded
  { tone: '#45493c', ink: '#e6e3d6' }, // moss
  { tone: '#5d6873', ink: '#eef0f1' }, // chalk blue
  { tone: '#7a6d5a', ink: '#f1ece2' }, // umber
  { tone: '#a59b86', ink: '#1b1a17' }, // sand
];

function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** Id of a book's generated spine art; the same function as spineId() in
 * scripts/src/spine-art.ts. */
export function spineId(title: string, author: string): string {
  return hash(`${title}|${author}`).toString(16).padStart(8, '0');
}

export function spineLook(title: string, author: string, cloth?: [string, string]): SpineLook {
  const h = hash(`${title}\u0000${author}`);
  const pick = (shift: number, mod: number) => (h >>> shift) % mod;
  // Longer titles tend to be thicker books, within reason; wide enough for a
  // cover vignette to read.
  const width = 30 + pick(0, 11) + Math.min(10, Math.floor(title.length / 9));
  const height = 156 + pick(5, 40);
  const { tone, ink } = cloth ? { tone: cloth[0], ink: cloth[1] } : TONES[pick(11, TONES.length)];
  return {
    width,
    height,
    tone,
    ink,
    bands: pick(17, 4) === 0 ? 0 : 1 + pick(19, 2),
    bandAt: 6 + pick(21, 5),
    drift: pick(25, 90) / 10,
  };
}

/** "Hemingway, Ernest" → "HEMINGWAY"; "Augustine of Hippo" → "AUGUSTINE". */
export function surname(author: string): string {
  const first = (author.split(/[/;]| and /)[0] ?? '').replace(/\(.*?\)/g, '').trim();
  if (first.includes(',')) return first.split(',')[0].trim().toUpperCase();
  const words = first.split(/\s+/).filter(Boolean);
  // "X of Y" names are known by their first word.
  const of = words.findIndex((w) => /^(of|von|van|de|da|ben|ibn|al)$/i.test(w));
  return (of > 0 ? words[0] : words[words.length - 1] ?? '').toUpperCase();
}
