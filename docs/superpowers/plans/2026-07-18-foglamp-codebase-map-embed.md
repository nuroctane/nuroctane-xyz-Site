# Foglamp Codebase Map Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive, interactive Foglamp codebase map directly below the existing NurCLI TUI demo and ship it to production.

**Architecture:** A focused `FoglampMap` React component inside `CliPage.tsx` owns third-party embed rendering and focus behavior. A tiny pure viewport-state helper makes desktop auto-load/mobile defer behavior testable without adding a test framework. Route-specific CSS provides the terminal frame, responsive preview, and reduced-motion treatment.

**Tech Stack:** React 19, TypeScript, Vite, CSS, Node.js built-in test runner, Vercel CLI

## Global Constraints

- Keep the map inside the existing `02 Demo` section; do not renumber sections or change jump navigation.
- Load the live iframe automatically when `(min-width: 721px)` matches.
- At 720px and below, show the Foglamp Open Graph preview until the visitor activates the map.
- Once loaded, keep the iframe mounted when the viewport narrows.
- Use `clamp(440px, 64vw, 560px)` for the map viewport height.
- Keep a direct `Open in Foglamp` link visible outside the cross-origin iframe.
- Add no runtime dependency, route, proxy, or analytics system.
- Preserve the existing unrelated `.gitignore` and `.nur/` working-tree changes.

---

### Task 1: Test responsive loading policy

**Files:**
- Create: `artifacts/digital-sea/src/lib/foglampEmbed.test.ts`
- Create: `artifacts/digital-sea/src/lib/foglampEmbed.ts`

**Interfaces:**
- Produces: `shouldLoadFoglampMap(matchesDesktop: boolean, alreadyLoaded: boolean): boolean`
- Consumes: Node's built-in `node:test` and `node:assert/strict`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldLoadFoglampMap } from './foglampEmbed.ts';

test('defers the first Foglamp load on mobile', () => {
  assert.equal(shouldLoadFoglampMap(false, false), false);
});

test('loads Foglamp automatically on desktop', () => {
  assert.equal(shouldLoadFoglampMap(true, false), true);
});

