import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Quote, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import booksRaw from '../content/books.md?raw';
import quotesRaw from '../content/quotes.md?raw';
import bookMeta from '../data/bookMeta.json';
import { trackEvent } from '../lib/analytics';
import './blackboard-pages.css';

type Book = { title: string; author: string; read: boolean; note?: string; visitor?: boolean; coverUrl?: string; description?: string; year?: string; source?: string; sourceUrl?: string; dateAdded?: string; sessionId?: string };
type Shelf = { name: string; books: Book[] };
type SearchResult = { id: string; title: string; author: string; coverUrl?: string; description?: string; year?: string; source?: string; sources: string[]; sourceUrl?: string };
const metaMap = bookMeta.books as Record<string, { cover: string | null; desc: string | null }>;
const keyOf = (book: Book) => `${book.title}|${book.author}`;
const initial = (title: string) => title.match(/\p{L}/u)?.[0]?.toUpperCase() ?? '?';
const dateLabel = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

function parseBooks(raw: string): Shelf[] {
  const shelves: Shelf[] = []; let current: Shelf | undefined;
  for (const line of raw.split('\n')) {
    if (line.startsWith('## ')) { current = { name: line.slice(3).trim(), books: [] }; shelves.push(current); continue; }
    const match = line.trim().match(/^- \[([ x])\]\s+(.+)/); if (!current || !match) continue;
    const split = match[2].split(' — '); let title = (split.slice(1).join(' — ') || split[0]).trim();
    const note = title.match(/_\((.+?)\)_/)?.[1]; title = title.replace(/_\(.+?\)_/, '').trim();
    current.books.push({ author: split[0]?.trim() ?? '', title, read: match[1] === 'x', note });
  }
  return shelves;
}

function parseQuotes(raw: string) {
  const sections: { name: string; quotes: { text: string; source: string }[] }[] = []; let current: (typeof sections)[number] | undefined; let pending: string[] = [];
  const flush = () => { if (!current || !pending.length) return; const source = pending.at(-1)?.match(/^(?:—|--|–|- )\s*(.+)$/)?.[1] ?? ''; const body = source ? pending.slice(0, -1) : pending; if (body.join('').trim()) current.quotes.push({ text: body.join(' ').trim(), source }); pending = []; };
  for (const line of raw.split('\n')) { if (line.startsWith('## ')) { flush(); current = { name: line.slice(3).trim(), quotes: [] }; sections.push(current); continue; } if (line.startsWith('>')) pending.push(line.replace(/^>\s?/, '').trim()); else if (!line.trim()) flush(); }
  flush(); return sections;
}

function LibraryChrome({ active, children }: { active: 'books' | 'quotes'; children: React.ReactNode }) {
  return <main className="bb-library"><header className="bb-library-header"><a className="bb-library-home" href="/" aria-label="Back to Blackboard"><ArrowLeft aria-hidden="true" /></a><nav className="bb-library-tabs" aria-label="Library navigation"><a className={active === 'books' ? 'is-active' : ''} href="/books"><BookOpen aria-hidden="true" /> Books</a><a className={active === 'quotes' ? 'is-active' : ''} href="/quotes"><Quote aria-hidden="true" /> Quotes</a></nav></header><section className="bb-library-content">{children}</section></main>;
}

function BookModal({ book, onClose, onToggle }: { book: Book; onClose: () => void; onToggle?: () => void }) {
  const meta = metaMap[keyOf(book)]; const [cover, setCover] = useState(book.coverUrl ?? meta?.cover ?? null); const [description, setDescription] = useState(book.description ?? meta?.desc ?? null);
  useEffect(() => { if (cover && description) return; fetch(`/api/book-search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`).then(r => r.ok ? r.json() : null).then(data => { const result = data?.results?.[0]; if (result) { if (!cover) setCover(result.coverUrl ?? null); if (!description) setDescription(result.description ?? null); } }).catch(() => undefined); }, [book, cover, description]);
  return <div className="bb-modal-overlay" onClick={onClose}><article className="bb-book-modal" onClick={event => event.stopPropagation()}><button className="bb-modal-close" onClick={onClose} aria-label="Close">×</button><div className="bb-modal-cover">{cover ? <img src={cover} alt="" /> : initial(book.title)}</div><div className="bb-modal-copy">{description && <p className="bb-modal-synopsis">{description.length > 600 ? `${description.slice(0, 600)}…` : description}</p>}<h2>{book.title}</h2>{book.author && <p className="bb-modal-author">{book.author}</p>}<div className="bb-modal-meta">{book.year && <span>{book.year}</span>}{book.source && (book.sourceUrl ? <a href={book.sourceUrl} target="_blank" rel="noreferrer">{book.source} ↗</a> : <span>{book.source}</span>)}</div><p className="bb-modal-status">{book.read ? '✓ READ' : '○ UNREAD'}{book.dateAdded && ` · Added ${dateLabel(book.dateAdded)}`}</p>{book.note && <p className="bb-modal-note">{book.note}</p>}{onToggle && <button className="bb-modal-action" onClick={onToggle}>{book.read ? 'MARK AS UNREAD' : 'MARK AS READ'}</button>}</div></article></div>;
}

