// /api/books contract (worker/books.ts) against an in-memory KV.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyMarks, bookKey, bundle, countBooks, serveBooks } from "../worker/books";
import type { QuotesEnv } from "../worker/quotes";

process.env.KV_MEMORY = "1";
process.env.BOOKS_ADMIN_PASSWORD = "books-test-admin";
process.env.JWT_SECRET = "books-test-jwt";

const store = new Map<string, { value: string; metadata: unknown }>();
const kv = {
  async get(key: string, type?: string) {
    const hit = store.get(key);
    if (!hit) return null;
    return type === "json" ? JSON.parse(hit.value) : hit.value;
  },
  async getWithMetadata(key: string) {
    const hit = store.get(key);
    return { value: hit?.value ?? null, metadata: hit?.metadata ?? null };
  },
  async put(key: string, value: string, options?: { metadata?: unknown }) {
    store.set(key, { value, metadata: options?.metadata ?? null });
  },
} as unknown as KVNamespace;

const TOKEN = "test-token";
const env: QuotesEnv = { QUOTES: kv, QUOTES_PUBLISH_TOKEN: TOKEN };
const BASE = "https://www.nuroctane.xyz";
const raw = readFileSync(new URL("../shared/content/books.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");
let deployed = await bundle(raw);

const call = (path: string, method = "GET", headers: Record<string, string> = {}, body?: string) =>
  serveBooks(new Request(BASE + path, { method, headers, body }), env, deployed);
const put = (body: string, headers: Record<string, string> = {}) =>
  call("/api/books", "PUT", { authorization: `Bearer ${TOKEN}`, ...headers }, body);
const live = async () => (await call("/api/books")).text();
const marks = async () => (await (await call("/api/books/marks", "GET", { authorization: `Bearer ${TOKEN}` })).json()).marks;

// Keys match the Books pages: `Title|Author`, with the `_(note)_` dropped.
assert.equal(bookKey("Adami, Christoph — The Evolution of Biological Information"), "The Evolution of Biological Information|Adami, Christoph");
assert.equal(bookKey('Housel, Morgan — The Psychology of Money _(spine: "The Money")_'), "The Psychology of Money|Housel, Morgan");
assert.equal(bookKey("NEA Banned Books List"), "NEA Banned Books List|");
assert.equal(bookKey("Plate, Tom — Giants of Asia — Citizen Singapore"), "Giants of Asia — Citizen Singapore|Plate, Tom");
const counts = countBooks(raw);
assert.ok(counts.shelves >= 10 && counts.books > 500, `real list counts: ${JSON.stringify(counts)}`);

// A Worker built without books.md has nothing live; the bundled list applies.
assert.equal((await serveBooks(new Request(`${BASE}/api/books`), env, await bundle(""))).status, 404);
assert.equal((await serveBooks(new Request(`${BASE}/api/books`), {}, deployed)).status, 404);

// The first read after a deploy makes the deployed books.md the live bank.
const first = await call("/api/books");
assert.equal(first.status, 200);
assert.equal(await first.text(), raw);
const etag = first.headers.get("etag") ?? "";
assert.match(first.headers.get("cache-control") ?? "", /max-age=60/);
assert.equal((await call("/api/books", "GET", { "if-none-match": etag })).status, 304);
assert.equal((await call("/api/books", "GET", { "if-none-match": `W/${etag}` })).status, 304);
assert.equal(await (await call("/api/books", "HEAD")).text(), "");

// Publishing needs the token and a real list.
assert.equal((await call("/api/books", "PUT", {}, raw)).status, 401);
assert.equal((await call("/api/books", "PUT", { authorization: "Bearer wrong" }, raw)).status, 401);
assert.equal((await serveBooks(new Request(`${BASE}/api/books`, { method: "PUT", body: raw }), { QUOTES: kv }, deployed)).status, 503);
assert.equal((await put("just some text")).status, 422);
assert.equal((await (await put(raw.replace(/\n/g, "\r\n"))).json()).changed, false, "CRLF is the same list");
const edited = raw.replace("## A–G\n", "## A–G\n\n- [ ] Tester, Live — A Book Added Without A Deploy\n");
assert.equal((await (await put(edited)).json()).changed, true);
assert.match(await live(), /A Book Added Without A Deploy/);

// A list that loses most of its books is refused unless marked deliberate.
const truncated = raw.slice(0, raw.indexOf("\n## H–R"));
assert.equal((await put(truncated)).status, 409);

// Admin read toggles need the admin session cookie that verifyAdmin issues.
const app = (await import("@workspace/api-server")).default;
const verify = await app.fetch(new Request(`${BASE}/api/visitor-books`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "verifyAdmin", password: "books-test-admin" }),
}));
const cookie = /(nur_admin=[^;]+)/.exec(verify.headers.get("set-cookie") ?? "")?.[1] ?? "";
assert.ok(cookie, "verifyAdmin issued an admin cookie");
const toggle = (body: unknown, headers: Record<string, string> = { cookie }) =>
  call("/api/books/read", "POST", { "content-type": "application/json", ...headers }, JSON.stringify(body));

