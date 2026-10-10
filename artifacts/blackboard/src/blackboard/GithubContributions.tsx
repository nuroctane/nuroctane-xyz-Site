import { ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdaptiveInk, useReducedMotion } from './WallpaperProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB CONTRIBUTIONS

   The Blackboard's take on the Digital Sea's GitHub secondary node: the same
   isometric year of contributions, rebuilt as monochrome glass standing
   directly on the wallpaper. It takes the player's place on /github, with the
   count above it as the one link out to GitHub itself.

   The graph is Canvas 2D on purpose. The wallpaper already holds a WebGL
   context for the whole visit, and 371 boxes on a regular grid need nothing a
   second one would buy: an orthographic camera plus a depth-sorted painter
   draws them exactly, with no shader to compile and no context to lose.

   Both surfaces sit on the plate, so each resolves its own ink. The canvas
   paints with the stage's computed `color`, which is `var(--bb-ink)` — a
   registered property — so a pole flip cross-fades the glass on the same
   280ms curve as the type around it.
   ═══════════════════════════════════════════════════════════════════════════ */

const PROFILE_URL = 'https://github.com/nuroctane';

interface Day { date: string; count: number; week: number; day: number }
interface Payload { username: string; totalContributions: number; updatedAt: string; data: Day[] }
type Status = 'loading' | 'ready' | 'error';

// One request per visit: going home and back replays the scene, not the fetch.
// A failure is dropped so the next visit tries again.
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

function useContributions(): { status: Status; payload: Payload | null } {
  const [state, setState] = useState<{ status: Status; payload: Payload | null }>({ status: 'loading', payload: null });
  useEffect(() => {
    let alive = true;
    loadContributions()
      .then(payload => { if (alive) setState({ status: 'ready', payload }); })
      .catch(() => { if (alive) setState({ status: 'error', payload: null }); });
    return () => { alive = false; };
  }, []);
  return state;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
      const t = clamp((now - start) / DURATION, 0, 1);
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
  // The label is fixed so a screen reader hears the total once, not every
  // frame of the count-up.
  const label = ready
    ? `${total.toLocaleString('en-US')} contributions in the last year. Open @nuroctane on GitHub`
    : 'Open @nuroctane on GitHub';

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

/* ── Scene ─────────────────────────────────────────────────────────────────
   World units: one grid pitch per week (x) and per weekday (z), y up. The
   camera is orthographic, so a box's screen depth is its rotated ground-plane
   z alone, and sorting the boxes by it is an exact painter's order for a grid
   whose footprints never overlap. */
const HALF = 0.41;          // half footprint; the remaining 0.18 is the gutter
const TILE_H = 0.035;       // a day with no contributions is a flat glass tile
const MIN_H = 0.22;
const MAX_H = 7;            // the busiest day stands as tall as the week is deep
const PITCH_MIN = 0.2;
const PITCH_MAX = 1.36;
const PITCH_DEFAULT = 0.6;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 4;
const SWAY_YAW = 0.32;      // the idle drift either side of where it was left
const SWAY_SPEED = 0.24;    // rad/s of sway phase: one full drift every ~26s
const IDLE_MS = 3500;       // hands off this long before the drift resumes
const GROW_SECONDS = 0.75;
const GLINT_PERIOD = 9;     // a light band crosses the glass every 9s
const GLINT_TRAVEL = 3.2;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Bar { day: Day; cx: number; cz: number; t: number; delay: number }

interface Engine { inkChanged: () => void; destroy: () => void }

/* Each side's outward normal and the corner pair (as ±HALF offsets) it spans,
   wound so the face polygon is ground a → ground b → top b → top a. */
const SIDES = [
  { nx: 1, nz: 0, a: [1, -1], b: [1, 1] },
  { nx: -1, nz: 0, a: [-1, 1], b: [-1, -1] },
  { nx: 0, nz: 1, a: [1, 1], b: [-1, 1] },
  { nx: 0, nz: -1, a: [-1, -1], b: [1, -1] },
] as const;

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [242, 242, 242];
}

