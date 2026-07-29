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
 */
import posthog from 'posthog-js';

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

let ready = false;

export function initPostHog(): void {
  if (ready || !KEY || typeof window === 'undefined') return;

  posthog.init(KEY, {
    api_host: HOST,
    // Pageviews are reported by hand from the resolved wouter route.
    capture_pageview: false,
    // The site fires a curated set of events via trackEvent(); autocapture would
    // duplicate them and burn free-tier volume on noise.
    autocapture: false,
    // Core Web Vitals as $web_vitals — this is what replaces Speed Insights.
    capture_performance: true,
    // No user accounts outside the modkeys GitHub login, so don't build person
    // profiles for anonymous visitors: anonymous events are billed far cheaper.
    person_profiles: 'identified_only',
    defaults: '2025-05-24',
  });
  ready = true;

  window.__nurTrack = (name, properties) => {
    posthog.capture(name, properties);
  };

  const queued = window.__nurTrackQueue ?? [];
  window.__nurTrackQueue = [];
  for (const [name, properties] of queued) window.__nurTrack(name, properties);
}

export function capturePageview(path: string, route: string): void {
  if (!ready) return;
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
  const url = `${origin.replace(/\/+$/, '')}${path === '/' ? '/' : path}`;

  // `route` as a super property attaches to every subsequent event, including
  // PostHog's own $web_vitals. That is what the old SpeedInsights setRoute()
  // did; without it, all vitals would collapse onto a single URL.
  posthog.register({ route });

  posthog.capture('$pageview', {
    $current_url: url,
    $pathname: path,
    route,
  });
}
