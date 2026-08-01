/* CONTRACT-GUARDED FILE.
 * The response shapes and paths in this file are asserted by scripts/src/smoke.ts,
 * which runs inside the build. Changing shapes/paths without updating the smoke
 * test will fail every deploy. Do not weaken or bypass the smoke test. */
import { Hono } from "hono";
import { kvDelete, kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { readBody } from "../lib/body";
import { checkAdminPassword } from "../lib/admin-password";
import { searchBooks } from "../lib/book-search";
import { storedCoverBytes, validateCoverUpload } from "../lib/book-cover";

const router = new Hono();

const BOOKS_KEY = "visitor-books";
const OVERRIDES_KEY = "read-overrides";
const COVER_KEY_PREFIX = "book-cover:";
const MAX_VISITOR_BOOKS = 250;
const MAX_REQUEST_BYTES = 450 * 1024;
const COVER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Book {
  title: string;
  author?: string;
  dateAdded: string;
  read?: boolean;
  sessionId?: string;
  visitor?: boolean;
  note?: string;
  coverUrl?: string;
  coverId?: string;
  description?: string;
  year?: string;
  source?: string;
  sourceUrl?: string;
}

interface StoredCover {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  base64: string;
  byteLength: number;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function cleanHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeNewBook(value: unknown): Book | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<Book>;
  const title = cleanText(input.title, 180);
  if (!title) return null;
  return {
    title,
    author: cleanText(input.author, 140),
    dateAdded: new Date().toISOString(),
    read: false,
    visitor: true,
    sessionId: cleanText(input.sessionId, 100) || undefined,
    note: cleanText(input.note, 500) || undefined,
    coverUrl: cleanHttpsUrl(input.coverUrl),
    description: cleanText(input.description, 2_000) || undefined,
    year: cleanText(input.year, 24) || undefined,
    source: cleanText(input.source, 80) || undefined,
    sourceUrl: cleanHttpsUrl(input.sourceUrl),
  };
}

router.get("/book-search", async (c) => {
  const query = cleanText(c.req.query("q"), 160);
  if (query.length < 2) return c.json({ error: "Search query must be at least 2 characters" }, 400);
  try {
    const response = await searchBooks(query);
    c.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=86400");
    return c.json(response);
  } catch (err) {
    logger.error({ err }, "Federated book search failed");
    return c.json({ results: [], sources: [] });
  }
});

router.get("/book-covers/:id", async (c) => {
  const id = c.req.param("id");
  if (!COVER_ID_PATTERN.test(id)) return c.json({ error: "Cover not found" }, 404);
  try {
    const cover = await kvGet<StoredCover>(`${COVER_KEY_PREFIX}${id}`);
    if (!cover) return c.json({ error: "Cover not found" }, 404);
    const bytes = storedCoverBytes(cover.base64);
    if (!bytes || bytes.byteLength !== cover.byteLength) {
      return c.json({ error: "Cover data unavailable" }, 500);
    }
    return new Response(bytes, {
      headers: {
        "Content-Type": cover.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    logger.error({ err, coverId: id }, "Failed to get visitor book cover");
    return c.json({ error: "Cover data unavailable" }, 500);
  }
});

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
    const contentLength = Number(c.req.header("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return c.json({ error: "Request is too large" }, 413);
    }
    const body = await readBody<{
      action?: string;
      password?: string;
      book?: Book;
      sessionId?: string;
      key?: string;
      read?: boolean;
      coverUpload?: unknown;
    }>(c);
    const { action } = body;
    if (action === "verifyAdmin") {
      const status = checkAdminPassword(body.password);
      if (status === "unset") return c.json({ error: "Admin password not configured" }, 500);
      if (status === "ok") return c.json({ ok: true });
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (action === "add") {
      const book = normalizeNewBook(body.book);
      if (!book) return c.json({ error: "Missing book title" }, 400);
      const books = (await kvGet<Book[]>(BOOKS_KEY)) ?? [];
      if (books.length >= MAX_VISITOR_BOOKS) {
        return c.json({ error: "Community library is currently full" }, 409);
      }

      let coverId: string | undefined;
      if (body.coverUpload !== undefined) {
        const validation = validateCoverUpload(body.coverUpload);
        if (!validation.ok) return c.json({ error: validation.error }, 400);
        coverId = crypto.randomUUID();
        await kvSet(`${COVER_KEY_PREFIX}${coverId}`, {
          mimeType: validation.cover.mimeType,
          base64: validation.cover.base64,
          byteLength: validation.cover.bytes.byteLength,
        } satisfies StoredCover);
        book.coverId = coverId;
        book.coverUrl = `/api/book-covers/${coverId}`;
      }

      books.push(book);
      try {
        await kvSet(BOOKS_KEY, books);
      } catch (err) {
        if (coverId) await kvDelete(`${COVER_KEY_PREFIX}${coverId}`).catch(() => {});
        throw err;
      }
      return c.json({ ok: true, book });
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
          const [removed] = books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          if (removed.coverId) {
            await kvDelete(`${COVER_KEY_PREFIX}${removed.coverId}`).catch((err) =>
              logger.warn({ err, coverId: removed.coverId }, "Failed to delete visitor book cover"),
            );
          }
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
          const [removed] = books.splice(idx, 1);
          await kvSet(BOOKS_KEY, books);
          if (removed.coverId) {
            await kvDelete(`${COVER_KEY_PREFIX}${removed.coverId}`).catch((err) =>
              logger.warn({ err, coverId: removed.coverId }, "Failed to delete visitor book cover"),
            );
          }
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
