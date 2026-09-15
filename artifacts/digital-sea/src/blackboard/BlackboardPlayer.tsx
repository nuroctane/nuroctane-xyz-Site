import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useAudioCtx } from '../hooks/AudioContext';

const TRACK = {
  artist: 'XXXTENTACION',
  title: 'difference (interlude)',
  album: 'SKINS',
  artwork: 'https://i1.sndcdn.com/artworks-000453716607-5n8yeu-t500x500.jpg',
  source: 'https://soundcloud.com/jahseh-onfroy/difference-interlude',
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export function BlackboardPlayer() {
  const { track, playing, currentTime, duration, volume, blocked, setTrack, play, pause, seek, setVolume } = useAudioCtx();
  const titleViewportRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const autoplayAttemptedRef = useRef(false);
  const lastAudibleVolumeRef = useRef(0.5);
  const [marquee, setMarquee] = useState(false);

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
    const measure = () => setMarquee(title.scrollWidth > viewport.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(title);
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

  return <section className="bb-player" aria-label="Blackboard audio player">
    <div className="bb-player-meta">
      <div className="bb-player-artwork"><img src={TRACK.artwork} alt="SKINS album artwork" /></div>
      <div className="bb-player-copy">
        <span className="bb-player-kicker">{TRACK.album}</span>
        <span className="bb-player-title-viewport" ref={titleViewportRef}>
          <strong className="bb-player-title" ref={titleRef} data-marquee={marquee}>{TRACK.title}</strong>
        </span>
        <span className="bb-player-artist">{TRACK.artist}</span>
        <a className="bb-player-source" href={TRACK.source} target="_blank" rel="noreferrer">SOUNDCLOUD ↗</a>
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
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={event => { const next = Number(event.target.value); if (next > 0) lastAudibleVolumeRef.current = next; setVolume(next); }} aria-label="Volume" />
      </div>
      <span className="bb-player-state" role="status">{blocked ? 'TAP TO PLAY' : playing ? 'PLAYING' : 'PAUSED'}</span>
    </div>
  </section>;
}
