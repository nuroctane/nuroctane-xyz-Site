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
