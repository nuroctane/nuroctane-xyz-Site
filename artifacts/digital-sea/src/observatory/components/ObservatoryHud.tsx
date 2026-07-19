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

export function ObservatoryHud() {
  const o = useObservatory();
  const selected = o.chart.planets.find((p) => p.id === o.selectedPlanet);
  const visibleBodies = o.chart.planets.filter((p) => o.enabledBodies[p.id as BodyId] !== false);

  const dateInputValue = toLocalInput(o.time);

  const onYear = (yr: number) => {
    const nd = new Date(o.time);
    nd.setFullYear(yr);
    o.setTime(nd);
  };

  // place search
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const searchPlace = async () => {
    const q = placeQuery.trim();
    if (!q) return;
    setPlaceLoading(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      setPlaceResults(Array.isArray(j) ? j : []);
    } catch { setPlaceResults([]); }
    setPlaceLoading(false);
  };

  // sats
  const [satList, setSatList] = useState<any[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      const g: any = (window as any).__OBS_SATS__;
      if (g && g.length) {
        const q = o.satSearch.toLowerCase().trim();
        let filtered = g;
        if (q) filtered = g.filter((s: any) => s.name.toLowerCase().includes(q) || s.group.includes(q));
        filtered = filtered.filter((s: any) => (o.enabledSatGroups as any)[s.group]);
        setSatList(filtered.slice(0, 60));
      }
    }, 900);
    return () => clearInterval(id);
  }, [o.satSearch, o.enabledSatGroups]);

  const natalComparison = useMemo(() => {
    const natal = (o as any).natalChart;
    if (!natal) return [];
    const curMap = new Map(o.chart.planets.map((p: any) => [p.id, p]));
    const rows: any[] = [];
    for (const np of natal.planets) {
      const cp = curMap.get(np.id) as any;
      if (!cp || np.id === 'Earth') continue;
      rows.push({ id: np.id, name: np.name, natalLon: np.lon, curLon: cp.lon, delta: degDelta(np.lon, cp.lon) });
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
          <div className="obs-sub">{visibleBodies.length} bodies · {o.chart.aspects.length} aspects</div>
        </div>
        <div className="obs-top-center">
          <span className="obs-pill">{formatUtc(o.time)}</span>
        </div>
        <div className="obs-top-right">
          <button type="button" className="obs-icon-btn" onClick={() => o.setHudOpen(false)}>✕</button>
        </div>
      </header>

      <aside className="obs-left">
        <div className="obs-tabs" role="tablist">
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
            <div className="obs-panel-hd">ZODIAC</div>
            <div className="obs-seg">
              {(['tropical', 'sidereal', 'draconic', 'heliocentric'] as const).map((z) => (
                <button key={z} type="button" className={o.zodiac === z ? 'is-active' : ''} onClick={() => o.setZodiac(z)}>{z}</button>
              ))}
            </div>
            {o.zodiac === 'sidereal' && (
              <label className="obs-field">
                <span>Ayanamsa</span>
                <select value={o.ayanamsaId} onChange={(e) => o.setAyanamsaId(Number(e.target.value))}>
                  {AYANAMSAS.map((a) => (<option key={a.id} value={a.id}>{a.label}</option>))}
                </select>
              </label>
            )}

            <div className="obs-panel-hd" style={{ marginTop: '0.9rem' }}>DATE & TIME</div>
            <div className="obs-date-card">
              <label className="obs-field">
                <span>Date & time</span>
                <input className="obs-input--themed" type="datetime-local" value={dateInputValue} min="1800-01-01T00:00" max="2100-12-31T23:59" onChange={(e) => { if (e.target.value) o.setTime(new Date(e.target.value)); }} />
              </label>
              <label className="obs-field">
                <span>Year</span>
                <input type="range" min={1800} max={2100} step={1} value={o.time.getFullYear()} onChange={(e) => onYear(Number(e.target.value))} />
              </label>
              <div className="obs-seg">
                {SPEEDS.map((s) => (
                  <button key={s} type="button" className={o.speed === s ? 'is-active' : ''} onClick={() => o.setSpeed(s)}>{s === 0 ? '⏸' : s === 1 ? '1×' : `${s}`}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {o.systemsPanel === 'houses' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">HOUSES</div>
            <div className="obs-radio-list">
              {HOUSE_SYSTEMS.map((h) => (
                <label key={h.id} className={`obs-radio ${o.houseSystem === h.id ? 'is-active' : ''}`}>
                  <input type="radio" name="house-system" checked={o.houseSystem === h.id} onChange={() => o.setHouseSystem(h.id)} />
                  <span className="code">{h.id}</span><span>{h.label}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {o.systemsPanel === 'bodies' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">BODIES</div>
            <div className="obs-chip-row" style={{ flexWrap: 'wrap' }}>
              {bodyGroups.map((g) => (
                <button key={g} type="button" className="obs-mini" onClick={() => {
                  const allOn = BODIES.filter((b) => b.group === g).every((b) => o.enabledBodies[b.id as BodyId] !== false);
                  for (const b of BODIES.filter((x) => x.group === g)) o.setBodyEnabled(b.id as BodyId, !allOn);
                }}>{g}</button>
              ))}
            </div>
            {BODIES.map((b) => (
              <label key={b.id} className="obs-toggle">
                <input type="checkbox" checked={!!o.enabledBodies[b.id as BodyId]} onChange={() => o.toggleBody(b.id as BodyId)} />
                <span className="dot" style={{ background: b.color }} /><span>{b.label}</span>
              </label>
            ))}
          </section>
        )}

        {o.systemsPanel === 'aspects' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ASPECTS</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('ptolemaic', true)}>Ptolemaic</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('minor', true)}>Minor</button>
            </div>
            <label className="obs-field">
              <span>Orb</span>
              <input type="range" min={0.25} max={2} step={0.05} value={o.orbScale} onChange={(e) => o.setOrbScale(Number(e.target.value))} />
            </label>
            {ASPECT_DEFS.map((a) => (
              <label key={a.id} className="obs-toggle">
                <input type="checkbox" checked={!!o.enabledAspects[a.id]} onChange={() => o.toggleAspect(a.id)} />
                <span className="swatch" style={{ background: a.color }} /><span>{a.label}</span>
              </label>
            ))}
          </section>
        )}

        {o.systemsPanel === 'chart' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">CHART</div>
            <div className="obs-radio-list">
              {CHART_TYPES.map((c) => (
                <label key={c.id} className={`obs-radio ${o.chartType === c.id ? 'is-active' : ''}`}>
                  <input type="radio" name="chart-type" checked={o.chartType === c.id} onChange={() => o.setChartType(c.id)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            <label className="obs-field">
              <span>Birth</span>
              <input className="obs-input--themed" type="datetime-local" value={toLocalInput(o.birthDate)} onChange={(e) => o.setBirthDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <label className="obs-field">
              <span>Second</span>
              <input className="obs-input--themed" type="datetime-local" value={toLocalInput(o.secondDate)} onChange={(e) => o.setSecondDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>

            {(o as any).natalChart && (
              <div style={{ marginTop: '0.8rem' }}>
                <div className="obs-panel-hd">NATAL vs NOW</div>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ color: '#64748b', textAlign: 'left' }}><th style={{ padding: '4px 6px' }}>Body</th><th>Nat</th><th>Now</th><th>Δ</th></tr></thead>
                    <tbody>
                      {natalComparison.map((r) => (
                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '3px 6px' }}>{r.name}</td><td>{r.natalLon.toFixed(0)}°</td><td>{r.curLon.toFixed(0)}°</td><td>{r.delta.toFixed(0)}°</td>
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
            <div className="obs-panel-hd">LAYERS</div>
            {(
              [
                ['planets', 'Planets'],
                ['orbits', 'Orbits'],
                ['labels', 'Labels'],
                ['satellites', 'Satellites'],
                ['earthquakes', 'Quakes'],
                ['eonet', 'EONET'],
                ['storms', 'Storms'],
                ['wildfires', 'Wildfires'],
                ['volcanoes', 'Volcanoes'],
                ['winds', 'Winds'],
                ['clouds', 'Clouds'],
                ['missions', 'Missions'],
                ['traffic', 'Traffic'],
                ['astroCartography', 'AC lines'],
                ['cities', 'Cities'],
                ['constellations', 'Constellations'],
                ['aspects', 'Aspects'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="obs-toggle">
                <input type="checkbox" checked={!!(o.layers as any)[k]} onChange={() => o.toggleLayer(k as any)} />
                <span>{label}</span>
              </label>
            ))}
          </section>
        )}

        {o.systemsPanel === 'observer' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">PLACE</div>
            <label className="obs-field">
              <span>Search</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input className="obs-input--themed" type="text" value={placeQuery} placeholder="City" onChange={(e) => setPlaceQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchPlace(); }} style={{ flex: 1 }} />
                <button type="button" className="obs-mini" onClick={searchPlace}>{placeLoading ? '…' : 'Go'}</button>
              </div>
            </label>
            {placeResults.length > 0 && (
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                {placeResults.map((r: any) => (
                  <button key={r.place_id} type="button" className="obs-planet-row" style={{ width: '100%' }} onClick={() => { o.setObserver({ lat: Number(r.lat), lon: Number(r.lon), alt: 10 }); setPlaceResults([]); setPlaceQuery(r.display_name.split(',')[0]); }}>
                    <span className="name" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            <label className="obs-field"><span>Lat</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lat} onChange={(e) => o.setObserver({ ...o.observer, lat: Number(e.target.value) })} /></label>
            <label className="obs-field"><span>Lon</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lon} onChange={(e) => o.setObserver({ ...o.observer, lon: Number(e.target.value) })} /></label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition((p) => o.setObserver({ lat: p.coords.latitude, lon: p.coords.longitude, alt: 10 })); }}>GPS</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 40.7128, lon: -74.006, alt: 10 })}>NYC</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 51.5074, lon: -0.1278, alt: 10 })}>LDN</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 35.68, lon: 139.76, alt: 10 })}>TKO</button>
            </div>
          </section>
        )}

        {o.systemsPanel === 'advanced' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ADVANCED</div>
            <label className="obs-toggle"><input type="checkbox" checked={o.topocentric} onChange={(e) => o.setTopocentric(e.target.checked)} /><span>Topocentric</span></label>
            <label className="obs-toggle"><input type="checkbox" checked={o.heliocentric} onChange={(e) => o.setHeliocentric(e.target.checked)} /><span>Heliocentric</span></label>
            <div className="obs-field">
              <span>Node</span>
              <div className="obs-seg"><button type="button" className={o.nodeMode === 'mean' ? 'is-active' : ''} onClick={() => o.setNodeMode('mean')}>Mean</button><button type="button" className={o.nodeMode === 'true' ? 'is-active' : ''} onClick={() => o.setNodeMode('true')}>True</button></div>
            </div>
          </section>
        )}

        {o.systemsPanel === 'satellites' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">SATS</div>
            <label className="obs-field"><span>Search</span><input className="obs-input--themed" type="text" value={o.satSearch} placeholder="STARLINK" onChange={(e) => o.setSatSearch(e.target.value)} /></label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(true)}>All</button>
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(false)}>None</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowGroundTrack(!o.showGroundTrack)}>{o.showGroundTrack ? 'Track on' : 'Track off'}</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowOrbitTrail(!o.showOrbitTrail)}>{o.showOrbitTrail ? 'Trail on' : 'Trail off'}</button>
              <button type="button" className={`obs-mini ${o.followSat ? 'is-active' : ''}`} onClick={() => o.setFollowSat(!o.followSat)}>{o.followSat ? 'Follow on' : 'Follow off'}</button>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.2rem' }}>
              {SATELLITE_GROUPS.map((g) => (
                <label key={g.id} className="obs-toggle">
                  <input type="checkbox" checked={!!(o.enabledSatGroups as any)[g.id]} onChange={() => (o as any).toggleSatGroup(g.id)} />
                  <span className="dot" style={{ background: g.color }} /><span>{g.label}</span>
                </label>
              ))}
            </div>
            {o.selectedSatId && <div className="obs-note"><b>{o.selectedSatId}</b><br /><button type="button" className="obs-mini" onClick={() => o.setSelectedSatId(null)}>Clear</button></div>}
            <div className="obs-panel-hd" style={{ marginTop: '0.6rem' }}>LIST</div>
            <div style={{ maxHeight: '180px', overflow: 'auto' }}>
              {satList.map((s: any) => (
                <button key={s.id} type="button" className={`obs-planet-row ${o.selectedSatId === s.id ? 'is-active' : ''}`} onClick={() => o.setSelectedSatId(s.id)}>
                  <span className="dot" style={{ background: s.color }} /><span className="name" style={{ fontSize: '10px' }}>{s.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {o.systemsPanel === 'anchors' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ANCHORS</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-solar'))}>Solar</button>
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-earth'))}>Earth</button>
            </div>
            {['Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Sun'].map((id) => (
              <button key={id} type="button" className="obs-planet-row" onClick={() => { o.setAnchorPlanet(id as any); window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id } })); }}>
                <span className="dot" style={{ background: (BODIES.find((b) => b.id === id)?.color ?? '#38bdf8') }} /><span className="name">{id}</span>
              </button>
            ))}
          </section>
        )}
      </aside>

      <aside className="obs-right">
        <section className="obs-panel obs-panel--clock">
          <div className="obs-panel-hd">TIME</div>
          <div className="obs-mono">{formatUtc(o.time)}</div>
          <div className="obs-mono">{formatClock(o.time)}</div>
        </section>
        <section className="obs-panel obs-panel--planets">
          <div className="obs-panel-hd">PLANETS</div>
          {visibleBodies.slice(0, 30).map((p) => (
            <button key={p.id} type="button" className={`obs-planet-row ${o.selectedPlanet === p.id ? 'is-active' : ''}`} onClick={() => o.setSelectedPlanet(p.id)}>
              <span className="dot" style={{ background: p.color }} /><span className="name">{p.name}</span><span className="lon">{formatLon(p.lon)}</span>
            </button>
          ))}
        </section>
        <section className="obs-panel obs-panel--aspects">
          <div className="obs-panel-hd">ASPECTS</div>
          {o.chart.aspects.slice(0, 20).map((a, i) => (
            <div key={i} className="obs-aspect-row"><span className="swatch" style={{ background: a.color }} /><span className="txt">{a.label}</span></div>
          ))}
        </section>
      </aside>
    </div>
  );
}
