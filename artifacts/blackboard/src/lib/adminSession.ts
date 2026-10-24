/**
 * Admin mode (Ctrl+Shift+A on Books, shared with Modkeys and the curriculum).
 * verifyAdmin sets an httpOnly session cookie scoped to /api, so writes need no
 * password and the page never stores one. The page keeps only the `book-admin`
 * flag, and asks /api/admin/session whether the cookie is still live.
 */
const ADMIN_KEY = 'book-admin';

// Older builds kept the password itself here; clear any copy a tab still holds.
try { sessionStorage.removeItem('book-admin-pw'); } catch { /* storage blocked */ }

export function storedAdmin(): boolean {
  try { return sessionStorage.getItem(ADMIN_KEY) === '1'; } catch { return false; }
}

/** Records admin mode on or off; off also ends the server session. */
export function rememberAdmin(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(ADMIN_KEY, '1');
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch { /* storage blocked: admin lasts for this page only */ }
  if (!on) fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
}

/** False once the cookie has expired or the password changed; true on a network
 * error, so a flaky connection does not drop admin mode. */
export async function confirmAdmin(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/session', { cache: 'no-store' });
    if (!response.ok) return true;
    const data = await response.json() as { admin?: boolean };
    if (data.admin === false) {
      try { sessionStorage.removeItem(ADMIN_KEY); } catch { /* storage blocked */ }
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
