import { useEffect, useRef, useState } from 'react';
import { useObservatory } from '../state/ObservatoryContext';
import { MAJOR_CITIES } from '../data/missions';
import { fetchEarthquakes, fetchEonet, fetchGlobalWindGrid, fetchRealWindGrid } from '../lib/meteo';
import { computeACLines, jdFromDate } from '../lib/astroCartography';

type CesiumViewer = import('cesium').Viewer;

export function EarthExploreMode() {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const { observer, setObserver, layers, query, chart, enabledBodies } = useObservatory();
  const [status, setStatus] = useState('Loading Cesium…');
  const [cityQ, setCityQ] = useState('');
  const [hits, setHits] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [metStatus, setMetStatus] = useState('');
  const imageryHandles = useRef<Record<string, import('cesium').ImageryLayer | null>>({});
  const acEntities = useRef<string[]>([]);
  const satInterval = useRef<number | null>(null);

  // Init viewer
  useEffect(() => {
    let cancelled = false;
    let viewer: CesiumViewer | null = null;

    (async () => {
      try {
        const Cesium = await import('cesium');
        await import('cesium/Build/Cesium/Widgets/widgets.css');
        if (!hostRef.current || cancelled) return;
        (Cesium as any).Ion.defaultAccessToken = undefined;

        const esri = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri, Maxar — below meteorology, below satellites',
          maximumLevel: 19,
        });

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
        } as any);

        // Imagery order: base Earth (Esri) *below* all meteorology, below satellite entities
        (viewer as any).imageryLayers.addImageryProvider(esri);

        // Enable depth test against terrain? Keep disabled for now
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = false;

        if (viewer.scene.skyAtmosphere) {
          (viewer.scene.skyAtmosphere as any).show = true;
        }

        viewerRef.current = viewer;
        setStatus('');

        // Fly to observer
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 9_000_000),
          duration: 1.2,
        });

        // Click to set observer
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement: any) => {
          const picked = viewer!.scene.pickPosition(movement.position);
          if (!picked) return;
          const carto = Cesium.Cartographic.fromCartesian(picked);
          const lon = (carto.longitude * 180) / Math.PI;
          const lat = (carto.latitude * 180) / Math.PI;
          setObserver({ lat, lon, alt: 10 });
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // City search param react
        if (query) {
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
            );
            const j = (await r.json()) as any[];
            if (j.length > 0) {
              const first = j[0];
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(Number(first.lon), Number(first.lat), 2_000_000),
                duration: 1,
              });
            }
          } catch {}
        }
      } catch (e) {
        console.error(e);
        setStatus('Cesium failed — check console');
      }
    })();

    return () => {
      cancelled = true;
      if (satInterval.current) window.clearInterval(satInterval.current);
      if (viewer) {
        try { viewer.destroy(); } catch {}
      }
      viewerRef.current = null;
    };
  }, []); // eslint-disable-line

  // Update camera when observer changes via HUD
  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    // don't auto fly on every tiny move? Only if user picks city via hits
  }, [observer]);

  // City local search (Nominatim) — independent of viewer to allow typeahead
  useEffect(() => {
    const q = cityQ.trim();
    if (q.length < 2) { setHits([]); return; }
    const id = window.setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=0`, {
          headers: { 'Accept-Language': 'en' } as any,
        });
        const j = (await r.json()) as any[];
        setHits(j.map((x) => ({ name: x.display_name as string, lat: Number(x.lat), lon: Number(x.lon) })).slice(0, 6));
      } catch { setHits([]); }
    }, 320);
    return () => window.clearTimeout(id);
  }, [cityQ]);

  const flyTo = async (lat: number, lon: number) => {
    const Cesium = await import('cesium');
    viewerRef.current?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1_500_000),
      duration: 1.2,
    });
    setObserver({ lat, lon, alt: 10 });
    setHits([]);
    setCityQ('');
  };

  // Meteorology layers handling
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      const hasKey = (k: string) => !!(import.meta as any).env?.[k];

      // Helper to get or create imagery layer
      const ensureImagery = (id: string, provider: import('cesium').ImageryProvider, alpha = 0.65, belowIdx = 1) => {
        let handle = imageryHandles.current[id];
        if (!handle) {
          const layer = viewer.imageryLayers.addImageryProvider(provider, belowIdx);
          (layer as any).alpha = alpha;
          imageryHandles.current[id] = layer;
          return layer;
        }
        handle.show = true;
        return handle;
      };
      const hideImagery = (id: string) => {
        const l = imageryHandles.current[id];
        if (l) l.show = false;
      };

      // Clouds — OWM clouds_new if key, else NASA GIBS True Color as proxy (below satellite)
      if (layers.clouds) {
        if (hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY as string;
          const prov = new Cesium.UrlTemplateImageryProvider({
            url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}`,
            credit: 'OpenWeatherMap clouds — below satellite layer',
            maximumLevel: 8,
          });
          ensureImagery('clouds', prov, 0.55, 1);
        } else {
          // Fallback GIBS MODIS Terra true color with recent date; visual below satellite
          const today = new Date().toISOString().slice(0, 10);
          const gibsUrl = `https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/${today}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
          const prov = new Cesium.UrlTemplateImageryProvider({
            url: gibsUrl,
            credit: 'NASA GIBS MODIS Terra — proxy clouds, below satellite',
            maximumLevel: 9,
          });
          ensureImagery('clouds', prov, 0.6, 1);
          setMetStatus('Clouds: GIBS fallback (set VITE_OPENWEATHER_KEY for OWM)');
        }
      } else hideImagery('clouds');

      if (layers.precipitation && hasKey('VITE_OPENWEATHER_KEY')) {
        const key = (import.meta as any).env.VITE_OPENWEATHER_KEY as string;
        const prov = new Cesium.UrlTemplateImageryProvider({
          url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`,
          credit: 'OWM precipitation',
          maximumLevel: 8,
        });
        ensureImagery('precip', prov, 0.6, 2);
      } else hideImagery('precip');

      if (layers.temperature && hasKey('VITE_OPENWEATHER_KEY')) {
        const key = (import.meta as any).env.VITE_OPENWEATHER_KEY as string;
        const prov = new Cesium.UrlTemplateImageryProvider({
          url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${key}`,
          credit: 'OWM temperature',
          maximumLevel: 8,
        });
        ensureImagery('temp', prov, 0.55, 2);
      } else hideImagery('temp');

      if (layers.winds && hasKey('VITE_OPENWEATHER_KEY')) {
        const key = (import.meta as any).env.VITE_OPENWEATHER_KEY as string;
        const prov = new Cesium.UrlTemplateImageryProvider({
          url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${key}`,
          credit: 'OWM wind',
          maximumLevel: 8,
        });
        ensureImagery('wind-tiles', prov, 0.5, 2);
      } else hideImagery('wind-tiles');

      if (layers.traffic) {
        if (hasKey('VITE_TOMTOM_KEY')) {
          const key = (import.meta as any).env.VITE_TOMTOM_KEY as string;
          const prov = new Cesium.UrlTemplateImageryProvider({
            url: `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${key}`,
            credit: 'TomTom traffic — below satellite',
            maximumLevel: 19,
          });
          ensureImagery('traffic', prov, 0.75, 3);
        } else {
          setMetStatus('Traffic needs VITE_TOMTOM_KEY (TomTom)');
          hideImagery('traffic');
        }
      } else hideImagery('traffic');

      // Earthquakes
      if (layers.earthquakes) {
        for (const e of viewer.entities.values) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
        setMetStatus('Loading USGS quakes…');
        const quakes = await fetchEarthquakes();
        for (const q of quakes.slice(0, 200)) {
          const mag = q.mag ?? 0;
          const color = mag > 5.5 ? Cesium.Color.RED : mag > 4 ? Cesium.Color.ORANGE : Cesium.Color.YELLOW.withAlpha(0.9);
          viewer.entities.add({
            id: `quake-${q.id}`,
            position: Cesium.Cartesian3.fromDegrees(q.lon, q.lat, Math.min(10000, q.depth * 1000 + mag * 4000)),
            point: {
              pixelSize: Math.max(5, Math.min(16, mag * 2.4 + 3)),
              color,
              outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
              outlineWidth: 1,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND as any,
            },
            label: mag >= 4 ? {
              text: `M${mag.toFixed(1)}`,
              font: '10px monospace',
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              pixelOffset: new Cesium.Cartesian2(8, -4),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            } : undefined,
            description: `${q.place}<br/>M${mag} depth ${q.depth}km<br/>${new Date(q.time).toUTCString()}`,
          });
        }
        setMetStatus(`USGS ${quakes.length} quakes — below satellites`);
      } else {
        for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
      }

      // EONET
      if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) {
        for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('eonet-')) viewer.entities.remove(e);
        const events = await fetchEonet();
        const filterSet = () => {
          const s = new Set<string>();
          if (layers.eonet) s.add('*');
          if (layers.storms) s.add('Severe Storms');
          if (layers.wildfires) s.add('Wildfires');
          if (layers.volcanoes) s.add('Volcanoes');
          return s;
        };
        const want = filterSet();
        const filtered = events.filter((ev) => want.has('*') || want.has(ev.category) ||
          (layers.storms && ev.category.toLowerCase().includes('storm')) ||
          (layers.wildfires && ev.category.toLowerCase().includes('fire')) ||
          (layers.volcanoes && ev.category.toLowerCase().includes('volcano')));
        for (const ev of filtered.slice(0, 120)) {
          const isStorm = ev.category.toLowerCase().includes('storm');
          const isFire = ev.category.toLowerCase().includes('fire');
          const isVolc = ev.category.toLowerCase().includes('volcano');
          const color = isStorm ? Cesium.Color.CYAN : isFire ? Cesium.Color.ORANGE : isVolc ? Cesium.Color.RED : Cesium.Color.LIME;
          viewer.entities.add({
            id: `eonet-${ev.id}`,
            position: Cesium.Cartesian3.fromDegrees(ev.lon, ev.lat, 12000),
            point: {
              pixelSize: isStorm ? 10 : 8,
              color,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            description: `<b>${ev.title}</b><br/>${ev.category}<br/>${ev.date}<br/><a href="https://eonet.gsfc.nasa.gov" target="_blank">EONET</a>`,
          });
        }
        setMetStatus(`EONET ${filtered.length}/${events.length} events`);
      } else {
        const v = viewerRef.current;
        if (v) for (const e of [...v.entities.values]) if ((e.id ?? '').startsWith('eonet-')) v.entities.remove(e);
      }

      // Winds sampled arrows — below satellite ISS
      if (layers.winds) {
        for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
        try {
          const samples = await fetchRealWindGrid().then((r) => (r.length > 10 ? r : fetchGlobalWindGrid()));
          const winds = Array.isArray(samples) ? await samples : await fetchGlobalWindGrid();
          for (let i = 0; i < winds.length; i++) {
            const w = winds[i]!;
            const speed = Math.sqrt(w.u * w.u + w.v * w.v);
            if (speed < 0.5) continue;
            const scale = 200000; // meters per m/s for visualization
            const bearing = Math.atan2(w.u, w.v);
            const lenDeg = speed * 0.6;
            const lon2 = w.lon + (Math.sin(bearing) * lenDeg);
            const lat2 = w.lat + (Math.cos(bearing) * lenDeg);
            viewer.entities.add({
              id: `wind-${i}`,
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([w.lon, w.lat, 8000, lon2, lat2, 8000]),
                width: Math.min(3, Math.max(1, speed / 6)),
                material: speed > 12 ? Cesium.Color.CYAN.withAlpha(0.9) : Cesium.Color.WHITE.withAlpha(0.45),
                clampToGround: false,
              },
            });
          }
        } catch (e) { console.warn('wind layer', e); }
      } else {
        for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
      }

    })();
  }, [layers.earthquakes, layers.eonet, layers.storms, layers.wildfires, layers.volcanoes, layers.clouds, layers.precipitation, layers.temperature, layers.winds, layers.traffic]);

  // Astro-cartography lines — filtered by enabledBodies, below satellite but above meteorology
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      // clear previous
      for (const id of acEntities.current) {
        const e = viewer.entities.getById(id);
        if (e) viewer.entities.remove(e);
      }
      acEntities.current = [];

      if (!layers.astroCartography) return;

      // Use chart planets but keep only enabled bodies
      const planets = chart.planets.filter((p) => enabledBodies[p.id] !== false);
      const jd = jdFromDate(chart.time);
      const lines = computeACLines(jd, planets);

      // Group by body to assign distinct hue; keep MC/IC/ASC/DSC color coding
      for (const line of lines) {
        if (line.points.length < 2) continue;
        // Skip if body disabled after initial filter (safety)
        const eb = enabledBodies as Record<string, boolean | undefined>;
        const bodyEnabled = eb[line.body] !== false || planets.some((p) => p.name === line.body);
        if (!bodyEnabled && (line.body as any) !== chart.planets[0]?.name) {
          // still keep if matching planet name exists in filtered list
          if (!planets.some((p) => p.name === line.body)) continue;
        }
        const col = Cesium.Color.fromCssColorString(line.bodyColor).withAlpha(line.type === 'ASC' || line.type === 'DSC' ? 0.65 : 0.9);
        const width = line.type === 'MC' || line.type === 'IC' ? 2 : 1.2;
        const positions = line.points.flatMap((p) => [p.lon, p.lat]);
        // Handle dateline wrapping by splitting segments > 180 diff
        const segs: number[][] = [];
        let cur: number[] = [];
        for (let i = 0; i < line.points.length; i++) {
          const pt = line.points[i]!;
          if (cur.length >= 2) {
            const prevLon = cur[cur.length - 2]!;
            if (Math.abs(pt.lon - prevLon) > 160) {
              if (cur.length >= 4) segs.push(cur);
              cur = [];
            }
          }
          cur.push(pt.lon, pt.lat);
        }
        if (cur.length >= 4) segs.push(cur);
        const targetSegs = segs.length ? segs : [positions];
        for (let sIdx = 0; sIdx < targetSegs.length; sIdx++) {
          const seg = targetSegs[sIdx]!;
          const id = `${line.id}-seg-${sIdx}`;
          viewer.entities.add({
            id,
            name: line.label,
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(seg),
              width,
              material: col,
              clampToGround: true,
            },
          });
          acEntities.current.push(id);
        }
      }
      setMetStatus((m) => `${m} | AC ${lines.length} lines (${planets.length} bodies)`);
    })();
  }, [layers.astroCartography, chart, enabledBodies]);

  // Sat overlay (ISS) — satellite layer above meteorology
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (satInterval.current) window.clearInterval(satInterval.current);

    const ensureIss = async (lat: number, lon: number) => {
      const Cesium = await import('cesium');
      let e = viewer.entities.getById('sat-iss');
      const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 408000);
      if (!e) {
        e = viewer.entities.add({
          id: 'sat-iss',
          name: 'ISS — satellite layer above meteoro',
          position: pos,
          point: {
            pixelSize: 10,
            color: Cesium.Color.LIME,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: 'ISS',
            font: '11px monospace',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            pixelOffset: new Cesium.Cartesian2(10, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      } else {
        (e.position as any) = pos as any;
      }
    };

    const tick = async () => {
      try {
        const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!r.ok) throw new Error('iss');
        const j = (await r.json()) as any;
        await ensureIss(Number(j.latitude), Number(j.longitude));
      } catch {
        // fallback synthetic orbit
        const t = Date.now() / 1000;
        const lon = ((t * 0.06) % 360) - 180;
        const lat = 51.6 * Math.sin(t * 0.001);
        await ensureIss(lat, lon);
      }
    };
    tick();
    satInterval.current = window.setInterval(tick, 5000) as any;
    return () => { if (satInterval.current) window.clearInterval(satInterval.current); };
  }, []);

  // Major cities layer — small dots
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !layers.cities) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const c of MAJOR_CITIES) {
        const cid = `city-${c.name.toLowerCase().replace(/\s+/g,'-')}`;
        if (viewer.entities.getById(cid)) continue;
        viewer.entities.add({
          id: cid,
          position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat, 2000),
          point: {
            pixelSize: 3,
            color: Cesium.Color.WHITE.withAlpha(0.7),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: c.name,
            font: '10px sans-serif',
            fillColor: Cesium.Color.WHITE.withAlpha(0.65),
            pixelOffset: new Cesium.Cartesian2(6, -6),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5_000_000),
          } as any,
        });
      }
    })();
  }, [layers.cities]);

  return (
    <div className="obs-earth-wrap">
      <div ref={hostRef} className="obs-cesium-host" />
      <div className="obs-earth-tools">
        <div className="obs-earth-search">
          <input value={cityQ} onChange={(e) => setCityQ(e.target.value)} placeholder="Search city (Nominatim)…" aria-label="City search" />
          {hits.length > 0 && (
            <div className="obs-city-hits">
              {hits.map((h, i) => (
                <button key={i} type="button" onClick={() => flyTo(h.lat, h.lon)} title={h.name}>
                  {h.name.slice(0, 72)}
                </button>
              ))}
            </div>
          )}
          <div className="obs-earth-note">
            Esri World Imagery max 19 — closest open to Google Earth. Mapillary link for street-level. Imagery below meteorology, below satellites (ISS).<br />
            <a href={`https://www.mapillary.com/app/?lat=${observer.lat}&lng=${observer.lon}&z=16`} target="_blank" rel="noreferrer">Open Mapillary at observer →</a>
            <br />Double-click globe to set observer (affects houses).
          </div>
        </div>
        {status && <div className="obs-earth-status">{status}</div>}
        {metStatus && <div className="obs-earth-status obs-earth-status--met">{metStatus}</div>}
        <div className="obs-earth-quick">
          {Object.entries({
            earthquakes: 'Quakes USGS',
            eonet: 'Disasters EONET',
            storms: 'Storms',
            wildfires: 'Fires',
            volcanoes: 'Volcanoes',
            clouds: 'Clouds GIBS/OWM',
            precipitation: 'Rain OWM',
            temperature: 'Temp OWM',
            winds: 'Winds',
            traffic: 'Traffic TomTom',
            astroCartography: 'Astro-Cartography',
          }).map(([k, label]) => (
            <span key={k} className="obs-pill" data-on={(layers as any)[k] ? 'yes' : 'no'}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
