/**
 * Per-IP limits on API writes (Cloudflare rate-limit bindings, wrangler.jsonc).
 *
 * The Books and Modkeys write endpoints take anonymous posts and keep capped
 * lists: 250 visitor books, 100 gallery builds where each new build pushes the
 * oldest out. Without a limit one script can fill the library or flush every
 * real build, and guess the admin password as fast as it likes. Counts are per
 * Cloudflare location and only enforce on the custom domains (the binding never
 * denies on workers.dev).
 */

export interface LimitsEnv {
  API_WRITES?: RateLimit;
  ADMIN_TRIES?: RateLimit;
}

const tooMany = (what: string) =>
  new Response(JSON.stringify({ error: `Too many ${what}. Please wait a minute and try again.` }), {
    status: 429,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "60",
    },
  });

async function allowed(limiter: RateLimit | undefined, key: string): Promise<boolean> {
  if (!limiter) return true;
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    return true; // a limiter outage must not take the API down with it
  }
}

/** Sends a password? Bodies here are small JSON, so peeking a clone is cheap. */
async function carriesPassword(request: Request): Promise<boolean> {
  if (!(request.headers.get("content-type") ?? "").includes("json")) return false;
  try {
    const body = (await request.clone().json()) as { password?: unknown } | null;
    return typeof body?.password === "string" && body.password.length > 0;
  } catch {
    return false;
  }
}

/** A 429 for an over-limit write, or null to let it through. */
export async function limitWrite(request: Request, env: LimitsEnv): Promise<Response | null> {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") return null;
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (!(await allowed(env.API_WRITES, ip))) return tooMany("changes");
  if ((await carriesPassword(request)) && !(await allowed(env.ADMIN_TRIES, ip))) {
    return tooMany("admin attempts");
  }
  return null;
}
