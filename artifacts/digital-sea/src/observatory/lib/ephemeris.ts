import * as Astronomy from 'astronomy-engine';
import {
  ASPECT_DEFS,
  BODIES,
  type AspectId,
  type BodyId,
  type ChartTypeId,
  type FortuneFormula,
  type HouseSystemId,
  type ZodiacMode,
} from './catalogs';
import { findAspects } from './aspects';
import { degDelta, degNorm, visualOrbitRadius } from './math';
import { helioVisualFromLon, skyFromLonLat, type SwissReady } from './swissEngine';
import type { ChartSnapshot, HouseCusp, PlanetPosition } from './types';

export type BuildChartOpts = {
  date: Date;
  zodiac: ZodiacMode;
  ayanamsaId: number;
  houseSystem: HouseSystemId;
  observer: { lat: number; lon: number; alt?: number };
  enabledBodies: Partial<Record<BodyId, boolean>>;
  enabledAspects: Partial<Record<AspectId, boolean>>;
  fortuneFormula: FortuneFormula;
  chartType: ChartTypeId;
  birthDate?: Date | null;
  secondDate?: Date | null;
  secondObserver?: { lat: number; lon: number; alt?: number } | null;
  orbScale?: number;
  swiss?: SwissReady | null;
  topocentric?: boolean;
  heliocentric?: boolean;
  trueNode?: boolean;
};

function nightChart(sunLon: number, asc: number): boolean {
  const rel = degNorm(sunLon - asc);
  return rel > 0 && rel < 180;
}
function partOfFortune(sun: number, moon: number, asc: number, night: boolean): number {
  return night ? degNorm(asc + sun - moon) : degNorm(asc + moon - sun);
}
function partOfSpirit(sun: number, moon: number, asc: number, night: boolean): number {
  return night ? degNorm(asc + moon - sun) : degNorm(asc + sun - moon);
}

function midLon(a: number, b: number): number {
  // shortest circular midpoint
  let d = degNorm(b - a);
  if (d > 180) d -= 360;
  return degNorm(a + d / 2);
}

function applyChartTypeDate(opts: BuildChartOpts): { calcDate: Date; kind: 'single' | 'composite' | 'davison' } {
  const { chartType, date, birthDate, secondDate } = opts;
  if (!birthDate) return { calcDate: date, kind: 'single' };
  if (chartType === 'natal' || chartType === 'draconic' || chartType === 'return_solar' || chartType === 'return_lunar') {
    return { calcDate: birthDate, kind: 'single' };
  }
  if (chartType === 'secondary_progressed') {
    const years = (date.getTime() - birthDate.getTime()) / (365.2425 * 86400000);
    return { calcDate: new Date(birthDate.getTime() + years * 86400000), kind: 'single' };
  }
  if (chartType === 'solar_arc') return { calcDate: birthDate, kind: 'single' };
  if (chartType === 'davison') return { calcDate: date, kind: 'davison' };
  if (chartType === 'composite') return { calcDate: date, kind: 'composite' };
  // transit, synastry, moment use moment date for primary calc
  return { calcDate: date, kind: 'single' };
}

