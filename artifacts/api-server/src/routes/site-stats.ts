/* Public site statistics for /stats.
 *
 * GET /api/site-stats?range=7d|30d|90d
 *
 * Read from PostHog's query API (HogQL), the same way the Tuner Society
 * console's Stats screen does. The PostHog project is shared by several sites,
 * so every query is scoped to this site's hosts.
 *
 * The page is public and PostHog allows about 120 queries an hour for the
 * whole project, which the Tuner Society console also spends. So one query per
 * range answers everything the page draws, and the answer is kept in KV for
 * FRESH_MS and served stale while a refresh runs in the background. Worst case
 * is three refreshes per FRESH_MS, whatever the traffic.
 *
 * Only aggregates leave this route: counts per day, per country, per known
 * page, and per outbound link. No person, IP, city or event-level data.
 *
 * Needs the POSTHOG_API_KEY secret (a personal API key with query:read on
 * project POSTHOG_PROJECT_ID). Without it the route answers
 * { connected: false } and the page says so.
 */
import { Hono } from "hono";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";

const router = new Hono();

export const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;
const DEFAULT_RANGE: RangeKey = "30d";
const FRESH_MS = 10 * 60 * 1000;
const QUERY_TIMEOUT_MS = 20_000;
const MAX_LINKS = 80;
const HOSTS = ["nuroctane.xyz", "www.nuroctane.xyz"];

/** Pages whose views the stats page reports. A fixed list, so an arbitrary
 *  path someone typed never ends up published. */
export const TRACKED_PATHS = [
  "/", "/books", "/quotes", "/blog", "/github", "/stats",
  "/cli", "/modkeys", "/observatory", "/curriculum",
] as const;

export interface DayStat { day: string; views: number; visitors: number }
export interface CountryStat { code: string; name: string; visitors: number; views: number }
export interface LinkStat { href: string; host: string; clicks: number; visitors: number }
export interface SiteStats {
  connected: true;
  at: string;
  range: { key: RangeKey; days: number; from: string; to: string };
  totals: { views: number; visitors: number };
  daily: DayStat[];
  countries: CountryStat[];
  pages: Record<string, { views: number; visitors: number }>;
  links: LinkStat[];
}

function config() {
  const apiKey = String(process.env.POSTHOG_API_KEY ?? "").trim();
  const projectId = String(process.env.POSTHOG_PROJECT_ID ?? "").trim();
  if (!apiKey || !projectId) return null;
  const host = String(process.env.POSTHOG_API_HOST || "https://us.posthog.com").replace(/\/+$/, "");
  return { apiKey, projectId, host };
}

/** One HogQL statement for the whole page, so a refresh costs one query. */
export function hogql(days: number): string {
  const hosts = HOSTS.map((h) => `'${h}'`).join(", ");
  const span = Math.max(1, Math.floor(days)) - 1;
  // Calendar days in the project's time zone, today included.
  const where = `properties.$host IN (${hosts}) AND toDate(timestamp) >= today() - ${span}`;
  const paths = TRACKED_PATHS.map((p) => `'${p}'`).join(", ");
  const pageview = `event = '$pageview' AND ${where}`;
  return [
    // The aggregate row always exists, even with no events, and carries today.
    `SELECT 'total' AS kind, toString(today()) AS day, '' AS k, '' AS label, count() AS n, count(DISTINCT distinct_id) AS u FROM events WHERE ${pageview}`,
    `SELECT 'day' AS kind, toString(toDate(timestamp)) AS day, '' AS k, '' AS label, count() AS n, count(DISTINCT distinct_id) AS u FROM events WHERE ${pageview} GROUP BY day`,
    `SELECT 'country' AS kind, '' AS day, coalesce(toString(properties.$geoip_country_code), '') AS k, coalesce(toString(properties.$geoip_country_name), '') AS label, count() AS n, count(DISTINCT distinct_id) AS u FROM events WHERE ${pageview} GROUP BY k, label`,
    `SELECT 'page' AS kind, '' AS day, toString(properties.$pathname) AS k, '' AS label, count() AS n, count(DISTINCT distinct_id) AS u FROM events WHERE ${pageview} AND properties.$pathname IN (${paths}) GROUP BY k`,
    `SELECT 'link' AS kind, '' AS day, coalesce(toString(properties.href), '') AS k, coalesce(toString(properties.host), '') AS label, count() AS n, count(DISTINCT distinct_id) AS u FROM events WHERE event = 'Outbound Link' AND ${where} GROUP BY k, label`,
  ].join("\nUNION ALL\n");
}

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (iso: string, delta: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + delta * DAY_MS).toISOString().slice(0, 10);

