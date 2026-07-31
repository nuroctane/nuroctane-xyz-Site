/**
 * PostHog reverse proxy — Cloudflare Worker (US region).
 * https://posthog.com/docs/advanced/proxy/cloudflare
 */

const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "*");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function retrieveAsset(request, pathname, ctx) {
  const cached = await caches.default.match(request);
  if (cached) return cached;
  const response = await fetch(`https://${ASSET_HOST}${pathname}`);
  ctx.waitUntil(caches.default.put(request, response.clone()));
  return response;
}

async function forwardRequest(request, pathWithSearch) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.set("X-Forwarded-For", ip);

  const init = {
    method: request.method,
    headers,
    redirect: request.redirect,
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(`https://${API_HOST}${pathWithSearch}`, init);
}

async function handleRequest(request, ctx) {
  if (request.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, { status: 204 }));
  }

  const url = new URL(request.url);
  const pathWithParams = url.pathname + url.search;
  const isAsset =
    url.pathname.startsWith("/static/") || url.pathname.startsWith("/array/");

  const upstream = isAsset
    ? await retrieveAsset(request, pathWithParams, ctx)
    : await forwardRequest(request, pathWithParams);

  return addCorsHeaders(upstream);
}

export default {
  async fetch(request, _env, ctx) {
    return handleRequest(request, ctx);
  },
};
