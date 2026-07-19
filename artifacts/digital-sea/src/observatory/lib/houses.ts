/**
 * House helpers — primary path is Swiss Ephemeris `houses()`.
 * Fallback equal/whole constructions remain for pre-init frames.
 */
import type { HouseSystemId } from './catalogs';
import type { HouseCusp } from './types';
import { degNorm } from './math';

export function equalHouses(asc: number): HouseCusp[] {
  return Array.from({ length: 12 }, (_, i) => ({ house: i + 1, lon: degNorm(asc + i * 30) }));
}

export function wholeSignHouses(asc: number): HouseCusp[] {
  const start = Math.floor(degNorm(asc) / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => ({ house: i + 1, lon: degNorm(start + i * 30) }));
}

export function fallbackHouses(system: HouseSystemId, asc: number, mc: number): HouseCusp[] {
  if (system === 'W') return wholeSignHouses(asc);
  if (system === 'E' || system === 'A' || system === 'V') return equalHouses(asc);
  if (system === 'N' || system === 'D') return equalHouses(degNorm(mc + 90));
  // Porphyry-like fallback for any quadrant system
  const c = new Array<number>(12);
  c[0] = asc;
  c[9] = mc;
  c[3] = degNorm(mc + 180);
  c[6] = degNorm(asc + 180);
  const arcMcAsc = degNorm(asc - mc);
  c[10] = degNorm(mc + arcMcAsc / 3);
  c[11] = degNorm(mc + (2 * arcMcAsc) / 3);
  const arcAscIc = degNorm(c[3]! - asc);
  c[1] = degNorm(asc + arcAscIc / 3);
  c[2] = degNorm(asc + (2 * arcAscIc) / 3);
  for (let i = 0; i < 6; i++) c[i + 6] = degNorm(c[i]! + 180);
  return c.map((lon, i) => ({ house: i + 1, lon: degNorm(lon) }));
}

export function ascMcFromLst(lstDeg: number, latDeg: number, epsDeg = 23.4392911): { asc: number; mc: number } {
  const lst = (degNorm(lstDeg) * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const eps = (epsDeg * Math.PI) / 180;
  const mc = Math.atan2(Math.sin(lst), Math.cos(lst) * Math.cos(eps));
  let mcDeg = (mc * 180) / Math.PI;
  if (mcDeg < 0) mcDeg += 360;
  const y = -Math.cos(lst);
  const x = Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(lst);
  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  if (asc < 0) asc += 360;
  return { asc: degNorm(asc), mc: degNorm(mcDeg) };
}

export function computeHouses(system: HouseSystemId, asc: number, mc: number, _lat: number): HouseCusp[] {
  return fallbackHouses(system, asc, mc);
}
