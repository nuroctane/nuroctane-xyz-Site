import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { THEMES } from "../api/og.mjs";

const origin = process.argv[2] ?? "http://127.0.0.1:8789";
const cards = new URL(
  "../artifacts/blackboard/public/assets/og/",
  import.meta.url,
);
for (const page of Object.keys(THEMES)) {
  const response = await fetch(`${origin}/api/og?page=${page}`);
  assert.equal(response.status, 200, page);
  assert.match(response.headers.get("content-type"), /^image\/png/);
  assert.deepEqual(
    Buffer.from(await response.arrayBuffer()),
    await readFile(new URL(`${page}.png`, cards)),
    page,
  );
}
const head = await fetch(`${origin}/api/og?page=cli`, { method: "HEAD" });
assert.equal(head.status, 200);
assert.equal((await head.arrayBuffer()).byteLength, 0);
const fallback = await fetch(`${origin}/api/og?page=../../invalid`);
assert.deepEqual(
  Buffer.from(await fallback.arrayBuffer()),
  await readFile(new URL("home.png", cards)),
);
const upper = await fetch(`${origin}/api/og?page=CLI`);
assert.deepEqual(
  Buffer.from(await upper.arrayBuffer()),
  await readFile(new URL("cli.png", cards)),
);
const rejected = await fetch(`${origin}/api/og`, { method: "POST" });
assert.equal(rejected.status, 405);
assert.equal(rejected.headers.get("allow"), "GET, HEAD");
const crawler = await fetch(`${origin}/cli`, {
  headers: { "User-Agent": "Twitterbot/1.0" },
});
assert.match(await crawler.text(), /\/assets\/og\/cli\.png\?v=5/);
console.log(
  "OG DELIVERY OK: 12 cards, HEAD, case handling, safe fallback, method rejection, crawler metadata",
);
