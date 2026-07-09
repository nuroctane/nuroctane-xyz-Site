/* CONTRACT-GUARDED FILE.
 * This smoke test runs inside the Vercel buildCommand (root `pnpm run build`).
 * It boots the built isolated API bundles in-process with KV_MEMORY=1 and
 * asserts the books + modkeys gallery contracts. If an edit anywhere breaks
 * these contracts, the deploy fails and the last good deployment stays live.
 * Do not weaken or bypass this test. */

process.env.KV_MEMORY = "1";
process.env.BOOKS_ADMIN_PASSWORD = "smoke-admin";
process.env.MODKEYS_ADMIN_PASSWORD = "smoke-admin";

import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

let passed = 0;

function ok(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`SMOKE FAIL: ${name}`);
    process.exit(1);
  }
  passed++;
}

async function listen(app: unknown): Promise<{ base: string; close: () => void }> {
  const server = http.createServer(app as http.RequestListener);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (addr === null || typeof addr === "string") throw new Error("no port");
  return { base: `http://127.0.0.1:${addr.port}`, close: () => server.close() };
}

async function jfetch(base: string, p: string, body?: unknown): Promise<{ status: number; json: any }> {
  const res = await fetch(base + p, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* non-json is asserted via status */ }
  return { status: res.status, json };
}

async function importBundle(rel: string): Promise<any> {
  const abs = path.resolve(process.cwd(), "..", "artifacts", "api-server", "dist", rel);
  const mod = await import(pathToFileURL(abs).href);
  return mod.default;
}

async function smokeBooks(): Promise<void> {
  const app = await importBundle("vercel-books.mjs");
  const { base, close } = await listen(app);
  try {
    const health = await jfetch(base, "/api/healthz");
    ok(health.status === 200 && health.json?.status === "ok", "books fn: GET /api/healthz 200");

    let g = await jfetch(base, "/api/visitor-books");
    ok(g.status === 200 && Array.isArray(g.json?.books) && typeof g.json?.overrides === "object",
      "GET /api/visitor-books shape {books[], overrides{}}");

    const book = { title: "Smoke Title", author: "Smoke Author", dateAdded: "2026-01-01T00:00:00.000Z", sessionId: "smoke-session" };
    const add = await jfetch(base, "/api/visitor-books", { action: "add", book });
    ok(add.status === 200 && add.json?.ok === true, "POST add visitor book");

    g = await jfetch(base, "/api/visitor-books");
    ok(g.json.books.some((b: any) => b.title === "Smoke Title"), "added book appears in GET");

    const tog = await jfetch(base, "/api/visitor-books", { action: "toggleVisitorRead", book, sessionId: "smoke-session" });
    ok(tog.status === 200, "owner toggleVisitorRead via sessionId");
    g = await jfetch(base, "/api/visitor-books");
    ok(g.json.books.find((b: any) => b.title === "Smoke Title")?.read === true, "toggle persisted read=true");

    const strangerDel = await jfetch(base, "/api/visitor-books", { action: "delete", book, sessionId: "not-owner", password: "wrong" });
    ok(strangerDel.status === 403, "non-owner delete without password → 403");

    const ownerDel = await jfetch(base, "/api/visitor-books", { action: "delete", book, sessionId: "smoke-session" });
    ok(ownerDel.status === 200 && ownerDel.json?.ok === true, "owner delete via sessionId");
    g = await jfetch(base, "/api/visitor-books");
    ok(!g.json.books.some((b: any) => b.title === "Smoke Title"), "deleted book absent from GET");

    const badAdmin = await jfetch(base, "/api/visitor-books", { action: "verifyAdmin", password: "wrong" });
    ok(badAdmin.status === 403, "verifyAdmin wrong password → 403");
    const goodAdmin = await jfetch(base, "/api/visitor-books", { action: "verifyAdmin", password: "smoke-admin" });
    ok(goodAdmin.status === 200 && goodAdmin.json?.ok === true, "verifyAdmin correct password → ok");

    const cur = await jfetch(base, "/api/visitor-books", { action: "toggleCuratedRead", password: "smoke-admin", key: "T|A", read: true });
    ok(cur.status === 200, "toggleCuratedRead as admin");
    g = await jfetch(base, "/api/visitor-books");
    ok(g.json.overrides["T|A"] === true, "curated override present in GET");
  } finally {
    close();
  }
}

