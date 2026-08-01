import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { MiniAudio } from '../components/hud/MiniAudio';
import { ScrollToTop } from '../components/hud/ScrollToTop';
import { useStandaloneScroll } from '../hooks/useStandaloneScroll';
import raw from '../content/books.md?raw';
import bookMeta from '../data/bookMeta.json';
import { trackEvent } from '../lib/analytics';

const COVER_WIDTH = 600;
const COVER_HEIGHT = 900;
const COVER_MAX_BYTES = 300 * 1024;
const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface Book {
  title: string;
  author: string;
  read: boolean;
  note?: string;
  visitor?: boolean;
  coverUrl?: string;
  coverId?: string;
  description?: string;
  year?: string;
  source?: string;
  sourceUrl?: string;
  dateAdded?: string;
  sessionId?: string;
}

interface Shelf {
  name: string;
  books: Book[];
}

// Unified search result used by the dropdown + confirmation dialog
interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string | undefined;
  description: string | undefined;
  year: string | undefined;
  source: string;
  sources: string[];
  sourceUrl: string | undefined;
}

interface APIResponse {
  books: Book[];
  overrides: Record<string, boolean>;
}

interface SearchAPIResponse {
  results?: SearchResult[];
  sources?: string[];
}

interface ManualCover {
  dataUrl: string;
  name: string;
  bytes: number;
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

function buildQuery(book: Book): string {
  return book.author
    ? `${book.title} ${book.author}`
    : book.title;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('The selected file is not a readable image'));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function readFileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read the selected cover'));
    reader.onerror = () => reject(new Error('Could not read the selected cover'));
    reader.readAsDataURL(file);
  });
}

function bookKey(b: Book): string {
  return `${b.title}|${b.author}`;
}

const SESSION_KEY = 'book-session-id';
const ADMIN_KEY = 'book-admin';
/** Shared with modkeys galleryAdmin — same BOOKS_ADMIN_PASSWORD unlock. */
const ADMIN_PW_KEY = 'book-admin-pw';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const bookMetaMap = bookMeta.books as Record<string, { cover: string | null; desc: string | null }>;

