import { useLocation } from 'wouter';
import { useState, useEffect, useRef } from 'react';

const DESTINATIONS = [
  { href: '/', label: 'Home', badge: 'HM' },
  { href: '/socials', label: 'Socials', badge: 'SO' },
  { href: '/projects', label: 'Projects', badge: 'PR' },
  { href: '/blog', label: 'Blog', badge: 'BL' },
  { href: '/quotes', label: 'Quotes', badge: 'QT' },
  { href: '/books', label: 'Books', badge: 'BK' },
  { href: '/resume', label: 'Resume', badge: 'CV' },
  { href: '/modkeys', label: 'MODKEYS', badge: 'MK' },
  { href: '/cli', label: 'NurCLI', badge: 'NU' },
  { href: '/orbit', label: 'Orbit Veil', badge: 'OV', logo: '/assets/nodes/orbit-veil-logo.svg' },
  { href: '/fin', label: 'Fin', badge: 'FN' },
] as const;

export function StandaloneNav() {
  const [location, setLocation] = useLocation();
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
          {DESTINATIONS.map((item) => {
            const active = location === item.href;
            return (
              <button
                key={item.href}
                className={`qnav-item${active ? ' qnav-item--active' : ''}`}
                onClick={() => nav(item.href)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="qnav-item-badge">
                  {'logo' in item
                    ? <img src={item.logo} alt="" className="qnav-item-img" />
                    : <span className="qnav-item-acronym">{item.badge}</span>
                  }
                </span>
                <span className="qnav-item-name">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
