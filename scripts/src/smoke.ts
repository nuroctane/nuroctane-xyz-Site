/* CONTRACT-GUARDED FILE.
 * This smoke test runs inside the root `pnpm run build`. It drives the Hono API
 * in-process with KV_MEMORY=1 and asserts the books + modkeys gallery contracts.
 * If an edit anywhere breaks these contracts, the build fails.
 * Do not weaken or bypass this test.
 *
 * Previously this booted three separate esbuild bundles (vercel-books.mjs,
 * vercel-modkeys.mjs) on ephemeral HTTP ports, because Vercel split the API
 * across one function per file. There is now a single Hono app, and a Hono app
 * *is* a fetch handler — so the assertions run against app.fetch() directly with
 * no server, no ports, and no build step. Every assertion below is carried over
 * unchanged.
 *
 * This exercises application logic, not the Workers runtime — same as before,
 * when it exercised the bundle rather than Vercel's runtime. Runtime behaviour
 * (bindings, nodejs_compat, process.env population) is covered by `wrangler dev`.
 */

process.env.KV_MEMORY = "1";
process.env.BOOKS_ADMIN_PASSWORD = "smoke-admin";
process.env.MODKEYS_ADMIN_PASSWORD = "smoke-admin";

const BASE = "https://smoke.local";

let passed = 0;

function ok(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`SMOKE FAIL: ${name}`);
    process.exit(1);
  }
  passed++;
}

/** Minimal ExecutionContext stand-in — routes that background work call waitUntil. */
const ctx = {
  waitUntil: (p: Promise<unknown>) => void Promise.resolve(p).catch(() => {}),
  passThroughOnException: () => {},
};

type App = { fetch: (req: Request, env?: unknown, ctx?: unknown) => Promise<Response> };

