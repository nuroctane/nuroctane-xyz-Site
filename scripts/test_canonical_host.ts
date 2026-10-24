// One canonical host (worker/canonical.ts) and the site-wide session cookie
// (artifacts/api-server/src/routes/auth.ts), with GitHub and ASSETS faked.
import assert from "node:assert/strict";

process.env.KV_MEMORY = "1";
process.env.GITHUB_CLIENT_ID = "test-client";
process.env.GITHUB_CLIENT_SECRET = "test-secret";
process.env.JWT_SECRET = "test-jwt-secret";
delete process.env.SITE_ORIGIN;

const { canonicalRedirect } = await import("../worker/canonical");
const { default: worker } = await import("../worker/index");

const APEX = "https://nuroctane.xyz";
const WWW = "https://www.nuroctane.xyz";
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;

const MP3 = new Uint8Array(1000).map((_, i) => i % 256);
const env = {
  ASSETS: {
    async fetch(input: RequestInfo | URL) {
      const { pathname } = new URL(input instanceof Request ? input.url : String(input));
      if (pathname.endsWith(".mp3")) {
        return new Response(MP3, { headers: { "content-type": "audio/mpeg", "content-length": String(MP3.length) } });
      }
      return new Response("<!doctype html><title>spa</title>", { headers: { "content-type": "text/html" } });
    },
  },
} as unknown as Parameters<typeof worker.fetch>[1];

const go = (url: string, init?: RequestInit) => worker.fetch(new Request(url, init), env, ctx);

// The apex redirects to the same path and query on www.
let res = await go(`${APEX}/quotes?ref=x`);
assert.equal(res.status, 301);
assert.equal(res.headers.get("location"), `${WWW}/quotes?ref=x`);

// Plain http on the apex reaches https www in one hop.
res = await go("http://nuroctane.xyz/");
assert.equal(res.status, 301);
assert.equal(res.headers.get("location"), `${WWW}/`);

// Writes keep their method and body (308), reads are 301.
res = await go(`${APEX}/api/visitor-books`, { method: "POST", body: "{}" });
assert.equal(res.status, 308);
assert.equal(res.headers.get("location"), `${WWW}/api/visitor-books`);
assert.equal((await go(`${APEX}/api/healthz`)).status, 301);

// Crawlers and audio on the apex follow the redirect too.
const bot = { "user-agent": "Twitterbot/1.0" };
res = await go(`${APEX}/books`, { headers: bot });
assert.equal(res.status, 301);
assert.equal(res.headers.get("location"), `${WWW}/books`);
assert.equal((await go(`${APEX}/assets/nodes/a.mp3`, { headers: { range: "bytes=0-9" } })).status, 301);

// The OAuth start and callback stay on the apex, where GitHub sends them.
assert.equal(canonicalRedirect(new Request(`${APEX}/api/auth/github`)), null);
assert.equal(canonicalRedirect(new Request(`${APEX}/api/auth/github/callback?code=x`)), null);
assert.equal(canonicalRedirect(new Request(`${APEX}/api/auth/me`))?.status, 301);
assert.equal(canonicalRedirect(new Request(`${WWW}/`)), null);
assert.equal(canonicalRedirect(new Request("http://127.0.0.1:8789/")), null);

// www is served as before: crawler HTML, the API, audio byte ranges, the SPA.
res = await go(`${WWW}/books?ref=x`, { headers: bot });
assert.equal(res.status, 200);
assert.match(await res.text(), new RegExp(`og:url" content="${WWW}/books\\?ref=x"`));
assert.equal((await go(`${WWW}/api/healthz`)).status, 200);
res = await go(`${WWW}/assets/nodes/a.mp3`, { headers: { range: "bytes=10-19" } });
assert.equal(res.status, 206);
assert.equal(res.headers.get("content-range"), "bytes 10-19/1000");
assert.deepEqual([...new Uint8Array(await res.arrayBuffer())], [...MP3.slice(10, 20)]);
assert.equal((await go(`${WWW}/modkeys`)).status, 200);

// Sign-in started on www moves to the apex, which sets the state cookie there.
res = await go(`${WWW}/api/auth/github`);
assert.equal(res.headers.get("location"), `${APEX}/api/auth/github`);
res = await go(`${APEX}/api/auth/github`);
const location = new URL(res.headers.get("location")!);
assert.equal(location.host, "github.com");
assert.equal(location.searchParams.get("redirect_uri"), `${APEX}/api/auth/github/callback`);
const state = location.searchParams.get("state")!;
assert.match(res.headers.get("set-cookie")!, /^oauth_state=[^;]+;.*Path=\/api\/auth/);

// The callback sets the session for the whole site and returns to www.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.includes("/login/oauth/access_token")) return Response.json({ access_token: "gh-token" });
  if (url === "https://api.github.com/user") return Response.json({ id: 42, login: "octo", avatar_url: "https://a/x.png" });
  throw new Error(`unexpected fetch ${url}`);
}) as typeof fetch;
try {
  res = await go(`${APEX}/api/auth/github/callback?code=c&state=${state}`, {
    headers: { cookie: `oauth_state=${state}` },
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), `${WWW}/modkeys`);
  const cookies = res.headers.getSetCookie();
  const session = cookies.find((c) => c.startsWith("token=") && !/Max-Age=0/.test(c))!;
  assert.match(session, /Domain=nuroctane\.xyz/);
  assert.match(session, /HttpOnly/);
  assert.match(session, /Secure/);
  // The old apex-only copy is cleared so it cannot shadow the new one there.
  assert.ok(cookies.some((c) => /^token=;/.test(c) && /Max-Age=0/.test(c) && !/Domain=/.test(c)));

  // That cookie signs the visitor in on www.
  const token = session.split(";")[0];
  res = await go(`${WWW}/api/auth/me`, { headers: { cookie: token } });
  assert.equal((await res.json()).user?.username, "octo");

  // Logout on www clears the same site-wide cookie.
  res = await go(`${WWW}/api/auth/logout`, { method: "POST", headers: { cookie: token } });
  const cleared = res.headers.get("set-cookie")!;
  assert.match(cleared, /^token=;/);
  assert.match(cleared, /Max-Age=0/);
  assert.match(cleared, /Domain=nuroctane\.xyz/);

  // Off the production domain (local dev) the cookie stays host-only.
  res = await go(`${APEX}/api/auth/github`);
  const devState = new URL(res.headers.get("location")!).searchParams.get("state")!;
  const { default: app } = await import("@workspace/api-server");
  res = await app.fetch(
    new Request(`http://localhost:8789/api/auth/github/callback?code=c&state=${devState}`, {
      headers: { cookie: `oauth_state=${devState}` },
    }),
    {},
    ctx,
  );
  assert.equal(res.headers.get("location"), `${APEX}/modkeys`);
  assert.ok(res.headers.getSetCookie().every((c) => !/Domain=/.test(c)));
} finally {
  globalThis.fetch = realFetch;
}

console.log("CANONICAL HOST OK: apex → www (301/308), OAuth stays on apex, site-wide session cookie, www unchanged");
