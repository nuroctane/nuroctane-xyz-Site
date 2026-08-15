/* CONTRACT-GUARDED FILE.
 * GET/POST /api/curriculum is asserted by scripts/src/smoke.ts. */
import { Hono } from "hono";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { readBody } from "../lib/body";
import { checkAdminPassword } from "../lib/admin-password";

const router = new Hono();
const CHECKS_KEY = "curriculum-checks";
const KEY_PATTERN = /^\d{2}-\d+$/;

function asChecks(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [key, checked] of Object.entries(value as Record<string, unknown>)) {
    if (KEY_PATTERN.test(key) && checked === true) out[key] = true;
  }
  return out;
}

router.get("/curriculum", async (c) => {
  try {
    const checks = asChecks(await kvGet<Record<string, boolean>>(CHECKS_KEY));
    c.header("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
    return c.json({ checks });
  } catch (err) {
    logger.error({ err }, "Failed to get curriculum checks");
    return c.json({ error: "Failed to get curriculum" }, 500);
  }
});

router.post("/curriculum", async (c) => {
  try {
    const body = await readBody<{
      action?: string;
      password?: string;
      key?: string;
      checked?: boolean;
    }>(c);
    const { action } = body;

    if (action === "verifyAdmin") {
      const status = checkAdminPassword(body.password);
      if (status === "unset") return c.json({ error: "Admin password not configured" }, 500);
      if (status === "ok") return c.json({ ok: true });
      return c.json({ error: "Unauthorized" }, 403);
    }

    const admin = checkAdminPassword(body.password);
    if (admin === "unset") return c.json({ error: "Admin password not configured" }, 500);
    if (admin !== "ok") return c.json({ error: "Unauthorized" }, 403);

    if (action === "toggle") {
      const key = typeof body.key === "string" ? body.key : "";
      if (!KEY_PATTERN.test(key)) return c.json({ error: "Invalid check key" }, 400);
      const checks = asChecks(await kvGet<Record<string, boolean>>(CHECKS_KEY));
      if (body.checked === true) checks[key] = true;
      else delete checks[key];
      await kvSet(CHECKS_KEY, checks);
      return c.json({ ok: true, checks });
    }

    if (action === "reset") {
      await kvSet(CHECKS_KEY, {});
      return c.json({ ok: true, checks: {} });
    }

    return c.json({ error: "Unknown action" }, 400);
  } catch (err) {
    logger.error({ err }, "Failed to update curriculum checks");
    return c.json({ error: "Failed to update curriculum" }, 500);
  }
});

export default router;
