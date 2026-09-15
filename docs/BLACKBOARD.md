# Blackboard

The homepage is a quiet launch surface: black paper, the existing monochrome
avatar at the top left with Books and Quotes beside it, and Projects / Socials at
the bottom right. No hero copy, descriptions, background effects, audio, or
automatically moving elements.

## Design foundations

- References: Pitchboard, Curriculum, and Laboratory/spreadlab/public/index.html.
- Skills: `.nur/skills/design-taste-frontend`, `apple-design`,
  `emil-design-eng`, `glassmorphism`, and `frontend-ui-engineering`.
- Design variance 6 (opposite corners), motion intensity 3 (interaction only),
  visual density 2 (empty canvas, compact navigation).
- Page #050505; surface #141414; text #f2f2f2; secondary text #a0a0a0.
- Existing JetBrains Mono typography, 4px spacing rhythm, 12px outer / 8px
  control / 6px link corners. The original avatar and brand marks stay intact.
- CSS approximates Liquid Glass with translucent neutral surfaces, a luminous
  inner edge and 16px backdrop blur. It is not an official Apple web material.
- Only navigation receives the glass treatment. No ambient gradients or imagery
  are added to the intentionally empty canvas.

## Interaction

- Both categories remain visible. One list opens upward at a time; links go
  directly to their destinations. Local site URLs stay on the current origin.
- Projects lists StarSleep, Blackjack, and CS Skin Creations first with Soon
  labels, then reads upward from NurCLI through HoodStock, ATX Tunerz Society,
  Observatory, MODKEYS, Miyamaker, and CD Collegium. Books and Quotes are
  separate top tabs. Curriculum is not in the Blackboard list.
- Socials follows the requested order. AniList and MAL share one row.
- Existing directory entries and logo mapping are shared with the Digital Sea.
  Books and Quotes are library tabs; Curriculum is intentionally absent from the
  Blackboard launch list.
- Unreleased destinations retain a noninteractive Soon state.
- Click outside or Escape closes a list. Escape restores trigger focus.
- Tab follows the trigger into its links; collapsed lists are inert. Navigation
  is nonmodal and does not trap focus.
- Pointer transitions take 120-180ms and reverse immediately. Keyboard changes
  and reduced-motion mode are immediate. No waiting or stagger delays.
- Controls have at least 44px touch targets. Long lists scroll within the viewport.
- Reduced transparency uses solid surfaces. Increased contrast strengthens edges.

## Preservation and extension

`src/blackboard/Blackboard.tsx` owns the new homepage. Its CSS is scoped to avoid
changing NURCLI or standalone pages. `src/App.tsx`, the Digital Sea scene, original
HUD, and assets remain available in the repository; existing project/social/blog
deep links still use that experience. The original package name and build paths
stay unchanged to preserve deployment and quote synchronization.

The active presentation is controlled by one switch in
`src/config/siteMode.ts`:

- `SITE_MODE = 'blackboard'` serves the new Blackboard homepage and the new
  Blackboard Books/Quotes views.
- `SITE_MODE = 'digital-sea'` restores the original Digital Sea homepage and
  original Books/Quotes pages.

While Blackboard is active, `/sea` is an explicit doorway back to the retained
Digital Sea scene. This keeps both presentations in the repo and makes a future
mode change a one-line configuration edit.

Add future homepage content inside the Blackboard main element. Keep the two
corner anchors and shared tokens. Do not bring back page-wide animation, a large
hero, or a third dropdown without a new design decision.

## QA

- Build, typecheck, API smoke tests, Observatory and Modkeys guards.
- Check both dropdowns at 320, 768, 1024 and 1440px widths.
- Check Tab, Enter, Escape, outside dismissal, switching categories and long-list scrolling.
- Check all logos load and local links retain localhost in development.
- Check no canvas or Digital Sea scene loads on the homepage.
- Check NURCLI and standalone page source remains unchanged.
