/**
 * Optional product analytics. Still no hard dependency on any analytics package.
 *
 * Two hosts, two sinks:
 *   - SPA embed (nuroctane.xyz/modkeys, Cloudflare): lib/posthog.ts installs
 *     window.__nurTrack once PostHog is live, and drains __nurTrackQueue.
 *   - Standalone (modkeys.vercel.app, still on Vercel): the boot script in
 *     index.html calls inject() from @vercel/analytics, which defines window.va.
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
    if (typeof window.va === 'function') {
      window.va('event', data ? { name, data } : { name });
      return;
    }
    // Neither sink is up yet — queue for whichever loads first.
    window.__nurTrackQueue = window.__nurTrackQueue || [];
    window.__nurTrackQueue.push([name, data]);
  } catch {
    /* analytics must never break the configurator */
  }
}
