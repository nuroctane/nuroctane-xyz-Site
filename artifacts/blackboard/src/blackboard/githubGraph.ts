/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB GRAPH ENGINE

   The year of contributions as monochrome glass, drawn with Canvas 2D. The
   wallpaper already holds a WebGL context for the whole visit, and 371 boxes
   on a regular grid need nothing a second one would buy: an orthographic
   camera plus a depth-sorted painter draws them exactly, with no shader to
   compile and no context to lose.

   World units: one grid pitch per week (x) and per weekday (z), y up. With an
   orthographic camera a box's screen depth is its rotated ground-plane z
   alone, so sorting by it is an exact painter's order for a grid whose
   footprints never overlap.

   The canvas paints with the stage's computed `color`, which is
   `var(--bb-ink)`: a registered property, so a pole flip cross-fades the glass
   on the same curve as the type around it.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ContributionDay { date: string; count: number; week: number; day: number }

export interface GraphEngine {
  /** The stage's ink pole changed; follow the cross-fade. */
  inkChanged: () => void;
  destroy: () => void;
}

export interface GraphOptions {
  reduced: boolean;
  /** The day under the pointer or keyboard cursor, or null. */
  onSelect: (day: ContributionDay | null) => void;
}

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
const SWAY_PITCH = 0.05;
const SWAY_BOB = 3;         // px: it floats, like the node it came from
const SWAY_SPEED = 0.24;    // rad/s of sway phase: one full drift every ~26s
const IDLE_MS = 3500;       // hands off this long before the drift resumes
const GROW_SECONDS = 0.75;
const GROW_SPREAD = 0.9;    // oldest week starts at 0, this week at 0.9s
const GLINT_START = 2.2;    // first pass waits for the year to finish growing
const GLINT_PERIOD = 9;     // then a light band crosses the glass every 9s
const GLINT_TRAVEL = 3.2;
const RESET_MS = 500;
const INK_FOLLOW_MS = 450;  // the 280ms ink transition, with room to land
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Each side's outward normal and the corner pair (as ±HALF offsets) it spans,
   wound so the face polygon is ground a → ground b → top b → top a. */
const SIDES = [
  { nx: 1, nz: 0, a: [1, -1], b: [1, 1] },
  { nx: -1, nz: 0, a: [-1, 1], b: [-1, -1] },
  { nx: 0, nz: 1, a: [1, 1], b: [-1, 1] },
  { nx: 0, nz: -1, a: [-1, -1], b: [1, -1] },
] as const;

interface Bar { day: ContributionDay; cx: number; cz: number; t: number; delay: number; full: number }
interface Camera { yaw: number; pitch: number; zoom: number; panX: number; panY: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

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
  return sign !== 0;
}

