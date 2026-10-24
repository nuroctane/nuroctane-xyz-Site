/**
 * Admin mode is shared by Books and Modkeys. BOOKS_ADMIN_PASSWORD is the
 * canonical binding; MODKEYS_ADMIN_PASSWORD remains a supported alias for
 * older deployments and dashboard configurations.
 *
 * Read lazily inside the request lifecycle. Cloudflare Workers exposes secret
 * bindings through process.env when nodejs_compat is enabled.
 */
export function configuredAdminPasswords(): string[] {
  return [
    process.env.BOOKS_ADMIN_PASSWORD,
    process.env.MODKEYS_ADMIN_PASSWORD,
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index,
  );
}

export type AdminPasswordStatus = "ok" | "unset" | "bad";

/** Compares every character of both strings, so the time taken does not
 * reveal how much of a guess was right. */
function sameString(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function checkAdminPassword(candidate: unknown): AdminPasswordStatus {
  const passwords = configuredAdminPasswords();
  if (passwords.length === 0) return "unset";
  if (typeof candidate !== "string") return "bad";
  // Check every configured password (no early exit) before answering.
  let match = false;
  for (const password of passwords) match = sameString(candidate, password) || match;
  return match ? "ok" : "bad";
}
