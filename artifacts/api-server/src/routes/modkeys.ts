/* CONTRACT-GUARDED FILE.
 * The response shapes and paths in this file are asserted by scripts/src/smoke.ts,
 * which runs inside the build. Changing shapes/paths without updating the smoke
 * test will fail every deploy. Do not weaken or bypass the smoke test. */
import { Hono } from "hono";
import type { Context } from "hono";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { readBody } from "../lib/body";

const router = new Hono();

const GALLERY_KEY = "modkeys:gallery";
const MAX_ENTRIES = 100;
const MAX_SNAP_JSON_SIZE = 20 * 1024; // 20KB

/* Same secret as the books page admin mode (BOOKS_ADMIN_PASSWORD).
   MODKEYS_ADMIN_PASSWORD kept as fallback for older env configs / smoke.
   Read lazily — see the note in books.ts. */
const adminPassword = (): string =>
  process.env.BOOKS_ADMIN_PASSWORD || process.env.MODKEYS_ADMIN_PASSWORD || "";

interface GalleryEntry {
  id: string;
  name: string;
  snap: Record<string, unknown>;
  layout: string;
  createdAt: string;
}

interface GalleryBody {
  action?: string;
  password?: string;
  id?: string;
  name?: string;
  snap?: Record<string, unknown>;
}

function extractLayout(snap: Record<string, unknown>): string {
  return (snap.layout as string) ?? "75";
}

function stripImageData(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) stripImageData(item);
  } else if (obj && typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    for (const key of Object.keys(o)) {
      if (key === "imageData") {
        delete o[key];
      } else {
        stripImageData(o[key]);
      }
    }
  }
}

function sanitizeName(name: unknown): string {
  if (typeof name !== "string") return "Untitled";
  return name.replace(/<[^>]*>/g, "").slice(0, 40);
}

function checkAdmin(password: unknown): "ok" | "unset" | "bad" {
  const ADMIN_PASSWORD = adminPassword();
  if (!ADMIN_PASSWORD) return "unset";
  if (password === ADMIN_PASSWORD) return "ok";
  return "bad";
}

async function handleVerifyAdmin(c: Context, body: GalleryBody) {
  try {
    const status = checkAdmin(body?.password);
    if (status === "unset") {
      return c.json({ error: "Admin password not configured" }, 500);
    }
    if (status === "ok") return c.json({ ok: true });
    return c.json({ error: "Unauthorized" }, 403);
  } catch (err) {
    logger.error({ err }, "Failed to verify gallery admin");
    return c.json({ error: "Internal server error" }, 500);
  }
}

async function handleRename(c: Context, body: GalleryBody) {
  try {
    const { password, id, name } = body ?? {};
    const status = checkAdmin(password);
    if (status !== "ok") {
      return c.json(
        { error: status === "unset" ? "Admin password not configured" : "Unauthorized" },
        status === "unset" ? 500 : 403,
      );
    }
    if (!id || typeof id !== "string") {
      return c.json({ error: "Missing id" }, 400);
    }
    if (typeof name !== "string" || !name.trim()) {
      return c.json({ error: "Missing name" }, 400);
    }
    const clean = sanitizeName(name);

    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    const idx = gallery.findIndex((e) => e.id === id);
    if (idx < 0) return c.json({ error: "Entry not found" }, 404);
    gallery[idx] = { ...gallery[idx], name: clean };
    await kvSet(GALLERY_KEY, gallery);
    return c.json({ ok: true, template: { id: gallery[idx].id, name: gallery[idx].name } });
  } catch (err) {
    logger.error({ err }, "Failed to rename gallery entry");
    return c.json({ error: "Failed to rename" }, 500);
  }
}

async function handleDelete(c: Context, body: GalleryBody) {
  try {
    const { password, id } = body ?? {};
    const status = checkAdmin(password);
    if (status !== "ok") {
      return c.json(
        { error: status === "unset" ? "Admin password not configured" : "Unauthorized" },
        status === "unset" ? 500 : 403,
      );
    }
    if (!id || typeof id !== "string") {
      return c.json({ error: "Missing id" }, 400);
    }

    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    const filtered = gallery.filter((e) => e.id !== id);
    if (filtered.length === gallery.length) {
      return c.json({ error: "Entry not found" }, 404);
    }
    await kvSet(GALLERY_KEY, filtered);
    return c.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete gallery entry");
    return c.json({ error: "Failed to delete" }, 500);
  }
}

async function handleCreate(c: Context, body: GalleryBody) {
  try {
    const { name, snap } = body ?? {};
    if (!snap || typeof snap !== "object") {
      return c.json({ error: "Missing snap" }, 400);
    }

    // Strip imageData to keep KV small
    const cleanSnap = JSON.parse(JSON.stringify(snap));
    stripImageData(cleanSnap);

    const snapJson = JSON.stringify(cleanSnap);
    if (snapJson.length > MAX_SNAP_JSON_SIZE) {
      return c.json({ error: "Snap too large" }, 413);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const entry: GalleryEntry = {
      id,
      name: sanitizeName(name),
      snap: cleanSnap,
      layout: extractLayout(cleanSnap),
      createdAt: now,
    };

    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    gallery.unshift(entry);
    if (gallery.length > MAX_ENTRIES) {
      gallery.length = MAX_ENTRIES;
    }
    await kvSet(GALLERY_KEY, gallery);

    return c.json(
      {
        template: {
          id: entry.id,
          name: entry.name,
          layout: entry.layout,
          createdAt: entry.createdAt,
        },
      },
      201,
    );
  } catch (err) {
    logger.error({ err }, "Failed to save gallery entry");
    return c.json({ error: "Failed to save gallery entry" }, 500);
  }
}

router.get("/modkeys/gallery", async (c) => {
  try {
    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    const templates = gallery.map(({ id, name, snap, layout, createdAt }) => ({
      id, name, snap, layout, createdAt,
    }));
    c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return c.json({ templates });
  } catch (err) {
    logger.error({ err }, "Failed to get gallery");
    return c.json({ error: "Failed to get gallery" }, 500);
  }
});

/*
 * On Vercel, api/modkeys/[[...slug]] only reached Express for ONE path segment
 * after /api/modkeys, so the multi-segment forms below returned NOT_FOUND from
 * the filesystem router before any application code ran. Workers has no
 * filesystem routing — every route registered here is genuinely reachable, so
 * the multi-segment aliases now work in production as well as in the smoke test.
 */
router.post("/modkeys/gallery", async (c) => {
  const body = await readBody<GalleryBody>(c);
  const action = body?.action;
  if (action === "verifyAdmin") return handleVerifyAdmin(c, body);
  if (action === "rename") return handleRename(c, body);
  if (action === "delete") return handleDelete(c, body);
  return handleCreate(c, body);
});

/* Single-segment aliases */
router.post("/modkeys/verify-admin", async (c) => handleVerifyAdmin(c, await readBody<GalleryBody>(c)));
router.post("/modkeys/rename", async (c) => handleRename(c, await readBody<GalleryBody>(c)));
router.post("/modkeys/delete", async (c) => handleDelete(c, await readBody<GalleryBody>(c)));

/* Multi-segment forms */
router.post("/modkeys/gallery/verify-admin", async (c) => handleVerifyAdmin(c, await readBody<GalleryBody>(c)));
router.post("/modkeys/gallery/rename", async (c) => handleRename(c, await readBody<GalleryBody>(c)));
router.post("/modkeys/gallery/delete", async (c) => handleDelete(c, await readBody<GalleryBody>(c)));

export default router;
