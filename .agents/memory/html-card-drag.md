---
name: Hold-to-drag on drei Html cards
description: Pointer-capture timing and click suppression needed so drag state doesn't stick and links don't open mid-drag.
---

Implementing hold-to-drag on drei `<Html>` cards (hold ~280ms to pick up, then
drag) has two non-obvious pitfalls:

1. **Capture the pointer immediately on `pointerdown`**, not after the hold
   timer fires. If you defer `setPointerCapture` and the pointer leaves the card
   before release, the element never receives `pointerup`, the hold timer is
   never cleared, and it later flips the card into a stuck "dragging" state with
   no active pointer. Capturing up front guarantees move/up land on the element;
   the hold timer then only gates whether movement is *enabled*.

2. **Suppress the trailing `click` after a real drag** with an `onClickCapture`
   on the drag wrapper that calls `preventDefault()`/`stopPropagation()` when a
   drag actually happened. `pointerup` + `stopPropagation` alone does NOT stop
   the synthetic click, so a card containing `<a target="_blank">` will still
   open the link when the user meant to move it.

**How to apply:** Centralize this in a shared drag hook; also clear the hold
timer and release capture on unmount and whenever leaving the interactive mode.
