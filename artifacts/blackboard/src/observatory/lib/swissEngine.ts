import SwissEph from 'swisseph-wasm';
import type { BodyId, HouseSystemId, ZodiacMode } from './catalogs';
import { BODIES } from './catalogs';
import { degNorm, eclipticToSkyVector, visualOrbitRadius } from './math';

export type SwissReady = {
  ready: true;
  version: string;
  julday: (d: Date) => number;
  calcBody: (jd: number, bodyId: BodyId, opts: CalcOpts) => BodyCalc | null;
  houses: (jd: number, lat: number, lon: number, hsys: HouseSystemId) => HouseCalc;
  ayanamsa: (jd: number, sidMode: number) => number;
  setSidMode: (sidMode: number) => void;
};

export type CalcOpts = {
  sidereal: boolean;
  sidMode: number;
  topo?: { lat: number; lon: number; alt?: number };
  helio?: boolean;
};

export type BodyCalc = {
  lon: number;
  lat: number;
  dist: number;
  speed: number;
  retro: boolean;
};

export type HouseCalc = {
  cusps: number[]; // index 1..12
  asc: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAsc: number;
  coasc1: number;
  coasc2: number;
  polasc: number;
};

let singleton: Promise<SwissReady> | null = null;
let sweInstance: InstanceType<typeof SwissEph> | null = null;

function dateToJdParts(d: Date) {
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3600000,
  };
}

export function getSwiss(): Promise<SwissReady> {
  if (!singleton) {
    singleton = (async () => {
      const swe = new SwissEph();
      await swe.initSwissEph();
      sweInstance = swe;
      const version = typeof swe.version === 'function' ? swe.version() : 'swiss';

      const julday = (d: Date) => {
        const p = dateToJdParts(d);
        return swe.julday(p.y, p.m, p.day, p.hour);
      };

      const setSidMode = (sidMode: number) => {
        swe.set_sid_mode(sidMode, 0, 0);
      };

      const ayanamsa = (jd: number, sidMode: number) => {
        setSidMode(sidMode);
        if (typeof (swe as unknown as { get_ayanamsa_ut?: (jd: number) => number }).get_ayanamsa_ut === 'function') {
          return (swe as unknown as { get_ayanamsa_ut: (jd: number) => number }).get_ayanamsa_ut(jd);
        }
        return swe.get_ayanamsa(jd);
      };

      const calcBody = (jd: number, bodyId: BodyId, opts: CalcOpts): BodyCalc | null => {
        const meta = BODIES.find((b) => b.id === bodyId);
        if (!meta || meta.se < 0) return null;

        if (opts.sidereal) setSidMode(opts.sidMode);
        if (opts.topo) swe.set_topo(opts.topo.lon, opts.topo.lat, opts.topo.alt ?? 0);

        let flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
        if (opts.sidereal) flags |= swe.SEFLG_SIDEREAL;
        if (opts.helio) flags |= swe.SEFLG_HELCTR;
        if (opts.topo) flags |= swe.SEFLG_TOPOCTR;

        try {
          const r = swe.calc_ut(jd, meta.se, flags);
          if (!r || r.length < 4) return null;
          const lon = degNorm(r[0]!);
          const lat = r[1]!;
          const dist = r[2]!;
          const speed = r[3]!;
          return { lon, lat, dist, speed, retro: speed < 0 };
        } catch {
          return null;
        }
      };

      const houses = (jd: number, lat: number, lon: number, hsys: HouseSystemId): HouseCalc => {
        const raw = swe.houses(jd, lat, lon, hsys) as unknown as {
          cusps: ArrayLike<number>;
          ascmc: ArrayLike<number>;
        };
        const cusps: number[] = [];
        for (let i = 1; i <= 12; i++) cusps[i] = degNorm(raw.cusps[i] ?? 0);
        return {
          cusps,
          asc: degNorm(raw.ascmc[0] ?? 0),
          mc: degNorm(raw.ascmc[1] ?? 0),
          armc: degNorm(raw.ascmc[2] ?? 0),
          vertex: degNorm(raw.ascmc[3] ?? 0),
          equatorialAsc: degNorm(raw.ascmc[4] ?? 0),
          coasc1: degNorm(raw.ascmc[5] ?? 0),
          coasc2: degNorm(raw.ascmc[6] ?? 0),
          polasc: degNorm(raw.ascmc[7] ?? 0),
        };
      };

      const out: SwissReady = {
        ready: true as const,
        version,
        julday,
        calcBody,
        houses,
        ayanamsa,
        setSidMode,
      };
      return out;
    })().catch((err) => {
      singleton = null;
      throw err;
    });
  }
  return singleton!;
}

export function isSwissBooted(): boolean {
  return !!sweInstance;
}

/** Helio visual position using Swiss XYZ when possible; falls back to lon-on-ring. */
export function helioVisualFromLon(lon: number, distAu: number): { x: number; y: number; z: number } {
  const r = visualOrbitRadius(Math.max(distAu, 0.1));
  const a = (lon * Math.PI) / 180;
  return { x: Math.cos(a) * r, y: 0, z: -Math.sin(a) * r };
}

export function skyFromLonLat(lon: number, lat: number) {
  return eclipticToSkyVector(lon, lat);
}

export type { ZodiacMode };
