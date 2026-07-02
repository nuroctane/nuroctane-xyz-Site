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

interface OLWork {
  description?: string | { value: string };
  subjects?: string[];
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

function bookKey(b: Book): string {
  return `${b.title}|${b.author}`;
}

const STORAGE_KEY = 'visitor-books';
const COVER_CACHE_KEY = 'book-cover-cache';
const READ_OVERRIDE_KEY = 'book-read-overrides';
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

function loadReadOverrides(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(READ_OVERRIDE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveReadOverrides(map: Record<string, boolean>) {
  try {
    localStorage.setItem(READ_OVERRIDE_KEY, JSON.stringify(map));
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
  const [coverCache, setCoverCache] = useState<Record<string, string | null>>({});
  const [detailCover, setDetailCover] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});

  // Confirmation dialog state
  const [pendingBook, setPendingBook] = useState<OLResult | null>(null);
  const [pendingSynopsis, setPendingSynopsis] = useState<string | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingNote, setPendingNote] = useState('');

  const bgStarted = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  // Mount: load persisted data, start retroactive cover fetch
  useEffect(() => {
    const initialCache = loadCoverCache();
    setCoverCache(initialCache);
    setVisitorBooks(loadVisitorBooks());
    setReadOverrides(loadReadOverrides());
    setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1');

    if (bgStarted.current) return;
    bgStarted.current = true;

    const missing = allCuratedBooks.filter(b => {
      const key = bookKey(b);
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
          return { key: bookKey(b), url: coverUrl(data.docs?.[0]?.cover_i) ?? null };
        } catch {
          return { key: bookKey(b), url: null };
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

  const fetchCover = useCallback(async (book: Book): Promise<string | null> => {
    const cacheKey = bookKey(book);
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

  // When a search result is clicked, open confirmation dialog and fetch synopsis
  const openConfirmation = (result: OLResult) => {
    setPendingBook(result);
    setPendingSynopsis(null);
    setPendingLoading(true);
    setPendingNote('');
    setSearchQuery('');
    setSearchResults([]);

    fetch(`https://openlibrary.org${result.key}.json`)
      .then(res => res.json())
      .then((work: OLWork) => {
        const desc = typeof work.description === 'string'
          ? work.description
          : work.description?.value ?? null;
        setPendingSynopsis(desc);
      })
      .catch(() => setPendingSynopsis(null))
      .finally(() => setPendingLoading(false));
  };

  const confirmAddBook = () => {
    if (!pendingBook) return;
    const book: Book = {
      title: pendingBook.title,
      author: pendingBook.author_name?.[0] ?? '',
      read: false,
      visitor: true,
      coverUrl: coverUrl(pendingBook.cover_i),
      dateAdded: new Date().toISOString(),
      note: pendingNote.trim() || undefined,
      sessionId: sessionId.current,
    };
    const next = [...visitorBooks, book];
    setVisitorBooks(next);
    saveVisitorBooks(next);
    setPendingBook(null);
    setPendingNote('');
    setPendingSynopsis(null);
  };

  const addManualBook = () => {
    const title = searchQuery.trim();
    if (!title) return;
    const book: Book = {
      title,
      author: '',
      read: false,
      visitor: true,
      dateAdded: new Date().toISOString(),
      sessionId: sessionId.current,
    };
    const next = [...visitorBooks, book];
    setVisitorBooks(next);
    saveVisitorBooks(next);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeVisitorBook = (book: Book) => {
    const next = visitorBooks.filter(b =>
      !(b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded),
    );
    setVisitorBooks(next);
    saveVisitorBooks(next);
  };

  const canRemove = (b: Book) => isAdmin || b.sessionId === sessionId.current;

  const toggleRead = (book: Book) => {
    if (book.visitor) {
      const next = visitorBooks.map(b =>
        b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded
          ? { ...b, read: !b.read }
          : b,
      );
      setVisitorBooks(next);
      saveVisitorBooks(next);
      setDetail(d => d && d.title === book.title && d.author === book.author && d.dateAdded === book.dateAdded
        ? { ...d, read: !d.read }
        : d,
      );
    } else {
      const key = bookKey(book);
      const currentOverride = readOverrides[key];
      const newRead = currentOverride !== undefined ? !currentOverride : !book.read;
      const next = { ...readOverrides, [key]: newRead };
      setReadOverrides(next);
      saveReadOverrides(next);
      setDetail(d => d ? { ...d, read: newRead } : null);
    }
  };

  function getEffectiveRead(b: Book): boolean {
    if (b.visitor) return b.read;
    const override = readOverrides[bookKey(b)];
    return override !== undefined ? override : b.read;
  }

  const libQ = libraryQuery.trim().toLowerCase();
  const filteredShelves: Shelf[] = useMemo(() => {
    const base: Shelf[] = visitorBooks.length > 0
      ? [{ name: 'Your Library', books: visitorBooks }, ...shelves]
      : shelves;

    if (!libQ) return base;

    return base
      .map(s => ({
        ...s,
        books: s.books.filter(b =>
          b.title.toLowerCase().includes(libQ) ||
          b.author.toLowerCase().includes(libQ),
        ),
      }))
      .filter(s => s.books.length > 0);
  }, [shelves, visitorBooks, libQ]);

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

      {/* Open Library search */}
      <div className="bs-search-wrap">
        <div className="bs-search-row">
          <input
            className="bs-add-input"
            type="text"
            placeholder="Search Open Library to add a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length === 0) addManualBook(); }}
          />
        </div>

        {searching && <div className="bs-search-status">Searching...</div>}

        {searchResults.length > 0 && (
          <div className="bs-search-dropdown">
            {searchResults.map((r) => (
              <button key={r.key} className="bs-search-result" onClick={() => openConfirmation(r)}>
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
          <button className="bs-add-manual" onClick={addManualBook}>
            No results — add "{searchQuery.trim()}" manually
          </button>
        )}
      </div>

      {/* Sea Library filter */}
      <div className="bs-lib-search-wrap">
        <input
          className="bs-add-input"
          type="text"
          placeholder="Search the Sea Library..."
          value={libraryQuery}
          onChange={(e) => setLibraryQuery(e.target.value)}
        />
        {libQ && (
          <span className="bs-lib-clear" onClick={() => setLibraryQuery('')}>✕</span>
        )}
      </div>

      {filteredShelves.map((s, si) => (
        <div key={si} className="bs-shelf">
          <div className="bs-shelf-title">
            {s.name} <span className="bs-shelf-count">({s.books.length})</span>
          </div>
          <div className="bs-grid">
            {s.books.map((b, i) => {
              const cacheKey = bookKey(b);
              const cachedCover = b.coverUrl ?? coverCache[cacheKey] ?? undefined;
              const effectiveRead = getEffectiveRead(b);
              const removable = b.visitor && canRemove(b);
              return (
                <button
                  key={`${b.title}-${i}`}
                  className={`bs-card${effectiveRead ? ' bs-card--read' : ''}${b.visitor ? ' bs-card--visitor' : ''}`}
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
                      onClick={(e) => { e.stopPropagation(); removeVisitorBook(b); }}
                      title={isAdmin ? 'Remove (admin)' : 'Remove'}
                    >✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {libQ && filteredShelves.length === 0 && (
        <div className="bs-lib-noresults">No books match "{libraryQuery}"</div>
      )}

      {/* Book detail modal */}
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
            <div className="bs-modal-status">{getEffectiveRead(detail) ? '✓ READ' : '○ UNREAD'}</div>
            {detail.note && <div className="bs-modal-note">{detail.note}</div>}
            {detail.dateAdded && <div className="bs-modal-date">Added {formatDate(detail.dateAdded)}</div>}
            {isAdmin && (
              <button
                className="bs-modal-toggle-read"
                onClick={() => toggleRead(detail)}
              >
                {getEffectiveRead(detail) ? 'MARK AS UNREAD' : 'MARK AS READ'}
              </button>
            )}
            {detail.visitor && isAdmin && (
              <button
                className="bs-modal-remove"
                onClick={() => {
                  removeVisitorBook(detail);
                  setDetail(null);
                }}
              >DELETE (admin)</button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation dialog — add book with note + synopsis preview */}
      {pendingBook && (
        <div className="bs-overlay" onClick={() => setPendingBook(null)}>
          <div className="bs-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => setPendingBook(null)}>✕</button>
            <div className="bs-confirm-header">RECOMMEND THIS BOOK</div>
            <div className="bs-confirm-card">
              <div className="bs-confirm-cover">
                {pendingBook.cover_i ? (
                  <img src={coverUrl(pendingBook.cover_i)} alt="" className="bs-confirm-cover-img" />
                ) : (
                  <div className="bs-confirm-cover-placeholder">{initial(pendingBook.title)}</div>
                )}
              </div>
              <div className="bs-confirm-meta">
                <div className="bs-confirm-title">{pendingBook.title}</div>
                {pendingBook.author_name && (
                  <div className="bs-confirm-author">{pendingBook.author_name[0]}</div>
                )}
                {pendingBook.first_publish_year && (
                  <div className="bs-confirm-year">{pendingBook.first_publish_year}</div>
                )}
              </div>
            </div>
            <div className="bs-confirm-synopsis">
              {pendingLoading ? (
                <div className="bs-confirm-synopsis-loading">Loading synopsis...</div>
              ) : pendingSynopsis ? (
                <p>{pendingSynopsis.length > 600 ? pendingSynopsis.slice(0, 600) + '...' : pendingSynopsis}</p>
              ) : (
                <div className="bs-confirm-synopsis-none">No synopsis available.</div>
              )}
            </div>
            <input
              className="bs-add-input bs-confirm-note"
              type="text"
              placeholder="Add a note (optional)..."
              value={pendingNote}
              onChange={(e) => setPendingNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAddBook(); }}
              autoFocus
            />
            <div className="bs-confirm-actions">
              <button className="bs-confirm-cancel" onClick={() => setPendingBook(null)}>CANCEL</button>
              <button className="bs-confirm-btn" onClick={confirmAddBook}>CONFIRM & ADD</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin password prompt */}
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
