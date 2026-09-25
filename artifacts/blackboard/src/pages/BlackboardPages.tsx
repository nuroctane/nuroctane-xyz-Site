import { BookRecommendationSearch } from '../components/BookRecommendationSearch';
import { parseQuotes } from '../lib/parseQuotes';
import { renderEmphasis } from '../lib/quoteEmphasis';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, FileText, Quote, Search } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import booksRaw from '../content/books.md?raw';
import quotesRaw from '../content/quotes.md?raw';
import bookMeta from '../data/bookMeta.json';
import { trackEvent } from '../lib/analytics';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import { blogPosts } from '../data/blogPosts';
import { ScrollToTop } from '../components/hud/ScrollToTop';
import { BlackboardWallpaper } from '../blackboard/BlackboardWallpaper';
import { useWallpaper } from '../blackboard/WallpaperProvider';
import './blackboard-pages.css';

type Book = { title: string; author: string; read: boolean; note?: string; visitor?: boolean; coverUrl?: string; description?: string; year?: string; source?: string; sourceUrl?: string; dateAdded?: string; sessionId?: string };
type Shelf = { name: string; books: Book[] };
const metaMap = bookMeta.books as Record<string, { cover: string | null; desc: string | null }>;
const keyOf = (book: Book) => `${book.title}|${book.author}`;
const initial = (title: string) => title.match(/\p{L}/u)?.[0]?.toUpperCase() ?? '?';
const dateLabel = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const ADMIN_KEY = 'book-admin';
const ADMIN_PW_KEY = 'book-admin-pw';
const SESSION_KEY = 'book-session-id';

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function parseBooks(raw: string): Shelf[] {
  const shelves: Shelf[] = []; let current: Shelf | undefined;
  for (const line of raw.split('\n')) {
    if (line.startsWith('## ')) { current = { name: line.slice(3).trim(), books: [] }; shelves.push(current); continue; }
    const match = line.trim().match(/^- \[([ x])\]\s+(.+)/); if (!current || !match) continue;
    const split = match[2].split(' — '); let title = (split.slice(1).join(' — ') || split[0]).trim();
    const note = title.match(/_\((.+?)\)_/)?.[1]; title = title.replace(/_\(.+?\)_/, '').trim();
    current.books.push({ author: split.length > 1 ? split[0].trim() : '', title, read: match[1] === 'x', note });
  }
  return shelves;
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
    p.t === 'hl'
      ? <mark key={k} className="bb-quote-highlight">{renderEmphasis(p.v)}</mark>
      : <span key={k}>{renderEmphasis(p.v)}</span>
  );
}


function LibraryChrome({ active, children }: { active: 'books' | 'quotes' | 'blog'; children: React.ReactNode }) {
  useStandaloneScroll();
  const { variant } = useWallpaper();
  // The reading surfaces keep the full dark scrim (see blackboard-pages.css),
  // so their ink stays on the light pole rather than following the photo.
  return <main className="bb-library" data-wallpaper={variant} data-ink="light"><BlackboardWallpaper /><ScrollToTop /><header className="bb-library-header"><Link className="bb-library-home" href="/" aria-label="Back to Blackboard"><img src="/assets/nodes/site-logo-avatar.webp" alt="" width="42" height="48" /></Link><nav className="bb-library-tabs" aria-label="Library navigation"><Link className={active === 'books' ? 'is-active' : ''} href="/books"><BookOpen aria-hidden="true" /> Books</Link><Link className={active === 'quotes' ? 'is-active' : ''} href="/quotes"><Quote aria-hidden="true" /> Quotes</Link><Link className={active === 'blog' ? 'is-active' : ''} href="/blog"><FileText aria-hidden="true" /> Blog</Link></nav></header><section className="bb-library-content">{children}</section></main>;
}

