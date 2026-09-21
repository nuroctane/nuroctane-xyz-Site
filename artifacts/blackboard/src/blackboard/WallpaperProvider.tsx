import { refreshChoice, rememberChoice } from '../lib/refreshChoice';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  applyScrim,
  buildLuminanceField,
  inkForLuminance,
  inkSampleRect,
  luminanceGrid,
  parseAlpha,
  sampleRect,
  scrimAlphaAt,
  type InkPolarity,
  type LuminanceField,
  type ScrimRamp,
} from './wallpaper/luminance';
import { VARIANTS, WALLPAPER_ORDER, type WallpaperId } from './wallpaper/variants';

const MOBILE_QUERY = '(max-width: 900px)';

/** True while the viewport is at or below the plate breakpoint. */
function matchesNarrow(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

let resolvedInitialVariant: WallpaperId | null = null;

/**
 * Which wallpaper this page view opens on.
 *
 * An independent draw excluding the last wallpaper shown in this tab.
 * Manual switches update that history too; older choices remain eligible.
 *
 * Memoised at module scope so React re-invoking the initialiser (StrictMode)
 * cannot burn two draws in one load.
 */
function resolveInitialVariant(): WallpaperId {
  if (resolvedInitialVariant) return resolvedInitialVariant;
  resolvedInitialVariant = refreshChoice('bb:last-wallpaper', WALLPAPER_ORDER, id => id);
  return resolvedInitialVariant;
}

interface WallpaperValue {
  variant: WallpaperId;
  /** The variant the switcher moves to next, i.e. what its glyph advertises. */
  next: WallpaperId;
  setVariant: (id: WallpaperId) => void;
  /**
   * The plate URL for a variant at the CURRENT breakpoint.
   *
   * One source of truth, deliberately. The plate is chosen in three places —
   * the CSS layer that shows it, the luminance grid that measures it, and the
   * scene that samples it as a texture — and when those disagreed (a CSS media
   * query against a one-shot matchMedia read) the ink was resolved from a
   * different image than the one on screen.
   */
  plate: (id: WallpaperId) => string;
  /** True at or below the plate breakpoint. */
  narrow: boolean;
  field: LuminanceField | null;
  /** The wallpaper layer calls this so the field is only built where it shows. */
  activate: () => void;
  /**
   * The rendered frame (canvas or video), already in viewport space. This is
   * what the ink follows for every wallpaper: the plate grid is only the
   * stand-in until the first frame is up.
   */
  reportFrame: (
    rgba: ArrayLike<number>,
    cols: number,
    rows: number,
    viewWidth: number,
    viewHeight: number,
    flipY: boolean,
  ) => void;
  renderedField: () => (LuminanceField & { at: number }) | null;
  subscribeRendered: (listener: () => void) => () => void;
}

const WallpaperContext = createContext<WallpaperValue | null>(null);

export function useWallpaper(): WallpaperValue {
  const value = useContext(WallpaperContext);
  if (!value) throw new Error('useWallpaper must be used inside <WallpaperProvider>');
  return value;
}

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<WallpaperId>(resolveInitialVariant);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [field, setField] = useState<LuminanceField | null>(null);
  // The breakpoint has to be state, not a one-shot read: the field is built from
  // a DIFFERENT file on each side of it, so crossing 900px in either direction
  // has to rebuild the grid or the ink keeps sampling the plate that is no longer
  // on screen. Rotating a phone and resizing a desktop window both land here.
  const [narrow, setNarrow] = useState(matchesNarrow);
  const renderedRef = useRef<(LuminanceField & { at: number }) | null>(null);
  const renderedSubs = useRef(new Set<() => void>());

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setNarrow(query.matches);
    // Safari < 14 only has the deprecated listener.
    if (query.addEventListener) query.addEventListener('change', onChange);
    else query.addListener(onChange);
    return () => {
      if (query.removeEventListener) query.removeEventListener('change', onChange);
      else query.removeListener(onChange);
    };
  }, []);

  const setVariant = useCallback((id: WallpaperId) => {
    rememberChoice('bb:last-wallpaper', id);
    setVariantState(id);
  }, []);

  const next = useMemo(() => {
    const index = WALLPAPER_ORDER.indexOf(variant);
    return WALLPAPER_ORDER[(index + 1) % WALLPAPER_ORDER.length];
  }, [variant]);

  const activate = useCallback(() => setActive(true), []);

  const plate = useCallback(
    (id: WallpaperId) => (narrow ? VARIANTS[id].plate.mobile : VARIANTS[id].plate.desktop),
    [narrow],
  );

  // Build the luminance grid for the active plate. The URL is identical to the
  // CSS plate layer, so this is served from the HTTP cache in practice.
  const reportFrame = useCallback((
    rgba: ArrayLike<number>,
    cols: number,
    rows: number,
    viewWidth: number,
    viewHeight: number,
    flipY: boolean,
  ) => {
    if (cols < 1 || rows < 1 || viewWidth < 1 || viewHeight < 1) return;
    const data = luminanceGrid(rgba, cols, rows, flipY);
    const previous = renderedRef.current;
    const same = previous && previous.cols === cols && previous.rows === rows;
    const next: LuminanceField & { at: number } = same
      ? previous
      : { cols, rows, data, imageWidth: viewWidth, imageHeight: viewHeight, at: 0 };
    if (same) next.data.set(data);
    next.imageWidth = viewWidth;
    next.imageHeight = viewHeight;
    next.at = performance.now();
    renderedRef.current = next;
    renderedSubs.current.forEach(listener => listener());
  }, []);

  const renderedField = useCallback(() => renderedRef.current, []);

  const subscribeRendered = useCallback((listener: () => void) => {
    renderedSubs.current.add(listener);
    return () => renderedSubs.current.delete(listener);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    // Drop the previous wallpaper's frame so ink doesn't track it through the fade.
    renderedRef.current = null;
    setField(null);
    const scene = VARIANTS[variant];
    let cancelled = false;

    // A live variant paints the viewport directly, so there is no plate that
    // could predict it. Size the grid to the viewport instead — which makes
    // sampleRect's cover mapping the identity, so a cell is exactly the same
    // fraction of the screen — and let the variant's own `liveField` fill it.
    if (scene.liveField) {
      const cols = 48;
      const rows = 27;
      const build = () => {
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        const live: LuminanceField = {
          cols,
          rows,
          data: new Float32Array(cols * rows),
          imageWidth: width,
          imageHeight: height,
        };
        scene.liveField?.(live.data, cols, rows, (reduced ? 37 : performance.now() / 1000), width / height);
        if (!cancelled) setField(live);
      };
      build();
      // No decode to redo on a resize, so rebuilding is cheap and the mapping
      // stays true to the viewport after a rotation or a chrome collapse.
      window.addEventListener('resize', build);
      window.addEventListener('orientationchange', build);
      return () => {
        cancelled = true;
        window.removeEventListener('resize', build);
        window.removeEventListener('orientationchange', build);
      };
    }

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled) return;
      setField(buildLuminanceField(image, image.naturalWidth, image.naturalHeight, scene.toneMap));
    };
    image.onerror = () => {
      if (!cancelled) setField(null);
    };
    image.src = plate(variant);

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [active, variant, narrow, plate, reduced]);

  const value = useMemo<WallpaperValue>(
    () => ({
      variant, next, setVariant, plate, narrow, field, activate,
      reportFrame, renderedField, subscribeRendered,
    }),
    [variant, next, setVariant, plate, narrow, field, activate, reportFrame, renderedField, subscribeRendered],
  );

  return <WallpaperContext.Provider value={value}>{children}</WallpaperContext.Provider>;
}

