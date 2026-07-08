<div align="center">

# 🌊 nuroctane.xyz

### _a digital sea of thoughts, books, and experiences_

[![Live Site](https://img.shields.io/badge/🌐-Live%20Site-blue?style=for-the-badge)](https://nuroctane.xyz)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

</div>

## 🧠 What is this?

This is my personal digital sea — a living portfolio that captures the different facets of my life:

- **📚 Books** — A curated library of books I've read, with community recommendations and live search via Google Books & Open Library APIs
- **💭 Quotes** — A collection of thoughts, ideas, and quotes that have shaped my thinking, organized by theme

The site is built as a single-page application with a distinct aesthetic inspired by terminal interfaces and digital landscapes. It's not just a portfolio — it's an extension of my mind.

The visual aesthetic draws inspiration from the French animated series **Code Lyoko** (MoonScoop, 2003–2007, created by Thomas Romain and Tania Palumbo). [Wikipedia](https://en.wikipedia.org/wiki/Code_Lyoko)

---

## 🛠️ Tech Stack

- **Framework**: React + Vite (site), Vanilla JS (modkeys configurator)
- **Styling**: TailwindCSS (site), Vanilla CSS with custom properties (modkeys)
- **3D Elements**: Three.js (modkeys configurator)
- **Routing**: Wouter
- **API**: Express 5 (Vercel serverless function)
- **Storage**: Upstash Redis KV (visitor books, modkeys configs)
- **Package Manager**: pnpm (workspace monorepo)

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
The Modkeys Keyboard Configurator is a fully integrated mechanical keyboard customization tool that allows users to design and visualize their ideal keyboard layouts in real-time 3D.

#### Features
- **Complete Customization**: Layout (60%, 65%, 75%), profile, material, switches, keycaps, case, plate, lighting, and extras
- **Real-time 3D Preview**: Powered by Three.js with realistic materials and lighting
- **Per-Key Customization**: Double-click any key to customize text, color, font size, add glow effects, or upload images
- **Theme System**: Light/dark mode with smooth transitions
- **Export Options**: 
  - KLE (Keyboard Layout Editor) JSON
  - SVG layout template
  - Detailed spec sheet with BOM
  - Shareable URL with encoded state
- **Built-in Presets**: 15 designer-curated presets showcasing different styles
- **Extensive Library**: 
  - 19 colorways (Claude, Gemini, Sakura, Verdant, Abyssal, Dune, Monochrome, Umbra, Moss, Contrast, Rosette, Noir, Embers, Matcha, Carbon, Vaporwave, Dracula, Blush, Honey)
  - 16 case options (Porcelain, Clay, Space Gray, Midnight, Silver, Navy, Olive, E-White, Rose Gold, Burgundy, Forest, Lavender, Copper, Coral, Arctic, Sakura)
  - 8 plate options (Aluminum, Brass, Polycarbonate, Carbon Fiber, Copper, Steel, POM, FR4)
  - 10 switch types (Boba U4T, Holy Panda, Box Jade, Silent Ink, Cream, Teal, Sunset, Topaz, Emerald, Silver)
  - 7 keycap profiles (Cherry, OEM, XDA, SA, DSA, MT3, ASA)
  - 4 extras (Rotary Knob, Coiled Cable, Wrist Rest, Switch Lube Service)
- **Interactive Controls**: 
  - Orbit/pan camera controls with inertia
  - Multiple view presets (3D, Explode, Top, Side, Front)
  - Navigation: Sidebar (desktop) / section tabs (mobile) with instant section switching across Layout, Keycaps, Switches, Case, Plate, Lighting, Extras
  - Export and save functionality

#### Technical Implementation
The Modkeys configurator is embedded as an imperative Vanilla JS page (`/modkeys`) within the Vite + React SPA. Key technical aspects:
- **CSS Scoping**: All Modkeys CSS is scoped under `.modkeys-page` to prevent style conflicts with the main site
- **Theme Independence**: Uses its own CSS variable system (`--bg`, `--ink`, etc.) that doesn't interfere with the site's Tailwind-based design
- **Bootstrapping**: Vanilla JS modules are bootstrapped imperatively on mount and torn down on unmount (no React wrappers, no two-way binding)
- **Dual-shell architecture**: A dedicated mobile shell (`.mShell`) is swapped in at boot via `matchMedia` on phones/tablets, sharing element IDs with the desktop shell so all module code runs unchanged. ID parity is enforced by `check-shell-ids.mjs`; architecture is documented in `MOBILE_SHELL.md`.
- **Performance**: Lazy-loaded via React.lazy + Suspense, with all heavy Three.js assets loaded on demand
- **State Management**: Centralized mutable state store with undo/redo history (50-step limit)
- **Sharing**: Configuration can be shared via URL-encoded state or exported as KLE/SVG/spec files

#### Recent Improvements
- **Keycaps Preview**: Replaced absolute-positioned keycaps with CSS grid layout — properly centers TAB, Q, S keys with even spacing and places the spacebar below them. Keys scale responsively at all breakpoints (52px desktop → 30px small mobile).
- **Mobile Shell (v0.70+)**: A dedicated mobile shell is swapped in at boot via `matchMedia`, so the mobile page is now fully functional — not just a shrunk desktop. It includes a portrait-first (+ landscape) layout, a 3D preview with an icon view-pill bar (3D / Explode / Top / Side / Front), section tabs for Layout → Keycaps → Switches → Case → Plate → Lighting → Extras, material-specific click sounds (PBT keeps the switch sound; ABS/Ceramic add resonance layers), and safe-area + dvh handling throughout.

### 🎨 Design System
- Dark, terminal-inspired aesthetic
- Smooth animations and transitions
- Responsive design
- Custom component library (shadcn/ui inspired)
- Audio player integration


##  Project Structure

```
nuroctane-xyz-Site/
├── api/                      # Vercel serverless functions
├── artifacts/
│   ├── digital-sea/          # Main React SPA (Vite + TailwindCSS)
│   │   ├── src/
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # Page components (Books, Quotes, Modkeys)
│   │   │   ├── content/      # Markdown content files
│   │   │   └── hooks/        # Custom React hooks
│   │   └── dist/             # Build output
│   ├── api-server/           # Express 5 API (Vercel serverless)
│   └── modkeys/              # Standalone keyboard configurator
├── lib/                      # Shared libraries (kv, db, api-zod, api-spec)
└── scripts/                  # Build and utility scripts
```


## 🎯 Philosophy

This site is designed to be:
- **Minimal yet expressive** — Clean design that lets content shine
- **Fast and responsive** — Optimized for performance
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
