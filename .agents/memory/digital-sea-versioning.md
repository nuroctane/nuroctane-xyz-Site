---
name: Digital Sea visible version counter
description: Keep the bottom-right VER tag in sync with user-facing Digital Sea changes.
---

The Digital Sea app displays its visible version in
`artifacts/digital-sea/src/components/panels/WalletTag.tsx` as `BUILD_VER`.

Whenever making user-facing changes to `artifacts/digital-sea` **or** embedded
modkeys UX that ships with the site, update `BUILD_VER` in the same change.
Use the existing `v0.xx` style. Increment by at least `0.01` for each completed
change batch, and by more when a batch contains multiple visible UX/content/
environment changes.

**Current:** check `WalletTag.tsx` (was **v0.98** as of snipocr macOS copy).

Also related: scene cards in `data/nodes.ts` (25 nodes), modkeys dual-shell
under `artifacts/modkeys`, analytics in `main.tsx`. See MEMORY.md index.

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
- v0.74.1 (2026-07-08): telemetry caveats addressed — Wouter path/route passed into Analytics +
  Speed Insights; beforeSend strips share-hash from pageviews; Modkeys custom events (Save /
  Export / Share) via core/analytics.js; standalone modkeys boot injects @vercel/analytics.
- v0.75 (2026-07-08): desktop snav text-only column + centered mobile tab
  labels (class dShell on shell; .dot margin scoped so pills center).
- v0.76 (2026-07-08): telemetry caveats — SPA path/route Analytics + Speed
  Insights, custom Modkeys events, standalone inject (already noted as
  0.74.1; kept for BUILD_VER continuity).
- v0.77 (2026-07-08): desktop key font-size live legend update.
- v0.78 (2026-07-08): community gallery admin (books-style dialogs, rename/
  delete, BOOKS_ADMIN_PASSWORD).
- v0.79 (2026-07-08): export per-key options parity (SVG/PDF/spec font/image/
  glow) + cap freeze while editing (partial).
- v0.80 (2026-07-08): freeze the CAMERA on key edit — 5px engage threshold,
  no orbit arm while selectedKey, inertia zeroed on editor open (Fable).
- v0.81 (2026-07-08): plate COLOR picker (tints material) independent of
  plate MATERIAL; procedural plate textures (brushed metal, carbon weave,
  FR4 grain, plastic); keycap PBT/ABS/ceramic distinct bump maps; exports
  include plate color + material optical props.
- v0.82 (2026-07-08): GitHub secondary node — live contribution terrain
  (KV cache + daily Vercel cron /api/github-contrib/refresh); Instagram IRL
  polaroid sidecards; Goodreads nuroctane sidecard secondary.
- v0.83 (2026-07-08): key-editor camera — allow intentional orbit/pan while
  editing (keep 5px engage + zero inertia on open; stop blocking camera when
  selectedKey). Plate color picker: live tint without setState panel rebuild
  (was freezing UI until wheel); releasePointerCapture on pointerup.
- v0.84 (2026-07-08): case/switch/light free color pickers (live apply, commit
  on change); exports reflect custom hexes; GitHub contrib terrain centered in
  secondary card; README credits thebuggeddev/modkeys.
- v0.85 (2026-07-08): Customize section (desktop+mobile) — photo→board colour
  copy with 4-corner fit, multi-select (shift/multi mode), emoji grid, image
  fit wrap/fill/sticker, label hide, reset one/all; double-click opens Customize.
- v0.86 (2026-07-08): photo-match CV upgrade — board detect (largest non-bg
  component), auto keycap-field corners, median sampling, k-means palette +
  role assign (alpha/mod/accent/case/glow) with vivid accent rescue; upload
  auto-applies roles + per-key copy; Auto-fit board re-detect; projective
  unit→quad map; modular dual-shell Customize.
- v0.87 (2026-07-08): Customize photo-match board toggles — Case / Plate /
  Light / Switch (and Keycaps) adopt photo colours when on; plate rim median
  + switch from accent; re-apply on copy/auto-fit; snav dots stay in sync.
- v0.88 (2026-07-08): photo-match copy — any photo (not only keyboards); PNG/JPG
  max 25 MB same as key image uploads (validateImageFile + accept).
- v0.89 (2026-07-08): modkeys gallery admin — BOOKS_ADMIN_PASSWORD works on Vercel
  (admin ops via action: on POST /api/modkeys/gallery; multi-segment paths were
  NOT_FOUND); books stores shared book-admin-pw for cross-page unlock.
