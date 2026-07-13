import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Track } from '../types';

/* ═══════════════════════════════════════════════════════════════════════════
   AUDIO — one <audio> element for the whole app.

   Intent API:
     setTrack('main' | 'blog')  which score
     arm()                      past NUROCTANE — start playing
     toggle()                   mute preference

   Start rule: when armed + enabled, call unmuted play() immediately on
   scroll. No muted pre-roll, no required gesture for normal playback.
   Gesture retry exists only as a cold-browser fallback if play() is refused.
   ═══════════════════════════════════════════════════════════════════════════ */

const PLAYLISTS: Record<Track, string[]> = {
  main: ['2814 - 終わりと始まり.mp3'],
  blog: [
    'sally shapiro - swimming through the blue lagoon.mp3',
    'willow - then (interlude).mp3',
    'Compendium - Introduction Development and Development.mp3',
  ],
};

const src = (name: string) =>
  new URL(
    `${import.meta.env.BASE_URL}assets/nodes/${encodeURIComponent(name)}`,
    window.location.href,
  ).href;

const FADE_FIRST_MS  = 1600;
const FADE_SWITCH_MS = 900;
const FADE_RESUME_MS = 450;
const FADE_OUT_MS    = 420;

/** Fallback only — if unmuted play was refused, retry on a real interaction. */
const RETRY_EVENTS = [
  'pointerdown',
  'touchstart',
  'keydown',
  'click',
] as const;

interface AudioCtxValue {
  enabled: boolean;
  /** play() was refused; next click/tap will retry. Not a required step. */
  blocked: boolean;
  armed: boolean;
  volume: number;
  track: Track | null;
  arm: () => void;
  setTrack: (t: Track | null) => void;
  setVolume: (v: number) => void;
  toggle: () => void;
}