export default function BooksPage() {
  const shelves = useMemo(() => parseBooks(raw), []);
  useStandaloneScroll();
  const sessionId = useRef(getSessionId());
  const [detail, setDetail] = useState<Book | null>(null);
  const [visitorBooks, setVisitorBooks] = useState<Book[]>([]);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSources, setSearchSources] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [detailCover, setDetailCover] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [detailDescription, setDetailDescription] = useState<string | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [apiOnline, setApiOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pendingBook, setPendingBook] = useState<SearchResult | null>(null);
  const [pendingNote, setPendingNote] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualCover, setManualCover] = useState<ManualCover | null>(null);
  const [manualError, setManualError] = useState('');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const enrichmentCache = useRef(new Map<string, Promise<SearchResult | null>>());
  const manualFileRef = useRef<HTMLInputElement | null>(null);
  const adminPasswordRef = useRef(
    (() => {
      try { return sessionStorage.getItem(ADMIN_PW_KEY) || ''; }
      catch { return ''; }
    })(),
  );

  // Fetch visitor books from API; on failure, fall back to the last
  // successfully-loaded copy so the community section never blanks out.
  const LASTGOOD_KEY = 'visitor-books-lastgood';
  const loadVisitorBooks = useCallback(() => {
    fetch('/api/visitor-books')
      .then(res => {
        if (!res.ok) throw new Error(`visitor-books ${res.status}`);
        return res.json();
      })
      .then((data: APIResponse) => {
        setVisitorBooks(data.books ?? []);
        setReadOverrides(data.overrides ?? {});
        setApiOnline(true);
        try {
          localStorage.setItem(LASTGOOD_KEY, JSON.stringify({ books: data.books ?? [], overrides: data.overrides ?? {} }));
        } catch { /* storage full/blocked: cache is best-effort */ }
      })
      .catch(() => {
        setApiOnline(false);
        try {
          const cached = JSON.parse(localStorage.getItem(LASTGOOD_KEY) ?? 'null') as
            { books?: Book[]; overrides?: Record<string, boolean> } | null;
          if (cached && Array.isArray(cached.books)) {
            setVisitorBooks(cached.books);
            setReadOverrides(cached.overrides ?? {});
          }
        } catch { /* corrupt cache: leave defaults */ }
      });
  }, []);

  // Mount: fetch visitor books from API
  useEffect(() => {
    setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1');
    loadVisitorBooks();
  }, [loadVisitorBooks]);

  // Admin toggle: Ctrl+Shift+A
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.code === 'KeyA' || e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setIsAdmin(false);
          sessionStorage.removeItem(ADMIN_KEY);
          sessionStorage.removeItem(ADMIN_PW_KEY);
          adminPasswordRef.current = '';
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

  const submitAdminPass = async () => {
    try {
      const res = await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyAdmin', password: adminPass }),
      });
      if (res.ok) {
        adminPasswordRef.current = adminPass;
        setIsAdmin(true);
        sessionStorage.setItem(ADMIN_KEY, '1');
        sessionStorage.setItem(ADMIN_PW_KEY, adminPass);
        setAdminPrompt(false);
        setAdminPass('');
        setAdminError(false);
      } else {
        setAdminError(true);
      }
    } catch {
      setAdminError(true);
    }
  };

  // Debounced federated search. The Worker queries every catalog concurrently,
  // tolerates individual upstream failures, and returns merged provenance.
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchAbort.current) searchAbort.current.abort();

    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchSources([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const ac = new AbortController();
      searchAbort.current = ac;

      try {
        const response = await fetch(`/api/book-search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        if (!response.ok) throw new Error(`book search ${response.status}`);
        const data = await response.json() as SearchAPIResponse;
        setSearchResults(Array.isArray(data.results) ? data.results : []);
        setSearchSources(Array.isArray(data.sources) ? data.sources : []);
      } catch (err) {
        if (!ac.signal.aborted) {
          setSearchResults([]);
          setSearchSources([]);
        }
      } finally {
        if (!ac.signal.aborted) setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (searchAbort.current) searchAbort.current.abort();
    };
  }, [searchQuery]);

  const fetchBookMatch = useCallback((book: Book): Promise<SearchResult | null> => {
    const key = bookKey(book);
    const cached = enrichmentCache.current.get(key);
    if (cached) return cached;
    const promise = fetch(`/api/book-search?q=${encodeURIComponent(buildQuery(book))}`)
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json() as SearchAPIResponse;
        const results = Array.isArray(data.results) ? data.results : [];
        const title = book.title.toLowerCase();
        const author = book.author.toLowerCase();
        return results.find((result) =>
          result.title.toLowerCase() === title &&
          (!author || result.author.toLowerCase().includes(author)),
        ) ?? results[0] ?? null;
      })
      .catch(() => null);
    enrichmentCache.current.set(key, promise);
    return promise;
  }, []);

  // Cover fetch for visitor books with no cached data (rare path)
  const fetchCover = useCallback(async (book: Book): Promise<string | null> => {
    const cacheKey = bookKey(book);
    const meta = bookMetaMap[cacheKey];
    if (meta?.cover) return meta.cover;

    return (await fetchBookMatch(book))?.coverUrl ?? null;
  }, [fetchBookMatch]);

  // On-demand description fetch for visitor books (rare path)
  const fetchDescription = useCallback(async (book: Book): Promise<string | null> => {
    const cacheKey = bookKey(book);
    const meta = bookMetaMap[cacheKey];
    if (meta?.desc) return meta.desc;
    return (await fetchBookMatch(book))?.description ?? null;
  }, [fetchBookMatch]);

  useEffect(() => {
    if (!detail) { setDetailCover(null); setLoadingCover(false); setDetailDescription(null); setLoadingDescription(false); return; }
    let cancelled = false;
    const cacheKey = bookKey(detail);
    const meta = bookMetaMap[cacheKey];

    // Cover - check coverUrl, then bookMeta, then fetch for visitor books
    if (detail.coverUrl) {
      setDetailCover(detail.coverUrl);
    } else if (meta?.cover) {
      setDetailCover(meta.cover);
    } else {
      setDetailCover(null);
      setLoadingCover(true);
      fetchCover(detail).then(url => { if (!cancelled) { setDetailCover(url); setLoadingCover(false); } });
    }

    // Description - use stored catalog metadata first, then local build data,
    // then federated enrichment for older visitor records.
    if (detail.description) {
      setDetailDescription(detail.description);
    } else if (meta?.desc) {
      setDetailDescription(meta.desc);
    } else {
      setDetailDescription(null);
      setLoadingDescription(true);
      fetchDescription(detail).then(desc => { if (!cancelled) { setDetailDescription(desc); setLoadingDescription(false); } });
    }

    return () => { cancelled = true; };
  }, [detail]);

  // Confirmation dialog
  const openConfirmation = (result: SearchResult) => {
    setPendingBook(result);
    setPendingNote('');
    setSearchQuery('');
    setSearchResults([]);
    setSearchSources([]);
  };

  const confirmAddBook = async () => {
    if (!pendingBook) return;
    setSubmitting(true);
    const book: Book = {
      title: pendingBook.title,
      author: pendingBook.author,
      read: false,
      visitor: true,
      coverUrl: pendingBook.coverUrl,
      dateAdded: new Date().toISOString(),
      note: pendingNote.trim() || undefined,
      description: pendingBook.description,
      year: pendingBook.year,
      source: pendingBook.source,
      sourceUrl: pendingBook.sourceUrl,
      sessionId: sessionId.current,
    };

    try {
      const res = await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', book }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as { book?: Book };
      setVisitorBooks(prev => [...prev, data.book ?? book]);
    } catch {
      setVisitorBooks(prev => [...prev, book]);
    } finally {
      setSubmitting(false);
      setPendingBook(null);
      setPendingNote('');
    }
  };

  const openManualBook = () => {
    setManualTitle(searchQuery.trim());
    setManualAuthor('');
    setManualNote('');
    setManualCover(null);
    setManualError('');
    setManualOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    setSearchSources([]);
  };

  const selectManualCover = async (file: File | undefined) => {
    setManualCover(null);
    setManualError('');
    if (!file) return;
    if (!COVER_TYPES.has(file.type)) {
      setManualError('Cover must be a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setManualError('Cover must be 300 KB or smaller.');
      return;
    }
    try {
      const dimensions = await readImageDimensions(file);
      if (dimensions.width !== COVER_WIDTH || dimensions.height !== COVER_HEIGHT) {
        setManualError(`Cover must be exactly ${COVER_WIDTH} × ${COVER_HEIGHT} pixels (selected: ${dimensions.width} × ${dimensions.height}).`);
        return;
      }
      setManualCover({
        dataUrl: await readFileDataUrl(file),
        name: file.name,
        bytes: file.size,
      });
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Could not read the selected cover.');
    }
  };

  const addManualBook = async () => {
    const title = manualTitle.trim();
    if (!title) {
      setManualError('Title is required.');
      return;
    }
    setManualError('');
    setSubmitting(true);
    const book: Book = {
      title,
      author: manualAuthor.trim(),
      read: false,
      visitor: true,
      dateAdded: new Date().toISOString(),
      note: manualNote.trim() || undefined,
      source: 'Manual entry',
      sessionId: sessionId.current,
    };

    try {
      const res = await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          book,
          coverUpload: manualCover ? { dataUrl: manualCover.dataUrl } : undefined,
        }),
      });
      const data = await res.json() as { book?: Book; error?: string };
      if (!res.ok || !data.book) throw new Error(data.error || 'Book could not be saved.');
      setVisitorBooks(prev => [...prev, data.book as Book]);
      setManualOpen(false);
      setManualTitle('');
      setManualAuthor('');
      setManualNote('');
      setManualCover(null);
      if (manualFileRef.current) manualFileRef.current.value = '';
      trackEvent('Book Added Manually', { hasAuthor: Boolean(book.author), hasCover: Boolean(manualCover) });
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Book could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeVisitorBook = async (book: Book) => {
    try {
      await fetch('/api/visitor-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', password: adminPasswordRef.current, sessionId: sessionId.current, book }),
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
          body: JSON.stringify({
            action: 'toggleVisitorRead',
            password: adminPasswordRef.current,
            sessionId: sessionId.current,
            book,
          }),
        });
      } catch {}
    } else if (isAdmin) {
      const key = bookKey(book);
      const currentOverride = readOverrides[key];
      const newRead = currentOverride !== undefined ? !currentOverride : !book.read;
      setReadOverrides(prev => ({ ...prev, [key]: newRead }));
      setDetail(d => d ? { ...d, read: newRead } : null);
      try {
        await fetch('/api/visitor-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggleCuratedRead', password: adminPasswordRef.current, key, read: newRead }),
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
      <ScrollToTop />
      <StandaloneNav />
      <div className="standalone-header">
        <span className="standalone-prefix">SYS://</span>BOOKS
        {isAdmin && <span className="bs-admin-badge">ADMIN</span>}
        <MiniAudio />
      </div>

      {!apiOnline && (
        <div className="bs-api-warning">
          Live sync unavailable — showing your last-loaded community list; new changes may not persist.{' '}
          <button className="bs-retry-link" onClick={loadVisitorBooks}>Retry</button>
        </div>
      )}

      <div className="bs-search-wrap">
        <div className="bs-search-row">
          <input
            className="bs-add-input"
            type="text"
            placeholder="Search 6 open book catalogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length === 0 && !searching) openManualBook(); }}
          />
        </div>

        {searching && <div className="bs-search-status">Searching Google, Open Library, Crossref, LOC, Internet Archive, and Gutenberg...</div>}
        {!searching && searchResults.length > 0 && (
          <div className="bs-search-status">
            {searchResults.length} merged results · {searchSources.length} catalogs responded
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bs-search-dropdown">
            {searchResults.map((r) => {
              return (
                <button key={r.id} className="bs-search-result" onClick={() => openConfirmation(r)}>
                  {r.coverUrl ? (
                    <img src={r.coverUrl} alt="" className="bs-search-thumb" />
                  ) : (
                    <div className="bs-search-thumb bs-search-thumb--placeholder">{initial(r.title)}</div>
                  )}
                  <div className="bs-search-info">
                    <div className="bs-search-title">{r.title}</div>
                    {r.author && <div className="bs-search-author">{r.author}</div>}
                    <div className="bs-search-foot">
                      {r.year && <span className="bs-search-year">{r.year}</span>}
                      <span className="bs-search-source">{r.sources.join(' + ')}</span>
                    </div>
                  </div>
                  <span className="bs-search-add">+ ADD</span>
                </button>
              );
            })}
          </div>
        )}

        {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
          <div className="bs-search-empty">No catalog match. You can still add exactly what you want.</div>
        )}
        <button className="bs-add-manual" onClick={openManualBook} disabled={submitting}>
          + {searchQuery.trim() ? `ADD “${searchQuery.trim()}” MANUALLY` : 'ADD A BOOK MANUALLY'}
        </button>
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
              const meta = bookMetaMap[cacheKey] ?? undefined;
              const cachedCover = b.coverUrl ?? meta?.cover ?? undefined;
              const effectiveRead = getEffectiveRead(b);
              const removable = b.visitor && canRemove(b);
              return (
                <button
                  key={`${b.title}-${i}`}
                  className={`bs-card${effectiveRead ? ' bs-card--read' : ''}${b.visitor ? ' bs-card--visitor' : ''}`}
                  onClick={() => {
                    setDetail(b);
                    trackEvent('Book Open', {
                      title: b.title,
                      author: b.author || '',
                      visitor: Boolean(b.visitor),
                    });
                  }}
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
            {detailDescription && (
              <div className="bs-modal-synopsis">{detailDescription.length > 400 ? detailDescription.slice(0, 400) + '...' : detailDescription}</div>
            )}
            {loadingDescription && !detailDescription && (
              <div className="bs-modal-synopsis-loading">Loading synopsis...</div>
            )}
            <div className="bs-modal-title">{detail.title}</div>
            {detail.author && <div className="bs-modal-author">{detail.author}</div>}
            {(detail.year || detail.source) && (
              <div className="bs-modal-provenance">
                {detail.year && <span>{detail.year}</span>}
                {detail.sourceUrl ? (
                  <a href={detail.sourceUrl} target="_blank" rel="noreferrer">{detail.source || 'Catalog record'} ↗</a>
                ) : detail.source ? <span>{detail.source}</span> : null}
              </div>
            )}
            <div className="bs-modal-status">{getEffectiveRead(detail) ? '✓ READ' : '○ UNREAD'}</div>
            {detail.note && <div className="bs-modal-note">{detail.note}</div>}
            {detail.dateAdded && <div className="bs-modal-date">Added {formatDate(detail.dateAdded)}</div>}
            {(isAdmin || (detail.visitor && detail.sessionId === sessionId.current)) && (
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

      {manualOpen && (
        <div className="bs-overlay" onClick={() => !submitting && setManualOpen(false)}>
          <div className="bs-confirm-modal bs-manual-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bs-modal-close" onClick={() => !submitting && setManualOpen(false)}>✕</button>
            <div className="bs-confirm-header">ADD ANY BOOK</div>
            <div className="bs-manual-grid">
              <label className="bs-manual-field">
                <span>TITLE *</span>
                <input
                  className="bs-add-input"
                  type="text"
                  maxLength={180}
                  placeholder="Book title"
                  value={manualTitle}
                  onChange={(e) => { setManualTitle(e.target.value); setManualError(''); }}
                  autoFocus
                  disabled={submitting}
                />
              </label>
              <label className="bs-manual-field">
                <span>AUTHOR</span>
                <input
                  className="bs-add-input"
                  type="text"
                  maxLength={140}
                  placeholder="Author or editor (optional)"
                  value={manualAuthor}
                  onChange={(e) => setManualAuthor(e.target.value)}
                  disabled={submitting}
                />
              </label>
              <label className="bs-manual-field">
                <span>NOTE</span>
                <textarea
                  className="bs-add-input bs-manual-note"
                  maxLength={500}
                  placeholder="Why this belongs in the Sea Library (optional)"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="bs-cover-upload">
              <div className="bs-cover-upload-preview">
                {manualCover ? (
                  <img src={manualCover.dataUrl} alt="Selected book cover" />
                ) : (
                  <span>{initial(manualTitle || '?')}</span>
                )}
              </div>
              <div className="bs-cover-upload-copy">
                <div className="bs-cover-upload-title">CUSTOM COVER (OPTIONAL)</div>
                <div className="bs-cover-upload-rules">
                  Exactly {COVER_WIDTH} × {COVER_HEIGHT}px · JPEG, PNG, or WebP · 300 KB max
                </div>
                <input
                  ref={manualFileRef}
                  className="bs-cover-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => void selectManualCover(e.target.files?.[0])}
                  disabled={submitting}
                />
                {manualCover && (
                  <div className="bs-cover-upload-selected">
                    <span>{manualCover.name} · {Math.ceil(manualCover.bytes / 1024)} KB</span>
                    <button
                      type="button"
                      onClick={() => {
                        setManualCover(null);
                        if (manualFileRef.current) manualFileRef.current.value = '';
                      }}
                    >REMOVE</button>
                  </div>
                )}
              </div>
            </div>

            {manualError && <div className="bs-manual-error">{manualError}</div>}
            <div className="bs-confirm-actions">
              <button className="bs-confirm-cancel" onClick={() => setManualOpen(false)} disabled={submitting}>
                CANCEL
              </button>
              <button className="bs-confirm-btn" onClick={addManualBook} disabled={submitting || !manualTitle.trim()}>
                {submitting ? 'SAVING...' : 'ADD TO LIBRARY'}
              </button>
            </div>
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
                {pendingBook.coverUrl ? (
                  <img src={pendingBook.coverUrl} alt="" className="bs-confirm-cover-img" />
                ) : (
                  <div className="bs-confirm-cover-placeholder">{initial(pendingBook.title)}</div>
                )}
              </div>
              <div className="bs-confirm-meta">
                <div className="bs-confirm-title">{pendingBook.title}</div>
                {pendingBook.author && (
                  <div className="bs-confirm-author">{pendingBook.author}</div>
                )}
                {pendingBook.year && (
                  <div className="bs-confirm-year">{pendingBook.year}</div>
                )}
                <div className="bs-confirm-source">{pendingBook.sources.join(' + ')}</div>
              </div>
            </div>
            <div className="bs-confirm-synopsis">
              {pendingBook.description ? (
                <p>{pendingBook.description.length > 600 ? pendingBook.description.slice(0, 600) + '...' : pendingBook.description}</p>
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
