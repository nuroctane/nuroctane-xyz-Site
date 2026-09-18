import { VARIANTS, WALLPAPER_ORDER, type WallpaperId } from './wallpaper/variants';
import { useAdaptiveInk, useWallpaper } from './WallpaperProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND SWITCHER

   Its own control, centred beneath the player panel rather than inside it, so
   the panel stays a pure player. The glyph advertises the wallpaper the press
   moves you TO — a cloud for the cumulus scene, a crest for the abstract one —
   so the button states its own action.

   The glyphs share one grid cell and cross-fade in place: the outgoing glyph
   fades while the incoming one arrives from scale(.3) with a clearing 2px blur,
   on a single 120ms `--bb-ease`. No overshoot, no layout shift.
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
  // Ridge — the Japanese line-art scene, one mountain line like its Fuji.
  japanese: ['M2.5 18.5 9 6.5 13.5 13 16 9.5 21.5 18.5'],
  // Conifer — two stacked triangles and a trunk, for the misty forest.
  forest: ['M12 3 8.5 9.5h7Z', 'M12 8 6.5 16h11Z', 'M12 16v4.5'],
  // Blossom — five petals around a centre, for the sakura scene.
  sakura: [
    'M9.5 7.8a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M13.5 10.7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M11.97 15.4a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M7.03 15.4a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M5.5 10.7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
    'M11.1 12a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0-1.8 0',
  ],
  // Falling petals — the second White sakura, drawn apart from the first.
  blossom: [
    'M8.5 5a2.3 3.2 0 0 1 0 6.4a2.3 3.2 0 0 1 0-6.4Z',
    'M15.5 8.4a1.9 2.6 0 0 1 0 5.2a1.9 2.6 0 0 1 0-5.2Z',
    'M10 14.3a1.6 2.2 0 0 1 0 4.4a1.6 2.2 0 0 1 0-4.4Z',
  ],
  // Crest — one breaking curl, for the black waves scene.
  waves: [
    'M2.5 20.5c2.5 0 4.5-2 4.5-4.5 0-3.5 3-6.5 6.5-6.5 2 0 3.5 1.5 3.5 3.5 0 1.6-1.3 2.9-2.9 2.9-1.2 0-2.1-0.9-2.1-2.1',
  ],
};

export function BlackboardWallpaperToggle() {
  const { variant, next, setVariant } = useWallpaper();
  // Self-contained ink: this control sits on the wallpaper, not on a dark
  // panel, so it resolves its own pole from the pixels behind it. Pinning it
  // to a pole would break it over the other wallpaper, and keeping the
  // measurement here means the button stays correct if it is ever moved again.
  const [ref, ink] = useAdaptiveInk<HTMLButtonElement>();
  const label = `Switch background to ${VARIANTS[next].label}`;

  return (
    <button
      ref={ref}
      data-ink={ink}
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