function BookModal({ book, onClose, onToggle, onDelete }: { book: Book; onClose: () => void; onToggle?: () => void; onDelete?: () => void }) {
  const meta = metaMap[keyOf(book)]; const [cover, setCover] = useState(book.coverUrl ?? meta?.cover ?? null); const [description, setDescription] = useState(book.description ?? meta?.desc ?? null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => { if (cover && description) return; fetch(`/api/book-search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`).then(r => r.ok ? r.json() : null).then(data => { const result = data?.results?.[0]; if (result) { if (!cover) setCover(result.coverUrl ?? null); if (!description) setDescription(result.description ?? null); } }).catch(() => undefined); }, [book, cover, description]);
  return <div className="bb-modal-overlay" onClick={onClose}><article className="bb-book-modal" role="dialog" aria-modal="true" aria-label={book.title} onClick={event => event.stopPropagation()}><button className="bb-modal-close" onClick={onClose} aria-label="Close">×</button><div className="bb-modal-cover">{cover ? <img src={cover} alt="" /> : initial(book.title)}</div><div className="bb-modal-copy">{description && <p className="bb-modal-synopsis">{description.length > 600 ? `${description.slice(0, 600)}…` : description}</p>}<h2>{book.title}</h2>{book.author && <p className="bb-modal-author">{book.author}</p>}<div className="bb-modal-meta">{book.year && <span>{book.year}</span>}{book.source && (book.sourceUrl ? <a href={book.sourceUrl} target="_blank" rel="noreferrer">{book.source} ↗</a> : <span>{book.source}</span>)}</div><p className="bb-modal-status">{book.read ? '✓ READ' : '○ UNREAD'}{book.dateAdded && ` · Added ${dateLabel(book.dateAdded)}`}</p>{book.note && <p className="bb-modal-note">{book.note}</p>}<div className="bb-modal-actions">{onToggle && <button className="bb-modal-action" onClick={onToggle}>{book.read ? 'MARK AS UNREAD' : 'MARK AS READ'}</button>}{onDelete && <button className="bb-modal-action bb-modal-action--danger" onClick={onDelete}>DELETE RECOMMENDATION</button>}</div></div></article></div>;
}

