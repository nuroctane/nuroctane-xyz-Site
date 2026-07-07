---
name: Digital Sea visible version counter
description: Keep the bottom-right VER tag in sync with user-facing Digital Sea changes.
---

The Digital Sea app displays its visible version in
`artifacts/digital-sea/src/components/panels/WalletTag.tsx` as `BUILD_VER`.

Whenever making user-facing changes to `artifacts/digital-sea`, update `BUILD_VER`
in the same change. Use the existing `v0.xx` style. Increment by at least `0.01`
for each completed change batch, and by more when a batch contains multiple
visible UX/content/environment changes. If a formal changelog is later added,
cross-check it before choosing the next value.

History:
- v0.65 (2026-07-06): reddit + MODKEYS cards added (24 nodes, FLIP_X retuned,
  PROJECT_THRESHOLD 0.55 -> 0.60), SYS:// prefix parity across HUD labels,
  lazy-loaded card/sidecard media, vendor chunk splitting, modkeys logo rollout.
- v0.61: prior baseline.
- v0.66 (2026-07-06): reverted v0.65 lazy loading on card/sidecard media
  (native lazy intersection is computed against the page viewport, not the
  3D scene, so drei Html card assets never prefetched and popped in 5-10s
  late); modkeys mobile pass (touch-action on canvas, mobile Save/Export
  actions bar with proxy buttons, safe-area + dvh handling, iOS input
  zoom fix, landscape rules, viewport-fit=cover on both pages).
