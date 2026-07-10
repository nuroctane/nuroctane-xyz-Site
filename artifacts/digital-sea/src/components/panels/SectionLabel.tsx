import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Mode } from '../../types';
import { PROJECT_THRESHOLD } from '../../data/nodes';

interface Props {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
}

export function SectionLabel({ scrollProgress, mode }: Props) {
  const ref     = useRef<HTMLDivElement>(null);
  // Cache the inner span so onScroll never pays for a DOM query.
  const textRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const onScroll = () => {
      const el     = ref.current;
      const textEl = textRef.current;
      if (!el || !textEl) return;

      const t = scrollProgress.current;

      if (modeRef.current === 'blog') {
        textEl.textContent = 'SYS://WRITINGS';
        el.style.opacity   = t < 0.025 || t > 0.97 ? '0' : '1';
        return;
      }

      const next = t >= PROJECT_THRESHOLD ? 'SYS://CREATIVE_PROJECTS' : 'SYS://SOCIAL_LINKS';
      if (textEl.textContent !== next) {
        el.style.opacity = '0';
        setTimeout(() => {
          textEl.textContent = next;
          el.style.opacity   = t < 0.025 || t > 0.97 ? '0' : '1';
        }, 180);
      } else {
        el.style.opacity = t < 0.025 || t > 0.97 ? '0' : '1';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollProgress]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (mode !== 'scroll') {
      el.style.opacity = '0';
    }
  }, [mode]);

  return (
    <div ref={ref} className="sticky-section-label" style={{ opacity: 0 }}>
      <span ref={textRef} className="label-text">SYS://SOCIAL_LINKS</span>
    </div>
  );
}
