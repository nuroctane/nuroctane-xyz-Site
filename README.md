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

The site is built as a single-page application with a distinct aesthetic inspired by terminal interfaces and digital landscapes. It's not just a portfolio — it's an extension of my mind.

The visual aesthetic draws inspiration from the French animated series **Code Lyoko** (MoonScoop, 2003–2007, created by Thomas Romain and Tania Palumbo). [Wikipedia](https://en.wikipedia.org/wiki/Code_Lyoko)

---

## 🛠️ Tech Stack

| Area | Stack |
|---|---|
| **Site (digital-sea)** | React + Vite, TailwindCSS, Wouter |
| **Modkeys** | Vanilla ES modules + Vite 6, Three.js (^0.184), GSAP, dual desktop/mobile shell (`shell.js` + `mobile.css`) |
| **API** | Express 5 on Vercel serverless (`artifacts/api-server`) |
| **Storage** | Upstash Redis KV (visitor books, modkeys configs) |
| **Export (modkeys)** | KLE JSON, SVG, spec JSON, PDF (jsPDF + svg2pdf.js) |
| **Telemetry** | Vercel Web Analytics + Speed Insights (SPA routes + Modkeys product events) |
| **Monorepo** | pnpm workspaces |

### Analytics (Vercel)

Code is wired (`mode: production` on the Vite SPA). Dashboard:

1. Open the Vercel project for this repo → **Analytics** → **Enable** Web Analytics (script at `/_vercel/insights/script.js` must 200).
2. Optionally enable **Speed Insights** in the same project (`@vercel/speed-insights` v2 + `<SpeedInsights />` in the SPA root).
3. Redeploy after enable or code changes.

**Page routes (Top Pages):** `/`, `/socials`, `/socials/:id`, `/projects`, `/projects/:id`, `/blog`, `/blog/:slug`, `/fin`, `/books`, `/quotes`, `/resume`, `/modkeys`, `/cli`.

Sea scroll + QuickNav update the URL (replace/push) so passive browsing still attributes to section routes. `/resume` is unlinked in nav (direct URL only) but still tracked.

**Custom events:** `Modkeys Save` / `Export` / `Share`, `Sea Node Open`, `Mode Change`, `Fin Open`, `Quotes Section`, `Book Open`, `Resume View`, `Resume Contact`, `Booking Click`.

**Standalone** `modkeys.vercel.app` (if a separate Vercel project) needs Analytics enabled there too — inject runs on boot.

**Privacy / notes:** Cookieless Web Analytics. Share-link `#hash` is stripped; reported URLs stay absolute. Ad blockers can hide traffic. Local dev does not feed production dashboards.

**Link embeds (Open Graph):** Edge `middleware.js` serves path-specific `og:*` HTML to crawlers/unfurlers (Discord, Slack, iMessage, X, …). Dynamic cards from `/api/og?page=…`. Humans still get the SPA. Home keeps `/opengraph.jpg`; other routes get branded cards + unique titles/descriptions.

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
├── api/                      # Vercel serverless entrypoints
├── artifacts/
│   ├── digital-sea/          # Main React SPA (Vite + TailwindCSS)
│   │   ├── src/
│   │   │   ├── components/   # UI (HUD, panels, scene)
│   │   │   ├── pages/        # Books, Quotes, Modkeys, Resume
│   │   │   ├── content/      # Markdown content
│   │   │   └── hooks/        # Custom React hooks
│   │   └── public/           # Static assets
│   ├── api-server/           # Express 5 API
│   └── modkeys/              # Keyboard configurator (Vanilla + Three.js)
│       ├── .agents/docs/MOBILE_SHELL.md
│       ├── check-shell-ids.mjs
│       └── src/              # css/, js/ (core, data, ui, export)
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
