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

export async function fetchEarthquakes(): Promise<QuakeFeature[]> {
  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`USGS ${r.status}`);
    const j = (await r.json()) as any;
    const feats: QuakeFeature[] = [];
    for (const f of j.features ?? []) {
      const [lon, lat, depth] = f.geometry?.coordinates ?? [0, 0, 0];
      feats.push({
        id: f.id,
        mag: f.properties?.mag ?? 0,
        place: f.properties?.place ?? '',
        time: f.properties?.time ?? 0,
        lat,
        lon,
        depth,
      });
    }
    return feats;
  } catch {
    return [];
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

export async function fetchEonet(): Promise<EonetEvent[]> {
  try {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=80&status=open&days=30';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`EONET ${r.status}`);
    const j = (await r.json()) as any;
    const out: EonetEvent[] = [];
    for (const ev of j.events ?? []) {
      const geom = ev.geometry?.[ev.geometry.length - 1];
      const coords = geom?.coordinates;
      if (!coords || coords.length < 2) continue;
      out.push({
        id: ev.id,
        title: ev.title,
        category: ev.categories?.[0]?.title ?? 'Event',
        date: geom?.date ?? '',
        lat: coords[1],
        lon: coords[0],
        link: ev.link ?? `https://eonet.gsfc.nasa.gov/api/v3/events/${ev.id}`,
      });
    }
    return out;
  } catch {
    return [];
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
 * Very small global wind grid synthetic fallback: trades + westerlies with seasonal tilt.
 */
export async function fetchGlobalWindGrid(): Promise<WindSample[]> {
  const lats = [-60, -40, -20, 0, 20, 40, 60];
  const lons = [-160, -120, -80, -40, 0, 40, 80, 120, 160];
  const out: WindSample[] = [];
  for (const lat of lats) {
    for (const lon of lons) {
      const isTropic = Math.abs(lat) < 30;
      // NE trades ~ 45° (from NE), SE trades ~ 135°, westerlies ~ 270°
      let dir: number;
      if (Math.abs(lat) < 8) {
        dir = lon % 120 < 60 ? 270 : 90; // ITCZ variable
      } else if (isTropic) {
        dir = lat > 0 ? 225 + Math.sin((lon * Math.PI) / 180) * 12 : 315 + Math.cos((lon * Math.PI) / 180) * 10;
      } else {
        dir = lat > 0 ? 90 + Math.sin((lat * 0.7 * Math.PI) / 180) * 20 : 270 + Math.sin((lat * 0.7 * Math.PI) / 180) * 15;
      }
      const speed = 3 + Math.abs(Math.sin((lat * 2 * Math.PI) / 180)) * 8 + Math.random() * 3;
      const rad = (dir * Math.PI) / 180;
      out.push({ lat, lon, u: Math.cos(rad) * speed, v: Math.sin(rad) * speed });
    }
  }
  return out;
}

/**
 * Real wind sampling via Open-Meteo — fetches current wind speed/dir for a sparse grid.
 * Uses https://open-meteo.com/ (no key, CORS). Falls back to synthetic if fails.
 */
export async function fetchRealWindGrid(): Promise<WindSample[]> {
  const gridLats = [-50, -30, -10, 10, 30, 50];
  const gridLons = [-140, -100, -60, -20, 20, 60, 100, 140];
  const tasks: Promise<WindSample>[] = [];

  for (const lat of gridLats) {
    for (const lon of gridLons) {
      tasks.push(
        (async (): Promise<WindSample> => {
          try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&timezone=UTC`;
            const r = await fetch(url);
            if (!r.ok) throw new Error('om');
            const j = (await r.json()) as any;
            const speed = Number(j.current?.wind_speed_10m ?? 5);
            const dir = Number(j.current?.wind_direction_10m ?? 0);
            // meteorological dir = direction wind comes from, convert to vector to
            const toRad = ((dir + 180) % 360) * Math.PI / 180;
            return { lat, lon, u: Math.cos(toRad) * speed, v: Math.sin(toRad) * speed };
          } catch {
            const dir = lat > 0 ? 270 : 90;
            const rad = (dir * Math.PI) / 180;
            return { lat, lon, u: Math.cos(rad) * 4, v: Math.sin(rad) * 4 };
          }
        })(),
      );
    }
  }

  try {
    const results = await Promise.allSettled(tasks);
    const out: WindSample[] = [];
    for (const r of results) if (r.status === 'fulfilled') out.push(r.value);
    return out.length > 5 ? out : await fetchGlobalWindGrid();
  } catch {
    return fetchGlobalWindGrid();
  }
}
