/**
 * Lightweight public-data fetchers for Earth meteorology / disaster layers.
 * All endpoints are CORS-enabled and keyless except OWM / TomTom which use env keys.
 * Added: real wind via Open-Meteo (no key) for plausible global field.
 */

export type QuakeFeature = {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lon: number;
  depth: number;
};

const QUAKE_TTL_MS = 10 * 60 * 1000;
let quakeCache: { at: number; data: QuakeFeature[] } | null = null;

function notifyStream(id: string, state: 'live' | 'cached' | 'error', detail: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('obs-stream', { detail: { id, state, detail } }));
}

export async function fetchEarthquakes(signal?: AbortSignal): Promise<QuakeFeature[]> {
  if (quakeCache && Date.now() - quakeCache.at < QUAKE_TTL_MS) {
    notifyStream('quakes', 'cached', `${quakeCache.data.length} quakes`);
    return quakeCache.data;
  }
  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`USGS ${r.status}`);
    const j = (await r.json()) as { features?: Array<{ id?: string; geometry?: { coordinates?: number[] }; properties?: { mag?: number; place?: string; time?: number } }> };
    const feats: QuakeFeature[] = [];
    for (const f of j.features ?? []) {
      const [lon, lat, depth] = f.geometry?.coordinates ?? [];
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      feats.push({
        id: String(f.id ?? feats.length),
        mag: f.properties?.mag ?? 0,
        place: f.properties?.place ?? '',
        time: f.properties?.time ?? 0,
        lat,
        lon,
        depth: depth ?? 0,
      });
    }
    quakeCache = { at: Date.now(), data: feats };
    notifyStream('quakes', 'live', `${feats.length} quakes`);
    return feats;
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') return quakeCache?.data ?? [];
    notifyStream('quakes', 'error', 'USGS feed unavailable');
    return quakeCache?.data ?? [];
  }
}

export type EonetEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  lat: number;
  lon: number;
  link: string;
};

const EONET_TTL_MS = 15 * 60 * 1000;
let eonetCache: { at: number; data: EonetEvent[] } | null = null;

/** Point, or the first ring of a polygon / multipolygon. */
function eonetPoint(coords: unknown): { lon: number; lat: number } | null {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return { lon: coords[0], lat: coords[1] };
  }
  const ring = Array.isArray(coords[0]) && typeof coords[0][0] === 'number'
    ? coords
    : Array.isArray(coords[0]) && Array.isArray(coords[0][0])
      ? coords[0]
      : null;
  if (!ring) return null;
  let lon = 0;
  let lat = 0;
  let n = 0;
  for (const pair of ring.slice(0, 12)) {
    if (!Array.isArray(pair) || typeof pair[0] !== 'number' || typeof pair[1] !== 'number') continue;
    lon += pair[0];
    lat += pair[1];
    n += 1;
  }
  return n ? { lon: lon / n, lat: lat / n } : null;
}

export async function fetchEonet(signal?: AbortSignal): Promise<EonetEvent[]> {
  if (eonetCache && Date.now() - eonetCache.at < EONET_TTL_MS) {
    notifyStream('eonet', 'cached', `${eonetCache.data.length} events`);
    return eonetCache.data;
  }
  try {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=80&status=open&days=30';
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`EONET ${r.status}`);
    const j = (await r.json()) as {
      events?: Array<{
        id?: string;
        title?: string;
        link?: string;
        categories?: Array<{ title?: string }>;
        geometry?: Array<{ date?: string; coordinates?: unknown }>;
      }>;
    };
    const out: EonetEvent[] = [];
    for (const ev of j.events ?? []) {
      const geom = ev.geometry?.[ev.geometry.length - 1];
      const point = eonetPoint(geom?.coordinates);
      if (!point) continue;
      out.push({
        id: String(ev.id ?? out.length),
        title: ev.title ?? 'Event',
        category: ev.categories?.[0]?.title ?? 'Event',
        date: geom?.date ?? '',
        lat: point.lat,
        lon: point.lon,
        link: ev.link ?? `https://eonet.gsfc.nasa.gov/api/v3/events/${ev.id}`,
      });
    }
    eonetCache = { at: Date.now(), data: out };
    notifyStream('eonet', 'live', `${out.length} events`);
    return out;
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') return eonetCache?.data ?? [];
    notifyStream('eonet', 'error', 'EONET feed unavailable');
    return eonetCache?.data ?? [];
  }
}

export type OwmLayer = 'clouds_new' | 'precipitation_new' | 'temp_new' | 'wind_new';

