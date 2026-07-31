<div align="center">

<img src="docs/media/digital-sea.gif" alt="Digital Sea" width="480" />

# 🌊 nuroctane.xyz

### _a digital sea of thoughts, books, and experiences_

[![Live Site](https://img.shields.io/badge/🌐-Live%20Site-blue?style=for-the-badge)](https://nuroctane.xyz)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

</div>

## What is this?

A personal [digital sea](https://codelyoko.fandom.com/wiki/Digital_Sea) - living portfolio and toolkit:

| Surface | Route | What it is |
|---|---|---|
| **Digital Sea** | `/` | Interactive scroll identity / scene |
| **Books** | `/books` | Kindle wishlist + community recommendations |
| **Quotes** | `/quotes` | Themed quote bank synced from Obsidian |
| **Modkeys** | `/modkeys` | 3D mechanical keyboard configurator |
| **NurCLI** | `/cli` | Product page for the Rust coding agent |
| **Observatory** | `/observatory` | Astrology, Cesium Earth, satellites, sky |
| **Resume** | `/resume` | Direct URL only (unlinked in nav) |

Also: `/socials`, `/projects`, `/blog`, `/fin`. Home aliases `/home`, `/sea`, `/identity` → `/`. Legacy `/orbit` and `/orbit-veil` → `/observatory`.

Aesthetic inspiration: **Code Lyoko** (MoonScoop, 2003–2007). [Wikipedia](https://en.wikipedia.org/wiki/Code_Lyoko)

---

## Tech stack

| Area | Stack |
|---|---|
| **SPA (digital-sea)** | React + Vite, TailwindCSS, Wouter |
| **Modkeys** | Vanilla ES modules + Vite, Three.js, GSAP (desktop + mobile shell) |
| **API** | Hono on Cloudflare Workers (`artifacts/api-server`, bundled into the Worker) |
| **Storage** | Upstash Redis KV (visitor books, modkeys configs) |
| **Host** | Cloudflare Worker `nuroctane-xyz` (`worker/index.ts`, `wrangler.jsonc`) |
| **OG cards** | Residual Vercel function `api/og.mjs` (proxied at `/api/og`) |
| **Telemetry** | PostHog + Cloudflare Workers Observability |
| **Monorepo** | pnpm workspaces |

---

## Features

### Books
- Curated shelves + Kindle wishlist content (`artifacts/digital-sea/src/content/books.md`)
- Live search via Google Books (Open Library fallback)
- Community recommendations; admin mode for submissions
- Cover caching and lazy loading

### Quotes
- Narrow thematic sections (Faith, Reality, Manifestation, Shadow, …)
- Markdown bank with Obsidian-compatible index
- Synced from the local Obsidian vault (see [Content sync](#content-sync-obsidian--git))

### Modkeys
Full 3D keyboard configurator (desktop + mobile shells) at `/modkeys` - layouts, materials, switches, keycaps, lighting, per-key edits, KLE/SVG/PDF/spec export, shareable URL state. Details: `artifacts/modkeys/.agents/docs/MOBILE_SHELL.md`.

### NurCLI (`/cli`)
Product page for [nur-cli](https://github.com/nuroctane/nur-cli): multi-provider Rust TUI agent, installers (Windows/macOS/Linux), live version polling, Foglamp codebase map embed, command reference. Page source: `artifacts/digital-sea/src/pages/CliPage.tsx`.

### Observatory (`/observatory`)
Swiss Ephemeris astrology, Cesium Earth exploration, CelesTrak satellites / SGP4, solar system, sky chart, missions, weather. Spec: `docs/research/components/observatory.spec.md`.

---

## Production architecture

```
Browser → Cloudflare Worker (nuroctane-xyz)
            ├── ASSETS  → Vite SPA build
            ├── /api/*  → Hono (api-server)
            ├── crawler → path-specific og:* HTML
            └── /api/og → proxy → nuroctane-og.vercel.app
```

- Apex + `www` are Cloudflare Custom Domains on the Worker.
- Cron `0 12 * * *` refreshes GitHub contribution data only (not quotes).
- **Do not** `vercel --prod` expecting to deploy the site. Vercel git integration for OG is disconnected on purpose; redeploy `api/og.mjs` by hand only when that file changes.

---

## Local development

```bash
pnpm install
pnpm run build          # typecheck + package builds + smoke + SPA shell checks
npx wrangler dev        # local Worker (.dev.vars with KV_MEMORY=1)
```

SPA-only: `pnpm --filter digital-sea dev` (see package scripts).

---

## Deploy

Pushing `main` should trigger **Workers Builds** (`pnpm run build` → `npx wrangler deploy`). GitHub Actions `.github/workflows/deploy.yml` notifies each main push (and can wrangler-deploy only if `CLOUDFLARE_API_TOKEN` is set - leave it unset while Builds is healthy).

```bash
git push origin main
# Verify: Builds list / Actions green + deployment issue notify, and:
curl -sI https://www.nuroctane.xyz/ | grep -i server   # expect cloudflare
```

Manual deploy only if the push did not publish: `pnpm run deploy`.

Full agent ship checklist: `C:\Users\david\.agents\SHIP.md` (nuroctane.xyz section) and repo `AGENTS.md`.

---

## Content sync (Obsidian ↔ git)

| Direction | What | How |
|---|---|---|
| Vault → repo | `Quotes.md` → `artifacts/digital-sea/src/content/quotes.md` | `scripts/sync-quotes.sh` (also Hermes `sync-quotes.py`) |
| Repo → vault | `books.md` → Obsidian `Books/Book Wishlist.md` | `scripts/sync-books.sh` / Hermes `poll-sync.py` |

Windows task **`NuroctanePollSync`** (every 15 min) launches silent `scripts/poll-sync.vbs` → Hermes Python poller (no console window). Install: `powershell -File scripts/install-poll-sync-task.ps1`. Logs: `.nur/poll-sync.log`.

Quotes sync strips Obsidian frontmatter, rebuilds `## Index`, parser-sanity-checks like `QuotesPage.tsx`, then commits/pushes on `main` only when content changes. Optional local deploy: `SYNC_DEPLOY=1`. Dry run: `SYNC_DRY_RUN=1`.

---

## Environment variables

**Build-time** (`VITE_*` - Workers Builds → Build variables, and local `.env.local`):

- `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` / `VITE_POSTHOG_UI_HOST` - analytics (host defaults to first-party proxy `https://e.nuroctane.xyz`; Worker in `workers/posthog-relay/`)
- `VITE_GOOGLE_BOOKS_API_KEY` - Books search (optional; Open Library fallback)
- Observatory weather / traffic keys as consumed under `artifacts/digital-sea/src/observatory/`

**Runtime** (Worker secrets via `wrangler secret put`): KV credentials, `JWT_SECRET`, GitHub OAuth, etc.

See `artifacts/digital-sea/.env.example`. Adding a new `VITE_*` means updating `.env.local`, the example file, **and** Workers Builds vars.

---

## Analytics

PostHog: route pageviews, Core Web Vitals, curated product events (`Modkeys Save` / `Export`, `Quotes Section`, `Book Open`, …). Autocapture off; no person profiles for anonymous events.

Ops: Cloudflare Workers dashboard (deployments, logs, cron) + PostHog + Upstash console.

---

## Repository structure

```
nuroctane.xyz/
├── api/                      # Residual Vercel OG renderer only
├── artifacts/
│   ├── digital-sea/          # Main React SPA
│   ├── api-server/           # Hono API bundled into the Worker
│   └── modkeys/              # Keyboard configurator
├── worker/                   # Cloudflare Worker entry + OG HTML
├── scripts/                  # poll-sync, sync-quotes, sync-books, …
├── docs/                     # Research specs + design notes
├── wrangler.jsonc
└── AGENTS.md                 # Agent ship + sync instructions
```

---

## Philosophy

Minimal yet expressive, fast, personal, continuously evolving - like a digital sea.

## License

MIT - use as inspiration for your own digital sea.

---

<div align="center">

Visit [nuroctane.xyz](https://nuroctane.xyz) · *Built with curiosity and code*

</div>