const Ctx = createContext<AudioCtxValue>(null!);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [armed,   setArmed]   = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume,  setVolume]  = useState(0.5);
  const [track,   setTrackState] = useState<Track | null>(null);
  const [idx,     setIdx]        = useState(0);

  const enabledRef = useRef(enabled);
  const armedRef   = useRef(armed);
  const trackRef   = useRef(track);
  const idxRef     = useRef(idx);
  const volumeRef  = useRef(volume);

  const gainRef      = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef   = useRef(false);
  const pendingRef   = useRef(false);
  const selfPauseRef = useRef(false);
  const soundedRef   = useRef(false);
  const failuresRef  = useRef(0);

  const applyVolume = useCallback((a: HTMLAudioElement) => {
    a.volume = Math.max(0, Math.min(1, volumeRef.current * gainRef.current));
  }, []);

  const fadeTo = useCallback(
    (to: number, ms: number, done?: () => void) => {
      const a = audioRef.current;
      if (!a) return;
      if (fadeTimerRef.current !== null) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }

      const from = gainRef.current;
      const settle = () => {
        gainRef.current = to;
        applyVolume(a);
        done?.();
      };

      if (ms <= 0 || Math.abs(to - from) < 0.001) {
        settle();
        return;
      }

      const t0 = performance.now();
      fadeTimerRef.current = setInterval(() => {
        const p = Math.min(1, (performance.now() - t0) / ms);
        if (p >= 1) {
          if (fadeTimerRef.current !== null) clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
          settle();
          return;
        }
        const eased = p * p * (3 - 2 * p);
        gainRef.current = from + (to - from) * eased;
        applyVolume(a);
      }, 25);
    },
    [applyVolume],
  );

  /** Unmuted play, same as the old site — no muted gate. */
  const attemptPlay = useCallback(
    (a: HTMLAudioElement, fadeMs: number) => {
      if (playingRef.current) return;
      if (!a.paused) {
        a.muted = false;
        pendingRef.current = false;
        setBlocked(false);
        soundedRef.current = true;
        fadeTo(1, fadeMs);
        return;
      }

      playingRef.current = true;
      a.muted = false;

      let p: Promise<void> | undefined;
      try {
        p = a.play() as Promise<void> | undefined;
      } catch {
        playingRef.current = false;
        pendingRef.current = true;
        setBlocked(true);
        return;
      }

      const ok = () => {
        playingRef.current = false;
        pendingRef.current = false;
        soundedRef.current = true;
        setBlocked(false);
        fadeTo(1, fadeMs);
      };

      if (!p) { ok(); return; }

      p.then(ok).catch((err: DOMException) => {
        playingRef.current = false;
        if (err?.name === 'AbortError') return;
        // Cold browser only — most visits with prior engagement just play.
        pendingRef.current = true;
        setBlocked(true);
      });
    },
    [fadeTo],
  );

  const reconcile = useCallback(() => {
    const a = audioRef.current;
    const t = trackRef.current;
    if (!a || !t) return;

    const list      = PLAYLISTS[t];
    const wantSrc   = src(list[idxRef.current % list.length]);
    const wantSound = armedRef.current && enabledRef.current;
    const isLoop    = list.length === 1;

    if (a.src !== wantSrc) {
      const swap = () => {
        selfPauseRef.current = true;
        gainRef.current = 0;
        a.volume = 0;
        a.src  = wantSrc;
        a.loop = isLoop;
        if (wantSound) {
          attemptPlay(a, soundedRef.current ? FADE_SWITCH_MS : FADE_FIRST_MS);
        }
      };
      if (!a.paused && gainRef.current > 0.01) fadeTo(0, FADE_OUT_MS, swap);
      else swap();
      return;
    }

    a.loop = isLoop;

    if (wantSound) {
      if (a.paused) {
        attemptPlay(a, soundedRef.current ? FADE_RESUME_MS : FADE_FIRST_MS);
      } else {
        a.muted = false;
        fadeTo(1, soundedRef.current ? FADE_RESUME_MS : FADE_FIRST_MS);
        pendingRef.current = false;
        setBlocked(false);
      }
      return;
    }

    pendingRef.current = false;
    setBlocked(false);
    fadeTo(0, FADE_OUT_MS, () => {
      selfPauseRef.current = true;
      a.pause();
      a.muted = true;
    });
  }, [attemptPlay, fadeTo]);

  // Create the element once. Preload main track so the first arm isn't a fetch.
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.volume = 0;
    a.preload = 'auto';
    a.src = src(PLAYLISTS.main[0]);
    a.load();
    audioRef.current = a;

    const onEnded = () => {
      const t = trackRef.current;
      if (!t) return;
      const len = PLAYLISTS[t].length;
      if (len > 1) setIdx(i => (i + 1) % len);
    };

    const onPause = () => {
      if (a.ended) return;
      if (selfPauseRef.current) { selfPauseRef.current = false; return; }
      if (armedRef.current && enabledRef.current && trackRef.current) {
        pendingRef.current = true;
        setBlocked(true);
      }
    };

    const onPlaying = () => {
      selfPauseRef.current = false;
      pendingRef.current = false;
      soundedRef.current = true;
      failuresRef.current = 0;
      setBlocked(false);
    };

    const onError = () => {
      const t = trackRef.current;
      if (!t) return;
      const len = PLAYLISTS[t].length;
      failuresRef.current += 1;
      if (len > 1 && failuresRef.current < len) setIdx(i => (i + 1) % len);
    };

    a.addEventListener('ended', onEnded);
    a.addEventListener('pause', onPause);
    a.addEventListener('playing', onPlaying);
    a.addEventListener('error', onError);

    return () => {
      if (fadeTimerRef.current !== null) clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('error', onError);
      a.pause();
      audioRef.current = null;
    };
  }, []);

  // Cold-browser fallback only: if play() was refused, retry on interaction.
  useEffect(() => {
    const retry = (e: Event) => {
      if (!pendingRef.current) return;
      const el = e.target as Element | null;
      if (el?.closest?.('.audio-control')) return;
      playingRef.current = false;
      reconcile();
    };
    const onVisible = () => {
      if (!document.hidden && pendingRef.current) {
        playingRef.current = false;
        reconcile();
      }
    };

    RETRY_EVENTS.forEach(type =>
      window.addEventListener(type, retry, { passive: true, capture: true }),
    );
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      RETRY_EVENTS.forEach(type =>
        window.removeEventListener(type, retry, { capture: true }),
      );
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reconcile]);

  useEffect(() => {
    enabledRef.current = enabled;
    armedRef.current   = armed;
    trackRef.current   = track;
    idxRef.current     = idx;
    reconcile();
  }, [enabled, armed, track, idx, reconcile]);

  useEffect(() => {
    volumeRef.current = volume;
    const a = audioRef.current;
    if (a) applyVolume(a);
  }, [volume, applyVolume]);

  useEffect(() => {
    setIdx(0);
    failuresRef.current = 0;
  }, [track]);

  const arm = useCallback(() => setArmed(true), []);

  const setTrack = useCallback((t: Track | null) => setTrackState(t), []);

  const toggle = useCallback(() => {
    // If a cold browser blocked play, this click is the retry — don't mute.
    if (pendingRef.current) {
      playingRef.current = false;
      reconcile();
      return;
    }
    setEnabled(prev => !prev);
  }, [reconcile]);

  const value = useMemo(
    () => ({ enabled, blocked, armed, volume, track, arm, setTrack, setVolume, toggle }),
    [enabled, blocked, armed, volume, track, arm, setTrack, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioCtx() {
  return useContext(Ctx);
}
