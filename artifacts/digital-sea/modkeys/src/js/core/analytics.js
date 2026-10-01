/**
 * Optional product analytics. Still no hard dependency on any analytics package.
 *
 * lib/posthog.ts installs window.__nurTrack once PostHog is live and drains
 * __nurTrackQueue in the Cloudflare-hosted SPA.
 * Elsewhere (local, offline) this is a silent no-op.
 */

/**
 * @param {string} name  Event name (e.g. 'Modkeys Export')
 * @param {Record<string, string | number | boolean | null | undefined>} [properties]
 */
export function trackEvent(name, properties) {
  try {
    if (typeof window === 'undefined' || !name) return;
    const data = properties && typeof properties === 'object' ? properties : undefined;

    if (typeof window.__nurTrack === 'function') {
      window.__nurTrack(name, data);
      return;
    }
    // Queue until PostHog finishes loading.
    window.__nurTrackQueue = window.__nurTrackQueue || [];
    window.__nurTrackQueue.push([name, data]);
  } catch {
    /* analytics must never break the configurator */
  }
}
