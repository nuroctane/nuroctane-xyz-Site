// /api/quotes contract (worker/quotes.ts) against an in-memory KV.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { countBank, serveQuotes, type QuotesEnv } from "../worker/quotes";

const store = new Map<string, { value: string; metadata: unknown }>();
const kv = {
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
const call = (method: string, headers: Record<string, string> = {}, body?: string) =>
  serveQuotes(new Request("https://www.nuroctane.xyz/api/quotes", { method, headers, body }), env);
const put = (body: string, headers: Record<string, string> = {}) =>
  call("PUT", { authorization: `Bearer ${TOKEN}`, ...headers }, body);

const bank = readFileSync(new URL("../shared/content/quotes.md", import.meta.url), "utf8");
const counts = countBank(bank.replace(/\r\n/g, "\n"));
assert.ok(counts.sections >= 12 && counts.quotes > 500, `real bank counts: ${JSON.stringify(counts)}`);

// Nothing published yet: readers fall back to the bundled bank.
assert.equal((await call("GET")).status, 404);
assert.equal((await serveQuotes(new Request("https://x/api/quotes"), {})).status, 404);

// Publishing needs the token.
assert.equal((await call("PUT", {}, bank)).status, 401);
assert.equal((await call("PUT", { authorization: "Bearer wrong" }, bank)).status, 401);
assert.equal((await serveQuotes(new Request("https://x/api/quotes", { method: "PUT", body: bank }), { QUOTES: kv })).status, 503);
assert.equal((await put("just some text")).status, 422);

const first = await put(bank);
assert.equal(first.status, 200);
const meta = await first.json();
assert.equal(meta.changed, true);
assert.equal(meta.quotes, counts.quotes);

const live = await call("GET");
assert.equal(live.status, 200);
assert.equal(await live.text(), bank.replace(/\r\n/g, "\n"));
assert.equal(live.headers.get("etag"), `"${meta.sha}"`);
assert.match(live.headers.get("cache-control") ?? "", /max-age=60/);
assert.equal((await call("GET", { "if-none-match": `"${meta.sha}"` })).status, 304);
assert.equal((await call("GET", { "if-none-match": `W/"${meta.sha}"` })).status, 304);
const head = await call("HEAD");
assert.equal(head.status, 200);
assert.equal(await head.text(), "");

// Same bank again is a no-op; CRLF is the same bank.
assert.equal((await (await put(bank.replace(/\n/g, "\r\n"))).json()).changed, false);

// A bank that loses most of its quotes is refused unless marked deliberate.
const firstSection = bank.indexOf("\n## ", bank.indexOf("## Index") + 1);
const truncated = bank.slice(0, bank.indexOf("\n## ", firstSection + 1));
assert.equal((await put(truncated)).status, 409);
assert.equal((await put(truncated, { "x-allow-shrink": "1" })).status, 200);

const added = `${bank}\n> A new line for the live path test.\n`;
assert.equal((await (await put(added)).json()).changed, true);
assert.match(await (await call("GET")).text(), /live path test/);

assert.equal((await call("POST")).status, 405);
console.log(`QUOTES API OK: ${counts.quotes} quotes in ${counts.sections} sections; auth, validation, shrink guard, ETag/304, HEAD, no-op republish`);
