// Build guard: every design stays switchable. Selecting any design in
// site.config.json must change every embed with it and never serve stale
// content, so this checks all designs, not just the selected one.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DESIGNS, SHARED_PUBLIC, SITE } from "./designs.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const at = (...p) => path.join(root, ...p);
const read = (...p) => readFileSync(at(...p), "utf8");
const { active } = JSON.parse(read("site.config.json"));
assert.ok(DESIGNS.includes(active), `site.config.json selects unknown design ${active}`);

function imageSize(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  assert.equal(b.readUInt16BE(0), 0xffd8, `${file} is neither PNG nor JPEG`);
  for (let i = 2; i < b.length; ) {
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`${file}: no JPEG frame header`);
}

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function tag(html, attr, key) {
  const m = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
}

const sameTree = (a, b) => {
  if (statSync(a).isDirectory()) {
    const names = readdirSync(a).sort();
    assert.deepEqual(readdirSync(b).sort(), names, `${b} differs from ${a}`);
    return names.forEach((n) => sameTree(path.join(a, n), path.join(b, n)));
  }
  assert.ok(readFileSync(a).equals(readFileSync(b)), `${b} differs from ${a}`);
};

const envNames = (d) =>
  read("artifacts", d, ".env.example").match(/^\s*VITE_\w+/gm)?.map((s) => s.trim()).sort() ?? [];

const ogMeta = read("worker/og-meta.ts");
for (const design of DESIGNS) {
  const where = `artifacts/${design}`;
  const embed = JSON.parse(read(where, "embed.json"));
  for (const key of ["siteName", "title", "description", "image"]) {
    assert.equal(typeof embed[key], "string", `${where}/embed.json: ${key}`);
  }
  assert.ok(embed.image.startsWith("/"), `${where}/embed.json: image must be a root path`);
  const image = at(where, "public", embed.image);
  assert.ok(existsSync(image), `${where}/embed.json: ${embed.image} is not in ${where}/public`);
  assert.deepEqual(imageSize(image), { width: embed.width, height: embed.height },
    `${where}/embed.json: width/height must be ${embed.image}'s real size`);
  assert.ok(ogMeta.includes(`from "../${where}/embed.json"`), `worker/og-meta.ts must import ${where}/embed.json`);

  // The static tags are what crawlers that skip the Worker read.
  const html = read(where, "index.html");
  const url = `${SITE}${embed.image}`;
  const expected = {
    "og:site_name": embed.siteName,
    "og:title": embed.title,
    "twitter:title": embed.title,
    "og:description": embed.description,
    "twitter:description": embed.description,
    description: embed.description,
    "og:image": url,
    "twitter:image": url,
    "og:image:width": String(embed.width),
    "og:image:height": String(embed.height),
  };
  for (const [key, value] of Object.entries(expected)) {
    const got = tag(html, "property", key) ?? tag(html, "name", key);
    assert.equal(got, value, `${where}/index.html ${key} must match embed.json`);
  }
  assert.equal(decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""), embed.title, `${where}/index.html <title>`);

  const pageMeta = read(where, "src/lib/pageMeta.ts");
  assert.ok(pageMeta.includes('from "../../embed.json"'), `${where} pageMeta.ts must read embed.json`);
  assert.ok(!/\bimagePath\b|^\s+siteName\??:|\/api\/og|\/assets\/og/m.test(pageMeta),
    `${where} pageMeta.ts: no per-page share images or site names`);

  // Content is data, not design: one copy, in shared/.
  const local = at(where, "src/content");
  assert.ok(!existsSync(local) || readdirSync(local).length === 0, `${where}/src/content: content lives in shared/content`);
  for (const name of SHARED_PUBLIC) {
    assert.ok(!existsSync(at(where, "public", name)), `${where}/public/${name}: lives in shared/public`);
  }
  assert.ok(read(where, "vite.config.ts").includes("sharedSite()"), `${where}/vite.config.ts must use sharedSite()`);
  // Quotes and books go live through /api/quotes and /api/books without a
  // deploy; a view that renders only the bundled copy would lag behind them.
  for (const page of readdirSync(at(where, "src/pages"))) {
    const source = read(where, "src/pages", page);
    if (source.includes("@shared/quotes.md?raw")) {
      assert.ok(source.includes("useLiveQuotes("), `${where}/src/pages/${page} must render quotes through useLiveQuotes`);
    }
    if (source.includes("@shared/books.md?raw")) {
      assert.ok(source.includes("useLiveBooks("), `${where}/src/pages/${page} must render books through useLiveBooks`);
      assert.ok(!source.includes("toggleCuratedRead"), `${where}/src/pages/${page}: curated read marks go through saveCuratedRead (/api/books/read)`);
    }
    // Admin mode is an httpOnly cookie; no page keeps or resends the password.
    assert.ok(!/book-admin-pw|ADMIN_PW|adminPasswordRef/.test(source), `${where}/src/pages/${page} must not store the admin password`);
  }
  assert.deepEqual(envNames(design), envNames(DESIGNS[0]), `${where}/.env.example must list the same VITE_* vars`);

  const built = at(where, "dist/public");
  if (existsSync(path.join(built, "index.html"))) {
    for (const name of SHARED_PUBLIC) sameTree(at("shared/public", name), path.join(built, name));
  }
}

// What deploys is the selected design, whole.
const staged = at("dist/public");
if (existsSync(path.join(staged, "index.html"))) {
  sameTree(at("artifacts", active, "dist/public/index.html"), path.join(staged, "index.html"));
  const { image } = JSON.parse(read("artifacts", active, "embed.json"));
  assert.ok(existsSync(path.join(staged, image)), `dist/public is missing ${active}'s embed image`);
  for (const name of SHARED_PUBLIC) sameTree(at("shared/public", name), path.join(staged, name));
}

// Every crawler route must reach the Worker in production.
const firsts = new Set(read("wrangler.jsonc").match(/^\s*"(\/[^"]*)",?\s*$/gm).map((l) => l.trim().replace(/[",]/g, "")));
for (const [, route] of ogMeta.matchAll(/^\s+path: "(\/[^"]*)",/gm)) {
  assert.ok(firsts.has(route), `wrangler.jsonc run_worker_first is missing ${route} (worker/og-meta.ts PAGES)`);
}

console.log(`DESIGNS OK: ${DESIGNS.join(", ")} switchable (embeds, shared content, env vars); ${active} staged`);