/** Outbound hrefs keyed by host + path, so `?ref=` variants count as one link. */
function linkKey(href: string): { href: string; host: string } | null {
  try {
    const url = new URL(href);
    if (!/^https?:$/.test(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "") || "";
    return { href: `https://${host}${path}`, host };
  } catch {
    return null;
  }
}

/** PostHog's rows (`[kind, day, k, label, n, u]`) into the page's shape. */
export function statsFromRows(rows: unknown[][], rangeKey: RangeKey, at: Date): SiteStats {
  const days = RANGES[rangeKey];
  let today = at.toISOString().slice(0, 10);
  const totals = { views: 0, visitors: 0 };
  const byDay = new Map<string, DayStat>();
  const countries: CountryStat[] = [];
  const pages: SiteStats["pages"] = {};
  const links = new Map<string, LinkStat>();

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const [kind, day, k, label] = row.map((v) => String(v ?? ""));
    const n = Number(row[4]) || 0;
    const u = Number(row[5]) || 0;
    if (kind === "total") {
      totals.views = n;
      totals.visitors = u;
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) today = day;
    } else if (kind === "day" && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
      byDay.set(day, { day, views: n, visitors: u });
    } else if (kind === "country") {
      countries.push({ code: k.toUpperCase().slice(0, 2), name: label || "", visitors: u, views: n });
    } else if (kind === "page" && (TRACKED_PATHS as readonly string[]).includes(k)) {
      pages[k] = { views: n, visitors: u };
    } else if (kind === "link") {
      const key = linkKey(k);
      if (!key) continue;
      const held = links.get(key.href) ?? { href: key.href, host: key.host, clicks: 0, visitors: 0 };
      held.clicks += n;
      // Visitors per normalized link can only be approximated by the largest
      // variant; summing distinct counts would double-count people.
      held.visitors = Math.max(held.visitors, u);
      links.set(key.href, held);
    }
  }

  // Every calendar day in the range, zeros included, so the chart's x axis is
  // continuous.
  const from = addDays(today, -(days - 1));
  const daily: DayStat[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    daily.push(byDay.get(day) ?? { day, views: 0, visitors: 0 });
  }

  countries.sort((a, b) => b.visitors - a.visitors || b.views - a.views);
  return {
    connected: true,
    at: at.toISOString(),
    range: { key: rangeKey, days, from, to: today },
    totals,
    daily,
    countries,
    pages,
    links: [...links.values()].sort((a, b) => b.clicks - a.clicks).slice(0, MAX_LINKS),
  };
}

async function queryPostHog(rangeKey: RangeKey): Promise<SiteStats> {
  const cfg = config();
  if (!cfg) throw new Error("not-connected");
  let response: Response;
  try {
    response = await fetch(`${cfg.host}/api/projects/${encodeURIComponent(cfg.projectId)}/query/`, {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: hogql(RANGES[rangeKey]) } }),
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`PostHog didn't answer (${err instanceof Error ? err.name : "error"})`);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail: detail.slice(0, 300) }, "PostHog site-stats query failed");
    throw new Error(`PostHog answered ${response.status}`);
  }
  const data = (await response.json()) as { results?: unknown[][] };
  return statsFromRows(Array.isArray(data.results) ? data.results : [], rangeKey, new Date());
}

const kvKey = (range: RangeKey) => `site-stats:v1:${range}`;
interface Held { at: number; value: SiteStats }

/* Single-flight per isolate and range: a burst of requests on a stale range
 * starts one query, not one each. Cleared on settle (a timer would not be
 * guaranteed to run after the response on Workers). */
const inflight = new Map<RangeKey, Promise<SiteStats>>();
function refresh(range: RangeKey): Promise<SiteStats> {
  let pending = inflight.get(range);
  if (!pending) {
    pending = queryPostHog(range)
      .then(async (value) => {
        await kvSet(kvKey(range), { at: Date.now(), value } satisfies Held).catch((err) =>
          logger.warn({ err }, "site-stats cache write failed"),
        );
        return value;
      })
      .finally(() => inflight.delete(range));
    inflight.set(range, pending);
  }
  return pending;
}

router.get("/site-stats", async (c) => {
  const requested = c.req.query("range") ?? DEFAULT_RANGE;
  const range: RangeKey = requested in RANGES ? (requested as RangeKey) : DEFAULT_RANGE;

  if (!config()) {
    c.header("Cache-Control", "public, max-age=60");
    return c.json({ connected: false });
  }

  const held = await kvGet<Held>(kvKey(range)).catch(() => null);
  if (held?.value && Date.now() - held.at < FRESH_MS) {
    c.header("Cache-Control", "public, max-age=60");
    return c.json(held.value);
  }
  if (held?.value) {
    c.executionCtx.waitUntil(refresh(range).catch((err) => logger.warn({ err }, "site-stats background refresh failed")));
    c.header("Cache-Control", "public, max-age=30");
    return c.json({ ...held.value, stale: true });
  }
  try {
    const value = await refresh(range);
    c.header("Cache-Control", "public, max-age=60");
    return c.json(value);
  } catch (err) {
    logger.error({ err }, "site-stats unavailable");
    c.header("Cache-Control", "no-store");
    return c.json({ connected: true, error: "Stats are unavailable right now." }, 502);
  }
});

export default router;
