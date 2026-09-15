import { useEffect, useRef, useState } from 'react';
import { scrollMax } from '../lib/scrollMetrics';

export function useScrollProgress() {
  const progress = useRef(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const target = { value: 0 };

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = scrollMax(); // cached; no per-scroll reflow
      target.value = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      if (!isMobile) progress.current = target.value;
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);
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
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  return progress;
}
