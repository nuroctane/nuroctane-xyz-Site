import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../../hooks/useMobile';

const PLAYLIST = [
  'sally shapiro - swimming through the blue lagoon.mp3',
  'Compendium - Introduction Development and Development.mp3',
];

const toSrc = (name: string) =>
  `${import.meta.env.BASE_URL}assets/nodes/${encodeURIComponent(name)}`;

const GESTURES = ['pointerdown', 'touchstart', 'keydown', 'click'] as const;

export function AudioControl() {
  const audioRef    = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [volume,  setVolume]  = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const isMobile = useIsMobile();

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
  }, [trackIdx]);

  const handleEnded = () => {
    setTrackIdx((i) => (i + 1) % PLAYLIST.length);
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
        src={toSrc(PLAYLIST[trackIdx])}
        preload="auto"
        onEnded={handleEnded}
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