export function BlackboardBooksPage() {
  const shelves = useMemo(() => parseBooks(booksRaw), []);
  const sessionId = useRef(getSessionId());
  const adminPasswordRef = useRef('');
  const [query, setQuery] = useState('');
  const [community, setCommunity] = useState<Book[]>([]);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Book | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [mutationError, setMutationError] = useState('');
  const mutationPending = useRef(false);
  const save = async (payload: unknown) => {
    setMutationError('');
    const response = await fetch('/api/visitor-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('Save failed');
    return response.json();
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const storedPassword = sessionStorage.getItem(ADMIN_PW_KEY) ?? '';
      adminPasswordRef.current = storedPassword;
      setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1' && Boolean(storedPassword));
    } catch { /* storage may be blocked */ }
    fetch('/api/visitor-books').then(response => {
      if (!response.ok) throw new Error();
      return response.json();
    }).then(data => {
      setCommunity(data.books ?? []);
      setReadOverrides(data.overrides ?? {});
      setApiOnline(true);
    }).catch(() => setApiOnline(false));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey || !['KeyA', 'A'].includes(event.code) && !['A', 'a'].includes(event.key)) return;
      event.preventDefault();
      if (isAdmin) {
        setIsAdmin(false);
        adminPasswordRef.current = '';
        sessionStorage.removeItem(ADMIN_KEY);
        sessionStorage.removeItem(ADMIN_PW_KEY);
      } else {
        setAdminPass('');
        setAdminError('');
        setAdminPrompt(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdmin]);

  const submitAdminPass = async () => {
    if (!adminPass.trim()) { setAdminError('Enter password'); return; }
    try {
      const response = await fetch('/api/visitor-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verifyAdmin', password: adminPass }) });
      if (!response.ok) { setAdminError(response.status === 500 ? 'Admin password is not configured' : 'Incorrect password'); return; }
      adminPasswordRef.current = adminPass;
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_KEY, '1');
      sessionStorage.setItem(ADMIN_PW_KEY, adminPass);
      setAdminPrompt(false);
      setAdminPass('');
      setAdminError('');
    } catch { setAdminError('Network error'); }
  };

  const effectiveRead = (book: Book) => book.visitor ? Boolean(book.read) : (readOverrides[keyOf(book)] ?? Boolean(book.read));
  const canToggle = (book: Book) => Boolean(book.visitor ? (isAdmin || !book.sessionId || book.sessionId === sessionId.current) : isAdmin);
  const canDelete = (book: Book) => Boolean(book.visitor && (isAdmin || Boolean(book.sessionId) && book.sessionId === sessionId.current));

  const toggleRead = async (book: Book) => {
    if (!canToggle(book) || mutationPending.current) return;
    mutationPending.current = true;
    const nextRead = !effectiveRead(book);
    try {
      await save(book.visitor ? { action: 'toggleVisitorRead', password: adminPasswordRef.current, sessionId: sessionId.current, book } : { action: 'toggleCuratedRead', password: adminPasswordRef.current, key: keyOf(book), read: nextRead });
      const next = { ...book, read: nextRead };
      if (book.visitor) setCommunity(items => items.map(item => item.title === book.title && item.author === book.author && item.dateAdded === book.dateAdded ? next : item));
      else setReadOverrides(values => ({ ...values, [keyOf(book)]: nextRead }));
      setSelected(current => current && keyOf(current) === keyOf(book) ? next : current);
    } catch { setMutationError('Could not save read status. Check your connection and admin session, then try again.'); }
    finally { mutationPending.current = false; }
  };

  const deleteRecommendation = async (book: Book) => {
    if (!canDelete(book) || mutationPending.current) return;
    mutationPending.current = true;
    try {
      await save(isAdmin ? { action: 'delete', password: adminPasswordRef.current, book } : { action: 'delete', sessionId: sessionId.current, book });
      setCommunity(items => items.filter(item => !(item.title === book.title && item.author === book.author && item.dateAdded === book.dateAdded)));
      setSelected(null);
      setConfirmDelete(null);
    } catch { setMutationError('Could not delete this recommendation. Check your connection and admin session, then try again.'); }
    finally { mutationPending.current = false; }
  };

  const normalized = query.toLowerCase().trim();
  const merged = [{ name: 'Community Recommendations', books: community }, ...shelves]
    .map(shelf => ({ ...shelf, books: shelf.books.filter(book => !normalized || `${book.title} ${book.author}`.toLowerCase().includes(normalized)) }))
    .filter(shelf => shelf.books.length);

  return <LibraryChrome active="books">{mutationError && <p className="bb-mutation-error" role="alert">{mutationError}</p>}<div className="bb-library-intro"><p className="bb-kicker">Library{isAdmin && <span className="bb-admin-badge">ADMIN</span>}</p><h1>Books</h1></div><label className="bb-search"><Search aria-hidden="true" /><span className="sr-only">Search books</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title or author" /></label><BookRecommendationSearch sessionId={sessionId.current} onAdded={book => setCommunity(items => [...items, book])} />{!apiOnline && <p className="bb-api-note">Community recommendations could not load. Please refresh to reconnect.</p>}<div className="bb-shelf-grid">{merged.map(shelf => <section className={`bb-shelf${shelf.name === 'Community Recommendations' ? ' bb-shelf--community' : ''}`} key={shelf.name}><div className="bb-shelf-heading"><h2>{shelf.name}</h2><span>{String(shelf.books.length).padStart(2, '0')}</span></div><ul>{shelf.books.map(book => { const displayBook = { ...book, read: effectiveRead(book) }; const cover = book.coverUrl ?? metaMap[keyOf(book)]?.cover; return <li key={`${shelf.name}-${keyOf(book)}`}><button className="bb-book-row" onClick={() => { setSelected(displayBook); trackEvent('Book Open', { title: book.title, author: book.author, visitor: Boolean(book.visitor) }); }}><span className={displayBook.read ? 'bb-read' : 'bb-unread'} aria-hidden="true" />{cover ? <img className="bb-book-thumb" src={cover} alt="" /> : <span className="bb-book-thumb bb-book-thumb--empty" aria-hidden="true">{initial(book.title)}</span>}<span><strong>{book.title}</strong><small>{book.author}{book.dateAdded && ` · ${dateLabel(book.dateAdded)}`}</small></span></button></li>; })}</ul></section>)}</div>{selected && <BookModal book={selected} onClose={() => setSelected(null)} onToggle={canToggle(selected) ? () => toggleRead(selected) : undefined} onDelete={canDelete(selected) ? () => setConfirmDelete(selected) : undefined} />}{confirmDelete && <div className="bb-modal-overlay" onClick={() => setConfirmDelete(null)}><article className="bb-admin-modal" onClick={event => event.stopPropagation()}><button className="bb-modal-close" onClick={() => setConfirmDelete(null)} aria-label="Close">×</button><span className="bb-admin-modal-kicker">ADMIN / COMMUNITY</span><h2>Delete recommendation?</h2><p>This removes <strong>{confirmDelete.title}</strong> from the shared library.</p><div className="bb-admin-modal-actions"><button className="bb-modal-action" onClick={() => setConfirmDelete(null)}>CANCEL</button><button className="bb-modal-action bb-modal-action--danger" onClick={() => deleteRecommendation(confirmDelete)}>DELETE</button></div></article></div>}{adminPrompt && <div className="bb-modal-overlay" onClick={() => setAdminPrompt(false)}><article className="bb-admin-modal" role="dialog" aria-label="Admin access" onClick={event => event.stopPropagation()}><button className="bb-modal-close" onClick={() => setAdminPrompt(false)} aria-label="Close">×</button><span className="bb-admin-modal-kicker">BLACKBOARD / ADMIN</span><h2>Unlock admin controls</h2><p>Use the shared admin password to manage community books and read states.</p><input className="bb-admin-input" type="password" autoFocus placeholder="Password" autoComplete="current-password" value={adminPass} onChange={event => { setAdminPass(event.target.value); setAdminError(''); }} onKeyDown={event => { if (event.key === 'Enter') void submitAdminPass(); if (event.key === 'Escape') setAdminPrompt(false); }} />{adminError && <p className="bb-admin-error">{adminError}</p>}<button className="bb-modal-action bb-admin-submit" onClick={() => void submitAdminPass()}>UNLOCK</button></article></div>}<button className="bb-library-backlink" onClick={() => setLocation('/')}>Return to Blackboard</button></LibraryChrome>;
}

