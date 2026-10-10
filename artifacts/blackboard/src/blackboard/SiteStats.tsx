import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { dockGroups, type Destination } from './BlackboardQuickNav';
import { useCountUp } from './useCountUp';
import { useAdaptiveInk, useReducedMotion } from './WallpaperProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   SITE STATS

   /stats: public, aggregate traffic for the site, from /api/site-stats (which
   reads PostHog). Built on the /github page's vocabulary: everything stands on
   the wallpaper, each surface resolves its own ink, the hero number counts up,
   and the chart is drawn in `currentColor`, so a pole flip cross-fades it with
   the type around it. One series, so no legend: the hero names it.
   ═══════════════════════════════════════════════════════════════════════════ */

type RangeKey = '7d' | '30d' | '90d';
const RANGES: { key: RangeKey; label: string; caption: string }[] = [
  { key: '7d', label: '7D', caption: 'the last 7 days' },
  { key: '30d', label: '30D', caption: 'the last 30 days' },
  { key: '90d', label: '90D', caption: 'the last 90 days' },
];
const RANGE_KEY = 'bb:stats-range';

interface DayStat { day: string; views: number; visitors: number }
interface CountryStat { code: string; name: string; visitors: number; views: number }
interface LinkStat { href: string; host: string; clicks: number; visitors: number }
interface Stats {
  connected: true;
  at: string;
  stale?: boolean;
  range: { key: RangeKey; days: number; from: string; to: string };
  totals: { views: number; visitors: number };
  daily: DayStat[];
  countries: CountryStat[];
  pages: Record<string, { views: number; visitors: number }>;
  links: LinkStat[];
}
type Answer = Stats | { connected: false };
type Status = 'loading' | 'ready' | 'off' | 'error';

// One request per range per visit; switching back is instant. A failure is
// dropped so Try again asks afresh.
const requests = new Map<RangeKey, Promise<Answer>>();
function loadStats(range: RangeKey): Promise<Answer> {
  let pending = requests.get(range);
  if (!pending) {
    pending = fetch(`/api/site-stats?range=${range}`)
      .then(response => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<Answer>;
      })
      .then(answer => {
        if (!answer || (answer.connected && !Array.isArray((answer as Stats).daily))) throw new Error('shape');
        return answer;
      })
      .catch(error => {
        requests.delete(range);
        throw error;
      });
    requests.set(range, pending);
  }
  return pending;
}

