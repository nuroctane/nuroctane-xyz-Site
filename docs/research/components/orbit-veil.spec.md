# Orbit Veil reconstruction specification

Reference: `https://34y2qzlcnflec.ok.kimi.link/?id=2077776114931048448`

## Product contract

Orbit Veil is a full-viewport, frontend-only satellite tracker. It loads CelesTrak
TLE sets, propagates them locally with `satellite.js`/SGP4, and renders the Earth,
satellites, orbit tracks, and coverage footprints in WebGL. The integrated page
must retain the reference interactions while living at `/orbit` inside the
nuroctane SPA.

Required behavior:

- Load a bundled TLE snapshot immediately and attempt a fresh CelesTrak refresh.
- Track the active, visual, Cosmos-2251 debris, Iridium-33 debris, and Fengyun-1C
  debris sets; the observed reference presented 18,813 objects.
- Propagate satellite positions continuously in the browser without per-frame API
  calls.
- Support search by name or NORAD ID and a selectable satellite detail panel.
- Support layer visibility toggles, simulated-time stepping (`-240x` through
  `+240x`), pause/resume, and return-to-live.
- Support selected-satellite orbit, footprint, and follow controls.
- Preserve mouse/touch globe manipulation and responsive HUD behavior.
- Remove the reference host's Kimi attribution badge from the integrated build.

## Visual contract

Desktop reference viewport: 1280 x 721 at approximately 1.11 DPR.

- Full-bleed WebGL canvas on a `#04060a` page with no document scrolling.
- Earth fills roughly 50% of the viewport width, centered slightly below the
  midpoint, with day/night NASA imagery, a thin atmospheric rim, star field, and
  thousands of color-coded orbital points.
- Top-left wordmark: widely tracked white monospace capitals, with a cyan orbit
  ring around the first `O`; tracked-object line sits below in muted slate.
- Top-center time card: near-black translucent rectangle, large UTC time, date,
  green live indicator.
- Top-right search: dark translucent rectangular field, search icon, monospace
  placeholder.
- Left layer panel: dark translucent card, `LAYERS` eyebrow, twelve full-width
  toggle rows, colored dots, right-aligned counts; disabled rows fade to about
  35% opacity.
- Bottom-center time controller: rounded near-black rail with six speed buttons,
  pause icon, and bright green live pill.
- Bottom-left provenance: CelesTrak, SGP4/satellite.js, NASA Blue Marble.
- Bottom-right FPS counter.
- Selected satellite detail card: dark translucent bordered panel with category,
  name, NORAD ID, six metrics, TLE epoch, and Orbit / Footprint / Follow toggles.

Mobile reference viewport: 390 x 844.

- Globe remains full bleed and zooms in to fill the narrow viewport.
- Wordmark/time card share the first row; search becomes a wide row below.
- Layer panel collapses behind a `Layers` button.
- Detail panel anchors above the bottom time controller with a two-column metrics
  grid.
- Time controller spans nearly the full width and remains horizontally usable.
- The page must not introduce horizontal or vertical document overflow.

## Integration contract

- Canonical SPA route: `/orbit`; `/orbit-veil` remains a compatibility alias.
- Browser title: exactly `Orbit Veil`.
- Route favicon: Orbit Veil project mark.
- Leaving via QuickLaunch must restore the normal site favicon/title through the
  canonical route metadata system.
- QuickLaunch must remain above the WebGL page and expose every current top-level
  user route: Home, Socials, Projects, Blog, Quotes, Books, Resume, MODKEYS,
  NurCLI, Orbit Veil, and Fin.
- Analytics path and route: `/orbit`.
- Crawler middleware, OG theme, route docs, and page metadata must include the new
  route.
- The Digital Sea project node must be the final project, after Utilities for The
  Wired, and deep-link as `/projects/orbit-veil` while opening `/orbit`.
- Project assets: a dedicated node/favicon mark and at least one orbiting media
  image derived from the validated tracker presentation.

## Validation contract

- Monorepo typecheck and production build pass.
- Direct loads of `/orbit` and `/orbit-veil` resolve through the SPA rewrite.
- Desktop and mobile screenshots visually match the reference composition.
- Search returns ISS results, selecting ISS opens live telemetry, layer toggles
  visibly disable a class, and time controls remain interactive.
- QuickLaunch navigation back to `/` restores `NUROCTANE — Digital Sea` metadata
  and `/assets/nodes/site-logo.png`.
