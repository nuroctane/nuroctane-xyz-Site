# NUROCTANE

**One personal site. Independent, complete designs.**

[Visit nuroctane.xyz](https://nuroctane.xyz) · [Design architecture](docs/BLACKBOARD.md) · [Quote maintenance](docs/QUOTES.md)

Blackboard is the active design: a monochrome launch surface with animated wallpaper,
persistent audio, and Books, Quotes and Blog libraries. Digital Sea remains a complete,
separate snapshot of the earlier immersive 3D site. Switching selects the whole frontend;
it does not require changing individual pages, navigation, styles or soundtracks.

## Start here

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Use the URL Vite prints. Blackboard's Vite server proxies `/api` to production by default;
recommendation and admin mutations in that preview affect real community data. Set
`API_PROXY_TARGET` to a local Worker for isolated API work.

```sh
pnpm build
npx wrangler dev
```

The second path serves the built frontend and Worker together. Use local `.dev.vars`
with `KV_MEMORY=1` for disposable API state. Never commit credentials.

## Choose a design

| Design | Package | Status |
| --- | --- | --- |
| **Blackboard** | `artifacts/blackboard` / `@workspace/blackboard` | Current production frontend; live content sync |
| **Digital Sea** | `artifacts/digital-sea` / `@workspace/digital-sea` | Preserved pre-Blackboard frontend at `b48b16d` |
| Future designs | A new sibling in `artifacts/` | Add through the extension contract below |

```sh
pnpm site                 # Show the selection
pnpm site blackboard      # Select Blackboard
pnpm site digital-sea     # Select Digital Sea
pnpm dev                  # Preview the selected frontend
```

Selection changes the tracked `site.config.json`. Restart an existing dev server after
switching. **Selection alone does not publish.** Commit `site.config.json` and ship; the
push deploys the selected design (never also `pnpm deploy`). Shared community data and API
credentials remain current whichever design is selected; switching is not a database
rollback.

What a switch changes, and what it never does:

| Follows the selection | Stays the same in every design |
| --- | --- |
| The frontend build, its `public/` assets and `_headers` | Quotes, books and resume (`shared/content`) |
| Every share embed: image, size, site name, home title and description (`artifacts/<design>/embed.json`) | Resume download, `robots.txt`, `sitemap.xml` (`shared/public`) |
| Retired `/api/og` and `/assets/og/*` card URLs (they answer with the selected embed image) | The API, Worker secrets, KV data and crawler routes |

`scripts/check-designs.mjs` runs in every build and checks **all** designs, not just the
selected one, so any design can be selected and shipped without surprises. It fails when
an `embed.json` size disagrees with its image, an `index.html` tag disagrees with its
`embed.json`, a design keeps its own copy of shared content, the `.env.example` files list
different `VITE_*` variables, or a crawler route is missing from `run_worker_first`.

The Digital Sea snapshot owns its original pages, assets, soundtrack and local Modkeys
source. It is intentionally frozen. Blackboard retains its own compatibility scene code
for existing deep links and uses the current `artifacts/modkeys` implementation. Neither
frontend imports the other frontend; both read shared content through `@shared/…` and
`sharedSite()` in their Vite configs. Do not switch using Blackboard's internal
`src/config/siteMode.ts`; it identifies that app, not the deployment selection.

## Explore the site

| Route | Blackboard surface |
| --- | --- |
| `/` | Avatar, Cal/GitHub links, copyable wallet addresses, central audio player, Projects/Socials launchers |
| `/books` | Responsive shelves, visible covers, metadata modals, library search and community recommendations |
| `/quotes` | Searchable thematic collections, newest/oldest ordering, source credits and preserved quote paragraphs |
| `/blog` | Full writing in cards that follow their content height |
| `/modkeys` | 3D keyboard configurator, community builds and exports |
| `/observatory` | Sky, Earth, satellite and solar-system exploration |
| `/cli` | NurCLI product page, downloads and documentation |
| `/curriculum` | Standalone curriculum |
| `/resume` | Resume, accessible directly and intentionally unlinked |

Blackboard uses responsive monochrome glass controls, JetBrains Mono interface type,
and serif quote text. Its wallpaper respects reduced motion and uses stronger movement
on small screens. The native audio provider survives SPA navigation; browser autoplay
and device-volume rules still apply. Books and Modkeys use the existing server-side
admin gates. Failed book mutations display an error and do not pretend to save.

Digital Sea provides its own original scene, HUD, standalone libraries and soundtrack.
Its appearance is inspired by Code Lyoko. The repository's historical scene preview:

<details>
<summary>Digital Sea preview</summary>

![Digital Sea scene](docs/media/digital-sea.gif)

</details>

## Architecture

```text
Browser
  └─ Cloudflare Worker: nuroctane-xyz
       ├─ Static assets → dist/public → selected frontend build
       ├─ /api/* → shared Hono API
       ├─ Crawler requests → route-specific Open Graph HTML
       └─ /api/og, /assets/og/* → retired card URLs, answered with the selected embed image
```

| Layer | Implementation |
| --- | --- |
| Frontends | React, TypeScript, Vite, Wouter; design-specific CSS and assets |
| Interactive graphics | Three.js, React Three Fiber, Cesium, WebGL wallpaper |
| Modkeys | Vanilla ES modules, Three.js, GSAP, keyboard export tooling |
| API | Hono in `artifacts/api-server`, bundled by `worker/index.ts` |
| Shared storage | Redis-compatible KV; in-memory mode for local API checks |
| Deployment | Single Cloudflare Worker, apex and `www` Custom Domains |
| Analytics | PostHog and Cloudflare Workers Observability |
| Workspace | pnpm, TypeScript project references, shared `lib/` packages |

Build-time `VITE_*` variables belong in local frontend `.env.local` and Cloudflare
Workers Builds variables. Runtime API credentials belong in Worker secrets. The two
sets are separate. Every design has an `.env.example` and they must list the same
variables, so adding one means updating each design's example, `.env.local` and the
Workers Builds variables.

## Content and quote sync

The scheduled source of truth is **Raindrop `#quotes` → canonical Obsidian Quotes.md →
Blackboard**. New Obsidian `#quotes` notes are the secondary intake source.

1. Windows task `NuroctanePollSync` runs every 15 minutes through hidden `wscript`.
2. `scripts/poll-sync.vbs` launches the repository-owned `quotes-pipeline.py`.
3. The pipeline tests the canonical 12-category classifier and runs the Hermes ingester
   through `run_hermes_quote_ingest.py`.
4. Category normalization applies reviewed editorial corrections and refreshes the index.
5. `run_hermes_quote_sync.py` validates and publishes only
   `shared/content/quotes.md` from `main`, then mirrors the published
   form into the vault. Unrelated work blocks publishing.
6. Workers Builds deploys the content commit through the usual production path.

Blackboard follows the original Digital Sea parsing contract: contiguous blockquotes,
paragraph breaks, author boundaries, callout exclusion, index exclusion and newest-first
presentation without reversing the canonical file. There is one bank,
`shared/content/quotes.md`, and every design renders it, so selecting Digital Sea never
publishes stale quotes or an old resume. See [the quote playbook](docs/QUOTES.md) for corrections, attribution
sources and verification commands.

Books synchronization is a separate repo-to-vault path in `scripts/sync-books.sh`:
`shared/content/books.md` → Obsidian `Books/Book Wishlist.md`.
The Worker's daily cron only refreshes GitHub contributions; it does not sync quotes.

### Public library discovery

Blackboard's recommendation search uses the same six-catalog `/api/book-search`
service as Digital Sea. It displays every returned match (up to 20), including
covers, authors, years and contributing catalogs. Selecting a result opens a
review dialog; an optional note and all catalog metadata are saved through the
existing `/api/visitor-books` contract. Manual entries support optional 600 × 900
JPEG, PNG or WebP covers up to 300 KB.

Search requests cancel when the query changes. Catalog outages expose retry
controls; partial results stay usable and expire quickly. Save failures retain
the draft rather than displaying a recommendation that was never persisted.
The frontend lives in `artifacts/blackboard/src/components/BookRecommendationSearch.tsx`;
the shared service lives in `artifacts/api-server/src/lib/book-search.ts`.

## Checks

```sh
pnpm build
pnpm check:quotes
pnpm check:books
python scripts/test_quote_editorial.py
python scripts/test_quote_categories.py
```

The root build checks repository hygiene, typechecks packages and Worker code, builds
both frontends, stages the selected output, runs the API smoke suite, and validates
Observatory stability, the Modkeys mobile shell and the quote parser/content contract.
The classifier tests require the configured local semantic model; they also run before
scheduled ingestion. Do not weaken existing guards to make a build pass.

Check mobile and desktop layouts, deep links, artwork/assets, library scrolling and
admin dialogs before shipping changes to shared UI. Use isolated API state for destructive
tests. A green notification-only GitHub Action is not proof that Workers Builds deployed.

## Ship

The repository's required pipeline is **commit → push `origin main` → verify live → backup**.
Follow `AGENTS.md` and `C:\Users\david\.agents\SHIP.md`.

```powershell
powershell -File $env:USERPROFILE\.agents\ship.ps1 -Repo nuroctane.xyz -Message "Describe the change"
```

Workers Builds normally runs `pnpm build` then `npx wrangler deploy`. The GitHub workflow
is a fallback deployer only when its Cloudflare token is configured; otherwise it sends
the deployment notification. Keep one production promotion path active.

Verify the Workers Builds check for the shipped commit and the actual live assets/routes.
Use `pnpm deploy` only if the push did not publish. Backups go to
`D:\BACKUP\CODE Backups\nuroctane.xyz\` with the date and commit in the filename.

Every route shares the selected design's embed (`artifacts/<design>/embed.json`); there
are no per-page share cards. Product analytics uses PostHog.

## Adding another design

A new design is a complete frontend, not a collection of overrides on a preserved design.

1. Add `artifacts/<design>` with a unique workspace package name, `dev`, `build` and
   `typecheck` scripts, and Vite output at `dist/public` inside that package.
2. Give it its own entrypoint, routes, navigation, loading UI, styles, public assets and
   audio behavior. Reuse shared APIs and libraries where that does not couple designs.
3. Register the identifier in `scripts/designs.mjs` (site selection, the design guard and
   the Modkeys shell check read it there) and add its `embed.json` to `EMBEDS` in
   `worker/og-meta.ts`.
4. Give it an `embed.json` whose image lives in its `public/`, with matching tags in its
   `index.html`, and an `.env.example` listing the same variables as the others.
5. Read content through `sharedSite()` and `@shared/…`; never copy `shared/` files in.
6. Test the new app and the existing designs (`pnpm site <design>`, `pnpm build`). Select it in `site.config.json` only when
   ready to preview or ship it. Preserve prior designs' source and assets.

This registration is deliberate: merely adding a directory does not make a design a
supported production selection.

## Repository map

```text
artifacts/
  blackboard/        Current frontend
  digital-sea/       Preserved earlier frontend, including original Modkeys
  modkeys/           Current keyboard configurator
  api-server/        Shared Hono API
lib/                 Shared API clients, schemas and server utilities
worker/              Cloudflare entrypoint and crawler metadata
scripts/             Design selection, validation and local content sync
shared/              Content every design serves (quotes, books, resume, robots, sitemap)
docs/                Design notes, quote playbook, research and historical archive
site.config.json     Selected design and Digital Sea baseline
wrangler.jsonc       Single Worker deployment configuration
```

## License

See [LICENSE](LICENSE).
