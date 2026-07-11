/**
 * Marks intentional in-app navigations (QuickNav, portals, deep-link load)
 * so App can scroll to a section. Passive analytics URL replaces must NOT set
 * this — they only mirror scroll position and must never re-drive the camera.
 */
let intent = false;

export function markNavigationIntent(): void {
  intent = true;
}

export function consumeNavigationIntent(): boolean {
  if (!intent) return false;
  intent = false;
  return true;
}

export function peekNavigationIntent(): boolean {
  return intent;
}