/** Point-in-convex-polygon by consistent cross-product sign. */
function inside(x: number, y: number, xs: number[], ys: number[]): boolean {
  let sign = 0;
  for (let i = 0; i < xs.length; i++) {
    const j = (i + 1) % xs.length;
    const cross = (xs[j] - xs[i]) * (y - ys[i]) - (ys[j] - ys[i]) * (x - xs[i]);
    if (cross === 0) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

function createEngine(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  days: Day[],
  reduced: boolean,
  onHover: (day: Day | null) => void,
): Engine {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { inkChanged: () => {}, destroy: () => {} };

  const weeks = days.reduce((most, day) => Math.max(most, day.week), 0) + 1;
  const busiest = days.reduce((most, day) => Math.max(most, day.count), 1);
  const bars: Bar[] = days.map(day => ({
    day,
    cx: day.week - (weeks - 1) / 2,
    cz: day.day - 3,
    t: day.count > 0 ? Math.sqrt(day.count / busiest) : 0,
    // The year grows in as a wave from its oldest week to this one.
    delay: (day.week / weeks) * 0.9 + day.day * 0.025,
  }));
  const raised = bars.map((_, index) => index).filter(index => bars[index].t > 0);
  const flat = bars.map((_, index) => index).filter(index => bars[index].t === 0);
  const depth = new Float32Array(bars.length);
  const height = new Float32Array(bars.length);

  // First week of each month, for the labels along the near edge.
  const monthStarts: { week: number; label: string }[] = [];
  let previousMonth = -1;
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const month = Number(day.date.slice(5, 7)) - 1;
    if (month !== previousMonth && monthStarts[monthStarts.length - 1]?.week !== day.week) {
      monthStarts.push({ week: day.week, label: MONTHS[month] ?? '' });
    }
    previousMonth = month;
  }
  // A month that only touches the first column is a sliver, not a label.
  if (monthStarts.length > 1 && monthStarts[1].week - monthStarts[0].week < 2) monthStarts.shift();

  let width = 0;
  let heightPx = 0;
  let dpr = 1;
  const aspectYaw = () => (width / Math.max(1, heightPx) > 1.5 ? 0.5 : 0.82);
  const home = () => ({ yaw: aspectYaw(), pitch: PITCH_DEFAULT, zoom: 1, panX: 0, panY: 0 });
  let camera = { yaw: 0.5, pitch: PITCH_DEFAULT, zoom: 1, panX: 0, panY: 0 };
  let homed = false;
  let fit = { scale: 0, ox: 0, oy: 0 };
  let ink: [number, number, number] = parseRgb(getComputedStyle(stage).color);
  let inkUntil = 0;

  let swayAmp = 0;
  let swayPhase = 0;
  let spin = 0;               // yaw inertia after a flick, rad/s
  let lastInteract = reduced ? Number.POSITIVE_INFINITY : performance.now() - IDLE_MS;
  let reset: { from: typeof camera; start: number } | null = null;
  const start = performance.now();
  let last = start;
  let lastDraw = 0;
  let raf = 0;
  let hovered = -1;

  // The view used by the last paint, so picking matches what is on screen.
  let view = { ox: 0, oy: 0, s: 1, cy: 1, sy: 0, cp: 1, sp: 0, near: 1 };

  const pointers = new Map<number, { x: number; y: number }>();
  let mode: 'rotate' | 'pan' = 'rotate';
  let pinch: { distance: number; zoom: number; x: number; y: number } | null = null;
  let travel = 0;
  let lastMove = 0;
  let lastTap = 0;

  let destroyed = false;
  const request = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };

  const interact = () => {
    // Fold the drift into the camera before stopping it, so taking hold of the
    // graph never makes it jump.
    camera.yaw += swayAmp * SWAY_YAW * Math.sin(swayPhase);
    swayAmp = 0;
    reset = null;
    lastInteract = performance.now();
    request();
  };

  // Framed on what is actually there: the floor (with room for the month
  // labels on either edge) plus every raised bar at its full height. Reserving
  // the tallest bar at all four corners left a dead band over an empty spring.
  // Keyed by bar index: `raised` is re-sorted by depth on every frame.
  const fullHeight = new Float32Array(bars.length);
  for (const index of raised) fullHeight[index] = MIN_H + (MAX_H - MIN_H) * bars[index].t;
  function fitFor(yaw: number, pitch: number) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const xe = (weeks - 1) / 2 + HALF;
    const ze = 3 + HALF + 1.1;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const include = (x: number, y: number, z: number) => {
      const sx = x * cy - z * sy;
      const syy = (x * sy + z * cy) * sp - y * cp;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (syy < minY) minY = syy;
      if (syy > maxY) maxY = syy;
    };
    for (const x of [-xe, xe]) for (const z of [-ze, ze]) include(x, 0, z);
    raised.forEach(index => {
      const { cx, cz } = bars[index];
      const h = fullHeight[index];
      include(cx - HALF, h, cz - HALF);
      include(cx + HALF, h, cz - HALF);
      include(cx + HALF, h, cz + HALF);
      include(cx - HALF, h, cz + HALF);
    });
    const scale = Math.min((width * 0.94) / (maxX - minX || 1), (heightPx * 0.9) / (maxY - minY || 1));
    return { scale, ox: (-(minX + maxX) / 2) * scale, oy: (-(minY + maxY) / 2) * scale };
  }

  function frame(now: number) {
    raf = 0;
    const elapsed = (now - start) / 1000;
    const dragging = pointers.size > 0;
    const idle = !reduced && !dragging && now - lastInteract > IDLE_MS;
    const growing = !reduced && elapsed < 0.9 + 0.15 + GROW_SECONDS;
    const settling = Boolean(reset) || Math.abs(spin) > 0.002 || now < inkUntil;

    // Idle drift alone is held to ~30fps; anything the visitor is driving runs
    // at the display rate. Checked before the clock advances, so a skipped
    // frame's time still counts toward the next drawn one.
    if (idle && !growing && !settling && now - lastDraw < 32) {
      request();
      return;
    }
    lastDraw = now;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    if (!dragging && spin) {
      camera.yaw += spin * dt;
      spin *= Math.exp(-dt * 3.2);
      if (Math.abs(spin) < 0.002) spin = 0;
    }
    if (reset) {
      const t = easeOutCubic(clamp((now - reset.start) / 650, 0, 1));
      const target = home();
      const from = reset.from;
      camera = {
        yaw: from.yaw + (target.yaw - from.yaw) * t,
        pitch: from.pitch + (target.pitch - from.pitch) * t,
        zoom: from.zoom + (target.zoom - from.zoom) * t,
        panX: from.panX + (target.panX - from.panX) * t,
        panY: from.panY + (target.panY - from.panY) * t,
      };
      if (t >= 1) reset = null;
    }
    if (!reduced) {
      if (idle) {
        swayPhase += dt * SWAY_SPEED;
        swayAmp += (1 - swayAmp) * (1 - Math.exp(-dt * 0.7));
      }
    }
    if (now < inkUntil) ink = parseRgb(getComputedStyle(stage).color);

    const sway = Math.sin(swayPhase);
    const yaw = camera.yaw + swayAmp * SWAY_YAW * sway;
    const pitch = clamp(camera.pitch + swayAmp * 0.05 * Math.sin(swayPhase * 0.7), PITCH_MIN, PITCH_MAX);
    // It floats, like the node it came from: a slow few-pixel bob.
    const bob = swayAmp * 3 * Math.sin(swayPhase * 1.6);

    const target = fitFor(yaw, pitch);
    if (!fit.scale || reduced) fit = target;
    else {
      const k = 1 - Math.exp(-dt * 5);
      fit = {
        scale: fit.scale + (target.scale - fit.scale) * k,
        ox: fit.ox + (target.ox - fit.ox) * k,
        oy: fit.oy + (target.oy - fit.oy) * k,
      };
    }
    const fitting = Math.abs(target.scale - fit.scale) > 0.002 * target.scale;

    draw(elapsed, yaw, pitch, bob);

    if (!reduced || dragging || settling || fitting) request();
  }

  function draw(elapsed: number, yaw: number, pitch: number, bob: number) {
    if (!ctx || width < 2 || heightPx < 2) return;
    const s = fit.scale * camera.zoom;
    const ox = width / 2 + fit.ox * camera.zoom + camera.panX;
    const oy = heightPx / 2 + fit.oy * camera.zoom + camera.panY + bob;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const near = cy >= 0 ? 1 : -1;
    view = { ox, oy, s, cy, sy, cp, sp, near };
    const px = (x: number, z: number) => ox + (x * cy - z * sy) * s;
    const py = (x: number, y: number, z: number) => oy + ((x * sy + z * cy) * sp - y * cp) * s;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, heightPx);
    const color = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    const hair = clamp(s * 0.05, 0.6, 1.1);

    // A band of light sweeps the glass now and then.
    const cycle = elapsed % GLINT_PERIOD;
    const glintX = reduced || cycle > GLINT_TRAVEL
      ? Number.POSITIVE_INFINITY
      : -(weeks / 2) - 6 + ((weeks + 12) * cycle) / GLINT_TRAVEL;
    const glint = (cx: number) => (glintX === Number.POSITIVE_INFINITY ? 0 : Math.exp(-(((cx - glintX) / 2.6) ** 2)));
    const grow = (bar: Bar) => (reduced ? 1 : easeOutCubic(clamp((elapsed - bar.delay) / GROW_SECONDS, 0, 1)));

    // The floor the year stands on.
    const xe = (weeks - 1) / 2 + HALF + 0.35;
    const ze = 3 + HALF + 0.35;
    ctx.beginPath();
    ctx.moveTo(px(-xe, -ze), py(-xe, 0, -ze));
    ctx.lineTo(px(xe, -ze), py(xe, 0, -ze));
    ctx.lineTo(px(xe, ze), py(xe, 0, ze));
    ctx.lineTo(px(-xe, ze), py(-xe, 0, ze));
    ctx.closePath();
    ctx.globalAlpha = 0.03;
    ctx.fill();
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = hair;
    ctx.stroke();

    // Empty days: flat, so nothing can stand in front of them. One batched
    // path, drawn first, under every raised bar.
    ctx.beginPath();
    for (const index of flat) {
      const bar = bars[index];
      height[index] = TILE_H;
      const x0 = bar.cx - HALF, x1 = bar.cx + HALF, z0 = bar.cz - HALF, z1 = bar.cz + HALF;
      ctx.moveTo(px(x0, z0), py(x0, TILE_H, z0));
      ctx.lineTo(px(x1, z0), py(x1, TILE_H, z0));
      ctx.lineTo(px(x1, z1), py(x1, TILE_H, z1));
      ctx.lineTo(px(x0, z1), py(x0, TILE_H, z1));
      ctx.closePath();
    }
    ctx.globalAlpha = 0.07;
    ctx.fill();
    ctx.globalAlpha = 0.13;
    ctx.lineWidth = hair * 0.8;
    ctx.stroke();
    if (hovered >= 0 && bars[hovered].t === 0) {
      const bar = bars[hovered];
      const x0 = bar.cx - HALF, x1 = bar.cx + HALF, z0 = bar.cz - HALF, z1 = bar.cz + HALF;
      ctx.beginPath();
      ctx.moveTo(px(x0, z0), py(x0, TILE_H, z0));
      ctx.lineTo(px(x1, z0), py(x1, TILE_H, z0));
      ctx.lineTo(px(x1, z1), py(x1, TILE_H, z1));
      ctx.lineTo(px(x0, z1), py(x0, TILE_H, z1));
      ctx.closePath();
      ctx.globalAlpha = 0.5;
      ctx.fill();
    }

    // Raised days, far to near.
    for (const index of raised) depth[index] = bars[index].cx * sy + bars[index].cz * cy;
    raised.sort((a, b) => depth[a] - depth[b]);
    const sides = SIDES.filter(side => side.nx * sy + side.nz * cy > 0.001).map(side => ({
      ...side,
      // Lit from the upper left of the screen, whichever way the grid faces.
      shade: 0.55 + 0.45 * -(side.nx * cy - side.nz * sy),
    }));

    for (const index of raised) {
      const bar = bars[index];
      const h = Math.max(TILE_H, fullHeight[index] * grow(bar));
      height[index] = h;
      const g = glint(bar.cx);
      const lit = index === hovered;
      const { cx, cz, t } = bar;

      for (const side of sides) {
        const ax = cx + side.a[0] * HALF, az = cz + side.a[1] * HALF;
        const bx = cx + side.b[0] * HALF, bz = cz + side.b[1] * HALF;
        ctx.beginPath();
        ctx.moveTo(px(ax, az), py(ax, 0, az));
        ctx.lineTo(px(bx, bz), py(bx, 0, bz));
        ctx.lineTo(px(bx, bz), py(bx, h, bz));
        ctx.lineTo(px(ax, az), py(ax, h, az));
        ctx.closePath();
        ctx.globalAlpha = lit ? 0.55 * side.shade : (0.05 + 0.24 * t + 0.16 * g) * side.shade;
        ctx.fill();
        ctx.globalAlpha = lit ? 0.95 : 0.2 + 0.42 * t + 0.3 * g;
        ctx.lineWidth = hair;
        ctx.stroke();
      }

      const x0 = cx - HALF, x1 = cx + HALF, z0 = cz - HALF, z1 = cz + HALF;
      ctx.beginPath();
      ctx.moveTo(px(x0, z0), py(x0, h, z0));
      ctx.lineTo(px(x1, z0), py(x1, h, z0));
      ctx.lineTo(px(x1, z1), py(x1, h, z1));
      ctx.lineTo(px(x0, z1), py(x0, h, z1));
      ctx.closePath();
      ctx.globalAlpha = lit ? 0.92 : 0.12 + 0.5 * t + 0.32 * g;
      ctx.fill();
      ctx.globalAlpha = lit ? 1 : clamp(0.32 + 0.55 * t + 0.35 * g, 0, 1);
      ctx.stroke();
    }

    // Month labels along whichever long edge faces the viewer, skipped where
    // the rotation has packed them too tight to read.
    const fontPx = clamp(s * 0.62, 8, 10);
    ctx.font = `500 ${fontPx}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.55;
    const lz = near * (3 + HALF + 0.95);
    // Screen x is monotonic in week along an edge, so comparing with the last
    // label drawn is enough whichever way the edge runs.
    let previousX = Number.NEGATIVE_INFINITY;
    for (const month of monthStarts) {
      const x = month.week - (weeks - 1) / 2;
      const sx = px(x, lz);
      const minGap = ctx.measureText(month.label).width + 8;
      if (Math.abs(sx - previousX) < minGap) continue;
      ctx.fillText(month.label, sx, py(x, 0, lz));
      previousX = sx;
    }
    ctx.globalAlpha = 1;
  }

  function pick(x: number, y: number): number {
    const { ox, oy, s, cy, sy, cp, sp } = view;
    const px = (wx: number, wz: number) => ox + (wx * cy - wz * sy) * s;
    const py = (wx: number, wy: number, wz: number) => oy + ((wx * sy + wz * cy) * sp - wy * cp) * s;
    const visible = SIDES.filter(side => side.nx * sy + side.nz * cy > 0.001);
    // Nearest first: the first box whose outline holds the point is on top.
    const order = [...raised].sort((a, b) => depth[b] - depth[a]);
    for (const index of order) {
      const { cx, cz } = bars[index];
      const h = height[index];
      const x0 = cx - HALF, x1 = cx + HALF, z0 = cz - HALF, z1 = cz + HALF;
      if (inside(x, y,
        [px(x0, z0), px(x1, z0), px(x1, z1), px(x0, z1)],
        [py(x0, h, z0), py(x1, h, z0), py(x1, h, z1), py(x0, h, z1)])) return index;
      for (const side of visible) {
        const ax = cx + side.a[0] * HALF, az = cz + side.a[1] * HALF;
        const bx = cx + side.b[0] * HALF, bz = cz + side.b[1] * HALF;
        if (inside(x, y,
          [px(ax, az), px(bx, bz), px(bx, bz), px(ax, az)],
          [py(ax, 0, az), py(bx, 0, bz), py(bx, h, bz), py(ax, h, az)])) return index;
      }
    }
    for (const index of flat) {
      const { cx, cz } = bars[index];
      const x0 = cx - HALF, x1 = cx + HALF, z0 = cz - HALF, z1 = cz + HALF;
      if (inside(x, y,
        [px(x0, z0), px(x1, z0), px(x1, z1), px(x0, z1)],
        [py(x0, TILE_H, z0), py(x1, TILE_H, z0), py(x1, TILE_H, z1), py(x0, TILE_H, z1)])) return index;
    }
    return -1;
  }

  const setHovered = (index: number) => {
    if (index === hovered) return;
    hovered = index;
    onHover(index >= 0 ? bars[index].day : null);
    request();
  };

  const local = (event: PointerEvent | WheelEvent | MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button > 2) return;
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    mode = event.button === 1 || event.button === 2 || event.shiftKey ? 'pan' : 'rotate';
    spin = 0;
    travel = 0;
    interact();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: camera.zoom, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) {
      if (event.pointerType === 'mouse') {
        const { x, y } = local(event);
        setHovered(pick(x, y));
      }
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    travel += Math.abs(dx) + Math.abs(dy);
    lastInteract = performance.now();

    if (pointers.size >= 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      camera.zoom = clamp(pinch.zoom * (distance / pinch.distance), ZOOM_MIN, ZOOM_MAX);
      camera.panX += mx - pinch.x;
      camera.panY += my - pinch.y;
      pinch.x = mx;
      pinch.y = my;
    } else if (mode === 'pan') {
      camera.panX += dx;
      camera.panY += dy;
    } else {
      // Negative so the near edge follows the pointer: the grid turns the way
      // it is pushed.
      const now = performance.now();
      const step = -dx * 0.0085;
      camera.yaw += step;
      camera.pitch = clamp(camera.pitch + dy * 0.006, PITCH_MIN, PITCH_MAX);
      const elapsedMove = Math.max(1, now - lastMove) / 1000;
      // Smoothed: single pointer events are too jittery to read a flick from.
      spin = reduced ? 0 : clamp(spin * 0.5 + (step / elapsedMove) * 0.5, -6, 6);
      lastMove = now;
    }
    if (event.pointerType === 'mouse') {
      const { x, y } = local(event);
      setHovered(pick(x, y));
    }
    request();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    // A flick keeps turning; a drag that stopped before letting go does not.
    if (performance.now() - lastMove > 80) spin = 0;
    lastInteract = performance.now();
    if (event.pointerType !== 'mouse' && travel < 6) {
      const now = performance.now();
      if (now - lastTap < 320) {
        reset = { from: { ...camera }, start: now };
        spin = 0;
      } else {
        const { x, y } = local(event);
        setHovered(pick(x, y));
      }
      lastTap = now;
    }
    request();
  };

  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && !pointers.size) setHovered(-1);
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    interact();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    camera.zoom = clamp(camera.zoom * Math.exp(-delta * 0.0015), ZOOM_MIN, ZOOM_MAX);
  };

  const onDoubleClick = () => {
    interact();
    spin = 0;
    reset = { from: { ...camera }, start: performance.now() };
  };

  const onKey = (event: KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => { camera.yaw += 0.18; },
      ArrowRight: () => { camera.yaw -= 0.18; },
      ArrowUp: () => { camera.pitch = clamp(camera.pitch + 0.1, PITCH_MIN, PITCH_MAX); },
      ArrowDown: () => { camera.pitch = clamp(camera.pitch - 0.1, PITCH_MIN, PITCH_MAX); },
      '+': () => { camera.zoom = clamp(camera.zoom * 1.15, ZOOM_MIN, ZOOM_MAX); },
      '=': () => { camera.zoom = clamp(camera.zoom * 1.15, ZOOM_MIN, ZOOM_MAX); },
      '-': () => { camera.zoom = clamp(camera.zoom / 1.15, ZOOM_MIN, ZOOM_MAX); },
      '0': () => { reset = { from: { ...camera }, start: performance.now() }; },
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    interact();
    spin = 0;
    action();
    request();
  };

  const onContextMenu = (event: MouseEvent) => event.preventDefault();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    heightPx = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(heightPx * dpr));
    // The resting angle depends on the stage's shape, so it is set from the
    // first real measurement rather than guessed before layout.
    if (!homed && width > 0) {
      camera = home();
      homed = true;
    }
    fit = { scale: 0, ox: 0, oy: 0 };
    request();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDoubleClick);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('contextmenu', onContextMenu);
  // Canvas text measured before the web font lands would keep the fallback face.
  document.fonts?.ready.then(request).catch(() => {});
  resize();

  return {
    inkChanged: () => {
      // Follow the registered property through its whole cross-fade.
      inkUntil = performance.now() + 450;
      request();
    },
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDoubleClick);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('contextmenu', onContextMenu);
    },
  };
}

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const HINT = COARSE
  ? 'drag to rotate · pinch to zoom · double-tap to reset'
  : 'drag to rotate · scroll to zoom · shift-drag to pan · double-click to reset';

function ContributionGraph({ status, payload }: { status: Status; payload: Payload | null }) {
  const reduced = useReducedMotion();
  const [stageRef, stageInk] = useAdaptiveInk<HTMLDivElement>();
  const [readoutRef, readoutInk] = useAdaptiveInk<HTMLParagraphElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hovered, setHovered] = useState<Day | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage || !payload) return undefined;
    const engine = createEngine(canvas, stage, payload.data, reduced, setHovered);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [payload, reduced, stageRef]);

  useEffect(() => {
    engineRef.current?.inkChanged();
  }, [stageInk]);

  const summary = useMemo(() => {
    if (!payload) return '';
    const best = payload.data.reduce((top, day) => (day.count > top.count ? day : top), payload.data[0]);
    const active = payload.data.filter(day => day.count > 0).length;
    return `${payload.totalContributions.toLocaleString('en-US')} contributions in the last year across ${active} active days. Busiest day: ${formatDay(best.date)}, ${countLabel(best.count).toLowerCase()}. Use the arrow keys to rotate and plus or minus to zoom.`;
  }, [payload]);

  return <>
    <div className="bb-gh-stage" data-ink={stageInk} ref={stageRef}>
      {status === 'ready'
        ? <canvas ref={canvasRef} role="img" tabIndex={0} aria-label={`3D contribution graph. ${summary}`} />
        : <p className="bb-gh-status" role="status">{status === 'loading' ? 'Syncing contributions…' : 'GitHub is unreachable right now'}</p>}
    </div>
    {/* Not a live region: it changes on every hover, and the canvas label
        already carries the year's summary. */}
    <p className="bb-gh-readout" data-ink={readoutInk} ref={readoutRef}>
      {status !== 'ready' ? ' ' : hovered ? <><span>{formatDay(hovered.date)}</span><span aria-hidden="true"> · </span><strong>{countLabel(hovered.count)}</strong></> : HINT}
    </p>
  </>;
}

export default function GithubContributions() {
  const { status, payload } = useContributions();
  return <section className="bb-gh" aria-label="GitHub contributions">
    <h2 className="sr-only">GitHub contributions</h2>
    <ContributionCounter status={status} payload={payload} />
    <ContributionGraph status={status} payload={payload} />
  </section>;
}
