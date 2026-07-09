---
name: OrbitControls instance lifecycle and target seeding
description: Own three.js OrbitControls in useMemo; seed target from camera look direction before first update.
---

Implementation lives in `artifacts/digital-sea/src/components/scene/OrbitCam.tsx`.

## Pattern
1. **Create only when enabled** (`useMemo` depends on `enabled`). Returning `null` when disabled unmounts controls so they `dispose()` and free `touch-action`.
2. **Seed target immediately** after construction:
   ```ts
   camera.getWorldDirection(_dir);
   oc.target.copy(camera.position).addScaledVector(_dir, 10);
   oc.update();
   ```
   Default three.js target is `(0,0,0)`. Updating without a seeded target snaps the camera on first frame (mode-switch “jump”).
3. **connect** in `useEffect` to `gl.domElement`; **dispose** on cleanup.

## How to apply
Any mode that toggles free-look on/off should create/destroy the controls instance (or fully connect/disconnect), never leave a half-initialized default target.
