# Secondary nodes (sidecards)

Orbiting media that attaches to a main swim-path card.

## Naming

```text
<cardIdOrLabel>-<slug>-sidecard.<ext>
```

- Prefix before the first `-` is matched to a main card in `nodes.ts`
  (`id` first, then substring, then `label`).
- Examples: `anilist-mal-logo-sidecard.png`, `github-photo1-sidecard.png`,
  `tunerz-gif1-sidecard.gif` (resolves to `atxtunerz`).

## Optional metadata

Image drops alone are enough for polaroids. Links, notes, and special tiles
are declared in `src/data/secondaryNodes.ts`:

| Field | Use |
|-------|-----|
| `link` | Internal path (`/books`) or absolute `https://…` URL |
| `linkLabel` | Text link tiles (`kind: 'link'`) or image `aria-label` |
| `note` | Child note card under the logo (same orbit / lean / face) |
| `kind` | `image` (default) · `link` · `github-contrib` · `note` |

## Adding a linked logo + note (AniList / MAL pattern)

1. Drop the mark here as `<card>-…-logo-sidecard.png`.
2. Add an entry under `SECONDARY_OVERRIDES` in `secondaryNodes.ts`
   with `link`, optional `linkLabel`, and `note`.
3. `SecondaryNodes.tsx` renders the clickable logo tile and parents a note
   card under it (`NOTE_BELOW` local offset) so both share orbit physics.

Current: `anilist-mal-logo-sidecard.png` → MyAnimeList list + legacy note.
