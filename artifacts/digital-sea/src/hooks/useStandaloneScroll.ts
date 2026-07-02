import { useEffect } from 'react';

/**
 * Forces normal webpage scrolling on standalone pages (quotes, books, resume).
 * Resets any overflow/height manipulations left by the 3D environment and
 * restores them on unmount so the 3D experience still works when navigated back.
 */
export function useStandaloneScroll() {
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = '';
    document.body.style.overflow = 'auto';
    document.body.style.height = '';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
    };
  }, []);
}
