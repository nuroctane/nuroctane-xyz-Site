import {
  ASPECT_DEFS,
  AYANAMSAS,
  BODIES,
  CHART_TYPES,
  HOUSE_SYSTEMS,
  type BodyId,
} from '../lib/types';
import { formatClock, formatDate, formatLon, formatUtc } from '../lib/math';
import { SPEEDS, useObservatory } from '../state/ObservatoryContext';

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

export function ObservatoryHud() {
  const o = useObservatory();
  const selected = o.chart.planets.find((p) => p.id === o.selectedPlanet);
  const visibleBodies = o.chart.planets.filter((p) => o.enabledBodies[p.id as BodyId] !== false);

  const onDateInput = (value: string) => {
    if (!value) return;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) o.setTime(d);
  };
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
    const cur = o.time;
    const [hh, mm] = value.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;
    const nd = new Date(cur);
    nd.setHours(hh, mm, 0, 0);
    o.setTime(nd);
  };
  const onYearSlider = (yr: number) => {
    const nd = new Date(o.time);
    nd.setFullYear(yr);
    o.setTime(nd);
  };

  const dateInputValue = toLocalInput(o.time);
  const dateOnly = toLocalDateOnly(o.time);
  const timeOnly = toLocalTimeOnly(o.time);

  if (!o.hudOpen) {
    return (
      <div className="obs-hud obs-hud--collapsed">
        <button type="button" className="obs-fab" onClick={() => o.setHudOpen(true)}>
          SYSTEMS
        </button>
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
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={o.systemsPanel === id}
              className={o.systemsPanel === id ? 'is-active' : ''}
              onClick={() => (o as any).setSystemsPanel(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {o.systemsPanel === 'zodiac' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ZODIAC SYSTEM</div>
            <div className="obs-seg">
              {(['tropical', 'sidereal', 'draconic', 'heliocentric'] as const).map((z) => (
                <button key={z} type="button" className={o.zodiac === z ? 'is-active' : ''} onClick={() => o.setZodiac(z)}>
                  {z}
                </button>
              ))}
            </div>
            <label className="obs-field">
              <span>Ayanamsa ({AYANAMSAS.length})</span>
              <select value={o.ayanamsaId} disabled={o.zodiac !== 'sidereal'} onChange={(e) => o.setAyanamsaId(Number(e.target.value))}>
                {AYANAMSAS.map((a) => (
                  <option key={a.id} value={a.id}>{a.id}. {a.label} [{a.group}]</option>
                ))}
              </select>
            </label>
            {o.zodiac === 'sidereal' && <div className="obs-muted">Ayanamsa {o.chart.ayanamsa.toFixed(6)}°</div>}

            <div className="obs-panel-hd" style={{ marginTop: '0.75rem' }}>DATE & TIME — fully selectable</div>
            <label className="obs-field">
              <span>Date (1800-2100)</span>
              <input type="date" value={dateOnly} min="1800-01-01" max="2100-12-31" onChange={(e) => onDateOnly(e.target.value)} />
            </label>
            <label className="obs-field">
              <span>Time</span>
              <input type="time" value={timeOnly} step={60} onChange={(e) => onTimeOnly(e.target.value)} />
            </label>
            <label className="obs-field">
              <span>UTC datetime</span>
              <input type="datetime-local" value={dateInputValue} min="1800-01-01T00:00" max="2100-12-31T23:59" onChange={(e) => onDateInput(e.target.value)} />
            </label>
            <label className="obs-field">
              <span>Year {o.time.getFullYear()}</span>
              <input type="range" min={1800} max={2100} step={1} value={o.time.getFullYear()} onChange={(e) => onYearSlider(Number(e.target.value))} />
            </label>
            <div className="obs-seg" style={{ marginTop: '0.5rem' }}>
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={o.speed === s ? 'is-active' : ''} onClick={() => o.setSpeed(s)}>
                  {s === 0 ? '⏸' : s === 1 ? '1×' : `${s}`}
                </button>
              ))}
            </div>
          </section>
        )}

        {o.systemsPanel === 'houses' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">HOUSES ({HOUSE_SYSTEMS.length})</div>
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
            <div className="obs-panel-hd">CHART TYPE</div>
            <div className="obs-radio-list">
              {CHART_TYPES.map((c) => (
                <label key={c.id} className={`obs-radio ${o.chartType === c.id ? 'is-active' : ''}`}>
                  <input type="radio" name="chart-type" checked={o.chartType === c.id} onChange={() => o.setChartType(c.id)} />
                  <span>{c.label}</span><span className="tag">{c.needsBirth ? 'birth' : 'moment'}{c.needsSecond ? '+2nd' : ''}</span>
                </label>
              ))}
            </div>
            <label className="obs-field">
              <span>Birth datetime</span>
              <input type="datetime-local" value={toLocalInput(o.birthDate)} onChange={(e) => o.setBirthDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <label className="obs-field">
              <span>Second datetime (synastry/composite/davison)</span>
              <input type="datetime-local" value={toLocalInput(o.secondDate)} onChange={(e) => o.setSecondDate(e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <div className="obs-field">
              <span>Second observer</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <input type="number" step={0.0001} value={o.secondObserver.lat} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lat: Number(e.target.value) })} placeholder="lat" />
                <input type="number" step={0.0001} value={o.secondObserver.lon} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lon: Number(e.target.value) })} placeholder="lon" />
              </div>
            </div>
            <label className="obs-field">
              <span>Fortune formula</span>
              <select value={o.fortuneFormula} onChange={(e) => o.setFortuneFormula(e.target.value as any)}>
                <option value="auto">Auto day/night</option><option value="day">Day</option><option value="night">Night</option>
              </select>
            </label>
          </section>
        )}

        {o.systemsPanel === 'layers' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">LAYERS — unified</div>
            {(
              [
                ['planets', 'Planets'],
                ['orbits', 'Orbits'],
                ['constellations', 'Constellations'],
                ['aspects', 'Aspect lines'],
                ['houses', 'Houses'],
                ['labels', 'Labels'],
                ['cities', 'Cities'],
                ['missions', 'Missions'],
                ['satellites', 'Satellites'],
                ['earthquakes', 'Quakes USGS'],
                ['eonet', 'Disasters EONET'],
                ['storms', 'Storms'],
                ['wildfires', 'Wildfires'],
                ['volcanoes', 'Volcanoes'],
                ['clouds', 'Clouds'],
                ['precipitation', 'Precipitation'],
                ['temperature', 'Temperature'],
                ['winds', 'Winds'],
                ['traffic', 'Traffic'],
                ['astroCartography', 'Astro-Cartography'],
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
            <div className="obs-panel-hd">OBSERVER</div>
            <label className="obs-field">
              <span>Lat</span><input type="number" step={0.0001} value={o.observer.lat} onChange={(e) => o.setObserver({ ...o.observer, lat: Number(e.target.value) })} />
            </label>
            <label className="obs-field">
              <span>Lon</span><input type="number" step={0.0001} value={o.observer.lon} onChange={(e) => o.setObserver({ ...o.observer, lon: Number(e.target.value) })} />
            </label>
            <label className="obs-field">
              <span>Alt m</span><input type="number" step={10} value={o.observer.alt ?? 10} onChange={(e) => o.setObserver({ ...o.observer, alt: Number(e.target.value) })} />
            </label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => o.setObserver({ lat: pos.coords.latitude, lon: pos.coords.longitude, alt: 10 })); }}>GPS</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 40.7128, lon: -74.006, alt: 10 })}>NYC</button>
              <button type="button" className="obs-mini" onClick={() => o.setObserver({ lat: 51.5074, lon: -0.1278, alt: 10 })}>London</button>
            </div>
          </section>
        )}

        {o.systemsPanel === 'advanced' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ADVANCED</div>
            <label className="obs-toggle"><input type="checkbox" checked={o.topocentric} onChange={(e) => o.setTopocentric(e.target.checked)} /><span>Topocentric (Moon parallax)</span></label>
            <label className="obs-toggle"><input type="checkbox" checked={o.heliocentric} onChange={(e) => o.setHeliocentric(e.target.checked)} /><span>Heliocentric override</span></label>
            <div className="obs-field">
              <span>Node mode</span>
              <div className="obs-seg">
                <button type="button" className={o.nodeMode === 'mean' ? 'is-active' : ''} onClick={() => o.setNodeMode('mean')}>Mean</button>
                <button type="button" className={o.nodeMode === 'true' ? 'is-active' : ''} onClick={() => o.setNodeMode('true')}>True</button>
              </div>
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
            <div className="obs-panel-hd">SATELLITES — orbit veil full capacity</div>
            <div className="obs-muted">Color-coded by owner/company. Filter, search, follow, ground track, orbit trail.</div>
            <div className="obs-field">
              <span>Search</span>
              <input type="text" value={o.satSearch} placeholder="STARLINK, ONEWEB, GPS..." onChange={(e) => o.setSatSearch(e.target.value)} />
            </div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(true)}>All on</button>
              <button type="button" className="obs-mini" onClick={() => o.setAllSatGroups(false)}>All off</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowGroundTrack(!o.showGroundTrack)}>{o.showGroundTrack ? 'Track on' : 'Track off'}</button>
              <button type="button" className="obs-mini" onClick={() => o.setShowOrbitTrail(!o.showOrbitTrail)}>{o.showOrbitTrail ? 'Trail on' : 'Trail off'}</button>
              <button type="button" className="obs-mini" onClick={() => o.setFollowSat(!o.followSat)}>{o.followSat ? 'Follow on' : 'Follow off'}</button>
            </div>
            {(o as any).SATELLITE_GROUPS ? null : null}
            {(() => {
              const groups = (o as any).satGroupsMeta ?? [
                { id: 'starlink', label: 'Starlink', owner: 'SpaceX', color: '#38bdf8', count: 4200 },
                { id: 'oneweb', label: 'OneWeb', owner: 'OneWeb', color: '#e2e8f0', count: 620 },
                { id: 'planet', label: 'Planet Labs', owner: 'Planet', color: '#fde68a', count: 420 },
                { id: 'iridium', label: 'Iridium', owner: 'Iridium', color: '#94a3b8', count: 86 },
                { id: 'gps', label: 'GPS', owner: 'US GPS', color: '#4ade80', count: 32 },
                { id: 'galileo', label: 'Galileo', owner: 'EU Galileo', color: '#a78bfa', count: 28 },
                { id: 'glonass', label: 'GLONASS', owner: 'RU GLONASS', color: '#fb923c', count: 26 },
                { id: 'debris', label: 'Debris', owner: 'Debris', color: '#ef4444', count: 1100 },
                { id: 'cosmos', label: 'Cosmos & Legacy', owner: 'RU Legacy', color: '#71717a', count: 400 },
                { id: 'other', label: 'Other', owner: 'Mixed', color: '#64748b', count: 298 },
              ];
              const q = o.satSearch.toLowerCase();
              return groups.filter((g: any) => !q || g.label.toLowerCase().includes(q) || g.owner.toLowerCase().includes(q)).map((g: any) => (
                <label key={g.id} className="obs-toggle">
                  <input type="checkbox" checked={!!(o.enabledSatGroups as any)[g.id]} onChange={() => o.toggleSatGroup(g.id as any)} />
                  <span className="dot" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
                  <span>{g.label}</span>
                  <span className="tag">{g.owner} · {g.count}</span>
                </label>
              ));
            })()}
            {o.selectedSatId && (
              <div className="obs-note">
                Selected satellite: <b>{o.selectedSatId}</b><br />
                {o.followSat ? 'Following — camera locked' : 'Click follow to track'}<br />
                Ground track {o.showGroundTrack ? 'on' : 'off'} · Orbit trail {o.showOrbitTrail ? 'on' : 'off'}
              </div>
            )}
          </section>
        )}

        {o.systemsPanel === 'anchors' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">PLANET ANCHORS — more than Sun</div>
            <div className="obs-muted">Fly camera to any planet. Each anchor preserves orbit & rotation accuracy based on time.</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-solar'))}>☀️ Solar overview (Sun)</button>
              <button type="button" className="obs-mini" onClick={() => window.dispatchEvent(new CustomEvent('obs-flyto-earth'))}>🌍 Earth</button>
            </div>
            {['Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Sun'].map((id) => (
              <button key={id} type="button" className="obs-planet-row" onClick={() => {
                o.setAnchorPlanet(id as any);
                window.dispatchEvent(new CustomEvent('obs-flyto-planet', { detail: { id } }));
              }}>
                <span className="dot" style={{ background: (BODIES.find(b=>b.id===id)?.color ?? '#38bdf8') }} />
                <span className="name">Focus {id}</span>
                <span className="lon">{o.anchorPlanet === id ? 'active' : 'anchor'}</span>
              </button>
            ))}
            <div className="obs-muted">Tip: You can hide planets via Bodies panel — anchors respect visibility toggles.</div>
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
          </section>
        )}
      </aside>
    </div>
  );
}
