import { useEffect, useRef } from 'react';
import { scrollMax } from '../lib/scrollMetrics';

export function useScrollProgress() {
  const progress = useRef(0);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const target = { value: 0 };

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = scrollMax(); // cached; no per-scroll reflow
      target.value = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      if (!isMobile) progress.current = target.value;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    progress.current = target.value;

    let rafId = 0;
    if (isMobile) {
      const tick = () => {
        const diff = target.value - progress.current;
        if (Math.abs(diff) > 0.0001) {
          progress.current += diff * 0.25;
        } else {
          progress.current = target.value;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return progress;
}
