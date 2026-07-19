import { useLocation } from 'wouter';
import { useState, useEffect, useRef } from 'react';
import { markNavigationIntent } from '../lib/navIntent';

const DESTINATIONS = [
  { href: '/', label: 'Home', logo: '/assets/nodes/site-logo.png' },
  { href: '/socials', label: 'Socials', logo: '/assets/nodes/nuroctane-avatar.png' },
  { href: '/projects', label: 'Projects', logo: '/assets/nodes/github-logo.png' },
  { href: '/blog', label: 'Blog', logo: '/assets/nodes/substack-logo.png' },
  { href: '/quotes', label: 'Quotes', logo: '/assets/nodes/nuroctane-animated-avatar.gif' },
  { href: '/books', label: 'Books', logo: '/assets/nodes/goodreads-logo.png' },
  { href: '/modkeys', label: 'MODKEYS', logo: '/assets/nodes/modkeys-logo.png' },
  { href: '/cli', label: 'NurCLI', logo: '/assets/nodes/nur-cli-logo.png' },
  { href: '/observatory', label: 'Observatory', logo: '/assets/nodes/orbit-veil-logo.svg' },
  { href: 'https://tunerzsociety.site', label: 'ATX Tunerz', logo: '/assets/nodes/atx-tunerz-logo.png', external: true },
  { href: '/fin', label: 'Fin', logo: '/assets/nodes/venmo-logo.png' },
] as const;

const isExternal = (href: string) => /^https?:\/\//.test(href);

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

  // External destinations (e.g. tunerzsociety.site) open in a new tab; internal
  // sea routes are intentional jumps  -  mark intent so App scrolls to the
  // section's first card instead of letting the passive scroll mirror decide.
  const nav = (href: string) => {
    setOpen(false);
    if (isExternal(href)) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    markNavigationIntent();
    setLocation(href);
  };

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
            const external = isExternal(item.href);
            const active = !external && location === item.href;
            return (
              <button
                key={item.href}
                className={`qnav-item${active ? ' qnav-item--active' : ''}`}
                onClick={() => nav(item.href)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="qnav-item-badge">
                  <img src={item.logo} alt="" className="qnav-item-img" />
                </span>
                <span className="qnav-item-name">{item.label}</span>
                {external && <span className="qnav-item-ext" aria-hidden="true">↗</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
