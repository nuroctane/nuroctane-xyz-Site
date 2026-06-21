---
name: Hold-to-drag on drei Html cards
description: Pointer-capture timing, native drag-and-drop suppression, and click suppression needed so card drag works and links don't open mid-drag.
---

Implementing hold-to-drag on drei `<Html>` cards (hold ~280ms to pick up, then
drag) has three non-obvious pitfalls:

1. **Capture the pointer immediately on `pointerdown`**, not after the hold
   timer fires. If you defer `setPointerCapture` and the pointer leaves the card
   before release, the element never receives `pointerup`, the hold timer is
   never cleared, and it later flips the card into a stuck "dragging" state with
   no active pointer. Capturing up front guarantees move/up land on the element;
   the hold timer then only gates whether movement is *enabled*.

2. **Suppress the browser's native drag-and-drop.** If a card contains an `<a>`
   or `<img>`, mousedown+move starts a NATIVE drag that "tears off" a ghost of
   the link/image instead of running your pointer logic — this looks like "the
   card won't move, it just drags the link out." Pointer capture does NOT stop
   this. Fix with all three: `draggable={false}` on the anchor/images/wrapper,
   `onDragStart={e => e.preventDefault()}` on the drag wrapper, and CSS
   `-webkit-user-drag: none; user-select: none;`.

3. **Suppress the trailing `click` after a real drag** with an `onClickCapture`
   on the drag wrapper that calls `preventDefault()`/`stopPropagation()` when a
   drag actually happened. `pointerup` + `stopPropagation` alone does NOT stop
   the synthetic click, so a card containing `<a target="_blank">` will still
   open the link when the user meant to move it. A quick click (no drag) must
   still fall through so the link opens.

**How to apply:** Centralize 1 and 3 in a shared drag hook; also clear the hold
timer and release capture on unmount and whenever leaving the interactive mode.
