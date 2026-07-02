import { useMemo } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import raw from '../content/resume.md?raw';

interface ResumeSection {
  heading: string;
  blocks: { text: string; list?: boolean; items?: string[] }[];
}

function parseResume(src: string): { title: string; intro: string; sections: ResumeSection[] } {
  const lines = src.split('\n');
  let title = '';
  let intro = '';
  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;
  let currentBlock: { text: string; list: boolean; items: string[] } | null = null;
  let pastTitle = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    if (l.startsWith('# ') && !title) {
      title = l.replace(/^# /, '').trim();
      pastTitle = true;
      continue;
    }

    if (l.startsWith('## ')) {
      if (currentBlock && current) current.blocks.push(currentBlock);
      currentBlock = null;
      if (current) sections.push(current);
      current = { heading: l.replace(/^## /, '').trim(), blocks: [] };
      continue;
    }

    if (!current && pastTitle && l.trim().startsWith('_') && !intro) {
      const trimmed = l.trim();
      if (trimmed.startsWith('_') && trimmed.endsWith('_')) {
        intro = trimmed.slice(1, -1);
        continue;
      }
    }

    if (!current) continue;

    if (l.startsWith('- ')) {
      const item = l.replace(/^- /, '').trim();
      if (!currentBlock || !currentBlock.list) {
        if (currentBlock) current.blocks.push(currentBlock);
        currentBlock = { text: '', list: true, items: [item] };
      } else {
        currentBlock.items.push(item);
      }
      continue;
    }

    if (l.trim() === '') {
      if (currentBlock && currentBlock.text) {
        current.blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    if (!currentBlock || currentBlock.list) {
      if (currentBlock) current.blocks.push(currentBlock);
      currentBlock = { text: l, list: false, items: [] };
    } else {
      currentBlock.text += (currentBlock.text ? ' ' : '') + l.trim();
    }
  }

  if (currentBlock && current) current.blocks.push(currentBlock);
  if (current) sections.push(current);

  return { title: title || 'Resume', intro, sections };
}

function renderInline(t: string) {
  const parts: { tag: 'text' | 'b' | 'i' | 'a'; v: string; href?: string }[] = [];
  let i = 0;
  while (i < t.length) {
    const bold = t.indexOf('**', i);
    const ital = t.indexOf('*', i);
    const link = t.indexOf('[', i);
    const next = Math.min(
      bold === -1 ? Infinity : bold,
      ital === -1 ? Infinity : ital,
      link === -1 ? Infinity : link,
    );
    if (next === Infinity) { parts.push({ tag: 'text', v: t.slice(i) }); break; }
    if (next > i) parts.push({ tag: 'text', v: t.slice(i, next) });
    if (next === bold) {
      const end = t.indexOf('**', bold + 2);
      if (end === -1) { parts.push({ tag: 'text', v: t.slice(bold) }); break; }
      parts.push({ tag: 'b', v: t.slice(bold + 2, end) });
      i = end + 2;
    } else if (next === ital) {
      const end = t.indexOf('*', ital + 1);
      if (end === -1) { parts.push({ tag: 'text', v: t.slice(ital) }); break; }
      parts.push({ tag: 'i', v: t.slice(ital + 1, end) });
      i = end + 1;
    } else {
      const close = t.indexOf(']', link + 1);
      if (close === -1) { parts.push({ tag: 'text', v: t.slice(link) }); break; }
      const inner = t.slice(link + 1, close);
      const hrefPart = t.indexOf('(', close + 1);
      if (hrefPart === close + 1) {
        const hrefEnd = t.indexOf(')', hrefPart + 1);
        if (hrefEnd !== -1) {
          parts.push({ tag: 'a', v: inner, href: t.slice(hrefPart + 1, hrefEnd) });
          i = hrefEnd + 1;
          continue;
        }
      }
      parts.push({ tag: 'text', v: inner });
      i = close + 1;
    }
  }
  return parts.map((p, k) => {
    if (p.tag === 'b') return <strong key={k}>{p.v}</strong>;
    if (p.tag === 'i') return <em key={k}>{p.v}</em>;
    if (p.tag === 'a') return <a key={k} href={p.href} target="_blank" rel="noreferrer">{p.v}</a>;
    return <span key={k}>{p.v}</span>;
  });
}

export default function ResumePage() {
  const { title, intro, sections } = useMemo(() => parseResume(raw), []);
  useStandaloneScroll();

  return (
    <div className="standalone-page">
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>RESUME
      </div>

      <h1 className="resume-title">{title}</h1>
      {intro && <p className="qs-desc">{intro}</p>}

      {sections.map((s, si) => (
        <div key={si} className="resume-section">
          <h2 className="resume-heading">{s.heading}</h2>
          {s.blocks.map((b, bi) =>
            b.list ? (
              <ul key={bi} className="resume-list">
                {b.items.map((item, ii) => (
                  <li key={ii}>{renderInline(item)}</li>
                ))}
              </ul>
            ) : (
              <p key={bi} className="resume-para">{renderInline(b.text)}</p>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
