import { useMemo, useState, useEffect } from 'react';
import { StandaloneNav } from './StandaloneNav';
import raw from '../content/books.md?raw';

interface Book {
  title: string;
  author: string;
  read: boolean;
  note?: string;
  visitor?: boolean;
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

function initial(name: string): string {
  const m = name.match(/\p{L}/u);
  return m ? m[0].toUpperCase() : '?';
}

const STORAGE_KEY = 'visitor-books';

function loadVisitorBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

function saveVisitorBooks(books: Book[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {}
}

export default function BooksPage() {
  const shelves = useMemo(() => parseBooks(raw), []);
  const [detail, setDetail] = useState<Book | null>(null);
  const [visitorBooks, setVisitorBooks] = useState<Book[]>([]);
  const [vAuthor, setVAuthor] = useState('');
  const [vTitle, setVTitle] = useState('');

  useEffect(() => {
    setVisitorBooks(loadVisitorBooks());
  }, []);

  const addVisitorBook = () => {
    const title = vTitle.trim();
    if (!title) return;
    const book: Book = {
      title,
      author: vAuthor.trim(),
      read: false,
      visitor: true,
    };
    const next = [...visitorBooks, book];
    setVisitorBooks(next);
    saveVisitorBooks(next);
    setVAuthor('');
    setVTitle('');
  };

  const removeVisitorBook = (idx: number) => {
    const next = visitorBooks.filter((_, i) => i !== idx);
    setVisitorBooks(next);
    saveVisitorBooks(next);
  };

  const allShelves: Shelf[] = useMemo(() => {
    if (visitorBooks.length > 0) {
      return [{ name: 'Your Library', books: visitorBooks }, ...shelves];
    }
    return shelves;
  }, [shelves, visitorBooks]);

  return (
    <div className="standalone-page">
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>BOOKS
      </div>

      <div className="bs-add-form">
        <input
          className="bs-add-input"
          type="text"
          placeholder="Author"
          value={vAuthor}
          onChange={(e) => setVAuthor(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addVisitorBook(); }}
        />
        <input
          className="bs-add-input"
          type="text"
          placeholder="Title"
          value={vTitle}
          onChange={(e) => setVTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addVisitorBook(); }}
        />
        <button className="bs-add-btn" onClick={addVisitorBook} disabled={!vTitle.trim()}>
          + ADD
        </button>
      </div>

      {allShelves.map((s, si) => (
        <div key={si} className="bs-shelf">
          <div className="bs-shelf-title">
            {s.name} <span className="bs-shelf-count">({s.books.length})</span>
          </div>
          <div className="bs-grid">
            {s.books.map((b, i) => (
              <button
                key={`${b.title}-${i}`}
                className={`bs-card${b.read ? ' bs-card--read' : ''}${b.visitor ? ' bs-card--visitor' : ''}`}
                onClick={() => setDetail(b)}
                title={`${b.title}${b.author ? ' — ' + b.author : ''}`}
              >
                <div className="bs-cover">{initial(b.title)}</div>
                <div className="bs-info">
                  <div className="bs-title">{b.title}</div>
                  {b.author && <div className="bs-author">{b.author}</div>}
                </div>
                {b.visitor && (
                  <span
                    className="bs-card-remove"
                    onClick={(e) => { e.stopPropagation(); removeVisitorBook(i); }}
                    title="Remove"
                  >
                    ✕
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {detail && (
        <div className="bs-overlay" onClick={() => setDetail(null)}>
          <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => setDetail(null)}>✕</button>
            <div className="bs-modal-cover">{initial(detail.title)}</div>
            <div className="bs-modal-title">{detail.title}</div>
            {detail.author && <div className="bs-modal-author">{detail.author}</div>}
            <div className="bs-modal-status">
              {detail.read ? '✓ READ' : '○ UNREAD'}
            </div>
            {detail.note && <div className="bs-modal-note">{detail.note}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
