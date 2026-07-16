/**
 * Vercel Web Analytics helpers for the Digital Sea SPA.
 *
 * Pageviews are attributed via <Analytics path route /> in main.tsx.
 * Use trackEvent for product interactions (modkeys already has its own shim).
 */

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/** Canonical top-level SPA surfaces reported in Vercel Top Pages. */
export const ANALYTICS_TOP_ROUTES = [
  '/',
  '/socials',
  '/projects',
  '/blog',
  '/fin',
  '/quotes',
  '/books',
  '/resume',
  '/modkeys',
  '/cli',
] as const;

export type AnalyticsTopRoute = (typeof ANALYTICS_TOP_ROUTES)[number];

/** Normalize wouter location → pathname (leading slash, no trailing slash, lower). */
export function normalizePath(location: string): string {
  if (!location || location === '/') return '/';
  const withSlash = location.startsWith('/') ? location : `/${location}`;
  const trimmed = withSlash.replace(/\/+$/, '') || '/';
  // Drop query/hash if a full URL ever sneaks in
  const pathOnly = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;
  return pathOnly.toLowerCase() || '/';
}

/**
 * Map a browser location to { path, route } for Vercel Analytics.
 * `route` is the pattern (for grouping); `path` is the concrete URL path.
 */
export function resolveAnalytics(location: string): { path: string; route: string } {
  const path = normalizePath(location);
  if (path === '/') return { path: '/', route: '/' };

  const segs = path.split('/').filter(Boolean);
  const top = segs[0] ?? '';
  const rest = segs[1];

  switch (top) {
    case 'quotes':
      return { path: '/quotes', route: '/quotes' };
    case 'books':
      return { path: '/books', route: '/books' };
    case 'resume':
      return { path: '/resume', route: '/resume' };
    case 'modkeys':
      return { path: '/modkeys', route: '/modkeys' };
    case 'cli':
      return { path: '/cli', route: '/cli' };
    case 'fin':
      return { path: '/fin', route: '/fin' };
    case 'socials':
      return rest
        ? { path: `/socials/${rest}`, route: '/socials/:id' }
        : { path: '/socials', route: '/socials' };
    case 'projects':
      return rest
        ? { path: `/projects/${rest}`, route: '/projects/:id' }
        : { path: '/projects', route: '/projects' };
    case 'blog':
      return rest
        ? { path: `/blog/${rest}`, route: '/blog/:slug' }
        : { path: '/blog', route: '/blog' };
    case 'home':
    case 'sea':
    case 'identity':
      return { path: '/', route: '/' };
    default:
      // Unknown deep link — still report the concrete path so it appears in Top Pages
      return { path, route: path };
  }
}

/** Build an absolute URL for beforeSend (Vercel intake prefers absolute). */
export function absoluteAnalyticsUrl(path: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base.replace(/\/+$/, '')}${p === '/' ? '/' : p}`;
}

/**
 * Fire a custom event. Queues until the Vercel script is ready (same pattern as modkeys).
 * Prefer this over importing track() when the script may not be mounted yet.
 */
export function trackEvent(name: string, properties?: AnalyticsProps): void {
  try {
    if (typeof window === 'undefined' || !name) return;
    const data = properties && typeof properties === 'object' ? properties : undefined;
    const payload = data ? { name, data } : { name };
    if (typeof window.va === 'function') {
      window.va('event', payload);
      return;
    }
    window.vaq = window.vaq || [];
    window.vaq.push(['event', payload]);
  } catch {
    /* analytics must never break the UI */
  }
}
