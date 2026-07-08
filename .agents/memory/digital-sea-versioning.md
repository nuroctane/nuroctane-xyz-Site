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
- v0.70 (2026-07-07): modkeys two-shell architecture. Responsive-CSS mobile
  approach fully retired (all @media stripped from layout.css/components.css
  and from ModkeysPage's injected overrides); dedicated mobile shell
  (template #mShellTpl, portrait-first + landscape MQ in mobile.css) swapped
  in at boot by matchMedia, same element IDs both shells, boundary crossing
  reloads. tnav wired for real (was decorative). ID parity enforced by
  artifacts/modkeys/check-shell-ids.mjs; architecture in MOBILE_SHELL.md.
- v0.71 (2026-07-07): modkeys mobile — view pills (3D/Explode/Top/Side/Front)
  moved from a top-left flex-wrap (which hid 3D/Explode on a clipped 2nd row)
  to a single no-wrap scrollable bar pinned to the stage bottom; #pillInd
  slider dropped for a solid .on background; tools cluster moved to top-right.
  Section tabs compacted to small scrollable pills (32px) reclaiming panel
  height. color-mix backgrounds given solid fallbacks. CSS-only, mobile.css.
- v0.72 (2026-07-07): ROOT CAUSE of all five failed mobile-shell rounds —
  the SPA swapped React-owned DOM, and any re-render (wouter useLocation
  subscription) resurrected the desktop shell, so phones never had .mShell
  and mobile.css edits were invisible. Fix: React renders the shell natively
  (synchronous isMobile state, mShellHost + MSHELL_HTML, no template/swap on
  SPA); shell.js swap is standalone-only; unused useLocation removed.
  Section tabs now wrap into centered pill rows (owner spec). Post-build
  guard check-spa-shell.mjs greps the BUILT chunk for the mobile sentinel.
- v0.73 (2026-07-08): the tab-pills visual finally correct on device. With
  the shell rendering (v0.72), the remaining leak was property-level: bare
  .snav { flex-direction: column } (+ .snav .meta margin-left:auto) in
  layout.css cascaded into the mobile tabs (shared class), stacking buttons
  full-width with the meta shoved right. Entire desktop .snav family now
  .dShell-scoped; .mShell .mTabs declares flex-direction: row explicitly;
  pill visuals restored; inline-style band-aid (caeb682) stripped from the
  standalone template and MSHELL_HTML regenerated from it (parity by
  construction). check-spa-shell.mjs now fails on any unscoped .snav
  selector, missing row declaration, or inline-styled tabs. Cascade-proof
  script confirmed winning declarations for tabs and pills.
- v0.74 (2026-07-08): modkeys — key-image uploads restricted to PNG/JPG, 25 MB max, with hint
  text in both upload paths (sidebar + key editor); font-size slider actually renders now
  (legendTex cacheKey includes fontSize/ibt/textOverride); user text overrides beat themed
  marks/emoji so Esc (and any marked key) accepts custom text on par with other keys; desktop
  snav icons removed (text-only per owner, both mirrors, dead .ic rules dropped); export parity
  verified complete across shells (KLE/SVG/Spec/copyKLE/exportPDF). Site: @vercel/analytics
  mounted at SPA root.
