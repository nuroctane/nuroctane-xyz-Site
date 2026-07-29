/**
 * Live NurCLI version from GitHub Releases.
 *
 * Ported from the Vercel edge function api/nur-cli-version.mjs. The logic is
 * unchanged: 5-minute per-isolate memory cache, 6s timeout, serve-stale on
 * upstream error. Per-isolate caching behaves the same on Workers as it did on
 * Vercel Edge — module scope lives for the life of the isolate.
 *
 * GET /api/nur-cli-version → { version, tag, name, publishedAt, htmlUrl, fetchedAt }
 */
import { Hono } from "hono";

const router = new Hono();

const UPSTREAM = "https://api.github.com/repos/nuroctane/nur-cli/releases/latest";
const CACHE_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6_000;

interface ReleasePayload {
  version: string;
  tag: string;
  name: string | null;
  publishedAt: string | null;
  htmlUrl: string;
  fetchedAt: string;
}

let mem: { at: number; payload: ReleasePayload } | null = null;

function normalize(data: Record<string, unknown>): ReleasePayload {
  const tag = String(data.tag_name || data.name || "").trim();
  const version = tag.replace(/^v/i, "") || "unknown";
  return {
    version,
    tag: tag || `v${version}`,
    name: (data.name as string) || tag || null,
    publishedAt: (data.published_at as string) || null,
    htmlUrl: (data.html_url as string) || "https://github.com/nuroctane/nur-cli/releases/latest",
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchLatest(): Promise<ReleasePayload> {
  const now = Date.now();
  if (mem && now - mem.at < CACHE_MS) return mem.payload;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(UPSTREAM, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "nuroctane.xyz-cli-version-v2",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: ctrl.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      // On 304 or rate limit — serve stale if we have it
      if (mem) return mem.payload;
      const body = await res.text().catch(() => "");
      throw new Error(`GitHub ${res.status}: ${body.slice(0, 180)}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const payload = normalize(data);
    mem = { at: now, payload };
    return payload;
  } finally {
    clearTimeout(t);
  }
}

router.get("/nur-cli-version", async (c) => {
  try {
    const payload = await fetchLatest();
    // CDN-Cache-Control is honoured by Cloudflare; the Vercel-CDN-Cache-Control
    // header the original also sent has no meaning here and was dropped.
    c.header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    c.header("CDN-Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    return c.json(payload);
  } catch (err) {
    // Serve stale memory on error if possible — avoids 502 spikes
    if (mem) {
      c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return c.json({ ...mem.payload, stale: true });
    }
    c.header("Cache-Control", "no-store");
    return c.json(
      { error: (err as Error)?.message || "Failed to fetch release", version: null },
      502,
    );
  }
});

export default router;
