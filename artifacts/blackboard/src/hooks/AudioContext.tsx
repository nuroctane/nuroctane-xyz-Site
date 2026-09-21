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
import { SITE_MODE } from '../config/siteMode';
import { blackboardAudioPath, blackboardMusicPick } from '../data/blackboardMusic';

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

// Blackboard has no fixed resident track. One is drawn per page view from the
// blackboard-exclusive library — including the original `difference (interlude)`
// — and it is the whole score for that visit: no skip, no next. Both cues
// resolve to the same file, so whichever one the page asks for, the visitor
// hears the track they were dealt. Switching SITE_MODE back to digital-sea
// restores the original soundtrack without touching the player.
const BLACKBOARD_FILE = blackboardAudioPath(blackboardMusicPick());

const BLACKBOARD_PLAYLISTS: Record<Track, string[]> = {
  main: [BLACKBOARD_FILE],
  blog: [BLACKBOARD_FILE],
};

const ACTIVE_PLAYLISTS = SITE_MODE === 'blackboard' ? BLACKBOARD_PLAYLISTS : PLAYLISTS;

// Encode per path segment: blackboard tracks live in a music/ subdirectory, and
// a blanket encodeURIComponent would escape the separator into %2F.
const src = (name: string) =>
  new URL(
    `${import.meta.env.BASE_URL}assets/nodes/${name.split('/').map(encodeURIComponent).join('/')}`,
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
  /** Audible autoplay was refused, so the track is playing silently and the
   *  first user gesture unmutes it. */
  mutedAutoplay: boolean;
  armed: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  track: Track | null;
  arm: () => void;
  play: () => void;
  pause: () => void;
  setTrack: (t: Track | null) => void;
  setVolume: (v: number) => void;
  seek: (seconds: number) => void;
  toggle: () => void;
}

