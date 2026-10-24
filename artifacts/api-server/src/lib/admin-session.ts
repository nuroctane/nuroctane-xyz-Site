/* Admin mode is a signed, httpOnly cookie. verifyAdmin checks the password once
 * and issues it; every admin write then checks the cookie, so no page keeps the
 * password. A password in the body still works (scripts and the smoke test
 * send one), and still counts against the per-IP admin limit.
 *
 * The cookie is SameSite=Strict and scoped to /api, so another site cannot
 * ride it into a write and page scripts cannot read it. The Worker's
 * /api/books route checks it too (worker/books.ts), from the raw header.
 */
import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { checkAdminPassword, configuredAdminPasswords, type AdminPasswordStatus } from "./admin-password";
import { ADMIN_TTL_SECONDS, signAdminSession, verifyAdminSession } from "./jwt";
import { logger } from "./logger";

export const ADMIN_COOKIE = "nur_admin";
const COOKIE_PATH = "/api";

/** A short digest of the configured passwords. Changing a password changes it,
 * which ends every admin session issued under the old one. */
async function adminStamp(): Promise<string> {
  const passwords = configuredAdminPasswords();
  if (passwords.length === 0) return "";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`nuroctane-admin:${[...passwords].sort().join("\u0000")}`),
  );
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function readCookie(header: string | null | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim() || undefined;
  }
  return undefined;
}

/** True when the request carries a live admin session cookie. */
export async function hasAdminSession(cookieHeader: string | null | undefined): Promise<boolean> {
  const token = readCookie(cookieHeader, ADMIN_COOKIE);
  if (!token) return false;
  return verifyAdminSession(token, await adminStamp());
}

/** "ok" for a session cookie or a correct password; else why not. */
export async function adminStatus(c: Context, password?: unknown): Promise<AdminPasswordStatus> {
  if (await hasAdminSession(c.req.header("cookie"))) return "ok";
  if (typeof password === "string" && password) return checkAdminPassword(password);
  return configuredAdminPasswords().length === 0 ? "unset" : "bad";
}

/** The verifyAdmin action shared by Books, Modkeys and Curriculum. */
export async function verifyAdmin(c: Context, password: unknown): Promise<Response> {
  const status = checkAdminPassword(password);
  if (status === "unset") return c.json({ error: "Admin password not configured" }, 500);
  if (status !== "ok") return c.json({ error: "Unauthorized" }, 403);
  let token: string;
  try {
    token = await signAdminSession(await adminStamp());
  } catch (err) {
    logger.error({ err }, "Cannot sign an admin session");
    return c.json({ error: "Admin sessions are not configured" }, 500);
  }
  setCookie(c, ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: COOKIE_PATH,
    maxAge: ADMIN_TTL_SECONDS,
  });
  c.header("Cache-Control", "no-store");
  return c.json({ ok: true });
}

export function endAdminSession(c: Context): void {
  deleteCookie(c, ADMIN_COOKIE, { path: COOKIE_PATH, secure: true, httpOnly: true, sameSite: "Strict" });
}