test('keeps Foglamp loaded after the viewport narrows', () => {
  assert.equal(shouldLoadFoglampMap(false, true), true);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test artifacts/digital-sea/src/lib/foglampEmbed.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `foglampEmbed.ts`.

- [ ] **Step 3: Add the minimal helper**

```ts
export function shouldLoadFoglampMap(
  matchesDesktop: boolean,
  alreadyLoaded: boolean,
): boolean {
  return matchesDesktop || alreadyLoaded;
}
```

- [ ] **Step 4: Run the test to verify GREEN**

Run:

```bash
node --test artifacts/digital-sea/src/lib/foglampEmbed.test.ts
```

Expected: 3 tests pass, 0 fail.

### Task 2: Build the progressive interactive embed

**Files:**
- Modify: `artifacts/digital-sea/src/pages/CliPage.tsx:1-16,584-654,891-914`
- Modify: `artifacts/digital-sea/src/cli-page.css:850-880,1187-1212,1328-1334`

**Interfaces:**
- Consumes: `shouldLoadFoglampMap(matchesDesktop, alreadyLoaded)` and existing `trackEvent(name, properties)`.
- Produces: `FoglampMap` component rendered beneath the TUI GIF.

- [ ] **Step 1: Add constants and the `FoglampMap` component**

Add scan constants, import the loading helper, and implement a component that:

```tsx
const FOGLAMP_SCAN_URL = 'https://www.foglamp.dev/scan/nurcli-oxpatc';
const FOGLAMP_PREVIEW_URL = `${FOGLAMP_SCAN_URL}/opengraph-image`;
```

- Initializes from the desktop media query so desktop does not flash or request the mobile preview before mounting the iframe.
- Watches `matchMedia('(min-width: 721px)')` and calls `setLoaded(current => shouldLoadFoglampMap(query.matches, current))`.
- Cleans up the `change` listener.
- Uses a focus-request ref so manual activation focuses the iframe only after React mounts it.
- Tracks `Cli Foglamp Load` and `Cli Foglamp Open` with the existing analytics helper.
- Renders a terminal header, preview/button or iframe, and a persistent direct link.
- Gives the iframe `title`, `loading="eager"` after the responsive gate admits it, `allow="fullscreen"`, `allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"`, and `tabIndex={0}`.

- [ ] **Step 2: Render it below the existing demo figure**

After the `</figure>` for `nur-demo.gif`, add a compact `CODEBASE MAP` intro and `<FoglampMap />`. Keep both inside `<section id="demo">`.

- [ ] **Step 3: Add terminal-native styling**

Add `.cli-map-*` rules that provide:

- A 1px NurCLI border, near-black canvas, and restrained gold edge highlight.
- Compact terminal chrome and a persistent external link.
- A `clamp(440px, 64vw, 560px)` iframe/preview viewport.
- A dimmed full-bleed preview image with a centered activation button.
- Focus-visible outlines and `scale(0.97)` only on the explicit button press.
- Mobile copy/layout adjustments at 560px.
- Reduced-motion overrides for preview entry and button press.

- [ ] **Step 4: Run focused verification**

Run:

```bash
node --test artifacts/digital-sea/src/lib/foglampEmbed.test.ts
pnpm --filter @workspace/digital-sea run typecheck
pnpm --filter @workspace/digital-sea run build
```

Expected: 3 tests pass; typecheck and build exit 0.

### Task 3: Verify the complete page and ship

**Files:**
- Create: `docs/superpowers/plans/2026-07-18-foglamp-codebase-map-embed.md`
- Modify only through generated build output ignored by git.

**Interfaces:**
- Consumes: built `/cli` page and the canonical `SHIP.md` pipeline.
- Produces: committed feature on `origin/main`, live Vercel production deployment, and dated backup archive.

- [ ] **Step 1: Run the repository verification suite**

```bash
pnpm run build
```

Expected: root typecheck, recursive builds, smoke checks, and SPA shell check all exit 0.

- [ ] **Step 2: Inspect the diff and requirement coverage**

Confirm:

- No unrelated file is staged.
- The map is beneath the GIF and inside Demo.
- Desktop and sticky-loaded state are covered by tests.
- Mobile has a preview activation control.
- Direct fallback links and iframe accessibility attributes exist.
- CSS includes responsive and reduced-motion rules.

- [ ] **Step 3: Commit relevant files**

```bash
git add \
  artifacts/digital-sea/src/lib/foglampEmbed.ts \
  artifacts/digital-sea/src/lib/foglampEmbed.test.ts \
  artifacts/digital-sea/src/pages/CliPage.tsx \
  artifacts/digital-sea/src/cli-page.css \
  docs/superpowers/plans/2026-07-18-foglamp-codebase-map-embed.md
git commit -m "feat: embed NurCLI Foglamp codebase map"
```

- [ ] **Step 4: Record the pre-deploy bundle, push, deploy, and inspect production**

```bash
curl -s https://www.nuroctane.xyz/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1
git push origin main
vercel --prod --yes --scope nuroctane-projects
curl -s https://www.nuroctane.xyz/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1
vercel inspect www.nuroctane.xyz --scope nuroctane-projects
```

Expected: push updates `origin/main`, Vercel reports a ready production URL, the live bundle hash differs from the pre-deploy hash, and `vercel inspect` points the domain to that deployment.

- [ ] **Step 5: Verify live `/cli` content**

Fetch `https://www.nuroctane.xyz/cli` and its current bundle; confirm the emitted JavaScript contains `foglamp.dev/scan/nurcli-oxpatc`.

- [ ] **Step 6: Create and confirm the required backup**

Create a 7z archive under `D:\BACKUP\CODE Backups\nuroctane.xyz\` named `nuroctane.xyz_YYYY-MM-DD_<sha>_<subject-slug>.7z`, excluding `.git`, `.nur`, `node_modules`, `dist`, `.next`, `target`, and `graphify-out`. Confirm the archive exists before reporting completion.
