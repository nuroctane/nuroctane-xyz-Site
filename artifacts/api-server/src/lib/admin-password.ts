/**
 * Admin mode is shared by Books and Modkeys. BOOKS_ADMIN_PASSWORD is the
 * canonical binding; MODKEYS_ADMIN_PASSWORD remains a supported alias for
 * older deployments and dashboard configurations.
 *
 * Read lazily inside the request lifecycle. Cloudflare Workers exposes secret
 * bindings through process.env when nodejs_compat is enabled.
 */
function configuredAdminPasswords(): string[] {
  return [
    process.env.BOOKS_ADMIN_PASSWORD,
    process.env.MODKEYS_ADMIN_PASSWORD,
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index,
  );
}

export type AdminPasswordStatus = "ok" | "unset" | "bad";

export function checkAdminPassword(candidate: unknown): AdminPasswordStatus {
  const passwords = configuredAdminPasswords();
  if (passwords.length === 0) return "unset";
  if (typeof candidate === "string" && passwords.includes(candidate)) return "ok";
  return "bad";
}
