import { useEffect } from 'react';
import { useAudioCtx } from './AudioContext';
import { installScrollMetrics, scrollT } from '../lib/scrollMetrics';
import type { Mode, Track } from '../types';

/**
 * Where the score comes in: the moment the swimmer leaves NUROCTANE and the
 * identity panel rises. That panel fades in from t=0.004 and is fully lit by
 * t=0.016 — and the first card (instagram) does not begin until t≈0.066, so
 * this is comfortably "past the hero, before instagram", as intended.
 */
export const MUSIC_START_T = 0.010;

/**
 * Drives the score from the swim.
 *
 * Arming watches the *raw document scroll*, not the camera's progress ref: on
 * mobile that ref lerps toward its target for many frames after the last
 * scroll event, so a check reading it could miss the crossing and leave the
 * site silent for the whole session. Raw scroll cannot lag.
 *
 * A scroll listener catches every crossing the swimmer makes; the interval is
 * the backstop for the ones that arrive without a scroll event — scroll
 * restoration on reload, deep links, quick-nav jumps — so the score is on with
 * the same certainty however the swimmer got past the hero. (Deliberately not
 * rAF: it is dead in a background tab and can stall behind the render loop.)
 *
 * Arming is sticky for the life of the page: once the music has begun it is
 * only ever paused by the audio button or by closing the page, and only ever
 * *changed* by moving between the sea and the blog.
 */
export function useMusicDirector(activeTrack: Track, mode: Mode) {
  const { armed, arm, setTrack } = useAudioCtx();

  // Which score. Switching is instant once armed (entering the blog is itself
  // a click, so the browser lets the new track play immediately).
  useEffect(() => {
    setTrack(activeTrack);
  }, [activeTrack, setTrack]);

  // Camera mode has no document scroll to cross the threshold with, and it can
  // be entered straight from the hero. Entering it counts as passing the hero.
  useEffect(() => {
    if (mode === 'camera') arm();
  }, [mode, arm]);

  useEffect(() => {
    if (armed) return;
    const uninstall = installScrollMetrics(); // keeps scrollT() reflow-free

    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      window.removeEventListener('scroll', check);
      if (timer !== null) clearInterval(timer);
      timer = null;
    };
    function check() {
      if (scrollT() < MUSIC_START_T) return;
      stop();
      arm(); // sticky
    }

    window.addEventListener('scroll', check, { passive: true });
    timer = setInterval(check, 150);
    check();

    return () => {
      stop();
      uninstall();
    };
  }, [armed, arm]);
}
