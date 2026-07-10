import { useEffect, useRef } from 'react';
import type { Mode } from '../../types';
import { trackEvent } from '../../lib/analytics';

interface Props {
  mode:         Mode;
  finUnlocked:  boolean;
}

export function EndPanel({ mode, finUnlocked }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;

      // Never shown in camera mode or before FIN is clicked.
      if (mode === 'camera' || !finUnlocked) {
        el.style.opacity       = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t     = total > 0 ? window.scrollY / total : 0;

      let op = 0;
      if (mode === 'blog') {
        // Blog track: fade in as user approaches the FIN portal (t ≈ 0.97).
        // Fade out as they scroll back — so scrolling up feels natural.
        if (t >= 0.94 && t < 0.96)  op = (t - 0.94) / 0.02;
        else if (t >= 0.96)          op = 1;
      } else {
        // Main track: fade in near the very bottom of the page.
        if (t >= 0.963 && t < 0.975) op = (t - 0.963) / 0.012;
        else if (t >= 0.975)         op = 1;
      }

      el.style.opacity       = String(Math.max(0, Math.min(1, op)));
      el.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [mode, finUnlocked]);

  return (
    <div ref={ref} className="summary-panel end-panel" style={{ opacity: 0, pointerEvents: 'none' }}>
      <a
        href="https://cal.com/nuroctane/meeting-nuroctane"
        target="_blank"
        rel="noopener noreferrer"
        className="summary-cal-link"
        aria-label="Book a meeting"
        onClick={() => trackEvent('Booking Click', { surface: 'end' })}
      >
        <svg viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="5" y1="1.5" x2="5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="11" y1="1.5" x2="11" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </a>
      <img src="/assets/nodes/nuroctane-animated-avatar.gif" alt="nuroctane" className="summary-avatar" />
      <div className="summary-label">SYS://END_OF_SEA</div>
      <p className="summary-text">
        I am <strong>&ldquo;nuroctane&rdquo;</strong> or <em>&ldquo;nur&rdquo;</em> for short.
        I was inspired to create my name from the Arabic word for <em>light</em>.
        I love cars, technology, MMA and philosophy.
      </p>
      <p className="summary-text summary-text--secondary">
        This is a small digital sea/library of all my profiles and works,
        from writings to clubs, socials, projects, media and initiatives.
        Peruse, enjoy and inquire.
      </p>
      <p className="end-thankyou">Thank you for visiting.</p>
    </div>
  );
}
