import { useEffect, useMemo, type ReactNode } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { MiniAudio } from '../components/hud/MiniAudio';
import { ScrollToTop } from '../components/hud/ScrollToTop';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import raw from '../content/resume.md?raw';

/* ── Types ─────────────────────────────────────────────────────────────── */

type InlinePart =
  | { tag: 'text'; v: string }
  | { tag: 'b'; v: string }
  | { tag: 'i'; v: string }
  | { tag: 'code'; v: string }
  | { tag: 'a'; v: string; href: string };

type ListItem = { text: string; children: ListItem[] };

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'quote'; paragraphs: string[] }
  | { kind: 'list'; items: ListItem[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'hr' }
  | { kind: 'job'; company: string; role: string; dates: string; bullets: string[] }
  | { kind: 'h3'; text: string };

interface ResumeSection {
  heading: string;
  blocks: Block[];
}

interface ResumeDoc {
  name: string;
  tagline: string;
  contacts: { label: string; href?: string }[];
  sections: ResumeSection[];
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Strip box-drawing / block glyphs and collapse letter-spaced titles. */
function cleanHeading(raw: string): string {
  const stripped = raw.replace(/[═█▓▒░▄▀❖]/g, ' ').trim();
  // Split on 2+ spaces (word groups), collapse "P R O J E C T S" → "PROJECTS"
  return stripped
    .split(/\s{2,}/)
    .map(chunk => {
      const t = chunk.replace(/\s+/g, ' ').trim();
      if (/^(?:[A-Za-z] )+[A-Za-z]$/.test(t)) return t.replace(/ /g, '');
      return t;
    })
    .filter(Boolean)
    .join(' ');
}

function contactHref(label: string): string | undefined {
  const t = label.trim();
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) return `mailto:${t}`;
  if (/^\+?[\d\s().-]{7,}$/.test(t) && /\d{3,}/.test(t)) {
    return `tel:${t.replace(/[^\d+]/g, '')}`;
  }
  if (/^https?:\/\//i.test(t)) return t;
  if (/^(github\.com|nuroctane\.xyz|www\.)/i.test(t)) return `https://${t}`;
  return undefined;
}

function parseTableRows(lines: string[], start: number): { headers: string[]; rows: string[][]; next: number } {
  const split = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(c => c.trim());

  const headers = split(lines[start]);
  let i = start + 1;
  // skip alignment row
  if (i < lines.length && /^\|?\s*:?-{2,}/.test(lines[i])) i++;
  const rows: string[][] = [];
  while (i < lines.length && lines[i].includes('|') && !lines[i].startsWith('***')) {
    rows.push(split(lines[i]));
    i++;
  }
  return { headers, rows, next: i - 1 };
}

function listIndent(line: string): number {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

function isListLine(line: string): boolean {
  return /^\s*[-*]\s+/.test(line);
}

function listText(line: string): string {
  return line.replace(/^\s*[-*]\s+/, '').trim();
}

function parseNestedList(lines: string[], start: number): { items: ListItem[]; next: number } {
  const base = listIndent(lines[start]);
  const items: ListItem[] = [];
  let i = start;

  while (i < lines.length && isListLine(lines[i])) {
    const ind = listIndent(lines[i]);
    if (ind < base) break;
    if (ind > base) {
      // nested under previous item
      if (items.length === 0) {
        items.push({ text: listText(lines[i]), children: [] });
        i++;
        continue;
      }
      const nested = parseNestedList(lines, i);
      items[items.length - 1].children.push(...nested.items);
      i = nested.next + 1;
      continue;
    }
    items.push({ text: listText(lines[i]), children: [] });
    i++;
  }
  return { items, next: i - 1 };
}

function parseResume(src: string): ResumeDoc {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  let name = 'Resume';
  let tagline = '';
  let contacts: { label: string; href?: string }[] = [];
  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;
  let i = 0;

  // Banner / name
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('# ') && /[A-Za-z]/.test(l) && !l.includes('═')) {
      const extracted = cleanHeading(l.replace(/^#\s*/, ''));
      if (extracted) name = extracted.replace(/\s{2,}/g, ' ');
      i++;
      continue;
    }
    if (l.startsWith('# ') || l.trim() === '') {
      i++;
      continue;
    }
    break;
  }

  // Tagline + contacts (pre-section body)
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('## ') || l.startsWith('### ')) break;
    if (l.startsWith('***') || l.trim() === '---') {
      i++;
      continue;
    }
    if (l.startsWith('# ')) {
      i++;
      continue;
    }

    const boldOnly = l.match(/^\*\*(.+)\*\*$/);
    if (boldOnly && !tagline && !boldOnly[1].includes('[ `')) {
      tagline = boldOnly[1];
      i++;
      continue;
    }

    if (l.includes('[ `') && l.includes('` ]')) {
      const re = /\[\s*`([^`]+)`\s*\]/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(l)) !== null) {
        const label = m[1].trim();
        contacts.push({ label, href: contactHref(label) });
      }
      i++;
      continue;
    }

    i++;
  }

  const pushBlock = (b: Block) => {
    if (!current) {
      current = { heading: '', blocks: [] };
    }
    current.blocks.push(b);
  };

  const flushSection = () => {
    if (current) {
      const hasContent = current.heading || current.blocks.some(b => b.kind !== 'hr');
      if (hasContent) sections.push(current);
      current = null;
    }
  };

  while (i < lines.length) {
    const l = lines[i];

    // decorative trailing banner
    if (l.startsWith('# ') && l.includes('═')) {
      i++;
      continue;
    }

    if (l.startsWith('## ')) {
      flushSection();
      current = { heading: cleanHeading(l.replace(/^##\s*/, '')), blocks: [] };
      i++;
      continue;
    }

    if (l.startsWith('### ')) {
      const h = cleanHeading(l.replace(/^###\s*/, ''));
      // Job pattern inside work experience: company, role line, blockquote bullets
      if (current && /experience/i.test(current.heading)) {
        let role = '';
        let dates = '';
        const bullets: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        if (j < lines.length) {
          const roleLine = lines[j];
          // **`Role`** | *(dates)*
          const roleMatch = roleLine.match(/\*\*`?([^`*]+)`?\*\*[^|]*\|\s*\*?[(*]*([^)*]+)[)*]*/);
          if (roleMatch) {
            role = roleMatch[1].trim();
            dates = roleMatch[2].trim();
            j++;
          } else if (roleLine.startsWith('**')) {
            role = roleLine.replace(/\*\*/g, '').replace(/`/g, '').trim();
            j++;
          }
        }
        while (j < lines.length) {
          const bl = lines[j];
          if (bl.startsWith('## ') || bl.startsWith('### ') || bl.startsWith('***')) break;
          if (bl.startsWith('>')) {
            const body = bl.replace(/^>\s?/, '').replace(/^\*\s+/, '').trim();
            if (body) bullets.push(body);
            j++;
            continue;
          }
          if (bl.trim() === '') {
            j++;
            continue;
          }
          break;
        }
        pushBlock({ kind: 'job', company: h, role, dates, bullets });
        i = j;
        continue;
      }
      // Standalone ### (e.g. SUMMARY) → section heading
      flushSection();
      current = { heading: h, blocks: [] };
      i++;
      continue;
    }

    if (l.startsWith('***') || l.trim() === '---') {
      if (current) pushBlock({ kind: 'hr' });
      i++;
      continue;
    }

    if (l.trim().startsWith('|') && l.includes('|')) {
      const { headers, rows, next } = parseTableRows(lines, i);
      pushBlock({ kind: 'table', headers, rows });
      i = next + 1;
      continue;
    }

    if (l.startsWith('>')) {
      const paragraphs: string[] = [];
      let buf: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].startsWith('>')) {
        const body = lines[j].replace(/^>\s?/, '');
        if (body.trim() === '') {
          if (buf.length) {
            paragraphs.push(buf.join(' ').trim());
            buf = [];
          }
        } else {
          // strip leading list markers inside quotes for flat paragraphs
          buf.push(body.replace(/^\*\s+/, '').trim());
        }
        j++;
      }
      if (buf.length) paragraphs.push(buf.join(' ').trim());
      pushBlock({ kind: 'quote', paragraphs: paragraphs.filter(Boolean) });
      i = j;
      continue;
    }

    if (isListLine(l)) {
      const { items, next } = parseNestedList(lines, i);
      pushBlock({ kind: 'list', items });
      i = next + 1;
      continue;
    }

    if (l.trim() === '' || l.startsWith('# ')) {
      i++;
      continue;
    }

    // paragraph (may span blank-less consecutive lines)
    let text = l.trim();
    let j = i + 1;
    while (
      j < lines.length &&
      lines[j].trim() !== '' &&
      !lines[j].startsWith('#') &&
      !lines[j].startsWith('##') &&
      !lines[j].startsWith('###') &&
      !lines[j].startsWith('>') &&
      !lines[j].startsWith('***') &&
      !isListLine(lines[j]) &&
      !lines[j].trim().startsWith('|')
    ) {
      text += ' ' + lines[j].trim();
      j++;
    }
    pushBlock({ kind: 'p', text });
    i = j;
  }

  flushSection();

  return { name, tagline, contacts, sections };
}

/* ── Inline rendering ──────────────────────────────────────────────────── */

function renderInline(t: string): ReactNode[] {
  const parts: InlinePart[] = [];
  let i = 0;

  while (i < t.length) {
    // code `...`
    if (t[i] === '`') {
      const end = t.indexOf('`', i + 1);
      if (end !== -1) {
        parts.push({ tag: 'code', v: t.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // bold **...**
    if (t.startsWith('**', i)) {
      const end = t.indexOf('**', i + 2);
      if (end !== -1) {
        parts.push({ tag: 'b', v: t.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // italic *...* (not list leftover)
    if (t[i] === '*' && t[i + 1] !== '*') {
      const end = t.indexOf('*', i + 1);
      if (end !== -1) {
        parts.push({ tag: 'i', v: t.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // markdown link [text](url)
    if (t[i] === '[') {
      const close = t.indexOf(']', i + 1);
      if (close !== -1 && t[close + 1] === '(') {
        const hrefEnd = t.indexOf(')', close + 2);
        if (hrefEnd !== -1) {
          parts.push({
            tag: 'a',
            v: t.slice(i + 1, close),
            href: t.slice(close + 2, hrefEnd),
          });
          i = hrefEnd + 1;
          continue;
        }
      }
      // bare [ label ] without href — keep brackets soft
      if (close !== -1) {
        const inner = t.slice(i + 1, close).trim();
        // drop decorative outer brackets around bold project titles
        parts.push({ tag: 'text', v: inner });
        i = close + 1;
        continue;
      }
    }

    // plain run until next special
    let j = i + 1;
    while (j < t.length && t[j] !== '`' && t[j] !== '*' && t[j] !== '[') j++;
    parts.push({ tag: 'text', v: t.slice(i, j) });
    i = j;
  }

  return parts.map((p, k) => {
    if (p.tag === 'b') return <strong key={k}>{renderInline(p.v)}</strong>;
    if (p.tag === 'i') return <em key={k}>{renderInline(p.v)}</em>;
    if (p.tag === 'code') return <code key={k} className="resume-code">{p.v}</code>;
    if (p.tag === 'a') {
      return (
        <a key={k} href={p.href} target="_blank" rel="noreferrer">
          {p.v}
        </a>
      );
    }
    return <span key={k}>{p.v}</span>;
  });
}

function ListTree({ items, depth = 0 }: { items: ListItem[]; depth?: number }) {
  return (
    <ul className={`resume-list${depth > 0 ? ' resume-list--nested' : ''}`}>
      {items.map((item, i) => (
        <li key={i}>
          <span className="resume-list-text">{renderInline(item.text)}</span>
          {item.children.length > 0 && <ListTree items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'hr':
      return <div className="resume-hr" aria-hidden />;
    case 'p':
      return <p className="resume-para">{renderInline(block.text)}</p>;
    case 'h3':
      return <h3 className="resume-subhead">{block.text}</h3>;
    case 'quote':
      return (
        <blockquote className="resume-quote">
          {block.paragraphs.map((p, i) => (
            <p key={i} className="resume-quote-p">{renderInline(p)}</p>
          ))}
        </blockquote>
      );
    case 'list':
      return <ListTree items={block.items} />;
    case 'table':
      return (
        <div className="resume-table-wrap">
          <table className="resume-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'job':
      return (
        <article className="resume-job">
          <h3 className="resume-job-company">{block.company}</h3>
          {(block.role || block.dates) && (
            <div className="resume-job-meta">
              {block.role && <span className="resume-job-role">{block.role}</span>}
              {block.role && block.dates && <span className="resume-job-sep">·</span>}
              {block.dates && <span className="resume-job-dates">{block.dates}</span>}
            </div>
          )}
          {block.bullets.length > 0 && (
            <ul className="resume-list resume-list--job">
              {block.bullets.map((b, i) => (
                <li key={i}>{renderInline(b)}</li>
              ))}
            </ul>
          )}
        </article>
      );
    default:
      return null;
  }
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function ResumePage() {
  const doc = useMemo(() => parseResume(raw), []);
  useStandaloneScroll();

  // Hidden page: keep crawlers out; only reachable via direct URL.
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    const prev = robots.content;
    robots.content = 'noindex, nofollow';
    return () => {
      if (created) robots?.remove();
      else if (robots) robots.content = prev;
    };
  }, []);

  return (
    <div className="standalone-page resume-page">
      <ScrollToTop />
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>RESUME
        <MiniAudio />
      </div>

      <header className="resume-hero">
        <h1 className="resume-title">{doc.name}</h1>
        {doc.tagline && <p className="resume-tagline">{doc.tagline}</p>}
        {doc.contacts.length > 0 && (
          <ul className="resume-contacts">
            {doc.contacts.map((c, i) => (
              <li key={i}>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {c.label}
                  </a>
                ) : (
                  <span>{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </header>

      {doc.sections.map((s, si) => (
        <section key={si} className="resume-section">
          {s.heading && <h2 className="resume-heading">{s.heading}</h2>}
          {s.blocks.map((b, bi) => (
            <BlockView key={bi} block={b} />
          ))}
        </section>
      ))}
    </div>
  );
}
