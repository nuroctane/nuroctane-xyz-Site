import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SITE } from "./designs.mjs";

// Every embed matches the selected design's (artifacts/<design>/embed.json):
// same image, size and site name on every route, and retired card URLs
// answer with that same image.
const origin = process.argv[2] ?? "http://127.0.0.1:8789";
const root = new URL("../", import.meta.url);
const { active } = JSON.parse(await readFile(new URL("site.config.json", root), "utf8"));
const embed = JSON.parse(
  await readFile(new URL(`artifacts/${active}/embed.json`, root), "utf8"),
);
const embedBytes = await readFile(new URL(`artifacts/${active}/public${embed.image}`, root));
const IMAGE = `${SITE}${embed.image}`;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Never follow redirects: a local Worker that redirects (to the canonical host,
// say) would otherwise pass by checking the live site instead.
const get = (path, init = {}) => fetch(`${origin}${path}`, { ...init, redirect: "manual" });
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
  const response = await get(route, {
    headers: { "User-Agent": "Discordbot/2.0" },
  });
  const doc = await response.text();
  assert.equal(response.status, 200, route);
  assert.equal(response.headers.get("cache-control"), "no-cache", route);
  assert.match(doc, new RegExp(`property="og:image" content="${esc(IMAGE)}"`), route);
  assert.match(doc, new RegExp(`name="twitter:image" content="${esc(IMAGE)}"`), route);
  assert.match(doc, new RegExp(`property="og:image:width" content="${embed.width}"`), route);
  assert.match(doc, new RegExp(`property="og:image:height" content="${embed.height}"`), route);
  assert.match(doc, new RegExp(`property="og:site_name" content="${esc(embed.siteName)}"`), route);
  assert.doesNotMatch(doc, /http-equiv="refresh"/, route);
}
for (const retired of [
  "/api/og?page=resume",
  "/api/og?page=CLI",
  "/api/og?page=../../invalid",
  "/assets/og/cli-dda47cb8.png",
  "/assets/og/resume.png",
]) {
  const response = await get(retired);
  assert.equal(response.status, 200, retired);
  assert.match(response.headers.get("content-type"), /^image\/(png|jpeg)/, retired);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), embedBytes, retired);
}
const head = await get("/api/og?page=cli", { method: "HEAD" });
assert.equal(head.status, 200);
assert.equal((await head.arrayBuffer()).byteLength, 0);
const rejected = await get("/api/og", { method: "POST" });
assert.equal(rejected.status, 405);
assert.equal(rejected.headers.get("allow"), "GET, HEAD");
// Card caches key on og:url, so a shared variant must echo itself.
const shared = await (
  await get("/cli?ref=x", {
    headers: { "User-Agent": "Twitterbot/1.0" },
  })
).text();
assert.match(shared, /property="og:url" content="[^"]*\/cli\?ref=x"/);
console.log(
  `OG DELIVERY OK: ${routes.length} routes share the ${active} embed, retired card URLs, HEAD, method rejection, shared og:url`,
);
