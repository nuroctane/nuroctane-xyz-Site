---
name: Digital Sea main-path nodes layout
description: How social/creative cards are ordered, spaced, flipped, and wired into QuickNav.
---

Source of truth: `artifacts/digital-sea/src/data/nodes.ts`.

## Count and order
- **25** primary cards on the main scroll path (15 social + 10 creative as of snipocr).
- Creative block starts with **modkeys**, then **snipocr**, then atxtunerz, github, …
- Scroll envelopes: `FIRST_START = 0.075`, `LAST_START = 0.875`,
  `STEP = (LAST_START - FIRST_START) / (n - 1)`. Adding a card compresses spacing for everyone.

## Side placement (FLIP_X)
- Default side alternates by index: even → x negative, odd → positive (see map in `nodes.ts`).
- `FLIP_X` Set mirrors a card across the path so the camera looks *at* it, not nose-on.
- **When inserting a card mid-list**, later cards shift index parity. **Invert** their
  membership in `FLIP_X` so world-side stays the same (done for snipocr insert).

## Section label / QuickNav
- `PROJECT_THRESHOLD = 0.60` (SectionLabel + QuickNav): mid-scroll of card
  `(scrollStart+scrollEnd)/2` &lt; threshold → social, else creative.
- First creative mid must stay ≥ 0.60 (modkeys ≈ 0.609 with 25 nodes).
- QuickNav builds lists from `nodes` order automatically; add icons in `LOGO_MAP`
  (`QuickNav.tsx`) or use `ACRONYM_MAP` for text-only tiles.

## Card fields
- `avatar` = large mark (top); `logo` = small badge (bottom) — e.g. snipocr logo + github logo.
- `description` is the summary body text on the 3D card.
- Secondaries: `secondaryNodes.ts` + files under `src/assets/secondary-nodes/` (optional sidecards).

## How to add a node
1. Insert entry in `raw[]` at the desired scroll order.
2. Recompute / invert `FLIP_X` for any index-shifted ids.
3. Optional `WIDE_CARD[id]` for late-path framing time.
4. `LOGO_MAP` / assets under `public/assets/nodes/`.
5. Bump `BUILD_VER` (user-facing).
