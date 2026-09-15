import type { PlanetPosition } from './types';
import { degNorm } from './math';

export type ACLineType = 'MC' | 'IC' | 'ASC' | 'DSC';

export interface ACLine {
  id: string;
  body: string;
  bodyColor: string;
  type: ACLineType;
  /** Sampled lat/lon points for curved lines; MC/IC are straight lon. */
  points: { lat: number; lon: number }[];
  label: string;
}

/**
 * Compute astro-cartography lines for a natal moment.
 * Requires equatorial coordinates (RA/Dec). We approximate RA/Dec from ecliptic lon/lat + obliquity,
 * then compute MC line lon = RA - GST, and ASC/DSC curves via spherical trig.
 *
 * GST0 at JD is approximated via astronomy-engine sidereal time utility if available, else simple formula.
 * For precision we use astronomy-engine if loaded, else fallback.
 */
function gstFromJd(jd: number): number {
  // IAU 1982 GMST in degrees: 280.46061837 + 360.98564736629 * (JD-2451545) + ...
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  return degNorm(gmst);
}

function eclToEquatorial(lonDeg: number, latDeg: number, epsDeg = 23.4392911): { ra: number; dec: number } {
  const lon = (lonDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const eps = (epsDeg * Math.PI) / 180;
  // Convert ecliptic to equatorial
  const sinDec = Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon);
  const dec = Math.asin(sinDec);
  const y = Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps);
  const x = Math.cos(lon);
  let ra = Math.atan2(y, x);
  if (ra < 0) ra += 2 * Math.PI;
  return { ra: (ra * 180) / Math.PI, dec: (dec * 180) / Math.PI };
}

export function computeACLines(
  jd: number,
  planets: PlanetPosition[],
  gstDeg?: number,
): ACLine[] {
  const gst = gstDeg ?? gstFromJd(jd);
  const lines: ACLine[] = [];

  for (const p of planets) {
    // Skip lots/angles if not planetary
    if (p.id === 'Fortune' || p.id === 'Spirit' || p.id === 'Vertex' || p.id === 'AntiVertex' || p.id === 'EastPoint') continue;
    if (p.id === 'SouthNode') continue;

    const { ra, dec } = eclToEquatorial(p.tropicalLon ?? p.lon, p.lat);

    // MC line: where planet culminates (RA == LST). LST = GST + lon => lon = RA - GST
    const mcLon = degNorm(ra - gst);
    const icLon = degNorm(mcLon + 180);

    lines.push({
      id: `${p.id}-MC`,
      body: p.name,
      bodyColor: p.color,
      type: 'MC',
      label: `${p.name} MC`,
      points: [
        { lat: -80, lon: mcLon },
        { lat: 80, lon: mcLon },
      ],
    });

    lines.push({
      id: `${p.id}-IC`,
      body: p.name,
      bodyColor: p.color,
      type: 'IC',
      label: `${p.name} IC`,
      points: [
        { lat: -80, lon: icLon },
        { lat: 80, lon: icLon },
      ],
    });

    // ASC/DSC curves: for each latitude, compute hour angle H at rising/setting: cos H = -tan lat * tan dec
    const ascPoints: { lat: number; lon: number }[] = [];
    const dscPoints: { lat: number; lon: number }[] = [];
    for (let lat = -80; lat <= 80; lat += 2) {
      const latRad = (lat * Math.PI) / 180;
      const decRad = (dec * Math.PI) / 180;
      // circumpolar checks
      const cosH = -Math.tan(latRad) * Math.tan(decRad);
      if (cosH < -1 || cosH > 1) continue; // never rises/sets
      const H = (Math.acos(cosH) * 180) / Math.PI; // positive
      // At rising, LST = RA - H ; at setting LST = RA + H
      // lon = LST - GST
      const ascLon = degNorm(ra - H - gst);
      const dscLon = degNorm(ra + H - gst);
      ascPoints.push({ lat, lon: ascLon });
      dscPoints.push({ lat, lon: dscLon });
    }

    if (ascPoints.length > 1) {
      lines.push({
        id: `${p.id}-ASC`,
        body: p.name,
        bodyColor: p.color,
        type: 'ASC',
        label: `${p.name} ASC`,
        points: ascPoints,
      });
    }
    if (dscPoints.length > 1) {
      lines.push({
        id: `${p.id}-DSC`,
        body: p.name,
        bodyColor: p.color,
        type: 'DSC',
        label: `${p.name} DSC`,
        points: dscPoints,
      });
    }
  }

  return lines;
}

export function jdFromDate(d: Date): number {
  // Julian Date from Date UTC
  return d.getTime() / 86400000 + 2440587.5;
}
