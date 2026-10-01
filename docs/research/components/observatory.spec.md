# Observatory — nuroctane.xyz/observatory

Canonical route: `/observatory`. The Observatory is the only satellite visualizer route.

## Current Blackboard runtime (2026-10-01)

The main scene is `UnifiedWorld.tsx`, with monochrome glass controls over a black
Three.js canvas. Legacy mode capabilities below are a historical inventory;
Swiss WASM browser initialization remains disabled in favor of the working
astronomy-engine fallback.

- `SatelliteField.tsx` propagates CelesTrak TLEs with satellite.js SGP4. The
  same-origin `/api/observatory/tle` proxy validates and caches each allowed feed
  for two hours, matching the upstream update cadence. Concurrent requests share
  a fetch; failed queries cool down instead of retrying on every refresh.
  Committed snapshots for every supported group keep satellites visible
  during an upstream outage. The HUD distinguishes live, snapshot and mixed
  catalogs. Snapshot positions are estimates, especially as orbital data ages.
  The snapshots were refreshed from CelesTrak on 2026-10-01; large groups are
  sampled to the scene's limits to keep fallback downloads small. The production
  CelesTrak connection timed out during verification, so the scene correctly
  uses and labels these snapshots. It does not claim a failed feed is live.
- Catalog requests fail independently, cancel on group changes, deduplicate by
  NORAD ID and cap rendering at 640 satellites. Propagation batches 160 points
  per frame, and SGP4 initialization is also capped before parsing large feeds.
  Only the selected satellite enters the camera-follow map; dynamic
  point geometry has a fixed orbital bound and no per-frame bounding calculation.
  Search accepts a name, group or NORAD ID. The satellite layer toggle also hides
  tracks and clears its HUD catalog when unmounted.
- Wind sampling is one 99-location Open-Meteo request, cached for 30 minutes.
  Meteorological bearings convert to east/north components in the direction the
  wind blows. Missing values are skipped; an outage uses a labeled modeled field.
  USGS quakes and NASA EONET events have their own bounded data caches.
- Place lookup uses `/api/observatory/geocode`, with a one-hour result cache and
  OpenStreetMap attribution. Invalid upstream bodies return a controlled error.
- Phone controls use a scrollable tabbed panel above site navigation, with the
  duplicate right panel hidden. Planet anchors and audio controls have separate
  space. Desktop retains both side panels and smooth planet camera navigation.

`pnpm run check:observatory` runs the frame-allocation guards and data regressions
(SGP4 epoch positions, partial outages, mixed catalogs, cancellation, malformed
upstreams, proxy cache, cardinal wind directions and missing weather/quake data).
It is also part of `pnpm run build`. Browser checks cover phone and desktop
layouts, NORAD search/selection, and Saturn fly-to without console errors.

## What it is

A 3D astrology-rooted web observatory combining:

- Earth satellites (sealed CelesTrak/SGP4 runtime at `/observatory-runtime/`)
- Cesium globe with OSM/Esri imagery, Nominatim city search, Mapillary street-level deep links
- Solar system & sky chart (Three.js + astronomy-engine fallback)
- Full Swiss Ephemeris (WASM) for house/ayanamsa/positions
- NASA Eyes / Horizons mission hooks + rover photos

## Systems implemented

### Chart types
moment, natal, secondary progressed, solar arc, transit, synastry

### House systems (25)
P Plac, K Koch, O Porphyry, R Regio, C Campanus, B Alcabitius, M Morinus, T Topocentric, A Equal asc, E Equal, V Vehlow, W Whole Sign, N Equal MC, D Equal mid, X Meridian, H Horizontal, U Krusinski, G Gauquelin, Y APC, i Sunshine, S Sripati, L Pullen SD, Q Pullen SR, F Carter, I Sunshine alt

### Ayanamsas (41)
0 Fagan/Bradley … 40 Cochrane — full Swiss SE_SIDM_* table with names

### Bodies (27)
Sun Moon Mercury Venus Mars Jupiter Saturn Uranus Neptune Pluto Earth MeanNode TrueNode SouthNode MeanLilith TrueLilith Chiron Pholus Ceres Pallas Juno Vesta Fortune Spirit Vertex AntiVertex EastPoint

### Aspects (19)
conjunction, opposition, trine, square, sextile, quincunx, semisextile, semisquare, sesquiquadrate, quintile, biquintile, septile, biseptile, triseptile, novile, binovile, decile, undecile, vigintile — per-aspect toggles + family bulk + orb scale

### Layers
planets, orbits, constellations, aspects, houses, labels, ecliptic, grid, asteroids, nodes, lots, missions, cities, buildings, terrain, satellites

## State

`ObservatoryContext` holds:
- mode (earth/solar/sky/missions), earthSubmode (satellites/explore)
- time, speed, live, clock tick (rAF + throttled Swiss)
- zodiac tropical/sidereal, ayanamsaId, houseSystem, chartType, birthDate/secondDate, fortuneFormula, orbScale
- enabledBodies Record<BodyId, bool>, enabledAspects Record<AspectId, bool>
- layers, observer lat/lon/alt, secondObserver, query, selectedPlanet/mission, hudOpen, systemsPanel
- swissReady, swissVersion

Engine lazy loads via `getSwiss()` (swisseph-wasm). Falls back to astronomy-engine for pre-init frames.

## Routes / Meta

- SPA router: top=observatory renders ObservatoryPage
- Analytics: observatory is reported as `/observatory`
- pageMeta and crawler OG metadata use the Observatory mark
- nodes.ts: id observatory, url /observatory
- StandaloneNav + QuickNav: href /observatory

## Build

- vite.config: `cesium()` plugin via vite-plugin-cesium, outDir relative `dist/public` for Windows path.join fix
- WASM: `swisseph-CTDYKFq2.wasm` bundled, exclude cesium+swisseph from optimizeDeps
- Cesium assets: dist/public/cesium/… copied by plugin
- Build passes: typecheck + vite build

## Not yet / future

- True topocentric parallax for all points (partial via set_topo)
- Full Swiss ephemeris files for asteroids beyond built-ins
- Building 3D tiles / OSM buildings shader
- Offline Horizons cache

## Verification

- [x] /observatory renders
- [x] Swiss loads, version shown in HUD
- [x] All toggles wired
- [x] Cesium globe loads, city search works, Mapillary link
- [x] Satellites iframe still at /observatory-runtime
