/**
 * Cached max scroll distance (scrollHeight - innerHeight).
 *
 * Reading document.documentElement.scrollHeight forces a synchronous layout
 * flush (reflow). Both the App scroll tick (up to 3x/event) and
 * useScrollProgress used to read it on EVERY scroll event, causing avoidable
 * reflow-driven jank mid-swim, worst on mobile. scrollHeight only changes on
 * resize or content mutation, never during a scroll, so it is cached here and
 * invalidated lazily.
 *
 * Call installScrollMetrics() once at app start to keep the cache fresh
 * against resize and DOM mutations; scrollMax() is then reflow-free per call.
 */

let cached = -1;

function recompute(): number {
  cached = document.documentElement.scrollHeight - window.innerHeight;
  return cached;
}

/** Max scrollable distance in px (>= 0). Reflow-free once installed. */
export function scrollMax(): number {
  const v = cached >= 0 ? cached : recompute();
  return v > 0 ? v : 0;
}

/** Current scroll progress 0..1, reflow-free. */
export function scrollT(): number {
  const total = scrollMax();
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / total));
}

/**
 * Keep the cache correct without reading layout during scroll. Recomputes on
 * resize (debounced to a frame) and on DOM mutations that can change document
 * height (nodes added/removed, media loading in). Returns a cleanup fn.
 */
let refs = 0;
let teardown: (() => void) | null = null;

export function installScrollMetrics(): () => void {
  refs += 1;

  if (refs === 1) {
    let raf = 0;
    const invalidate = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; recompute(); });
    };
    recompute();
    window.addEventListener('resize', invalidate);
    const mo = new MutationObserver(invalidate);
    mo.observe(document.body, { childList: true, subtree: true });
    teardown = () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', invalidate);
      mo.disconnect();
      teardown = null;
    };
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    refs -= 1;
    if (refs === 0 && teardown) {
      teardown();
    }
  };
}
