/**
 * Every spine's look comes from its title and author, so the shelf is the
 * same on every visit and a book keeps its face as the library grows. Muted
 * cloth tones only: the Blackboard stays monochrome with a little warmth.
 */
export interface SpineLook {
  width: number;
  height: number;
  tone: string;
  ink: string;
  bands: number;
  bandAt: number;
  lettering: 'title' | 'author';
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

export function spineLook(title: string, author: string): SpineLook {
  const h = hash(`${title}\u0000${author}`);
  const pick = (shift: number, mod: number) => (h >>> shift) % mod;
  // Longer titles tend to be thicker books, within reason.
  const width = 24 + pick(0, 11) + Math.min(10, Math.floor(title.length / 9));
  const height = 148 + pick(5, 46);
  const { tone, ink } = TONES[pick(11, TONES.length)];
  return {
    width,
    height,
    tone,
    ink,
    bands: pick(17, 4) === 0 ? 0 : 1 + pick(19, 2),
    bandAt: 10 + pick(21, 12),
    lettering: pick(25, 7) === 0 ? 'author' : 'title',
  };
}

/** "Hemingway, Ernest" → "HEMINGWAY"; "(ed.)" and initials fall away. */
export function surname(author: string): string {
  const first = author.split(/[,/;]| and /)[0] ?? '';
  return first.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(-1)[0]?.toUpperCase() ?? '';
}
