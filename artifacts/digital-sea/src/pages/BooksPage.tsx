import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import raw from '../content/books.md?raw';

const GB_KEY = 'AIzaSyAxgOroemPIK-hwEU7OLnW4m3g3ExRd3CM';
const GB_BASE = 'https://www.googleapis.com/books/v1/volumes';

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

interface GBResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    description?: string;
    publishedDate?: string;
  };
}

interface APIResponse {
  books: Book[];
  overrides: Record<string, boolean>;
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

function fixCoverUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:/, 'https:');
}

function buildQuery(book: Book): string {
  return book.author
    ? `${encodeURIComponent(book.title)} ${encodeURIComponent(book.author)}`
    : encodeURIComponent(book.title);
}

function bookKey(b: Book): string {
  return `${b.title}|${b.author}`;
}

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

const BATCH_SIZE = 2;
const BATCH_DELAY = 250;

export default function BooksPage() {
  const shelves = useMemo(() => parseBooks(raw), []);
  const allCuratedBooks = useMemo(() => shelves.flatMap(s => s.books), [shelves]);
  useStandaloneScroll();
  const sessionId = useRef(getSessionId());
  const [detail, setDetail] = useState<Book | null>(null);
  const [visitorBooks, setVisitorBooks] = useState<Book[]>([]);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GBResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [coverCache, setCoverCache] = useState<Record<string, string | null>>({});
  const [detailCover, setDetailCover] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [apiOnline, setApiOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pendingBook, setPendingBook] = useState<GBResult | null>(null);
  const [pendingNote, setPendingNote] = useState('');

  const bgStarted = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  // Mount: fetch visitor books from API, start retroactive cover fetch
  useEffect(() => {
    const initialCache = loadCoverCache();
    setCoverCache(initialCache);
    setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1');

    fetch('/api/visitor-books')
      .then(res => res.json())
      .then((data: APIResponse) => {
        setVisitorBooks(data.books ?? []);
        setReadOverrides(data.overrides ?? {});
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));

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
            `${GB_BASE}?q=${buildQuery(b)}&maxResults=1&fields=items(volumeInfo/imageLinks/thumbnail)&key=${GB_KEY}`,
          );
          const data = await res.json();
          const url = fixCoverUrl(data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) ?? null;
          return { key: bookKey(b), url };
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

  // Admin toggle: Ctrl+Shift+A
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

  // Debounced Google Books search
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
          `${GB_BASE}?q=${encodeURIComponent(q)}&maxResults=8&printType=books&key=${GB_KEY}`,
          { signal: ac.signal },
        );
        const data = await res.json();
        setSearchResults((data.items ?? []) as GBResult[]);
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

  // Cover fetch for modal (Google Books with key)
  const fetchCover = useCallback(async (book: Book): Promise<string | null> => {
    const cacheKey = bookKey(book);
    if (cacheKey in coverCache) return coverCache[cacheKey];
    try {
      const res = await fetch(
        `${GB_BASE}?q=${buildQuery(book)}&maxResults=1&fields=items(volumeInfo/imageLinks/thumbnail)&key=${GB_KEY}`,
      );
      const data = await res.json();
      const url = fixCoverUrl(data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) ?? null;
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

  // Confirmation dialog — synopsis comes directly from Google Books search result
  const openConfirmation = (result: GBResult) => {
    setPendingBook(result);
    setPendingNote('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const confirmAddBook = async () => {
    if (!pendingBook) return;
    setSubmitting(true);
    const vi = pendingBook.volumeInfo;
    const book: Book = {
      title: vi.title,
      author: vi.authors?.[0] ?? '',
      read: false,
      visitor: true,
      coverUrl: fixCoverUrl(vi.imageLinks?.thumbnail),
      dateAdded: new Date().toISOString(),
      note: pendingNote.trim() || undefined,
      sessionId: sessionId.current,
    };

    try {
      const res = await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', book }),
      });
      if (!res.ok) throw new Error('API error');
      setVisitorBooks(prev => [...prev, book]);
    } catch {
      setVisitorBooks(prev => [...prev, book]);
    } finally {
      setSubmitting(false);
      setPendingBook(null);
      setPendingNote('');
    }
  };

  const addManualBook = async () => {
    const title = searchQuery.trim();
    if (!title) return;
    setSubmitting(true);
    const book: Book = {
      title,
      author: '',
      read: false,
      visitor: true,
      dateAdded: new Date().toISOString(),
      sessionId: sessionId.current,
    };

    try {
      const res = await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', book }),
      });
      if (!res.ok) throw new Error('API error');
    } catch {
    } finally {
      setSubmitting(false);
      setVisitorBooks(prev => [...prev, book]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeVisitorBook = async (book: Book) => {
    try {
      await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', password: 'xnegro', book }),
      });
    } catch {}
    setVisitorBooks(prev => prev.filter(b =>
      !(b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded),
    ));
    setDetail(null);
  };

  const canRemove = (b: Book) => isAdmin || b.sessionId === sessionId.current;

  const toggleRead = async (book: Book) => {
    if (book.visitor) {
      const newRead = !getEffectiveRead(book);
      setVisitorBooks(prev => prev.map(b =>
        b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded
          ? { ...b, read: newRead }
          : b,
      ));
      setDetail(d => d && d.title === book.title && d.author === book.author && d.dateAdded === book.dateAdded
        ? { ...d, read: newRead }
        : d,
      );
      try {
        await fetch('/api/visitor-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggleVisitorRead', password: 'xnegro', book }),
        });
      } catch {}
    } else {
      const key = bookKey(book);
      const currentOverride = readOverrides[key];
      const newRead = currentOverride !== undefined ? !currentOverride : !book.read;
      setReadOverrides(prev => ({ ...prev, [key]: newRead }));
      setDetail(d => d ? { ...d, read: newRead } : null);
      try {
        await fetch('/api/visitor-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggleCuratedRead', password: 'xnegro', key, read: newRead }),
        });
      } catch {}
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
      ? [{ name: 'Community Recommendations', books: visitorBooks }, ...shelves]
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

      {!apiOnline && (
        <div className="bs-api-warning">
          Live sync unavailable — visitor books may not persist.
        </div>
      )}

      <div className="bs-search-wrap">
        <div className="bs-search-row">
          <input
            className="bs-add-input"
            type="text"
            placeholder="Search Google Books to add a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length === 0) addManualBook(); }}
          />
        </div>

        {searching && <div className="bs-search-status">Searching...</div>}

        {searchResults.length > 0 && (
          <div className="bs-search-dropdown">
            {searchResults.map((r) => {
              const vi = r.volumeInfo;
              const thumb = fixCoverUrl(vi.imageLinks?.smallThumbnail);
              return (
                <button key={r.id} className="bs-search-result" onClick={() => openConfirmation(r)}>
                  {thumb ? (
                    <img src={thumb} alt="" className="bs-search-thumb" />
                  ) : (
                    <div className="bs-search-thumb bs-search-thumb--placeholder">{initial(vi.title)}</div>
                  )}
                  <div className="bs-search-info">
                    <div className="bs-search-title">{vi.title}</div>
                    {vi.authors && <div className="bs-search-author">{vi.authors[0]}</div>}
                    {vi.publishedDate && <div className="bs-search-year">{vi.publishedDate}</div>}
                  </div>
                  <span className="bs-search-add">+ ADD</span>
                </button>
              );
            })}
          </div>
        )}

        {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
          <button className="bs-add-manual" onClick={addManualBook} disabled={submitting}>
            No results — add "{searchQuery.trim()}" manually
          </button>
        )}
      </div>

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
                onClick={() => removeVisitorBook(detail)}
              >DELETE (admin)</button>
            )}
          </div>
        </div>
      )}

      {pendingBook && (
        <div className="bs-overlay" onClick={() => !submitting && setPendingBook(null)}>
          <div className="bs-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => !submitting && setPendingBook(null)}>✕</button>
            <div className="bs-confirm-header">RECOMMEND THIS BOOK</div>
            <div className="bs-confirm-card">
              <div className="bs-confirm-cover">
                {fixCoverUrl(pendingBook.volumeInfo.imageLinks?.thumbnail) ? (
                  <img src={fixCoverUrl(pendingBook.volumeInfo.imageLinks.thumbnail)} alt="" className="bs-confirm-cover-img" />
                ) : (
                  <div className="bs-confirm-cover-placeholder">{initial(pendingBook.volumeInfo.title)}</div>
                )}
              </div>
              <div className="bs-confirm-meta">
                <div className="bs-confirm-title">{pendingBook.volumeInfo.title}</div>
                {pendingBook.volumeInfo.authors && (
                  <div className="bs-confirm-author">{pendingBook.volumeInfo.authors[0]}</div>
                )}
                {pendingBook.volumeInfo.publishedDate && (
                  <div className="bs-confirm-year">{pendingBook.volumeInfo.publishedDate}</div>
                )}
              </div>
            </div>
            <div className="bs-confirm-synopsis">
              {pendingBook.volumeInfo.description ? (
                <p>{pendingBook.volumeInfo.description.length > 600 ? pendingBook.volumeInfo.description.slice(0, 600) + '...' : pendingBook.volumeInfo.description}</p>
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
              onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) confirmAddBook(); }}
              autoFocus
              disabled={submitting}
            />
            <div className="bs-confirm-actions">
              <button className="bs-confirm-cancel" onClick={() => setPendingBook(null)} disabled={submitting}>
                CANCEL
              </button>
              <button className="bs-confirm-btn" onClick={confirmAddBook} disabled={submitting}>
                {submitting ? 'SAVING...' : 'CONFIRM & ADD'}
              </button>
            </div>
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
