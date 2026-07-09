---
name: Hold-to-drag on drei Html cards
description: Correct pointer-capture timing, native drag suppression, and click suppression for hold-to-drag cards with clickable links in R3F/drei <Html>.
---

## ⚠️ Critical: Do NOT capture the pointer on pointerdown

An earlier version of this note said "capture immediately on pointerdown." That is WRONG when the card also contains clickable links (`<a href>`). Here is the correct pattern:

**Delay `setPointerCapture` until the hold timer fires.** Only set `didDrag = true`
inside `onPointerMove` (when pixels actually moved), never inside the hold timer.

```
onPointerDown  → e.stopPropagation(), start hold timer, record startPos. NO capture.
hold timer (280ms) fires → measure drift (last vs startPos).
                           If moved > PRE_HOLD_CANCEL_PX (e.g. 10px): abort (user was panning).
                           Else: isDragging=true, setPointerCapture.
onPointerMove (isDragging=false) → update last.current only (for drift check). Return early.
onPointerMove (isDragging=true)  → apply world-space delta, set didDrag=true if actual pixels moved.
onPointerUp  → clearHold, releaseCapture, isDragging=false.
               if didDrag → stopPropagation.
onClickCapture → if didDrag → preventDefault + stopPropagation + reset didDrag=false.
```

## Why deferred capture

- Immediate `setPointerCapture` on `pointerdown` redirects the post-`pointerup`
  synthetic `click` to the capturing element on mobile, breaking native anchor nav.
- Setting `didDrag=true` in the hold timer (vs. in movement) suppresses link clicks
  even on slow presses where the card never moved — wrong UX.

## The three pitfalls (all still apply)

1. **Deferred capture** (see above). The hold timer snapshots `el` and `pointerId`
   in its closure and calls `el.setPointerCapture(pointerId)` when it fires.
   If the user releases before 280ms, `clearHold()` in `onPointerUp` cancels the
   timer — the capture never happens, click fires cleanly.

2. **Suppress native browser drag-and-drop.** Cards contain `<a>` / `<img>`.
   mousedown+move starts a native ghost drag. Fix with all three:
   `draggable={false}` on anchors/images, `onDragStart={e=>e.preventDefault()}`
   on the drag wrapper, and CSS `user-select:none; -webkit-user-drag:none`.

3. **Suppress the trailing `click` after a real drag.** `onClickCapture` on the
   drag wrapper calls `preventDefault()`/`stopPropagation()` when `didDrag=true`.
   A quick tap or a hold-without-move leaves `didDrag=false`, so links still open.

## How to apply

Centralize the logic in `artifacts/digital-sea/src/hooks/useCardDrag.ts`.
Clear the hold timer and release capture on unmount and when leaving camera mode.
Always update `last.current` in `onPointerMove` before the `isDragging` guard,
so the drift threshold in the hold timer stays accurate.

**MEMORY.md mistake to avoid:** do **not** summarize this as “capture on pointerdown” —
capture is deferred until hold ≥ 280ms without pre-hold cancel.