export function BlackboardQuotesPage() {
  const [query, setQuery] = useState(''); const [activeCategory, setActiveCategory] = useState('All'); const [quoteOrder, setQuoteOrder] = useState<'newest' | 'oldest'>('newest'); const sections = useMemo(() => parseQuotes(quotesRaw), []); const categories = ['All', ...sections.map(section => section.name)]; const normalized = query.toLowerCase().trim();
  const visible = sections.filter(section => activeCategory === 'All' || section.name === activeCategory).map(section => ({ ...section, quotes: section.quotes.filter(quote => !normalized || `${quote.text} ${quote.source}`.toLowerCase().includes(normalized)) })).filter(section => section.quotes.length);
  return <LibraryChrome active="quotes"><div className="bb-library-intro"><p className="bb-kicker">Collected notes</p><h1>Quotes</h1></div><div className="bb-category-tabs" role="tablist" aria-label="Quote categories">{categories.map(category => <button key={category} className={activeCategory === category ? 'is-active' : ''} onClick={event => { setActiveCategory(category); event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div><label className="bb-search"><Search aria-hidden="true" /><span className="sr-only">Search quotes</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search quote or source" /></label><div className="bb-quote-order" role="group" aria-label="Quote order"><button aria-pressed={quoteOrder === 'newest'} onClick={() => setQuoteOrder('newest')}>Newest first</button><button aria-pressed={quoteOrder === 'oldest'} onClick={() => setQuoteOrder('oldest')}>Oldest first</button></div><div className="bb-quote-grid">{visible.map(section => <section className="bb-quote-section" key={section.name}><div className="bb-shelf-heading"><h2>{section.name}</h2><span>{String(section.quotes.length).padStart(2, '0')}</span></div>{(quoteOrder === 'newest' ? [...section.quotes].reverse() : section.quotes).map((quote, index) => <blockquote key={`${section.name}-${index}`}><p>{renderText(quote.text)}</p>{quote.source && <cite>{/^@[A-Za-z0-9_]{1,15}$/.test(quote.source) ? <a href={`https://x.com/${quote.source.slice(1)}`} target="_blank" rel="noreferrer">{quote.source}</a> : renderText(quote.source)}</cite>}</blockquote>)}</section>)}</div></LibraryChrome>;
}

export function BlackboardBlogPage() {
  return <LibraryChrome active="blog"><div className="bb-library-intro"><p className="bb-kicker">From the blog</p><h1>Blog</h1></div><div className="bb-blog-grid">{blogPosts.map((post, index) => <article className="bb-blog-card" key={post.id}><div className="bb-blog-card-heading"><span>{String(index + 1).padStart(2, '0')}</span></div><h2>{post.title}</h2><div className="bb-blog-copy">{post.paragraphs.map((paragraph, paragraphIndex) => <p key={`${post.id}-${paragraphIndex}`}>{paragraph}</p>)}</div></article>)}</div></LibraryChrome>;
}