async function jfetch(
  app: App,
  p: string,
  body?: unknown,
): Promise<{ status: number; json: any }> {
  const req = new Request(BASE + p, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await app.fetch(req, {}, ctx);
  let json: any = null;
  try { json = await res.json(); } catch { /* non-json is asserted via status */ }
  return { status: res.status, json };
}

async function smokeBooks(app: App): Promise<void> {
  const health = await jfetch(app, "/api/healthz");
  ok(health.status === 200 && health.json?.status === "ok", "GET /api/healthz 200");

  let g = await jfetch(app, "/api/visitor-books");
  ok(g.status === 200 && Array.isArray(g.json?.books) && typeof g.json?.overrides === "object",
    "GET /api/visitor-books shape {books[], overrides{}}");

  const submittedBook = { title: "Smoke Title", author: "Smoke Author", dateAdded: "2026-01-01T00:00:00.000Z", sessionId: "smoke-session" };
  const add = await jfetch(app, "/api/visitor-books", { action: "add", book: submittedBook });
  ok(add.status === 200 && add.json?.ok === true && add.json?.book?.title === "Smoke Title", "POST add visitor book");
  const book = add.json.book;

  g = await jfetch(app, "/api/visitor-books");
  ok(g.json.books.some((b: any) => b.title === "Smoke Title"), "added book appears in GET");

  const tog = await jfetch(app, "/api/visitor-books", { action: "toggleVisitorRead", book, sessionId: "smoke-session" });
  ok(tog.status === 200, "owner toggleVisitorRead via sessionId");
  g = await jfetch(app, "/api/visitor-books");
  ok(g.json.books.find((b: any) => b.title === "Smoke Title")?.read === true, "toggle persisted read=true");

  const strangerDel = await jfetch(app, "/api/visitor-books", { action: "delete", book, sessionId: "not-owner", password: "wrong" });
  ok(strangerDel.status === 403, "non-owner delete without password → 403");

  const ownerDel = await jfetch(app, "/api/visitor-books", { action: "delete", book, sessionId: "smoke-session" });
  ok(ownerDel.status === 200 && ownerDel.json?.ok === true, "owner delete via sessionId");
  g = await jfetch(app, "/api/visitor-books");
  ok(!g.json.books.some((b: any) => b.title === "Smoke Title"), "deleted book absent from GET");

  const pngHeader = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x02, 0x58, // 600px
    0x00, 0x00, 0x03, 0x84, // 900px
    0x08, 0x06, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const coverDataUrl = `data:image/png;base64,${Buffer.from(pngHeader).toString("base64")}`;
  const coverAdd = await jfetch(app, "/api/visitor-books", {
    action: "add",
    book: { title: "Covered Smoke", author: "Manual Author", sessionId: "cover-session", source: "Manual entry" },
    coverUpload: { dataUrl: coverDataUrl },
  });
  ok(coverAdd.status === 200 && /^\/api\/book-covers\/[0-9a-f-]+$/i.test(coverAdd.json?.book?.coverUrl),
    "manual book stores bounded cover separately");

  const coverPath = coverAdd.json.book.coverUrl as string;
  const coverResponse = await app.fetch(new Request(BASE + coverPath), {}, ctx);
  ok(coverResponse.status === 200 && coverResponse.headers.get("content-type") === "image/png",
    "uploaded cover is retrievable with its validated MIME type");
  ok((await coverResponse.arrayBuffer()).byteLength === pngHeader.byteLength,
    "uploaded cover bytes round-trip intact");

  const wrongSize = pngHeader.slice();
  wrongSize[19] = 0x01; // width 513 rather than 600
  const wrongSizeAdd = await jfetch(app, "/api/visitor-books", {
    action: "add",
    book: { title: "Wrong Cover Size", sessionId: "cover-session" },
    coverUpload: { dataUrl: `data:image/png;base64,${Buffer.from(wrongSize).toString("base64")}` },
  });
  ok(wrongSizeAdd.status === 400 && /exactly 600/.test(wrongSizeAdd.json?.error),
    "server rejects cover with non-contract dimensions");

  const coverDelete = await jfetch(app, "/api/visitor-books", {
    action: "delete",
    book: coverAdd.json.book,
    sessionId: "cover-session",
  });
  ok(coverDelete.status === 200, "owner can delete a manually covered book");
  const deletedCover = await app.fetch(new Request(BASE + coverPath), {}, ctx);
  ok(deletedCover.status === 404, "deleting a book also deletes its cover object");

  const badAdmin = await jfetch(app, "/api/visitor-books", { action: "verifyAdmin", password: "wrong" });
  ok(badAdmin.status === 403, "verifyAdmin wrong password → 403");
  const goodAdmin = await jfetch(app, "/api/visitor-books", { action: "verifyAdmin", password: "smoke-admin" });
  ok(goodAdmin.status === 200 && goodAdmin.json?.ok === true, "verifyAdmin correct password → ok");

  const cur = await jfetch(app, "/api/visitor-books", { action: "toggleCuratedRead", password: "smoke-admin", key: "T|A", read: true });
  ok(cur.status === 200, "toggleCuratedRead as admin");
  g = await jfetch(app, "/api/visitor-books");
  ok(g.json.overrides["T|A"] === true, "curated override present in GET");
}

async function smokeCurriculum(app: App): Promise<void> {
  let g = await jfetch(app, "/api/curriculum");
  ok(g.status === 200 && g.json?.checks && typeof g.json.checks === "object",
    "GET /api/curriculum shape {checks{}}");

  const bad = await jfetch(app, "/api/curriculum", { action: "toggle", password: "wrong", key: "01-1", checked: true });
  ok(bad.status === 403, "curriculum toggle wrong password → 403");

  const badKey = await jfetch(app, "/api/curriculum", { action: "toggle", password: "smoke-admin", key: "../x", checked: true });
  ok(badKey.status === 400, "curriculum toggle invalid key → 400");

  const tog = await jfetch(app, "/api/curriculum", { action: "toggle", password: "smoke-admin", key: "01-1", checked: true });
  ok(tog.status === 200 && tog.json?.checks?.["01-1"] === true, "curriculum toggle as admin");
  g = await jfetch(app, "/api/curriculum");
  ok(g.json.checks["01-1"] === true, "curriculum check persists in GET");

  const verify = await jfetch(app, "/api/curriculum", { action: "verifyAdmin", password: "smoke-admin" });
  ok(verify.status === 200 && verify.json?.ok === true, "curriculum verifyAdmin ok");

  const reset = await jfetch(app, "/api/curriculum", { action: "reset", password: "smoke-admin" });
  ok(reset.status === 200 && Object.keys(reset.json?.checks ?? { x: 1 }).length === 0, "curriculum reset as admin");
  g = await jfetch(app, "/api/curriculum");
  ok(!g.json.checks["01-1"], "curriculum empty after reset");
}

async function smokeModkeys(app: App): Promise<void> {
  let g = await jfetch(app, "/api/modkeys/gallery");
  ok(g.status === 200 && Array.isArray(g.json?.templates), "GET /api/modkeys/gallery shape {templates[]}");

  const snap = { layout: "75", perKeyOverrides: { k1: { text: "A", imageData: "SHOULD_BE_STRIPPED" } } };
  const post = await jfetch(app, "/api/modkeys/gallery", { name: "smoke <b>x</b>", snap });
  ok(post.status === 201 && typeof post.json?.template?.id === "string", "POST gallery → 201 with template id");

  g = await jfetch(app, "/api/modkeys/gallery");
  ok(g.json.templates.length === 1, "gallery has one template");
  const t = g.json.templates[0];
  ok(t.name === "smoke x", "name sanitized (html stripped)");
  ok(t.snap?.perKeyOverrides?.k1 && t.snap.perKeyOverrides.k1.imageData === undefined, "imageData stripped from stored snap");
  ok(t.layout === "75", "layout extracted from snap");

  const badAdmin = await jfetch(app, "/api/modkeys/gallery", { action: "verifyAdmin", password: "wrong" });
  ok(badAdmin.status === 403, "verifyAdmin wrong password → 403");
  const goodAdmin = await jfetch(app, "/api/modkeys/gallery", { action: "verifyAdmin", password: "smoke-admin" });
  ok(goodAdmin.status === 200 && goodAdmin.json?.ok === true, "verifyAdmin correct password → ok");
  /* single-segment alias also works */
  const aliasAdmin = await jfetch(app, "/api/modkeys/verify-admin", { password: "smoke-admin" });
  ok(aliasAdmin.status === 200 && aliasAdmin.json?.ok === true, "POST /modkeys/verify-admin alias ok");

  /* Multi-segment paths returned Vercel NOT_FOUND before Express ever ran.
     Workers has no filesystem routing, so these are now genuinely reachable. */
  const nestedAdmin = await jfetch(app, "/api/modkeys/gallery/verify-admin", { password: "smoke-admin" });
  ok(nestedAdmin.status === 200 && nestedAdmin.json?.ok === true, "POST /modkeys/gallery/verify-admin reachable on Workers");

  const badRename = await jfetch(app, "/api/modkeys/gallery", { action: "rename", password: "wrong", id: t.id, name: "Nope" });
  ok(badRename.status === 403, "rename wrong password → 403");
  const rename = await jfetch(app, "/api/modkeys/gallery", { action: "rename", password: "smoke-admin", id: t.id, name: "Renamed <i>build</i>" });
  ok(rename.status === 200 && rename.json?.template?.name === "Renamed build", "rename as admin sanitizes name");
  g = await jfetch(app, "/api/modkeys/gallery");
  ok(g.json.templates[0]?.name === "Renamed build", "renamed name persists in GET");

  const badDel = await jfetch(app, "/api/modkeys/gallery", { action: "delete", password: "wrong", id: t.id });
  ok(badDel.status === 403, "delete wrong password → 403");
  const missDel = await jfetch(app, "/api/modkeys/gallery", { action: "delete", password: "smoke-admin", id: "nope" });
  ok(missDel.status === 404, "delete unknown id → 404");
  const del = await jfetch(app, "/api/modkeys/gallery", { action: "delete", password: "smoke-admin", id: t.id });
  ok(del.status === 200 && del.json?.ok === true, "delete as admin → ok");
  g = await jfetch(app, "/api/modkeys/gallery");
  ok(g.json.templates.length === 0, "gallery empty after delete");
}

async function smokeMisc(app: App): Promise<void> {
  const unknown = await jfetch(app, "/api/visitor-books", { action: "nope" });
  ok(unknown.status === 400 && unknown.json?.error === "Unknown action", "unknown books action → 400");

  const missingSearch = await jfetch(app, "/api/book-search");
  ok(missingSearch.status === 400, "book search requires a meaningful query");

  /* No cookie → { user: null } rather than a 401. The modkeys page relies on
     this to decide whether to show the sign-in prompt. */
  const me = await jfetch(app, "/api/auth/me");
  ok(me.status === 200 && me.json?.user === null, "GET /api/auth/me without cookie → { user: null }");

  const missing = await jfetch(app, "/api/does-not-exist");
  ok(missing.status === 404, "unknown API path → 404");
}

async function smokeAdminSecretAliases(app: App): Promise<void> {
  process.env.BOOKS_ADMIN_PASSWORD = "smoke-books-secret";
  process.env.MODKEYS_ADMIN_PASSWORD = "smoke-modkeys-secret";

  for (const [label, password] of [
    ["BOOKS_ADMIN_PASSWORD", "smoke-books-secret"],
    ["MODKEYS_ADMIN_PASSWORD", "smoke-modkeys-secret"],
  ] as const) {
    const books = await jfetch(app, "/api/visitor-books", { action: "verifyAdmin", password });
    ok(books.status === 200 && books.json?.ok === true, `Books accepts ${label}`);

    const curriculum = await jfetch(app, "/api/curriculum", { action: "verifyAdmin", password });
    ok(curriculum.status === 200 && curriculum.json?.ok === true, `Curriculum accepts ${label}`);

    const modkeys = await jfetch(app, "/api/modkeys/gallery", { action: "verifyAdmin", password });
    ok(modkeys.status === 200 && modkeys.json?.ok === true, `Modkeys accepts ${label}`);
  }
}

(async () => {
  // Imported dynamically so the env assignments above are applied first.
  const app = (await import("@workspace/api-server")).default as App;
  await smokeBooks(app);
  await smokeCurriculum(app);
  await smokeModkeys(app);
  await smokeMisc(app);
  await smokeAdminSecretAliases(app);
  console.log(`SMOKE OK (${passed} assertions)`);
  process.exit(0);
})().catch((err) => {
  console.error("SMOKE FAIL (unexpected error):", err);
  process.exit(1);
});
