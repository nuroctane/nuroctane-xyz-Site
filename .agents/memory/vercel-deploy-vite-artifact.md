---
name: Deploying digital-sea (Vite) to Vercel
description: Monorepo build and serve contract for nuroctane.xyz (local + GitHub + Vercel).
---

# Deploying digital-sea (Vite) to Vercel

**pnpm monorepo** → push `origin/main` → Vercel. No cloud-IDE host required.

## Root contracts
| Item | Value |
|------|--------|
| Install | `npx -y pnpm@10 install --no-frozen-lockfile` (`vercel.json`) |
| Build | `pnpm run build` → typecheck → package builds → smoke → `check-spa-shell.mjs` |
| Output | `artifacts/digital-sea/dist/public` |
| SPA | rewrite all non-`/api/*` to `/index.html` |
| Crons | `/api/github-contrib/refresh` daily |

## Vite (`artifacts/digital-sea/vite.config.ts`)
| Env | Build | Dev / preview |
|-----|-------|----------------|
| `PORT` | ignored | default `5173` |
| `BASE_PATH` | default `/` | default `/` |

`outDir` is `dist/public`. Do not require vendor-injected env for production builds.

## Analytics
- `@vercel/analytics` + `@vercel/speed-insights` (v2) in `src/main.tsx`
- `mode="production"` on Analytics; SPA `path`/`route` for wouter
- `beforeSend`: absolute URL + strip `#hash` only
- Enable **Web Analytics** and **Speed Insights** on the Vercel project (script
  `/_vercel/insights/script.js` should 200 when enabled)

## API notes
- Functions under root `api/` (books, modkeys catch-all, catch-all slug)
- Modkeys admin: prefer `POST /api/modkeys/gallery` + `action` body (multi-segment
  paths under `/api/modkeys/` can be NOT_FOUND on Vercel)

## How to apply
Ship by `git push origin main`. Validate with Network tab (insights POSTs) and
dashboard, not only local `vite` (dev does not feed production analytics).
