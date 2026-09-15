/**
 * Route and product-event analytics helpers for the Digital Sea SPA.
 *
 * Pageviews are attributed by the PostHog Telemetry component in main.tsx.
 * Use trackEvent for product interactions (modkeys also uses the same shim).
 */

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/** Canonical top-level SPA surfaces reported in analytics. */
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
  '/curriculum',
  '/observatory',
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
 * Map a browser location to the concrete PostHog path and grouping route.
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
    case 'curriculum':
      return { path: '/curriculum', route: '/curriculum' };
    case 'observatory':
      return { path: '/observatory', route: '/observatory' };
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

/** Build an absolute analytics URL. */
export function absoluteAnalyticsUrl(path: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base.replace(/\/+$/, '')}${p === '/' ? '/' : p}`;
}

/**
 * Fire a custom event. Queues until PostHog is ready (same pattern as modkeys).
 * window.__nurTrack is installed by initPostHog() in ./posthog.
 */
export function trackEvent(name: string, properties?: AnalyticsProps): void {
  try {
    if (typeof window === 'undefined' || !name) return;
    const data = properties && typeof properties === 'object' ? properties : undefined;
    if (typeof window.__nurTrack === 'function') {
      window.__nurTrack(name, data as Record<string, unknown> | undefined);
      return;
    }
    window.__nurTrackQueue = window.__nurTrackQueue || [];
    window.__nurTrackQueue.push([name, data as Record<string, unknown> | undefined]);
  } catch {
    /* analytics must never break the UI */
  }
}
