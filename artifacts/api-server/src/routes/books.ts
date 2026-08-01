/* CONTRACT-GUARDED FILE.
 * The response shapes and paths in this file are asserted by scripts/src/smoke.ts,
 * which runs inside the build. Changing shapes/paths without updating the smoke
 * test will fail every deploy. Do not weaken or bypass the smoke test. */
import { Hono } from "hono";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { readBody } from "../lib/body";
import { checkAdminPassword } from "../lib/admin-password";

const router = new Hono();

const BOOKS_KEY = "visitor-books";
const OVERRIDES_KEY = "read-overrides";

interface Book {
  title: string;
  author?: string;
  dateAdded: string;
  read?: boolean;
  sessionId?: string;
}

router.get("/visitor-books", async (c) => {
  try {
    const booksRaw = await kvGet<Book[]>(BOOKS_KEY);
    const overridesRaw = await kvGet<Record<string, boolean>>(OVERRIDES_KEY);
    const books = booksRaw ?? [];
    const overrides = overridesRaw ?? {};
    c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return c.json({ books, overrides });
  } catch (err) {
    logger.error({ err }, "Failed to get visitor books");
    return c.json({ error: "Failed to get books" }, 500);
  }
});

router.post("/visitor-books", async (c) => {
  try {
    const body = await readBody<{
      action?: string;
      password?: string;
      book?: Book;
      sessionId?: string;
      key?: string;
      read?: boolean;
    }>(c);
    const { action } = body;
    if (action === "verifyAdmin") {
      const status = checkAdminPassword(body.password);
      if (status === "unset") return c.json({ error: "Admin password not configured" }, 500);
      if (status === "ok") return c.json({ ok: true });
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (action === "add") {
      const { book } = body;
      if (!book || !book.title) return c.json({ error: "Missing book title" }, 400);
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      books.push(book);
      await kvSet(BOOKS_KEY, books);
      return c.json({ ok: true });
    }

    if (action === "delete") {
      const { password, book, sessionId } = body;
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      let idx = -1;

      if (sessionId) {
        // Owner delete via sessionId (no password required)
        idx = books.findIndex(
          (b) =>
            b.title === book?.title &&
            b.author === book?.author &&
            b.dateAdded === book?.dateAdded &&
            b.sessionId === sessionId,
        );
        if (idx >= 0) {
          books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          return c.json({ ok: true });
        }
      }

      if (password) {
        // Admin delete via password
        const status = checkAdminPassword(password);
        if (status === "unset") return c.json({ error: "Admin password not configured" }, 500);
        if (status !== "ok") return c.json({ error: "Unauthorized" }, 403);
        idx = books.findIndex(
          (b) => b.title === book?.title && b.author === book?.author && b.dateAdded === book?.dateAdded,
        );
        if (idx >= 0) {
          books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          return c.json({ ok: true });
        }
      }

      return c.json({ error: "Book not found or unauthorized" }, 404);
    }

    if (action === "toggleVisitorRead") {
      const { password, book } = body;
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      const idx = books.findIndex(
        (b) => b.title === book?.title && b.author === book?.author && b.dateAdded === book?.dateAdded,
      );
      if (idx >= 0) {
        const stored = books[idx];
        const isOwner = stored.sessionId && stored.sessionId === body.sessionId;
        const noOwner = !stored.sessionId;
        if (!noOwner && !isOwner && checkAdminPassword(password) !== "ok") {
          return c.json({ error: "Unauthorized" }, 403);
        }
        books[idx].read = !books[idx].read;
        await kvSet(BOOKS_KEY, books);
      }
      return c.json({ ok: true });
    }

    if (action === "toggleCuratedRead") {
      const { password, key, read } = body;
      if (checkAdminPassword(password) !== "ok") {
        return c.json({ error: "Unauthorized" }, 403);
      }
      const overrides = (await kvGet<Record<string, boolean>>(OVERRIDES_KEY)) ?? {};
      overrides[key as string] = read as boolean;
      await kvSet(OVERRIDES_KEY, overrides);
      return c.json({ ok: true });
    }

    return c.json({ error: "Unknown action" }, 400);
  } catch (err) {
    logger.error({ err }, "Visitor books operation failed");
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
