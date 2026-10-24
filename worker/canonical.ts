/**
 * One canonical host. Every canonical link and og:url names www, so the apex
 * redirects there instead of serving a second copy of the site.
 *
 * The GitHub OAuth app is registered with the apex callback (see SITE_ORIGIN in
 * artifacts/api-server/src/routes/auth.ts), and the sign-in start sets its
 * one-time state cookie on that same host, so both stay on the apex. Drop them
 * from AUTH_ON_APEX once the OAuth app and SITE_ORIGIN move to www.
 */
export const CANONICAL_HOST = "www.nuroctane.xyz";
const APEX_HOST = "nuroctane.xyz";
const AUTH_ON_APEX = new Set(["/api/auth/github", "/api/auth/github/callback"]);

/** The redirect to www for an apex request, or null to serve it here. */
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== APEX_HOST || AUTH_ON_APEX.has(url.pathname)) return null;
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  // 301 turns a POST into a GET; 308 keeps the method and body for API writes.
  const method = request.method;
  return Response.redirect(url.toString(), method === "GET" || method === "HEAD" ? 301 : 308);
}