async function smokeModkeys(): Promise<void> {
  const app = await importBundle("vercel-modkeys.mjs");
  const { base, close } = await listen(app);
  try {
    let g = await jfetch(base, "/api/modkeys/gallery");
    ok(g.status === 200 && Array.isArray(g.json?.templates), "GET /api/modkeys/gallery shape {templates[]}");

    const snap = { layout: "75", perKeyOverrides: { k1: { text: "A", imageData: "SHOULD_BE_STRIPPED" } } };
    const post = await jfetch(base, "/api/modkeys/gallery", { name: "smoke <b>x</b>", snap });
    ok(post.status === 201 && typeof post.json?.template?.id === "string", "POST gallery → 201 with template id");

    g = await jfetch(base, "/api/modkeys/gallery");
    ok(g.json.templates.length === 1, "gallery has one template");
    const t = g.json.templates[0];
    ok(t.name === "smoke x", "name sanitized (html stripped)");
    ok(t.snap?.perKeyOverrides?.k1 && t.snap.perKeyOverrides.k1.imageData === undefined, "imageData stripped from stored snap");
    ok(t.layout === "75", "layout extracted from snap");

    /* Admin via action: on POST /gallery (Vercel only routes one segment under
       /api/modkeys/* — multi-segment /gallery/verify-admin is NOT_FOUND there). */
    const badAdmin = await jfetch(base, "/api/modkeys/gallery", { action: "verifyAdmin", password: "wrong" });
    ok(badAdmin.status === 403, "verifyAdmin wrong password → 403");
    const goodAdmin = await jfetch(base, "/api/modkeys/gallery", { action: "verifyAdmin", password: "smoke-admin" });
    ok(goodAdmin.status === 200 && goodAdmin.json?.ok === true, "verifyAdmin correct password → ok");
    /* single-segment alias also works */
    const aliasAdmin = await jfetch(base, "/api/modkeys/verify-admin", { password: "smoke-admin" });
    ok(aliasAdmin.status === 200 && aliasAdmin.json?.ok === true, "POST /modkeys/verify-admin alias ok");

    const badRename = await jfetch(base, "/api/modkeys/gallery", { action: "rename", password: "wrong", id: t.id, name: "Nope" });
    ok(badRename.status === 403, "rename wrong password → 403");
    const rename = await jfetch(base, "/api/modkeys/gallery", { action: "rename", password: "smoke-admin", id: t.id, name: "Renamed <i>build</i>" });
    ok(rename.status === 200 && rename.json?.template?.name === "Renamed build", "rename as admin sanitizes name");
    g = await jfetch(base, "/api/modkeys/gallery");
    ok(g.json.templates[0]?.name === "Renamed build", "renamed name persists in GET");

    const badDel = await jfetch(base, "/api/modkeys/gallery", { action: "delete", password: "wrong", id: t.id });
    ok(badDel.status === 403, "delete wrong password → 403");
    const missDel = await jfetch(base, "/api/modkeys/gallery", { action: "delete", password: "smoke-admin", id: "nope" });
    ok(missDel.status === 404, "delete unknown id → 404");
    const del = await jfetch(base, "/api/modkeys/gallery", { action: "delete", password: "smoke-admin", id: t.id });
    ok(del.status === 200 && del.json?.ok === true, "delete as admin → ok");
    g = await jfetch(base, "/api/modkeys/gallery");
    ok(g.json.templates.length === 0, "gallery empty after delete");
  } finally {
    close();
  }
}

(async () => {
  await smokeBooks();
  await smokeModkeys();
  console.log(`SMOKE OK (${passed} assertions)`);
  process.exit(0);
})().catch((err) => {
  console.error("SMOKE FAIL (unexpected error):", err);
  process.exit(1);
});
