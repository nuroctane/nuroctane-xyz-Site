/**
 * Live satellite catalog.
 *
 * Prefers same-origin CelesTrak TLE (`/api/observatory/tle`) and falls back
 * to the committed snapshots under `/observatory-runtime/data/` when the
 * proxy is unreachable (local dev before that route is deployed).
 * Positions are SGP4, not the old random orbits.
 */
import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  propagate,
  twoline2satrec,
  type SatRec,
} from 'satellite.js';

export { gstime as gmstOf };
import { SATELLITE_GROUPS, type SatelliteGroupId } from './types';

export type CatalogSource = 'live' | 'snapshot' | 'mixed';

export type LiveSat = {
  id: string;
  name: string;
  group: SatelliteGroupId;
  color: string;
  satrec: SatRec;
};

export type Geodetic = { lat: number; lon: number; altKm: number };

type SetSpec = {
  id: string;
  file: string | null;
  cap: number;
  /** Debris files are tagged as debris even when the name looks like a payload. */
  forceGroup: SatelliteGroupId | null;
};

const SETS: Record<string, SetSpec> = {
  visual: { id: 'visual', file: '/observatory-runtime/data/tle-visual.txt', cap: 400, forceGroup: null },
  stations: { id: 'stations', file: '/observatory-runtime/data/tle-stations.txt', cap: 80, forceGroup: null },
  starlink: { id: 'starlink', file: '/observatory-runtime/data/tle-starlink.txt', cap: 220, forceGroup: 'starlink' },
  oneweb: { id: 'oneweb', file: '/observatory-runtime/data/tle-oneweb.txt', cap: 80, forceGroup: 'oneweb' },
  planet: { id: 'planet', file: '/observatory-runtime/data/tle-planet.txt', cap: 80, forceGroup: 'planet' },
  iridium: { id: 'iridium', file: '/observatory-runtime/data/tle-iridium.txt', cap: 120, forceGroup: 'iridium' },
  gps: { id: 'gps', file: '/observatory-runtime/data/tle-gps.txt', cap: 80, forceGroup: 'gps' },
  galileo: { id: 'galileo', file: '/observatory-runtime/data/tle-galileo.txt', cap: 80, forceGroup: 'galileo' },
  glonass: { id: 'glonass', file: '/observatory-runtime/data/tle-glonass.txt', cap: 80, forceGroup: 'glonass' },
  'fengyun-1c-debris': {
    id: 'fengyun-1c-debris',
    file: '/observatory-runtime/data/tle-fengyun-1c-debris.txt',
    cap: 70,
    forceGroup: 'debris',
  },
  'iridium-33-debris': {
    id: 'iridium-33-debris',
    file: '/observatory-runtime/data/tle-iridium-33-debris.txt',
    cap: 40,
    forceGroup: 'debris',
  },
  'cosmos-2251-debris': {
    id: 'cosmos-2251-debris',
    file: '/observatory-runtime/data/tle-cosmos-2251-debris.txt',
    cap: 70,
    forceGroup: 'debris',
  },
};

const GROUP_COLOR = new Map(SATELLITE_GROUPS.map((g) => [g.id, g.color]));
const RENDER_CAP = 640;

export function setsForGroups(enabled: Record<SatelliteGroupId, boolean>): string[] {
  const sets = ['visual', 'stations'];
  if (enabled.starlink) sets.push('starlink');
  if (enabled.oneweb) sets.push('oneweb');
  if (enabled.planet) sets.push('planet');
  if (enabled.iridium) sets.push('iridium');
  if (enabled.gps) sets.push('gps');
  if (enabled.galileo) sets.push('galileo');
  if (enabled.glonass) sets.push('glonass');
  if (enabled.debris) sets.push('fengyun-1c-debris', 'iridium-33-debris', 'cosmos-2251-debris');
  return sets;
}

export function classifySatellite(name: string): SatelliteGroupId {
  const n = name.toUpperCase();
  if (n.includes('STARLINK')) return 'starlink';
  if (n.includes('ONEWEB')) return 'oneweb';
  if (n.includes('FLOCK') || n.includes('SKYSAT') || n.includes('LEMUR') || n.includes('DOVE')) return 'planet';
  if (n.includes('IRIDIUM') && (n.includes('DEB') || n.includes('DEBRIS'))) return 'debris';
  if (n.includes('IRIDIUM')) return 'iridium';
  if (n.includes('NAVSTAR') || n.includes('GPS')) return 'gps';
  if (n.includes('GALILEO')) return 'galileo';
  if (n.includes('GLONASS')) return 'glonass';
  if (n.includes('DEB') || n.includes('FENGYUN 1C')) return 'debris';
  if (n.includes('COSMOS')) return 'cosmos';
  return 'other';
}

function sample<T>(items: T[], cap: number): T[] {
  if (items.length <= cap) return items;
  const out: T[] = [];
  const step = items.length / cap;
  for (let i = 0; i < cap; i++) out.push(items[Math.floor(i * step)]!);
  return out;
}

