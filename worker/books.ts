/**
 * The live books bank: /api/books.
 *
 * shared/content/books.md is the one list of books and of what has been read
 * (`- [x]`). The Books pages render the copy bundled at build first, then this
 * live one, so a change shows without a deploy. Three things write it:
 *
 * 1. A deploy. The Worker carries the books.md it was built with; the first
 *    read after a deploy that changed it makes that the live bank, so the live
 *    bank is never older than what the pages bundle.
 * 2. The local pipeline (scripts/publish_books_live.py, run by
 *    quotes-pipeline.py every 15 minutes) PUTs the working copy on main, so an
 *    edit that has not been deployed still goes live.
 * 3. Admin read toggles (POST /api/books/read, admin session cookie) set the
 *    `[x]` here at once and queue the change as a mark. The pipeline fetches
 *    the marks (GET /api/books/marks), writes them into books.md, commits it
 *    and PUTs it back. A PUT drops every mark the new bank already shows and
 *    re-applies the rest, so a toggle survives a publish that raced it.
 *
 * Marks are edits on their way into books.md, not a second record of what is
 * read: once drained, the file is the only place a read state lives.
 *
 * The bank shares the quotes KV namespace and publish token (worker/quotes.ts).
 */
import { hasAdminSession } from "@workspace/api-server/admin-session";
import { hex, json, sha256, tokenMatches, type QuotesEnv } from "./quotes";

interface BankMeta {
  sha: string;
  updatedAt: string;
  books: number;
  shelves: number;
  /** sha of the books.md the deployed Worker carries when this was stored. */
  bundle: string;
}

export type Marks = Record<string, boolean>;

const BANK_KEY = "books-bank";
const MARKS_KEY = "books-marks";
const MAX_BYTES = 1024 * 1024;
const MAX_MARKS = 500;
// A publish that drops more than this share of the books is refused unless the
// publisher says it is deliberate, so a truncated read can never empty a shelf.
const MIN_KEEP = 0.8;
const READ_HEADERS = {
  "content-type": "text/markdown; charset=utf-8",
  "cache-control": "public, max-age=60, stale-while-revalidate=300",
  "x-content-type-options": "nosniff",
};

/** `- [ ] Author — Title _(note)_`, parsed the way both Books pages parse it. */
const BOOK_LINE = /^- \[([ x])\] (.+)$/;

/** `Title|Author`, the key the Books pages give a curated book. */
export function bookKey(content: string): string {
  const text = content.trim();
  const sep = text.indexOf(" — ");
  const author = sep > 0 ? text.slice(0, sep).trim() : "";
  const title = (sep > 0 ? text.slice(sep + 3) : text).replace(/_\(.+?\)_/, "").trim();
  return `${title}|${author}`;
}

export function countBooks(text: string): { shelves: number; books: number } {
  let shelves = 0;
  let books = 0;
  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) shelves++;
    else if (BOOK_LINE.test(line)) books++;
  }
  return { shelves, books };
}

/** Sets each marked book's checkbox (every line that carries it). `shown` gets
 * the keys whose lines already all agree with their mark, `missing` the keys
 * no line carries. */
export function applyMarks(text: string, marks: Marks): { text: string; shown: Set<string>; missing: Set<string> } {
  const missing = new Set(Object.keys(marks));
  const differs = new Set<string>();
  const lines = text.split("\n").map((line) => {
    const match = BOOK_LINE.exec(line);
    if (!match) return line;
    const key = bookKey(match[2]);
    const want = marks[key];
    if (want === undefined) return line;
    missing.delete(key);
    if ((match[1] === "x") === want) return line;
    differs.add(key);
    return `- [${want ? "x" : " "}] ${match[2]}`;
  });
  const shown = new Set(Object.keys(marks).filter((key) => !missing.has(key) && !differs.has(key)));
  return { text: lines.join("\n"), shown, missing };
}

const normalize = (text: string) => text.replace(/\r\n/g, "\n");

async function readMarks(kv: KVNamespace): Promise<Marks> {
  const marks = await kv.get<Marks>(MARKS_KEY, "json");
  return marks && typeof marks === "object" ? marks : {};
}

async function store(kv: KVNamespace, text: string, bundle: string): Promise<BankMeta> {
  const meta: BankMeta = { sha: hex(await sha256(text)), updatedAt: new Date().toISOString(), bundle, ...countBooks(text) };
  await kv.put(BANK_KEY, text, { metadata: meta });
  return meta;
}

function bearer(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : "";
}

async function authorised(request: Request, env: QuotesEnv): Promise<Response | null> {
  if (!env.QUOTES || !env.QUOTES_PUBLISH_TOKEN) return json(503, { error: "Live books are not configured." });
  const token = bearer(request);
  if (!token || !(await tokenMatches(token, env.QUOTES_PUBLISH_TOKEN))) {
    return json(401, { error: "Unauthorized" }, { "www-authenticate": "Bearer" });
  }
  return null;
}

/** The bundled books.md replaces the live bank once per deploy that changed it. */
async function current(env: QuotesEnv, bundled: Bundle, cacheTtl?: number) {
  const kv = env.QUOTES!;
  const stored = await kv.getWithMetadata<BankMeta>(BANK_KEY, cacheTtl ? { cacheTtl } : undefined);
  if (stored.value && stored.metadata && (!bundled.text || stored.metadata.bundle === bundled.sha)) {
    return { text: stored.value, meta: stored.metadata };
  }
  if (!bundled.text) return null;
  const marks = await readMarks(kv);
  const text = applyMarks(bundled.text, marks).text;
  return { text, meta: await store(kv, text, bundled.sha) };
}

