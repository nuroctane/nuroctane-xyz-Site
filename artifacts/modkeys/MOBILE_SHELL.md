# MOBILE SHELL ARCHITECTURE (v0.70)

## The rule

MODKEYS has **two complete, independent layouts** in the same page:

- **Desktop shell** — `<div class="app" id="dShell">` in `index.html`. The
  three-panel layout. Its CSS lives in `layout.css` + `components.css` and
  contains **zero responsive `@media` blocks**. Never add any. Desktop is
  desktop.
- **Mobile shell** — `<template id="mShellTpl">` in the same file. A
  portrait-first single-column layout (header / stage / section tabs /
  panel / fixed action bar), with one landscape media query. All of its
  CSS lives in `mobile.css`, scoped under `.mShell` (in-shell) and
  `html.mk-mobile` (shared overlays: key editor, modal, toast).

`mountModkeys()` (top of `src/js/app.js`) picks exactly one at boot:

```
MOBILE_MQ = '(max-width: 768px), ((pointer: coarse) and (max-width: 1024px))'
```

If mobile: the template's content **replaces** `#dShell`. Either way the
template is removed. Because only one shell ever exists in the live DOM,
**both shells use the same element IDs**, and the entire JS core (state,
panels, exports, gallery, key editor, 3D engine) binds identically with no
per-shell logic. Crossing the breakpoint (resize/rotation across the
boundary) triggers `location.reload()` — bindings and the GL canvas are
per-shell.

## The ID contract

Every ID the JS binds must exist in **both** shells, or be declared in
`check-shell-ids.mjs` under one of:

- `DYNAMIC` — created at runtime by `renderPanel` / modal renders
- `DESKTOP_ONLY` — featured-builds strip (`builds`, `scrollL`, `scrollR`);
  their app.js bindings are `?.`/if-guarded
- `MOBILE_ONLY` — export sheet (`mExportToggle`, `mExportMenu`); guarded
- `INFRA` — the swap mechanism (`dShell`, `mShellTpl`)

**Run the checker after touching either shell or any `getElementById`:**

```
cd artifacts/modkeys && node check-shell-ids.mjs
```

It also fails on duplicate IDs within a shell.

## Adding a feature/control

1. Add the control to the desktop markup AND the mobile template (same ID),
   or add its ID to the appropriate allowlist with a guarded binding.
2. Mirror both markups in `ModkeysPage.tsx` (`MSHELL_HTML` constant for the
   mobile template; the JSX tree for desktop). Comments in both files mark
   the duplication.
3. Style desktop in `components.css`/`layout.css` (no media queries),
   mobile in `mobile.css` (scoped `.mShell` / `html.mk-mobile`).
4. `node check-shell-ids.mjs`, then root `pnpm run build`.

## Feature parity map (mobile shell)

| Desktop | Mobile |
|---|---|
| Sidebar section nav | Horizontal tab bar (`.mTabs`, same `.snav` class + `data-sec` buttons → existing wiring) |
| Sidebar Save/Export column | Fixed bottom bar: Save + Export sheet |
| Featured builds strip | Gallery modal (tnav → Gallery), which already lists FEATURED + COMMUNITY + YOUR BUILDS |
| Stage pills / toolbar | Same IDs, repositioned as floating clusters on the stage |
| tnav (Builder/Gallery/…) | Same — and as of v0.70 tnav is actually wired (it was decorative markup before) |
| Key editor popover | Same element, bottom-sheet styling via `html.mk-mobile .kePop` |
| Theme toggle, undo/redo/share | Same IDs in the mobile header/tool cluster |

## Why not responsive CSS?

Tried twice (pre-existing breakpoints + v0.66). Squeezing a desktop-first
three-panel app through media queries degraded both ends and risked the
desktop layout on every change. Two shells cost some markup duplication
(checked by tooling) and buy total independence: desktop can never be
broken by mobile work again, and vice versa.