export function owmTileUrl(layer: OwmLayer, z: number, x: number, y: number): string | null {
  const key = (import.meta as any).env?.VITE_OPENWEATHER_KEY as string | undefined;
  if (!key) return null;
  return `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${key}`;
}

export function tomtomTrafficTileUrl(z: number, x: number, y: number): string | null {
  const key = (import.meta as any).env?.VITE_TOMTOM_KEY as string | undefined;
  if (!key) return null;
  return `https://api.tomtom.com/traffic/map/4/tile/flow/relative/${z}/${x}/${y}.png?key=${key}`;
}

export function gibsTrueColorUrl(): string {
  return 'NASA_GIBS';
}

export type WindSample = { lat: number; lon: number; u: number; v: number };

/**
 * Denser global wind grid synthetic fallback — trades + westerlies — for high visibility.
 */
export function fetchGlobalWindGrid(): WindSample[] {
  const lats = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
  const lons = [-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const out: WindSample[] = [];
  for (const lat of lats) {
    for (const lon of lons) {
      const isTropic = Math.abs(lat) < 30;
      let dir: number;
      if (Math.abs(lat) < 8) {
        dir = lon % 120 < 60 ? 270 : 90;
      } else if (isTropic) {
        dir = lat > 0 ? 225 + Math.sin((lon * Math.PI) / 180) * 12 : 315 + Math.cos((lon * Math.PI) / 180) * 10;
      } else {
        dir = lat > 0 ? 90 + Math.sin((lat * 0.7 * Math.PI) / 180) * 20 : 270 + Math.sin((lat * 0.7 * Math.PI) / 180) * 15;
      }
      const speed = 4 + Math.abs(Math.sin((lat * 2 * Math.PI) / 180)) * 8;
      const rad = (dir * Math.PI) / 180;
      out.push({ lat, lon, u: Math.cos(rad) * speed, v: Math.sin(rad) * speed });
    }
  }
  return out;
}

/**
 * Real wind sampling via Open-Meteo — a 9x11 grid for the visible layer.
 * Uses https://open-meteo.com/ (no key, CORS). Falls back to synthetic if fails.
 */
const WIND_TTL_MS = 30 * 60 * 1000;
let windCache: { at: number; data: WindSample[] } | null = null;

const WIND_LATS = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
const WIND_LONS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

export function windFromCurrent(lat: number, lon: number, speed: number, dir: number): WindSample {
  const toRad = ((dir + 180) % 360) * Math.PI / 180;
  return { lat, lon, u: Math.sin(toRad) * speed, v: Math.cos(toRad) * speed };
}

/**
 * One Open-Meteo request for the whole grid. The previous path issued a
 * request per cell (~100) and tripped the public rate limit.
 */
export async function fetchRealWindGrid(signal?: AbortSignal): Promise<WindSample[]> {
  if (windCache && Date.now() - windCache.at < WIND_TTL_MS) {
    notifyStream('wind', 'cached', `${windCache.data.length} samples`);
    return windCache.data;
  }
  const lats: number[] = [];
  const lons: number[] = [];
  for (const lat of WIND_LATS) {
    for (const lon of WIND_LONS) {
      lats.push(lat);
      lons.push(lon);
    }
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lons.join(',')}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&timezone=UTC`;
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`open-meteo ${r.status}`);
    const json = await r.json() as
      | { latitude?: number; longitude?: number; current?: { wind_speed_10m?: number; wind_direction_10m?: number } }
      | Array<{ latitude?: number; longitude?: number; current?: { wind_speed_10m?: number; wind_direction_10m?: number } }>;
    const rows = Array.isArray(json) ? json : [json];
    const out: WindSample[] = [];
    for (let i = 0; i < lats.length; i++) {
      const row = rows[i];
      const speed = row?.current?.wind_speed_10m;
      const dir = row?.current?.wind_direction_10m;
      if (typeof speed !== 'number' || typeof dir !== 'number' || !Number.isFinite(speed) || !Number.isFinite(dir)) continue;
      out.push(windFromCurrent(row?.latitude ?? lats[i]!, row?.longitude ?? lons[i]!, speed, dir));
    }
    if (out.length < 8) throw new Error('open-meteo short');
    windCache = { at: Date.now(), data: out };
    notifyStream('wind', 'live', `${out.length} samples`);
    return out;
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') return windCache?.data ?? [];
    const fallback = fetchGlobalWindGrid();
    notifyStream('wind', 'cached', 'modeled trades');
    return fallback;
  }
}
