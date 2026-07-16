/**
 * Live NurCLI version from GitHub Releases.
 *
 * GET /api/nur-cli-version
 *   → JSON { version, tag, name, publishedAt, htmlUrl, fetchedAt }
 *
 * GET /api/nur-cli-version?stream=1
 *   → text/event-stream — initial event + refresh ~every 60s
 *
 * Caches upstream GitHub for 2 minutes in-memory (warm instance) and
 * sends CDN-friendly Cache-Control for the JSON path.
 */

const UPSTREAM =
  'https://api.github.com/repos/nuroctane/nur-cli/releases/latest';
const CACHE_MS = 2 * 60 * 1000;
const STREAM_MS = 60 * 1000;

/** @type {{ at: number, payload: object } | null} */
let mem = null;

function cors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
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
    const err = new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const payload = normalize(data);
  mem = { at: now, payload };
  return payload;
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: cors({ Allow: 'GET, OPTIONS' }),
    });
  }

  const url = new URL(request.url);
  const stream = url.searchParams.get('stream') === '1'
    || (request.headers.get('accept') || '').includes('text/event-stream');

  if (stream) {
    const encoder = new TextEncoder();
    let closed = false;
    let timer = null;

    const streamBody = new ReadableStream({
      async start(controller) {
        const send = async () => {
          if (closed) return;
          try {
            const payload = await fetchLatest();
            const line = `event: version\ndata: ${JSON.stringify(payload)}\n\n`;
            controller.enqueue(encoder.encode(line));
          } catch (err) {
            const line = `event: error\ndata: ${JSON.stringify({
              message: err?.message || String(err),
              at: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(line));
          }
        };

        // hello + first payload
        controller.enqueue(
          encoder.encode(
            `event: hello\ndata: ${JSON.stringify({ source: 'github-releases', repo: 'nuroctane/nur-cli' })}\n\n`,
          ),
        );
        await send();
        timer = setInterval(send, STREAM_MS);
      },
      cancel() {
        closed = true;
        if (timer) clearInterval(timer);
      },
    });

    return new Response(streamBody, {
      status: 200,
      headers: cors({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      }),
    });
  }

  try {
    const payload = await fetchLatest();
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: cors({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      }),
    });
  } catch (err) {
    const status = err?.status && err.status >= 400 ? err.status : 502;
    return new Response(
      JSON.stringify({
        error: err?.message || 'Failed to fetch release',
        version: null,
      }),
      {
        status,
        headers: cors({
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        }),
      },
    );
  }
}
