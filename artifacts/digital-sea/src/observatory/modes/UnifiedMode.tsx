import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useObservatory } from '../state/ObservatoryContext';
import { MAJOR_CITIES, MISSIONS } from '../data/missions';
import { CONSTELLATIONS } from '../data/constellations';
import { fetchEarthquakes, fetchEonet, fetchGlobalWindGrid, fetchRealWindGrid } from '../lib/meteo';
import { computeACLines, jdFromDate } from '../lib/astroCartography';
import { raDecToVector } from '../lib/math';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const SolarMini = lazy(() => import('./SolarSystemMode').then((m) => ({ default: m.SolarSystemMode })));

type CesiumViewer = import('cesium').Viewer;
const CITY_LOOKUP = MAJOR_CITIES.map((c) => ({ ...c, id: c.name.toLowerCase() }));

export function UnifiedMode() {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const { observer, setObserver, layers, chart, enabledBodies, enabledAspects, selectedPlanet, setSelectedPlanet, setSelectedMission } = useObservatory();
  const [status, setStatus] = useState('Initializing 3D world…');
  const [cityQ, setCityQ] = useState('');
  const [hits, setHits] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [metStatus, setMetStatus] = useState('');
  const [hoverTip, setHoverTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const imageryHandles = useRef<Record<string, import('cesium').ImageryLayer | null>>({});
  const acEntities = useRef<string[]>([]);
  const planetEntities = useRef<string[]>([]);
  const missionEntities = useRef<string[]>([]);
  const constellationEntities = useRef<string[]>([]);
  const satInterval = useRef<number | null>(null);
  const lastHoveredRef = useRef<any>(null);
  const lastHoveredOriginal = useRef<{ pixelSize: number; color: any } | null>(null);

  useEffect(() => {
    const q = cityQ.trim().toLowerCase();
    if (q.length < 2) { setHits([]); return; }
    const local = CITY_LOOKUP.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6).map((c) => ({ name: c.name, lat: c.lat, lon: c.lon }));
    const id = window.setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6`, { headers: { 'Accept-Language': 'en' } as any });
        if (!r.ok) throw new Error();
        const j = (await r.json()) as any[];
        const remote = j.map((x) => ({ name: x.display_name, lat: Number(x.lat), lon: Number(x.lon) }));
        setHits(remote.length ? remote.slice(0, 6) : local);
      } catch { setHits(local); }
    }, 260);
    return () => window.clearTimeout(id);
  }, [cityQ]);

  // Cesium init
  useEffect(() => {
    let cancelled = false;
    let viewer: CesiumViewer | null = null;
    (window as any).CESIUM_BASE_URL = '/cesium/';
    let moveHandler: any = null;
    let clickHandler: any = null;

    (async () => {
      try {
        setStatus('Loading Cesium globe…');
        const Cesium = await import('cesium');
        if (!hostRef.current || cancelled) return;
        (Cesium as any).Ion.defaultAccessToken = undefined;
        const esri = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri',
          maximumLevel: 19,
        });
        setStatus('Creating 3D world…');
        viewer = new Cesium.Viewer(hostRef.current, {
          baseLayer: false as any,
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: true,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: true,
          selectionIndicator: true,
          shouldAnimate: true,
        } as any);
        (viewer as any).imageryLayers.addImageryProvider(esri);
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.resolutionScale = Math.min(1.75, window.devicePixelRatio || 1);
        viewerRef.current = viewer;
        setStatus('');

        try {
          viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 25_000_000) });
          viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 8_000_000), duration: 2.2, easingFunction: Cesium.EasingFunction.QUADRATIC_OUT });
        } catch {}

        // Double click to set observer
        clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        clickHandler.setInputAction((movement: any) => {
          try {
            const picked = viewer!.scene.pickPosition(movement.position);
            if (!picked) return;
            const carto = Cesium.Cartographic.fromCartesian(picked);
            setObserver({ lat: (carto.latitude * 180) / Math.PI, lon: (carto.longitude * 180) / Math.PI, alt: 10 });
          } catch {}
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Hover highlight with toggle reference
        moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        moveHandler.setInputAction((movement: any) => {
          try {
            const picked = viewer!.scene.pick(movement.endPosition);
            // Restore previous
            if (lastHoveredRef.current && (!picked || picked.id !== lastHoveredRef.current)) {
              const prev = lastHoveredRef.current;
              if (prev && prev.point && lastHoveredOriginal.current) {
                (prev.point as any).pixelSize = lastHoveredOriginal.current.pixelSize;
                (prev.point as any).color = lastHoveredOriginal.current.color;
              }
              lastHoveredRef.current = null;
              lastHoveredOriginal.current = null;
              setHoverTip(null);
            }
            if (Cesium.defined(picked) && picked.id) {
              const entity = picked.id as any;
              const id = entity.id as string;
              let tip = '';
              if (id.startsWith('planet-sky-')) {
                const bodyId = id.replace('planet-sky-', '');
                const enabled = (enabledBodies as any)[bodyId] !== false;
                tip = `${bodyId} · Bodies → ${bodyId} is ${enabled ? 'enabled' : 'disabled'} · click to select`;
                if (entity.point) {
                  lastHoveredOriginal.current = { pixelSize: (entity.point as any).pixelSize?.getValue ? (entity.point as any).pixelSize.getValue() : (entity.point as any).pixelSize, color: (entity.point as any).color };
                  (entity.point as any).pixelSize = 14;
                  (entity.point as any).color = Cesium.Color.WHITE;
                }
              } else if (id.startsWith('quake-')) {
                tip = `Earthquake · Layers → Quakes ${layers.earthquakes ? 'enabled' : 'disabled'} · USGS all_day`;
              } else if (id.startsWith('eonet-')) {
                const isStorm = id.toLowerCase().includes('storm') || entity.name?.toLowerCase?.().includes('storm');
                tip = `EONET event · Layers → ${isStorm ? 'Storms' : 'EONET/Wildfires/Volcanoes'} ${layers.eonet || layers.storms ? 'enabled' : 'disabled'}`;
              } else if (id.startsWith('mission-')) {
                const mid = id.replace('mission-', '');
                tip = `Mission ${mid} · Layers → Missions ${layers.missions ? 'enabled' : 'disabled'} · Missions panel`;
              } else if (id.startsWith('sat-iss')) {
                tip = `ISS live · Layers → Satellites enabled · satellite layer above meteo`;
              } else if (id.includes('-seg-')) {
                // AC line
                const name = entity.name ?? id;
                tip = `Astro-Cartography ${name} · Layers → AC ${layers.astroCartography ? 'enabled' : 'disabled'} · Bodies toggle filters lines`;
              } else if (id.startsWith('const-')) {
                tip = `Constellation line · Layers → Constellations ${layers.constellations ? 'enabled' : 'disabled'} · colored correlation ready`;
              } else if (id.startsWith('city-')) {
                tip = `City · Layers → Cities ${layers.cities ? 'enabled' : 'disabled'}`;
              } else if (id.startsWith('wind-')) {
                tip = `Wind vector · Layers → Winds ${layers.winds ? 'enabled' : 'disabled'} · Open-Meteo real + synthetic`;
              }
              if (tip) {
                setHoverTip({ x: movement.endPosition.x, y: movement.endPosition.y, text: tip });
                lastHoveredRef.current = entity;
              }
            }
          } catch {}
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        (viewer as any).selectedEntityChanged.addEventListener((sel: any) => {
          if (!sel) return;
          const id = sel.id as string;
          if (id.startsWith('planet-sky-')) setSelectedPlanet(id.replace('planet-sky-', ''));
          else if (id.startsWith('mission-')) setSelectedMission(id.replace('mission-', ''));
        });

      } catch (e: any) {
        console.error('[Cesium] failed', e);
        setStatus(`Cesium failed: ${e?.message ?? String(e)} — solar system remains`);
      }
    })();
    return () => {
      cancelled = true;
      if (satInterval.current) window.clearInterval(satInterval.current);
      try { moveHandler?.destroy(); } catch {}
      try { clickHandler?.destroy(); } catch {}
      if (viewer) { try { viewer.destroy(); } catch {} }
      viewerRef.current = null;
    };
  }, []); // eslint-disable-line

  // Layers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      try {
        const Cesium = await import('cesium');
        const hasKey = (k: string) => !!(import.meta as any).env?.[k];
        const ensure = (id: string, prov: any, alpha = 0.6, idx = 1) => {
          let h = imageryHandles.current[id];
          if (!h) { const layer = viewer.imageryLayers.addImageryProvider(prov, idx); (layer as any).alpha = alpha; imageryHandles.current[id] = layer; return layer; }
          h.show = true; return h;
        };
        const hide = (id: string) => { const l = imageryHandles.current[id]; if (l) l.show = false; };
        if (layers.clouds) {
          if (hasKey('VITE_OPENWEATHER_KEY')) {
            const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
            ensure('clouds', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.55, 1);
          } else {
            const today = new Date().toISOString().slice(0, 10);
            ensure('clouds', new Cesium.UrlTemplateImageryProvider({ url: `https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/${today}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`, maximumLevel: 9 }), 0.6, 1);
          }
        } else hide('clouds');
        if (layers.precipitation && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensure('precip', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.6, 2);
        } else hide('precip');
        if (layers.temperature && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensure('temp', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.55, 2);
        } else hide('temp');
        if (layers.winds && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensure('wind-tiles', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.5, 2);
        } else hide('wind-tiles');
        if (layers.traffic) {
          if (hasKey('VITE_TOMTOM_KEY')) {
            const key = (import.meta as any).env.VITE_TOMTOM_KEY;
            ensure('traffic', new Cesium.UrlTemplateImageryProvider({ url: `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${key}`, maximumLevel: 19 }), 0.75, 3);
          } else hide('traffic');
        } else hide('traffic');

        if (layers.earthquakes) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
          try {
            const quakes = await fetchEarthquakes();
            for (const q of quakes.slice(0, 200)) {
              const mag = q.mag ?? 0;
              const color = mag > 5.5 ? Cesium.Color.RED : mag > 4 ? Cesium.Color.ORANGE : Cesium.Color.YELLOW.withAlpha(0.9);
              viewer.entities.add({ id: `quake-${q.id}`, position: Cesium.Cartesian3.fromDegrees(q.lon, q.lat, Math.min(10000, q.depth * 1000 + mag * 4000)), point: { pixelSize: Math.max(5, Math.min(16, mag * 2.4 + 3)), color, outlineColor: Cesium.Color.BLACK.withAlpha(0.8), outlineWidth: 1, disableDepthTestDistance: Number.POSITIVE_INFINITY, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND as any } as any });
            }
            setMetStatus(`${quakes.length} quakes`);
          } catch { setMetStatus('Quakes unavailable'); }
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
        }

        if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('eonet-')) viewer.entities.remove(e);
          try {
            const events = await fetchEonet();
            const want = new Set<string>(); if (layers.eonet) want.add('*'); if (layers.storms) want.add('Severe Storms'); if (layers.wildfires) want.add('Wildfires'); if (layers.volcanoes) want.add('Volcanoes');
            const filtered = events.filter((ev) => want.has('*') || want.has(ev.category) || (layers.storms && /storm/i.test(ev.category)) || (layers.wildfires && /fire/i.test(ev.category)) || (layers.volcanoes && /volcano/i.test(ev.category)));
            for (const ev of filtered.slice(0, 120)) {
              const cat = ev.category.toLowerCase();
              const color = /storm/.test(cat) ? Cesium.Color.CYAN : /fire/.test(cat) ? Cesium.Color.ORANGE : /volcano/.test(cat) ? Cesium.Color.RED : Cesium.Color.LIME;
              viewer.entities.add({ id: `eonet-${ev.id}`, position: Cesium.Cartesian3.fromDegrees(ev.lon, ev.lat, 12000), point: { pixelSize: 9, color, outlineColor: Cesium.Color.BLACK, outlineWidth: 1, disableDepthTestDistance: Number.POSITIVE_INFINITY } as any });
            }
            setMetStatus((s) => `${s} | ${filtered.length} EONET`);
          } catch { setMetStatus((s) => `${s} | EONET unavailable`); }
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('eonet-')) viewer.entities.remove(e);
        }

        if (layers.winds) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
          try {
            const real = await fetchRealWindGrid().catch(() => [] as any[]);
            const winds = real.length > 5 ? real : await fetchGlobalWindGrid();
            for (let i = 0; i < winds.length; i++) {
              const w = winds[i]!; const speed = Math.sqrt(w.u * w.u + w.v * w.v); if (speed < 0.5) continue;
              const bearing = Math.atan2(w.u, w.v); const lenDeg = speed * 0.55; const lon2 = w.lon + Math.sin(bearing) * lenDeg; const lat2 = w.lat + Math.cos(bearing) * lenDeg;
              viewer.entities.add({ id: `wind-${i}`, polyline: { positions: Cesium.Cartesian3.fromDegreesArrayHeights([w.lon, w.lat, 8000, lon2, lat2, 8000]), width: Math.min(3, Math.max(1, speed / 6)), material: speed > 12 ? Cesium.Color.CYAN.withAlpha(0.9) : Cesium.Color.WHITE.withAlpha(0.4) } as any });
            }
          } catch {}
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
        }
      } catch (e) { console.warn(e); }
    })();
  }, [layers.earthquakes, layers.eonet, layers.storms, layers.wildfires, layers.volcanoes, layers.clouds, layers.precipitation, layers.temperature, layers.winds, layers.traffic]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const id of acEntities.current) { const e = viewer.entities.getById(id); if (e) viewer.entities.remove(e); } acEntities.current = [];
      if (!layers.astroCartography) return;
      const planets = chart.planets.filter((p) => (enabledBodies as any)[p.id] !== false);
      const jd = jdFromDate(chart.time);
      const lines = computeACLines(jd, planets);
      for (const line of lines) {
        if (line.points.length < 2) continue;
        const col = Cesium.Color.fromCssColorString(line.bodyColor).withAlpha(line.type === 'ASC' || line.type === 'DSC' ? 0.65 : 0.9);
        const width = line.type === 'MC' || line.type === 'IC' ? 2 : 1.2;
        const segs: number[][] = []; let cur: number[] = [];
        for (let i = 0; i < line.points.length; i++) {
          const pt = line.points[i]!; if (cur.length >= 2) { const prev = cur[cur.length - 2]!; if (Math.abs(pt.lon - prev) > 160) { if (cur.length >= 4) segs.push(cur); cur = []; } } cur.push(pt.lon, pt.lat);
        }
        if (cur.length >= 4) segs.push(cur);
        const target = segs.length ? segs : [line.points.flatMap((p) => [p.lon, p.lat])];
        for (let sIdx = 0; sIdx < target.length; sIdx++) {
          const seg = target[sIdx]!; if (seg.length < 4) continue;
          const id = `${line.id}-seg-${sIdx}`;
          viewer.entities.add({ id, name: line.label, polyline: { positions: Cesium.Cartesian3.fromDegreesArray(seg), width, material: col, clampToGround: true } as any });
          acEntities.current.push(id);
        }
      }
    })();
  }, [layers.astroCartography, chart, enabledBodies]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const id of planetEntities.current) { const e = viewer.entities.getById(id); if (e) viewer.entities.remove(e); } planetEntities.current = [];
      if (!layers.planets) return;
      const DIST = 48_000_000;
      for (const p of chart.planets) {
        if ((enabledBodies as any)[p.id] === false) continue;
        if (p.id === 'Earth') continue;
        const dir = p.sky;
        const pos = new Cesium.Cartesian3(dir.x * DIST, dir.y * DIST, dir.z * DIST);
        const isSel = selectedPlanet === p.id;
        const size = p.id === 'Sun' ? 14 : p.id === 'Moon' ? 10 : p.id === 'Jupiter' || p.id === 'Saturn' ? 8 : 6;
        const color = Cesium.Color.fromCssColorString(p.color);
        viewer.entities.add({
          id: `planet-sky-${p.id}`,
          name: `${p.name}`,
          position: pos,
          point: { pixelSize: isSel ? size + 5 : size, color: color.withAlpha(0.95), outlineColor: Cesium.Color.WHITE.withAlpha(isSel ? 0.9 : 0), outlineWidth: isSel ? 2 : 0, disableDepthTestDistance: Number.POSITIVE_INFINITY } as any,
          label: layers.labels ? { text: `${p.name}${p.retro ? ' ℞' : ''}`, font: '11px JetBrains Mono, monospace', fillColor: Cesium.Color.WHITE, style: Cesium.LabelStyle.FILL_AND_OUTLINE, outlineWidth: 2, pixelOffset: new Cesium.Cartesian2(12, 0), disableDepthTestDistance: Number.POSITIVE_INFINITY, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 90_000_000) } as any : undefined,
        });
        planetEntities.current.push(`planet-sky-${p.id}`);
      }
    })();
  }, [chart, layers.planets, layers.labels, enabledBodies, selectedPlanet]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const id of constellationEntities.current) { const e = viewer.entities.getById(id); if (e) viewer.entities.remove(e); } constellationEntities.current = [];
      if (!layers.constellations) return;
      const DIST = 60_000_000;
      for (const cons of CONSTELLATIONS) {
        for (let li = 0; li < cons.lines.length; li++) {
          const [aIdx, bIdx] = cons.lines[li]!;
          const sa = cons.stars[aIdx]; const sb = cons.stars[bIdx]; if (!sa || !sb) continue;
          const va = raDecToVector(sa.ra, sa.dec); const vb = raDecToVector(sb.ra, sb.dec);
          const id = `const-${cons.id}-${li}`;
          viewer.entities.add({ id, name: `${cons.name} ${cons.abbr}`, polyline: { positions: [new Cesium.Cartesian3(va.x * DIST, va.y * DIST, va.z * DIST), new Cesium.Cartesian3(vb.x * DIST, vb.y * DIST, vb.z * DIST)], width: 1, material: Cesium.Color.fromCssColorString('#7dd3fc').withAlpha(0.45) } as any });
          constellationEntities.current.push(id);
        }
      }
    })();
  }, [layers.constellations]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const id of missionEntities.current) { const e = viewer.entities.getById(id); if (e) viewer.entities.remove(e); } missionEntities.current = [];
      if (!layers.missions && !layers.satellites) return;
      for (const c of MAJOR_CITIES.slice(0, 50)) {
        const cid = `city-${c.name.toLowerCase().replace(/\s+/g, '-')}`;
        if (viewer.entities.getById(cid)) continue;
        if (!layers.cities) continue;
        viewer.entities.add({ id: cid, position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat, 1000), point: { pixelSize: 2.5, color: Cesium.Color.WHITE.withAlpha(0.55), disableDepthTestDistance: Number.POSITIVE_INFINITY } as any, label: { text: c.name, font: '10px Inter, sans-serif', fillColor: Cesium.Color.WHITE.withAlpha(0.6), pixelOffset: new Cesium.Cartesian2(6, -6), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6_000_000) } as any });
      }
      for (const m of MISSIONS) {
        if (m.domain === 'rover') continue;
        const id = `mission-${m.id}`;
        const pos = Cesium.Cartesian3.fromDegrees(-80 + Math.random() * 20, 28 + Math.random() * 10, 650000);
        viewer.entities.add({ id, name: m.name, position: pos, point: { pixelSize: 7, color: Cesium.Color.fromCssColorString(m.color), outlineColor: Cesium.Color.WHITE, outlineWidth: 1, disableDepthTestDistance: Number.POSITIVE_INFINITY } as any, description: `${m.name}<br/>${m.summary}` });
        missionEntities.current.push(id);
      }
    })();
  }, [layers.missions, layers.satellites, layers.cities, layers.labels]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (satInterval.current) window.clearInterval(satInterval.current);
    const ensureIss = async (lat: number, lon: number) => {
      const Cesium = await import('cesium');
      let e = viewer.entities.getById('sat-iss');
      const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 408000);
      if (!e) e = viewer.entities.add({ id: 'sat-iss', position: pos, point: { pixelSize: 11, color: Cesium.Color.LIME, outlineColor: Cesium.Color.WHITE, outlineWidth: 1.5, disableDepthTestDistance: Number.POSITIVE_INFINITY } as any, label: { text: 'ISS', font: '12px JetBrains Mono, monospace', pixelOffset: new Cesium.Cartesian2(12, 0), disableDepthTestDistance: Number.POSITIVE_INFINITY } as any });
      else (e.position as any) = pos as any;
    };
    const tick = async () => {
      try { const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544'); if (!r.ok) throw new Error(); const j = (await r.json()) as any; await ensureIss(Number(j.latitude), Number(j.longitude)); }
      catch { const t = Date.now() / 1000; await ensureIss(51.6 * Math.sin(t * 0.001), ((t * 0.06) % 360) - 180); }
    };
    tick(); satInterval.current = window.setInterval(tick, 5000) as any;
    return () => { if (satInterval.current) window.clearInterval(satInterval.current); };
  }, []);

  const flyTo = async (lat: number, lon: number) => {
    const Cesium = await import('cesium');
    viewerRef.current?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1_400_000), duration: 1.2, easingFunction: Cesium.EasingFunction.QUADRATIC_OUT });
    setObserver({ lat, lon, alt: 10 });
    setHits([]); setCityQ('');
  };

  return (
    <div className="obs-unified">
      <div ref={hostRef} className="obs-cesium-host obs-cesium-host--unified" />
      {hoverTip && (
        <div className="obs-hover-tip" style={{ left: hoverTip.x + 14, top: hoverTip.y + 14 }}>
          {hoverTip.text}
        </div>
      )}
      <div className="obs-unified-overlay">
        <div className="obs-earth-tools obs-earth-tools--unified">
          <div className="obs-earth-search">
            <input value={cityQ} onChange={(e) => setCityQ(e.target.value)} placeholder="Search city or place…" />
            {hits.length > 0 && <div className="obs-city-hits">{hits.map((h, i) => <button key={i} type="button" onClick={() => flyTo(h.lat, h.lon)}>{h.name.slice(0, 84)}</button>)}</div>}
            <div className="obs-earth-note">
              Cesium Earth l19 replaces satellite earth. Hover: highlights + toggle ref · Double-click to set observer.<br />
              <a href={`https://www.mapillary.com/app/?lat=${observer.lat}&lng=${observer.lon}&z=16`} target="_blank" rel="noreferrer">Mapillary street-level →</a>
            </div>
          </div>
          {status && <div className="obs-earth-status">{status}</div>}
          {metStatus && <div className="obs-earth-status obs-earth-status--met">{metStatus}</div>}
          <div className="obs-earth-legend">
            <span className="legend-dot" style={{ background: '#f87171' }} /> Quakes <span className="legend-dot" style={{ background: '#22d3ee' }} /> Storms <span className="legend-dot" style={{ background: '#a3e635' }} /> ISS
          </div>
        </div>
        <div className="obs-solar-mini">
          <div className="obs-solar-mini-hd">
            <span>SOLAR — {chart.planets.length} bodies reactive</span>
            <span className="obs-pill">{chart.zodiac}/{chart.houseSystem}</span>
          </div>
          <div className="obs-solar-mini-canvas">
            <Suspense fallback={<div className="obs-loading">Loading…</div>}>
              <SolarMini />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
