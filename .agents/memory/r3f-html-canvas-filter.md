---
name: R3F Html overlays vs canvas CSS filter
description: Why a CSS filter on the R3F canvas color-grades the 3D scene but leaves drei <Html> cards untouched.
---

A CSS `filter` (hue-rotate / saturate / contrast / brightness) applied to the
R3F WebGL canvas element (`gl.domElement`) affects ONLY the rendered 3D scene.

**Why:** drei `<Html>` content is rendered into a *separate* absolutely-positioned
DOM container that is a sibling of (not a child of) the canvas. A filter on the
canvas node does not cascade to siblings, so HTML cards keep their true colors.

**How to apply:** To color-grade / animate the look of the 3D world without
tinting UI cards, animate `gl.domElement.style.filter`. No need to manually
exclude the cards — they are excluded by DOM structure. (Used by SeaColorShift
in digital-sea to shift the sea's look in scroll mode only.)
