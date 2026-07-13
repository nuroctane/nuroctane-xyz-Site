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
   AUDIO — single owner of the one <audio> element for the whole app.

   Components never touch the element; they declare intent:
     setTrack('main' | 'blog')  which score should be playing
     arm()                      the swimmer has left the hero — sound may begin
     toggle()                   the user's mute preference
   and a reconcile pass makes the element match.

   Browser policy: unmuted autoplay is blocked until a real user gesture
   (click / tap / key). Scroll and wheel do NOT count. So we:
     1. Start the element *muted* as soon as we're armed (muted autoplay is
        always allowed — the buffer warms and the clock runs).
     2. On the first real gesture anywhere on the page, unmute + fade in.
   The audio button is just one such gesture — any click/tap/key works.
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

/** Swell on the first note of a session, quicker on switches/resumes. */
const FADE_FIRST_MS  = 1600;
const FADE_SWITCH_MS = 900;
const FADE_RESUME_MS = 450;
const FADE_OUT_MS    = 420;

/**
 * Events that grant sticky user activation. Wheel/scroll DO NOT — a browser
 * will refuse unmuted play() for a visitor who has only scrolled.
 */
const ACTIVATION_EVENTS = [
  'pointerdown',
  'pointerup',
  'mousedown',
  'touchstart',
  'touchend',
  'keydown',
  'click',
] as const;

interface AudioCtxValue {
  /** User's mute preference. */
  enabled: boolean;
  /** We want sound but still need a gesture to unmute / unlock. */
  blocked: boolean;
  /** The hero has been passed — sound is allowed to begin. */
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

  // Reconcile reads these from event handlers, so they mirror state (synced in
  // the reconcile effect, which runs after every commit).
  const enabledRef = useRef(enabled);
  const armedRef   = useRef(armed);
  const trackRef   = useRef(track);
  const idxRef     = useRef(idx);
  const volumeRef  = useRef(volume);

  /** Fade envelope 0..1; effective element volume is volume * gain. */
  const gainRef      = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** A play() promise is in flight — don't stack another. */
  const playingRef   = useRef(false);
  /**
   * True once the page has a real user gesture. Until then we may only run
   * the element muted; after, unmuted playback is allowed by the browser.
   */
  const unlockedRef  = useRef(false);
  /** We want audible sound but haven't unlocked yet (or play was refused). */
  const pendingRef   = useRef(false);
  /** This next `pause` event is ours (mute / src swap), not the browser's. */
  const selfPauseRef = useRef(false);
  /** First audible note of the session has sounded — later starts fade quicker. */
  const soundedRef   = useRef(false);
  /** Consecutive load failures, so a missing playlist cannot spin forever. */
  const failuresRef  = useRef(0);
  /** Optional Web Audio context — resume() on gesture helps some engines. */
  const webAudioRef  = useRef<AudioContext | null>(null);

  const applyVolume = useCallback((a: HTMLAudioElement) => {
    a.volume = Math.max(0, Math.min(1, volumeRef.current * gainRef.current));
  }, []);

