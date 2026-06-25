---
name: InstancedMesh frustum culling
description: Why world-scattered instancedMesh batches disappear when camera moves
---

Three.js frustum culling for instancedMesh uses the base geometry's bounding sphere (e.g. a unit cube at origin), not the actual positions of all instances. When instances are scattered across a large world volume and the camera moves away from origin, Three.js decides the whole batch is outside the frustum and culls all instances simultaneously — they just disappear.

**Why:** The bounding sphere is never recomputed from instance matrices by default. This is a known Three.js limitation.

**How to apply:** Always set `frustumCulled={false}` (R3F JSX) or `mesh.frustumCulled = false` on any instancedMesh whose instances span more than ~10 world units from origin. The performance cost is negligible compared to the visual correctness gain.
