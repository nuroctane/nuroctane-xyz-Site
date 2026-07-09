# Agent memory index (nuroctane.xyz)

Repo is a **pnpm monorepo** → GitHub `main` → **Vercel**. Local Windows + Linux CI only; Replit tooling removed.

## Project map
- **Site SPA:** `artifacts/digital-sea` (React + Vite + R3F + wouter)
- **Modkeys:** `artifacts/modkeys` (vanilla ESM + Three.js; dual desktop/mobile shells)
- **API:** `artifacts/api-server` + root `api/*` Vercel functions (books, modkeys gallery, github-contrib)
- **Build:** root `pnpm run build` = typecheck → package builds → smoke → modkeys spa-shell check
- **Deploy:** root `vercel.json` → `outputDirectory: artifacts/digital-sea/dist/public`, SPA rewrite, daily GH contrib cron

## Digital Sea / R3F
- [InstancedMesh culling](instanced-mesh-culling.md) — `frustumCulled={false}` on scattered instanced batches
- [R3F camera centering](r3f-camera-centering.md) — blend `lookAt` toward node, not only lean position.x
- [R3F Html vs canvas filter](r3f-html-canvas-filter.md) — CSS filter on `gl.domElement` does not tint `<Html>` cards
- [Hold-to-drag on Html cards](html-card-drag.md) — **defer** `setPointerCapture` until hold timer; `didDrag` only on move
- [OrbitControls touch-action](orbitcontrols-touch-action.md) — unmount controls outside camera mode; set `touch-action`
- [OrbitControls mode switch / target](orbitcontrols-mode-switch.md) — own OrbitControls instance; seed `target` before first update
- [WASD + OrbitControls](wasd-orbit-coexistence.md) — move `controls.target` by same delta as camera
- [R3F no WebGL in test env](r3f-no-webgl-in-test-env.md) — don’t e2e/screenshot-validate inside Canvas
- [Link opening in iframes](link-opening-iframes.md) — prefer `<a target="_blank">` over `window.open`
- [Scene nodes + QuickNav](digital-sea-nodes.md) — 25 cards, FLIP_X, PROJECT_THRESHOLD, snipocr after modkeys
- [BUILD_VER counter](digital-sea-versioning.md) — bump `WalletTag.tsx` on user-facing site changes

## Deploy / platform
- [Vercel + Vite monorepo](vercel-deploy-vite-artifact.md) — PORT/BASE_PATH defaults, outDir, analytics, push to main

## Modkeys (configurator)
- [Modkeys architecture](modkeys-architecture.md) — dual shell, Customize/photo-match, knob id, gallery admin API paths
