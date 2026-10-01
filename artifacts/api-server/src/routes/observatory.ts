/* Observatory data proxies.
 *
 * Browsers cannot send the User-Agent CelesTrak and Nominatim require, and
 * CelesTrak does not allow cross-origin reads. These routes keep the live
 * feeds on the same origin and cache them so a page load does not hammer
 * the upstream.
 */
import { Hono } from "hono";
import { logger } from "../lib/logger";

const router = new Hono();

const UPSTREAM_UA = "nuroctane-observatory/1.0 (https://nuroctane.xyz/observatory)";

/** CelesTrak group ids the client is allowed to request. */
const TLE_UPSTREAM: Record<string, string> = {
  visual: "visual",
  stations: "stations",
  starlink: "starlink",
  oneweb: "oneweb",
  planet: "planet",
  iridium: "iridium-NEXT",
  gps: "gps-ops",
  galileo: "galileo",
  glonass: "glo-ops",
  "fengyun-1c-debris": "fengyun-1c-debris",
  "iridium-33-debris": "iridium-33-debris",
  "cosmos-2251-debris": "cosmos-2251-debris",
};

// CelesTrak updates at most every two hours and asks clients not to poll sooner.
const TLE_TTL_MS = 2 * 60 * 60 * 1000;
const tleCache = new Map<string, { at: number; body: string }>();
const tleFailures = new Map<string, number>();
const tlePending = new Map<string, Promise<string>>();

async function fetchTle(set: string, group: string): Promise<string> {
  const pending = tlePending.get(set);
  if (pending) return pending;
  const work = (async () => {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(group)}&FORMAT=tle`;
    try {
      const options: RequestInit & { cf: object } = {
        headers: { Accept: "text/plain", "User-Agent": UPSTREAM_UA },
        signal: AbortSignal.timeout(12_000),
        cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 7200, "400-599": -1 } },
      };
      const r = await fetch(url, options);
      if (!r.ok) {
        // Do not repeat rejected queries and risk an upstream IP block.
        tleFailures.set(set, Date.now() + TLE_TTL_MS);
        throw new Error(`CelesTrak ${r.status}`);
      }
      const body = await r.text();
      if (!/^1 [^\r\n]+\r?\n2 /m.test(body)) throw new Error("Not a TLE catalog");
      tleCache.set(set, { at: Date.now(), body });
      return body;
    } catch (err) {
      if (!tleFailures.has(set)) tleFailures.set(set, Date.now() + 15 * 60 * 1000);
      throw err;
    }
  })();
  tlePending.set(set, work);
  try { return await work; } finally { tlePending.delete(set); }
}

router.get("/observatory/tle", async (c) => {
  const set = c.req.query("set") ?? "";
  const group = Object.hasOwn(TLE_UPSTREAM, set) ? TLE_UPSTREAM[set] : undefined;
  if (!group) return c.json({ error: "unknown set" }, 400);

  const hit = tleCache.get(set);
  if (hit && Date.now() - hit.at < TLE_TTL_MS) {
    c.header("Cache-Control", "public, max-age=7200");
    c.header("X-Observatory-TLE", "cache");
    return c.text(hit.body);
  }

  if ((tleFailures.get(set) ?? 0) > Date.now()) return c.json({ error: "upstream" }, 502);
  tleFailures.delete(set);
  try {
    const body = await fetchTle(set, group);
    c.header("Cache-Control", "public, max-age=7200");
    c.header("X-Observatory-TLE", "live");
    return c.text(body);
  } catch (err) {
    logger.warn({ err, set }, "CelesTrak TLE fetch errored");
    return c.json({ error: "upstream" }, 502);
  }
});

const GEO_TTL_MS = 60 * 60 * 1000;
const geoCache = new Map<string, { at: number; body: string }>();

router.get("/observatory/geocode", async (c) => {
  const q = (c.req.query("q") ?? "").trim();
  if (q.length < 2 || q.length > 120) return c.json({ error: "bad query" }, 400);

  const key = q.toLowerCase();
  const hit = geoCache.get(key);
  if (hit && Date.now() - hit.at < GEO_TTL_MS) {
    c.header("Cache-Control", "public, max-age=300");
    return c.body(hit.body, 200, { "Content-Type": "application/json" });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UPSTREAM_UA },
      signal: AbortSignal.timeout(8_000),
    });
    if (!r.ok) return c.json({ error: "upstream" }, 502);
    const body = await r.text();
    if (!Array.isArray(JSON.parse(body))) return c.json({ error: "upstream" }, 502);
    if (geoCache.size > 80) geoCache.clear();
    geoCache.set(key, { at: Date.now(), body });
    c.header("Cache-Control", "public, max-age=300");
    return c.body(body, 200, { "Content-Type": "application/json" });
  } catch (err) {
    logger.warn({ err }, "Nominatim geocode failed");
    return c.json({ error: "upstream" }, 502);
  }
});

export default router;
