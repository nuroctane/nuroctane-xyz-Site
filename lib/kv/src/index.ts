const URL = () => process.env.nuroctanesitestorage_KV_REST_API_URL;
const TOKEN = () => process.env.nuroctanesitestorage_KV_REST_API_TOKEN;

function requireEnv() {
  const url = URL();
  const token = TOKEN();
  if (!url || !token) {
    throw new Error("KV env vars (nuroctanesitestorage_KV_REST_API_URL, nuroctanesitestorage_KV_REST_API_TOKEN) must be set");
  }
  return { url, token };
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const { url, token } = requireEnv();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status}`);
  const data = await res.json() as { result: string | null };
  return data.result ? JSON.parse(data.result) as T : null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const { url, token } = requireEnv();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", key, JSON.stringify(value)]),
  });
  if (!res.ok) throw new Error(`KV SET ${key} failed: ${res.status}`);
}

export async function kvDelete(key: string): Promise<void> {
  const { url, token } = requireEnv();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["DEL", key]),
  });
  if (!res.ok) throw new Error(`KV DEL ${key} failed: ${res.status}`);
}

export async function kvList(prefix: string): Promise<string[]> {
  const { url, token } = requireEnv();
  const res = await fetch(`${url}/keys/${encodeURIComponent(prefix)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV LIST ${prefix} failed: ${res.status}`);
  const data = await res.json() as { result: string[] };
  return data.result ?? [];
}
