import { VARIANTS, WALLPAPER_ORDER, type WallpaperId } from './wallpaper/variants';
import { useWallpaper } from './WallpaperProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND SWITCHER

   Sits directly below the GitHub icon in the identity column and follows the
   same box/hover schema as its neighbours. The glyph advertises the wallpaper
   the press moves you TO — a cloud for the cumulus scene, waves for the
   abstract one — so the button states its own action.

   The two glyphs share one grid cell and cross-fade in place: the outgoing
   glyph fades while the incoming one arrives from scale(.3) with a clearing
   2px blur, on a single 120ms `--bb-ease`. No overshoot, no layout shift.
   ═══════════════════════════════════════════════════════════════════════════ */

/** 24x24 icon geometry, matching the Lucide family used across the nav. */
const GLYPHS: Record<WallpaperId, string[]> = {
  // Waves — the abstract scene's shimmering streaks and godrays.
  abstract: [
    'M2 7.5Q4.5 4 7 7.5T12 7.5T17 7.5T22 7.5',
    'M2 13.5Q4.5 10 7 13.5T12 13.5T17 13.5T22 13.5',
    'M2 19.5Q4.5 16 7 19.5T12 19.5T17 19.5T22 19.5',
  ],
  // Cloud — the cumulus scene. Lucide `cloud`.
  clouds: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
};

export function BlackboardWallpaperToggle() {
  const { variant, next, setVariant } = useWallpaper();
  const label = `Switch background to ${VARIANTS[next].label}`;

  return (
    <button
      type="button"
      className="bb-wallpaper-toggle"
      onClick={() => setVariant(next)}
      aria-label={`Background: ${VARIANTS[variant].label}. ${label}.`}
      title={label}
    >
      <span className="bb-icon-swap">
        {WALLPAPER_ORDER.map(id => (
          <svg
            key={id}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-visible={id === next}
          >
            {GLYPHS[id].map(d => (
              <path key={d} d={d} />
            ))}
          </svg>
        ))}
      </span>
    </button>
  );
}