export function createGraph(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  days: ContributionDay[],
  { reduced, onSelect }: GraphOptions,
): GraphEngine {
  const ctx = canvas.getContext('2d');
  if (!ctx || !days.length) return { inkChanged: () => {}, destroy: () => {} };

  // More contrast asked for: the glass gets denser rather than more decorated.
  const density = window.matchMedia('(prefers-contrast: more)').matches ? 1.6 : 1;

  const weeks = days.reduce((most, day) => Math.max(most, day.week), 0) + 1;
  const busiest = days.reduce((most, day) => Math.max(most, day.count), 1);
  const bars: Bar[] = days.map(day => {
    const t = day.count > 0 ? Math.sqrt(day.count / busiest) : 0;
    return {
      day,
      cx: day.week - (weeks - 1) / 2,
      cz: day.day - 3,
      t,
      // The year grows in as a wave from its oldest week to this one.
      delay: (day.week / weeks) * GROW_SPREAD + day.day * 0.025,
      full: t > 0 ? MIN_H + (MAX_H - MIN_H) * t : TILE_H,
    };
  });
  const raised = bars.map((_, index) => index).filter(index => bars[index].t > 0);
  const flat = bars.map((_, index) => index).filter(index => bars[index].t === 0);
  const depth = new Float32Array(bars.length);
  const height = new Float32Array(bars.length);
  // Ground cell → bar, for picking the floor without gaps.
  const cell = new Int32Array(weeks * 7).fill(-1);
  bars.forEach((bar, index) => { cell[bar.day.week * 7 + bar.day.day] = index; });
  // Date order, for stepping through days from the keyboard.
  const byDate = bars.map((_, index) => index).sort((a, b) => bars[a].day.date.localeCompare(bars[b].day.date));
  const rankOf = new Int32Array(bars.length);
  byDate.forEach((index, rank) => { rankOf[index] = rank; });

  // First week of each month, for the labels along the near edge.
  const monthStarts: { week: number; label: string }[] = [];
  let previousMonth = -1;
  for (const index of byDate) {
    const { date, week } = bars[index].day;
    const month = Number(date.slice(5, 7)) - 1;
    if (month !== previousMonth && monthStarts[monthStarts.length - 1]?.week !== week) {
      monthStarts.push({ week, label: MONTHS[month] ?? '' });
    }
    previousMonth = month;
  }
  // A month that only touches the first column is a sliver, not a label.
  if (monthStarts.length > 1 && monthStarts[1].week - monthStarts[0].week < 2) monthStarts.shift();

  let width = 0;
  let heightPx = 0;
  let dpr = 1;
  // A wide stage shows the year side-on; a tall one turns it into the depth.
  const home = (): Camera => ({ yaw: width / Math.max(1, heightPx) > 1.5 ? 0.5 : 0.82, pitch: PITCH_DEFAULT, zoom: 1, panX: 0, panY: 0 });
  let camera: Camera = { yaw: 0.5, pitch: PITCH_DEFAULT, zoom: 1, panX: 0, panY: 0 };
  let homed = false;
  let fit = { scale: 0, ox: 0, oy: 0 };
  let ink = parseRgb(getComputedStyle(stage).color);
  // Created mid cross-fade, the first read would be a grey in between, so the
  // first moments are followed too.
  let inkUntil = performance.now() + INK_FOLLOW_MS;

  let swayAmp = 0;
  let swayPhase = 0;
  let spin = 0;               // yaw inertia after a flick, rad/s
  let lastInteract = reduced ? Number.POSITIVE_INFINITY : performance.now() - IDLE_MS;
  let reset: { from: Camera; start: number } | null = null;
  const start = performance.now();
  let last = start;
  let lastDraw = 0;
  let raf = 0;
  let destroyed = false;
  let selected = -1;
  let selectedBy: 'pointer' | 'key' = 'pointer';
  let mouse: { x: number; y: number } | null = null;

  // The view used by the last paint, so picking matches what is on screen.
  let view = { ox: 0, oy: 0, s: 1, cy: 1, sy: 0, cp: 1, sp: 0 };

  const pointers = new Map<number, { x: number; y: number }>();
  let mode: 'rotate' | 'pan' = 'rotate';
  let pinch: { distance: number; zoom: number; x: number; y: number } | null = null;
  let travel = 0;
  let lastMove = 0;
  let lastTap = 0;

  const request = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };

  /** Fold the drift into the camera and stop it, so taking hold never jumps. */
  const holdDrift = () => {
    if (swayAmp > 0) {
      camera.yaw += swayAmp * SWAY_YAW * Math.sin(swayPhase);
      camera.pitch = clamp(camera.pitch + swayAmp * SWAY_PITCH * Math.sin(swayPhase * 0.7), PITCH_MIN, PITCH_MAX);
      camera.panY += swayAmp * SWAY_BOB * Math.sin(swayPhase * 1.6);
      swayAmp = 0;
    }
    lastInteract = performance.now();
  };

  const interact = () => {
    holdDrift();
    reset = null;
    request();
  };

  const select = (index: number, by: 'pointer' | 'key') => {
    selectedBy = by;
    if (index === selected) return;
    selected = index;
    onSelect(index >= 0 ? bars[index].day : null);
    request();
  };

  const clampPan = () => {
    // Far enough to reach either end at full zoom, never far enough to lose it.
    const limitX = width * 0.5 * camera.zoom;
    const limitY = heightPx * 0.5 * camera.zoom;
    camera.panX = clamp(camera.panX, -limitX, limitX);
    camera.panY = clamp(camera.panY, -limitY, limitY);
  };

  /** Zoom about a canvas point, so whatever is under the pointer stays put. */
  const zoomAt = (next: number, mx: number, my: number) => {
    const from = camera.zoom;
    const to = clamp(next, ZOOM_MIN, ZOOM_MAX);
    if (to === from) return;
    const ox = width / 2 + fit.ox * from + camera.panX;
    const oy = heightPx / 2 + fit.oy * from + camera.panY;
    const k = to / from;
    camera.panX = mx - (mx - ox) * k - width / 2 - fit.ox * to;
    camera.panY = my - (my - oy) * k - heightPx / 2 - fit.oy * to;
    camera.zoom = to;
    clampPan();
  };

  const startReset = (instant: boolean) => {
    interact();
    spin = 0;
    if (instant || reduced) camera = home();
    else reset = { from: { ...camera }, start: performance.now() };
    request();
  };

  function fitFor(yaw: number, pitch: number) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const xe = (weeks - 1) / 2 + HALF;
    const ze = 3 + HALF + 1.1;   // room for the month labels on either edge
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
    // Framed on what is actually there: reserving the tallest bar at all four
    // corners left a dead band over an empty spring.
    for (const index of raised) {
      const { cx, cz, full } = bars[index];
      include(cx - HALF, full, cz - HALF);
      include(cx + HALF, full, cz - HALF);
      include(cx + HALF, full, cz + HALF);
      include(cx - HALF, full, cz + HALF);
    }
    const scale = Math.min((width * 0.94) / (maxX - minX || 1), (heightPx * 0.9) / (maxY - minY || 1));
    return { scale, ox: (-(minX + maxX) / 2) * scale, oy: (-(minY + maxY) / 2) * scale };
  }

  /* Framed on the camera, not on the drift: the drift turns the year in place
     instead of re-zooming it as it goes, and the scale is the tightest across
     the whole swing so neither end of it runs into the stage edge. */
  function framing() {
    const centre = fitFor(camera.yaw, camera.pitch);
    if (swayAmp < 0.01) return centre;
    const swing = SWAY_YAW * swayAmp;
    const scale = Math.min(centre.scale, fitFor(camera.yaw - swing, camera.pitch).scale, fitFor(camera.yaw + swing, camera.pitch).scale);
    const k = scale / centre.scale;
    return { scale, ox: centre.ox * k, oy: centre.oy * k };
  }

  function frame(now: number) {
    raf = 0;
    const elapsed = (now - start) / 1000;
    const dragging = pointers.size > 0;
    // A resting mouse holds the drift: the day under it should stay under it.
    const idle = !reduced && !dragging && !mouse && now - lastInteract > IDLE_MS;
    const growing = !reduced && elapsed < GROW_SPREAD + 0.15 + GROW_SECONDS;
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
      // On-screen movement: eased at both ends.
      const t = easeInOutCubic(clamp((now - reset.start) / RESET_MS, 0, 1));
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
    if (idle) {
      swayPhase += dt * SWAY_SPEED;
      swayAmp += (1 - swayAmp) * (1 - Math.exp(-dt * 0.7));
    }
    if (now < inkUntil) ink = parseRgb(getComputedStyle(stage).color);

    const yaw = camera.yaw + swayAmp * SWAY_YAW * Math.sin(swayPhase);
    const pitch = clamp(camera.pitch + swayAmp * SWAY_PITCH * Math.sin(swayPhase * 0.7), PITCH_MIN, PITCH_MAX);
    const bob = swayAmp * SWAY_BOB * Math.sin(swayPhase * 1.6);

    const target = framing();
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

    // A flick or a reset carries the grid under a still pointer.
    if (mouse && !dragging && selectedBy === 'pointer' && (spin || reset)) select(pick(mouse.x, mouse.y), 'pointer');

    if (!reduced || dragging || settling || fitting) request();
  }

  function draw(elapsed: number, yaw: number, pitch: number, bob: number) {
    if (!ctx || width < 2 || heightPx < 2) return;
    const s = fit.scale * camera.zoom;
    const ox = width / 2 + fit.ox * camera.zoom + camera.panX;
    const oy = heightPx / 2 + fit.oy * camera.zoom + camera.panY + bob;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    view = { ox, oy, s, cy, sy, cp, sp };
    const px = (x: number, z: number) => ox + (x * cy - z * sy) * s;
    const py = (x: number, y: number, z: number) => oy + ((x * sy + z * cy) * sp - y * cp) * s;
    const alpha = (value: number) => clamp(value * density, 0, 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, heightPx);
    const color = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    const hair = clamp(s * 0.05, 0.6, 1.1);

    // A band of light sweeps the glass now and then.
    const clock = elapsed - GLINT_START;
    const cycle = reduced || clock < 0 ? Number.POSITIVE_INFINITY : clock % GLINT_PERIOD;
    const glintX = cycle > GLINT_TRAVEL ? null : -(weeks / 2) - 6 + ((weeks + 12) * cycle) / GLINT_TRAVEL;
    const glint = (cx: number) => (glintX === null ? 0 : Math.exp(-(((cx - glintX) / 2.6) ** 2)));
    const grow = (bar: Bar) => (reduced ? 1 : easeOutCubic(clamp((elapsed - bar.delay) / GROW_SECONDS, 0, 1)));

    const quad = (x0: number, x1: number, z0: number, z1: number, y: number) => {
      ctx.moveTo(px(x0, z0), py(x0, y, z0));
      ctx.lineTo(px(x1, z0), py(x1, y, z0));
      ctx.lineTo(px(x1, z1), py(x1, y, z1));
      ctx.lineTo(px(x0, z1), py(x0, y, z1));
      ctx.closePath();
    };

    // The floor the year stands on.
    const xe = (weeks - 1) / 2 + HALF + 0.35;
    const ze = 3 + HALF + 0.35;
    ctx.beginPath();
    quad(-xe, xe, -ze, ze, 0);
    ctx.globalAlpha = alpha(0.03);
    ctx.fill();
    ctx.globalAlpha = alpha(0.1);
    ctx.lineWidth = hair;
    ctx.stroke();

    // Empty days: flat, so nothing can stand in front of them. One batched
    // path, drawn first, under every raised bar.
    ctx.beginPath();
    for (const index of flat) {
      const { cx, cz } = bars[index];
      height[index] = TILE_H;
      quad(cx - HALF, cx + HALF, cz - HALF, cz + HALF, TILE_H);
    }
    ctx.globalAlpha = alpha(0.07);
    ctx.fill();
    ctx.globalAlpha = alpha(0.13);
    ctx.lineWidth = hair * 0.8;
    ctx.stroke();
    if (selected >= 0 && bars[selected].t === 0) {
      const { cx, cz } = bars[selected];
      ctx.beginPath();
      quad(cx - HALF, cx + HALF, cz - HALF, cz + HALF, TILE_H);
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.stroke();
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
      const h = Math.max(TILE_H, bar.full * grow(bar));
      height[index] = h;
      const g = glint(bar.cx);
      const lit = index === selected;
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
        ctx.globalAlpha = lit ? 0.55 * side.shade : alpha((0.05 + 0.24 * t + 0.16 * g) * side.shade);
        ctx.fill();
        ctx.globalAlpha = lit ? 0.95 : alpha(0.2 + 0.42 * t + 0.3 * g);
        ctx.lineWidth = hair;
        ctx.stroke();
      }

      ctx.beginPath();
      quad(cx - HALF, cx + HALF, cz - HALF, cz + HALF, h);
      ctx.globalAlpha = lit ? 0.92 : alpha(0.12 + 0.5 * t + 0.32 * g);
      ctx.fill();
      ctx.globalAlpha = lit ? 1 : alpha(0.32 + 0.55 * t + 0.35 * g);
      ctx.stroke();
    }

    // Month labels along whichever long edge faces the viewer, skipped where
    // the rotation has packed them too tight to read. Screen x is monotonic
    // in week along an edge, so comparing with the last label drawn is enough
    // whichever way the edge runs.
    ctx.font = `500 ${clamp(s * 0.62, 8, 10)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha(0.55);
    const lz = (cy >= 0 ? 1 : -1) * (3 + HALF + 0.95);
    let previousX = Number.NEGATIVE_INFINITY;
    for (const month of monthStarts) {
      const x = month.week - (weeks - 1) / 2;
      const sx = px(x, lz);
      if (Math.abs(sx - previousX) < ctx.measureText(month.label).width + 8) continue;
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
    // Otherwise unproject onto the floor and take that cell. Tiles are hit as
    // full cells, so crossing a gutter never drops the readout back to the hint.
    if (sp < 1e-3) return -1;
    const xr = (x - ox) / s;
    const zr = (y - oy) / (s * sp);
    const wx = xr * cy + zr * sy;
    const wz = -xr * sy + zr * cy;
    const week = Math.round(wx + (weeks - 1) / 2);
    const day = Math.round(wz + 3);
    if (week < 0 || week >= weeks || day < 0 || day > 6) return -1;
    return cell[week * 7 + day];
  }

  const local = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button > 2) return;
    // A third finger is ignored rather than allowed to hijack the gesture.
    if (pointers.size >= 2) return;
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    mode = event.button === 1 || event.button === 2 || event.shiftKey ? 'pan' : 'rotate';
    spin = 0;
    travel = 0;
    interact();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const mid = local((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: camera.zoom, x: mid.x, y: mid.y };
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) {
      if (event.pointerType === 'mouse') {
        mouse = local(event.clientX, event.clientY);
        holdDrift();
        select(pick(mouse.x, mouse.y), 'pointer');
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
      const mid = local((a.x + b.x) / 2, (a.y + b.y) / 2);
      camera.panX += mid.x - pinch.x;
      camera.panY += mid.y - pinch.y;
      zoomAt(pinch.zoom * (distance / pinch.distance), mid.x, mid.y);
      clampPan();
      pinch.x = mid.x;
      pinch.y = mid.y;
    } else if (mode === 'pan') {
      camera.panX += dx;
      camera.panY += dy;
      clampPan();
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
      mouse = local(event.clientX, event.clientY);
      select(pick(mouse.x, mouse.y), 'pointer');
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
    if (event.pointerType !== 'mouse' && travel < 6 && !pointers.size) {
      const now = performance.now();
      if (now - lastTap < 320) startReset(false);
      else {
        const { x, y } = local(event.clientX, event.clientY);
        select(pick(x, y), 'pointer');
      }
      lastTap = now;
    }
    request();
  };

  const onLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || pointers.size) return;
    mouse = null;
    lastInteract = performance.now();
    if (selectedBy === 'pointer') select(-1, 'pointer');
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    interact();
    const scale = event.deltaMode === 1 ? 16 : 1;
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    // A sideways trackpad swipe turns the year; anything else zooms. A
    // trackpad pinch arrives as ctrl+wheel with small deltas, so it is geared up.
    if (!event.ctrlKey && Math.abs(dx) > Math.abs(dy)) {
      camera.yaw -= dx * 0.004;
    } else {
      const { x, y } = local(event.clientX, event.clientY);
      zoomAt(camera.zoom * Math.exp(-dy * (event.ctrlKey ? 0.01 : 0.0015)), x, y);
    }
  };

  const stepDay = (delta: number) => {
    const rank = selected >= 0 ? rankOf[selected] + delta : byDate.length - 1;
    select(byDate[clamp(rank, 0, byDate.length - 1)], 'key');
  };

  const onKey = (event: KeyboardEvent) => {
    // Keyboard moves are applied at once: they repeat, and easing each press
    // would only make the graph feel late.
    const actions: Record<string, () => void> = {
      ArrowLeft: () => { camera.yaw += 0.18; },
      ArrowRight: () => { camera.yaw -= 0.18; },
      ArrowUp: () => { camera.pitch = clamp(camera.pitch + 0.1, PITCH_MIN, PITCH_MAX); },
      ArrowDown: () => { camera.pitch = clamp(camera.pitch - 0.1, PITCH_MIN, PITCH_MAX); },
      '+': () => zoomAt(camera.zoom * 1.15, width / 2, heightPx / 2),
      '=': () => zoomAt(camera.zoom * 1.15, width / 2, heightPx / 2),
      '-': () => zoomAt(camera.zoom / 1.15, width / 2, heightPx / 2),
      '0': () => startReset(true),
      '[': () => stepDay(-1),
      ']': () => stepDay(1),
      '{': () => stepDay(-7),
      '}': () => stepDay(7),
      Home: () => select(byDate[0], 'key'),
      End: () => select(byDate[byDate.length - 1], 'key'),
      Escape: () => select(-1, 'key'),
    };
    const action = actions[event.key];
    if (!action || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    interact();
    spin = 0;
    action();
    request();
  };

  const onBlur = () => { if (selectedBy === 'key') select(-1, 'key'); };
  const onDoubleClick = () => startReset(false);
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

  const listeners: [string, EventListener, AddEventListenerOptions?][] = [
    ['pointerdown', onPointerDown as EventListener],
    ['pointermove', onPointerMove as EventListener],
    ['pointerup', onPointerUp as EventListener],
    ['pointercancel', onPointerUp as EventListener],
    ['pointerleave', onLeave as EventListener],
    ['wheel', onWheel as EventListener, { passive: false }],
    ['dblclick', onDoubleClick],
    ['keydown', onKey as EventListener],
    ['blur', onBlur],
    ['contextmenu', onContextMenu as EventListener],
  ];
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  for (const [type, listener, options] of listeners) canvas.addEventListener(type, listener, options);
  // Canvas text measured before the web font lands would keep the fallback face.
  document.fonts?.ready.then(request).catch(() => {});
  resize();

  return {
    inkChanged: () => {
      inkUntil = performance.now() + INK_FOLLOW_MS;
      request();
    },
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      for (const [type, listener] of listeners) canvas.removeEventListener(type, listener);
    },
  };
}
