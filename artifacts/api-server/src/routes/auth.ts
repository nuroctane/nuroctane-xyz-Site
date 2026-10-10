import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";
import { signSession, verifySession } from "../lib/jwt";

const router = new Hono();

/* The apex host is deliberate and must match the callback URL registered on the
 * GitHub OAuth app. The rest of the site canonicalises on https://www.nuroctane.xyz;
 * changing this to www requires editing the OAuth app in GitHub's settings first,
 * or every login breaks with redirect_uri_mismatch. Overridable via env so the
 * two can be reconciled without a code change. */
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://nuroctane.xyz";
const REDIRECT_URI = `${SITE_ORIGIN}/api/auth/github/callback`;

/* Trimmed deliberately. `wrangler secret put` reads its value from stdin, and
 * piping to it from a shell appends a newline — so a secret set that way carries
 * trailing whitespace. GitHub then rejects the token exchange with
 * `incorrect_client_credentials`, which looks like a wrong secret rather than a
 * stray byte. This exact bug already cost time on the tunerz push token. */
function getClientId(): string {
  const id = process.env.GITHUB_CLIENT_ID?.trim();
  if (!id) throw new Error("GITHUB_CLIENT_ID must be set");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!secret) throw new Error("GITHUB_CLIENT_SECRET must be set");
  return secret;
}

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

interface StoredUser {
  githubId: number;
  username: string;
  avatarUrl: string;
  createdAt: string;
}

/* OAuth `state`: a one-time value set as a cookie here and echoed back by
 * GitHub. Without it, any page could send a visitor through the callback with
 * the attacker's own authorization code and sign them in as the attacker
 * (login CSRF). The cookie is scoped to the callback's host, so a sign-in
 * started on www is first sent to that host to set it. */
const STATE_COOKIE = "oauth_state";
const STATE_COOKIE_PATH = "/api/auth";

router.get("/auth/github", (c) => {
  const clientId = getClientId();
  const callbackHost = new URL(SITE_ORIGIN).host;
  if (new URL(c.req.url).host !== callbackHost) {
    return c.redirect(`${SITE_ORIGIN}/api/auth/github`);
  }
  const state = crypto.randomUUID();
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 10 * 60,
    path: STATE_COOKIE_PATH,
  });
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user&state=${state}`;
  return c.redirect(url);
});

router.get("/auth/github/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ error: "Missing authorization code" }, 400);
  }
  const state = c.req.query("state");
  const expected = getCookie(c, STATE_COOKIE);
  deleteCookie(c, STATE_COOKIE, { path: STATE_COOKIE_PATH });
  if (!state || !expected || state !== expected) {
    return c.json({ error: "Sign-in expired or was not started here. Please try again." }, 400);
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: getClientId(),
        client_secret: getClientSecret(),
        code,
      }),
      signal: AbortSignal.timeout(6000),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      logger.error({ tokenData }, "GitHub OAuth token exchange failed");
      return c.json({ error: "Failed to authenticate with GitHub" }, 400);
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        // GitHub rejects API requests without a User-Agent.
        "User-Agent": "nuroctane.xyz-auth",
      },
      signal: AbortSignal.timeout(6000),
    });
    // A rate-limited or failed lookup has no id; storing it would write a
    // `user:undefined` record and mint a session that can never verify.
    if (!userRes.ok) {
      logger.error({ status: userRes.status }, "GitHub user lookup failed");
      return c.json({ error: "Failed to authenticate with GitHub" }, 502);
    }
    const ghUser = (await userRes.json()) as GitHubUser;
    if (typeof ghUser?.id !== "number" || typeof ghUser.login !== "string") {
      return c.json({ error: "Failed to authenticate with GitHub" }, 502);
    }

    const userKey = `user:${ghUser.id}`;
    const existing = await kvGet<StoredUser>(userKey);
    const user: StoredUser = {
      githubId: ghUser.id,
      username: ghUser.login,
      avatarUrl: ghUser.avatar_url,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await kvSet(userKey, user);

    const token = await signSession({
      githubId: user.githubId,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });

    setCookie(c, "token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return c.redirect(`${SITE_ORIGIN}/modkeys`);
  } catch (err) {
    logger.error({ err }, "GitHub OAuth callback failed");
    return c.json({ error: "Authentication failed" }, 500);
  }
});

router.get("/auth/me", async (c) => {
  const user = await verifySession(getCookie(c, "token"));
  return c.json({ user });
});

router.post("/auth/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ ok: true });
});

export default router;
