<div align="center">

<img src="docs/media/digital-sea.gif" alt="Digital Sea" width="480" />

# 🌊 nuroctane.xyz

### _a digital sea of thoughts, books, and experiences_

[![Live Site](https://img.shields.io/badge/🌐-Live%20Site-blue?style=for-the-badge)](https://nuroctane.xyz)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

</div>

## 🧠 What is this?

This is my personal [digital sea](https://codelyoko.fandom.com/wiki/Digital_Sea) — a living portfolio that captures the different facets of my life:

- **📚 Books** — A curated library of books I've read, with community recommendations and live search via Google Books & Open Library APIs
- **💭 Quotes** — A collection of thoughts, ideas, and quotes that have shaped my thinking, organized by theme
- **⌨️ Modkeys** — A full 3D mechanical keyboard configurator (desktop + mobile shells), embedded at `/modkeys`
- **🛰️ Orbit Veil** — A full-Earth, real-time satellite tracker using CelesTrak TLE sets and in-browser SGP4 propagation at `/orbit`

The site is built as a single-page application with a distinct aesthetic inspired by terminal interfaces and digital landscapes. It's not just a portfolio — it's an extension of my mind.

The visual aesthetic draws inspiration from the French animated series **Code Lyoko** (MoonScoop, 2003–2007, created by Thomas Romain and Tania Palumbo). [Wikipedia](https://en.wikipedia.org/wiki/Code_Lyoko)

---

## 🛠️ Tech Stack

| Area | Stack |
|---|---|
| **Site (digital-sea)** | React + Vite, TailwindCSS, Wouter |
| **Modkeys** | Vanilla ES modules + Vite 6, Three.js (^0.184), GSAP, dual desktop/mobile shell (`shell.js` + `mobile.css`) |
| **API** | Hono on Cloudflare Workers (`artifacts/api-server`, bundled from source) |
| **Storage** | Upstash Redis KV (visitor books, modkeys configs) |
| **Export (modkeys)** | KLE JSON, SVG, spec JSON, PDF (jsPDF + svg2pdf.js) |
| **Telemetry** | PostHog (SPA pageviews, product events, Core Web Vitals) + Cloudflare Workers Observability |
| **Monorepo** | pnpm workspaces |

### Analytics and operations

The SPA reports route-aware pageviews, curated product events, and Core Web Vitals to **PostHog**. Set these build-time variables for the Digital Sea Vite build:

```dotenv
VITE_POSTHOG_KEY=phc_your_project_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Use these dashboards going forward:

1. **Cloudflare Dashboard → Workers & Pages → nuroctane-xyz** for production deployments, version history/rollback, request and error rates, CPU time, cron triggers, and live/retained Worker logs. Observability is enabled in `wrangler.jsonc`.
2. **PostHog** for web/product analytics: `$pageview`, `$web_vitals`, route breakdowns, custom events, paths, funnels, retention, and optional dashboards/alerts.
3. **Vercel** for the residual `api/og.mjs` image renderer and the temporary custom-domain ingress shim. Cloudflare serves the website and APIs; Vercel currently forwards non-OG requests to the Worker because the existing Cloudflare DNS records are still DNS-only. Once those records are orange-cloud proxied, the Worker routes in `wrangler.jsonc` take traffic directly and the shim can be removed.
4. **Upstash Console** for Redis usage, latency, and stored visitor-books/modkeys data.

**Page routes:** `/`, `/socials`, `/socials/:id`, `/projects`, `/projects/:id`, `/blog`, `/blog/:slug`, `/fin`, `/books`, `/quotes`, `/resume`, `/modkeys`, `/cli`, `/observatory`. Home aliases `/home`, `/sea`, and `/identity` resolve to `/`; `/orbit` and `/orbit-veil` resolve to `/observatory`.

Sea scroll + QuickNav update the URL (replace/push) so passive browsing still attributes to section routes. `/resume` is unlinked in nav (direct URL only) but still tracked.

**Custom events:** `Modkeys Save` / `Export` / `Share`, `Sea Node Open`, `Mode Change`, `Fin Open`, `Quotes Section`, `Book Open`, `Resume View`, `Resume Contact`, `Booking Click`.

**Privacy / notes:** PostHog autocapture is disabled; only explicit events, pageviews, and performance data are sent. Anonymous events do not create person profiles. Ad blockers can hide traffic. Analytics is disabled when `VITE_POSTHOG_KEY` is absent.

**Link embeds (Open Graph):** the Cloudflare Worker serves path-specific `og:*` HTML to crawlers/unfurlers (Discord, Slack, iMessage, X, …). Dynamic `/api/og?page=…` cards are proxied from the residual Vercel function; the Worker falls back to `/opengraph.jpg` if that origin is unavailable.

---

## ✨ Features

### 📖 Books Page
- Curated reading lists organized by shelves
- Live book search via Google Books API with Open Library fallback
- Community recommendations (visitors can add books)
- Cover image caching and lazy loading
- Book descriptions and metadata
- Admin mode for managing visitor submissions

### 💬 Quotes Page
- Themed quote collections
- Custom markdown rendering with highlights
- Pagination for large collections
- Clean, readable typography

### ⌨️ Modkeys Keyboard Configurator
A fully integrated mechanical keyboard customization tool — design and visualize builds in real-time 3D, on desktop and mobile.

**Inspiration:** the original [modkeys](https://github.com/thebuggeddev/modkeys) project by [thebuggeddev](https://github.com/thebuggeddev) — this site’s configurator grew from that idea into a dual-shell (desktop + mobile), export-heavy, nuroctane-branded build.

#### Features
- **Complete customization**: Layout (60%, 65%, 75%), profile, material, switches, keycaps, case, plate, lighting, and extras
- **Real-time 3D preview**: Three.js with realistic materials and lighting; orbit / pan / zoom (mouse or touch)
- **Per-key customization**: Double-click any key for text, color, font size, glow, or image upload
- **Theme system**: Light/dark mode with adjusted 3D lighting
- **Export options**:
  - KLE (Keyboard Layout Editor) JSON
  - SVG layout template
  - Detailed spec sheet with BOM
  - PDF export
  - Shareable URL with encoded state
- **Built-in presets**: 15 designer-curated builds
- **Extensive library**:
  - 19 colorways (Claude, Gemini, Sakura, Verdant, Abyssal, Dune, Monochrome, Umbra, Moss, Contrast, Rosette, Noir, Embers, Matcha, Carbon, Vaporwave, Dracula, Blush, Honey)
  - 16 case options (Porcelain, Clay, Space Gray, Midnight, Silver, Navy, Olive, E-White, Rose Gold, Burgundy, Forest, Lavender, Copper, Coral, Arctic, Sakura)
  - 8 plate options (Aluminum, Brass, Polycarbonate, Carbon Fiber, Copper, Steel, POM, FR4)
  - 10 switch types (Boba U4T, Holy Panda, Box Jade, Silent Ink, Cream, Teal, Sunset, Topaz, Emerald, Silver)
  - 7 keycap profiles (Cherry, OEM, XDA, SA, DSA, MT3, ASA)
  - 4 extras (Rotary Knob, Coiled Cable, Wrist Rest, Switch Lube Service)
- **Interactive controls**:
  - Orbit/pan with inertia
  - View presets: 3D, Explode, Top, Side, Front
  - Navigation: sidebar (desktop) / section tabs (mobile) across Layout → Keycaps → Switches → Case → Plate → Lighting → Extras
  - Save and export (desktop toolbar; mobile fixed bar + export sheet)

#### Technical Implementation
Modkeys is embedded as an imperative Vanilla JS page (`/modkeys`) inside the Vite + React SPA. Key points:
- **CSS scoping**: styles under `.modkeys-page` so they don’t fight the main site
- **Theme independence**: own CSS variables (`--bg`, `--ink`, …) separate from Tailwind
- **Bootstrapping**: modules mount on enter and tear down on leave (no React wrappers, no two-way binding)
- **Dual-shell architecture**: dedicated mobile shell (`.mShell`) swaps in at boot via `matchMedia`; shared element IDs so core JS is shell-agnostic. ID parity via `check-shell-ids.mjs`; details in `artifacts/modkeys/.agents/docs/MOBILE_SHELL.md`
- **Performance**: lazy-loaded (React.lazy + Suspense); Three.js loaded with the page
- **State**: centralized mutable store with undo/redo (50 steps)
- **Sharing / export**: URL-encoded state or KLE / SVG / PDF / spec files

#### Mobile shell (v0.70+)
Purpose-built for phones and tablets — not a squeezed desktop layout:
- Portrait-first layout (+ landscape media query)
- Icon view-pill bar on the stage (3D / Explode / Top / Side / Front)
- Bottom section tabs for all config sections
- Material-specific click sounds (PBT thock; ABS/Ceramic resonance layers)
- Safe-area + `dvh` handling for notches and home bars
- Breakpoint: `(max-width: 768px)` or coarse pointer up to `1024px` (reload on cross)

### 🎨 Design System
- Dark, terminal-inspired aesthetic
- Smooth animations and transitions
- Responsive design
- Custom component library (shadcn/ui inspired)
- Audio player integration

---

## Project Structure

```
nuroctane-xyz-Site/
├── api/                      # Residual Vercel OG image function only
├── artifacts/
│   ├── digital-sea/          # Main React SPA (Vite + TailwindCSS)
│   │   ├── src/
│   │   │   ├── components/   # UI (HUD, panels, scene)
│   │   │   ├── pages/        # Books, Quotes, Modkeys, Resume
│   │   │   ├── content/      # Markdown content
│   │   │   └── hooks/        # Custom React hooks
│   │   └── public/           # Static assets
│   ├── api-server/           # Hono API bundled into the Worker
│   └── modkeys/              # Keyboard configurator (Vanilla + Three.js)
│       ├── .agents/docs/MOBILE_SHELL.md
│       ├── check-shell-ids.mjs
│       └── src/              # css/, js/ (core, data, ui, export)
├── worker/                   # Cloudflare Worker entry point + crawler OG responses
├── wrangler.jsonc            # Assets, routes, cron, and Worker deployment config
├── lib/                      # Shared packages (kv, db, api-zod, api-spec, …)
└── scripts/                  # Build / utility scripts
```

---

## 🎯 Philosophy

This site is designed to be:
- **Minimal yet expressive** — Clean design that lets content shine
- **Fast and responsive** — Optimized for performance (including a real mobile shell for Modkeys)
- **Personal and authentic** — A true reflection of who I am
- **Continuously evolving** — Like a digital sea, it grows over time

---

## 📝 License

MIT License — feel free to use this as inspiration for your own digital sea.

---

## 🌊 Dive In

Visit the live site at [nuroctane.xyz](https://nuroctane.xyz) or explore the code to see how it all works.

---

<div align="center">

*Built with curiosity and code*

</div>
