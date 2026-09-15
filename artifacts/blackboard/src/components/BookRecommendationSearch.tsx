import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { BookOpen, Loader2, Plus, X } from 'lucide-react';
import './book-recommendation-search.css';

type CatalogBook = { id: string; title: string; author: string; coverUrl?: string; description?: string; year?: string; source?: string; sources: string[]; sourceUrl?: string };
type SavedBook = Omit<CatalogBook, 'id' | 'sources'> & { read: boolean; visitor: boolean; dateAdded?: string; sessionId?: string; note?: string };

function Cover({ book }: { book: { title: string; coverUrl?: string } }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [book.coverUrl]);
  return <span className="bb-catalog-cover">{book.coverUrl && !failed ? <img src={book.coverUrl} alt="" loading="lazy" onError={() => setFailed(true)} /> : <BookOpen aria-hidden="true" />}</span>;
}

export function BookRecommendationSearch({ sessionId, onAdded }: { sessionId: string; onAdded: (book: SavedBook) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogBook[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState<CatalogBook | null>(null);
  const [manual, setManual] = useState(false);
  const [note, setNote] = useState('');
  const [coverUpload, setCoverUpload] = useState<string>();
  const [coverError, setCoverError] = useState('');
  const [readingCover, setReadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const uploadVersion = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const q = query.trim();
    setResults([]); setSources([]); setSearchError(''); setSearching(q.length >= 2);
    if (q.length < 2) return () => controller.abort();
    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => controller.abort('timeout'), 15_000);
      try {
        const response = await fetch(`/api/book-search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search unavailable');
        const data = await response.json();
        if (!Array.isArray(data.results) || !Array.isArray(data.sources) || !data.sources.length) throw new Error('Catalogs unavailable');
        if (!controller.signal.aborted) { setResults(data.results); setSources(data.sources); }
      } catch {
        if (!controller.signal.aborted || controller.signal.reason === 'timeout') setSearchError('The catalogs could not respond. Try again, or add your book manually.');
      } finally {
        window.clearTimeout(timeout);
        if (!controller.signal.aborted || controller.signal.reason === 'timeout') setSearching(false);
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, retry]);

  const choose = (book?: CatalogBook) => {
    uploadVersion.current++;
    setPending(book ?? { id: 'manual', title: query.trim(), author: '', source: 'Manual entry', sources: [] });
    setManual(!book); setNote(''); setCoverUpload(undefined); setCoverError(''); setReadingCover(false); setSaveError('');
    setExpanded(false);
  };
  const close = () => { if (!savingRef.current) { uploadVersion.current++; setPending(null); } };
  const selectCover = async (file?: File) => {
    const version = ++uploadVersion.current;
    setCoverUpload(undefined); setCoverError(''); setReadingCover(false);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 300 * 1024) {
      setCoverError('Choose a JPEG, PNG, or WebP image, 300 KB or smaller.'); return;
    }
    setReadingCover(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const image = new Image(); image.src = dataUrl; await image.decode();
      if (image.naturalWidth !== 600 || image.naturalHeight !== 900) throw new Error('Cover must be exactly 600 × 900 pixels.');
      if (version === uploadVersion.current) setCoverUpload(dataUrl);
    } catch (error) {
      if (version === uploadVersion.current) setCoverError(error instanceof Error ? error.message : 'Could not read this image.');
    } finally { if (version === uploadVersion.current) setReadingCover(false); }
  };
  const save = async () => {
    if (!pending || savingRef.current || readingCover || coverError) return;
    if (!pending.title.trim()) { setSaveError('Enter a book title.'); return; }
    savingRef.current = true; setSaving(true); setSaveError('');
    const { id: _id, sources: _sources, ...metadata } = pending;
    const book: SavedBook = { ...metadata, title: pending.title.trim(), author: pending.author.trim(), note: note.trim() || undefined, read: false, visitor: true, sessionId, dateAdded: new Date().toISOString() };
    try {
      const response = await fetch('/api/visitor-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', book, coverUpload: coverUpload ? { dataUrl: coverUpload } : undefined }) });
      const data = await response.json();
      if (!response.ok || !data.book) throw new Error(data.error || 'The recommendation could not be saved. Please try again.');
      onAdded(data.book); setSuccess(`Added ${data.book.title} to Community Recommendations.`); setPending(null); setQuery('');
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not connect. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  };

  return <div className="bb-recommend bb-catalog">
    <label htmlFor="bb-recommend-input">Recommend a book</label>
    <input ref={input} id="bb-recommend-input" value={query} maxLength={160} placeholder="Search Public Libraries" autoComplete="off" aria-controls={expanded ? 'bb-catalog-results' : undefined} onFocus={() => setExpanded(true)} onChange={event => { setQuery(event.target.value); setExpanded(true); setSuccess(''); }} onKeyDown={event => { if (event.key === 'Escape') setExpanded(false); }} />
    {expanded && query.trim().length >= 2 && <section id="bb-catalog-results" className="bb-catalog-panel" aria-label="Catalog search results" aria-busy={searching}>
      <div className="bb-catalog-status" role="status">{searching ? <><Loader2 className="bb-catalog-spinner" size={14} />Searching six book catalogs…</> : searchError || `${results.length} results · ${sources.length} of 6 catalogs responded`}</div>
      {searchError && <button type="button" className="bb-catalog-secondary" onClick={() => setRetry(value => value + 1)}>Retry search</button>}
      {!searching && !searchError && !results.length && <p className="bb-catalog-empty">No catalog match. You can still add this book manually.</p>}
      {!!results.length && <ul className="bb-catalog-list">{results.map(result => <li key={result.id}><button type="button" className="bb-catalog-result" onClick={() => choose(result)}><Cover book={result} /><span><strong>{result.title}</strong><small>{[result.author, result.year].filter(Boolean).join(' · ') || 'Author not listed'}</small><small className="bb-catalog-sources">{result.sources.join(' + ')}</small></span><Plus size={16} aria-hidden="true" /></button></li>)}</ul>}
      <button type="button" className="bb-catalog-secondary" onClick={() => setExpanded(false)}>Close results</button>
    </section>}
    <button type="button" className="bb-catalog-manual" onClick={() => choose()}>Add a book manually</button>
    {success && <p className="bb-catalog-success" role="status">{success}</p>}
    <Dialog.Root open={!!pending} onOpenChange={open => { if (!open) close(); }}>
      <Dialog.Portal><Dialog.Overlay className="bb-recommend-overlay" /><Dialog.Content className="bb-recommend-dialog" onCloseAutoFocus={event => { event.preventDefault(); input.current?.focus(); }} onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => { if (saving) event.preventDefault(); }}>
        <Dialog.Title>{manual ? 'Recommend a book' : 'Add to community recommendations?'}</Dialog.Title>
        <Dialog.Description className="sr-only">Review the book and add an optional note before sharing it with the community.</Dialog.Description>
        <button type="button" className="bb-recommend-close" aria-label="Close recommendation" disabled={saving} onClick={close}><X size={18} /></button>
        {pending && <form onSubmit={event => { event.preventDefault(); void save(); }}>
          {manual ? <><label>Title<input autoFocus required maxLength={200} value={pending.title} disabled={saving} onChange={event => setPending({ ...pending, title: event.target.value })} /></label><label>Author<input maxLength={140} value={pending.author} disabled={saving} onChange={event => setPending({ ...pending, author: event.target.value })} /></label><label>Cover image (optional)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => void selectCover(event.target.files?.[0])} /><small>600 × 900 pixels · JPEG, PNG, WebP · 300 KB max</small></label>{coverUpload && <Cover book={{ ...pending, coverUrl: coverUpload }} />}{coverError && <p role="alert">{coverError}</p>}</> : <><div className="bb-catalog-preview"><Cover book={pending} /><div><h3>{pending.title}</h3><p>{[pending.author, pending.year].filter(Boolean).join(' · ')}</p>{pending.sourceUrl && <a href={pending.sourceUrl} target="_blank" rel="noreferrer">{pending.source} ↗</a>}</div></div>{pending.description && <p className="bb-catalog-description">{pending.description}</p>}</>}
          <label>Note (optional)<textarea maxLength={500} rows={3} value={note} disabled={saving} onChange={event => setNote(event.target.value)} placeholder="Why do you recommend it?" /></label>
          {saveError && <p role="alert">{saveError}</p>}
          <div className="bb-recommend-actions"><button type="button" onClick={close} disabled={saving}>Cancel</button><button type="submit" disabled={saving || readingCover || !!coverError}>{saving ? 'Saving…' : readingCover ? 'Reading cover…' : 'Add recommendation'}</button></div>
        </form>}
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </div>;
}
