import { Router } from "express";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";

const router = Router();

const GALLERY_KEY = "modkeys:gallery";
const MAX_ENTRIES = 100;
const ADMIN_PASSWORD = process.env.MODKEYS_ADMIN_PASSWORD ?? "";

interface GalleryEntry {
  id: string;
  name: string;
  snap: Record<string, unknown>;
  layout: string;
  createdAt: string;
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

const MAX_SNAP_JSON_SIZE = 20 * 1024; // 20KB

router.get("/modkeys/gallery", async (_req, res) => {
  try {
    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    const templates = gallery.map(({ id, name, snap, layout, createdAt }) => ({
      id, name, layout, createdAt,
    }));
    return res.json({ templates });
  } catch (err) {
    logger.error({ err }, "Failed to get gallery");
    return res.status(500).json({ error: "Failed to get gallery" });
  }
});

router.post("/modkeys/gallery", async (req, res) => {
  try {
    const { name, snap } = req.body;
    if (!snap || typeof snap !== "object") {
      return res.status(400).json({ error: "Missing snap" });
    }

    // Strip imageData to keep KV small
    const cleanSnap = JSON.parse(JSON.stringify(snap));
    stripImageData(cleanSnap);

    const snapJson = JSON.stringify(cleanSnap);
    if (snapJson.length > MAX_SNAP_JSON_SIZE) {
      return res.status(413).json({ error: "Snap too large" });
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

    return res.status(201).json({ template: { id: entry.id, name: entry.name, layout: entry.layout, createdAt: entry.createdAt } });
  } catch (err) {
    logger.error({ err }, "Failed to save gallery entry");
    return res.status(500).json({ error: "Failed to save gallery entry" });
  }
});

router.post("/modkeys/gallery/delete", async (req, res) => {
  try {
    const { password, id } = req.body;
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing id" });
    }

    const gallery = (await kvGet<GalleryEntry[]>(GALLERY_KEY)) ?? [];
    const filtered = gallery.filter((e) => e.id !== id);
    if (filtered.length === gallery.length) {
      return res.status(404).json({ error: "Entry not found" });
    }
    await kvSet(GALLERY_KEY, filtered);
    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete gallery entry");
    return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
