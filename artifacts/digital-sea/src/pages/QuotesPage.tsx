import { useMemo, useState } from 'react';
import { StandaloneNav } from './StandaloneNav';
import raw from '../content/quotes.md?raw';

interface Quote {
  text: string;
  source: string;
}

interface Section {
  name: string;
  description: string;
  quotes: Quote[];
}

function parseMD(src: string): Section[] {
  const lines = src.split('\n');
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

    if (l.startsWith('> ') && currentSection) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].startsWith('> ')) {
        quoteLines.push(lines[j].replace(/^> /, ''));
        j++;
      }
      i = j - 1;

      const text = quoteLines.join('\n');
      const last = quoteLines[quoteLines.length - 1];
      const attrMatch = last.match(/^(—|--|–)\s*(.+)/);
      if (attrMatch) {
        const source = attrMatch[2].trim();
        const body = quoteLines.slice(0, -1).join('\n');
        currentSection.quotes.push({ text: body || source, source });
      } else {
        currentSection.quotes.push({ text, source: '' });
      }
    }
  }
  if (currentSection) sections.push(currentSection);

  return sections;
}

function renderText(t: string) {
  // ==highlight== → styled span
  // [[wiki-link]] or [[wiki-link|display]] → plain display text
  const parts: { t: 'text' | 'hl'; v: string }[] = [];
  let i = 0;
  while (i < t.length) {
    const hl = t.indexOf('==', i);
    const wl = t.indexOf('[[', i);
    if (hl === -1 && wl === -1) { parts.push({ t: 'text', v: t.slice(i) }); break; }
    const next = (hl !== -1 && (wl === -1 || hl < wl)) ? hl : wl;
    if (next > i) parts.push({ t: 'text', v: t.slice(i, next) });
    if (next === hl) {
      const end = t.indexOf('==', hl + 2);
      if (end === -1) { parts.push({ t: 'text', v: t.slice(hl) }); break; }
      parts.push({ t: 'hl', v: t.slice(hl + 2, end) });
      i = end + 2;
    } else {
      const end = t.indexOf(']]', wl + 2);
      if (end === -1) { parts.push({ t: 'text', v: t.slice(wl) }); break; }
      const inner = t.slice(wl + 2, end);
      const display = inner.includes('|') ? (inner.split('|')[1] ?? inner) : inner;
      parts.push({ t: 'text', v: display });
      i = end + 2;
    }
  }
  return parts.map((p, k) =>
    p.t === 'hl' ? <mark key={k} className="quote-hl">{p.v}</mark> : <span key={k}>{p.v}</span>
  );
}

const PAGE_SIZE = 30;

export default function QuotesPage() {
  const sections = useMemo(() => parseMD(raw), []);
  const [activeSec, setActiveSec] = useState(sections[0]?.name ?? '');
  const [count, setCount] = useState(PAGE_SIZE);

  const active = sections.find(s => s.name === activeSec) ?? sections[0];
  const shown = active?.quotes.slice(0, count) ?? [];

  const handleLoadMore = () => setCount(c => c + PAGE_SIZE);

  return (
    <div className="standalone-page">
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>QUOTES
      </div>

      <div className="qs-tabs">
        {sections.map(s => (
          <button
            key={s.name}
            className={`qs-tab${s.name === activeSec ? ' qs-tab--on' : ''}`}
            onClick={() => { setActiveSec(s.name); setCount(PAGE_SIZE); }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {active?.description && (
        <p className="qs-desc">{active.description}</p>
      )}

      <div className="qs-list">
        {shown.map((q, i) => (
          <blockquote key={i} className="qs-quote">
            <div className="qs-body">{renderText(q.text)}</div>
            {q.source && <div className="qs-source">— {q.source}</div>}
          </blockquote>
        ))}
      </div>

      {active && count < active.quotes.length && (
        <button className="qs-more" onClick={handleLoadMore}>
          LOAD MORE ({active.quotes.length - count} remaining)
        </button>
      )}
    </div>
  );
}
