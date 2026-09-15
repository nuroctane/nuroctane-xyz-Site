# Site designs

**Blackboard remains the active production design.** The complete frontends are siblings.

| Folder | Owns |
| --- | --- |
| `artifacts/blackboard` | Today's complete Blackboard, including libraries, audio, wallpaper, themed navigation/admin UI and compatibility deep links |
| `artifacts/digital-sea` | Pre-Blackboard frontend from `b48b16d1d606dcbec50e19223fea319a576773c0`, with original pages, assets, soundtrack and a local copy of original Modkeys |
| `artifacts/modkeys` | Current Modkeys used by Blackboard |

## One-command selection

From the repository root:

```sh
pnpm site blackboard
pnpm site digital-sea
```

These update `site.config.json`; selection alone never publishes. `pnpm dev` starts
the selected app (restart after switching). `pnpm build` checks both apps and stages
only the selected frontend into `dist/public`, the Worker asset directory. Worker
homepage metadata follows the same config. Ship the config through the normal
commit/push/live-check/backup pipeline to change production. `pnpm deploy` remains
the manual deployment fallback.

Do not edit Blackboard's internal `src/config/siteMode.ts` to switch designs: it
identifies that app. The root config selects the complete app, CSS and soundtrack.

## Preservation

Digital Sea source and public assets are frozen at the recorded baseline. Its only
adaptations are build dependency declarations and the Modkeys import path to its
preserved local copy. Local agent logs are excluded. API infrastructure, community
data and runtime secrets remain shared and current; switching never restores old
database contents or credentials.

Blackboard keeps today's source and assets. Its scene code supports existing deep
links and does not import the Digital Sea app. Quotes ingestion, books synchronization
and metadata enrichment target Blackboard so archived content does not drift.

## Changes in this refactor

Avatar, library tabs, player and responsive layout retain their existing design.
Wallpaper ripple and cloud motion are stronger below 900px; desktop settings and
the 30fps limit are retained. Reduced motion receives a still frame. ATX Tunerz
Society is directly below Instagram in Socials.

Books uses the same API/admin flow, but now updates the view only after successful
saves. Failures show an error rather than pretending to persist. Modkeys keyboard
shortcuts act only while its page is mounted.

## Verification

`pnpm build` runs typechecks, both frontend builds, API smoke tests and the existing
Observatory/Modkeys guards. Check both design outputs before switching. Verify mobile
and desktop layout, audio continuity, book metadata and recommendation search.
Do not delete real community data during visual checks.