function fallbackPositions(date: Date, zodiac: ZodiacMode, ayan: number, enabled: Partial<Record<BodyId, boolean>>): PlanetPosition[] {
  const time = Astronomy.MakeTime(date);
  const map: Partial<Record<BodyId, Astronomy.Body>> = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto,
    Earth: Astronomy.Body.Earth,
  };
  const out: PlanetPosition[] = [];
  for (const meta of BODIES) {
    if (enabled[meta.id] === false && meta.id !== 'Earth' && meta.id !== 'Sun') continue;
    if (meta.se < 0) continue;
    if (meta.se >= 10000) continue; // no fallback for TNOs / hypotheticals
    if (meta.se >= 40 && meta.se <= 59) continue;
    const body = map[meta.id];
    if (!body) continue;
    try {
      if (meta.id === 'Earth') {
        const h = Astronomy.HelioVector(Astronomy.Body.Earth, time);
        const au = Math.sqrt(h.x * h.x + h.y * h.y + h.z * h.z);
        const r = visualOrbitRadius(au);
        const s = r / Math.max(au, 1e-6);
        out.push({
          id: meta.id,
          name: meta.label,
          lon: 0, lat: 0, distAu: au, tropicalLon: 0,
          color: meta.color, group: meta.group as any,
          sky: { x: 0, y: 1, z: 0 },
          helio: { x: h.x * s, y: h.z * s, z: -h.y * s },
        });
        continue;
      }
      const vec = Astronomy.GeoVector(body === Astronomy.Body.Earth ? Astronomy.Body.Sun : body, time, true);
      const ecl = Astronomy.Ecliptic(vec);
      const tropicalLon = degNorm(ecl.elon);
      const lon = zodiac === 'sidereal' ? degNorm(tropicalLon - ayan) : tropicalLon;
      const dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
      let helio = helioVisualFromLon(tropicalLon, dist);
      if (meta.id !== 'Sun' && meta.id !== 'Moon') {
        try {
          const h = Astronomy.HelioVector(body, time);
          const au = Math.sqrt(h.x * h.x + h.y * h.y + h.z * h.z);
          const r = visualOrbitRadius(au);
          const s = r / Math.max(au, 1e-6);
          helio = { x: h.x * s, y: h.z * s, z: -h.y * s };
        } catch {}
      }
      if (meta.id === 'Sun') helio = { x: 0, y: 0, z: 0 };
      out.push({
        id: meta.id, name: meta.label, lon, lat: ecl.elat, distAu: dist, tropicalLon,
        color: meta.color, group: meta.group as any,
        sky: skyFromLonLat(tropicalLon, ecl.elat),
        helio,
      });
    } catch { continue; }
  }
  return out;
}

function swissPositions(
  swiss: SwissReady,
  date: Date,
  zodiac: ZodiacMode,
  ayanamsaId: number,
  observer: { lat: number; lon: number; alt?: number },
  enabled: Partial<Record<BodyId, boolean>>,
  opts: { helio?: boolean; topo?: boolean },
): { planets: PlanetPosition[]; ayan: number } {
  const jd = swiss.julday(date);
  const ayan = zodiac === 'sidereal' ? swiss.ayanamsa(jd, ayanamsaId) : 0;
  const planets: PlanetPosition[] = [];
  const isHelio = zodiac === 'heliocentric' || opts.helio;

  for (const meta of BODIES) {
    if (enabled[meta.id] === false && meta.id !== 'Earth' && meta.id !== 'Sun') continue;
    if (meta.se < 0) continue;
    const calcOpts: any = {
      sidereal: zodiac === 'sidereal',
      sidMode: ayanamsaId,
      helio: isHelio && meta.id !== 'Sun',
      topo: opts.topo && (meta.id === 'Moon' || meta.id === 'Sun') ? { lat: observer.lat, lon: observer.lon, alt: observer.alt } : undefined,
    };
    const geo = swiss.calcBody(jd, meta.id, calcOpts);
    if (!geo) continue;

    let helio = { x: 0, y: 0, z: 0 };
    if (meta.id === 'Sun') helio = { x: 0, y: 0, z: 0 };
    else if (isHelio) {
      helio = helioVisualFromLon(geo.lon, geo.dist);
    } else {
      try {
        const h = swiss.calcBody(jd, meta.id, { sidereal: false, sidMode: ayanamsaId, helio: true });
        if (h) helio = helioVisualFromLon(h.lon, h.dist);
        else helio = helioVisualFromLon(geo.lon, geo.dist);
      } catch {
        helio = helioVisualFromLon(geo.lon, geo.dist);
      }
    }

    const tropicalLon = zodiac === 'sidereal' ? degNorm(geo.lon + ayan) : geo.lon;
    planets.push({
      id: meta.id,
      name: meta.label,
      lon: isHelio ? geo.lon : geo.lon,
      lat: geo.lat,
      distAu: geo.dist,
      tropicalLon,
      speedDegPerDay: geo.speed,
      retro: geo.retro,
      color: meta.color,
      group: meta.group as any,
      sky: skyFromLonLat(tropicalLon, geo.lat),
      helio,
    });
  }

  // Synthesize South Node = North + 180 if enabled
  const north = planets.find((p) => p.id === 'MeanNode' || p.id === 'TrueNode');
  if (north) {
    const enabledSouth = enabled['SouthNode'] !== false;
    if (enabledSouth) {
      const meta = BODIES.find((b) => b.id === 'SouthNode')!;
      const lon = degNorm(north.lon + 180);
      planets.push({
        id: 'SouthNode',
        name: meta.label,
        lon,
        lat: -north.lat,
        distAu: 0,
        tropicalLon: degNorm(north.tropicalLon + 180),
        color: meta.color,
        group: meta.group as any,
        sky: skyFromLonLat(degNorm(north.tropicalLon + 180), -north.lat),
        helio: { x: 0, y: 0, z: 0 },
      });
    }
  }

  return { planets, ayan };
}

