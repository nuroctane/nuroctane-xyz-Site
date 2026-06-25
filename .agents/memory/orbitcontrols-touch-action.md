---
name: OrbitControls touch-action freezes mobile scroll
description: Why a mounted-but-disabled drei/three OrbitControls blocks native touch scrolling on a full-screen R3F canvas, and the deterministic fix.
---

three.js OrbitControls writes `canvas.style.touchAction = 'none'` in `connect()` and
restores it to `''` (computed `auto`) in `disconnect()`/`dispose()`. `enabled={false}`
does NOT disconnect — it only gates the handlers — so a still-mounted OrbitControls
keeps `touch-action: none` on the canvas.

On a full-screen `position:fixed; inset:0` R3F canvas this kills native vertical touch
scrolling on mobile entirely. Desktop mouse-wheel scroll ignores `touch-action`, so the
page still scrolls on PC — making it look device-specific.

**Fix:** mount OrbitControls ONLY in the mode that needs it (e.g. explore/camera). In
the scroll mode it unmounts → `dispose()` restores touch-action so the browser scrolls.
Optionally also set `gl.domElement.style.touchAction` per mode (`pan-y` scroll / `none`
camera) in a useEffect for precision.

**Why:** a passive useEffect that fights a still-mounted OrbitControls is
non-deterministic — drei re-runs connect/disconnect on later renders, so the last write
to touchAction is unpredictable (an e2e probe showed it landing on `auto` in both modes).
Tying the control's lifecycle to the mode removes the race.

**How to apply:** any R3F scene with a full-screen canvas + camera controls that must
coexist with page scroll — never keep the controls mounted-but-disabled; unmount them
whenever the page needs to scroll.
