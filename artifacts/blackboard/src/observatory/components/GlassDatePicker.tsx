import { useEffect, useMemo, useRef, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const POP_HEIGHT = 330;

const pad2 = (n: number) => String(n).padStart(2, '0');

export function GlassDatePicker({
  value,
  onChange,
  allowClear,
  minYear = 1800,
  maxYear = 2100,
  placeholder = '— set date —',
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
  allowClear?: boolean;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => (value ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (value ?? new Date()).getMonth());
  const [popPos, setPopPos] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open) {
      const b = value ?? new Date();
      setViewYear(b.getFullYear());
      setViewMonth(b.getMonth());
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const below = rect.bottom + 6;
        const top = below + POP_HEIGHT > window.innerHeight ? Math.max(8, rect.top - POP_HEIGHT - 6) : below;
        const left = Math.min(rect.left, window.innerWidth - 270);
        setPopPos({ left, top });
      }
    }
    setOpen((v) => !v);
  };

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const fmt = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const pickDay = (day: number) => {
    const nd = new Date(value ?? new Date());
    nd.setFullYear(viewYear, viewMonth, day);
    onChange(nd);
  };

  const setTimeStr = (t: string) => {
    if (!t) return;
    const [h, m] = t.split(':').map(Number);
    const nd = new Date(value ?? new Date());
    nd.setHours(h ?? 0, m ?? 0);
    onChange(nd);
  };

  const nav = (dir: number) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < minYear) { y = minYear; m = 0; }
    if (y > maxYear) { y = maxYear; m = 11; }
    setViewMonth(m);
    setViewYear(y);
  };

  const today = new Date();
  const isSel = (d: number) => !!value && value.getFullYear() === viewYear && value.getMonth() === viewMonth && value.getDate() === d;
  const isToday = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  return (
    <div className="obs-dtp" ref={rootRef}>
      <button ref={triggerRef} type="button" className={`obs-dtp-trigger ${open ? 'is-open' : ''}`} onClick={toggleOpen}>
        <span className="obs-dtp-value">{value ? fmt(value) : placeholder}</span>
        <span className="obs-dtp-icon">▾</span>
      </button>
      {open && popPos && (
        <div className="obs-dtp-pop" style={{ left: popPos.left, top: popPos.top }}>
          <div className="obs-dtp-head">
            <button type="button" className="obs-dtp-nav" onClick={() => nav(-1)} aria-label="Previous month">‹</button>
            <div className="obs-dtp-title">
              {MONTHS[viewMonth]}
              <input
                className="obs-dtp-year"
                type="number"
                value={viewYear}
                min={minYear}
                max={maxYear}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  if (Number.isFinite(y) && y >= minYear && y <= maxYear) setViewYear(y);
                }}
              />
            </div>
            <button type="button" className="obs-dtp-nav" onClick={() => nav(1)} aria-label="Next month">›</button>
          </div>
          <div className="obs-dtp-dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="obs-dtp-grid">
            {grid.map((d, i) =>
              d == null ? (
                <span key={i} className="obs-dtp-cell obs-dtp-cell--empty" />
              ) : (
                <button key={i} type="button" className={`obs-dtp-cell ${isSel(d) ? 'is-selected' : ''} ${isToday(d) ? 'is-today' : ''}`} onClick={() => pickDay(d)}>
                  {d}
                </button>
              ),
            )}
          </div>
          <div className="obs-dtp-foot">
            <input
              className="obs-dtp-time"
              type="time"
              value={value ? `${pad2(value.getHours())}:${pad2(value.getMinutes())}` : '12:00'}
              onChange={(e) => setTimeStr(e.target.value)}
            />
            <button type="button" className="obs-mini" onClick={() => onChange(new Date())}>Now</button>
            {allowClear && (
              <button type="button" className="obs-mini" onClick={() => { onChange(null); setOpen(false); }}>Clear</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
