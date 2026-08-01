/**
 * nuroctane.xyz — Cloudflare Worker entry point.
 *
 * Replaces, in one Worker, what Vercel spread across five functions plus edge
 * middleware:
 *   middleware.js                  → the bot-OG branch below
 *   api/[[...slug]].mjs            ┐
 *   api/visitor-books.mjs          ├ one Hono app (artifacts/api-server)
 *   api/modkeys/[[...slug]].mjs    ┘
 *   api/nur-cli-version.mjs        → a route in that same app
 *   api/og.mjs                     → still on Vercel, proxied below
 *   vercel.json crons              → the scheduled() handler
 *
 * Static assets are served by the ASSETS binding and never invoke this Worker
 * unless the path is listed in assets.run_worker_first (see wrangler.jsonc).
 * MP3s deliberately take that path so Workers Caching can satisfy browser byte
 * ranges with 206 responses instead of forcing a full 13.5 MB transfer.
 */
import app from "@workspace/api-server";
import { refreshContributions } from "@workspace/api-server/github-contrib";
import { isBot, botResponse } from "./og-meta";

export interface Env {
  ASSETS: Fetcher;
  /** Origin of the trimmed-down Vercel project that still hosts api/og.mjs. */
  OG_ORIGIN?: string;
}

const SITE = "https://www.nuroctane.xyz";
const OG_TIMEOUT_MS = 10_000;

/**
 * Serve /api/og from the residual Vercel deployment.
 *
 * The OG image URL is baked into every crawler document as an absolute
 * https://www.nuroctane.xyz/api/og?... URL, and X in particular is fussy about
 * these, so proxying keeps the URL on our own domain rather than exposing a
 * *.vercel.app host in the meta tags.
 *
 * Responses are cached in Cloudflare's cache, so in steady state this costs one
 * Worker invocation per distinct card per edge location.
 */
async function proxyOg(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);

  if (!env.OG_ORIGIN) {
    // Degrade to the static card rather than serving a broken image.
    return Response.redirect(`${SITE}/opengraph.jpg`, 302);
  }

  const upstream = new URL(url.pathname + url.search, env.OG_ORIGIN);
  const cacheKey = new Request(upstream.toString(), { method: "GET" });
  const cache = caches.default;

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream.toString(), {
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "nuroctane.xyz-og-proxy/1.0",
      },
      signal: AbortSignal.timeout(OG_TIMEOUT_MS),
    });
  } catch (err) {
    console.warn("OG upstream fetch failed", err);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${SITE}/opengraph.jpg`,
        "X-OG-Fallback": "fetch-error",
      },
    });
  }

  if (!upstreamRes.ok) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${SITE}/opengraph.jpg`,
        "X-OG-Fallback": `upstream-${upstreamRes.status}`,
      },
    });
  }

  const res = new Response(upstreamRes.body, upstreamRes);
  // Long CDN TTL — cards only change when the code that draws them changes.
  res.headers.set("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/og" || url.pathname.startsWith("/api/og/")) {
      return proxyOg(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }

    // Crawlers get route-specific OG tags; humans fall through to the SPA.
    if (isBot(request.headers.get("user-agent") ?? "")) {
      const bot = botResponse(url.pathname);
      if (bot) return bot;
    }

    return env.ASSETS.fetch(request);
  },

  /**
   * Daily GitHub contribution refresh (see triggers.crons in wrangler.jsonc).
   *
   * This replaces the Vercel cron that POSTed to /api/github-contrib/refresh
   * and authenticated itself with a spoofable `x-vercel-cron: 1` header. A
   * scheduled handler is not publicly reachable, so that check is gone.
   */
  async scheduled(_event: ScheduledController, _env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      refreshContributions()
        .then((p) =>
          console.log(
            JSON.stringify({
              level: "info",
              msg: "cron: github contrib refreshed",
              username: p.username,
              days: p.data.length,
              totalContributions: p.totalContributions,
            }),
          ),
        )
        .catch((err) =>
          console.error(
            JSON.stringify({
              level: "error",
              msg: "cron: github contrib refresh failed",
              err: String(err),
            }),
          ),
        ),
    );
  },
};