function useStats(range: RangeKey) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: Status; data: Stats | null }>({ status: 'loading', data: null });
  useEffect(() => {
    let alive = true;
    // Refetch keeps the frame: the last answer stays up, dimmed, until the
    // new one lands.
    setState(current => ({ status: 'loading', data: current.data }));
    loadStats(range)
      .then(answer => {
        if (!alive) return;
        setState(answer.connected ? { status: 'ready', data: answer } : { status: 'off', data: null });
      })
      .catch(() => { if (alive) setState({ status: 'error', data: null }); });
    return () => { alive = false; };
  }, [range, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

const full = (n: number) => n.toLocaleString('en-US');
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const compact = (n: number) => (n >= 10_000 ? compactFormat.format(n) : full(n));
const plural = (n: number, word: string) => `${full(n)} ${word}${n === 1 ? '' : 's'}`;
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const shortDay = (iso: string) => utc(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const longDay = (iso: string, today: string) =>
  iso === today ? 'Today' : utc(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

function updatedLabel(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  return `Updated ${Math.round(minutes / 60)} h ago`;
}

/** Clean round tick ceiling: 1, 2, 5 × 10ⁿ. */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= value) return m * step;
  return 10 * step;
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function Hero({ status, data }: { status: Status; data: Stats | null }) {
  const reduced = useReducedMotion();
  const [ref, ink] = useAdaptiveInk<HTMLDivElement>();
  const visitors = data?.totals.visitors ?? 0;
  const shown = useCountUp(visitors, reduced);
  const caption = RANGES.find(range => range.key === data?.range.key)?.caption ?? '';
  const spoken = data
    ? `${full(visitors)} visitors and ${plural(data.totals.views, 'page view')} in ${caption}.`
    : status === 'off' ? "Stats aren't connected yet." : status === 'error' ? 'Stats are unavailable right now.' : 'Loading stats.';
  return <div ref={ref} data-ink={ink} className="bb-stats-hero">
    <span className="bb-stats-count" aria-hidden="true" data-ready={Boolean(data)}>
      {data ? full(shown) : status === 'loading' ? '····' : '—'}
    </span>
    <span className="bb-stats-caption" aria-hidden="true">
      {data ? `visitors in ${caption}` : status === 'off' ? "stats aren't connected yet" : status === 'error' ? 'stats are unavailable right now' : 'visitors'}
    </span>
    {data && <span className="bb-stats-sub" aria-hidden="true">{plural(data.totals.views, 'page view')}</span>}
    <span className="sr-only" role="status">{spoken}</span>
  </div>;
}

/* ── Range ────────────────────────────────────────────────────────────── */

function RangeSwitch({ value, onChange }: { value: RangeKey; onChange: (range: RangeKey) => void }) {
  const [ref, ink] = useAdaptiveInk<HTMLDivElement>();
  return <div ref={ref} data-ink={ink} className="bb-stats-range" role="group" aria-label="Time range">
    {RANGES.map(range => <button
      key={range.key}
      type="button"
      aria-pressed={range.key === value}
      aria-label={`Last ${range.caption.replace('the last ', '')}`}
      onClick={() => onChange(range.key)}
    >{range.label}</button>)}
  </div>;
}

/* ── Visits chart ─────────────────────────────────────────────────────── */

const PAD_TOP = 18;
const PAD_BOTTOM = 4;
const INSET = 5;

function VisitsChart({ data }: { data: Stats }) {
  const reduced = useReducedMotion();
  const [stageRef, stageInk] = useAdaptiveInk<HTMLDivElement>();
  const [readoutRef, readoutInk] = useAdaptiveInk<HTMLParagraphElement>();
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [index, setIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  // useId's «» are valid in an id but not inside url(#…) in every engine.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const days = data.daily;
  const today = data.range.to;

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return undefined;
    const measure = () => {
      const rect = plot.getBoundingClientRect();
      setSize(current => (Math.abs(current.width - rect.width) < 0.5 && Math.abs(current.height - rect.height) < 0.5
        ? current
        : { width: rect.width, height: rect.height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

  // A new range starts from today again.
  useEffect(() => setIndex(null), [data.range.key, data.at]);

  const { width, height } = size;
  const peak = days.reduce((most, day) => Math.max(most, day.visitors), 0);
  const top = niceMax(peak);
  const ticks = [0, top / 2, top];
  const step = days.length > 1 ? (width - INSET * 2) / (days.length - 1) : 0;
  const x = (i: number) => (days.length > 1 ? INSET + i * step : width / 2);
  const y = (v: number) => PAD_TOP + (1 - v / top) * Math.max(1, height - PAD_TOP - PAD_BOTTOM);
  const baseline = height - PAD_BOTTOM;
  const line = days.map((day, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(day.visitors).toFixed(1)}`).join(' ');
  const area = days.length ? `${line} L${x(days.length - 1).toFixed(1)} ${baseline} L${x(0).toFixed(1)} ${baseline} Z` : '';
  const active = index ?? days.length - 1;
  const shown = days[active];

  const pick = (clientX: number) => {
    const plot = plotRef.current;
    if (!plot || days.length < 2) return;
    const left = plot.getBoundingClientRect().left;
    setIndex(Math.min(days.length - 1, Math.max(0, Math.round((clientX - left - INSET) / step))));
  };
  const onPointer = (event: PointerEvent<HTMLDivElement>) => pick(event.clientX);
  const onLeave = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === 'mouse' && !focused) setIndex(null); };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = days.length - 1;
    const current = index ?? last;
    const next = event.key === 'ArrowLeft' ? current - 1
      : event.key === 'ArrowRight' ? current + 1
        : event.key === 'Home' ? 0
          : event.key === 'End' ? last
            : null;
    if (next === null) return;
    event.preventDefault();
    setIndex(Math.min(last, Math.max(0, next)));
  };

  const busiest = days.reduce((best, day) => (day.visitors > best.visitors ? day : best), days[0]);
  const summary = `Daily visitors, ${shortDay(days[0].day)} to ${shortDay(today)}. Peak ${plural(busiest.visitors, 'visitor')} on ${longDay(busiest.day, today)}. Arrow keys step through days.`;
  const middle = days[Math.floor((days.length - 1) / 2)];

  return <>
    <div className="bb-stats-chart" data-ink={stageInk} ref={stageRef}>
      <div
        className="bb-stats-plot"
        ref={plotRef}
        role="img"
        tabIndex={0}
        aria-label={summary}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={onLeave}
        onKeyDown={onKey}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setIndex(null); }}
      >
        {width > 0 && <svg key={`${data.range.key}-${data.at}`} width={width} height={height} aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            {/* The GitHub graph's glint: now and then a band of light passes
                through the glass. */}
            {!reduced && <linearGradient id={`${uid}-glint`} gradientUnits="userSpaceOnUse" x1={-width * 0.18} y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate"
                values={`0 0;${width * 1.18} 0;${width * 1.18} 0`} keyTimes="0;0.36;1"
                dur="9s" begin="2.2s" repeatCount="indefinite" />
            </linearGradient>}
          </defs>
          {ticks.map(tick => <g key={tick} className="bb-stats-grid">
            <line x1="0" x2={width} y1={y(tick)} y2={y(tick)} />
            {tick > 0 && <text x="0" y={y(tick) - 5}>{compact(tick)}</text>}
          </g>)}
          <path className="bb-stats-area" d={area} fill={`url(#${uid}-fill)`} />
          {!reduced && <path className="bb-stats-glint" d={area} fill={`url(#${uid}-glint)`} />}
          <path className="bb-stats-line" d={line} pathLength={1} />
          {index !== null && <line className="bb-stats-cross" x1={x(active)} x2={x(active)} y1={PAD_TOP - 6} y2={baseline} />}
          {shown && <circle className="bb-stats-dot" cx={x(active)} cy={y(shown.visitors)} r="4" />}
        </svg>}
      </div>
      <div className="bb-stats-axis" aria-hidden="true">
        <span>{shortDay(days[0].day)}</span>
        {days.length > 2 && <span>{shortDay(middle.day)}</span>}
        <span>{shortDay(today)}</span>
      </div>
    </div>
    {/* Data, never instructions: today's numbers until a day is picked. */}
    <p className="bb-stats-readout" data-ink={readoutInk} ref={readoutRef} aria-live={focused ? 'polite' : 'off'}>
      {shown && <>
        <span>{longDay(shown.day, today)}</span><span aria-hidden="true"> · </span>
        <strong>{plural(shown.visitors, 'visitor')}</strong><span aria-hidden="true"> · </span>
        <span>{plural(shown.views, 'view')}</span>
      </>}
    </p>
    <table className="sr-only">
      <caption>Daily visitors and page views</caption>
      <thead><tr><th scope="col">Day</th><th scope="col">Visitors</th><th scope="col">Views</th></tr></thead>
      <tbody>{days.map(day => <tr key={day.day}><th scope="row">{longDay(day.day, today)}</th><td>{day.visitors}</td><td>{day.views}</td></tr>)}</tbody>
    </table>
  </>;
}

/* ── Tiles ────────────────────────────────────────────────────────────── */

interface TileData { label: string; value: number; sub: string }

function Tile({ tile }: { tile: TileData }) {
  const [ref, ink] = useAdaptiveInk<HTMLDivElement>();
  return <div ref={ref} data-ink={ink} className="bb-stat-tile">
    <dt>{tile.label}</dt>
    <dd><span className="bb-stat-value">{compact(tile.value)}</span><span className="bb-stat-sub">{tile.sub}</span></dd>
  </div>;
}

/* ── Bar lists ────────────────────────────────────────────────────────── */

interface Row { key: string; label: string; value: number }

function BarList({ title, unit, rows, empty }: { title: string; unit: string; rows: Row[]; empty: string }) {
  const [ref, ink] = useAdaptiveInk<HTMLElement>();
  const max = rows.reduce((most, row) => Math.max(most, row.value), 1);
  return <section ref={ref} data-ink={ink} className="bb-stats-list" aria-label={title}>
    <h3>{title}</h3>
    {rows.length
      ? <ol>{rows.map((row, i) => <li key={row.key} style={{ '--i': i } as CSSProperties}>
        <span className="bb-stats-row-label">{row.label}</span>
        <span className="bb-stats-row-value">{full(row.value)}<span className="sr-only"> {unit}</span></span>
        <span className="bb-stats-bar" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0.015, row.value / max)})` }} /></span>
      </li>)}</ol>
      : <p className="bb-stats-empty">{empty}</p>}
  </section>;
}

/** The top `limit` rows, the rest folded into "Other". */
function fold(rows: Row[], limit: number): Row[] {
  const sorted = rows.filter(row => row.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= limit) return sorted;
  const rest = sorted.slice(limit - 1).reduce((sum, row) => sum + row.value, 0);
  return [...sorted.slice(0, limit - 1), { key: 'other', label: 'Other', value: rest }];
}

const linkKey = (url: string) => {
  try {
    const parsed = new URL(url);
    return `https://${parsed.hostname.toLowerCase().replace(/^www\./, '')}${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return '';
  }
};

/** Opens per dock entry: outbound clicks for external links, page views for
 *  the site's own project pages. */
function opens(entries: readonly Destination[], data: Stats): Row[] {
  const clicks = new Map(data.links.map(link => [link.href, link.clicks]));
  const all = entries.flatMap(entry => (entry.secondary ? [entry, entry.secondary] : [entry]));
  return all
    .filter(entry => entry.url && entry.url !== '#')
    .map(entry => ({
      key: entry.id,
      label: entry.label,
      value: entry.url.startsWith('/') ? data.pages[entry.url]?.views ?? 0 : clicks.get(linkKey(entry.url)) ?? 0,
    }));
}

function Breakdown({ data }: { data: Stats }) {
  const socials = useMemo(() => opens(dockGroups.socials, data), [data]);
  const projects = useMemo(() => opens(dockGroups.projects, data), [data]);
  const countries = useMemo(() => fold(data.countries.map(country => ({
    key: country.code || 'unknown',
    label: country.name || country.code || 'Unknown',
    value: country.visitors,
  })), 8), [data]);
  const sum = (rows: Row[]) => rows.reduce((total, row) => total + row.value, 0);
  const page = (path: string, label: string): TileData => {
    const stat = data.pages[path] ?? { views: 0, visitors: 0 };
    return { label, value: stat.visitors, sub: plural(stat.views, 'view') };
  };
  const tiles: TileData[] = [
    page('/books', 'Books'),
    page('/quotes', 'Quotes'),
    page('/blog', 'Blog'),
    page('/github', 'GitHub'),
    { label: 'Socials', value: sum(socials), sub: 'link opens' },
    { label: 'Projects', value: sum(projects), sub: 'opens' },
  ];
  return <>
    <dl className="bb-stat-tiles" aria-label="Pages and links, visitors">
      {tiles.map(tile => <Tile key={tile.label} tile={tile} />)}
    </dl>
    <div className="bb-stats-lists">
      <BarList title="Countries" unit="visitors" rows={countries} empty="No countries recorded in this range." />
      <BarList title="Socials" unit="opens" rows={fold(socials, 6)} empty="No social links opened in this range." />
      <BarList title="Projects" unit="opens" rows={fold(projects, 6)} empty="No projects opened in this range." />
    </div>
  </>;
}

function Footnote({ data }: { data: Stats }) {
  const [ref, ink] = useAdaptiveInk<HTMLParagraphElement>();
  const [, tick] = useState(0);
  // Keep "n min ago" honest while the page stays open.
  useEffect(() => {
    const id = window.setInterval(() => tick(value => value + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <p ref={ref} data-ink={ink} className="bb-stats-foot">{updatedLabel(data.at)}</p>;
}

function StatusLine({ status, retry }: { status: Status; retry: () => void }) {
  const [ref, ink] = useAdaptiveInk<HTMLDivElement>();
  if (status === 'loading') return <div ref={ref} data-ink={ink} className="bb-stats-status">Loading stats…</div>;
  if (status === 'error') return <div ref={ref} data-ink={ink} className="bb-stats-status" role="alert">
    <p>Stats didn&rsquo;t load</p>
    <button type="button" className="bb-gh-retry" onClick={retry}>Try again</button>
  </div>;
  return null;
}

function initialRange(): RangeKey {
  try {
    const saved = sessionStorage.getItem(RANGE_KEY);
    if (saved === '7d' || saved === '30d' || saved === '90d') return saved;
  } catch { /* storage blocked */ }
  return '30d';
}

export default function SiteStats() {
  const [range, setRangeState] = useState<RangeKey>(initialRange);
  const { status, data, retry } = useStats(range);
  const setRange = (next: RangeKey) => {
    setRangeState(next);
    try { sessionStorage.setItem(RANGE_KEY, next); } catch { /* storage blocked */ }
  };

  return <section className="bb-stats" aria-label="Site statistics" data-pending={status === 'loading' && Boolean(data)}>
    <h2 className="sr-only">Site statistics</h2>
    <Hero status={status} data={data} />
    {status !== 'off' && <RangeSwitch value={range} onChange={setRange} />}
    {data
      ? <div className="bb-stats-body">
        <VisitsChart data={data} />
        <Breakdown data={data} />
        <Footnote data={data} />
      </div>
      : <StatusLine status={status} retry={retry} />}
  </section>;
}