async function read(request: Request, env: QuotesEnv, bundled: Bundle): Promise<Response> {
  const bank = env.QUOTES ? await current(env, bundled, 60) : null;
  if (!bank) return json(404, { error: "No live books bank yet; the bundled list applies." });
  const etag = `"${bank.meta.sha}"`;
  const headers = { ...READ_HEADERS, etag, "x-books-updated": bank.meta.updatedAt };
  const match = request.headers.get("if-none-match");
  if (match && match.split(",").some((tag) => tag.trim().replace(/^W\//, "") === etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === "HEAD" ? null : bank.text, { headers });
}

async function publish(request: Request, env: QuotesEnv, bundled: Bundle): Promise<Response> {
  const refused = await authorised(request, env);
  if (refused) return refused;
  const kv = env.QUOTES!;
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BYTES) return json(413, { error: "Bank too large" });
  const body = normalize(await request.text());
  if (new TextEncoder().encode(body).length > MAX_BYTES) return json(413, { error: "Bank too large" });

  const counts = countBooks(body);
  if (counts.shelves < 1 || counts.books < 1) {
    return json(422, { error: "Not a books bank: needs `## ` shelves and `- [ ]` books." });
  }
  const previous = (await kv.getWithMetadata<BankMeta>(BANK_KEY)).metadata;
  if (previous && request.headers.get("x-allow-shrink") !== "1" && counts.books < previous.books * MIN_KEEP) {
    return json(409, {
      error: `Refusing to drop from ${previous.books} to ${counts.books} books; resend with X-Allow-Shrink: 1 if deliberate.`,
    });
  }

  // Marks the bank already shows have reached books.md; the rest still apply.
  const marks = await readMarks(kv);
  const { shown, missing } = applyMarks(body, marks);
  const pending: Marks = {};
  for (const [key, read] of Object.entries(marks)) if (!shown.has(key) && !missing.has(key)) pending[key] = read;
  const text = applyMarks(body, pending).text;
  if (Object.keys(pending).length !== Object.keys(marks).length) await kv.put(MARKS_KEY, JSON.stringify(pending));

  const bundle = bundled.text ? bundled.sha : previous?.bundle ?? "";
  const sha = hex(await sha256(text));
  if (previous?.sha === sha && previous.bundle === bundle) {
    return json(200, { changed: false, sha, pending: Object.keys(pending).length, ...counts });
  }
  const meta = await store(kv, text, bundle);
  return json(200, { changed: true, pending: Object.keys(pending).length, ...meta });
}

async function marks(request: Request, env: QuotesEnv): Promise<Response> {
  const refused = await authorised(request, env);
  if (refused) return refused;
  return json(200, { marks: await readMarks(env.QUOTES!) });
}

/** Admin: mark a curated book read or unread. */
async function setRead(request: Request, env: QuotesEnv, bundled: Bundle): Promise<Response> {
  if (!(await hasAdminSession(request.headers.get("cookie")))) return json(403, { error: "Unauthorized" });
  if (!env.QUOTES) return json(503, { error: "Live books are not configured." });
  let input: { key?: unknown; read?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return json(400, { error: "Expected JSON { key, read }" });
  }
  const { key, read } = input ?? {};
  if (typeof key !== "string" || !key.includes("|") || key.length > 400 || typeof read !== "boolean") {
    return json(400, { error: "Invalid book key" });
  }
  const bank = await current(env, bundled);
  if (!bank) return json(409, { error: "No live books bank yet." });
  const marks = await readMarks(env.QUOTES);
  const applied = applyMarks(bank.text, { [key]: read });
  if (applied.missing.has(key)) return json(404, { error: "Book not found" });
  if (!(key in marks) && Object.keys(marks).length >= MAX_MARKS) {
    return json(409, { error: "Too many read changes are waiting for the pipeline." });
  }
  marks[key] = read;
  await env.QUOTES.put(MARKS_KEY, JSON.stringify(marks));
  const meta = applied.text === bank.text ? bank.meta : await store(env.QUOTES, applied.text, bank.meta.bundle);
  return json(200, { ok: true, key, read, sha: meta.sha });
}

export interface Bundle {
  /** The books.md this Worker was built with ("" in tests that start empty). */
  text: string;
  sha: string;
}

export async function bundle(text: string): Promise<Bundle> {
  const normal = normalize(text);
  return { text: normal, sha: normal ? hex(await sha256(normal)) : "" };
}

export async function serveBooks(request: Request, env: QuotesEnv, bundled: Bundle): Promise<Response> {
  const { pathname } = new URL(request.url);
  const method = request.method;
  if (pathname === "/api/books") {
    if (method === "GET" || method === "HEAD") return read(request, env, bundled);
    if (method === "PUT") return publish(request, env, bundled);
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD, PUT" } });
  }
  if (pathname === "/api/books/marks") {
    if (method === "GET") return marks(request, env);
    return new Response(null, { status: 405, headers: { allow: "GET" } });
  }
  if (pathname === "/api/books/read") {
    if (method === "POST") return setRead(request, env, bundled);
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  return json(404, { error: "Not found" });
}