export function BlackboardBooksPage() {
  const shelves = useMemo(() => parseBooks(booksRaw), []); const [query, setQuery] = useState(''); const [recommendQuery, setRecommendQuery] = useState(''); const [recommendResults, setRecommendResults] = useState<SearchResult[]>([]); const [community, setCommunity] = useState<Book[]>([]); const [selected, setSelected] = useState<Book | null>(null); const [apiOnline, setApiOnline] = useState(true); const [, setLocation] = useLocation();
  useEffect(() => { fetch('/api/visitor-books').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => { setCommunity(data.books ?? []); setApiOnline(true); }).catch(() => setApiOnline(false)); }, []);
  useEffect(() => { const q = recommendQuery.trim(); if (q.length < 2) { setRecommendResults([]); return; } const timer = window.setTimeout(() => { fetch(`/api/book-search?q=${encodeURIComponent(q)}`).then(response => response.ok ? response.json() : null).then(data => setRecommendResults(data?.results ?? [])).catch(() => setRecommendResults([])); }, 400); return () => window.clearTimeout(timer); }, [recommendQuery]);
  const addRecommendation = async (result: SearchResult) => { const book: Book = { title: result.title, author: result.author, read: false, visitor: true, coverUrl: result.coverUrl, description: result.description, year: result.year, source: result.source, sourceUrl: result.sourceUrl, dateAdded: new Date().toISOString(), sessionId: sessionStorage.getItem('book-session-id') ?? undefined }; try { const response = await fetch('/api/visitor-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', book }) }); const data = await response.json(); setCommunity(items => [...items, data.book ?? book]); } catch { setCommunity(items => [...items, book]); } setRecommendQuery(''); setRecommendResults([]); };
  const normalized = query.toLowerCase().trim(); const merged = [{ name: 'Community Recommendations', books: community }, ...shelves].map(shelf => ({ ...shelf, books: shelf.books.filter(book => !normalized || `${book.title} ${book.author}`.toLowerCase().includes(normalized)) })).filter(shelf => shelf.books.length);
  const toggleRead = async () => { if (!selected) return; const next = { ...selected, read: !selected.read }; setCommunity(items => items.map(item => item === selected ? next : item)); setSelected(next); try { await fetch('/api/visitor-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleVisitorRead', sessionId: sessionStorage.getItem('book-session-id'), book: selected }) }); } catch {} };
  return <LibraryChrome active="books"><div className="bb-library-intro"><p className="bb-kicker">Library</p><h1>Books</h1></div><label className="bb-search"><Search aria-hidden="true" /><span className="sr-only">Search books</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title or author" /></label><div className="bb-recommend"><label htmlFor="bb-recommend-input">Recommend a book</label><input id="bb-recommend-input" value={recommendQuery} onChange={event => setRecommendQuery(event.target.value)} placeholder="Search Public Libraries" />{recommendResults.length > 0 && <div className="bb-recommend-results">{recommendResults.slice(0, 5).map(result => <button key={result.id} onClick={() => addRecommendation(result)}><strong>{result.title}</strong><small>{result.author}{result.year && ` · ${result.year}`} · Add</small></button>)}</div>}</div>{!apiOnline && <p className="bb-api-note">Community sync is unavailable locally; it will reconnect when deployed.</p>}<div className="bb-shelf-grid">{merged.map(shelf => <section className={`bb-shelf${shelf.name === 'Community Recommendations' ? ' bb-shelf--community' : ''}`} key={shelf.name}><div className="bb-shelf-heading"><h2>{shelf.name}</h2><span>{String(shelf.books.length).padStart(2, '0')}</span></div><ul>{shelf.books.map(book => { const cover = book.coverUrl ?? metaMap[keyOf(book)]?.cover; return <li key={`${shelf.name}-${keyOf(book)}`}><button className="bb-book-row" onClick={() => { setSelected(book); trackEvent('Book Open', { title: book.title, author: book.author, visitor: Boolean(book.visitor) }); }}><span className={book.read ? 'bb-read' : 'bb-unread'} aria-hidden="true" />{cover ? <img className="bb-book-thumb" src={cover} alt="" /> : <span className="bb-book-thumb bb-book-thumb--empty" aria-hidden="true">{initial(book.title)}</span>}<span><strong>{book.title}</strong><small>{book.author}{book.dateAdded && ` · ${dateLabel(book.dateAdded)}`}</small></span></button></li>; })}</ul></section>)}</div>{selected && <BookModal book={selected} onClose={() => setSelected(null)} onToggle={selected.visitor ? toggleRead : undefined} />}<button className="bb-library-backlink" onClick={() => setLocation('/')}>Return to Blackboard</button></LibraryChrome>;
}

export function BlackboardQuotesPage() {
  const [query, setQuery] = useState(''); const [activeCategory, setActiveCategory] = useState('All'); const sections = useMemo(() => parseQuotes(quotesRaw), []); const categories = ['All', ...sections.map(section => section.name)]; const normalized = query.toLowerCase().trim();
  const visible = sections.filter(section => activeCategory === 'All' || section.name === activeCategory).map(section => ({ ...section, quotes: section.quotes.filter(quote => !normalized || `${quote.text} ${quote.source}`.toLowerCase().includes(normalized)) })).filter(section => section.quotes.length);
  return <LibraryChrome active="quotes"><div className="bb-library-intro"><p className="bb-kicker">Collected notes</p><h1>Quotes</h1></div><div className="bb-category-tabs" role="tablist" aria-label="Quote categories">{categories.map(category => <button key={category} className={activeCategory === category ? 'is-active' : ''} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div><label className="bb-search"><Search aria-hidden="true" /><span className="sr-only">Search quotes</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search quote or source" /></label><div className="bb-quote-grid">{visible.map(section => <section className="bb-quote-section" key={section.name}><div className="bb-shelf-heading"><h2>{section.name}</h2><span>{String(section.quotes.length).padStart(2, '0')}</span></div>{section.quotes.map((quote, index) => <blockquote key={`${section.name}-${index}`}><p>{quote.text}</p>{quote.source && <cite>{quote.source}</cite>}</blockquote>)}</section>)}</div></LibraryChrome>;
}
