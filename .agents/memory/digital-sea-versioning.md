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
