import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import raw from '../content/books.md?raw';

interface Book {
  title: string;
  author: string;
  read: boolean;
  note?: string;
  visitor?: boolean;
  coverUrl?: string;
  dateAdded?: string;
  sessionId?: string;
}

interface Shelf {
  name: string;
  books: Book[];
}

interface OLResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
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

function coverUrl(coverId: number | undefined): string | undefined {
  if (!coverId) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function buildQuery(book: Book): string {
  return book.author
    ? `${encodeURIComponent(book.title)} ${encodeURIComponent(book.author)}`
    : encodeURIComponent(book.title);
}

const STORAGE_KEY = 'visitor-books';
const COVER_CACHE_KEY = 'book-cover-cache';
const SESSION_KEY = 'book-session-id';
const ADMIN_KEY = 'book-admin';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

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

function loadCoverCache(): Record<string, string | null> {
  try {
    return JSON.parse(localStorage.getItem(COVER_CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveCoverCache(cache: Record<string, string | null>) {
  try {
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

const BATCH_SIZE = 4;
const BATCH_DELAY = 120;

export default function BooksPage() {
  const shelves = useMemo(() => parseBooks(raw), []);
  const allCuratedBooks = useMemo(() => shelves.flatMap(s => s.books), [shelves]);
  useStandaloneScroll();
  const sessionId = useRef(getSessionId());
  const [detail, setDetail] = useState<Book | null>(null);
  const [visitorBooks, setVisitorBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OLResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [coverCache, setCoverCache] = useState<Record<string, string | null>>({});
  const [detailCover, setDetailCover] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  const bgStarted = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  // Mount: load persisted data, start retroactive cover fetch
  useEffect(() => {
    const initialCache = loadCoverCache();
    setCoverCache(initialCache);
    setVisitorBooks(loadVisitorBooks());
    setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1');

    // Retroactive cover fetch: progressively fill covers for curated books
    // that aren't in the cache yet. Runs in small batches to be polite to OL.
    if (bgStarted.current) return;
    bgStarted.current = true;

    const missing = allCuratedBooks.filter(b => {
      const key = `${b.title}|${b.author}`;
      return !(key in initialCache);
    });
    if (missing.length === 0) return;

    let cancelled = false;
    let batchIdx = 0;
    const cache = { ...initialCache };

    const processBatch = async () => {
      if (cancelled || batchIdx >= missing.length) return;
      const batch = missing.slice(batchIdx, batchIdx + BATCH_SIZE);
      batchIdx += BATCH_SIZE;

      const results = await Promise.all(batch.map(async (b) => {
        try {
          const res = await fetch(
            `https://openlibrary.org/search.json?q=${buildQuery(b)}&fields=cover_i&limit=1`,
          );
          const data = await res.json();
          return { key: `${b.title}|${b.author}`, url: coverUrl(data.docs?.[0]?.cover_i) ?? null };
        } catch {
          return { key: `${b.title}|${b.author}`, url: null };
        }
      }));

      if (cancelled) return;
      for (const { key, url } of results) cache[key] = url;
      setCoverCache({ ...cache });
      saveCoverCache(cache);

      if (batchIdx < missing.length) {
        setTimeout(processBatch, BATCH_DELAY);
      }
    };

    const t = setTimeout(processBatch, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [allCuratedBooks]);

  // Admin toggle: Ctrl+Shift+A opens password prompt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.code === 'KeyA' || e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setIsAdmin(false);
          sessionStorage.removeItem(ADMIN_KEY);
        } else {
          setAdminPrompt(true);
          setAdminPass('');
          setAdminError(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdmin]);

  const submitAdminPass = () => {
    if (adminPass === 'xnegro') {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_KEY, '1');
      setAdminPrompt(false);
      setAdminPass('');
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  };

  // Debounced Open Library search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchAbort.current) searchAbort.current.abort();

    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const ac = new AbortController();
        searchAbort.current = ac;
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,cover_i,first_publish_year&limit=8`,
          { signal: ac.signal },
        );
        const data = await res.json();
        setSearchResults((data.docs ?? []) as OLResult[]);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (searchAbort.current) searchAbort.current.abort();
    };
  }, [searchQuery]);

  // Modal cover load (uses cache or fetches single)
  const fetchCover = useCallback(async (book: Book): Promise<string | null> => {
    const cacheKey = `${book.title}|${book.author}`;
    if (cacheKey in coverCache) return coverCache[cacheKey];
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${buildQuery(book)}&fields=cover_i&limit=1`,
      );
      const data = await res.json();
      const url = coverUrl(data.docs?.[0]?.cover_i) ?? null;
      const next = { ...coverCache, [cacheKey]: url };
      setCoverCache(next);
      saveCoverCache(next);
      return url;
    } catch {
      return null;
    }
  }, [coverCache]);

  useEffect(() => {
    if (!detail) { setDetailCover(null); setLoadingCover(false); return; }
    if (detail.coverUrl) { setDetailCover(detail.coverUrl); return; }
    setDetailCover(null);
    setLoadingCover(true);
    fetchCover(detail).then(url => { setDetailCover(url); setLoadingCover(false); });
  }, [detail, fetchCover]);

  const addVisitorBook = (result?: OLResult) => {
    const title = result?.title ?? searchQuery.trim();
    if (!title) return;
    const author = result?.author_name?.[0] ?? '';
    const cover = coverUrl(result?.cover_i);
    const book: Book = {
      title, author, read: false, visitor: true,
      coverUrl: cover, dateAdded: new Date().toISOString(),
      note: noteText.trim() || undefined,
      sessionId: sessionId.current,
    };
    const next = [...visitorBooks, book];
    setVisitorBooks(next);
    saveVisitorBooks(next);
    setSearchQuery('');
    setSearchResults([]);
    setNoteText('');
  };

  const removeVisitorBook = (idx: number) => {
    const next = visitorBooks.filter((_, i) => i !== idx);
    setVisitorBooks(next);
    saveVisitorBooks(next);
  };

  const canRemove = (b: Book) => isAdmin || b.sessionId === sessionId.current;

  const allShelves: Shelf[] = useMemo(() => {
    if (visitorBooks.length > 0) {
      return [{ name: 'Your Library', books: visitorBooks }, ...shelves];
    }
    return shelves;
  }, [shelves, visitorBooks]);

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  return (
    <div className="standalone-page">
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>BOOKS
        {isAdmin && <span className="bs-admin-badge">ADMIN</span>}
      </div>

      <div className="bs-search-wrap">
        <div className="bs-search-row">
          <input
            className="bs-add-input"
            type="text"
            placeholder="Search Open Library to add a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length === 0) addVisitorBook(); }}
          />
        </div>
        <input
          className="bs-add-input bs-note-input"
          type="text"
          placeholder="Leave a note (optional)..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length === 0) addVisitorBook(); }}
        />

        {searching && <div className="bs-search-status">Searching...</div>}

        {searchResults.length > 0 && (
          <div className="bs-search-dropdown">
            {searchResults.map((r) => (
              <button key={r.key} className="bs-search-result" onClick={() => addVisitorBook(r)}>
                {r.cover_i ? (
                  <img src={`https://covers.openlibrary.org/b/id/${r.cover_i}-S.jpg`} alt="" className="bs-search-thumb" />
                ) : (
                  <div className="bs-search-thumb bs-search-thumb--placeholder">{initial(r.title)}</div>
                )}
                <div className="bs-search-info">
                  <div className="bs-search-title">{r.title}</div>
                  {r.author_name && <div className="bs-search-author">{r.author_name[0]}</div>}
                  {r.first_publish_year && <div className="bs-search-year">{r.first_publish_year}</div>}
                </div>
                <span className="bs-search-add">+ ADD</span>
              </button>
            ))}
          </div>
        )}

        {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
          <button className="bs-add-manual" onClick={() => addVisitorBook()}>
            No results — add "{searchQuery.trim()}" manually
          </button>
        )}
      </div>

      {allShelves.map((s, si) => (
        <div key={si} className="bs-shelf">
          <div className="bs-shelf-title">
            {s.name} <span className="bs-shelf-count">({s.books.length})</span>
          </div>
          <div className="bs-grid">
            {s.books.map((b, i) => {
              const cacheKey = `${b.title}|${b.author}`;
              const cachedCover = b.coverUrl ?? coverCache[cacheKey] ?? undefined;
              const removable = b.visitor && canRemove(b);
              return (
                <button
                  key={`${b.title}-${i}`}
                  className={`bs-card${b.read ? ' bs-card--read' : ''}${b.visitor ? ' bs-card--visitor' : ''}`}
                  onClick={() => setDetail(b)}
                  title={`${b.title}${b.author ? ' — ' + b.author : ''}`}
                >
                  <div className="bs-cover">
                    {cachedCover ? (
                      <img src={cachedCover} alt="" className="bs-cover-img" />
                    ) : (
                      initial(b.title)
                    )}
                  </div>
                  <div className="bs-info">
                    <div className="bs-title">{b.title}</div>
                    {b.author && <div className="bs-author">{b.author}</div>}
                    {b.dateAdded && <div className="bs-date">{formatDate(b.dateAdded)}</div>}
                  </div>
                  {removable && (
                    <span
                      className="bs-card-remove"
                      onClick={(e) => { e.stopPropagation(); removeVisitorBook(i); }}
                      title={isAdmin ? 'Remove (admin)' : 'Remove'}
                    >✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {detail && (
        <div className="bs-overlay" onClick={() => setDetail(null)}>
          <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => setDetail(null)}>✕</button>
            <div className="bs-modal-cover">
              {detailCover ? (
                <img src={detailCover} alt="" className="bs-modal-cover-img" />
              ) : loadingCover ? (
                <div className="bs-modal-cover-loading">...</div>
              ) : (
                initial(detail.title)
              )}
            </div>
            <div className="bs-modal-title">{detail.title}</div>
            {detail.author && <div className="bs-modal-author">{detail.author}</div>}
            <div className="bs-modal-status">{detail.read ? '✓ READ' : '○ UNREAD'}</div>
            {detail.note && <div className="bs-modal-note">{detail.note}</div>}
            {detail.dateAdded && <div className="bs-modal-date">Added {formatDate(detail.dateAdded)}</div>}
            {detail.visitor && isAdmin && (
              <button
                className="bs-modal-remove"
                onClick={() => {
                  const idx = visitorBooks.findIndex(b =>
                    b.title === detail.title && b.author === detail.author && b.dateAdded === detail.dateAdded,
                  );
                  if (idx >= 0) removeVisitorBook(idx);
                  setDetail(null);
                }}
              >DELETE (admin)</button>
            )}
          </div>
        </div>
      )}

      {adminPrompt && (
        <div className="bs-overlay" onClick={() => setAdminPrompt(false)}>
          <div className="bs-admin-prompt" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => setAdminPrompt(false)}>✕</button>
            <div className="bs-admin-prompt-label">ADMIN ACCESS</div>
            <input
              className="bs-admin-prompt-input"
              type="password"
              placeholder="Password"
              value={adminPass}
              autoFocus
              onChange={(e) => { setAdminPass(e.target.value); setAdminError(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submitAdminPass(); }}
            />
            {adminError && <div className="bs-admin-prompt-error">Incorrect password</div>}
            <button className="bs-admin-prompt-btn" onClick={submitAdminPass}>UNLOCK</button>
          </div>
        </div>
      )}
    </div>
  );
}