function addLotsAndAngles(
  planets: PlanetPosition[],
  houses: { asc: number; mc: number; vertex: number; armc: number },
  fortuneFormula: FortuneFormula,
  enabled: Partial<Record<BodyId, boolean>>,
  zodiac: ZodiacMode,
  ayan: number,
): void {
  const sun = planets.find((p) => p.id === 'Sun');
  const moon = planets.find((p) => p.id === 'Moon');
  if (!sun || !moon) return;

  const night =
    fortuneFormula === 'night' ? true : fortuneFormula === 'day' ? false : nightChart(sun.lon, houses.asc);

  const push = (id: BodyId, lon: number) => {
    if (enabled[id] === false) return;
    const meta = BODIES.find((b) => b.id === id);
    if (!meta) return;
    const tropicalLon = zodiac === 'sidereal' ? degNorm(lon + ayan) : lon;
    planets.push({
      id,
      name: meta.label,
      lon: degNorm(lon),
      lat: 0,
      distAu: 0,
      tropicalLon,
      color: meta.color,
      group: meta.group as any,
      sky: skyFromLonLat(tropicalLon, 0),
      helio: { x: 0, y: 0, z: 0 },
    });
  };

  push('Fortune', partOfFortune(sun.lon, moon.lon, houses.asc, night));
  push('Spirit', partOfSpirit(sun.lon, moon.lon, houses.asc, night));
  push('Vertex', houses.vertex);
  push('AntiVertex', degNorm(houses.vertex + 180));
  push('EastPoint', degNorm(houses.armc + 90));
  push('APoC', degNorm(houses.asc + 0)); // placeholder co-asc (Swiss provides via ascmc[8] if needed)
}

function applyDraconic(planets: PlanetPosition[], northNodeLon: number): PlanetPosition[] {
  return planets.map((p) => {
    const dLon = degNorm(p.lon - northNodeLon);
    const dTrop = degNorm(p.tropicalLon - northNodeLon);
    return {
      ...p,
      lon: dLon,
      tropicalLon: dTrop,
      sky: skyFromLonLat(dTrop, p.lat),
      helio: p.helio, // helio stays but symbolic transformation applied to lon; keep visual same-ish
    };
  });
}

function compositePlanets(a: PlanetPosition[], b: PlanetPosition[]): PlanetPosition[] {
  const mapA = new Map(a.map((p) => [p.id, p] as const));
  const mapB = new Map(b.map((p) => [p.id, p] as const));
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);
  const out: PlanetPosition[] = [];
  for (const id of ids) {
    const pa = mapA.get(id as BodyId);
    const pb = mapB.get(id as BodyId);
    if (!pa && !pb) continue;
    if (!pa) { out.push(pb!); continue; }
    if (!pb) { out.push(pa); continue; }
    const lon = midLon(pa.lon, pb.lon);
    const trop = midLon(pa.tropicalLon, pb.tropicalLon);
    const lat = (pa.lat + pb.lat) / 2;
    out.push({
      ...pa,
      lon,
      tropicalLon: trop,
      lat,
      sky: skyFromLonLat(trop, lat),
      helio: { x: (pa.helio.x + pb.helio.x) / 2, y: (pa.helio.y + pb.helio.y) / 2, z: (pa.helio.z + pb.helio.z) / 2 },
    });
  }
  return out;
}

