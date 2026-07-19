import {
  ASPECT_DEFS,
  AYANAMSAS,
  BODIES,
  CHART_TYPES,
  HOUSE_SYSTEMS,
  SATELLITE_GROUPS,
  type BodyId,
} from '../lib/types';
import { formatClock, formatLon, formatUtc, degDelta } from '../lib/math';
import { SPEEDS, useObservatory } from '../state/ObservatoryContext';
import { useEffect, useMemo, useState } from 'react';

function toLocalInput(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toLocalDateOnly(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toLocalTimeOnly(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toTextDate(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toTextTime(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function ObservatoryHud() {
  const o = useObservatory();
  const selected = o.chart.planets.find((p) => p.id === o.selectedPlanet);
  const visibleBodies = o.chart.planets.filter((p) => o.enabledBodies[p.id as BodyId] !== false);

  // --- zodiac date helpers ---
  const onDateOnly = (value: string) => {
    if (!value) return;
    const cur = o.time;
    const [y, m, day] = value.split('-').map(Number);
    if (!y || !m || !day) return;
    const nd = new Date(cur);
    nd.setFullYear(y, m - 1, day);
    o.setTime(nd);
  };
  const onTimeOnly = (value: string) => {
    if (!value) return;
    const parts = value.split(':').map(Number);
    const hh = parts[0], mm = parts[1] ?? 0, ss = parts[2] ?? 0;
    if (Number.isNaN(hh)) return;
    const nd = new Date(o.time);
    nd.setHours(hh, mm, ss, 0);
    o.setTime(nd);
  };
  const onYearSlider = (yr: number) => {
    const nd = new Date(o.time);
    nd.setFullYear(yr);
    o.setTime(nd);
  };
  const onTextDate = (value: string) => {
    // accept YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return;
    onDateOnly(value.trim());
  };
  const onTextTime = (value: string) => {
    // accept HH:MM[:SS]
    const m = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return;
    const hh = Number(m[1]), mm = Number(m[2]), ss = Number(m[3] ?? 0);
    if (hh > 23 || mm > 59 || ss > 59) return;
    const nd = new Date(o.time);
    nd.setHours(hh, mm, ss, 0);
    o.setTime(nd);
  };
  const onTextDateTime = (value: string) => {
    // ISO or YYYY-MM-DD HH:MM:SS
    const cleaned = value.trim().replace(' ', 'T');
    const d = new Date(cleaned);
    if (!Number.isNaN(d.getTime())) o.setTime(d);
  };

  const dateOnly = toLocalDateOnly(o.time);
  const timeOnly = toLocalTimeOnly(o.time);
  const textDate = toTextDate(o.time);
  const textTime = toTextTime(o.time);
  const dateInputValue = toLocalInput(o.time);

  // place search
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const searchPlace = async () => {
    const q = placeQuery.trim();
    if (!q) return;
    setPlaceLoading(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      setPlaceResults(Array.isArray(j) ? j : []);
    } catch { setPlaceResults([]); }
    setPlaceLoading(false);
  };

  // sat list from global (functional)
  const [satList, setSatList] = useState<any[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      const g: any = (window as any).__OBS_SATS__;
      if (g && g.length) {
        const q = o.satSearch.toLowerCase().trim();
        let filtered = g;
        if (q) filtered = g.filter((s: any) => s.name.toLowerCase().includes(q) || s.group.includes(q));
        else filtered = g;
        // filter by enabled groups
        filtered = filtered.filter((s: any) => (o.enabledSatGroups as any)[s.group]);
        setSatList(filtered.slice(0, 80));
      }
    }, 800);
    return () => clearInterval(id);
  }, [o.satSearch, o.enabledSatGroups]);

  // natal comparison
  const natalComparison = useMemo(() => {
    const natal = (o as any).natalChart;
    if (!natal) return [];
    const curMap = new Map(o.chart.planets.map((p: any) => [p.id, p]));
    const rows: { id: string; name: string; natalLon: number; curLon: number; delta: number }[] = [];
    for (const np of natal.planets) {
      const cp = curMap.get(np.id) as any;
      if (!cp) continue;
      if (np.id === 'Earth') continue;
      const delta = degDelta(np.lon, cp.lon);
      rows.push({ id: np.id, name: np.name, natalLon: np.lon, curLon: cp.lon, delta });
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [o.chart, (o as any).natalChart]);

  if (!o.hudOpen) {
    return (
      <div className="obs-hud obs-hud--collapsed">
        <button type="button" className="obs-fab" onClick={() => o.setHudOpen(true)}>SYSTEMS</button>
      </div>
    );
  }

  const bodyGroups = Array.from(new Set(BODIES.map((b) => b.group))) as string[];

  return (
    <div className="obs-hud obs-hud--unified" aria-label="Observatory controls">
      <header className="obs-top obs-top--unified">
        <div className="obs-brand">
          <div className="obs-wordmark">OBSERVATORY</div>
          <div className="obs-sub">{o.zodiac} · {o.houseSystem} · {o.chart.chartType} · {o.chart.engine} {o.swissVersion ?? ''} · {visibleBodies.length} bodies</div>
        </div>
        <div className="obs-top-center">
          <span className="obs-pill">{formatUtc(o.time)}</span>
          <span className="obs-pill">{o.chart.ayanamsa.toFixed(3)}°</span>
        </div>
        <div className="obs-top-right">
          <button type="button" className="obs-icon-btn" onClick={() => o.setHudOpen(false)} title="Collapse">✕</button>
        </div>
      </header>

      <aside className="obs-left">
        <div className="obs-tabs" role="tablist" aria-label="System panels">
          {(
            [
              ['zodiac', 'Zodiac'],
              ['houses', 'Houses'],
              ['bodies', 'Bodies'],
              ['aspects', 'Aspects'],
              ['chart', 'Chart'],
              ['layers', 'Layers'],
              ['satellites', 'Sats'],
              ['anchors', 'Anchors'],
              ['observer', 'Place'],
              ['advanced', 'Advanced'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={o.systemsPanel === id} className={o.systemsPanel === id ? 'is-active' : ''} onClick={() => (o as any).setSystemsPanel(id)}>{label}</button>
          ))}
        </div>

        {o.systemsPanel === 'zodiac' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ZODIAC SYSTEM</div>
            <div className="obs-seg">
              {(['tropical', 'sidereal', 'draconic', 'heliocentric'] as const).map((z) => (
                <button key={z} type="button" className={o.zodiac === z ? 'is-active' : ''} onClick={() => o.setZodiac(z)}>{z}</button>
              ))}
            </div>
            <label className="obs-field">
              <span>Ayanamsa ({AYANAMSAS.length})</span>
              <select value={o.ayanamsaId} disabled={o.zodiac !== 'sidereal'} onChange={(e) => o.setAyanamsaId(Number(e.target.value))}>
                {AYANAMSAS.map((a) => (<option key={a.id} value={a.id}>{a.id}. {a.label} [{a.group}]</option>))}
              </select>
            </label>
            {o.zodiac === 'sidereal' && <div className="obs-muted">Ayanamsa {o.chart.ayanamsa.toFixed(6)}°</div>}

            <div className="obs-panel-hd" style={{ marginTop: '0.9rem' }}>DATE & TIME — granular</div>
            <div className="obs-tip">Use calendar picker or type. Text inputs accept YYYY-MM-DD and HH:MM:SS. Local time.</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <label className="obs-field">
                <span>Calendar date</span>
                <input className="obs-input--themed" type="date" value={dateOnly} min="1800-01-01" max="2100-12-31" onChange={(e) => onDateOnly(e.target.value)} />
              </label>
              <label className="obs-field">
                <span>Clock time</span>
                <input className="obs-input--themed" type="time" value={timeOnly} step={60} onChange={(e) => onTimeOnly(e.target.value)} />
              </label>
            </div>

            <label className="obs-field">
              <span>Datetime picker (themed dark)</span>
              <input className="obs-input--themed" type="datetime-local" value={dateInputValue} min="1800-01-01T00:00" max="2100-12-31T23:59" onChange={(e) => { if (e.target.value) o.setTime(new Date(e.target.value)); }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <label className="obs-field">
                <span>Type date YYYY-MM-DD</span>
                <input className="obs-input--themed" type="text" inputMode="numeric" placeholder="2026-07-19" defaultValue={textDate} onBlur={(e) => onTextDate(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onTextDate((e.target as HTMLInputElement).value); }} />
              </label>
              <label className="obs-field">
                <span>Type time HH:MM[:SS]</span>
                <input className="obs-input--themed" type="text" inputMode="numeric" placeholder="21:40:00" defaultValue={textTime} onBlur={(e) => onTextTime(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onTextTime((e.target as HTMLInputElement).value); }} />
              </label>
            </div>

            <label className="obs-field">
              <span>Type full datetime (ISO)</span>
              <input className="obs-input--themed" type="text" placeholder="2026-07-19T21:40:00" defaultValue={toLocalInput(o.time)} onBlur={(e) => onTextDateTime(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onTextDateTime((e.target as HTMLInputElement).value); }} />
            </label>

            <label className="obs-field">
              <span>Year slider 1800–2100</span>
              <input type="range" min={1800} max={2100} step={1} value={o.time.getFullYear()} onChange={(e) => onYearSlider(Number(e.target.value))} />
              <span className="obs-muted">{o.time.getFullYear()}</span>
            </label>

            <div className="obs-seg" style={{ marginTop: '0.6rem' }}>
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={o.speed === s ? 'is-active' : ''} onClick={() => o.setSpeed(s)}>{s === 0 ? '⏸' : s === 1 ? '1×' : `${s}`}</button>
              ))}
            </div>
            <div className="obs-tip">Tip: Pause to inspect a moment. Use 60× to watch Earth spin. Drag canvas to pivot around focus.</div>
          </section>
        )}

        {o.systemsPanel === 'houses' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">HOUSES ({HOUSE_SYSTEMS.length})</div>
            <div className="obs-tip">House system changes ascendant projection. Try Placidus vs Whole sign.</div>
            <div className="obs-radio-list">
              {HOUSE_SYSTEMS.map((h) => (
                <label key={h.id} className={`obs-radio ${o.houseSystem === h.id ? 'is-active' : ''}`}>
                  <input type="radio" name="house-system" checked={o.houseSystem === h.id} onChange={() => o.setHouseSystem(h.id)} />
                  <span className="code">{h.id}</span><span>{h.label}</span><span className="tag">{h.group}</span>
                </label>
              ))}
            </div>
            <div className="obs-muted">ASC {formatLon(o.chart.asc)} · MC {formatLon(o.chart.mc)} · Vx {formatLon(o.chart.vertex)}</div>
          </section>
        )}

        {o.systemsPanel === 'bodies' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">BODIES ({BODIES.length})</div>
            <div className="obs-tip">Toggle planets. Earth & Sun always stay visible so focus never breaks.</div>
            <div className="obs-chip-row" style={{ flexWrap: 'wrap' }}>
              {bodyGroups.map((g) => (
                <button key={g} type="button" className="obs-mini" onClick={() => {
                  const isAllOn = BODIES.filter((b) => b.group === g).every((b) => o.enabledBodies[b.id as BodyId] !== false);
                  for (const b of BODIES.filter((x) => x.group === g)) o.setBodyEnabled(b.id as BodyId, !isAllOn);
                }}>{g}</button>
              ))}
            </div>
            {BODIES.map((b) => (
              <label key={b.id} className="obs-toggle">
                <input type="checkbox" checked={!!o.enabledBodies[b.id as BodyId]} onChange={() => o.toggleBody(b.id as BodyId)} />
                <span className="dot" style={{ background: b.color }} /><span>{b.label}</span><span className="tag">{b.group}</span>
              </label>
            ))}
          </section>
        )}

        {o.systemsPanel === 'aspects' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ASPECTS ({ASPECT_DEFS.length}) · orb ×{o.orbScale.toFixed(1)}</div>
            <div className="obs-tip">Lines connect planets. Hover a line to read angle.</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('ptolemaic', true)}>Ptolemaic on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('minor', true)}>Minor on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('harmonic', true)}>Harmonic on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('declination', true)}>Declination on</button>
            </div>
            <label className="obs-field">
              <span>Orb scale</span>
              <input type="range" min={0.25} max={2} step={0.05} value={o.orbScale} onChange={(e) => o.setOrbScale(Number(e.target.value))} />
            </label>
            {ASPECT_DEFS.map((a) => (
              <label key={a.id} className="obs-toggle">
                <input type="checkbox" checked={!!o.enabledAspects[a.id]} onChange={() => o.toggleAspect(a.id)} />
                <span className="swatch" style={{ background: a.color }} /><span>{a.label}</span><span className="tag">{a.angle.toFixed(1)}° {a.family}</span>
              </label>
            ))}
          </section>
        )}

        {o.systemsPanel === 'chart' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">CHART TYPE & NATAL COMPARE</div>
            <div className="obs-tip">Set your birth moment, then compare natal vs current sky. Use Place tab for birth location.</div>
            <div className="obs-radio-list">
              {CHART_TYPES.map((c) => (
                <label key={c.id} className={`obs-radio ${o.chartType === c.id ? 'is-active' : ''}`}>
                  <input type="radio" name="chart-type" checked={o.chartType === c.id} onChange={() => o.setChartType(c.id)} />
                  <span>{c.label}</span><span className="tag">{c.needsBirth ? 'birth' : 'moment'}{c.needsSecond ? '+2nd' : ''}</span>
                </label>
              ))}
            </div>
            <label className="obs-field">
              <span>Birth datetime (natal)</span>
              <input className="obs-input--themed" type="datetime-local" value={toLocalInput(o.birthDate)} onChange={(e) => o.setBirthDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <label className="obs-field">
              <span>Type birth datetime</span>
              <input className="obs-input--themed" type="text" placeholder="1996-04-15T08:30:00" defaultValue={toLocalInput(o.birthDate)} onBlur={(e) => o.setBirthDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <label className="obs-field">
              <span>Second datetime (synastry/composite/davison)</span>
              <input className="obs-input--themed" type="datetime-local" value={toLocalInput(o.secondDate)} onChange={(e) => o.setSecondDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <div className="obs-field">
              <span>Second observer</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <input className="obs-input--themed" type="number" step={0.0001} value={o.secondObserver.lat} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lat: Number(e.target.value) })} placeholder="lat" />
                <input className="obs-input--themed" type="number" step={0.0001} value={o.secondObserver.lon} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lon: Number(e.target.value) })} placeholder="lon" />
              </div>
            </div>
            <label className="obs-field">
              <span>Fortune formula</span>
              <select value={o.fortuneFormula} onChange={(e) => o.setFortuneFormula(e.target.value as any)}>
                <option value="auto">Auto day/night</option><option value="day">Day</option><option value="night">Night</option>
              </select>
            </label>

            {/* Natal vs Current comparison table */}
            {(o as any).natalChart && (
              <div style={{ marginTop: '1rem' }}>
                <div className="obs-panel-hd">NATAL vs CURRENT — Δ longitude</div>
                <div className="obs-muted">Birth set. Compare your natal positions to observatory time.</div>
                <div style={{ maxHeight: '260px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.5rem', marginTop: '0.45rem' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ color: '#94a3b8', textAlign: 'left' }}><th style={{ padding: '4px 6px' }}>Body</th><th>Natal</th><th>Now</th><th>Δ</th></tr></thead>
                    <tbody>
                      {natalComparison.map((r) => (
                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <td style={{ padding: '3px 6px' }}>{r.name}</td>
                          <td>{r.natalLon.toFixed(1)}°</td>
                          <td>{r.curLon.toFixed(1)}°</td>
                          <td style={{ color: Math.abs(r.delta) < 3 ? '#4ade80' : '#94a3b8' }}>{r.delta.toFixed(1)}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {o.systemsPanel === 'layers' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">LAYERS — Earth data</div>
            <div className="obs-tip">Each layer has distinct design. Winds = cyan arrows. Quakes = octahedron. Storms = torus swirl.</div>
            <div style={{ display: 'grid', gap: '0.15rem' }}>
              {(
                [
                  ['planets', 'Planets', 'Orbiting bodies with NASA 2K textures'],
                  ['orbits', 'Orbits', 'Helio paths reactive to zodiac'],
                  ['constellations', 'Constellations', 'Faint sky lines'],
                  ['aspects', 'Aspect lines', 'Angle connections'],
                  ['houses', 'Houses', 'House cusps overlay'],
                  ['labels', 'Labels', 'Names for planets & geo progressive'],
                  ['satellites', 'Satellites', '7200 color-coded points'],
                  ['missions', 'Missions', 'Earth-orbit fleet markers'],
                  ['earthquakes', 'Quakes USGS', 'Octahedron + glow, size = mag'],
                  ['eonet', 'Disasters EONET', 'All NASA events'],
                  ['storms', 'Storms', 'Torus swirl cyan'],
                  ['wildfires', 'Wildfires', 'Tetra orange flicker'],
                  ['volcanoes', 'Volcanoes', 'Cone + smoke'],
                  ['clouds', 'Clouds', 'Photoreal layer'],
                  ['winds', 'Winds', 'Arrows + dots, highly visible'],
                  ['traffic', 'Traffic', 'Pulse rings pink'],
                  ['astroCartography', 'Astro-Cartography', 'MC/IC/Asc/Desc lines'],
                  ['cities', 'Geo labels', 'Continents→countries→cities by zoom'],
                ] as const
              ).map(([k, label, desc]) => (
                <label key={k} className="obs-toggle obs-toggle--with-desc">
                  <input type="checkbox" checked={!!(o.layers as any)[k]} onChange={() => o.toggleLayer(k as any)} />
                  <span className="obs-toggle-main"><span>{label}</span><span className="obs-toggle-desc">{desc}</span></span>
                </label>
              ))}
            </div>
          </section>
        )}

        {o.systemsPanel === 'observer' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">PLACE — observer location</div>
            <div className="obs-tip">Your lat/lon anchors astrology & local sky. Search city name to geocode via OpenStreetMap.</div>

            <label className="obs-field">
              <span>Search city / place (geocode)</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input className="obs-input--themed" type="text" value={placeQuery} placeholder="Tokyo, New York, Berlin..." onChange={(e) => setPlaceQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchPlace(); }} style={{ flex: 1 }} />
                <button type="button" className="obs-mini" onClick={searchPlace}>{placeLoading ? '...' : 'Search'}</button>
              </div>
            </label>
            {placeResults.length > 0 && (
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.6rem' }}>
                {placeResults.map((r: any) => (
                  <button key={r.place_id} type="button" className="obs-planet-row" style={{ width: '100%', textAlign: 'left' }} onClick={() => { o.setObserver({ lat: Number(r.lat), lon: Number(r.lon), alt: 10 }); setPlaceResults([]); setPlaceQuery(r.display_name); }}>
                    <span className="name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{r.display_name}</span><span className="lon">{Number(r.lat).toFixed(3)}, {Number(r.lon).toFixed(3)}</span>
                  </button>
                ))}
              </div>
            )}

            <label className="obs-field"><span>Lat — north/south</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lat} onChange={(e) => o.setObserver({ ...o.observer, lat: Number(e.target.value) })} /></label>
            <label className="obs-field"><span>Lon — east/west</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lon} onChange={(e) => o.setObserver({ ...o.observer, lon: Number(e.target.value) })} /></label>
            <label className="obs-field"><span>Alt m — elevation</span><input className="obs-input--themed" type="number" step={10} value={o.observer.alt ?? 10} onChange={(e) => o.setObserver({ ...o.observer, alt: Number(e.target.value) })} /></label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => o.setObserver({ lat: pos.coords.latitude, lon: pos.coords.longitude, alt: 10 })); }}>📍 GPS</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 40.7128, lon: -74.006, alt: 10 })}>NYC</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 51.5074, lon: -0.1278, alt: 10 })}>London</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 35.68, lon: 139.76, alt: 10 })}>Tokyo</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: -23.55, lon: -46.63, alt: 10 })}>São Paulo</button>
            </div>
            <div className="obs-muted">Tip: Set place before birth date so natal houses use correct location.</div>
          </section>
        )}

        {o.systemsPanel === 'advanced' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ADVANCED</div>
            <div className="obs-tip">Fine-tune calculation modes. Most users keep defaults.</div>
            <label className="obs-toggle"><input type="checkbox" checked={o.topocentric} onChange={(e) => o.setTopocentric(e.target.checked)} /><span>Topocentric (Moon parallax)</span></label>
            <label className="obs-toggle"><input type="checkbox" checked={o.heliocentric} onChange={(e) => o.setHeliocentric(e.target.checked)} /><span>Heliocentric override</span></label>
            <div className="obs-field">
              <span>Node mode</span>
              <div className="obs-seg"><button type="button" className={o.nodeMode === 'mean' ? 'is-active' : ''} onClick={() => o.setNodeMode('mean')}>Mean</button><button type="button" className={o.nodeMode === 'true' ? 'is-active' : ''} onClick={() => o.setNodeMode('true')}>True</button></div>
            </div>
            <div className="obs-field">
              <span>Lilith mode</span>
              <div className="obs-seg">
                {(['mean', 'true', 'both', 'off'] as const).map((m) => (
                  <button key={m} type="button" className={o.lilithMode === m ? 'is-active' : ''} onClick={() => (o as any).setLilithMode(m)}>{m}</button>
                ))}
              </div>
            </div>
            <div className="obs-muted">Swiss {o.swissVersion} ready {o.swissReady ? 'yes' : 'no'} — range 1800-2100</div>
          </section>
        )}

        {o.systemsPanel === 'satellites' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">SATELLITES — color-coded owner groups</div>
            <div className="obs-tip">Click a satellite point in 3D or pick from list. Follow locks camera. Track shows ground projection.</div>
            <div className="obs-field"><span>Search name/group</span><input className="obs-input--themed" type="text" value={o.satSearch} placeholder="STARLINK, ONEWEB, GPS..." onChange={(e) => o.setSatSearch(e.target.value)} /></div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(true)}>All on</button>
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(false)}>All off</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowGroundTrack(!o.showGroundTrack)}>{o.showGroundTrack ? 'Track ●' : 'Track ○'}</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowOrbitTrail(!o.showOrbitTrail)}>{o.showOrbitTrail ? 'Trail ●' : 'Trail ○'}</button>
              <button type="button" className={`obs-mini ${o.followSat ? 'is-active' : ''}`} onClick={() => o.setFollowSat(!o.followSat)}>{o.followSat ? 'Following' : 'Follow off'}</button>
            </div>

            <div style={{ margin: '0.6rem 0', display: 'grid', gap: '0.22rem' }}>
              {SATELLITE_GROUPS.map((g) => (
                <label key={g.id} className="obs-toggle">
                  <input type="checkbox" checked={!!(o.enabledSatGroups as any)[g.id]} onChange={() => (o as any).toggleSatGroup(g.id as any)} />
                  <span className="dot" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
                  <span>{g.label}</span><span className="tag">{g.owner} · {g.count}</span>
                </label>
              ))}
            </div>

            {o.selectedSatId && (
              <div className="obs-note">
                <b>{o.selectedSatId}</b> selected<br />
                {o.followSat ? 'Camera following — drag to override briefly' : 'Click Follow to lock camera'}<br />
                Track {o.showGroundTrack ? 'visible' : 'hidden'} · Trail {o.showOrbitTrail ? 'visible' : 'hidden'}
                <div style={{ marginTop: '0.4rem' }}><button type="button" className="obs-mini" onClick={() => o.setSelectedSatId(null)}>Clear selection</button></div>
              </div>
            )}

            <div className="obs-panel-hd" style={{ marginTop: '0.8rem' }}>VISIBLE SATS — {satList.length} first</div>
            <div className="obs-tip">Pick to focus. 7200 total — filtered by search & owner.</div>
            <div style={{ maxHeight: '220px', overflow: 'auto', display: 'grid', gap: '0.18rem' }}>
              {satList.map((s: any) => (
                <button key={s.id} type="button" className={`obs-planet-row ${o.selectedSatId === s.id ? 'is-active' : ''}`} onClick={() => o.setSelectedSatId(s.id)}>
                  <span className="dot" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                  <span className="name" style={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{s.name}</span>
                  <span className="lon" style={{ fontSize: '10px' }}>{s.group}</span>
                </button>
              ))}
              {satList.length === 0 && <div className="obs-muted">No sats — enable groups or clear search.</div>}
            </div>
          </section>
        )}

        {o.systemsPanel === 'anchors' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">PLANET ANCHORS</div>
            <div className="obs-tip">Anchor moves camera to planet. Earth anchor shows progressive geography: continents at distance, countries closer, cities when very close.</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-solar'))}>☀️ Solar overview</button>
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-earth'))}>🌍 Earth</button>
            </div>
            {['Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Sun'].map((id) => (
              <button key={id} type="button" className="obs-planet-row" onClick={() => { o.setAnchorPlanet(id as any); window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id } })); }}>
                <span className="dot" style={{ background: (BODIES.find((b) => b.id === id)?.color ?? '#38bdf8') }} />
                <span className="name">Focus {id}</span><span className="lon">{o.anchorPlanet === id ? 'active' : 'anchor'}</span>
              </button>
            ))}
            <div className="obs-muted">Tip: Scroll to zoom — labels appear as you get close. Click any planet mesh to anchor.</div>
          </section>
        )}
      </aside>

      <aside className="obs-right">
        <section className="obs-panel obs-panel--clock">
          <div className="obs-panel-hd">TIME — live</div>
          <div className="obs-mono">{formatUtc(o.time)}</div>
          <div className="obs-mono">{formatClock(o.time)}</div>
          <div className="obs-tip">Drag to orbit · Scroll zoom · Click to anchor</div>
        </section>

        <section className="obs-panel obs-panel--planets">
          <div className="obs-panel-hd">PLANETS ({visibleBodies.length})</div>
          {visibleBodies.slice(0, 40).map((p) => (
            <button key={p.id} type="button" className={`obs-planet-row ${o.selectedPlanet === p.id ? 'is-active' : ''}`} onClick={() => o.setSelectedPlanet(p.id)}>
              <span className="dot" style={{ background: p.color }} /><span className="name">{p.name}</span><span className="lon">{formatLon(p.lon)}{p.retro ? ' ℞' : ''}</span>
            </button>
          ))}
        </section>

        <section className="obs-panel obs-panel--aspects">
          <div className="obs-panel-hd">ASPECTS ({o.chart.aspects.length})</div>
          {o.chart.aspects.slice(0, 30).map((a, i) => (
            <div key={i} className="obs-aspect-row"><span className="swatch" style={{ background: a.color }} /><span className="txt">{a.label}</span><span className="delta">{a.delta.toFixed(2)}°</span></div>
          ))}
        </section>

        {selected && (
          <section className="obs-panel">
            <div className="obs-panel-hd">{selected.name}</div>
            <div className="obs-mono">Lon {formatLon(selected.lon)} lat {selected.lat.toFixed(2)}° {selected.distAu.toFixed(3)} AU</div>
            <div className="obs-tip">Click focus in anchors bar to fly there. Toggle visibility in Bodies.</div>
          </section>
        )}
      </aside>
    </div>
  );
}
