interface Quote {
  text: string;
  source: string;
}

interface Section {
  name: string;
  description: string;
  quotes: Quote[];
}



/** Contiguous `>` lines form one quote entry (blank `>` / `> ` keep the block together). */
function isBlockquoteLine(l: string): boolean {
  return l.startsWith('>');
}

/** Obsidian/GFM callout opener: `> [!note]` or `>[!note]` (space optional). */
function isCalloutOpener(l: string): boolean {
  return /^>\s*\[!/.test(l);
}

function stripQuotePrefix(l: string): string {
  // CommonMark: `>` plus optional spaces
  return l.replace(/^>\s*/, '');
}

/** Attribution: `— Author`, `-- Author`, `– Author`, or `- @handle`. */
function matchAttr(line: string): string | null {
  const t = line.trim();
  let m = t.match(/^(?:—|--|–)\s*(.+)$/);
  if (m) return m[1].trim();
  m = t.match(/^-\s+(@\S.+)$/);
  if (m) return m[1].trim();
  return null;
}

/**
 * Split a contiguous `>` run into separate entries when a mid-block attribution
 * is followed by more body text (missing blank line between two quotes).
 * Normal multi-paragraph quotes have only a trailing attribution.
 */
function splitQuoteRun(quoteLines: string[]): { text: string; source: string }[] {
  const out: { text: string; source: string }[] = [];
  let start = 0;
  for (let k = 0; k < quoteLines.length; k++) {
    const src = matchAttr(quoteLines[k]);
    if (!src) continue;
    const hasMoreBody = quoteLines.slice(k + 1).some((x) => x.trim() !== '');
    if (!hasMoreBody) continue; // trailing attribution — end of this entry at loop end
    const chunk = quoteLines.slice(start, k + 1);
    while (chunk.length && chunk[chunk.length - 1].trim() === '') chunk.pop();
    if (chunk.length) {
      const body = chunk.slice(0, -1).join('\n').replace(/\n{3,}/g, '\n\n').trim();
      out.push({ text: body || src, source: src });
    }
    start = k + 1;
  }
  const rest = quoteLines.slice(start);
  while (rest.length && rest[rest.length - 1].trim() === '') rest.pop();
  if (!rest.length) return out;
  const src = matchAttr(rest[rest.length - 1]);
  if (src) {
    const body = rest.slice(0, -1).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    out.push({ text: body || src, source: src });
  } else {
    out.push({ text: rest.join('\n').replace(/\n{3,}/g, '\n\n').trim(), source: '' });
  }
  return out;
}

export function parseQuotes(src: string): Section[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let inIndex = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    if (l.startsWith('## Index')) { inIndex = true; continue; }
    if (inIndex && l.startsWith('## ') && !l.startsWith('## Index')) { inIndex = false; }
    if (inIndex) continue;

    if (l.startsWith('## ') && !l.startsWith('## Index')) {
      if (currentSection) sections.push(currentSection);
      const name = l.replace(/^## /, '').trim();

      // Description line follows after optional blank lines (starts with _)
      let descIdx = i + 1;
      while (descIdx < lines.length && lines[descIdx].trim() === '') descIdx++;
      const descLine = descIdx < lines.length ? lines[descIdx].trim() : '';
      const description = descLine.startsWith('_') && descLine.endsWith('_')
        ? descLine.slice(1, -1) : '';
      if (description) i = descIdx; // skip consumed lines

      currentSection = { name, description, quotes: [] };
      continue;
    }

    if (!isBlockquoteLine(l)) continue;

    // Skip entire Obsidian callout run (opener + continuation `>` lines)
    if (isCalloutOpener(l)) {
      let j = i + 1;
      while (j < lines.length && isBlockquoteLine(lines[j])) j++;
      i = j - 1;
      continue;
    }

    // One entry = one contiguous blockquote run (blank `>` lines keep paragraphs together).
    if (currentSection) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && isBlockquoteLine(lines[j]) && !isCalloutOpener(lines[j])) {
        quoteLines.push(stripQuotePrefix(lines[j]));
        j++;
      }
      i = j - 1;
      for (const q of splitQuoteRun(quoteLines)) {
        if (q.text || q.source) currentSection.quotes.push(q);
      }
    }
  }
  if (currentSection) sections.push(currentSection);

  return sections;
}

