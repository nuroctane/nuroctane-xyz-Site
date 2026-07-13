import { useEffect } from 'react';
import { useAudioCtx } from './AudioContext';
import { installScrollMetrics, scrollT } from '../lib/scrollMetrics';
import type { Mode, Track } from '../types';

/**
 * Start the score the moment the swimmer leaves the NUROCTANE title.
 *
 * Timeline (document scroll t):
 *   ~0          landing — NUROCTANE title on screen
 *   0.003       past the title (this threshold)
 *   0.004–0.054 identity / summary panel
 *   ~0.055+     first card (instagram) — where the OLD start was (too late)
 *
 * Old code used 0.055. We only needed that number moved earlier — not a
 * gesture / unlock rewrite.
 *
 * Uses raw document scroll (not the camera lerp ref) so mobile can't lag past
 * the threshold and leave the session silent.
 */
export const MUSIC_START_T = 0.003;

/**
 * Drives the score from the swim. Arming is sticky: once past NUROCTANE the
 * music stays on until the user mutes or leaves the page. Track switches
 * between sea and blog only.
 */
export function useMusicDirector(activeTrack: Track, mode: Mode) {
  const { armed, arm, setTrack } = useAudioCtx();

  useEffect(() => {
    setTrack(activeTrack);
  }, [activeTrack, setTrack]);

  // Camera mode has no document scroll past the title; entering it counts.
  useEffect(() => {
    if (mode === 'camera') arm();
  }, [mode, arm]);

  useEffect(() => {
    if (armed) return;
    const uninstall = installScrollMetrics();

    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      window.removeEventListener('scroll', check);
      if (timer !== null) clearInterval(timer);
      timer = null;
    };
    function check() {
      if (scrollT() < MUSIC_START_T) return;
      stop();
      arm();
    }

    window.addEventListener('scroll', check, { passive: true });
    // Backstop: restore / deep-link / jump past the title without a scroll event.
    timer = setInterval(check, 150);
    check();

    return () => {
      stop();
      uninstall();
    };
  }, [armed, arm]);
}
