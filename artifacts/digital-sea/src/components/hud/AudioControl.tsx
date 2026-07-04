import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useIsMobile } from '../../hooks/useMobile';
import { useAudioCtx } from '../../hooks/AudioContext';
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
  const { audioRef, enabled, volume, setVolume, toggle } = useAudioCtx();
  const [expanded, setExpanded] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const isMobile = useIsMobile();
  const unlockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Pre-unlock audio context on first user gesture, so play() succeeds
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
    GESTURES.forEach(e => window.addEventListener(e, unlock, { once: true, passive: true }));
    return () => {
      GESTURES.forEach(e => window.removeEventListener(e, unlock));
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
  }, [enabled, audioRef]);

  const prevTrackRef = useRef(activeTrack);
  const prevDirectionRef = useRef<'main' | 'blog'>(activeTrack === 'blog' ? 'blog' : 'main');
  const mainStartedRef = useRef(false);
  const [mainStarted, setMainStarted] = useState(false);
  const blogStartedRef = useRef(false);
  const [blogStarted, setBlogStarted] = useState(false);

  const isBlogTrack = activeTrack === 'blog';
  const playlist    = isBlogTrack ? (blogStarted ? BLOG_PLAYLIST : null) : (mainStarted ? MAIN_PLAYLIST : null);

  const currentDirection = isBlogTrack ? 'blog' : 'main';
  if (prevDirectionRef.current !== currentDirection) {
    prevDirectionRef.current = currentDirection;
    if (trackIdx !== 0) setTrackIdx(0);
  }

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

  // Set src on the shared audio element when playlist/track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const src = playlist ? toSrc(playlist[trackIdx]) : undefined;
    if (src) {
      a.src = src;
      a.currentTime = 0;
      a.loop = Boolean(playlist && playlist.length === 1);
      if (enabled) {
        const pr = a.play();
        if (pr) pr.catch(() => {});
      }
    } else {
      a.pause();
      a.src = '';
    }
  }, [trackIdx, playlist, enabled, audioRef]);

  // Handle track end
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      if (!playlist) return;
      setTrackIdx((i) => (i + 1) % playlist.length);
    };
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  }, [playlist, audioRef]);

  return (
    <div
      className="audio-control"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="audio-row">
        <button
          type="button"
          className={`audio-btn${enabled ? ' audio-on' : ''}`}
          onClick={toggle}
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
