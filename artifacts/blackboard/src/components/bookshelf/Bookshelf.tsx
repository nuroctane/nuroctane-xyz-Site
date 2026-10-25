import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import spinesRaw from '@shared/book-spines.json?raw';
import { spineId, spineLook, surname, type SpineLook } from './spine';
import './bookshelf.css';

/** Cover colours and art made by scripts/src/spine-art.ts, keyed by spineId. */
let SPINES: Record<string, [string, string]> = {};
try {
  SPINES = (JSON.parse(spinesRaw) as { spines?: Record<string, [string, string]> }).spines ?? {};
} catch { /* house cloth for everyone */ }

/** Look and vignette for a book: its cover's cloth and local art when made,
 * else the remote cover (books added since the last art run), else none. */
function dress(book: ShelfBook, cover?: string): { look: SpineLook; art?: string } {
  const id = spineId(book.title, book.author);
  const cloth = SPINES[id];
  return { look: spineLook(book.title, book.author, cloth), art: cloth ? `/assets/spines/${id}.webp` : cover };
}

export interface ShelfBook {
  title: string;
  author: string;
  read: boolean;
  visitor?: boolean;
}

export interface ShelfData<B extends ShelfBook> {
  name: string;
  books: B[];
}

interface BookshelfProps<B extends ShelfBook> {
  shelves: ShelfData<B>[];
  bookKey: (book: B) => string;
  isRead: (book: B) => boolean;
  /** The book being read: its slot on the shelf stands empty meanwhile. */
  pulled?: string | null;
  /** A cover image for books without generated spine art. */
  coverOf?: (book: B) => string | undefined;
  onPull: (book: B, spine: HTMLElement, look: SpineLook) => void;
}

/**
 * The library as a bookcase: spines on chalk-line ledges. Looks are derived
 * per title (spine.ts), nothing loads images, and hover runs on the DOM
 * directly so pointer movement never re-renders hundreds of spines.
 */
export function Bookshelf<B extends ShelfBook>({ shelves, bookKey, isRead, pulled, coverOf, onPull }: BookshelfProps<B>) {
  const slip = useRef<HTMLDivElement>(null);
  const slipTitle = useRef<HTMLSpanElement>(null);
  const slipAuthor = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  const showSlip = useCallback((spine: HTMLElement | null, x?: number, y?: number) => {
    const el = slip.current;
    if (!el) return;
    if (!spine) {
      el.dataset.shown = 'false';
      return;
    }
    if (slipTitle.current) slipTitle.current.textContent = spine.dataset.title ?? '';
    if (slipAuthor.current) slipAuthor.current.textContent = spine.dataset.author ?? '';
    if (x === undefined || y === undefined) {
      const rect = spine.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    }
    const px = x;
    const py = y;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `translate3d(${Math.round(px + 16)}px, ${Math.round(py + 18)}px, 0)`;
      el.dataset.shown = 'true';
    });
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Titles scroll only on shelves near the viewport, and only where the title
  // is longer than its spine: measured once per shelf as it comes into view
  // (and again after a resize), then written straight onto the DOM.
  const stacks = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = stacks.current;
    if (!root || typeof IntersectionObserver !== 'function') return;
    const measure = (scope: HTMLElement) => {
      const titles = [...scope.querySelectorAll<HTMLElement>('.bb-spine-title > span')];
      const long = titles.map(span => span.offsetHeight > (span.parentElement?.clientHeight ?? 0) + 1);
      titles.forEach((span, i) => {
        const spine = span.closest<HTMLElement>('.bb-spine');
        if (spine) spine.toggleAttribute('data-long', long[i]);
      });
      scope.dataset.measured = 'true';
    };
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const shelf = entry.target as HTMLElement;
        shelf.toggleAttribute('data-inview', entry.isIntersecting);
        if (entry.isIntersecting && !shelf.dataset.measured) measure(shelf);
      }
    }, { rootMargin: '200px 0px' });
    const watch = () => root.querySelectorAll<HTMLElement>('.bb-case').forEach(shelf => seen.observe(shelf));
    watch();
    // Shelves come and go with search; re-measure after layout changes.
    const changed = new MutationObserver(() => {
      root.querySelectorAll<HTMLElement>('.bb-case').forEach(shelf => {
        delete shelf.dataset.measured;
        if (shelf.hasAttribute('data-inview')) measure(shelf);
      });
      watch();
    });
    changed.observe(root, { childList: true, subtree: true });
    let timer = 0;
    const resized = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => root.querySelectorAll<HTMLElement>('.bb-case').forEach(shelf => {
        delete shelf.dataset.measured;
        if (shelf.hasAttribute('data-inview')) measure(shelf);
      }), 200);
    };
    window.addEventListener('resize', resized);
    return () => {
      seen.disconnect();
      changed.disconnect();
      window.removeEventListener('resize', resized);
      clearTimeout(timer);
    };
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const spine = (event.target as HTMLElement).closest<HTMLElement>('.bb-spine');
    showSlip(spine, event.clientX, event.clientY);
  }, [showSlip]);

  return (
    <div className="bb-stacks" ref={stacks} onPointerMove={onPointerMove} onPointerLeave={() => showSlip(null)}>
      {shelves.map(shelf => (
        <ShelfRow
          key={shelf.name}
          shelf={shelf}
          bookKey={bookKey}
          isRead={isRead}
          pulled={pulled ?? null}
          coverOf={coverOf}
          onPull={onPull}
          onFocusSpine={spine => showSlip(spine)}
        />
      ))}
      <div className="bb-slip" ref={slip} data-shown="false" aria-hidden="true">
        <span className="bb-slip-title" ref={slipTitle} />
        <span className="bb-slip-author" ref={slipAuthor} />
      </div>
    </div>
  );
}

