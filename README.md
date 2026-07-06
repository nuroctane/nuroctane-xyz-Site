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

- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **3D Elements**: Three.js + React Three Fiber
- **Routing**: Wouter
- **Build Tool**: Vite
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
- **Built-in Presets**: 15+ designer-curated presets showcasing different styles
- **Extensive Library**: 
  - 20+ colorways (including Noir, Embers, Matcha, Carbon, Vaporwave, Dracula, Blush, Honey)
  - 16 case options (Porcelain, Clay, Space Gray, Midnight, Silver, Navy, Olive, E-White, Rose Gold, Burgundy, Forest, Lavender, Copper, Coral, Arctic, Sakura)
  - 8 plate options (Aluminum, Brass, Polycarbonate, Carbon Fiber, Copper, Steel, POM, FR4)
  - 10 switch types (Boba U4T, Holy Panda, Box Jade, Silent Ink, Cream, Teal, Sunset, Topaz, Emerald, Silver)
  - 7 keycap profiles (Cherry, OEM, XDA, SA, DSA, MT3, ASA)
  - 4 extras (Rotary Knob, Coiled Cable, Wrist Rest, Switch Lube Service)
- **Interactive Controls**: 
  - Orbit/pan camera controls with inertia
  - Multiple view presets (3D, Exploded, Top, Side, Front)
  - Sidebar navigation with instant section switching
  - Export and save functionality

#### Technical Implementation
The Modkeys configurator is embedded as a standalone React page (`/modkeys`) within the Next.js application. Key technical aspects:
- **CSS Scoping**: All Modkeys CSS is scoped under `.modkeys-page` to prevent style conflicts with the main site
- **Theme Independence**: Uses its own CSS variable system (`--bg`, `--ink`, etc.) that doesn't interfere with the site's Tailwind-based design
- **Performance**: Lazy-loaded via React Suspense, with all heavy assets (3D models, textures) loaded on demand
- **State Management**: Centralized state store with undo/redo history (50-step limit)
- **Sharing**: Configuration can be shared via URL-encoded state or exported as KLE/SVG/spec files

#### Recent Improvements
- **Keycaps Preview**: Replaced absolute-positioned keycaps with CSS grid layout — properly centers TAB, Q, S keys with even spacing and places the spacebar below them. Keys scale responsively at all breakpoints (52px desktop → 30px small mobile).
- **Mobile Rework**: Stage height reduced from 340→180px (≤768px) and 260→140px (≤420px) to give configuration controls adequate room. Fixed scrolling model (main area scrolls, tab bar stays fixed). Compact controls (chips, buttons, swatches) sized for touch targets ≥44px. Legibility improved with responsive font sizes.

### 🎨 Design System
- Dark, terminal-inspired aesthetic
- Smooth animations and transitions
- Responsive design
- Custom component library (shadcn/ui inspired)
- Audio player integration


##  Project Structure

```
nuroctane-xyz-Site/
├── artifacts/
│   └── digital-sea/          # Main React application
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── pages/        # Page components (Books, Quotes, Modkeys)
│       │   ├── content/      # Markdown content files
│       │   └── hooks/        # Custom React hooks
│       └── public/           # Static assets
├── lib/                      # Shared libraries
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