export function buildChart(opts: BuildChartOpts): ChartSnapshot {
  const swiss = opts.swiss ?? null;
  const { calcDate: baseDate, kind } = applyChartTypeDate(opts);
  const observer = opts.observer;
  const isHelio = opts.zodiac === 'heliocentric' || opts.chartType === 'heliocentric' || !!opts.heliocentric;
  const useTopo = !!opts.topocentric;
  const zodiacForCalc: ZodiacMode = opts.zodiac === 'draconic' ? 'tropical' : opts.zodiac;

  let planets: PlanetPosition[] = [];
  let ayan = 0;
  let asc = 0, mc = 0, vertex = 0, armc = 0;
  let houses: HouseCusp[] = [];
  let engine: 'swiss' | 'fallback' = 'fallback';
  let engineVersion: string | undefined;

  const doSingle = (date: Date, obs: { lat: number; lon: number; alt?: number }) => {
    if (swiss) {
      engine = 'swiss';
      engineVersion = swiss.version;
      const jd = swiss.julday(date);
      ayan = zodiacForCalc === 'sidereal' ? swiss.ayanamsa(jd, opts.ayanamsaId) : 0;
      const h = swiss.houses(jd, obs.lat, obs.lon, opts.houseSystem);
      const rawAsc = h.asc, rawMc = h.mc, rawVx = h.vertex;
      asc = zodiacForCalc === 'sidereal' ? degNorm(rawAsc - ayan) : rawAsc;
      mc = zodiacForCalc === 'sidereal' ? degNorm(rawMc - ayan) : rawMc;
      vertex = zodiacForCalc === 'sidereal' ? degNorm(rawVx - ayan) : rawVx;
      armc = h.armc;
      houses = Array.from({ length: 12 }, (_, i) => {
        const raw = h.cusps[i + 1] ?? 0;
        const lon = zodiacForCalc === 'sidereal' ? degNorm(raw - ayan) : degNorm(raw);
        return { house: i + 1, lon };
      });

      const pos = swissPositions(swiss, date, zodiacForCalc, opts.ayanamsaId, obs, opts.enabledBodies, {
        helio: isHelio,
        topo: useTopo,
      });
      ayan = pos.ayan;
      planets = pos.planets.filter((p) => opts.enabledBodies[p.id] !== false);

      addLotsAndAngles(planets, { asc: rawAsc, mc: rawMc, vertex: rawVx, armc: h.armc }, opts.fortuneFormula, opts.enabledBodies, zodiacForCalc, ayan);

      // Solar arc rotation: rotate all planets by Sun's progress from birth to now
      if (opts.chartType === 'solar_arc' && opts.birthDate) {
        const jdBirth = swiss.julday(opts.birthDate);
        const sunBirth = swiss.calcBody(jdBirth, 'Sun', { sidereal: false, sidMode: opts.ayanamsaId });
        const sunNowJd = swiss.julday(opts.date);
        const sunNow = swiss.calcBody(sunNowJd, 'Sun', { sidereal: false, sidMode: opts.ayanamsaId });
        if (sunBirth && sunNow) {
          const delta = degNorm(sunNow.lon - sunBirth.lon);
          planets = planets.map((p) => {
            const nl = degNorm(p.lon + delta);
            const nt = degNorm(p.tropicalLon + delta);
            return { ...p, lon: nl, tropicalLon: nt, sky: skyFromLonLat(nt, p.lat) };
          });
          asc = degNorm(asc + delta);
          mc = degNorm(mc + delta);
          houses = houses.map((hs) => ({ ...hs, lon: degNorm(hs.lon + delta) }));
        }
      }
    } else {
      // fallback
      const jdAyan = 0;
      const fb = fallbackPositions(date, zodiacForCalc, jdAyan, opts.enabledBodies);
      planets = fb;
      asc = degNorm((date.getUTCHours() * 15 + observer.lon) % 360);
      mc = degNorm(asc + 90);
      vertex = degNorm(asc - 90);
      armc = degNorm(mc);
      houses = Array.from({ length: 12 }, (_, i) => ({ house: i + 1, lon: degNorm(asc + i * 30) }));
      const north = planets.find((p) => p.id === 'MeanNode');
      if (north && opts.enabledBodies['SouthNode'] !== false) {
        const meta = BODIES.find((b) => b.id === 'SouthNode')!;
        const lon = degNorm(north.lon + 180);
        planets.push({
          id: 'SouthNode', name: meta.label, lon, lat: -north.lat, distAu: 0,
          tropicalLon: degNorm(north.tropicalLon + 180),
          color: meta.color, group: meta.group as any,
          sky: skyFromLonLat(degNorm(north.tropicalLon + 180), -north.lat),
          helio: { x: 0, y: 0, z: 0 },
        });
      }
    }
    return { planets, asc, mc, vertex, armc, houses, ayan };
  };

  // Handle chart type dispatch
  if (kind === 'composite' && opts.secondDate) {
    const first = doSingle(baseDate, observer);
    const secondObs = opts.secondObserver ?? observer;
    const second = swiss
      ? swissPositions(swiss, opts.secondDate, zodiacForCalc, opts.ayanamsaId, secondObs, opts.enabledBodies, { helio: isHelio, topo: useTopo })
      : { planets: fallbackPositions(opts.secondDate, zodiacForCalc, 0, opts.enabledBodies), ayan: 0 };
    // add lots for second?
    let comp = compositePlanets(first.planets, second.planets);
    planets = comp;
    // houses: use first chart's houses for composite readability
    asc = first.asc; mc = first.mc; vertex = first.vertex; armc = first.armc; houses = first.houses; ayan = first.ayan;
  } else if (kind === 'davison' && opts.secondDate) {
    // Davison = midpoint time & place
    const t1 = (opts.birthDate ?? baseDate).getTime();
    const t2 = opts.secondDate.getTime();
    const midT = new Date((t1 + t2) / 2);
    const o2 = opts.secondObserver ?? observer;
    const midObs = {
      lat: (observer.lat + o2.lat) / 2,
      lon: midLon(observer.lon, o2.lon),
      alt: ((observer.alt ?? 10) + (o2.alt ?? 10)) / 2,
    };
    const res = doSingle(midT, midObs);
    planets = res.planets; asc = res.asc; mc = res.mc; vertex = res.vertex; armc = res.armc; houses = res.houses; ayan = res.ayan;
  } else {
    const res = doSingle(baseDate, observer);
    planets = res.planets; asc = res.asc; mc = res.mc; vertex = res.vertex; armc = res.armc; houses = res.houses; ayan = res.ayan;
  }

  // Draconic conversion if requested via zodiac or chartType
  const needDraconic = opts.zodiac === 'draconic' || opts.chartType === 'draconic';
  if (needDraconic) {
    const north = planets.find((p) => p.id === 'TrueNode' || p.id === 'MeanNode');
    if (north) {
      const nodeLon = north.tropicalLon ?? north.lon;
      planets = applyDraconic(planets, nodeLon);
      asc = degNorm(asc - nodeLon);
      mc = degNorm(mc - nodeLon);
      vertex = degNorm(vertex - nodeLon);
      houses = houses.map((h) => ({ ...h, lon: degNorm(h.lon - nodeLon) }));
    }
  }

  // Helio re-label: ensure tropicalLon reflects helio if helio mode
  // Aspects
  const aspectDefs = ASPECT_DEFS.filter((d) => opts.enabledAspects[d.id] !== false);
  let aspects = findAspects(planets, { enabled: opts.enabledAspects, orbScale: opts.orbScale ?? 1 });

  // Transit/synastry cross-aspects only
  if ((opts.chartType === 'transit' || opts.chartType === 'synastry') && opts.birthDate && swiss) {
    // Build natal separately for cross comparison
    const jdBirth = swiss.julday(opts.birthDate);
    const natalPos = swissPositions(swiss, opts.birthDate, zodiacForCalc, opts.ayanamsaId, observer, opts.enabledBodies, { helio: isHelio, topo: useTopo });
    const natal: PlanetPosition[] = natalPos.planets;
    // cross loop
    const cross: typeof aspects = [];
    for (const t of planets) {
      for (const n of natal) {
        if (t.id === 'Earth' || n.id === 'Earth') continue;
        const sep = degDelta(t.lon, n.lon);
        for (const def of aspectDefs) {
          const delta = Math.abs(sep - def.angle);
          const orb = def.defaultOrb * (opts.orbScale ?? 1);
          if (delta <= orb) {
            cross.push({
              a: t.id as BodyId,
              b: n.id as BodyId,
              aspect: def.id as any,
              label: `${t.name} ${def.label} ${n.name}`,
              color: def.color,
              angle: def.angle,
              delta,
            });
          }
        }
      }
    }
    // keep only closest per pair? just sort
    aspects = cross.sort((x, y) => x.delta - y.delta).slice(0, 120);
  }

  return {
    time: baseDate,
    zodiac: opts.zodiac,
    ayanamsa: ayan,
    ayanamsaId: opts.ayanamsaId,
    houseSystem: opts.houseSystem,
    observer,
    planets: planets.filter((p) => opts.enabledBodies[p.id] !== false),
    aspects,
    houses,
    asc,
    mc,
    vertex,
    armc,
    engine,
    engineVersion,
    chartType: opts.chartType,
  };
}

