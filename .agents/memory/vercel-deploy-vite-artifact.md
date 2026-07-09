---
name: Deploying digital-sea (Vite) to Vercel
description: How the digital-sea Vite package builds and serves on Vercel (local + GitHub only; no Replit).
---

# Deploying digital-sea (Vite) to Vercel

The site is a **pnpm monorepo** pushed to GitHub and built on **Vercel**. Replit is not used.
Root `vercel.json` / workspace `pnpm run build` drive deploys from `main`.

## 1. Vite config: PORT and BASE_PATH

`artifacts/digital-sea/vite.config.ts` uses `defineConfig(async ({ command }) => …)`.

| Env | Build (`command === "build"`) | Dev / preview |
|-----|-------------------------------|---------------|
| `PORT` | ignored | defaults to `5173` if unset |
| `BASE_PATH` | defaults to `"/"` | defaults to `"/"` (override only for subpath hosting) |

**Why:** PORT is a local dev-server concern. Production is static files at the domain root.
Do not reintroduce hard throws that require vendor-injected env vars for `vite build`.

## 2. Output directory

Vite `outDir` is `dist/public` (not the default `dist`). Workspace / Vercel config must
serve that path (repo root `vercel.json` sets `outputDirectory` to
`artifacts/digital-sea/dist/public` with SPA rewrite to `/index.html`).

## 3. Analytics / Speed Insights

Mounted from `artifacts/digital-sea/src/main.tsx` (`@vercel/analytics` +
`@vercel/speed-insights`). Enable both in the Vercel project dashboard. `beforeSend`
keeps absolute URLs and strips share-link `#hash` only.

## How to apply

Changes take effect after push to GitHub `origin/main` (Vercel auto-deploy). Agents
and humans push with git credentials on the local machine — not via a cloud IDE Git UI.

## Historical note

Older notes referred to Replit artifact env (`REPL_ID`, forced `PORT`/`BASE_PATH`,
`.replit` / `replit.nix`). Those files and `@replit/*` Vite plugins were removed
(commit `43488b5`). Treat this file as the current deploy contract.
