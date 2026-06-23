import { useEffect, useRef } from 'react';
import type { Mode } from '../../types';

interface Props {
  mode: Mode;
}

export function EndPanel({ mode }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (mode === 'camera') {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }
  }, [mode]);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t = total > 0 ? window.scrollY / total : 0;
      let op = 0;
      if (t >= 0.963 && t < 0.975) op = (t - 0.963) / 0.012;
      else if (t >= 0.975) op = 1;
      el.style.opacity = String(Math.max(0, Math.min(1, op)));
      el.style.pointerEvents = op > 0 ? 'auto' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="summary-panel end-panel" style={{ opacity: 0, pointerEvents: 'none' }}>
      <img src="/assets/nodes/nuroctane-animated-avatar.gif" alt="nuroctane" className="summary-avatar" />
      <div className="summary-label">SYS://END_OF_SEA</div>
      <p className="summary-text">
        I am <strong>&ldquo;nuroctane&rdquo;</strong> or <em>&ldquo;nur&rdquo;</em> for short.
        I was inspired to create my name from the Arabic word for <em>light</em>.
        I love cars, technology and philosophy.
        Cosmic, multifaceted being yada yada.
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
