---
name: OrbitControls touch-action freezes mobile scroll
description: Why a mounted-but-disabled OrbitControls blocks native touch scrolling; unmount + set touch-action explicitly.
---

three.js OrbitControls writes `canvas.style.touchAction = 'none'` in `connect()` and
restores it in `dispose()`. `enabled={false}` does **not** disconnect — it only gates
handlers — so a still-mounted control keeps `touch-action: none` on a full-screen canvas
and kills mobile page scroll.

## Current pattern (OrbitCam)
- Controls instance exists only when `enabled` is true (`useMemo` → null when off).
- On connect: `touchAction = 'none'`.
- On dispose / disabled: `touchAction = 'pan-y'` so the page can scroll in sea mode.

```ts
useEffect(() => {
  if (!controls) {
    gl.domElement.style.touchAction = 'pan-y';
    return;
  }
  controls.connect(gl.domElement);
  gl.domElement.style.touchAction = 'none';
  return () => {
    controls.dispose();
    gl.domElement.style.touchAction = 'pan-y';
  };
}, [controls, gl]);
```

## How to apply
Never leave OrbitControls mounted-but-disabled on a scrollable full-screen R3F scene.
Unmount (or fully disconnect) whenever the document needs vertical scroll.
