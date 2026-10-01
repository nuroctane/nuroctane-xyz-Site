/**
 * Cloudflare Worker for static assets, the Hono API, crawler metadata,
 * pre-rendered share cards, audio byte ranges, and daily contributions.
 *
 * Static assets are served by the ASSETS binding and never invoke this Worker
 * unless the path is listed in assets.run_worker_first (see wrangler.jsonc).
 * MP3s deliberately take that path so serveAudioAsset() can satisfy browser
 * byte ranges instead of forcing a full 13.5 MB transfer.
 */
import app from "@workspace/api-server";
import { refreshContributions } from "@workspace/api-server/github-contrib";
import { isBot, botResponse } from "./og-meta";

export interface Env {
  ASSETS: Fetcher;
}

interface ByteRange {
  start: number;
  end: number;
}

/** Parse the single byte range used by HTML media elements. */
export function parseByteRange(value: string, size: number): ByteRange | null {
  if (!value.startsWith("bytes=") || value.includes(",") || size <= 0)
    return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
    if (start >= size || end < start) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

/**
 * Workers Static Assets currently ignores Range and returns the complete MP3.
 * Convert that full, cached asset into the RFC 9110 single-range response that
 * browsers expect. This fixes delivery; it does not pause, restart, or seek the
 * audio element.
 */
async function serveAudioAsset(request: Request, env: Env): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.delete("range");
  headers.delete("if-range");
  const assetRequest = new Request(request, { headers });
  const asset = await env.ASSETS.fetch(assetRequest);

  if (!asset.ok || (request.method !== "GET" && request.method !== "HEAD")) {
    return asset;
  }

  const responseHeaders = new Headers(asset.headers);
  responseHeaders.set("Accept-Ranges", "bytes");

  const rangeHeader = request.headers.get("range");
  const ifRange = request.headers.get("if-range");
  const etag = asset.headers.get("etag");
  if (!rangeHeader || (ifRange && etag && ifRange !== etag)) {
    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: asset.status,
      statusText: asset.statusText,
      headers: responseHeaders,
    });
  }

  const contentLength = asset.headers.get("content-length");
  let size = contentLength === null ? Number.NaN : Number(contentLength);
  let body: ArrayBuffer | null = null;
  if (!Number.isSafeInteger(size) || size < 0) {
    body = await asset.arrayBuffer();
    size = body.byteLength;
  }

  const range = parseByteRange(rangeHeader, size);
  if (!range) {
    responseHeaders.set("Content-Range", `bytes */${size}`);
    responseHeaders.set("Content-Length", "0");
    return new Response(null, { status: 416, headers: responseHeaders });
  }

  responseHeaders.set(
    "Content-Range",
    `bytes ${range.start}-${range.end}/${size}`,
  );
  responseHeaders.set("Content-Length", String(range.end - range.start + 1));

  if (request.method === "HEAD") {
    return new Response(null, { status: 206, headers: responseHeaders });
  }

  body ??= await asset.arrayBuffer();
  return new Response(body.slice(range.start, range.end + 1), {
    status: 206,
    headers: responseHeaders,
  });
}

/** Preserve public share-card URLs using assets from this deployment. */
async function serveOg(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const requested =
    new URL(request.url).searchParams.get("page")?.toLowerCase() ?? "home";
  const pages = new Set([
    "home",
    "quotes",
    "books",
    "resume",
    "modkeys",
    "cli",
    "observatory",
    "orbit",
    "blog",
    "socials",
    "projects",
    "fin",
  ]);
  const page = pages.has(requested) ? requested : "home";
  const asset = new URL(`/assets/og/${page}.png`, request.url);
  return env.ASSETS.fetch(new Request(asset, { method: request.method }));
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Plain http:// on the production hosts was served as-is (no zone-level
    // HTTPS redirect). Local `wrangler dev` stays on http.
    if (
      url.protocol === "http:" &&
      /(^|\.)nuroctane\.xyz$/.test(url.hostname)
    ) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (
      url.pathname.startsWith("/assets/nodes/") &&
      url.pathname.endsWith(".mp3")
    ) {
      return serveAudioAsset(request, env);
    }

    if (url.pathname === "/api/og" || url.pathname.startsWith("/api/og/")) {
      return serveOg(request, env);
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
   * Scheduled execution cannot be invoked through a public HTTP header.
   */
  async scheduled(
    _event: ScheduledController,
    _env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
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
