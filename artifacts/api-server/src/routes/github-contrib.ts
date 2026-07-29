/* GitHub contribution calendar cache for the digital-sea GitHub secondary node.
 * GET  /api/github-contrib          — read KV (warm on miss)
 * POST /api/github-contrib/refresh  — manual refresh
 *
 * The daily refresh is a Workers Cron Trigger and calls refreshContributions()
 * directly from the scheduled() handler in worker/index.ts, so it never touches
 * this HTTP surface.
 */
import { Hono } from "hono";
import type { Context } from "hono";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { readBody } from "../lib/body";

const router = new Hono();

const KV_KEY = "github:contrib:nuroctane";
const MAX_AGE_MS = 26 * 60 * 60 * 1000; // 26h — slightly over daily cron
const FETCH_TIMEOUT_MS = 6500;

const contribUser = (): string => process.env.GITHUB_CONTRIB_USER || "nuroctane";

/* Single-flight guard: coalesces concurrent refreshes within an isolate.
 *
 * The Vercel version cleared this on a setTimeout to also coalesce a burst
 * arriving just after completion. That is unsafe on Workers — timers queued
 * after a response returns are not guaranteed to run, which would strand the
 * guard permanently and freeze the cache for the life of the isolate. Clearing
 * on settle keeps the thundering-herd protection that actually matters. */
let refreshing: Promise<ContribPayload> | null = null;

export type ContribDay = {
  date: string;
  count: number;
  week: number;
  day: number;
};

export type ContribPayload = {
  username: string;
  totalContributions: number;
  updatedAt: string;
  data: ContribDay[];
};

function authorized(headers: Headers, body: { password?: string }): boolean {
  const auth = headers.get("authorization") ?? "";
  const cron = process.env.CRON_SECRET || "";
  if (cron && auth === `Bearer ${cron}`) return true;
  const admin = process.env.BOOKS_ADMIN_PASSWORD || "";
  if (admin && body.password === admin) return true;
  return false;
}

function dedupe(days: ContribDay[]): ContribDay[] {
  const byDate = new Map<string, ContribDay>();
  for (const d of days) {
    const prev = byDate.get(d.date);
    if (!prev || d.count > prev.count) byDate.set(d.date, d);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function parseCountFromTooltip(text: string): number {
  if (/no contributions/i.test(text)) return 0;
  const m = text.match(/([\d,]+)\s+contributions?\s+on/i);
  return m ? Number.parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

async function fetchFromHtml(username: string): Promise<ContribPayload> {
  const { signal, done } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: {
        Accept: "text/html",
        "User-Agent": "nuroctane.xyz-contrib-cache-v2",
      },
      signal,
    });
    if (response.status === 404) throw new Error(`User "${username}" not found`);
    if (!response.ok) throw new Error(`GitHub HTML ${response.status}`);

    const html = await response.text();
    if (!html.includes("ContributionCalendar-grid") && !html.includes("js-calendar-graph")) {
      throw new Error(`No contribution calendar for "${username}"`);
    }

    const totalMatch =
      html.match(/([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i) ||
      html.match(/([\d,]+)\s+contributions/i);
    const totalContributions = totalMatch
      ? Number.parseInt(totalMatch[1].replace(/,/g, ""), 10)
      : 0;

    const tooltips = new Map<string, string>();
    for (const match of html.matchAll(
      /for="contribution-day-component-(\d+)-(\d+)"[^>]*>([^<]+)<\/tool-tip>/g,
    )) {
      tooltips.set(`${match[1]}-${match[2]}`, match[3].trim());
    }

    const data: ContribDay[] = [];
    for (const match of html.matchAll(
      /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-(\d+)-(\d+)"/g,
    )) {
      const date = match[1];
      const day = Number.parseInt(match[2], 10);
      const week = Number.parseInt(match[3], 10);
      const tooltip = tooltips.get(`${day}-${week}`) ?? "";
      data.push({
        date,
        week,
        day,
        count: parseCountFromTooltip(tooltip),
      });
    }

    if (data.length === 0) {
      let week = 0;
      for (const match of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g)) {
        const date = match[1];
        const level = Number.parseInt(match[2], 10);
        const d = new Date(`${date}T12:00:00Z`);
        data.push({
          date,
          week: week++,
          day: d.getUTCDay(),
          count: level,
        });
      }
      data.sort((a, b) => a.date.localeCompare(b.date));
      if (data.length) {
        const start = new Date(`${data[0].date}T12:00:00Z`);
        for (const d of data) {
          const t = new Date(`${d.date}T12:00:00Z`);
          const diffDays = Math.floor((t.getTime() - start.getTime()) / 86400000);
          d.week = Math.floor(diffDays / 7);
          d.day = t.getUTCDay();
        }
      }
    }

    const cleaned = dedupe(data);
    const sum = cleaned.reduce((s, d) => s + d.count, 0);
    return {
      username,
      totalContributions: totalContributions || sum,
      updatedAt: new Date().toISOString(),
      data: cleaned,
    };
  } finally {
    done();
  }
}

async function fetchFromGraphQL(username: string, token: string): Promise<ContribPayload> {
  const query = `
    query ($username: String!) {
      user(login: $username) {
        login
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
        }
      }
    }`;
  const { signal, done } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "nuroctane.xyz-contrib-cache-v2",
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal,
    });
    if (!response.ok) throw new Error(`GraphQL ${response.status}`);
    const payload = (await response.json()) as {
      data?: {
        user?: {
          login: string;
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: { contributionDays: { contributionCount: number; date: string; weekday: number }[] }[];
            };
          };
        } | null;
      };
      errors?: { message: string }[];
    };
    if (payload.errors?.length) throw new Error(payload.errors[0].message);
    const user = payload.data?.user;
    if (!user) throw new Error(`User "${username}" not found`);
    const cal = user.contributionsCollection.contributionCalendar;
    const data: ContribDay[] = [];
    cal.weeks.forEach((week, weekIndex) => {
      week.contributionDays.forEach((day) => {
        data.push({
          date: day.date,
          count: day.contributionCount,
          week: weekIndex,
          day: typeof day.weekday === "number" ? day.weekday : new Date(`${day.date}T12:00:00Z`).getUTCDay(),
        });
      });
    });
    return {
      username: user.login,
      totalContributions: cal.totalContributions,
      updatedAt: new Date().toISOString(),
      data: dedupe(data),
    };
  } finally {
    done();
  }
}

