---
name: R3F camera centering on off-axis objects
description: How to actually center an off-axis 3D card on screen when scrolling near it
---

Shifting `camera.position.x` toward a card does NOT center it on screen. The card is still seen at the same off-axis angle from the camera's perspective. At 65° FOV with a card at x=±2-4 and camera-to-card depth of 5-10 units, the card can be near or past the screen edge regardless of position lean.

**The correct fix:** Blend `camera.lookAt()` target from the path-ahead point toward the node's world position as proximity rises.

```ts
const blend = Math.pow(maxProx, 0.55) * 0.90;
_blendedLook.lerpVectors(pathLookTarget, nodeWorldPos, blend);
camera.lookAt(_blendedLook);
```

At peak proximity (maxProx=1) the camera rotates fully toward the card, centering it on screen regardless of X position.

**Also:** Keep card x positions ≤ ±2.2 world units. At x=±3.8 with FOV 65°, cards at close Z-depth go off-screen entirely.

**Also:** Magnetic T-snap should use a low pull strength (≤0.22) so scroll-back actually works. High pull (0.42) makes scrolling backward feel stuck.
