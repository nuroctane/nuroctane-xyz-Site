import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const PROJECT_THRESHOLD = 0.62;

interface Props {
  scrollProgress: MutableRefObject<number>;
}

export function SectionLabel({ scrollProgress }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const t = scrollProgress.current;
      const textEl = el.querySelector('.label-text') as HTMLElement;
      if (!textEl) return;
      const next = t >= PROJECT_THRESHOLD ? 'SYS://CREATIVE_PROJECTS' : 'SOC://SOCIAL_LINKS';
      if (textEl.textContent !== next) {
        el.style.opacity = '0';
        setTimeout(() => {
          textEl.textContent = next;
          el.style.opacity = t < 0.025 || t > 0.97 ? '0' : '1';
        }, 180);
      } else {
        el.style.opacity = t < 0.025 || t > 0.97 ? '0' : '1';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollProgress]);

  return (
    <div ref={ref} className="sticky-section-label" style={{ opacity: 0 }}>
      <span className="label-text">SOC://SOCIAL_LINKS</span>
    </div>
  );
}
