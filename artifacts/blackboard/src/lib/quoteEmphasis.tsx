import type { ReactNode } from 'react';

// **bold** / *italic*. Delimiters must hug non-space text, so `***` and
// stray asterisks ("evil *** society") stay literal.
const EMPHASIS_RE = /\*\*([^*\s](?:[^*\n]*[^*\s])?)\*\*|\*([^*\s](?:[^*\n]*[^*\s])?)\*/g;

export function renderEmphasis(t: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of t.matchAll(EMPHASIS_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(t.slice(last, at));
    out.push(m[1] !== undefined ? <strong key={at}>{m[1]}</strong> : <em key={at}>{m[2]}</em>);
    last = at + m[0].length;
  }
  if (last === 0) return t;
  if (last < t.length) out.push(t.slice(last));
  return out;
}
