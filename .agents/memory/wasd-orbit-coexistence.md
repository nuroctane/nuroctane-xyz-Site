---
name: WASD flight with OrbitControls
description: When moving the camera with keys while OrbitControls is active, always move controls.target by the same delta.
---

See `OrbitCam.tsx` (`useFrame` WASD / arrows / Space / Ctrl).

OrbitControls keeps the camera looking at `controls.target`. If you only translate
`camera.position`, the next `controls.update()` pulls the camera back toward the old
target (or rotates it unexpectedly).

**Fix:** after clamping the new camera position, apply the same `(cx,cy,cz)` delta to
`controls.target`:

```ts
cam.position.set(nx, ny, nz);
controls.target.x += cx;
controls.target.y += cy;
controls.target.z += cz;
```

While keys are held, raise `dampingFactor` so look stays snappy during flight.

**How to apply:** any free-fly + orbit hybrid must treat camera + target as a rigid pair in translation.
