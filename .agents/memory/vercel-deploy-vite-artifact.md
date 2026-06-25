---
name: Deploying a Vite artifact to Vercel
description: Why Vercel builds/serves of the digital-sea Vite artifact fail, and the two fixes.
---

# Deploying a Vite artifact (digital-sea) to Vercel

The Replit Vite artifacts are wired for Replit's path-based dev/preview server, which
breaks plain `vite build` / static hosting elsewhere (Vercel). Two distinct failures,
two distinct fixes.

## 1. Build crash: "PORT environment variable is required"
`vite.config.ts` reads `PORT` / `BASE_PATH` at config-load time and throws if missing.
On Replit both are injected; on Vercel neither exists, so `vite build` dies before
building.
**Fix:** use the function form `defineConfig(async ({ command }) => …)`. Require `PORT`
only when `command !== "build"` (dev/preview). Default `BASE_PATH` to `"/"` for builds,
but still require it during serve so a misconfigured Replit dev fails loudly.
**Why:** PORT/BASE_PATH are dev-server concerns, irrelevant to a production build.

## 2. Deploy returns 404 NOT_FOUND even though build is "Ready"
The Vite build's `outDir` is `dist/public` (not the Vite default `dist`). Vercel's Vite
preset serves from `dist`, finds no `index.html`, and 404s at `/`.
**Fix:** add `vercel.json` in the artifact dir (= Vercel "Root Directory", which is
`artifacts/digital-sea`) with `"outputDirectory": "dist/public"` (+ SPA rewrite to
`/index.html`). Built `index.html` already uses root-relative `/assets/...` because
BASE_PATH defaults to `/`, so it serves correctly at the domain root.

## How to apply
Both files (`vite.config.ts`, `vercel.json`) only take effect on Vercel once pushed to
GitHub `origin/main`. The agent cannot `git push` from the sandbox (no GitHub token —
"Password authentication is not supported"); the user must push via Replit's Git pane.