const KEY = "The Denial of Death|Becker, Ernest"; // on two shelves
assert.ok((await live()).includes("- [ ] Becker, Ernest — The Denial of Death"));
assert.equal((await toggle({ key: KEY, read: true }, {})).status, 403, "no cookie, no toggle");
assert.equal((await toggle({ key: KEY, read: true }, { cookie: "nur_admin=forged" })).status, 403);
assert.equal((await toggle({ key: "Nope|Nobody", read: true })).status, 404);
assert.equal((await toggle({ key: KEY, read: "yes" })).status, 400);
assert.equal((await toggle({ key: KEY, read: true })).status, 200);
let bank = await live();
assert.ok(!bank.includes("- [ ] Becker, Ernest — The Denial of Death"), "every line of the book is marked read");
assert.equal(bank.split("- [x] Becker, Ernest — The Denial of Death").length - 1, 2);
assert.deepEqual(await marks(), { [KEY]: true }, "the toggle waits as a mark for books.md");
assert.equal((await call("/api/books/marks")).status, 401, "marks need the token");

// A publish that raced the toggle (books.md without it) keeps the toggle live.
const raced = await (await put(edited)).json();
assert.equal(raced.pending, 1);
assert.ok((await live()).includes("- [x] Becker, Ernest — The Denial of Death"));
// Once books.md carries the mark, the publish clears it.
const drained = applyMarks(edited, await marks()).text;
const settled = await (await put(drained)).json();
assert.equal(settled.pending, 0);
assert.deepEqual(await marks(), {});
assert.equal(await live(), drained);

// Unmarking works the same way, and a deploy that changes books.md takes over
// the live bank with any pending marks still applied.
assert.equal((await toggle({ key: KEY, read: false })).status, 200);
const shipped = drained.replace("\n- [ ] Tester, Live — A Book Added Without A Deploy", "");
assert.ok(shipped.includes("- [x] Becker, Ernest — The Denial of Death"));
deployed = await bundle(`${shipped}\n- [ ] Shipped, In — A Deployed Book\n`);
bank = await live();
assert.match(bank, /A Deployed Book/);
assert.doesNotMatch(bank, /A Book Added Without A Deploy/, "the deployed list replaces an older publish");
assert.ok(bank.includes("- [ ] Becker, Ernest — The Denial of Death"), "the pending unmark survives the deploy");
assert.equal((await call("/api/books")).headers.get("etag"), (await call("/api/books")).headers.get("etag"), "reconciled once");

assert.equal((await call("/api/books", "POST")).status, 405);
assert.equal((await call("/api/books/read")).status, 405);
assert.equal((await call("/api/books/nope")).status, 404);
console.log(`BOOKS API OK: ${counts.books} books on ${counts.shelves} shelves; deploy reconcile, auth, shrink guard, ETag/304, admin marks drain into books.md`);
