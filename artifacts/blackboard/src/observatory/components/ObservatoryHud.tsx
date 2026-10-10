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
import { GlassDatePicker } from './GlassDatePicker';

type PlaceResult = { place_id: number; display_name: string; lat: string; lon: string };

export function ObservatoryHud() {
  const o = useObservatory();
  const selected = o.chart.planets.find((p) => p.id === o.selectedPlanet);
  const visibleBodies = o.chart.planets.filter((p) => o.enabledBodies[p.id as BodyId] !== false);

  const onYear = (yr: number) => {
    const nd = new Date(o.time);
    nd.setFullYear(yr);
    o.setTime(nd);
  };

  // place search
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const searchPlace = async () => {
    const q = placeQuery.trim();
    if (q.length < 2 || q.length > 120 || placeLoading) return;
    setPlaceLoading(true);
    setPlaceError('');
    try {
      const proxied = await fetch(`/api/observatory/geocode?q=${encodeURIComponent(q)}`);
      if (!proxied.ok) throw new Error('geocode');
      const j = await proxied.json();
      if (!Array.isArray(j)) throw new Error('geocode');
      const rows: PlaceResult[] = j.filter((r) => r && typeof r.display_name === 'string' &&
        Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lon)));
      setPlaceResults(rows);
      if (!rows.length) setPlaceError('No places matched.');
    } catch {
      setPlaceResults([]);
      setPlaceError('Place search is unavailable.');
    }
    setPlaceLoading(false);
  };

  const [satList, setSatList] = useState<any[]>([]);
  const [satTotal, setSatTotal] = useState(0);
  const [satNames, setSatNames] = useState<Map<string, string>>(() => new Map());
  const [satMeta, setSatMeta] = useState<{ count: number; source: string }>({ count: 0, source: 'loading' });
  const [streams, setStreams] = useState<Record<string, { state: string; detail: string }>>({});
  useEffect(() => {
    const rebuild = () => {
      const g: any[] = (window as any).__OBS_SATS__ ?? [];
      const names = new Map<string, string>();
      for (const s of g) names.set(String(s.id), String(s.name));
      setSatNames(names);
      const q = o.satSearch.toLowerCase().trim();
      const filtered = g.filter((s) => (o.enabledSatGroups as any)[s.group] && (!q || s.name.toLowerCase().includes(q) || s.group.includes(q) || String(s.id).includes(q)));
      setSatTotal(filtered.length);
      setSatList(filtered.slice(0, 120));
    };
    const onCatalog = (ev: Event) => {
      const detail = (ev as CustomEvent).detail ?? {};
      setSatMeta({ count: Number(detail.count ?? 0), source: String(detail.source ?? 'snapshot') });
      rebuild();
    };
    const onStream = (ev: Event) => {
      const detail = (ev as CustomEvent).detail ?? {};
      if (!detail.id) return;
      setStreams((prev) => ({ ...prev, [detail.id]: { state: detail.state, detail: detail.detail } }));
    };
    rebuild();
    const boot = (window as any).__OBS_SAT_META__;
    if (boot) setSatMeta({ count: Number(boot.count ?? 0), source: String(boot.source ?? 'snapshot') });
    window.addEventListener('obs-sat-catalog', onCatalog);
    window.addEventListener('obs-stream', onStream);
    return () => {
      window.removeEventListener('obs-sat-catalog', onCatalog);
      window.removeEventListener('obs-stream', onStream);
    };
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
          <div className="obs-sub">{visibleBodies.length} bodies · {o.chart.aspects.length} aspects{satMeta.count ? ` · ${satMeta.count} sats` : ''}{satMeta.source === 'loading' ? '' : satMeta.source === 'live' ? ' · live TLE' : satMeta.source === 'mixed' ? ' · live + snapshot TLE' : satMeta.count ? ' · snapshot TLE' : ''}</div>
        </div>
        <div className="obs-top-center">
          <span className="obs-pill">{formatUtc(o.time)}</span>
        </div>
        <div className="obs-top-right">
          <button type="button" className="obs-icon-btn" aria-label="Hide Observatory controls" onClick={() => o.setHudOpen(false)}>✕</button>
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
                <GlassDatePicker value={o.time} onChange={(d) => { if (d) o.setTime(d); }} />
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
              <GlassDatePicker value={o.birthDate} onChange={(d) => o.setBirthDate(d)} allowClear placeholder="— set birth —" />
            </label>
            <label className="obs-field">
              <span>Second</span>
              <GlassDatePicker value={o.secondDate} onChange={(d) => o.setSecondDate(d)} allowClear placeholder="— set second —" />
            </label>

            {(o as any).natalChart && (
              <div style={{ marginTop: '0.8rem' }}>
                <div className="obs-panel-hd">NATAL vs NOW</div>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ color: 'var(--ink-dim)', textAlign: 'left' }}><th style={{ padding: '4px 6px' }}>Body</th><th>Nat</th><th>Now</th><th>Δ</th></tr></thead>
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
                ['earthquakes', 'Quakes'],
                ['eonet', 'EONET'],
                ['storms', 'Storms'],
                ['wildfires', 'Wildfires'],
                ['volcanoes', 'Volcanoes'],
                ['winds', 'Winds'],
                ['clouds', 'Clouds'],
                ['missions', 'Missions'],
                ['astroCartography', 'AC lines'],
                ['cities', 'Cities'],
                ['constellations', 'Constellations'],
                ['aspects', 'Aspects'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="obs-toggle">
                <input type="checkbox" checked={!!(o.layers as any)[k]} onChange={() => o.toggleLayer(k as any)} />
                <span>{label}</span>
                {k === 'earthquakes' && streams.quakes && <span className="obs-stream">{streams.quakes.detail}</span>}
                {k === 'eonet' && streams.eonet && <span className="obs-stream">{streams.eonet.detail}</span>}
                {k === 'winds' && streams.wind && <span className="obs-stream">{streams.wind.detail}</span>}
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
                <button type="button" className="obs-mini" disabled={placeLoading} onClick={searchPlace}>{placeLoading ? '…' : 'Go'}</button>
              </div>
            </label>
            {placeError && <div className="obs-note">{placeError}</div>}
            {placeResults.length > 0 && (
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                {placeResults.map((r) => (
                  <button key={r.place_id} type="button" className="obs-planet-row" style={{ width: '100%' }} onClick={() => { o.setObserver({ lat: Number(r.lat), lon: Number(r.lon), alt: 10 }); setPlaceResults([]); setPlaceQuery(r.display_name.split(',')[0]); }}>
                    <span className="name" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="obs-note"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></div>
            <label className="obs-field"><span>Lat</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lat} onChange={(e) => o.setObserver({ ...o.observer, lat: Number(e.target.value) })} /></label>
            <label className="obs-field"><span>Lon</span><input className="obs-input--themed" type="number" step={0.0001} value={o.observer.lon} onChange={(e) => o.setObserver({ ...o.observer, lon: Number(e.target.value) })} /></label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => {
                // A denied or unavailable fix used to do nothing at all.
                if (!navigator.geolocation) { setPlaceError('Location is not available in this browser.'); return; }
                setPlaceError('');
                navigator.geolocation.getCurrentPosition(
                  (p) => o.setObserver({ lat: p.coords.latitude, lon: p.coords.longitude, alt: 10 }),
                  (err) => setPlaceError(err.code === err.PERMISSION_DENIED ? 'Location permission was denied.' : 'Could not get your location.'),
                  { timeout: 15_000 },
                );
              }}>GPS</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 40.7128, lon: -74.006, alt: 10 })}>NYC</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 51.5074, lon: -0.1278, alt: 10 })}>LDN</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 35.68, lon: 139.76, alt: 10 })}>TKO</button>
            </div>
          </section>
        )}

        {o.systemsPanel === 'advanced' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ADVANCED</div>
            <div className="obs-field">
              <span>Timezone display</span>
              <div className="obs-seg">
                <button type="button" className={o.timezone === 'utc' ? 'is-active' : ''} onClick={() => o.setTimezone('utc')}>UTC</button>
                <button type="button" className={o.timezone === 'local' ? 'is-active' : ''} onClick={() => o.setTimezone('local')}>Local</button>
                <button type="button" className={o.timezone === 'observer' ? 'is-active' : ''} onClick={() => o.setTimezone('observer')}>Place</button>
              </div>
            </div>
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
            <div className="obs-panel-hd">SATS · {satMeta.source === 'live' ? 'LIVE' : satMeta.source === 'mixed' ? 'LIVE + SNAPSHOT' : satMeta.source === 'loading' ? 'LOADING' : 'SNAPSHOT'}</div>
            <p className="obs-note">CelesTrak orbits, propagated here. Starlink, OneWeb, Planet, and debris stay off until you enable them.</p>
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
            {o.selectedSatId && <div className="obs-note"><b>{satNames.get(o.selectedSatId) ?? o.selectedSatId}</b><br />NORAD {o.selectedSatId}<br /><button type="button" className="obs-mini" onClick={() => o.setSelectedSatId(null)}>Clear</button></div>}
            <div className="obs-panel-hd" style={{ marginTop: '0.6rem' }}>{satTotal > satList.length ? `LIST · ${satList.length} OF ${satTotal}` : 'LIST'}</div>
            <div style={{ maxHeight: '180px', overflow: 'auto' }}>
              {!satList.length && <div className="obs-note">{satMeta.source === 'loading' ? 'Loading orbits…' : 'Nothing in this filter.'}</div>}
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
                <span className="dot" style={{ background: (BODIES.find((b) => b.id === id)?.color ?? '#d5dde6') }} /><span className="name">{id}</span>
              </button>
            ))}
          </section>
        )}
      </aside>

      <aside className="obs-right">
        <section className="obs-panel obs-panel--clock">
          <div className="obs-panel-hd">TIME · {o.timezone.toUpperCase()}</div>
          <div className="obs-mono">{o.timezone === 'local' ? formatClock(o.time) : o.timezone === 'observer' ? (() => { const off = o.observer.lon / 15; const d = new Date(o.time.getTime() + off * 3600000); return `${formatClock(d)} ${off >= 0 ? '+' : ''}${off.toFixed(1)}h`; })() : formatUtc(o.time)}</div>
          <div className="obs-mono" style={{ opacity: 0.7, fontSize: '10px' }}>{o.timezone !== 'utc' ? formatUtc(o.time) : formatClock(o.time)}</div>
          <div className="obs-seg" style={{ marginTop: '0.4rem' }}>
            <button type="button" className={o.timezone === 'utc' ? 'is-active' : ''} onClick={() => o.setTimezone('utc')}>UTC</button>
            <button type="button" className={o.timezone === 'local' ? 'is-active' : ''} onClick={() => o.setTimezone('local')}>Local</button>
            <button type="button" className={o.timezone === 'observer' ? 'is-active' : ''} onClick={() => o.setTimezone('observer')}>Place</button>
          </div>
        </section>
        <section className="obs-panel obs-panel--planets">
          <div className="obs-panel-hd">PLANETS</div>
          {visibleBodies.slice(0, 30).map((p) => (
            <button key={p.id} type="button" className={`obs-planet-row ${o.selectedPlanet === p.id ? 'is-active' : ''}`} onClick={() => { o.setSelectedPlanet(p.id); o.setAnchorPlanet(p.id as any); window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id: p.id } })); }}>
              <span className="dot" style={{ background: p.color }} /><span className="name">{p.name}</span><span className="lon">{formatLon(p.lon)}</span>
            </button>
          ))}
        </section>
        <section className="obs-panel obs-panel--aspects">
          <div className="obs-panel-hd">ASPECTS · {o.chart.aspects.length}</div>
          <div style={{ maxHeight: '180px', overflow: 'auto' }}>
            {o.chart.aspects.slice(0, 60).map((a, i) => (
              <div key={i} className="obs-aspect-row"><span className="swatch" style={{ background: a.color }} /><span className="txt">{a.label}</span><span className="delta">{a.delta.toFixed(1)}°</span></div>
            ))}
            {o.chart.aspects.length === 0 && <div className="obs-muted">No aspects at this time.</div>}
          </div>
          {(o as any).natalChart && (() => {
            const natal = (o as any).natalChart;
            // compute cross aspects natal vs current
            const cross: any[] = [];
            const enabled = o.enabledAspects;
            const orbScale = o.orbScale;
            const defs = ASPECT_DEFS.filter((d) => enabled[d.id] !== false);
            const degDeltaFn = (a: number, b: number) => { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return d; };
            for (const n of natal.planets) {
              for (const c of o.chart.planets) {
                if (n.id === 'Earth' || c.id === 'Earth') continue;
                const sep = degDeltaFn(n.lon, c.lon);
                for (const def of defs) {
                  const delta = Math.abs(sep - def.angle);
                  const orb = def.defaultOrb * orbScale;
                  if (delta <= orb) {
                    cross.push({ label: `${n.name} ${def.label} ${c.name}`, color: def.color, delta, a: n.id, b: c.id, aspect: def.id });
                  }
                }
              }
            }
            cross.sort((x, y) => x.delta - y.delta);
            const top = cross.slice(0, 40);
            return (
              <div style={{ marginTop: '0.6rem' }}>
                <div className="obs-panel-hd">NATAL × NOW · {cross.length}</div>
                <div style={{ maxHeight: '160px', overflow: 'auto' }}>
                  {top.map((a, i) => (
                    <div key={i} className="obs-aspect-row"><span className="swatch" style={{ background: a.color }} /><span className="txt">{a.label}</span><span className="delta">{a.delta.toFixed(1)}°</span></div>
                  ))}
                  {cross.length === 0 && <div className="obs-muted">No cross aspects.</div>}
                </div>
              </div>
            );
          })()}
          {(o as any).natalChart && (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="obs-panel-hd">NATAL · {(o as any).natalChart.aspects.length}</div>
              <div style={{ maxHeight: '120px', overflow: 'auto' }}>
                {(o as any).natalChart.aspects.slice(0, 30).map((a: any, i: number) => (
                  <div key={i} className="obs-aspect-row"><span className="swatch" style={{ background: a.color }} /><span className="txt">{a.label}</span><span className="delta">{a.delta.toFixed(1)}°</span></div>
                ))}
              </div>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
