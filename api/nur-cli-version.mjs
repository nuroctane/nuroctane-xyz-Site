/**
 * Live NurCLI version from GitHub Releases — optimized for cost.
 *
 * Previously supported ?stream=1 SSE which held Edge connections open
 * indefinitely (burning Edge Requests + GitHub API quota). Now always
 * returns cached JSON. Client polls sparingly (5m) with visibility guard.
 *
 * GET /api/nur-cli-version → { version, tag, name, publishedAt, htmlUrl, fetchedAt }
 */
export const config = { runtime: 'edge' };

const UPSTREAM = 'https://api.github.com/repos/nuroctane/nur-cli/releases/latest';
const CACHE_MS = 5 * 60 * 1000; // 5 min in-memory per isolate
const FETCH_TIMEOUT_MS = 6_000;

/** @type {{ at: number, payload: Record<string, unknown> } | null} */
let mem = null;

function cors(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  };
}

function normalize(data) {
  const tag = String(data.tag_name || data.name || '').trim();
  const version = tag.replace(/^v/i, '') || 'unknown';
  return {
    version,
    tag: tag || `v${version}`,
    name: data.name || tag || null,
    publishedAt: data.published_at || null,
    htmlUrl: data.html_url || 'https://github.com/nuroctane/nur-cli/releases/latest',
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchLatest() {
  const now = Date.now();
  if (mem && now - mem.at < CACHE_MS) return mem.payload;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(UPSTREAM, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'nuroctane.xyz-cli-version-v2',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: ctrl.signal,
      // @ts-ignore edge supports cache option
      cache: 'no-store',
    });

    if (!res.ok) {
      // On 304 or rate limit — serve stale if we have it
      if (mem) return mem.payload;
      const body = await res.text().catch(() => '');
      throw new Error(`GitHub ${res.status}: ${body.slice(0, 180)}`);
    }

    const data = await res.json();
    const payload = normalize(data);
    mem = { at: now, payload };
    return payload;
  } finally {
    clearTimeout(t);
  }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors({
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    }),
  });
}

export default async function handler(request) {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, OPTIONS' });
    }

    const payload = await fetchLatest();

    // Strong CDN caching — reduces origin hits by ~90%
    // s-maxage 300 = 5min at edge, stale-while-revalidate 1h for bursts
    return json(payload, 200, {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    });
  } catch (err) {
    // Serve stale memory on error if possible — avoids 502 spikes
    if (mem) {
      return json({ ...mem.payload, stale: true }, 200, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
    }
    return json(
      {
        error: err?.message || 'Failed to fetch release',
        version: null,
      },
      502,
      { 'Cache-Control': 'no-store' },
    );
  }
}
