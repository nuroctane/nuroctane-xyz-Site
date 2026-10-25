import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { spineLook, surname, type SpineLook } from './spine';
import './bookshelf.css';

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
  onPull: (book: B, spine: HTMLElement, look: SpineLook) => void;
}

/**
 * The library as a bookcase: spines on chalk-line ledges. Looks are derived
 * per title (spine.ts), nothing loads images, and hover runs on the DOM
 * directly so pointer movement never re-renders hundreds of spines.
 */
export function Bookshelf<B extends ShelfBook>({ shelves, bookKey, isRead, pulled, onPull }: BookshelfProps<B>) {
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

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const spine = (event.target as HTMLElement).closest<HTMLElement>('.bb-spine');
    showSlip(spine, event.clientX, event.clientY);
  }, [showSlip]);

  return (
    <div className="bb-stacks" onPointerMove={onPointerMove} onPointerLeave={() => showSlip(null)}>
      {shelves.map(shelf => (
        <ShelfRow
          key={shelf.name}
          shelf={shelf}
          bookKey={bookKey}
          isRead={isRead}
          pulled={pulled ?? null}
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
  onPull,
  onFocusSpine,
}: {
  shelf: ShelfData<B>;
  bookKey: (book: B) => string;
  isRead: (book: B) => boolean;
  pulled: string | null;
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
    o(s.books[index], spine, spineLook(s.books[index].title, s.books[index].author));
  }, []);
  const focus = useCallback((index: number, spine: HTMLElement) => {
    setActive(index);
    latest.current.onFocusSpine(spine);
  }, []);
  const blur = useCallback(() => latest.current.onFocusSpine(null), []);
  const looks = useMemo(() => shelf.books.map(book => spineLook(book.title, book.author)), [shelf.books]);
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
              look={looks[index]}
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
        } as React.CSSProperties}
        onClick={event => onPull(index, event.currentTarget)}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) onFocus(index, event.currentTarget);
        }}
        onBlur={onBlur}
      >
        <span className="bb-spine-title">{look.lettering === 'author' && book.author ? surname(book.author) : book.title}</span>
        <span className="bb-spine-foot">{look.lettering === 'author' ? '' : surname(book.author)}</span>
      </button>
    </span>
  );
});
