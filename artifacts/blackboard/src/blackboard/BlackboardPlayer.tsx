import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useAudioCtx } from '../hooks/AudioContext';
import { blackboardArtworkSrc, blackboardMusicPick } from '../data/blackboardMusic';

/* The library draw for this page view, shared with AudioContext through the
 * same module-level pick — so the panel always labels the file actually
 * playing. There is no chooser: the visitor gets one track per visit. */
const TRACK = blackboardMusicPick();

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

/* iOS ignores HTMLMediaElement.volume outright — device volume is the only
 * control that works there — so an in-page slider would be dead UI. Hide it
 * and let the hardware volume buttons do their native job. */
const IOS_VOLUME_DEAD = typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.userAgent) ||
   (navigator.platform === 'MacIntel' && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints > 1));

/* ── Title pan ──────────────────────────────────────────────────────────────
   A title wider than its box is panned by exactly the distance it overflows, so
   the end is always reachable. The distance is MEASURED, never assumed: the
   previous version panned a fixed 2rem, which on a title that overflowed by
   hundreds of pixels stopped mid-word and left the rest unreadable.

   The duration is derived from the distance at a constant speed, so a long title
   does not crawl and a short one does not flash past; the clamps keep both ends
   sane. This has to hold at every width the box can take — desktop, a phone, a
   resize mid-pan, a rotation — which is why the measurement is re-run from a
   ResizeObserver rather than once on mount. */
const PAN_GAP = 16;
const PAN_SPEED = 30;
const PAN_MIN_SECONDS = 6;
const PAN_MAX_SECONDS = 40;

interface TitlePan {
  panning: boolean;
  /** Total travel in px, positive. */
  shift: number;
  seconds: number;
}

const NO_PAN: TitlePan = { panning: false, shift: 0, seconds: PAN_MIN_SECONDS };

export function BlackboardPlayer() {
  const { track, playing, currentTime, duration, volume, blocked, mutedAutoplay, setTrack, play, pause, seek, setVolume } = useAudioCtx();
  const titleViewportRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const autoplayAttemptedRef = useRef(false);
  const lastAudibleVolumeRef = useRef(0.5);
  const [pan, setPan] = useState<TitlePan>(NO_PAN);

  useEffect(() => {
    if (track !== 'main') {
      setTrack('main');
      return;
    }
    if (autoplayAttemptedRef.current) return;
    autoplayAttemptedRef.current = true;
    // Try immediately on page load. Browsers that reject audible autoplay set
    // `blocked`; AudioContext retries on the first real interaction.
    play();
  }, [track, setTrack, play]);

  useLayoutEffect(() => {
    const viewport = titleViewportRef.current;
    const title = titleRef.current;
    if (!viewport || !title) return;
    const measure = () => {
      const box = viewport.clientWidth;
      // scrollWidth rounds to whole pixels and reports the UNCLIPPED content
      // width, which is what the overflow has to be measured against. A sub-pixel
      // overshoot is not an overflow worth panning for.
      const overflow = title.scrollWidth - box;
      if (overflow <= 1) {
        setPan(current => (current.panning ? NO_PAN : current));
        return;
      }
      const shift = overflow + PAN_GAP;
      const seconds = Math.min(
        PAN_MAX_SECONDS,
        Math.max(PAN_MIN_SECONDS, shift / PAN_SPEED),
      );
      setPan(current =>
        current.panning && current.shift === shift && current.seconds === seconds
          ? current
          : { panning: true, shift, seconds },
      );
    };
    measure();
    // Re-measure on any width change: the box is `min(26rem, ...)`, so a resize,
    // a rotation or a scrollbar appearing all change what has to be panned.
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(title);
    // Web fonts land after first paint and change the measured width, so the
    // title is re-measured once they are ready rather than keeping a distance
    // derived from the fallback face.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, []);

  const onPlayPause = () => {
    if (playing) pause();
    else play();
  };

  const onVolumeToggle = () => {
    if (volume > 0) {
      lastAudibleVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(lastAudibleVolumeRef.current || 0.5);
    }
  };

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return <section className="bb-player" aria-label="Blackboard audio player" data-ink="light">
    <div className="bb-player-meta">
      <div className="bb-player-artwork">
        {/* Decorative: the title and artist sit immediately beside it. */}
        <img src={blackboardArtworkSrc(TRACK)} alt="" />
      </div>
      <div className="bb-player-copy">
        {TRACK.album && <span className="bb-player-kicker">{TRACK.album}</span>}
        <span className="bb-player-title-viewport" ref={titleViewportRef}>
          <strong
            className="bb-player-title"
            ref={titleRef}
            data-pan={pan.panning}
            // The travel and the pace are passed as custom properties so the
            // keyframes can use them: a keyframe cannot read a measured value
            // any other way, and hardcoding it is what broke this before.
            style={pan.panning
              ? ({ '--bb-pan-shift': `${pan.shift}px`, '--bb-pan-duration': `${pan.seconds}s` } as CSSProperties)
              : undefined}
          >
            {TRACK.title}
          </strong>
        </span>
        <span className="bb-player-artist">{TRACK.artist}</span>
      </div>
    </div>
    <div className="bb-player-scrub">
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={event => seek(Number(event.target.value))}
        aria-label="Scrub audio"
        style={{ '--bb-progress': `${progress}%` } as CSSProperties}
        disabled={!duration}
      />
      <div className="bb-player-times"><span>{formatTime(currentTime)}</span><span>{duration ? formatTime(duration) : '--:--'}</span></div>
    </div>
    <div className="bb-player-controls">
      <button type="button" className="bb-player-play" onClick={onPlayPause} aria-label={playing ? 'Pause audio' : 'Play audio'}>
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
      <div className="bb-player-volume">
        <button type="button" className="bb-player-volume-button" onClick={onVolumeToggle} aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}>
          {volume === 0 ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
        {!IOS_VOLUME_DEAD && <input type="range" min="0" max="1" step="0.01" value={volume} onChange={event => { const next = Number(event.target.value); if (next > 0) lastAudibleVolumeRef.current = next; setVolume(next); }} aria-label="Volume" />}
      </div>
      <span className="bb-player-state" role="status">{blocked ? 'TAP TO PLAY' : mutedAutoplay ? 'TAP FOR SOUND' : playing ? 'PLAYING' : 'PAUSED'}</span>
    </div>
  </section>;
}
