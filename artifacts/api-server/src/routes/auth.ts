import { Router } from "express";
import jwt from "jsonwebtoken";
import { kvGet, kvSet } from "@workspace/kv";
import { logger } from "../lib/logger";

const router = Router();

const REDIRECT_URI = "https://nuroctane.xyz/api/auth/github/callback";

function getClientId(): string {
  const id = process.env.GITHUB_CLIENT_ID;
  if (!id) throw new Error("GITHUB_CLIENT_ID must be set");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!secret) throw new Error("GITHUB_CLIENT_SECRET must be set");
  return secret;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set");
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

router.get("/auth/github", (_req, res) => {
  const clientId = getClientId();
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user`;
  return res.redirect(url);
});

router.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing authorization code" });
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
      return res.status(400).json({ error: "Failed to authenticate with GitHub" });
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: AbortSignal.timeout(6000),
    });
    const ghUser = (await userRes.json()) as GitHubUser;

    const userKey = `user:${ghUser.id}`;
    const existing = await kvGet<StoredUser>(userKey);
    const user: StoredUser = {
      githubId: ghUser.id,
      username: ghUser.login,
      avatarUrl: ghUser.avatar_url,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await kvSet(userKey, user);

    const token = jwt.sign(
      { githubId: user.githubId, username: user.username, avatarUrl: user.avatarUrl },
      getJwtSecret(),
      { expiresIn: "30d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect("https://nuroctane.xyz/modkeys");
  } catch (err) {
    logger.error({ err }, "GitHub OAuth callback failed");
    return res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/auth/me", async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ user: null });

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { githubId: number; username: string; avatarUrl: string };
    return res.json({ user: payload });
  } catch {
    return res.json({ user: null });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ ok: true });
});

export default router;