  /**
   * Ramp the envelope on a wall-clock timer — deliberately NOT on rAF.
   * rAF stops dead in a background tab (and can stall behind a busy render
   * loop), which would freeze a fade mid-way: the score would play on at a
   * gain of ~0 — audible silence — or a mute would never reach its pause().
   * A timer keeps running, so every fade always reaches its destination.
   */
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
        const eased = p * p * (3 - 2 * p); // smoothstep — no audible corner
        gainRef.current = from + (to - from) * eased;
        applyVolume(a);
      }, 25);
    },
    [applyVolume],
  );

  /**
   * Kick the element. If we don't have a gesture yet, start muted (always
   * allowed) and mark blocked so the UI asks for a tap. Once unlocked, play
   * unmuted and fade the envelope in.
   */
  const attemptPlay = useCallback(
    (a: HTMLAudioElement, fadeMs: number) => {
      if (playingRef.current) return;

      const audible = unlockedRef.current;
      a.muted = !audible;

      // Already running (e.g. muted pre-roll) — just promote to audible.
      if (!a.paused) {
        if (audible) {
          pendingRef.current = false;
          setBlocked(false);
          soundedRef.current = true;
          fadeTo(1, fadeMs);
        } else {
          pendingRef.current = true;
          setBlocked(true);
        }
        return;
      }

      playingRef.current = true;

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
        if (audible) {
          pendingRef.current = false;
          soundedRef.current = true;
          setBlocked(false);
          fadeTo(1, fadeMs);
        } else {
          // Muted pre-roll is running; wait for a gesture to unmute.
          pendingRef.current = true;
          setBlocked(true);
          // Keep gain at 0 until unlock so unmute + fade is smooth.
        }
      };

      if (!p) { ok(); return; } // older browsers return void

      p.then(ok).catch((err: DOMException) => {
        playingRef.current = false;
        // A newer src/load superseded this play — reconcile already re-ran.
        if (err?.name === 'AbortError') return;
        // Even muted play can fail (decode/network). Still wait for a gesture
        // retry so a later click can recover.
        pendingRef.current = true;
        setBlocked(true);
      });
    },
    [fadeTo],
  );

  /** Make the element match intent. Safe to call at any time, from anywhere. */
  const reconcile = useCallback(() => {
    const a = audioRef.current;
    const t = trackRef.current;
    if (!a || !t) return; // no score selected yet (e.g. a cold /resume load)

    const list      = PLAYLISTS[t];
    const wantSrc   = src(list[idxRef.current % list.length]);
    const wantSound = armedRef.current && enabledRef.current;
    const isLoop    = list.length === 1;

    // Different score (or next track in the blog playlist) — swap it in, never
    // audibly: fade out first if something is currently sounding.
    if (a.src !== wantSrc) {
      const swap = () => {
        selfPauseRef.current = true; // assigning src fires a `pause` event
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
      } else if (unlockedRef.current) {
        a.muted = false;
        fadeTo(1, soundedRef.current ? FADE_RESUME_MS : FADE_FIRST_MS);
        pendingRef.current = false;
        setBlocked(false);
      } else {
        // Playing muted, still need a gesture.
        a.muted = true;
        pendingRef.current = true;
        setBlocked(true);
      }
      return;
    }

    // Muted preference / not yet armed. Keep currentTime so toggle resumes.
    pendingRef.current = false;
    setBlocked(false);
    fadeTo(0, FADE_OUT_MS, () => {
      selfPauseRef.current = true;
      a.pause();
      a.muted = true;
    });
  }, [attemptPlay, fadeTo]);

  /**
   * Spend a user gesture: mark the page unlocked and make the score audible
   * immediately (same call stack as the event — required by autoplay policy).
   */
  const unlockFromGesture = useCallback(() => {
    unlockedRef.current = true;

    // Resume a Web Audio context if we opened one — helps Safari/Chromium.
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        if (!webAudioRef.current) webAudioRef.current = new Ctx();
        void webAudioRef.current.resume();
      }
    } catch { /* optional */ }

    const a = audioRef.current;
    if (!a) return;
    if (!(armedRef.current && enabledRef.current && trackRef.current)) return;

    a.muted = false;

    if (a.paused) {
      // Synchronous play() inside the gesture stack.
      playingRef.current = false; // allow attemptPlay to run
      attemptPlay(a, soundedRef.current ? FADE_RESUME_MS : FADE_FIRST_MS);
    } else {
      const fadeMs = soundedRef.current ? FADE_RESUME_MS : FADE_FIRST_MS;
      pendingRef.current = false;
      soundedRef.current = true;
      setBlocked(false);
      fadeTo(1, fadeMs);
    }
  }, [attemptPlay, fadeTo]);

  // ── The element. Created once, outlives every route. ────────────────────
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.volume = 0;
    a.muted = true;
    // Warm the buffer as soon as a score is chosen — the main track is 13 MB,
    // and fetching it only at the trigger is what made the start feel late.
    a.preload = 'auto';
    audioRef.current = a;

    const onEnded = () => {
      const t = trackRef.current;
      if (!t) return;
      const len = PLAYLISTS[t].length;
      if (len > 1) setIdx(i => (i + 1) % len);
    };

    // Anything that stops the score without us asking (OS/media keys, a policy
    // pause on some browsers) leaves us pending, so the next gesture revives it.
    const onPause = () => {
      if (a.ended) return; // natural end of a playlist track — onEnded advances
      if (selfPauseRef.current) { selfPauseRef.current = false; return; }
      if (armedRef.current && enabledRef.current && trackRef.current) {
        pendingRef.current = true;
        setBlocked(true);
        // Don't clear unlocked — a later gesture can resume.
      }
    };

    const onPlaying = () => {
      selfPauseRef.current = false;
      failuresRef.current = 0;
      if (unlockedRef.current && !a.muted) {
        pendingRef.current = false;
        soundedRef.current = true;
        setBlocked(false);
      }
    };

    // A track that fails to load must not end the music — skip to the next one,
    // but give up after one full lap so a wholly missing playlist cannot spin.
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
      if (webAudioRef.current) {
        void webAudioRef.current.close().catch(() => {});
        webAudioRef.current = null;
      }
    };
  }, []);

  // ── First real gesture anywhere → unlock audible playback. ──────────────
  useEffect(() => {
    const onGesture = (e: Event) => {
      // Audio button handles unlock via toggle (avoids double-toggle races
      // on its own pointerdown → click sequence).
      const el = e.target as Element | null;
      if (el?.closest?.('.audio-control')) return;

      // Always record sticky activation so a later arm() can play unmuted.
      if (!unlockedRef.current) {
        unlockFromGesture();
        return;
      }

      // Already unlocked but still waiting (policy pause, failed play, etc.).
      if (pendingRef.current) unlockFromGesture();
    };

    const onVisible = () => {
      if (!document.hidden && pendingRef.current && unlockedRef.current) {
        reconcile();
      }
    };

    ACTIVATION_EVENTS.forEach(type =>
      window.addEventListener(type, onGesture, { passive: true, capture: true }),
    );
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      ACTIVATION_EVENTS.forEach(type =>
        window.removeEventListener(type, onGesture, { capture: true }),
      );
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [unlockFromGesture, reconcile]);

  // ── Sync refs, then make the element match. Runs after every commit. ─────
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

  // Restart the playlist on track change; modulo in reconcile keeps the
  // in-between commit safe.
  useEffect(() => {
    setIdx(0);
    failuresRef.current = 0;
  }, [track]);

  const arm = useCallback(() => setArmed(true), []);

  const setTrack = useCallback((t: Track | null) => setTrackState(t), []);

  const toggle = useCallback(() => {
    // Score is waiting on a gesture — this click IS that gesture. Spend it on
    // starting the music rather than on flipping the preference to "muted".
    if (pendingRef.current || !unlockedRef.current) {
      unlockFromGesture();
      return;
    }
    setEnabled(prev => !prev);
  }, [unlockFromGesture]);

  const value = useMemo(
    () => ({ enabled, blocked, armed, volume, track, arm, setTrack, setVolume, toggle }),
    [enabled, blocked, armed, volume, track, arm, setTrack, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioCtx() {
  return useContext(Ctx);
}
