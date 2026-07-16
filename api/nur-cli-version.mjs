/**
 * Live NurCLI version from GitHub Releases.
 *
 * GET /api/nur-cli-version
 *   → { version, tag, name, publishedAt, htmlUrl, fetchedAt }
 *
 * GET /api/nur-cli-version?stream=1
 *   → text/event-stream (initial + ~60s refresh while connection lives)
 *
 * Edge runtime (same pattern as api/og.mjs).
 */

export const config = { runtime: 'edge' };

const UPSTREAM =
  'https://api.github.com/repos/nuroctane/nur-cli/releases/latest';
const CACHE_MS = 2 * 60 * 1000;
const STREAM_MS = 60 * 1000;

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
    htmlUrl:
      data.html_url ||
      'https://github.com/nuroctane/nur-cli/releases/latest',
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchLatest() {
  const now = Date.now();
  if (mem && now - mem.at < CACHE_MS) return mem.payload;

  const res = await fetch(UPSTREAM, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nuroctane.xyz-cli-version',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 180)}`);
  }

  const data = await res.json();
  const payload = normalize(data);
  mem = { at: now, payload };
  return payload;
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

    const url = new URL(request.url);
    const wantStream =
      url.searchParams.get('stream') === '1' ||
      (request.headers.get('accept') || '').includes('text/event-stream');

    if (!wantStream) {
      const payload = await fetchLatest();
      return json(payload, 200, {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      });
    }

    const encoder = new TextEncoder();
    let timer = null;
    let closed = false;

    const body = new ReadableStream({
      async start(controller) {
        const push = (event, data) => {
          if (closed) return;
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        const tick = async () => {
          try {
            const payload = await fetchLatest();
            push('version', payload);
          } catch (err) {
            push('error', {
              message: err?.message || String(err),
              at: new Date().toISOString(),
            });
          }
        };

        push('hello', { source: 'github-releases', repo: 'nuroctane/nur-cli' });
        await tick();
        timer = setInterval(tick, STREAM_MS);

        // Keepalive comments so proxies don't idle-close
        // (also resets some edge idle timers)
      },
      cancel() {
        closed = true;
        if (timer) clearInterval(timer);
      },
    });

    return new Response(body, {
      status: 200,
      headers: cors({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      }),
    });
  } catch (err) {
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
