import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Every embed matches the Blackboard's: same image, size and site name on
// every route, and retired card URLs answer with that same image.
const origin = process.argv[2] ?? "http://127.0.0.1:8789";
const logo = await readFile(
  new URL(
    "../artifacts/blackboard/public/assets/nodes/site-logo.png",
    import.meta.url,
  ),
);
const IMAGE = "https://www.nuroctane.xyz/assets/nodes/site-logo.png";
const routes = [
  "/",
  "/quotes",
  "/books",
  "/resume",
  "/modkeys",
  "/cli",
  "/curriculum",
  "/observatory",
  "/github",
  "/stats",
  "/blog",
  "/blog/sovereignty",
  "/socials",
  "/socials/x",
  "/projects",
  "/projects/nur-cli",
  "/fin",
];
for (const route of routes) {
  const response = await fetch(`${origin}${route}`, {
    headers: { "User-Agent": "Discordbot/2.0" },
  });
  const doc = await response.text();
  assert.equal(response.headers.get("cache-control"), "no-cache", route);
  assert.match(doc, new RegExp(`property="og:image" content="${IMAGE}"`), route);
  assert.match(doc, new RegExp(`name="twitter:image" content="${IMAGE}"`), route);
  assert.match(doc, /property="og:image:width" content="879"/, route);
  assert.match(doc, /property="og:image:height" content="1024"/, route);
  assert.match(doc, /property="og:site_name" content="NUROCTANE"/, route);
  assert.doesNotMatch(doc, /http-equiv="refresh"/, route);
}
for (const retired of [
  "/api/og?page=resume",
  "/api/og?page=CLI",
  "/api/og?page=../../invalid",
  "/assets/og/cli-dda47cb8.png",
  "/assets/og/resume.png",
]) {
  const response = await fetch(`${origin}${retired}`);
  assert.equal(response.status, 200, retired);
  assert.match(response.headers.get("content-type"), /^image\/png/, retired);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), logo, retired);
}
const head = await fetch(`${origin}/api/og?page=cli`, { method: "HEAD" });
assert.equal(head.status, 200);
assert.equal((await head.arrayBuffer()).byteLength, 0);
const rejected = await fetch(`${origin}/api/og`, { method: "POST" });
assert.equal(rejected.status, 405);
assert.equal(rejected.headers.get("allow"), "GET, HEAD");
// Card caches key on og:url, so a shared variant must echo itself.
const shared = await (
  await fetch(`${origin}/cli?ref=x`, {
    headers: { "User-Agent": "Twitterbot/1.0" },
  })
).text();
assert.match(shared, /property="og:url" content="[^"]*\/cli\?ref=x"/);
console.log(
  `OG DELIVERY OK: ${routes.length} routes share the Blackboard embed, retired card URLs, HEAD, method rejection, shared og:url`,
);
