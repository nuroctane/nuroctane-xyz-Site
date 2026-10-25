import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { surname, type SpineLook } from './spine';

export interface TomeBook {
  title: string;
  author: string;
  read: boolean;
  note?: string;
  year?: string;
  source?: string;
  sourceUrl?: string;
  dateAdded?: string;
  visitor?: boolean;
}

interface TomeProps {
  book: TomeBook;
  look: SpineLook;
  /** The spine it was pulled from; it flies back there on close. */
  spine: HTMLElement | null;
  cover: string | null;
  description: string | null;
  status: ReactNode;
  actions?: ReactNode;
  onClosed: () => void;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLIGHT_MS = 640;
const HINGE_MS = 720;

/**
 * A book pulled from the shelf: it leaves its slot spine-first, turns to face
 * the reader and opens on its hinge; closing reverses the trip into the same
 * gap. CSS 3D (preserve-3d) with the Web Animations API, so no WebGL and only
 * this one book is ever animated.
 */
export function Tome({ book, look, spine, cover, description, status, actions, onClosed }: TomeProps) {
  const carrier = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const closing = useRef(false);

  /** Transform that puts the carrier over the spine on the shelf. */
  const fromSpine = useCallback(() => {
    const el = carrier.current;
    if (!el || !spine) return null;
    const s = spine.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const onScreen = s.bottom > 0 && s.top < innerHeight && s.right > 0 && s.left < innerWidth;
    if (!onScreen || !b.height) return null;
    const scale = s.height / b.height;
    const dx = s.left + s.width / 2 - (b.left + b.width / 2);
    const dy = s.top + s.height / 2 - (b.top + b.height / 2);
    return `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
  }, [spine]);

  useLayoutEffect(() => {
    const el = carrier.current;
    const inner = body.current;
    if (!el || !inner || reduced()) {
      setOpen(true);
      return;
    }
    const start = fromSpine();
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    if (start) {
      el.animate([{ transform: start }, { transform: 'none' }], { duration: FLIGHT_MS, easing: ease });
      inner.animate(
        [{ transform: 'rotateY(90deg)' }, { transform: 'rotateX(6deg) rotateY(-16deg)', offset: 0.7 }, { transform: 'rotateX(6deg) rotateY(-16deg)' }],
        { duration: FLIGHT_MS, easing: ease },
      );
    } else {
      el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: ease });
    }
    const timer = window.setTimeout(() => setOpen(true), start ? FLIGHT_MS - 80 : 200);
    return () => window.clearTimeout(timer);
  }, [fromSpine]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = carrier.current;
    const inner = body.current;
    if (!el || !inner || reduced()) {
      onClosed();
      return;
    }
    setOpen(false);
    window.setTimeout(() => {
      const end = fromSpine();
      const ease = 'cubic-bezier(0.55, 0, 0.45, 1)';
      const flight = end
        ? el.animate([{ transform: 'none' }, { transform: end }], { duration: FLIGHT_MS - 80, easing: ease, fill: 'forwards' })
        : el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(24px)' }], { duration: 260, fill: 'forwards' });
      if (end) {
        inner.animate([{ transform: 'rotateX(6deg) rotateY(-16deg)' }, { transform: 'rotateY(90deg)' }], {
          duration: FLIGHT_MS - 80,
          easing: ease,
          fill: 'forwards',
        });
      }
      flight.finished.then(onClosed, onClosed);
    }, HINGE_MS - 260);
  }, [fromSpine, onClosed]);

  // Keyboard: focus moves into the book and returns to the spine afterwards.
  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (spine?.isConnected) spine.focus({ preventScroll: true });
    };
  }, [close, spine]);

  const style = {
    '--tone': look.tone,
    '--ink': look.ink,
    '--depth': `${Math.max(18, Math.min(40, look.width))}px`,
  } as React.CSSProperties;

  return (
    <div className="bb-tome-stage" data-open={open || undefined} onClick={close}>
      <div className="bb-tome-carrier" ref={carrier} style={style}>
        <div
          className="bb-tome"
          ref={body}
          role="dialog"
          aria-modal="true"
          aria-label={book.title}
          onClick={event => event.stopPropagation()}
        >
          <div className="bb-tome-back" aria-hidden="true" />
          <div className="bb-tome-edge bb-tome-edge--fore" aria-hidden="true" />
          <div className="bb-tome-edge bb-tome-edge--head" aria-hidden="true" />
          <div className="bb-tome-spine" aria-hidden="true">
            <span>{book.title}</span>
          </div>

          <article className="bb-tome-page">
            <button className="bb-tome-close" ref={closeButton} onClick={close} aria-label="Return the book to the shelf">
              ×
            </button>
            <p className="bb-tome-kicker">{book.visitor ? 'Recommended by a visitor' : 'From the library'}</p>
            <h2>{book.title}</h2>
            {book.author && <p className="bb-tome-author">{book.author}</p>}
            {(book.year || book.source) && (
              <p className="bb-tome-meta">
                {book.year && <span>{book.year}</span>}
                {book.source &&
                  (book.sourceUrl ? (
                    <a href={book.sourceUrl} target="_blank" rel="noreferrer">
                      {book.source} ↗
                    </a>
                  ) : (
                    <span>{book.source}</span>
                  ))}
              </p>
            )}
            {cover && <img className="bb-tome-inline-cover" src={cover} alt="" decoding="async" />}
            {description && (
              <p className="bb-tome-synopsis">{description.length > 700 ? `${description.slice(0, 700)}…` : description}</p>
            )}
            {book.note && <p className="bb-tome-note">{book.note}</p>}
            <p className="bb-tome-status">{status}</p>
            {actions && <div className="bb-tome-actions">{actions}</div>}
          </article>

          <div className="bb-tome-cover">
            <div className="bb-tome-face" aria-hidden="true">
              {cover ? (
                <img src={cover} alt="" decoding="async" />
              ) : (
                <div className="bb-tome-typeset">
                  <span>{book.title}</span>
                  <small>{surname(book.author)}</small>
                </div>
              )}
            </div>
            <div className="bb-tome-endpaper" aria-hidden="true">
              <div className="bb-tome-plate">
                {cover ? <img src={cover} alt="" decoding="async" /> : <span>{book.title.match(/\p{L}/u)?.[0] ?? '?'}</span>}
              </div>
              <p className="bb-tome-exlibris">Ex libris · Nuroctane</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
