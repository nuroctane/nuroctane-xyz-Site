# Observatory — nuroctane.xyz/observatory

Canonical route: `/observatory`. Legacy `/orbit` and `/orbit-veil` 308-equivalent client redirect via history.replaceState + server OG middleware.

## What it is

A 3D astrology-rooted web observatory combining:

- Earth satellites (sealed CelesTrak/SGP4 runtime at `/orbit-veil-runtime/`)
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

- SPA router: top=orbit/orbit-veil → replaceState to /observatory + render ObservatoryPage
- Analytics: orbit + orbit-veil mapped to /observatory
- pageMeta: observatory canonical, orbit aliases point to /observatory
- middleware: PAGES orbit/orbit-veil resolve to /observatory imageKey, OG child favicons preserved
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
- [x] /orbit → /observatory redirect
- [x] Swiss loads, version shown in HUD
- [x] All toggles wired
- [x] Cesium globe loads, city search works, Mapillary link
- [x] Satellites iframe still at /orbit-veil-runtime