- v0.90 (2026-07-08): load photo/custom builds correctly — customColors wins over
  named colorway; perKeyOverrides rebuild key materials (not legends-only);
  loadSnap for gallery/saved/hash; snav configure dots follow restored colours.
- v0.91 (2026-07-08): after photo-matched builds, colorway / custom Alpha-Mod-Accent
  edits work again — strip per-key bg/fg on global recolour (overrides were
  locking faces); loadSnap/presets clear leftover photo overrides when absent.
- v0.92 (2026-07-08): light modes Wave + Off fixed — wave is uMode 0 so `|| 3`
  coerced it to Off; Off now zeros shaders and hides glowPlane/keyGlow.
- v0.93 (2026-07-08): key emoji on 3D caps — user markId no longer suppressed by
  labelHidden; unicode fallback while Twemoji loads; None / re-click clears emoji
  and restores legend text.
- v0.94 (2026-07-08): rotary knob customizable like a key — double-click / multi-
  select; body colour (accent colorway); dial tick = legend (show + colour);
  emoji/image + fit replace tick; drag-to-brightness kept (5px engage).
- v0.95 (2026-07-08): Vercel Analytics — beforeSend keeps absolute URLs (relative
  paths could drop intake); mode=production for Vite SPA; standalone inject same.
- v0.96 (2026-07-08): @vercel/speed-insights → v2.0.0 (latest); SI beforeSend hash
  strip + absolute URLs; framework=react per quickstart.
- v0.97 (2026-07-09): snipocr creative node after modkeys (repo logo + github badge,
  description matches GitHub); QuickNav logo; FLIP_X parity preserved for shifted cards.
- v0.98 (2026-07-09): snipocr summary notes Windows + macOS screenshot OCR.
- (2026-07-09): repo de-Replit — remove .replit / replit.nix / @replit Vite plugins /
  linux-only pnpm platform overrides; local Windows + Vercel only. Agent memory
  notes updated to match (no Replit-required env or Git pane).
- v0.99 (2026-07-09, retro): hidden /resume page ships the full CV (a66ee83).
- v0.100 (2026-07-09, retro): Blackjack project node added + swim pathing fix (43b48e8).
- v0.101 (2026-07-09, retro): AstroSleep node logo + GitHub badge (2e95c85).
- v0.102 (2026-07-09, retro): AstroSleep quicknav logo + MODKEYS page chrome (c6aecf9).
- v0.103 (2026-07-09, retro): analytics SPA route/event expansion incl. /resume (eda1795).
- v0.104 (2026-07-09, retro): even node focus spacing along the swim (d274e9a).
- v0.105 (2026-07-09, retro): project-zone camera band aligned with even mids (7492051).
- v0.106 (2026-07-09, retro): path-specific OG link embeds for every surface (f28642d).
- v0.107 (2026-07-09, retro): quicknav categories expand-only, leaves navigate (be6c9bf).
- v0.108 (2026-07-10, retro): resume content sync DDCV2026 from Drive (098ab91).
- v0.109 (2026-07-10): snap-back + dive-crash fix (5d87a7c, Grok 4.5) — audited GOOD:
  intent gate severs the URL-mirror feedback loop, rawScrollT removes lerp-lag
  misclassification, hysteresis stops boundary thrash, OrbitCam right-vector
  fallback is the canonical zero-cross NaN fix.
- v0.110 (2026-07-11): hardening pass on the snap-back/dive-crash fix
  (5d87a7c, audited GOOD — intent gate severs the URL-mirror feedback loop at
  the right place, rawScrollT removes the lerp-lag misclassification,
  hysteresis stops boundary thrash, OrbitCam right-vector fallback is the
  canonical zero-cross fix). Two gaps closed: (1) navIntent now carries a
  1500ms TTL — a marked navigation to the path the user is already on never
  runs the routing effect, so the armed flag lingered and the next passive
  mirror replace would consume it and snap the swimmer to a section start
  (the original bug resurrected through the fix's own mechanism); stale
  intents now expire harmlessly. (2) SecondaryNodes sidecard links mark
  navigation intent (semantic correctness; today's only link is /books which
  unmounts App, but future sea-section links would have been silent no-ops).

Retroactive-numbering note (2026-07-11): ten feature/fix commits landed on
main between v0.98 and the snap-back fix without a BUILD_VER bump; assigned
v0.99-v0.108 in commit order (docs/chore/quotes-auto-sync commits excluded as
non-shipping). The snap-back fix is v0.109; this hardening pass is v0.110.
