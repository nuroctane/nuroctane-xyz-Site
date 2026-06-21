---
name: R3F apps can't be e2e-validated (no WebGL in test/screenshot env)
description: The headless testing subagent and screenshot tool cannot create a WebGL context here; R3F Canvas subtrees error before mount, so effects inside never run.
---

The Playwright `runTest` subagent and the `screenshot` tool run a headless browser that
CANNOT create a WebGL context ("A WebGL context could not be created"). For an
R3F/three.js app this means the entire `<Canvas>` subtree throws before commit, so any
component or effect inside it (OrbitControls, per-mode style effects, etc.) NEVER runs.

Symptom: the leftover `<canvas>` shows the default `touch-action: auto`, which can look
like a style fix "didn't apply" when in fact the code never executed.

**How to apply:** do not rely on e2e/screenshot to validate anything inside the R3F
canvas in this environment. Validate via: typecheck, the dev-server browser console,
reading the installed three/drei source for the actual behavior, and reasoning about
React effect ordering. State this limitation to the user rather than treating a
no-WebGL test result as a failure.
