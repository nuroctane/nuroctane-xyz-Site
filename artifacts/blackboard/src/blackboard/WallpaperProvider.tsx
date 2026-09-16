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
  buildLuminanceField,
  inkForLuminance,
  sampleRect,
  type InkPolarity,
  type LuminanceField,
} from './wallpaper/luminance';
import { VARIANTS, WALLPAPER_ORDER, isWallpaperId, type WallpaperId } from './wallpaper/variants';

const SESSION_KEY = 'bb-wallpaper-shown';
const MOBILE_QUERY = '(max-width: 900px)';

function readSessionVariant(): WallpaperId | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return isWallpaperId(raw) ? raw : null;
  } catch {
    // Private mode / blocked storage: treat it as a fresh session.
    return null;
  }
}

function rememberVariant(id: WallpaperId) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* storage unavailable — the cycle simply restarts on the next load */
  }
}

let resolvedInitialVariant: WallpaperId | null = null;

/**
 * Which wallpaper this page view shows.
 *
 * A tab session's FIRST view picks pseudorandomly, so separate visits open on
 * different wallpapers. Every later load — a refresh, a URL entry — advances
 * one step, so reloading always visibly changes the background instead of
 * handing back the same one.
 *
 * sessionStorage, not localStorage: tabs stay independent of each other, and
 * the cycle resets when the tab closes, which is the granularity wanted.
 * Memoised at module scope so React re-invoking the initialiser (StrictMode)
 * cannot advance the cycle twice in one load.
 */
function resolveInitialVariant(): WallpaperId {
  if (resolvedInitialVariant) return resolvedInitialVariant;
  const shown = readSessionVariant();
  const index = shown ? WALLPAPER_ORDER.indexOf(shown) : -1;
  const chosen = index >= 0
    ? WALLPAPER_ORDER[(index + 1) % WALLPAPER_ORDER.length]
    : WALLPAPER_ORDER[Math.floor(Math.random() * WALLPAPER_ORDER.length)];
  rememberVariant(chosen);
  resolvedInitialVariant = chosen;
  return chosen;
}

interface WallpaperValue {
  variant: WallpaperId;
  /** The variant the switcher moves to next, i.e. what its glyph advertises. */
  next: WallpaperId;
  setVariant: (id: WallpaperId) => void;
  field: LuminanceField | null;
  /** The wallpaper layer calls this so the field is only built where it shows. */
  activate: () => void;
}

const WallpaperContext = createContext<WallpaperValue | null>(null);

export function useWallpaper(): WallpaperValue {
  const value = useContext(WallpaperContext);
  if (!value) throw new Error('useWallpaper must be used inside <WallpaperProvider>');
  return value;
}

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<WallpaperId>(resolveInitialVariant);
  const [active, setActive] = useState(false);
  const [field, setField] = useState<LuminanceField | null>(null);

  const setVariant = useCallback((id: WallpaperId) => {
    setVariantState(id);
    rememberVariant(id);
  }, []);

  const next = useMemo(() => {
    const index = WALLPAPER_ORDER.indexOf(variant);
    return WALLPAPER_ORDER[(index + 1) % WALLPAPER_ORDER.length];
  }, [variant]);

  const toggle = useCallback(() => setVariant(next), [next, setVariant]);
  const activate = useCallback(() => setActive(true), []);

  // Build the luminance grid for the active plate. The URL is identical to the
  // CSS plate layer, so this is served from the HTTP cache in practice.
  useEffect(() => {
    if (!active) return undefined;
    const scene = VARIANTS[variant];
    const plate = scene.plate;
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    let cancelled = false;

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled) return;
      setField(buildLuminanceField(image, image.naturalWidth, image.naturalHeight, scene.toneMap));
    };
    image.onerror = () => {
      if (!cancelled) setField(null);
    };
    image.src = mobile ? plate.mobile : plate.desktop;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [active, variant]);

  const value = useMemo<WallpaperValue>(
    () => ({ variant, next, setVariant, field, activate }),
    [variant, next, setVariant, field, activate],
  );

  return <WallpaperContext.Provider value={value}>{children}</WallpaperContext.Provider>;
}

/**
 * Resolve the ink polarity that stays legible over the wallpaper actually
 * behind `ref`. Re-measures on resize and scroll, and only commits when the
 * polarity genuinely changes, so a boundary hover cannot thrash the DOM.
 *
 * Returns `'light'` until the field is ready — the site's own default — so
 * first paint never flashes a wrong colour.
 */
export function useAdaptiveInk<T extends HTMLElement>(): readonly [RefObject<T | null>, InkPolarity] {
  const { field, variant } = useWallpaper();
  const ref = useRef<T>(null);
  const [ink, setInkState] = useState<InkPolarity>('light');
  const inkRef = useRef<InkPolarity>('light');

  useEffect(() => {
    if (!field) return undefined;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const value = sampleRect(
        field,
        element.getBoundingClientRect(),
        window.innerWidth,
        window.innerHeight,
      );
      if (value === null) return;
      const resolved = inkForLuminance(value, inkRef.current);
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
    // Capture-phase: `scroll` does not bubble, so a document-level capture
    // listener also fires for inner scroll containers (the Blackboard scrolls
    // its own box, not the window).
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    // Catches reflows that move no scroll position: font swap, wrapping, a
    // container resizing without the viewport changing.
    const observer = new ResizeObserver(schedule);
    const element = ref.current;
    if (element) observer.observe(element);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, { capture: true });
    };
  }, [field, variant]);

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
