/* CONTRACT-GUARDED FILE.
 * The response shapes and paths in this file are asserted by scripts/src/smoke.ts,
 * which runs inside the Vercel buildCommand. Changing shapes/paths without updating
 * the smoke test will fail every deploy. Do not weaken or bypass the smoke test. */
import { Router } from "express";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";

const router = Router();

const BOOKS_KEY = "visitor-books";
const OVERRIDES_KEY = "read-overrides";
const ADMIN_PASSWORD = process.env.BOOKS_ADMIN_PASSWORD ?? "";

interface Book {
  title: string;
  author?: string;
  dateAdded: string;
  read?: boolean;
  sessionId?: string;
}

router.get("/visitor-books", async (_req, res) => {
  try {
    const booksRaw = await kvGet<Book[]>(BOOKS_KEY);
    const overridesRaw = await kvGet<Record<string, boolean>>(OVERRIDES_KEY);
    const books = booksRaw ?? [];
    const overrides = overridesRaw ?? {};
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.json({ books, overrides });
  } catch (err) {
    logger.error({ err }, "Failed to get visitor books");
    return res.status(500).json({ error: "Failed to get books" });
  }
});

router.post("/visitor-books", async (req, res) => {
  try {
    const { action } = req.body;

    if (action === "verifyAdmin") {
      if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Admin password not configured" });
      const { password } = req.body;
      if (password === ADMIN_PASSWORD) return res.json({ ok: true });
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (action === "add") {
      const { book } = req.body;
      if (!book || !book.title) return res.status(400).json({ error: "Missing book title" });
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      books.push(book);
      await kvSet(BOOKS_KEY, books);
      return res.json({ ok: true });
    }

    if (action === "delete") {
      const { password, book, sessionId } = req.body;
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      let idx = -1;

      if (sessionId) {
        // Owner delete via sessionId (no password required)
        idx = books.findIndex(
          (b) => b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded && b.sessionId === sessionId,
        );
        if (idx >= 0) {
          books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          return res.json({ ok: true });
        }
      }

      if (password) {
        // Admin delete via password
        if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Admin password not configured" });
        if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Unauthorized" });
        idx = books.findIndex(
          (b) => b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded,
        );
        if (idx >= 0) {
          books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          return res.json({ ok: true });
        }
      }

      return res.status(404).json({ error: "Book not found or unauthorized" });
    }

    if (action === "toggleVisitorRead") {
      const { password, book } = req.body;
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      const idx = books.findIndex(
        (b) => b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded,
      );
      if (idx >= 0) {
        const stored = books[idx] as any;
        const isOwner = stored.sessionId && stored.sessionId === req.body.sessionId;
        const noOwner = !stored.sessionId;
        if (!noOwner && !isOwner && (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD)) return res.status(403).json({ error: "Unauthorized" });
        books[idx].read = !books[idx].read;
        await kvSet(BOOKS_KEY, books);
      }
      return res.json({ ok: true });
    }

    if (action === "toggleCuratedRead") {
      const { password, key, read } = req.body;
      if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Unauthorized" });
      const overrides = (await kvGet<Record<string, boolean>>(OVERRIDES_KEY)) ?? {};
      overrides[key] = read;
      await kvSet(OVERRIDES_KEY, overrides);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    logger.error({ err }, "Visitor books operation failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;