/** Orbit ring sampled from Swiss if available, else astronomy-engine. Uses tropical lon internally, but caller passes zodiac-adjusted positions already via chart. */
export function orbitRingPoints(
  bodyId: BodyId,
  date: Date,
  steps = 120,
  swiss?: SwissReady | null,
  zodiac: ZodiacMode = 'tropical',
  ayanamsaId = 0,
): { x: number; y: number; z: number }[] {
  const points: { x: number; y: number; z: number }[] = [];
  const centerDate = date.getTime();
  const yearMs = 365.25 * 86400000;
  // Estimate period by body
  const periodDays: Record<string, number> = {
    Mercury: 88, Venus: 225, Earth: 365.25, Mars: 687, Jupiter: 4333, Saturn: 10759, Uranus: 30687, Neptune: 60190, Pluto: 90560,
  };
  const bodyKey = (bodyId as string) in periodDays ? (bodyId as string) : 'Earth';
  const periodMs = (periodDays[bodyKey] ?? 365.25) * 86400000;

  if (swiss) {
    for (let i = 0; i < steps; i++) {
      const t = centerDate - periodMs / 2 + (periodMs * i) / steps;
      const d = new Date(t);
      const jd = swiss.julday(d);
      const c = swiss.calcBody(jd, bodyId, { sidereal: false, sidMode: ayanamsaId, helio: true });
      if (!c) continue;
      // Apply zodiac if sidereal
      let lon = c.lon;
      if (zodiac === 'sidereal') {
        const ayan = swiss.ayanamsa(jd, ayanamsaId);
        lon = degNorm(lon - ayan);
      }
      points.push(helioVisualFromLon(lon, c.dist));
    }
    if (points.length > 0) return points;
  }

  // fallback via astronomy-engine
  for (let i = 0; i < steps; i++) {
    const t = centerDate - periodMs / 2 + (periodMs * i) / steps;
    const d = new Date(t);
    const au = (() => {
      try {
        const time = Astronomy.MakeTime(d);
        let b: Astronomy.Body;
        switch (bodyId) {
          case 'Mercury': b = Astronomy.Body.Mercury; break;
          case 'Venus': b = Astronomy.Body.Venus; break;
          case 'Mars': b = Astronomy.Body.Mars; break;
          case 'Jupiter': b = Astronomy.Body.Jupiter; break;
          case 'Saturn': b = Astronomy.Body.Saturn; break;
          case 'Uranus': b = Astronomy.Body.Uranus; break;
          case 'Neptune': b = Astronomy.Body.Neptune; break;
          case 'Pluto': b = Astronomy.Body.Pluto; break;
          default: b = Astronomy.Body.Earth; break;
        }
        const h = Astronomy.HelioVector(b, time);
        return Math.sqrt(h.x * h.x + h.y * h.y + h.z * h.z);
      } catch { return 1; }
    })();
    // approximate lon increasing by 360 per period
    const frac = i / steps;
    const lon = frac * 360;
    points.push(helioVisualFromLon(lon, au));
  }
  return points;
}

export async function getSwiss() {
  const { getSwiss: g } = await import('./swissEngine');
  return g();
}