export async function refreshContributions(username = contribUser()): Promise<ContribPayload> {
  if (refreshing) return refreshing;

  const p = (async () => {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    let payload: ContribPayload;
    if (token) {
      try {
        payload = await fetchFromGraphQL(username, token);
      } catch (err) {
        logger.warn({ err }, "GraphQL contrib failed — falling back to HTML");
        payload = await fetchFromHtml(username);
      }
    } else {
      payload = await fetchFromHtml(username);
    }
    // kvSet has its own timeout+retry
    await kvSet(KV_KEY, payload).catch((e) => {
      logger.warn({ e }, "kvSet failed during refresh, still returning payload");
    });
    return payload;
  })();

  refreshing = p;
  try {
    return await p;
  } finally {
    if (refreshing === p) refreshing = null;
  }
}

function isStale(p: ContribPayload | null): boolean {
  if (!p?.updatedAt) return true;
  const t = Date.parse(p.updatedAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_AGE_MS;
}

router.get("/github-contrib", async (c) => {
  try {
    let cached = (await kvGet<ContribPayload>(KV_KEY).catch(() => null)) as ContribPayload | null;

    if (!cached || !cached.data?.length) {
      // Cold start — must fetch
      try {
        cached = await refreshContributions();
      } catch (err) {
        logger.error({ err }, "Failed to refresh github contrib on cold GET");
        return c.json({ error: "Failed to load contributions" }, 502);
      }
    } else if (isStale(cached)) {
      // Stale-while-serve: return stale immediately, refresh in the background.
      // waitUntil is required — a bare floating promise is killed when the
      // response is returned, so on Vercel this refresh often never completed.
      c.executionCtx.waitUntil(
        refreshContributions().catch((e) => logger.warn({ e }, "Background refresh failed")),
      );
      c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
      return c.json({ ...cached, stale: true });
    }

    c.header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    c.header("CDN-Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return c.json(cached);
  } catch (err) {
    logger.error({ err }, "GET github-contrib failed");
    return c.json({ error: "Internal error" }, 500);
  }
});

async function handleRefresh(c: Context) {
  try {
    const body = await readBody<{ password?: string }>(c);
    if (!authorized(c.req.raw.headers, body)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const payload = await refreshContributions();
    return c.json({
      ok: true,
      username: payload.username,
      totalContributions: payload.totalContributions,
      days: payload.data.length,
      updatedAt: payload.updatedAt,
    });
  } catch (err) {
    logger.error({ err }, "github-contrib refresh failed");
    return c.json({ error: "Refresh failed" }, 502);
  }
}

router.get("/github-contrib/refresh", handleRefresh);
router.post("/github-contrib/refresh", handleRefresh);

export default router;