const Ctx = createContext<AudioCtxValue>(null!);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [armed,   setArmed]   = useState(SITE_MODE === 'blackboard');
  const [blocked, setBlocked] = useState(false);
  const [mutedAutoplay, setMutedAutoplay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume,  setVolume]  = useState(0.5);
  const [track,   setTrackState] = useState<Track | null>(SITE_MODE === 'blackboard' ? 'main' : null);
  const [idx,     setIdx]        = useState(0);

  const enabledRef = useRef(enabled);
  const armedRef   = useRef(armed);
  const trackRef   = useRef(track);
  const idxRef     = useRef(idx);
  const volumeRef  = useRef(volume);

  const gainRef        = useRef(0);
  const fadeTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef     = useRef(false);
  const pendingRef     = useRef(false);
  const selfPauseRef   = useRef(false);
  const soundedRef     = useRef(false);
  const failuresRef    = useRef(0);
  /** Incremented on each attemptPlay call; guards against stale promise handlers. */
  const playGenRef     = useRef(0);
  /** Re-entrancy guard for reconcile(). */
  const reconcilingRef = useRef(false);
  /** Muted-autoplay in progress: track is playing silently until a gesture. */
  const mutedAutoplayRef = useRef(false);

  const applyVolume = useCallback((a: HTMLAudioElement) => {
    const product = Math.max(0, Math.min(1, volumeRef.current * gainRef.current));
    a.volume = product;
    // Platforms that ignore element.volume (iOS) honor .muted — so the mute
    // button still works there. iOS volume itself is device-controlled.
    a.muted = product <= 0.001;
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

  /** Unmuted play where the browser allows it; muted autoplay + first-gesture
   *  unmute where it doesn't (iOS, cold Chrome). */
  const attemptPlay = useCallback(
    (a: HTMLAudioElement, fadeMs: number) => {
      // Silent-playing state: keep it until a real gesture unmutes; restarting
      // or unmuting here would leave the element audible without a gesture.
      if (mutedAutoplayRef.current && !a.paused) {
        pendingRef.current = false;
        setBlocked(false);
        return;
      }
      mutedAutoplayRef.current = false;
      setMutedAutoplay(false);
      // Guard: already playing this track at audible volume
      if (!a.paused && a.currentTime > 0 && gainRef.current > 0.01) {
        a.muted = false;
        pendingRef.current = false;
        setBlocked(false);
        soundedRef.current = true;
        fadeTo(1, fadeMs);
        return;
      }
      // Guard: play attempt already in flight
      if (playingRef.current) return;

      const thisGen = ++playGenRef.current;
      playingRef.current = true;
      a.muted = false;

      let p: Promise<void> | undefined;
      try {
        p = a.play() as Promise<void> | undefined;
      } catch {
        if (playGenRef.current === thisGen) playingRef.current = false;
        mutedFallback(a, thisGen);
        return;
      }

      const ok = () => {
        // Ignore if a newer play attempt started
        if (playGenRef.current !== thisGen) return;
        playingRef.current = false;
        pendingRef.current = false;
        soundedRef.current = true;
        setBlocked(false);
        fadeTo(1, fadeMs);
      };

      if (!p) { ok(); return; }

      p.then(ok).catch((err: DOMException) => {
        if (playGenRef.current !== thisGen) return;
        playingRef.current = false;
        if (err?.name === 'AbortError') return;
        // Audible autoplay refused. Muted autoplay is permitted everywhere —
        // start silently; the first user gesture unmutes.
        mutedFallback(a, thisGen);
      });
    },
    [fadeTo, applyVolume],
  );

  /** Muted autoplay fallback for a refused audible play(). */
  const mutedFallback = useCallback((a: HTMLAudioElement, thisGen: number) => {
    mutedAutoplayRef.current = true;
    setMutedAutoplay(true);
    gainRef.current = 0;
    a.muted = true;
    applyVolume(a);
    let muted: Promise<void> | undefined;
    try {
      muted = a.play() as Promise<void> | undefined;
    } catch {
      muted = undefined;
    }
    if (!muted) return;
    muted.then(() => {
      if (playGenRef.current !== thisGen) return;
      pendingRef.current = false;
      setBlocked(false);
    }).catch(() => {
      if (playGenRef.current !== thisGen) return;
      pendingRef.current = true;
      setBlocked(true);
    });
  }, [applyVolume]);

  const reconcile = useCallback(() => {
    // Re-entrancy guard
    if (reconcilingRef.current) return;
    reconcilingRef.current = true;
    try {
      const a = audioRef.current;
      const t = trackRef.current;
      if (!a || !t) return;

      const list      = ACTIVE_PLAYLISTS[t];
      const wantSrc   = src(list[idxRef.current % list.length]);
      const wantSound = armedRef.current && enabledRef.current;
      const isLoop    = list.length === 1;

      if (a.src !== wantSrc) {
        const swap = () => {
          selfPauseRef.current = true;
          gainRef.current = 0;
          applyVolume(a);
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
        } else if (mutedAutoplayRef.current) {
          // Silent autoplay is already running; leave it until a gesture.
          pendingRef.current = false;
          setBlocked(false);
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
    } finally {
      reconcilingRef.current = false;
    }
  }, [attemptPlay, fadeTo, applyVolume]);

  // Create the element once. Preload main track so the first arm isn't a fetch.
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.volume = 0;
    a.preload = 'auto';
    a.src = src(ACTIVE_PLAYLISTS.main[0]);
    a.load();
    audioRef.current = a;

    const onEnded = () => {
      const t = trackRef.current;
      if (!t) return;
      const len = ACTIVE_PLAYLISTS[t].length;
      if (len > 1) setIdx(i => (i + 1) % len);
    };

    const onPause = () => {
      setPlaying(false);
      if (a.ended) return;
      if (selfPauseRef.current) { selfPauseRef.current = false; return; }
      if (armedRef.current && enabledRef.current && trackRef.current) {
        pendingRef.current = true;
        setBlocked(true);
      }
    };

    const onPlaying = () => {
      setPlaying(true);
      selfPauseRef.current = false;
      pendingRef.current = false;
      soundedRef.current = true;
      failuresRef.current = 0;
      setBlocked(false);
      // iOS ignores preload and only reveals duration once playback actually
      // starts, so metadata events may never have fired: sync it here, or the
      // scrubber stays disabled at 0:00 with a frozen dot.
      if (Number.isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    };

    const onError = () => {
      const t = trackRef.current;
      if (!t) return;
      const len = ACTIVE_PLAYLISTS[t].length;
      failuresRef.current += 1;
      if (len > 1 && failuresRef.current < len) setIdx(i => (i + 1) % len);
    };

    const onTimeUpdate = () => setCurrentTime(a.currentTime || 0);
    const onMetadata = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);

    a.addEventListener('ended', onEnded);
    a.addEventListener('pause', onPause);
    a.addEventListener('playing', onPlaying);
    a.addEventListener('error', onError);
    a.addEventListener('timeupdate', onTimeUpdate);
    a.addEventListener('loadedmetadata', onMetadata);
    a.addEventListener('durationchange', onMetadata);

    return () => {
      if (fadeTimerRef.current !== null) clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('error', onError);
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.removeEventListener('loadedmetadata', onMetadata);
      a.removeEventListener('durationchange', onMetadata);
      a.pause();
      // Invalidate in-flight play attempts from this mount (React 18 StrictMode double-mount)
      playGenRef.current++;
      playingRef.current = false;
      audioRef.current = null;
    };
  }, []);

  // Cold-browser fallback: if play() was refused, retry on interaction. A
  // silent muted-autoplay is unmuted by the same first gesture.
  useEffect(() => {
    const retry = (e: Event) => {
      const el = e.target as Element | null;
      const fromAudioControl = Boolean(el?.closest?.('.audio-control'));
      if (mutedAutoplayRef.current && !fromAudioControl) {
        mutedAutoplayRef.current = false;
        setMutedAutoplay(false);
        playingRef.current = false;
        reconcile();
        return;
      }
      if (!pendingRef.current || fromAudioControl) return;
      playingRef.current = false;
      reconcile();
    };
    const onVisible = () => {
      if (document.hidden) return;
      if (pendingRef.current) {
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

  // Mobile Safari throttles `timeupdate` to ~1Hz and can pause it entirely
  // while its audio pipeline owns playback — the scrub dot would freeze on
  // phones while gliding on desktop. rAF alone does not cover it either: it
  // stalls during touch scrolls and can be suspended around gestures, which is
  // exactly when a finger is near the scrubber. So the clock has three
  // drivers: rAF smooths it to the scrubber's 0.1s step while playing, a 500ms
  // interval carries it whenever sound is coming out regardless of rAF or
  // `playing` state, and `timeupdate` stays on for background tabs, where both
  // timers stop but the event still fires. The interval no-ops while rAF is
  // healthy (0.25 threshold vs rAF's 0.09 steps), so they never double-render.
  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current;
      if (!a || a.paused) return;
      const t = a.currentTime || 0;
      setCurrentTime(prev => (Math.abs(t - prev) >= 0.25 ? t : prev));
    }, 500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const a = audioRef.current;
      if (a && !a.paused) {
        const t = a.currentTime || 0;
        if (Math.abs(t - last) >= 0.09) {
          last = t;
          setCurrentTime(t);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

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

  const play = useCallback(() => {
    setArmed(true);
    setEnabled(true);
  }, []);

  const pause = useCallback(() => setEnabled(false), []);

  const setTrack = useCallback((t: Track | null) => setTrackState(t), []);

  const seek = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(seconds)) return;
    const next = Math.max(0, Math.min(seconds, Number.isFinite(a.duration) ? a.duration : seconds));
    a.currentTime = next;
    setCurrentTime(next);
  }, []);

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
    () => ({ enabled, blocked, mutedAutoplay, armed, playing, currentTime, duration, volume, track, arm, play, pause, setTrack, setVolume, seek, toggle }),
    [enabled, blocked, mutedAutoplay, armed, playing, currentTime, duration, volume, track, arm, play, pause, setTrack, setVolume, seek, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioCtx() {
  return useContext(Ctx);
}
