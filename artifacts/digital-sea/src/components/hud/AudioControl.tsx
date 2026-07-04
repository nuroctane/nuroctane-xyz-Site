import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useIsMobile } from '../../hooks/useMobile';
import type { Track } from '../../types';

const MAIN_PLAYLIST = ['2814 - 終わりと始まり.mp3'];
const BLOG_PLAYLIST = [
  'sally shapiro - swimming through the blue lagoon.mp3',
  'willow - then (interlude).mp3',
  'Compendium - Introduction Development and Development.mp3',
];

const toSrc = (name: string) =>
  `${import.meta.env.BASE_URL}assets/nodes/${encodeURIComponent(name)}`;

const GESTURES = ['pointerdown', 'touchstart', 'keydown', 'click'] as const;

interface Props {
  activeTrack: Track;
  scrollProgress: MutableRefObject<number>;
}

export function AudioControl({ activeTrack, scrollProgress }: Props) {
  const audioRef    = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [volume,  setVolume]  = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const isMobile = useIsMobile();
  const unlockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Pre-unlock audio context on first user gesture, so play() succeeds
  // even if the gesture happened before the playlist was active.
  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      try {
        const ctx = new (window.AudioContext ?? (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        ctx.resume();
      } catch {}
    };
    const events = ['pointerdown', 'touchstart', 'keydown', 'click'];
    events.forEach(e => window.addEventListener(e, unlock, { once: true, passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, unlock));
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    };
  }, []);

  // bfcache: re-start audio when page is restored from back/forward cache
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const a = audioRef.current;
        if (a && enabled) { a.play()?.catch(() => {}); }
      }
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [enabled]);

  const prevTrackRef = useRef(activeTrack);
  const prevDirectionRef = useRef<'main' | 'blog'>(activeTrack === 'blog' ? 'blog' : 'main');
  const mainStartedRef = useRef(false);
  const [mainStarted, setMainStarted] = useState(false);
  const blogStartedRef = useRef(false);
  const [blogStarted, setBlogStarted] = useState(false);

  const isBlogTrack = activeTrack === 'blog';
  const playlist    = isBlogTrack ? (blogStarted ? BLOG_PLAYLIST : null) : (mainStarted ? MAIN_PLAYLIST : null);

  // When switching between main and blog tracks: reset trackIdx during render
  // so the <audio> element never renders with a stale out-of-bounds index.
  const currentDirection = isBlogTrack ? 'blog' : 'main';
  if (prevDirectionRef.current !== currentDirection) {
    prevDirectionRef.current = currentDirection;
    if (trackIdx !== 0) setTrackIdx(0);
  }

  // When switching between main and blog tracks: cut current track.
  useEffect(() => {
    const prev = prevTrackRef.current;
    prevTrackRef.current = activeTrack;

    if (prev !== activeTrack) {
      setTrackIdx(0);
      if (activeTrack !== 'blog') {
        blogStartedRef.current = false;
        setBlogStarted(false);
      }
    }
  }, [activeTrack]);

  // Scroll listener: start main playlist once past the summary screen.
  useEffect(() => {
    if (activeTrack === 'blog' || mainStartedRef.current) return;

    const check = () => {
      if (scrollProgress.current >= 0.055 && !mainStartedRef.current) {
        mainStartedRef.current = true;
        setMainStarted(true);
        setTrackIdx(0);
      }
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [activeTrack, scrollProgress]);

  // Scroll listener: start blog playlist once past the title screen.
  useEffect(() => {
    if (activeTrack !== 'blog' || blogStartedRef.current) return;

    const check = () => {
      if (scrollProgress.current >= 0.07 && !blogStartedRef.current) {
        blogStartedRef.current = true;
        setBlogStarted(true);
        setTrackIdx(0);
      }
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [activeTrack, scrollProgress]);

  // Track change → try to play
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.currentTime = 0;
    let started = false;

    const cleanup = () => GESTURES.forEach((e) => window.removeEventListener(e, onGesture));
    const tryStart = () => {
      if (started || !enabledRef.current) return;
      const pr = a.play();
      if (pr) {
        pr.then(() => { started = true; cleanup(); }).catch(() => {});
      }
    };
    function onGesture() { tryStart(); }

    tryStart();
    GESTURES.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
    return cleanup;
  }, [trackIdx, playlist]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnded = () => {
    if (!playlist) return;
    setTrackIdx((i) => (i + 1) % playlist.length);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled) {
      a.muted = false;
      const pr = a.play();
      if (pr) pr.catch(() => {});
    } else {
      a.pause();
      a.muted = true;
    }
  }, [enabled]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);

  return (
    <div
      className="audio-control"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <audio
        ref={audioRef}
        src={playlist ? toSrc(playlist[trackIdx]) : undefined}
        preload={playlist ? 'metadata' : 'none'}
        onEnded={handleEnded}
        loop={Boolean(playlist && playlist.length === 1)}
      />
      <div className="audio-row">
        <button
          type="button"
          className={`audio-btn${enabled ? ' audio-on' : ''}`}
          onClick={() => setEnabled((e) => !e)}
          title={enabled ? 'Mute & pause' : 'Play & unmute'}
          aria-pressed={enabled}
          aria-label={enabled ? 'Mute and pause background audio' : 'Play and unmute background audio'}
        >
          <svg viewBox="0 0 24 24" className="audio-icon" aria-hidden="true">
            <path d="M4 9 H7 L11.5 5 V19 L7 15 H4 Z" fill="currentColor" />
            {enabled ? (
              <>
                <path d="M14.6 8.6 a5 5 0 0 1 0 6.8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M16.9 6.2 a8.6 8.6 0 0 1 0 11.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="15" y1="9" x2="21" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="21" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>

        {!isMobile && (
          <div className={`audio-slider-wrap${expanded ? ' audio-expanded' : ''}`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="audio-slider"
              aria-label="Background audio volume"
              tabIndex={expanded ? 0 : -1}
            />
          </div>
        )}
      </div>
      <div className="audio-label">{enabled ? 'SOUND' : 'MUTED'}</div>
    </div>
  );
}