function ShelfRow<B extends ShelfBook>({
  shelf,
  bookKey,
  isRead,
  pulled,
  coverOf,
  onPull,
  onFocusSpine,
}: {
  shelf: ShelfData<B>;
  bookKey: (book: B) => string;
  isRead: (book: B) => boolean;
  pulled: string | null;
  coverOf?: (book: B) => string | undefined;
  onPull: BookshelfProps<B>['onPull'];
  onFocusSpine: (spine: HTMLElement | null) => void;
}) {
  // One tab stop per shelf; arrow keys walk the spines (roving tabindex).
  const [active, setActive] = useState(0);
  const row = useRef<HTMLDivElement>(null);
  // Stable handlers keep memoised spines from re-rendering on every page
  // update (typing in search, opening a book).
  const latest = useRef({ shelf, onPull, onFocusSpine });
  latest.current = { shelf, onPull, onFocusSpine };
  const pull = useCallback((index: number, spine: HTMLElement) => {
    setActive(index);
    const { shelf: s, onPull: o } = latest.current;
    o(s.books[index], spine, dress(s.books[index]).look);
  }, []);
  const focus = useCallback((index: number, spine: HTMLElement) => {
    setActive(index);
    latest.current.onFocusSpine(spine);
  }, []);
  const blur = useCallback(() => latest.current.onFocusSpine(null), []);
  const dressed = useMemo(() => shelf.books.map(book => dress(book, coverOf?.(book))), [shelf.books, coverOf]);
  const current = Math.min(active, Math.max(0, shelf.books.length - 1));

  const focusAt = (index: number) => {
    const next = Math.max(0, Math.min(shelf.books.length - 1, index));
    setActive(next);
    const spine = row.current?.querySelectorAll<HTMLElement>('.bb-spine')[next];
    spine?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key in moves) focusAt(current + moves[event.key]);
    else if (event.key === 'Home') focusAt(0);
    else if (event.key === 'End') focusAt(shelf.books.length - 1);
    else return;
    event.preventDefault();
  };

  const community = shelf.name === 'Community Recommendations';
  return (
    <section className={`bb-case${community ? ' bb-case--community' : ''}`} aria-label={shelf.name}>
      <header className="bb-case-label">
        <h2>{shelf.name}</h2>
        <span>{String(shelf.books.length).padStart(2, '0')}</span>
      </header>
      <div className="bb-case-row" ref={row} role="list" onKeyDown={onKeyDown}>
        <span className="bb-bookend" aria-hidden="true" />
        {shelf.books.map((book, index) => {
          const key = bookKey(book);
          return (
            <Spine
              key={`${key}-${index}`}
              index={index}
              book={book}
              look={dressed[index].look}
              art={dressed[index].art}
              read={isRead(book)}
              pulled={pulled === key}
              tabbable={index === current}
              onPull={pull}
              onFocus={focus}
              onBlur={blur}
            />
          );
        })}
        <span className="bb-bookend bb-bookend--end" aria-hidden="true" />
      </div>
    </section>
  );
}

const Spine = memo(function Spine({
  index,
  book,
  look,
  art,
  read,
  pulled,
  tabbable,
  onPull,
  onFocus,
  onBlur,
}: {
  index: number;
  book: ShelfBook;
  look: SpineLook;
  art?: string;
  read: boolean;
  pulled: boolean;
  tabbable: boolean;
  onPull: (index: number, spine: HTMLElement) => void;
  onFocus: (index: number, spine: HTMLElement) => void;
  onBlur: () => void;
}) {
  const label = [book.title, book.author && `by ${book.author}`, read ? 'read' : 'unread', book.visitor && 'recommended by a visitor']
    .filter(Boolean)
    .join(', ');
  return (
    <span className="bb-slot" role="listitem">
      <button
        type="button"
        className="bb-spine"
        data-title={book.title}
        data-author={book.author}
        data-bands={look.bands}
        data-pulled={pulled || undefined}
        data-read={read || undefined}
        data-visitor={book.visitor || undefined}
        tabIndex={tabbable ? 0 : -1}
        aria-label={label}
        style={{
          '--w': look.width,
          '--h': look.height,
          '--tone': look.tone,
          '--ink': look.ink,
          '--band': `${look.bandAt}px`,
          '--drift': `-${look.drift}s`,
        } as React.CSSProperties}
        onClick={event => onPull(index, event.currentTarget)}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) onFocus(index, event.currentTarget);
        }}
        onBlur={onBlur}
      >
        {art && (
          <span className="bb-spine-art">
            <img src={art} alt="" loading="lazy" decoding="async" width={48} height={64} />
          </span>
        )}
        {/* Every spine reads the same way: the title, which scrolls when it is
            longer than the spine, over the author's name. */}
        <span className="bb-spine-title">
          <span>{book.title}</span>
        </span>
        {book.author && <span className="bb-spine-foot">{surname(book.author)}</span>}
      </button>
    </span>
  );
});
