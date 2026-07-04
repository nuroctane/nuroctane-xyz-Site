import { useState } from 'react';
import { useIsMobile } from '../../hooks/useMobile';
import { useAudioCtx } from '../../hooks/AudioContext';

export function MiniAudio() {
  const { enabled, volume, setVolume, toggle } = useAudioCtx();
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div
      className="audio-control mini-audio"
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
