/**
 * Marks intentional in-app navigations (QuickNav, portals, deep-link load)
 * so App can scroll to a section. Passive analytics URL replaces must NOT set
 * this — they only mirror scroll position and must never re-drive the camera.
 *
 * Intent carries a TTL: if a marked navigation targets the path the user is
 * already on, wouter never changes location, the routing effect never runs,
 * and the flag would otherwise linger armed. The NEXT passive mirror replace
 * (e.g. swimming across the socials/projects boundary) would then consume the
 * stale intent and scroll the user to a section start — resurrecting the
 * exact snap-back this module exists to prevent. Expiring intents after
 * INTENT_TTL_MS makes stale flags harmless.
 */
const INTENT_TTL_MS = 1500;

let intentAt = 0;

export function markNavigationIntent(): void {
  intentAt = performance.now();
}

export function consumeNavigationIntent(): boolean {
  const fresh = intentAt > 0 && performance.now() - intentAt < INTENT_TTL_MS;
  intentAt = 0;
  return fresh;
}

export function peekNavigationIntent(): boolean {
  return intentAt > 0 && performance.now() - intentAt < INTENT_TTL_MS;
}
