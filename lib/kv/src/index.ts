/* CONTRACT-GUARDED FILE.
 * The response shapes and paths depending on this module are asserted by
 * scripts/src/smoke.ts, which runs inside the Vercel buildCommand. Changing
 * behavior here without updating the smoke test will fail every deploy.
 * Do not weaken or bypass the smoke test.
 *
 * KV_MEMORY=1 switches to an in-process Map (used by the smoke test only;
 * never set in production).
 *
 * Cost hardening: all REST calls have 4s timeout + single retry with jitter
 * to avoid hanging Vercel Functions (40% timeout observed in prod).
 */
const memStore = new Map<string, string>();
const useMemory = () => process.env.KV_MEMORY === "1";

const URL = () => process.env.nuroctanesitestorage_KV_REST_API_URL;
const TOKEN = () => process.env.nuroctanesitestorage_KV_REST_API_TOKEN;

const FETCH_TIMEOUT_MS = 4000;
const RETRY_DELAY_MS = 250;

function requireEnv() {
  const url = URL();
  const token = TOKEN();
  if (!url || !token) {
    throw new Error(
      "KV env vars (nuroctanesitestorage_KV_REST_API_URL, nuroctanesitestorage_KV_REST_API_TOKEN) must be set",
    );
  }
  return { url, token };
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, {
      ...rest,
      signal: rest.signal ?? ctrl.signal,
      // upstash is json — no need to revalidate
      cache: "no-store" as any,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        const jitter = Math.random() * RETRY_DELAY_MS;
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS + jitter));
      }
    }
  }
  throw lastErr;
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  if (useMemory()) {
    const raw = memStore.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  return withRetry(async () => {
    const { url, token } = requireEnv();
    const res = await fetchWithTimeout(
      `${url}/get/${encodeURIComponent(key)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status}`);
    const data = (await res.json()) as { result: string | null };
    return data.result ? (JSON.parse(data.result) as T) : null;
  });
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (useMemory()) {
    memStore.set(key, JSON.stringify(value));
    return;
  }
  return withRetry(async () => {
    const { url, token } = requireEnv();
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(value)]),
      timeoutMs: FETCH_TIMEOUT_MS + 1000,
    });
    if (!res.ok) throw new Error(`KV SET ${key} failed: ${res.status}`);
  });
}

export async function kvDelete(key: string): Promise<void> {
  if (useMemory()) {
    memStore.delete(key);
    return;
  }
  return withRetry(async () => {
    const { url, token } = requireEnv();
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["DEL", key]),
    });
    if (!res.ok) throw new Error(`KV DEL ${key} failed: ${res.status}`);
  });
}

export async function kvList(prefix: string): Promise<string[]> {
  if (useMemory()) {
    return [...memStore.keys()].filter((k) => k.startsWith(prefix));
  }
  return withRetry(async () => {
    const { url, token } = requireEnv();
    const res = await fetchWithTimeout(
      `${url}/keys/${encodeURIComponent(prefix)}*`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) throw new Error(`KV LIST ${prefix} failed: ${res.status}`);
    const data = (await res.json()) as { result: string[] };
    return data.result ?? [];
  });
}