/**
 * Resolve the ink polarity that stays legible over the wallpaper actually
 * behind `ref`.
 *
 * Measures the plate through its own tone curve, then composites the page scrim
 * that is painted over it, so the decision is made against what reaches the eye
 * rather than against the raw file. Re-measures on every change that can move
 * either the element or the plate — resize, rotation, the mobile browser chrome
 * collapsing, the 900px breakpoint, and reflows that move nothing.
 *
 * Returns `'light'` until the field is ready — the site's own default — so
 * first paint never flashes a wrong colour.
 *
 * For a LIVE variant the grid is refilled in place on a timer and re-measured,
 * because the pixels behind the element keep moving. In-place mutation is
 * deliberate: `field` keeps its identity, so this effect does not tear down and
 * re-register its listeners several times a second.
 */
export function useAdaptiveInk<T extends HTMLElement>(): readonly [RefObject<T | null>, InkPolarity] {
  const { field, variant, renderedField, subscribeRendered } = useWallpaper();
  const reduced = useReducedMotion();
  const ref = useRef<T>(null);
  const [ink, setInkState] = useState<InkPolarity>('light');
  const inkRef = useRef<InkPolarity>('light');

  // Until the wallpaper has published a real frame, a live variant (the sweep)
  // still has to move. Once frames are arriving, those pixels win — they are
  // the render at this exact viewport size, for every wallpaper.
  const liveTick = useCallback((schedule: () => void) => {
    const live = VARIANTS[variant].liveField;
    if (!live || !field || reduced) return undefined;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const rendered = renderedField();
      if (rendered && performance.now() - rendered.at < 800) return;
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      live(field.data, field.cols, field.rows, performance.now() / 1000, width / height);
      schedule();
    }, 180);
    return () => window.clearInterval(id);
  }, [field, variant, reduced, renderedField]);

  useEffect(() => {
    if (!field) return undefined;
    let frame = 0;
    // The first measurement for a given wallpaper decides fresh; hysteresis is
    // only for the repeats that follow it.
    let settled = false;

    const measure = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const rendered = renderedField();
      const source = rendered && performance.now() - rendered.at < 800 ? rendered : field;
      // Every wallpaper, every viewport. A full-box mean stays grey wherever
      // the art crosses a pole inside the element.
      const value = sampleRect(source, inkSampleRect(rect, width, height), width, height);
      if (value === null) return;

      // The scrim is read from the element's own computed style, so it follows
      // the active variant's override and any future media-query change rather
      // than being duplicated as a constant here.
      const style = window.getComputedStyle(element);
      const scrim: ScrimRamp = {
        inner: parseAlpha(style.getPropertyValue('--bb-scrim-inner')),
        outer: parseAlpha(style.getPropertyValue('--bb-scrim-outer')),
        top: parseAlpha(style.getPropertyValue('--bb-scrim-top')),
        bottom: parseAlpha(style.getPropertyValue('--bb-scrim-bottom')),
      };
      const seen = applyScrim(value, scrimAlphaAt(rect, width, height, scrim));

      const resolved = inkForLuminance(seen, settled ? inkRef.current : undefined);
      settled = true;
      if (resolved !== inkRef.current) {
        inkRef.current = resolved;
        setInkState(resolved);
      }
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    // The URL bar collapsing on mobile changes the visual viewport without
    // necessarily firing a window resize on every engine.
    window.visualViewport?.addEventListener('resize', schedule);
    // Capture-phase: `scroll` does not bubble, so a document-level capture
    // listener also fires for inner scroll containers (the Blackboard scrolls
    // its own box, not the window).
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    // Catches reflows that move no scroll position: font swap, wrapping, a
    // container resizing without the viewport changing.
    const observer = new ResizeObserver(schedule);
    const element = ref.current;
    if (element) observer.observe(element);
    const stopLive = liveTick(schedule);
    const unsubscribe = subscribeRendered(schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      stopLive?.();
      unsubscribe();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, { capture: true });
    };
  }, [field, variant, liveTick, renderedField, subscribeRendered]);

  return [ref, ink] as const;
}

/** True when the visitor has asked for reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
