import { useMemo, useState } from 'react';
import { StandaloneNav } from './StandaloneNav';
import raw from '../content/books.md?raw';

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
      // Author — Title split on first " — " (em dash, U+2014)
      const sep = content.indexOf(' — ');
      let author = '';
      let title = content;
      if (sep > 0) {
        author = content.slice(0, sep).trim();
        title = content.slice(sep + 3).trim();
      }
      current.books.push({ title, author, read });
    }
  }
  if (current) shelves.push(current);
  return shelves;
}

function initial(name: string): string {
  const m = name.match(/\p{L}/u);
  return m ? m[0].toUpperCase() : '?';
}

export default function BooksPage() {
  const shelves = useMemo(() => parseBooks(raw), []);
  const [detail, setDetail] = useState<Book | null>(null);

  return (
    <div className="standalone-page">
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>BOOKS
      </div>

      {shelves.map(s => (
        <div key={s.name} className="bs-shelf">
          <div className="bs-shelf-title">
            {s.name} <span className="bs-shelf-count">({s.books.length})</span>
          </div>
          <div className="bs-grid">
            {s.books.map((b, i) => (
              <button
                key={`${b.title}-${i}`}
                className={`bs-card${b.read ? ' bs-card--read' : ''}`}
                onClick={() => setDetail(b)}
                title={`${b.title} — ${b.author}`}
              >
                <div className="bs-cover">{initial(b.title)}</div>
                <div className="bs-info">
                  <div className="bs-title">{b.title}</div>
                  <div className="bs-author">{b.author}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {detail && (
        <div className="bs-overlay" onClick={() => setDetail(null)}>
          <div className="bs-modal" onClick={e => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => setDetail(null)}>✕</button>
            <div className="bs-modal-cover">{initial(detail.title)}</div>
            <div className="bs-modal-title">{detail.title}</div>
            <div className="bs-modal-author">{detail.author}</div>
            <div className="bs-modal-status">{detail.read ? '✓ READ' : '○ UNREAD'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
