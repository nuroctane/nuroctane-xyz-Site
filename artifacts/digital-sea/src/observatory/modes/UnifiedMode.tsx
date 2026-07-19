import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useObservatory } from '../state/ObservatoryContext';
import { MAJOR_CITIES } from '../data/missions';
import { MISSIONS } from '../data/missions';
import { fetchEarthquakes, fetchEonet, fetchGlobalWindGrid, fetchRealWindGrid } from '../lib/meteo';
import { computeACLines, jdFromDate } from '../lib/astroCartography';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const SolarMini = lazy(() =>
  import('./SolarSystemMode').then((m) => ({ default: m.SolarSystemMode })),
);

type CesiumViewer = import('cesium').Viewer;

export function UnifiedMode() {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const { observer, setObserver, layers, chart, enabledBodies, selectedPlanet } = useObservatory();
  const [status, setStatus] = useState('Initializing Cesium…');
  const [cityQ, setCityQ] = useState('');
  const [hits, setHits] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [metStatus, setMetStatus] = useState('');
  const imageryHandles = useRef<Record<string, import('cesium').ImageryLayer | null>>({});
  const acEntities = useRef<string[]>([]);
  const planetEntities = useRef<string[]>([]);
  const satInterval = useRef<number | null>(null);
  const missionEntities = useRef<string[]>([]);

  useEffect(() => {
    const q = cityQ.trim();
    if (q.length < 2) { setHits([]); return; }
    const id = window.setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6`);
        const j = (await r.json()) as any[];
        setHits(j.map((x) => ({ name: x.display_name, lat: Number(x.lat), lon: Number(x.lon) })).slice(0, 6));
      } catch { setHits([]); }
    }, 320);
    return () => window.clearTimeout(id);
  }, [cityQ]);

  useEffect(() => {
    let cancelled = false;
    let viewer: CesiumViewer | null = null;
    (window as any).CESIUM_BASE_URL = '/cesium/';

    (async () => {
      try {
        setStatus('Loading Cesium module…');
        const Cesium = await import('cesium');
        if (!hostRef.current || cancelled) return;

        // Ensure container has size
        hostRef.current.style.width = '100%';
        hostRef.current.style.height = '100%';

        (Cesium as any).Ion.defaultAccessToken = undefined;

        const esri = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri World Imagery',
          maximumLevel: 19,
        });

        setStatus('Creating Viewer…');
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
        if (viewer.scene.skyAtmosphere) (viewer.scene.skyAtmosphere as any).show = true;

        viewerRef.current = viewer;
        setStatus('');

        try {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 8_500_000),
            duration: 1,
          });
        } catch {}

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement: any) => {
          try {
            const picked = viewer!.scene.pickPosition(movement.position);
            if (!picked) return;
            const carto = Cesium.Cartographic.fromCartesian(picked);
            const lon = (carto.longitude * 180) / Math.PI;
            const lat = (carto.latitude * 180) / Math.PI;
            setObserver({ lat, lon, alt: 10 });
          } catch {}
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      } catch (e: any) {
        console.error('[Unified Cesium] failed', e);
        setStatus(`Cesium failed: ${e?.message ?? String(e)} — fallback to 3D solar only`);
      }
    })();

    return () => {
      cancelled = true;
      if (satInterval.current) window.clearInterval(satInterval.current);
      if (viewer) { try { viewer.destroy(); } catch {} }
      viewerRef.current = null;
    };
  }, []); // eslint-disable-line

  // Layers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      const hasKey = (k: string) => !!(import.meta as any).env?.[k];
      const ensureImagery = (id: string, prov: any, alpha = 0.6, idx = 1) => {
        let h = imageryHandles.current[id];
        if (!h) {
          const layer = viewer.imageryLayers.addImageryProvider(prov, idx);
          (layer as any).alpha = alpha;
          imageryHandles.current[id] = layer;
          return layer;
        }
        h.show = true;
        return h;
      };
      const hide = (id: string) => { const l = imageryHandles.current[id]; if (l) l.show = false; };

      try {
        if (layers.clouds) {
          if (hasKey('VITE_OPENWEATHER_KEY')) {
            const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
            ensureImagery('clouds', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.55, 1);
          } else {
            const today = new Date().toISOString().slice(0,10);
            const url = `https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/${today}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
            ensureImagery('clouds', new Cesium.UrlTemplateImageryProvider({ url, maximumLevel: 9 }), 0.6, 1);
          }
        } else hide('clouds');

        if (layers.precipitation && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensureImagery('precip', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.6, 2);
        } else hide('precip');

        if (layers.temperature && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensureImagery('temp', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.55, 2);
        } else hide('temp');

        if (layers.winds && hasKey('VITE_OPENWEATHER_KEY')) {
          const key = (import.meta as any).env.VITE_OPENWEATHER_KEY;
          ensureImagery('wind-tiles', new Cesium.UrlTemplateImageryProvider({ url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${key}`, maximumLevel: 8 }), 0.5, 2);
        } else hide('wind-tiles');

        if (layers.traffic) {
          if (hasKey('VITE_TOMTOM_KEY')) {
            const key = (import.meta as any).env.VITE_TOMTOM_KEY;
            ensureImagery('traffic', new Cesium.UrlTemplateImageryProvider({ url: `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${key}`, maximumLevel: 19 }), 0.75, 3);
          } else hide('traffic');
        } else hide('traffic');

        if (layers.earthquakes) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
          const quakes = await fetchEarthquakes();
          for (const q of quakes.slice(0,200)) {
            const mag = q.mag ?? 0;
            const color = mag>5.5?Cesium.Color.RED:mag>4?Cesium.Color.ORANGE:Cesium.Color.YELLOW.withAlpha(0.9);
            viewer.entities.add({
              id: `quake-${q.id}`,
              position: Cesium.Cartesian3.fromDegrees(q.lon,q.lat, Math.min(10000, q.depth*1000+mag*4000)),
              point: { pixelSize: Math.max(5,Math.min(16,mag*2.4+3)), color, outlineColor: Cesium.Color.BLACK.withAlpha(0.8), outlineWidth:1, disableDepthTestDistance: Number.POSITIVE_INFINITY, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND as any },
            });
          }
          setMetStatus(`${quakes.length} quakes`);
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('quake-')) viewer.entities.remove(e);
        }

        if (layers.eonet || layers.storms || layers.wildfires || layers.volcanoes) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('eonet-')) viewer.entities.remove(e);
          const events = await fetchEonet();
          const want = new Set<string>(); if (layers.eonet) want.add('*'); if (layers.storms) { want.add('Severe Storms'); want.add('all'); } if (layers.wildfires) want.add('Wildfires'); if (layers.volcanoes) want.add('Volcanoes');
          const filtered = events.filter((ev)=> want.has('*') || want.has(ev.category) || (layers.storms && ev.category.toLowerCase().includes('storm')) || (layers.wildfires && ev.category.toLowerCase().includes('fire')) || (layers.volcanoes && ev.category.toLowerCase().includes('volcano')));
          for (const ev of filtered.slice(0,120)) {
            const isStorm = ev.category.toLowerCase().includes('storm'); const isFire = ev.category.toLowerCase().includes('fire'); const isVolc = ev.category.toLowerCase().includes('volcano');
            const color = isStorm?Cesium.Color.CYAN:isFire?Cesium.Color.ORANGE:isVolc?Cesium.Color.RED:Cesium.Color.LIME;
            viewer.entities.add({ id: `eonet-${ev.id}`, position: Cesium.Cartesian3.fromDegrees(ev.lon,ev.lat,12000), point: { pixelSize: isStorm?10:8, color, outlineColor: Cesium.Color.BLACK, outlineWidth:1, disableDepthTestDistance: Number.POSITIVE_INFINITY } });
          }
          setMetStatus((s)=> `${s} | ${filtered.length} EONET`);
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('eonet-')) viewer.entities.remove(e);
        }

        if (layers.winds) {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
          try {
            const samples = await fetchRealWindGrid().then((r)=> (r.length>5?r:fetchGlobalWindGrid()));
            const winds = Array.isArray(samples)?samples: await fetchGlobalWindGrid();
            for (let i=0;i<winds.length;i++) {
              const w = winds[i]!; const speed = Math.sqrt(w.u*w.u+w.v*w.v); if (speed<0.5) continue;
              const bearing = Math.atan2(w.u,w.v); const lenDeg = speed*0.6; const lon2 = w.lon + Math.sin(bearing)*lenDeg; const lat2 = w.lat + Math.cos(bearing)*lenDeg;
              viewer.entities.add({ id: `wind-${i}`, polyline: { positions: Cesium.Cartesian3.fromDegreesArrayHeights([w.lon,w.lat,8000,lon2,lat2,8000]), width: Math.min(3,Math.max(1,speed/6)), material: speed>12?Cesium.Color.CYAN.withAlpha(0.9):Cesium.Color.WHITE.withAlpha(0.45) } });
            }
          } catch {}
        } else {
          for (const e of [...viewer.entities.values]) if ((e.id ?? '').startsWith('wind-')) viewer.entities.remove(e);
        }
      } catch (e) { console.warn('layers', e); }
    })();
  }, [layers.earthquakes,layers.eonet,layers.storms,layers.wildfires,layers.volcanoes,layers.clouds,layers.precipitation,layers.temperature,layers.winds,layers.traffic]);

  // AC + planets sky entities
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    (async () => {
      const Cesium = await import('cesium');
      for (const id of acEntities.current) { const e=viewer.entities.getById(id); if(e) viewer.entities.remove(e); } acEntities.current=[];
      if (!layers.astroCartography) return;
      const planets = chart.planets.filter((p)=> (enabledBodies as any)[p.id]!==false);
      const jd = jdFromDate(chart.time);
      const lines = computeACLines(jd, planets);
      for (const line of lines) {
        if (line.points.length<2) continue;
        const col = Cesium.Color.fromCssColorString(line.bodyColor).withAlpha(line.type==='ASC'||line.type==='DSC'?0.65:0.9);
        const width = line.type==='MC'||line.type==='IC'?2:1.2;
        const segs:number[][]=[]; let cur:number[]=[];
        for (let i=0;i<line.points.length;i++) {
          const pt=line.points[i]!; if(cur.length>=2){ const prev=cur[cur.length-2]!; if(Math.abs(pt.lon-prev)>160){ if(cur.length>=4) segs.push(cur); cur=[]; } }
          cur.push(pt.lon,pt.lat);
        }
        if(cur.length>=4) segs.push(cur);
        const target = segs.length?segs:[line.points.flatMap((p)=>[p.lon,p.lat])];
        for(let sIdx=0;sIdx<target.length;sIdx++){
          const seg=target[sIdx]!; if(seg.length<4) continue;
          const id=`${line.id}-seg-${sIdx}`;
          viewer.entities.add({ id, polyline: { positions: Cesium.Cartesian3.fromDegreesArray(seg), width, material: col, clampToGround: true } });
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
      for (const id of planetEntities.current) { const e=viewer.entities.getById(id); if(e) viewer.entities.remove(e); } planetEntities.current=[];
      if (!layers.planets) return;
      const DIST = 55_000_000;
      for (const p of chart.planets) {
        if ((enabledBodies as any)[p.id]===false) continue;
        if (p.id==='Earth') continue;
        const dir = p.sky;
        const pos = new Cesium.Cartesian3(dir.x*DIST, dir.y*DIST, dir.z*DIST);
        const isSel = selectedPlanet===p.id;
        const size = p.id==='Sun'?14:p.id==='Moon'?10:p.id==='Jupiter'||p.id==='Saturn'?8:6;
        const color = Cesium.Color.fromCssColorString(p.color);
        viewer.entities.add({
          id: `planet-sky-${p.id}`,
          name: `${p.name}`,
          position: pos,
          point: { pixelSize: isSel?size+4:size, color: color.withAlpha(0.95), outlineColor: Cesium.Color.WHITE.withAlpha(isSel?0.9:0), outlineWidth: isSel?2:0, disableDepthTestDistance: Number.POSITIVE_INFINITY },
          label: layers.labels ? { text: `${p.name}${p.retro?' ℞':''}`, font: '11px monospace', fillColor: Cesium.Color.WHITE, style: Cesium.LabelStyle.FILL_AND_OUTLINE, outlineWidth:2, pixelOffset: new Cesium.Cartesian2(10,0), disableDepthTestDistance: Number.POSITIVE_INFINITY, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80_000_000) } as any : undefined,
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
      for (const id of missionEntities.current) { const e=viewer.entities.getById(id); if(e) viewer.entities.remove(e); } missionEntities.current=[];
      if (!layers.missions && !layers.satellites) return;
      for (const c of MAJOR_CITIES.slice(0,30)) {
        const cid = `city-${c.name.toLowerCase().replace(/\s+/g,'-')}`;
        if (viewer.entities.getById(cid)) continue;
        if (!layers.cities) continue;
        viewer.entities.add({ id: cid, position: Cesium.Cartesian3.fromDegrees(c.lon,c.lat,2000), point: { pixelSize: 2.5, color: Cesium.Color.WHITE.withAlpha(0.6), disableDepthTestDistance: Number.POSITIVE_INFINITY }, label: { text: c.name, font: '10px sans-serif', fillColor: Cesium.Color.WHITE.withAlpha(0.6), pixelOffset: new Cesium.Cartesian2(6,-6), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0,5_000_000) } as any });
      }
      for (const m of MISSIONS) {
        if (m.domain==='rover') continue;
        const pos = Cesium.Cartesian3.fromDegrees(-80+Math.random()*20, 28+Math.random()*10, 650000);
        const id = `mission-${m.id}`;
        viewer.entities.add({ id, name: m.name, position: pos, point: { pixelSize: 6, color: Cesium.Color.fromCssColorString(m.color), outlineColor: Cesium.Color.WHITE, outlineWidth: 1, disableDepthTestDistance: Number.POSITIVE_INFINITY }, description: `${m.summary}` });
        missionEntities.current.push(id);
      }
    })();
  }, [layers.missions, layers.satellites, layers.cities, layers.labels]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (satInterval.current) window.clearInterval(satInterval.current);
    const ensureIss = async (lat:number,lon:number) => {
      const Cesium = await import('cesium');
      let e=viewer.entities.getById('sat-iss');
      const pos=Cesium.Cartesian3.fromDegrees(lon,lat,408000);
      if(!e) e=viewer.entities.add({ id:'sat-iss', position:pos, point:{ pixelSize:10, color:Cesium.Color.LIME, outlineColor:Cesium.Color.WHITE, outlineWidth:1, disableDepthTestDistance: Number.POSITIVE_INFINITY }, label:{ text:'ISS', font:'11px monospace', pixelOffset:new Cesium.Cartesian2(10,0), disableDepthTestDistance: Number.POSITIVE_INFINITY } as any });
      else (e.position as any)=pos as any;
    };
    const tick=async()=>{
      try{ const r=await fetch('https://api.wheretheiss.at/v1/satellites/25544'); if(!r.ok) throw new Error(); const j=await r.json() as any; await ensureIss(Number(j.latitude),Number(j.longitude)); }
      catch{ const t=Date.now()/1000; const lon=((t*0.06)%360)-180; const lat=51.6*Math.sin(t*0.001); await ensureIss(lat,lon); }
    };
    tick(); satInterval.current=window.setInterval(tick,5000) as any;
    return()=>{ if(satInterval.current) window.clearInterval(satInterval.current); };
  }, []);

  const flyTo = async (lat:number,lon:number) => {
    const Cesium = await import('cesium');
    viewerRef.current?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon,lat,1_500_000), duration: 1 });
    setObserver({ lat, lon, alt: 10 });
    setHits([]); setCityQ('');
  };

  return (
    <div className="obs-unified">
      <div ref={hostRef} className="obs-cesium-host obs-cesium-host--unified" />
      <div className="obs-unified-overlay">
        <div className="obs-earth-tools obs-earth-tools--unified">
          <div className="obs-earth-search">
            <input value={cityQ} onChange={(e)=>setCityQ(e.target.value)} placeholder="Search city" />
            {hits.length>0 && <div className="obs-city-hits">{hits.map((h,i)=><button key={i} type="button" onClick={()=>flyTo(h.lat,h.lon)}>{h.name.slice(0,72)}</button>)}</div>}
            <div className="obs-earth-note">
              Cesium Earth level 19 replaces satellite earth. Double-click to set observer.<br/>
              <a href={`https://www.mapillary.com/app/?lat=${observer.lat}&lng=${observer.lon}&z=16`} target="_blank" rel="noreferrer">Mapillary street-level →</a>
            </div>
          </div>
          {status && <div className="obs-earth-status">{status}</div>}
          {metStatus && <div className="obs-earth-status obs-earth-status--met">{metStatus}</div>}
        </div>

        <div className="obs-solar-mini">
          <div className="obs-solar-mini-hd">SOLAR SYSTEM — 3D models (reactive)</div>
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
