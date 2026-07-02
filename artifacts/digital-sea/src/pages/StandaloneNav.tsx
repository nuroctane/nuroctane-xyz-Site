import { useLocation } from 'wouter';
import { useState, useEffect, useRef } from 'react';

export function StandaloneNav() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const nav = (href: string) => { setOpen(false); setLocation(href); };

  return (
    <div className="qnav" ref={panelRef}>
      <button
        className={`qnav-trigger${open ? ' qnav-trigger--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
      >
        <span className="qnav-bar qnav-bar--1" />
        <span className="qnav-bar qnav-bar--2" />
        <span className="qnav-bar qnav-bar--3" />
      </button>

      <div className={`qnav-panel${open ? ' qnav-panel--open' : ''}`} role="navigation" aria-label="Site navigation">
        <div className="qnav-scan" />
        <div className="qnav-hd">
          <img src="/assets/nodes/site-logo.png" alt="nuroctane" className="qnav-logo" />
          <span className="qnav-hd-text">// NAV</span>
          <button className="qnav-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="qnav-body">
          <button className="qnav-item" onClick={() => nav('/')}>
            <span className="qnav-item-badge"><span className="qnav-item-acronym">HM</span></span>
            <span className="qnav-item-name">Home</span>
          </button>
          <button className="qnav-item" onClick={() => nav('/quotes')}>
            <span className="qnav-item-badge"><span className="qnav-item-acronym">QT</span></span>
            <span className="qnav-item-name">Quotes</span>
          </button>
          <button className="qnav-item" onClick={() => nav('/books')}>
            <span className="qnav-item-badge"><span className="qnav-item-acronym">BK</span></span>
            <span className="qnav-item-name">Books</span>
          </button>
        </div>
      </div>
    </div>
  );
}
