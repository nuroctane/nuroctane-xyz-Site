# Foglamp Codebase Map Embed — Design

**Date:** 2026-07-18  
**Route:** `/cli`  
**Scan:** `https://www.foglamp.dev/scan/nurcli-oxpatc`

## Goal

Place a clean, interactive view of NurCLI's Foglamp codebase map directly below the existing TUI demo. The embed should feel native to the page's gold terminal design, preserve Foglamp's dark graph canvas, remain usable on narrow screens, and avoid making mobile visitors download the full graph application before they ask for it.

## Evidence

- `/cli` is implemented in `artifacts/digital-sea/src/pages/CliPage.tsx` with route-specific styles in `artifacts/digital-sea/src/cli-page.css`.
- The existing Demo section ends with the `nur-demo.gif` terminal frame and is immediately followed by Features.
- Foglamp's scan response currently has no `X-Frame-Options` or CSP `frame-ancestors` header blocking an iframe.
- The scan's visual language is a near-black grid with thin gray graph connections, compact rounded node cards, and restrained colored status dots. It can sit inside the NurCLI shell without recoloring the third-party content.

## Approaches considered

### 1. Load the iframe immediately everywhere

Lowest implementation complexity and the graph is instantly interactive. The cost is unnecessary JavaScript/network work on mobile, where the wide graph also benefits from an explicit user decision before taking over touch gestures.

### 2. Responsive progressive embed — selected

Load the live iframe automatically on desktop. On mobile, show a lightweight Foglamp preview with a clear `Explore map` action; replace it with the iframe after activation. This preserves immediate discovery on large screens while protecting mobile performance and scroll behavior.

### 3. Click-to-load everywhere

Best initial performance and privacy posture, but hides the most interesting part of the section behind an extra interaction even on capable desktop layouts. This weakens the purpose of placing the map prominently below the demo.

## Selected experience

The Foglamp map remains inside the existing `02 Demo` section so the page's numbering and jump navigation do not change. A small transition row after the GIF introduces the second artifact as `CODEBASE MAP`, with one sentence explaining that it is a living architecture view.

The map sits in its own terminal-style frame:

- NurCLI gold/gray one-pixel border and near-black surface.
- Compact header bar with terminal dots, `foglamp · NurCLI architecture`, a live-status indicator, and an external-link action.
- No decorative motion competing with the embedded graph.
- Iframe height follows `clamp(440px, 64vw, 560px)`, giving the graph 560px on desktop and no less than 440px on narrow screens.
- A subtle bottom note explains that the graph supports pan/zoom and provides a second direct link to open the full scan.

The external-link action is always available, so iframe failures or cramped viewports never trap the user.

## Component behavior

A small `FoglampMap` component will own only the progressive-loading behavior:

1. Initialize as unloaded.
2. On mount, check `matchMedia('(min-width: 721px)')`.
3. Load automatically when the desktop breakpoint matches.
4. On mobile, render the scan's lightweight Open Graph preview and an `Explore interactive map` button.
5. When activated, replace the preview with the lazy iframe and move focus to the framed embed region.
6. Track map activation and external-link clicks through the existing `trackEvent` helper.

The component will clean up its media-query listener. Crossing from mobile to desktop loads the graph; crossing back does not discard an already-loaded iframe.

## Accessibility

- Give the iframe a descriptive `title`.
- Use a real button for mobile activation and a real anchor for opening Foglamp.
- Keep visible keyboard focus treatment consistent with existing CLI controls.
- Provide text outside the iframe describing what it contains and how to open it directly.
- Do not autoplay animation beyond Foglamp's own user-controlled canvas.
- Preserve the page's reduced-motion rules; new transitions use opacity/transform only and are disabled under `prefers-reduced-motion`.

## Failure handling

Browsers do not expose reliable iframe load failures for every cross-origin failure. The design therefore avoids claiming a loaded state based on the iframe event. A persistent `Open in Foglamp` link remains visible in the header and footer as the guaranteed fallback. The preview remains available until the user activates the mobile embed.

## Responsive details

- At widths above 720px, render the live map immediately.
- At 720px and below, defer the iframe behind the preview action.
- Keep controls above the iframe so touch users do not need to interact with the canvas to escape it.
- Use `overflow: hidden` only on the visual frame; do not disable document scrolling or add custom gesture handlers.

## Verification

- Run the digital-sea TypeScript check and production build.
- Inspect `/cli` at desktop and mobile viewport sizes.
- Confirm the map appears directly below the GIF.
- Confirm desktop loads the interactive scan without a click.
- Confirm mobile initially shows the preview and loads the iframe after activation.
- Confirm keyboard focus reaches the activation button, external link, and iframe.
- Confirm the direct Foglamp link opens in a new tab.
- Confirm the existing Demo jump target, Features section, and reduced-motion behavior still work.

## Scope

Only `CliPage.tsx` and `cli-page.css` should need implementation changes. No new dependency, route, proxy, analytics system, or page-numbering change is required.
