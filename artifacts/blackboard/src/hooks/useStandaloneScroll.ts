import { useEffect } from 'react';

/**
 * Forces normal webpage scrolling on standalone pages (quotes, books, resume).
 * Adds a class to <html> that overrides the global overflow/overscroll rules
 * designed for the 3D experience. Removes it on unmount so the 3D scene
 * still works when navigated back.
 */
export function useStandaloneScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;

    html.classList.add('standalone-active');
    html.style.overflow = '';
    body.style.overflow = '';
    body.style.height = '';

    return () => {
      html.classList.remove('standalone-active');
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);
}
