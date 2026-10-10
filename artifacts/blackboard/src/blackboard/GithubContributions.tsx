import { ArrowUpRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGraph, type ContributionDay, type GraphEngine } from './githubGraph';
import { useAdaptiveInk, useReducedMotion } from './WallpaperProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB CONTRIBUTIONS

   The Blackboard's take on the Digital Sea's GitHub secondary node: the same
   isometric year of contributions, rebuilt as monochrome glass standing
   directly on the wallpaper (githubGraph.ts draws it). It takes the player's
   place on /github, with the count above it as the one link out to GitHub.

   Both surfaces sit on the plate, so each resolves its own ink.
   ═══════════════════════════════════════════════════════════════════════════ */

const PROFILE_URL = 'https://github.com/nuroctane';

interface Payload { username: string; totalContributions: number; updatedAt: string; data: ContributionDay[] }
type Status = 'loading' | 'ready' | 'error';

// One request per visit: going home and back replays the scene, not the fetch.
// A failure is dropped so a retry, or the next visit, asks again.
let request: Promise<Payload> | null = null;
function loadContributions(): Promise<Payload> {
  request ??= fetch('/api/github-contrib')
    .then(response => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<Payload>;
    })
    .then(payload => {
      if (!Array.isArray(payload?.data) || !payload.data.length) throw new Error('empty');
      return payload;
    })
    .catch(error => {
      request = null;
      throw error;
    });
  return request;
}

function useContributions() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: Status; payload: Payload | null }>({ status: 'loading', payload: null });
  useEffect(() => {
    let alive = true;
    setState(current => (current.status === 'loading' ? current : { status: 'loading', payload: null }));
    loadContributions()
      .then(payload => { if (alive) setState({ status: 'ready', payload }); })
      .catch(() => { if (alive) setState({ status: 'error', payload: null }); });
    return () => { alive = false; };
  }, [attempt]);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  return { ...state, retry };
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Counts up from zero once, then holds. Reduced motion lands on the total. */
function useCountUp(target: number, reduced: boolean): number {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced || target <= 0) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    const DURATION = 1400;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);
  return value;
}

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });

const countLabel = (count: number) =>
  count === 0 ? 'No contributions' : `${count.toLocaleString('en-US')} contribution${count === 1 ? '' : 's'}`;

function ContributionCounter({ status, payload }: { status: Status; payload: Payload | null }) {
  const reduced = useReducedMotion();
  const [ref, ink] = useAdaptiveInk<HTMLAnchorElement>();
  const total = payload?.totalContributions ?? 0;
  const shown = useCountUp(total, reduced);
  const ready = status === 'ready';
  // Fixed, so a screen reader hears the total once rather than every frame of
  // the count-up. It still contains the visible words, in order.
  const label = ready
    ? `${total.toLocaleString('en-US')} contributions in the last year, @nuroctane on GitHub (opens in a new tab)`
    : '@nuroctane on GitHub (opens in a new tab)';

  return <a ref={ref} data-ink={ink} className="bb-gh-counter" href={PROFILE_URL} target="_blank" rel="noreferrer" aria-label={label}>
    <span className="bb-gh-count" aria-hidden="true" data-ready={ready}>
      {ready ? shown.toLocaleString('en-US') : status === 'loading' ? '····' : '—'}
    </span>
    <span className="bb-gh-caption" aria-hidden="true">
      {status === 'error' ? 'contributions on GitHub' : 'contributions in the last year'}
    </span>
    <span className="bb-gh-handle" aria-hidden="true">@{payload?.username ?? 'nuroctane'}<ArrowUpRight /></span>
  </a>;
}

// One line at every width: the readout swaps between this and a day on
// hover, and a hint that wrapped would move the switcher below it each time.
const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const POINTER_HINT = COARSE ? 'drag to turn · pinch to zoom · tap a day' : 'drag to turn · scroll to zoom · double-click to reset';
const KEY_HINT = '← → turn · ↑ ↓ tilt · + − zoom · [ ] step days · 0 reset';

function ContributionGraph({ status, payload, retry }: { status: Status; payload: Payload | null; retry: () => void }) {
  const reduced = useReducedMotion();
  const [stageRef, stageInk] = useAdaptiveInk<HTMLDivElement>();
  const [readoutRef, readoutInk] = useAdaptiveInk<HTMLParagraphElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);
  const [selected, setSelected] = useState<ContributionDay | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage || !payload) return undefined;
    const engine = createGraph(canvas, stage, payload.data, { reduced, onSelect: setSelected });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
      setSelected(null);
    };
  }, [payload, reduced, stageRef]);

  useEffect(() => {
    engineRef.current?.inkChanged();
  }, [stageInk]);

  const summary = useMemo(() => {
    if (!payload) return '';
    const best = payload.data.reduce((top, day) => (day.count > top.count ? day : top), payload.data[0]);
    const active = payload.data.filter(day => day.count > 0).length;
    return `${payload.totalContributions.toLocaleString('en-US')} contributions in the last year across ${active} active days. Busiest day: ${formatDay(best.date)}, ${countLabel(best.count).toLowerCase()}. Arrow keys turn and tilt, plus and minus zoom, square brackets step through days.`;
  }, [payload]);

  const readout = status !== 'ready'
    ? ' '
    : selected
      ? <><span>{formatDay(selected.date)}</span><span aria-hidden="true"> · </span><strong>{countLabel(selected.count)}</strong></>
      : focused ? KEY_HINT : POINTER_HINT;

  return <>
    <div className="bb-gh-stage" data-ink={stageInk} data-status={status} ref={stageRef}>
      {status === 'ready' && <canvas
        ref={canvasRef}
        role="img"
        tabIndex={0}
        aria-label={`3D contribution graph. ${summary}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />}
      {status === 'loading' && <p className="bb-gh-status" role="status">Syncing contributions…</p>}
      {status === 'error' && <div className="bb-gh-status" role="alert">
        <p>GitHub didn&rsquo;t answer</p>
        <button type="button" className="bb-gh-retry" onClick={retry}>Try again</button>
      </div>}
    </div>
    {/* Announced only while the graph has keyboard focus: that is when a
        visitor steps through days without seeing a pointer move. Hover
        changes it constantly and would flood a screen reader otherwise. */}
    <p className="bb-gh-readout" data-ink={readoutInk} ref={readoutRef} aria-live={focused ? 'polite' : 'off'}>
      {readout}
    </p>
  </>;
}

export default function GithubContributions() {
  const { status, payload, retry } = useContributions();
  return <section className="bb-gh" aria-label="GitHub contributions">
    <h2 className="sr-only">GitHub contributions</h2>
    <ContributionCounter status={status} payload={payload} />
    <ContributionGraph status={status} payload={payload} retry={retry} />
  </section>;
}
