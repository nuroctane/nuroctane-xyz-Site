import { degNorm, julianDay } from './math';

/** Fallback Lahiri-style ayanamsa when Swiss is not yet ready. */
export function lahiriAyanamsa(date: Date): number {
  const jd = julianDay(date);
  const yearsFrom2000 = (jd - 2451545.0) / 365.25;
  return degNorm(23.852331 + yearsFrom2000 * (50.290966 / 3600));
}

export function applyAyanamsa(tropicalLon: number, ayanamsa: number): number {
  return degNorm(tropicalLon - ayanamsa);
}
