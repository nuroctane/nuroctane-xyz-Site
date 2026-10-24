/* CONTRACT-GUARDED FILE.
 * GET/DELETE /api/admin/session is asserted by scripts/src/smoke.ts.
 *
 * Pages ask here whether this browser holds an admin session (the cookie is
 * httpOnly, so they cannot look), and end it here when admin mode is turned
 * off. Sessions start through each surface's verifyAdmin action. */
import { Hono } from "hono";
import { endAdminSession, hasAdminSession } from "../lib/admin-session";

const router = new Hono();

router.get("/admin/session", async (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({ admin: await hasAdminSession(c.req.header("cookie")) });
});

router.delete("/admin/session", (c) => {
  endAdminSession(c);
  c.header("Cache-Control", "no-store");
  return c.json({ ok: true });
});

export default router;
