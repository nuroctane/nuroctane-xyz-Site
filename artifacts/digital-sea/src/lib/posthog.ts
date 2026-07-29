/**
 * PostHog wiring for nuroctane.xyz.
 *
 * Replaces @vercel/analytics + @vercel/speed-insights, which post to
 * /_vercel/insights/* and stop collecting the moment the site is not served by
 * Vercel.
 *
 * The old integration needed two `beforeSend` hooks to rewrite the reported URL
 * onto the resolved SPA route. That is unnecessary here: capturePageview() is
 * handed the already-resolved path from resolveAnalytics(), so the correct URL
 * is reported in the first place.
 *
 * posthog-js is loaded with a dynamic import so it lands in its own chunk rather
 * than the entry bundle — it is ~65 kB gzipped, against the ~1 kB beacon Vercel
 * Analytics used. Captures issued before it resolves are queued.
 */

type PostHog = (typeof import('posthog-js'))['default'];

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

declare global {
  interface Window {
    /** Installed once PostHog is live; see trackEvent() in ./analytics. */
    __nurTrack?: (name: string, properties?: Record<string, unknown>) => void;
    /** Events fired before init — drained on init, mirroring the old `vaq`. */
    __nurTrackQueue?: Array<[string, Record<string, unknown> | undefined]>;
  }
}

let ph: PostHog | null = null;
let loading = false;
/** Captures issued before the library resolved; drained on load. */
const pending: Array<(p: PostHog) => void> = [];

function withPostHog(fn: (p: PostHog) => void): void {
  if (ph) {
    fn(ph);
    return;
  }
  // Only queue if a key is configured — otherwise this would grow forever.
  if (KEY) pending.push(fn);
}

export function initPostHog(): void {
  if (loading || ph || !KEY || typeof window === 'undefined') return;
  loading = true;

  // Not awaited: React must not block render on a network fetch.
  void (async () => {
    try {
      const { default: p } = await import('posthog-js');
      p.init(KEY, {
        api_host: HOST,
        // Pageviews are reported by hand from the resolved wouter route.
        capture_pageview: false,
        // The site fires a curated set of events via trackEvent(); autocapture
        // would duplicate them and burn free-tier volume on noise.
        autocapture: false,
        // Core Web Vitals as $web_vitals — this replaces Speed Insights.
        capture_performance: true,
        // No user accounts outside the modkeys GitHub login, so don't build
        // person profiles for anonymous visitors: they are billed far cheaper.
        person_profiles: 'identified_only',
        defaults: '2025-05-24',
      });
      ph = p;

      window.__nurTrack = (name, properties) => {
        p.capture(name, properties);
      };

      for (const fn of pending.splice(0)) fn(p);

      // Drain events queued by trackEvent() in ./analytics and by modkeys'
      // core/analytics.js, both of which push here before __nurTrack exists.
      const queued = window.__nurTrackQueue ?? [];
      window.__nurTrackQueue = [];
      for (const [name, properties] of queued) p.capture(name, properties);
    } catch {
      // Analytics must never break the UI, and must not leak a growing queue.
      pending.length = 0;
      window.__nurTrackQueue = [];
    }
  })();
}

export function capturePageview(path: string, route: string): void {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
  // Resolved now rather than inside the callback so a queued pageview keeps the
  // path it was fired with.
  const url = `${origin.replace(/\/+$/, '')}${path === '/' ? '/' : path}`;

  withPostHog((p) => {
    // `route` as a super property attaches to every subsequent event, including
    // PostHog's own $web_vitals. That is what the old SpeedInsights setRoute()
    // did; without it, all vitals would collapse onto a single URL.
    p.register({ route });
    p.capture('$pageview', {
      $current_url: url,
      $pathname: path,
      route,
    });
  });
}
