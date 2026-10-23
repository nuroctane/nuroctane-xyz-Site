/**
 * The live quotes bank: /api/quotes.
 *
 * The local quotes pipeline (scripts/run_hermes_quote_sync.py) PUTs the
 * published bank here on every run, and the Quotes pages read it, so a new
 * quote reaches the site without a build or deploy. The bank bundled into the
 * frontend stays as the first paint and the fallback when this has nothing.
 *
 * One KV key holds the bank with its hash in the key's metadata, so a reader
 * never pairs one bank with another bank's ETag.
 */

export interface QuotesEnv {
  QUOTES?: KVNamespace;
  QUOTES_PUBLISH_TOKEN?: string;
}

interface BankMeta {
  sha: string;
  updatedAt: string;
  quotes: number;
  sections: number;
}

const KEY = "bank";
const MAX_BYTES = 4 * 1024 * 1024;
// A publish that drops more than this share of the quotes is refused unless the
// publisher says it is deliberate, so a truncated read can never wipe the page.
const MIN_KEEP = 0.8;
const READ_HEADERS = {
  "content-type": "text/markdown; charset=utf-8",
  // Short browser and edge life: a publish shows within about a minute.
  "cache-control": "public, max-age=60, stale-while-revalidate=300",
  "x-content-type-options": "nosniff",
};

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

const hex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

/** Compares digests, so neither length nor content leaks through timing. */
async function tokenMatches(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([sha256(given), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Section and quote counts, by the parser's rules: `## ` headings other than
 * the index, and runs of `>` lines (one run is one quote). */
export function countBank(text: string): { sections: number; quotes: number } {
  let sections = 0;
  let quotes = 0;
  let inQuote = false;
  for (const line of text.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("## Index")) sections++;
    const quoted = line.startsWith(">");
    if (quoted && !inQuote) quotes++;
    inQuote = quoted;
  }
  return { sections, quotes };
}

async function read(request: Request, env: QuotesEnv): Promise<Response> {
  const stored = env.QUOTES
    ? await env.QUOTES.getWithMetadata<BankMeta>(KEY, { cacheTtl: 60 })
    : null;
  if (!stored?.value || !stored.metadata) {
    return json(404, { error: "No live quotes bank yet; the bundled bank applies." });
  }
  const meta = stored.metadata;
  const etag = `"${meta.sha}"`;
  const headers = { ...READ_HEADERS, etag, "x-quotes-updated": meta.updatedAt };
  const match = request.headers.get("if-none-match");
  if (match && match.split(",").some((tag) => tag.trim().replace(/^W\//, "") === etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === "HEAD" ? null : stored.value, { headers });
}

async function publish(request: Request, env: QuotesEnv): Promise<Response> {
  if (!env.QUOTES || !env.QUOTES_PUBLISH_TOKEN) {
    return json(503, { error: "Live quotes are not configured." });
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !(await tokenMatches(token, env.QUOTES_PUBLISH_TOKEN))) {
    return json(401, { error: "Unauthorized" }, { "www-authenticate": "Bearer" });
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) return json(413, { error: "Bank too large" });
  const text = (await request.text()).replace(/\r\n/g, "\n");
  if (new TextEncoder().encode(text).length > MAX_BYTES) return json(413, { error: "Bank too large" });

  const counts = countBank(text);
  if (!text.includes("## Index") || counts.sections < 1 || counts.quotes < 1) {
    return json(422, { error: "Not a quotes bank: needs an index, sections and quotes." });
  }
  const current = await env.QUOTES.getWithMetadata<BankMeta>(KEY);
  const previous = current.metadata;
  const shrinkOk = request.headers.get("x-allow-shrink") === "1";
  if (previous && !shrinkOk && counts.quotes < previous.quotes * MIN_KEEP) {
    return json(409, {
      error: `Refusing to drop from ${previous.quotes} to ${counts.quotes} quotes; resend with X-Allow-Shrink: 1 if deliberate.`,
    });
  }

  const sha = hex(await sha256(text));
  if (previous?.sha === sha) return json(200, { changed: false, sha, ...counts });
  const meta: BankMeta = { sha, updatedAt: new Date().toISOString(), ...counts };
  await env.QUOTES.put(KEY, text, { metadata: meta });
  return json(200, { changed: true, ...meta });
}

export async function serveQuotes(request: Request, env: QuotesEnv): Promise<Response> {
  if (request.method === "GET" || request.method === "HEAD") return read(request, env);
  if (request.method === "PUT") return publish(request, env);
  return new Response(null, { status: 405, headers: { allow: "GET, HEAD, PUT" } });
}
