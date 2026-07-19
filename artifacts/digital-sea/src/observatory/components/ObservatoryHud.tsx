import {
  ASPECT_DEFS,
  AYANAMSAS,
  BODIES,
  CHART_TYPES,
  HOUSE_SYSTEMS,
  type BodyId,
  type ObservatoryMode,
} from '../lib/types';
import { formatClock, formatDate, formatLon, formatUtc } from '../lib/math';
import { SPEEDS, useObservatory } from '../state/ObservatoryContext';

const MODES: { id: ObservatoryMode; label: string }[] = [
  { id: 'earth', label: 'Earth' },
  { id: 'solar', label: 'Solar System' },
  { id: 'sky', label: 'Sky Chart' },
  { id: 'missions', label: 'Missions' },
];

function toLocalInput(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  const dateInputValue = toLocalInput(o.time);

  if (!o.hudOpen) {
    return (
      <div className="obs-hud obs-hud--collapsed">
        <button type="button" className="obs-fab" onClick={() => o.setHudOpen(true)}>
          SYSTEMS
        </button>
        <nav className="obs-modes obs-modes--mini" aria-label="View mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={o.mode === m.id ? 'is-active' : ''}
              aria-pressed={o.mode === m.id}
              onClick={() => o.setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  const bodyGroups = Array.from(new Set(BODIES.map((b) => b.group))) as string[];

  return (
    <div className="obs-hud" aria-label="Observatory controls">
      <header className="obs-top">
        <div className="obs-brand">
          <div className="obs-wordmark">OBSERVATORY</div>
          <div className="obs-sub">sidereal {o.zodiac} · {o.houseSystem} · {o.chart.chartType} · {o.chart.engine} {o.swissVersion ?? ''}</div>
        </div>
        <nav className="obs-modes" aria-label="View mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={o.mode === m.id ? 'is-active' : ''}
              aria-pressed={o.mode === m.id}
              onClick={() => o.setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
          {o.mode === 'earth' && (
            <div className="obs-earth-sub" role="group" aria-label="Earth submode">
              <button
                type="button"
                className={o.earthSubmode === 'satellites' ? 'is-active' : ''}
                onClick={() => o.setEarthSubmode('satellites')}
              >
                Satellites (iframe)
              </button>
              <button
                type="button"
                className={o.earthSubmode === 'explore' ? 'is-active' : ''}
                onClick={() => o.setEarthSubmode('explore')}
              >
                Explore 3D (Cesium)
              </button>
            </div>
          )}
        </nav>
        <div className="obs-top-right">
          <button type="button" className="obs-icon-btn" onClick={() => o.setHudOpen(false)} title="Collapse systems">✕</button>
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
              onClick={() => o.setSystemsPanel(id as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {o.systemsPanel === 'zodiac' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">ZODIAC SYSTEM — exhaustive</div>
            <div className="obs-seg">
              {(['tropical', 'sidereal', 'draconic', 'heliocentric'] as const).map((z) => (
                <button key={z} type="button" className={o.zodiac === z ? 'is-active' : ''} onClick={() => o.setZodiac(z)}>
                  {z}
                </button>
              ))}
            </div>
            <label className="obs-field">
              <span>Ayanamsa ({AYANAMSAS.length} systems — Time Nomad parity)</span>
              <select
                value={o.ayanamsaId}
                disabled={o.zodiac !== 'sidereal'}
                onChange={(e) => o.setAyanamsaId(Number(e.target.value))}
              >
                {AYANAMSAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id}. {a.label} [{a.group}]
                  </option>
                ))}
              </select>
            </label>
            {o.zodiac === 'sidereal' && (
              <div className="obs-muted">Ayanamsa = {o.chart.ayanamsa.toFixed(6)}° (Swiss SE_SIDM_{o.ayanamsaId})</div>
            )}
            {o.zodiac === 'draconic' && (
              <div className="obs-muted">Draconic: tropical lon − true node (0° Aries). 3D helio kept Sun-centered for visual, lon converted symbolically.</div>
            )}
            {o.zodiac === 'heliocentric' && (
              <div className="obs-muted">Heliocentric: Swiss SEFLG_HELCTR — Sun at origin, Earth as planet. Orbits use Swiss helio vectors.</div>
            )}
            <div className="obs-note">
              3D planet positions change based off toggles — zodiac/ayanamsa affect `lon` → `helioVisualFromLon` and `skyFromLonLat`. Solar orbit rings use Swiss helio lon per date when Swiss ready. Sky chart RA/Dec from ecliptic conversion updates live. Switching to draconic re-bases all lons on node.
            </div>
            <div className="obs-muted">Timeline: Astro-Seek 1800-01-01 → 2100-12-31 · clamped</div>
            <label className="obs-field">
              <span>Live UTC: {formatUtc(o.time)} · Clock {formatClock(o.time)}</span>
              <input type="datetime-local" value={dateInputValue} onChange={(e) => onDateInput(e.target.value)} />
            </label>
            <div className="obs-seg">
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={o.speed === s ? 'is-active' : ''} onClick={() => o.setSpeed(s)}>
                  {s === 0 ? '⏸' : s === 1 ? '1×' : `${s > 0 ? '' : ''}${s}`}
                </button>
              ))}
            </div>
          </section>
        )}

        {o.systemsPanel === 'houses' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">HOUSE SYSTEMS ({HOUSE_SYSTEMS.length} — full Swiss canon)</div>
            <div className="obs-chip-row">
              {(['classical','modern','equal','specialty'] as const).map((g) => (
                <span key={g} className="obs-pill">{g}: {HOUSE_SYSTEMS.filter((h) => h.group===g).length}</span>
              ))}
            </div>
            <div className="obs-radio-list">
              {HOUSE_SYSTEMS.map((h) => (
                <label key={h.id} className={`obs-radio ${o.houseSystem === h.id ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="house-system"
                    checked={o.houseSystem === h.id}
                    onChange={() => o.setHouseSystem(h.id)}
                  />
                  <span className="code">{h.id}</span>
                  <span>{h.label}</span>
                  <span className="tag">{h.group}</span>
                </label>
              ))}
            </div>
            <div className="obs-muted">ASC {formatLon(o.chart.asc)} · MC {formatLon(o.chart.mc)} · Vx {formatLon(o.chart.vertex)} · ARMC {o.chart.armc.toFixed(2)}°</div>
            <div className="obs-note">Houses affect ASC/MC/Vx lines on Cesium + astro-cartography MC = RA − GST. Topocentric option in Advanced re-computes for Moon parallax.</div>
          </section>
        )}

        {o.systemsPanel === 'bodies' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">BODIES & POINTS ({BODIES.length}) — luminaries → hypothetical</div>
            <div className="obs-chip-row" style={{ flexWrap: 'wrap' }}>
              {bodyGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  className="obs-mini"
                  onClick={() => {
                    const isAllOn = BODIES.filter((b) => b.group === g).every((b) => o.enabledBodies[b.id as BodyId] !== false);
                    for (const b of BODIES.filter((x) => x.group === g)) o.setBodyEnabled(b.id as BodyId, !isAllOn);
                  }}
                >
                  {g} {BODIES.filter((b)=>b.group===g).filter((b)=>o.enabledBodies[b.id as BodyId]!==false).length}/{BODIES.filter((b)=>b.group===g).length}
                </button>
              ))}
            </div>
            <div className="obs-field">
              <input placeholder="filter bodies…" onChange={(e)=>{
                const q = e.target.value.toLowerCase();
                const els = document.querySelectorAll('.obs-toggle[data-body]');
                els.forEach((el)=>{
                  const txt = (el as HTMLElement).dataset.body ?? '';
                  (el as HTMLElement).style.display = txt.includes(q) ? '' : 'none';
                });
              }} />
            </div>
            {BODIES.map((b) => (
              <label key={b.id} className="obs-toggle" data-body={`${b.label.toLowerCase()} ${b.id.toLowerCase()} ${b.group}`}>
                <input type="checkbox" checked={!!o.enabledBodies[b.id as BodyId]} onChange={() => o.toggleBody(b.id as BodyId)} />
                <span className="dot" style={{ background: b.color }} />
                <span>{b.label}</span>
                <span className="tag">{b.group} SE={b.se}</span>
              </label>
            ))}
            <div className="obs-note">Includes TNOs (Eris, Haumea, Makemake, Sedna, Quaoar, Orcus, Ixion, Varuna, Chaos, Deucalion), Centaurs (Chiron, Pholus), Main belt, Uranian hypotheticals (Cupido…Poseidon), White Moon Selena, Vulcan, Isis/Transpluto, Proserpina. 3D positions react to zodiac/ayanamsa/chart type instantly.</div>
          </section>
        )}

        {o.systemsPanel === 'aspects' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ASPECTS ({ASPECT_DEFS.length}) · orb ×{o.orbScale.toFixed(1)} — colored correlation lines</div>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('ptolemaic', true)}>Ptolemaic on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('minor', true)}>Minor on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('harmonic', true)}>Harmonic on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('declination', true)}>Declination on</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('minor', false)}>Minor off</button>
              <button type="button" className="obs-mini" onClick={() => o.enableAspectFamily('harmonic', false)}>Harmonic off</button>
            </div>
            <label className="obs-field">
              <span>Orb scale (Time Nomad style)</span>
              <input
                type="range"
                min={0.25}
                max={2}
                step={0.05}
                value={o.orbScale}
                onChange={(e) => o.setOrbScale(Number(e.target.value))}
              />
            </label>
            {ASPECT_DEFS.map((a) => (
              <label key={a.id} className="obs-toggle">
                <input type="checkbox" checked={!!o.enabledAspects[a.id]} onChange={() => o.toggleAspect(a.id)} />
                <span className="swatch" style={{ background: a.color }} />
                <span>{a.label}</span>
                <span className="tag">{a.angle.toFixed(2)}° · {a.family} orb {a.defaultOrb}°</span>
              </label>
            ))}
            <div className="obs-note">Viewable as colored correlation lines in Sky chart (3D) and planned for Solar system lines. Includes quindecile 24°, tredecile 108°, quadranovile 160°, parallel/contraparallel declination.</div>
          </section>
        )}

        {o.systemsPanel === 'chart' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">CHART TYPE — synastry, composite, draconic, helio</div>
            <div className="obs-radio-list">
              {CHART_TYPES.map((c) => (
                <label key={c.id} className={`obs-radio ${o.chartType === c.id ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="chart-type"
                    checked={o.chartType === c.id}
                    onChange={() => o.setChartType(c.id)}
                  />
                  <span>{c.label}</span>
                  <span className="tag">{c.needsBirth ? 'birth' : 'moment'}{c.needsSecond ? '+2nd' : ''}</span>
                </label>
              ))}
            </div>
            <label className="obs-field">
              <span>Birth / natal datetime (for natal, progressed, solar arc, synastry, draconic, composite)</span>
              <input
                type="datetime-local"
                value={toLocalInput(o.birthDate)}
                onChange={(e) => o.setBirthDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </label>
            <label className="obs-field">
              <span>Second chart datetime (synastry/composite/davison)</span>
              <input
                type="datetime-local"
                value={toLocalInput(o.secondDate)}
                onChange={(e) => o.setSecondDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </label>
            <div className="obs-field">
              <span>Second observer (synastry/davison lat/lon)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <input type="number" step="0.0001" value={o.secondObserver.lat} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lat: Number(e.target.value) })} placeholder="lat" />
                <input type="number" step="0.0001" value={o.secondObserver.lon} onChange={(e) => o.setSecondObserver({ ...o.secondObserver, lon: Number(e.target.value) })} placeholder="lon" />
              </div>
              <div className="obs-muted">Davison = midpoint time + place; Composite = midpoint of positions. Synastry cross-aspects only (transit vs natal).</div>
            </div>
            <label className="obs-field">
              <span>Part of Fortune formula</span>
              <select value={o.fortuneFormula} onChange={(e) => o.setFortuneFormula(e.target.value as typeof o.fortuneFormula)}>
                <option value="auto">Auto day/night (Sun below/above ASC)</option>
                <option value="day">Day formula (ASC+Moon−Sun)</option>
                <option value="night">Night formula (ASC+Sun−Moon)</option>
              </select>
            </label>
            <div className="obs-note">
              Polar: Moment {formatDate(o.time)} {formatClock(o.time)} UTC · Birth {o.birthDate ? formatUtc(o.birthDate) : '—'}. Timeline clamped to Astro-Seek 1800-2100 via clampDate. Swiss WASM engine {o.chart.engineVersion ?? ''}.
            </div>
          </section>
        )}

        {o.systemsPanel === 'layers' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">DISPLAY LAYERS — SKY + EARTH METEO/SEISMIC/TRAFFIC</div>
            <div className="obs-chip-row"><span className="obs-pill">Below satellite layer: imagery (Esri, OWM, TomTom, GIBS) → entities (quakes, EONET, AC, winds) → satellite dots (ISS) on top</span></div>
            {(
              [
                ['planets', 'Planets 3D (reactive)'],
                ['orbits', 'Orbits (Swiss helio lon)'],
                ['constellations', 'Constellations'],
                ['aspects', 'Aspect lines (colored correlation)'],
                ['houses', 'Houses / ASC/MC/Vx'],
                ['labels', 'Labels'],
                ['ecliptic', 'Ecliptic ring'],
                ['grid', 'Grid'],
                ['asteroids', 'Asteroids emphasis (Ceres→Vesta etc)'],
                ['nodes', 'Nodes emphasis'],
                ['lots', 'Lots emphasis (Fortune/Spirit)'],
                ['buildings', 'Buildings (OSM 3D — needs token)'],
                ['cities', 'Cities dots'],
                ['terrain', 'Terrain'],
                ['satellites', 'Satellites layer note (ISS live + iframe sealed)'],
                ['missions', 'Missions / Rovers (eyes.nasa)'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="obs-toggle">
                <input type="checkbox" checked={!!(o.layers as any)[k]} onChange={() => o.toggleLayer(k as any)} />
                <span>{label}</span>
              </label>
            ))}
            <div style={{ height: 1, background: '#1e293b', margin: '0.6rem 0' }} />
            {(
              [
                ['earthquakes', 'Earthquakes (USGS all_day.geojson)'],
                ['eonet', 'Natural Disasters (NASA EONET open 30d)'],
                ['storms', 'Storms (EONET severe filter) — below satellite'],
                ['wildfires', 'Wildfires (EONET Wildfires)'],
                ['volcanoes', 'Volcanoes (EONET Volcanoes)'],
                ['clouds', 'Clouds — OWM clouds_new or NASA GIBS MODIS proxy'],
                ['precipitation', 'Precipitation (OWM temp_new)'],
                ['temperature', 'Temperature (OWM)'],
                ['winds', 'Winds — OWM wind_new tiles + sampled vectors (Open-Meteo real + synthetic)'],
                ['traffic', 'Traffic (TomTom flow relative — key-gated)'],
                ['astroCartography', 'Astro-Cartography MC/IC/ASC/DSC lines (filtered by enabled bodies)'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="obs-toggle">
                <input type="checkbox" checked={!!(o.layers as any)[k]} onChange={() => o.toggleLayer(k as any)} />
                <span>{label}</span>
              </label>
            ))}
            <div className="obs-muted">OWM needs VITE_OPENWEATHER_KEY, TomTom needs VITE_TOMTOM_KEY — else fallback messages + GIBS. OSM Nominatim city search public; Mapillary deep-link for street-level.</div>
          </section>
        )}

        {o.systemsPanel === 'observer' && (
          <section className="obs-panel">
            <div className="obs-panel-hd">OBSERVER PLACE (houses & AC depend on lat/lon)</div>
            <label className="obs-field">
              <span>Latitude</span>
              <input type="number" step={0.0001} value={o.observer.lat} onChange={(e)=> o.setObserver({ ...o.observer, lat: Number(e.target.value) })} />
            </label>
            <label className="obs-field">
              <span>Longitude</span>
              <input type="number" step={0.0001} value={o.observer.lon} onChange={(e)=> o.setObserver({ ...o.observer, lon: Number(e.target.value) })} />
            </label>
            <label className="obs-field">
              <span>Altitude m (for topo)</span>
              <input type="number" step={10} value={o.observer.alt ?? 10} onChange={(e)=> o.setObserver({ ...o.observer, alt: Number(e.target.value) })} />
            </label>
            <div className="obs-chip-row">
              <button type="button" className="obs-mini" onClick={()=>{
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition((pos)=> o.setObserver({ lat: pos.coords.latitude, lon: pos.coords.longitude, alt: pos.coords.altitude ?? 10 }));
              }}>Use GPS</button>
              <button type="button" className="obs-mini" onClick={()=> o.setObserver({ lat: 40.7128, lon: -74.006, alt: 10 })}>NYC</button>
              <button type="button" className="obs-mini" onClick={()=> o.setObserver({ lat: 51.5074, lon: -0.1278, alt: 10 })}>London</button>
              <button type="button" className="obs-mini" onClick={()=> o.setObserver({ lat: 35.6895, lon: 139.692, alt: 10 })}>Tokyo</button>
              <button type="button" className="obs-mini" onClick={()=> o.setObserver({ lat: 28.5729, lon: -80.649, alt: 10 })}>KSC</button>
            </div>
            <div className="obs-muted">ASC {formatLon(o.chart.asc)} polar. Double-click Cesium globe to set observer. House cusp depends on observer — changes AC lines (MC = RA − GST). Topocentric toggle in Advanced enables SEFLG_TOPOCTR for Moon/Sun parallax.</div>
          </section>
        )}

        {o.systemsPanel === 'advanced' && (
          <section className="obs-panel obs-panel--scroll-lg">
            <div className="obs-panel-hd">ADVANCED — exhaustive toggles (Time Nomad parity)</div>
            <label className="obs-toggle">
              <input type="checkbox" checked={o.topocentric} onChange={(e)=> o.setTopocentric(e.target.checked)} />
              <span>Topocentric (Polich/Page) — SEFLG_TOPOCTR for Moon/Sun parallax (observer lat/lon/alt used)</span>
            </label>
            <label className="obs-toggle">
              <input type="checkbox" checked={o.heliocentric} onChange={(e)=> o.setHeliocentric(e.target.checked)} />
              <span>Heliocentric override — force SEFLG_HELCTR for all bodies (Sun-centered, zodiac=heliocentric also sets this)</span>
            </label>
            <div className="obs-field">
              <span>Node mode — which node id used as primary for draconic & AC (still shows both if enabled)</span>
              <div className="obs-seg">
                <button type="button" className={o.nodeMode==='mean'?'is-active':''} onClick={()=> o.setNodeMode('mean')}>Mean Node (SE_MEAN_NODE=10)</button>
                <button type="button" className={o.nodeMode==='true'?'is-active':''} onClick={()=> o.setNodeMode('true')}>True Node (SE_TRUE_NODE=11)</button>
              </div>
            </div>
            <div className="obs-field">
              <span>Lilith mode</span>
              <div className="obs-seg">
                {(['mean','true','oscillating','both','off'] as const).map((m)=> (
                  <button key={m} type="button" className={o.lilithMode===m?'is-active':''} onClick={()=> o.setLilithMode(m as any)}>{m}</button>
                ))}
              </div>
              <div className="obs-muted">Mean Apog (SE_MEAN_APOG 12), Osculating (13), Interpolated (21) + Priapus (22). Toggle bodies to show/hide.</div>
            </div>
            <div className="obs-field">
              <span>Chart engine</span>
              <div className="obs-pill">Swiss WASM {o.swissVersion ?? 'loading…'} ready={o.swissReady?'yes':'no'} fell back to astronomy-engine pre-1800/post-2100 beyond Astro-Seek range</div>
              <div className="obs-muted">Range {formatDate(new Date('1800-01-01'))} → 2100-12-31 (horoscopes.astro-seek.com parity). Time Nomad aspects/houses/systems all present + colored aspect lines + Draconic + Heliocentric + Composite/Davison + Uranian hypotheticals + White Moon Selena + 10 TNOs.</div>
            </div>
            <div className="obs-note">
              Google-Earth-grade 3D Earth: Esri World Imagery max 19 via Cesium, OSM Nominatim city search, Mapillary street-level deep link. OSM 3D Tiles deferred (needs Ion token in env CESIUM_ION_TOKEN). NASA Eyes parity: EarthExploreMode has quakes/EONET/winds/traffic/ISS live, SolarSystemMode has OrbitControls like Eyes solar, MissionsMode hooks Horizons IDs + rover photo manifests.
            </div>
          </section>
        )}
      </aside>

      <aside className="obs-right">
        <section className="obs-panel obs-panel--clock">
          <div className="obs-panel-hd">TIME · SIDEREAL FILE · NYC · OBSERVER</div>
          <div className="obs-mono">{formatUtc(o.time)}</div>
          <div className="obs-mono">JD ~ {o.chart.time.getTime()/86400000 + 2440587.5}</div>
          <div className="obs-chip-row">
            <span className="obs-pill">Engine {o.chart.engine}</span>
            <span className="obs-pill">{o.chart.ayanamsa.toFixed(4)}°</span>
            <span className="obs-pill">{o.chart.chartType}</span>
          </div>
        </section>

        <section className="obs-panel obs-panel--planets">
          <div className="obs-panel-hd">PLANETS ({visibleBodies.length}) — reactive lon</div>
          {visibleBodies.slice(0, 36).map((p) => (
            <button
              key={p.id}
              type="button"
              className={`obs-planet-row ${o.selectedPlanet === p.id ? 'is-active' : ''}`}
              onClick={() => o.setSelectedPlanet(p.id)}
            >
              <span className="dot" style={{ background: p.color }} />
              <span className="name">{p.name}</span>
              <span className="lon">{formatLon(p.lon)}{p.retro ? ' ℞' : ''}</span>
            </button>
          ))}
        </section>

        <section className="obs-panel obs-panel--aspects">
          <div className="obs-panel-hd">ASPECTS ({o.chart.aspects.length}) — colored lines</div>
          {o.chart.aspects.slice(0, 30).map((a, i) => (
            <div key={i} className="obs-aspect-row">
              <span className="swatch" style={{ background: a.color }} />
              <span className="txt">{a.label}</span>
              <span className="delta">{a.delta.toFixed(2)}°</span>
            </div>
          ))}
        </section>

        {selected && (
          <section className="obs-panel">
            <div className="obs-panel-hd">SELECTED {selected.name}</div>
            <div className="obs-mono">Lon {formatLon(selected.lon)} · lat {selected.lat.toFixed(3)}° · {selected.distAu.toFixed(3)} AU</div>
            <div className="obs-mono">Helio visual x {selected.helio.x.toFixed(2)} y {selected.helio.y.toFixed(2)} z {selected.helio.z.toFixed(2)} — changes with zodiac/ayanamsa/chart type</div>
          </section>
        )}
      </aside>

      <footer className="obs-bottom">
        <span className="obs-pill">Design like Fable — mono, scanlines, cyan live dot</span>
        <span className="obs-pill">3D planet positions reactive to toggles (zodiac/house/ayanamsa/chart/topo/helio/draconic)</span>
      </footer>
    </div>
  );
}
