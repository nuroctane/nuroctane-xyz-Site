import { useEffect, useRef, useState } from 'react';

type Day = { date: string; count: number; week: number; day: number };

type Payload = {
  username: string;
  totalContributions: number;
  updatedAt: string;
  data: Day[];
};

const LEVEL_COLORS = ['#0d2228', '#0e4429', '#006d32', '#26a641', '#39d353'];
const LABEL_TOP = 26; /* room for @user + count */

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 4;
  const t = count / max;
  if (t < 0.25) return 1;
  if (t < 0.5) return 2;
  if (t < 0.75) return 3;
  return 4;
}

/** Compact isometric contribution terrain for secondary-node orbit. */
export function GithubContribTerrain({ width = 132 }: { width?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/github-contrib')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: Payload) => {
        if (alive) setPayload(j);
      })
      .catch(() => {
        if (alive) setErr(true);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !payload?.data?.length) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = width;
    const cssH = Math.round(width * 0.72);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const days = payload.data;
    const maxWeek = Math.max(...days.map((d) => d.week), 0);
    const maxDay = Math.max(...days.map((d) => d.day), 6);
    const maxCount = Math.max(...days.map((d) => d.count), 1);

    const margin = 8;
    const availW = cssW - margin * 2;
    const availH = cssH - LABEL_TOP - margin;
    /* Fit full year grid in isometric projection */
    const cell = Math.min(
      4.4,
      availW / (maxWeek + maxDay + 4) / 0.9,
      availH / (maxWeek + maxDay + 6) / 0.55,
    );

    const project = (w: number, d: number, h: number, ox: number, oy: number) => {
      const x = ox + (w - d) * cell * 0.9;
      const y = oy + (w + d) * cell * 0.5 - h;
      return { x, y };
    };

    /* Measure bounds with temp origin, then center */
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const maxH = cell * 5.5;
    const sample = (w: number, d: number, h: number) => {
      const corners = [
        project(w, d, 0, 0, 0),
        project(w, d, h, 0, 0),
        { x: project(w, d, 0, 0, 0).x + cell * 0.9, y: project(w, d, 0, 0, 0).y + cell * 0.5 },
        { x: project(w, d, 0, 0, 0).x - cell * 0.9, y: project(w, d, 0, 0, 0).y + cell * 0.5 },
        { x: project(w, d, h, 0, 0).x + cell * 0.9, y: project(w, d, h, 0, 0).y + cell * 0.5 },
        { x: project(w, d, h, 0, 0).x - cell * 0.9, y: project(w, d, h, 0, 0).y + cell * 0.5 },
      ];
      for (const p of corners) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
    };
    sample(0, 0, maxH);
    sample(maxWeek, 0, maxH);
    sample(0, maxDay, maxH);
    sample(maxWeek, maxDay, maxH);
    for (const day of days) {
      const h = Math.max(1.5, (day.count / maxCount) * maxH);
      sample(day.week, day.day, h);
    }

    const bw = maxX - minX || 1;
    const bh = maxY - minY || 1;
    const ox = (cssW - bw) / 2 - minX;
    const oy = LABEL_TOP + (availH - bh) / 2 - minY;

    ctx.fillStyle = 'rgba(4, 18, 26, 0.9)';
    ctx.fillRect(0, 0, cssW, cssH);

    /* Draw back-to-front (week+day ascending) for simple painter order */
    const sorted = [...days].sort((a, b) => (a.week + a.day) - (b.week + b.day));
    for (const day of sorted) {
      const h = Math.max(1.5, (day.count / maxCount) * maxH);
      const { x, y } = project(day.week, day.day, 0, ox, oy);
      const top = project(day.week, day.day, h, ox, oy);
      const col = LEVEL_COLORS[levelFor(day.count, maxCount)];

      ctx.fillStyle = shade(col, -28);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cell * 0.9, y + cell * 0.5);
      ctx.lineTo(x + cell * 0.9, y + cell * 0.5 - h);
      ctx.lineTo(x, y - h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = shade(col, -45);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - cell * 0.9, y + cell * 0.5);
      ctx.lineTo(x - cell * 0.9, y + cell * 0.5 - h);
      ctx.lineTo(x, y - h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(top.x + cell * 0.9, top.y + cell * 0.5);
      ctx.lineTo(top.x, top.y + cell);
      ctx.lineTo(top.x - cell * 0.9, top.y + cell * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(93, 232, 240, 0.85)';
    ctx.fillText(`@${payload.username}`, 6, 12);
    ctx.fillStyle = 'rgba(189, 239, 242, 0.7)';
    ctx.fillText(`${payload.totalContributions.toLocaleString()} / yr`, 6, 22);
  }, [payload, width]);

  if (err) {
    return (
      <div className="secondary-card-contrib secondary-card-contrib--err">
        <span className="secondary-card-link-prefix">SYS://</span>
        <span className="secondary-card-link-label">GH OFFLINE</span>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="secondary-card-contrib secondary-card-contrib--load">
        <span className="secondary-card-link-prefix">SYS://</span>
        <span className="secondary-card-link-label">SYNCING…</span>
      </div>
    );
  }

  return (
    <div className="secondary-card-contrib">
      <canvas ref={canvasRef} aria-label={`${payload.username} GitHub contributions`} />
    </div>
  );
}

function shade(hex: string, delta: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + delta));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + delta));
  const b = Math.max(0, Math.min(255, (n & 255) + delta));
  return `rgb(${r},${g},${b})`;
}