export function parseTleCatalog(text: string, spec: SetSpec): LiveSat[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  const records: { name: string; line1: string; line2: string }[] = [];
  let i = 0;
  while (i < lines.length) {
    let name = '';
    let line1 = '';
    let line2 = '';
    if (lines[i]!.startsWith('1 ') && lines[i + 1]?.startsWith('2 ')) {
      line1 = lines[i]!;
      line2 = lines[i + 1]!;
      name = `NORAD ${line1.slice(2, 7).trim()}`;
      i += 2;
    } else if (lines[i + 1]?.startsWith('1 ') && lines[i + 2]?.startsWith('2 ')) {
      name = lines[i]!.replace(/\s+/g, ' ').trim();
      line1 = lines[i + 1]!;
      line2 = lines[i + 2]!;
      i += 3;
    } else {
      i += 1;
      continue;
    }
    records.push({ name, line1, line2 });
  }
  // Limit SGP4 initialization as well as rendering: a constellation feed may
  // contain ten thousand records, most of which would be discarded anyway.
  const parsed: LiveSat[] = [];
  for (const { name, line1, line2 } of sample(records, spec.cap)) {
    let satrec: SatRec;
    try {
      satrec = twoline2satrec(line1, line2);
    } catch {
      continue;
    }
    if (!satrec || satrec.error || !Number.isFinite(satrec.jdsatepoch) || !Number.isFinite(satrec.no)) continue;
    const norad = String(satrec.satnum ?? line1.slice(2, 7)).trim();
    const group = spec.forceGroup ?? classifySatellite(name);
    parsed.push({
      id: norad,
      name,
      group,
      color: GROUP_COLOR.get(group) ?? '#d5dde6',
      satrec,
    });
  }
  return parsed;
}

function priority(sat: LiveSat): number {
  const n = sat.name.toUpperCase();
  if (n.includes('ISS') || n.includes('TIANGONG') || n.includes('HUBBLE') || n.includes('HST')) return 0;
  if (sat.group === 'gps' || sat.group === 'galileo' || sat.group === 'glonass' || sat.group === 'iridium') return 1;
  if (sat.group === 'other' || sat.group === 'cosmos') return 2;
  if (sat.group === 'starlink' || sat.group === 'oneweb' || sat.group === 'planet') return 3;
  return 4;
}

async function fetchSet(spec: SetSpec, signal: AbortSignal): Promise<{ text: string; source: 'live' | 'snapshot' }> {
  try {
    const live = await fetch(`/api/observatory/tle?set=${encodeURIComponent(spec.id)}`, { signal });
    if (live.ok) {
      const text = await live.text();
      if (/^1 [^\r\n]+\r?\n2 /m.test(text)) return { text, source: 'live' };
    }
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') throw err;
  }
  if (!spec.file) return { text: '', source: 'snapshot' };
  const cached = await fetch(spec.file, { signal });
  if (!cached.ok) return { text: '', source: 'snapshot' };
  return { text: await cached.text(), source: 'snapshot' };
}

export async function loadObservatoryCatalog(
  enabled: Record<SatelliteGroupId, boolean>,
  signal: AbortSignal,
): Promise<{ sats: LiveSat[]; source: CatalogSource }> {
  const specs = setsForGroups(enabled).map((id) => SETS[id]).filter((spec): spec is SetSpec => !!spec);
  const results = await Promise.all(specs.map(async (spec) => {
    try {
      const got = await fetchSet(spec, signal);
      return { sats: got.text ? parseTleCatalog(got.text, spec) : [], source: got.source };
    } catch (err) {
      // A failed snapshot must not throw away the healthy feeds. Cancellation
      // still propagates so an obsolete group toggle cannot replace the catalog.
      if (signal.aborted || (err as { name?: string }).name === 'AbortError') throw err;
      return { sats: [], source: 'snapshot' as const };
    }
  }));

  const byId = new Map<string, { sat: LiveSat; source: 'live' | 'snapshot' }>();
  for (const result of results) {
    for (const sat of result.sats) {
      if (!enabled[sat.group]) continue;
      const prev = byId.get(sat.id);
      // Stations can repeat a satellite already found in a visual snapshot.
      // Always prefer the fresh feed over that older orbital record.
      if (!prev || result.source === 'live' && prev.source === 'snapshot' ||
        result.source === prev.source && priority(sat) < priority(prev.sat)) {
        byId.set(sat.id, { sat, source: result.source });
      }
    }
  }

  const entries = [...byId.values()].sort((a, b) => priority(a.sat) - priority(b.sat) || a.sat.name.localeCompare(b.sat.name)).slice(0, RENDER_CAP);
  const anyLive = entries.some(entry => entry.source === 'live');
  const anySnapshot = entries.some(entry => entry.source === 'snapshot');
  return {
    sats: entries.map(entry => entry.sat),
    source: anyLive && anySnapshot ? 'mixed' : anyLive ? 'live' : 'snapshot',
  };
}

const EARTH_RADIUS_KM = 6371;

/** Writes one ECEF position into `out` at `offset`, or 9999 when the sat is decayed. */
export function writeSatellitePosition(
  sat: LiveSat,
  date: Date,
  gmst: number,
  earthRadius: number,
  out: Float32Array,
  offset: number,
) {
  const g = propagateGeodetic(sat.satrec, date, gmst);
  if (!g) {
    out[offset] = 9999;
    out[offset + 1] = 9999;
    out[offset + 2] = 9999;
    return;
  }
  const radius = earthRadius * ((EARTH_RADIUS_KM + g.altKm) / EARTH_RADIUS_KM);
  const phi = ((90 - g.lat) * Math.PI) / 180;
  const theta = ((g.lon + 180) * Math.PI) / 180;
  const sinPhi = Math.sin(phi);
  out[offset] = -radius * sinPhi * Math.cos(theta);
  out[offset + 1] = radius * Math.cos(phi);
  out[offset + 2] = radius * sinPhi * Math.sin(theta);
}

export function propagateGeodetic(satrec: SatRec, date: Date, gmst = gstime(date)): Geodetic | null {
  const pv = propagate(satrec, date);
  const position = pv?.position;
  if (!position || typeof position === 'boolean') return null;
  const gd = eciToGeodetic(position, gmst);
  const lat = degreesLat(gd.latitude);
  const lon = degreesLong(gd.longitude);
  const altKm = gd.height;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(altKm)) return null;
  if (altKm < 80 || altKm > 90_000) return null;
  return { lat, lon, altKm };
}
