---
name: Modkeys dual-shell and product contracts
description: Dual shells, Customize/photo-match, rotary knob id, gallery admin API, versioning touchpoints.
---

Package: `artifacts/modkeys` (also embedded at `/modkeys` via digital-sea `ModkeysPage`).

## Dual shell
- Desktop `.dShell` and mobile `.mShell` share the same element IDs.
- SPA: React chooses shell from `matchMedia` (no template swap on SPA re-render).
- Standalone: `shell.js` may swap; ID parity via `check-shell-ids.mjs`; SPA sentinel via `check-spa-shell.mjs`.
- Architecture detail: `artifacts/modkeys/MOBILE_SHELL.md`.

## Customize / photo match
- Section `customize`: photo upload, 4-corner quad, board-from-photo toggles, multi-select.
- Photo pipeline: `core/photoMatch.js` (board mask, k-means roles, median sample, projective map).
- Per-key overrides in `state.perKeyOverrides`; global colorway must strip cap `bgColor`/`fgColor`
  when applying stock/custom roles (`clearPerKeyCapColors`) or photo paints stay locked.
- Load full snaps with `loadSnap()` so missing `perKeyOverrides` clears leftovers.

## Rotary knob
- Stable id `KNOB_ID = 'knob'` (`perKey.js`), same override fields as keys.
- Drag (after 5px) → brightness + rotation; double-click / multi-select → Customize.
- Dial tick = legend (Label shown + fgColor); emoji/image replace tick.
- Cursor: stage `grab` / `grabbing` — do not leave canvas stuck on `ew-resize`.

## Gallery admin
- Password = `BOOKS_ADMIN_PASSWORD` (shared with books).
- On Vercel, multi-segment routes under `/api/modkeys/*` can 404; admin uses
  `POST /api/modkeys/gallery` with `action: verifyAdmin | rename | delete`.
- Client: `galleryAdmin.js` + Ctrl+Shift+A (desktop).

## Telemetry
- SPA: Analytics + Speed Insights in digital-sea `main.tsx`.
- Standalone modkeys: `inject()` in `index.html`.
- Custom events: `core/analytics.js` → `window.va` / `vaq`.
