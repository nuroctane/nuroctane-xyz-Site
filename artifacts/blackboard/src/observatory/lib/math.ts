/** Angular helpers for chart geometry. */

export function clampDate(d: Date, min: Date, max: Date): Date {
  const t = d.getTime();
  if (Number.isNaN(t)) return new Date(min.getTime());
  if (t < min.getTime()) return new Date(min.getTime());
  if (t > max.getTime()) return new Date(max.getTime());
  return d;
}

export function degNorm(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

export function degDelta(a: number, b: number): number {
  let d = Math.abs(degNorm(a) - degNorm(b));
  if (d > 180) d = 360 - d;
  return d;
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export function signName(lon: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  return signs[Math.floor(degNorm(lon) / 30) % 12]!;
}

export function formatLon(lon: number): string {
  const n = degNorm(lon);
  const sign = signName(n);
  const within = n % 30;
  const deg = Math.floor(within);
  const min = Math.floor((within - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}′ ${sign}`;
}

export function formatUtc(d: Date): string {
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

export function formatClock(d: Date): string {
  return d.toISOString().slice(11, 19);
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Convert equatorial RA hours + Dec degrees → unit vector (Three.js Y-up). */
export function raDecToVector(raHours: number, decDeg: number): { x: number; y: number; z: number } {
  const ra = degToRad(raHours * 15);
  const dec = degToRad(decDeg);
  const cosDec = Math.cos(dec);
  // Astronomy convention → Y-up scene: X = cos(dec)cos(ra), Z = cos(dec)sin(ra), Y = sin(dec)
  return {
    x: cosDec * Math.cos(ra),
    y: Math.sin(dec),
    z: cosDec * Math.sin(ra),
  };
}

/** Ecliptic lon/lat (deg) → approximate equatorial unit vector for sky display. */
export function eclipticToSkyVector(lonDeg: number, latDeg: number, obliquityDeg = 23.4392911) {
  const lon = degToRad(lonDeg);
  const lat = degToRad(latDeg);
  const eps = degToRad(obliquityDeg);
  const cosLat = Math.cos(lat);
  const xE = cosLat * Math.cos(lon);
  const yE = cosLat * Math.sin(lon);
  const zE = Math.sin(lat);
  // Rotate ecliptic → equatorial
  const x = xE;
  const y = yE * Math.cos(eps) - zE * Math.sin(eps);
  const z = yE * Math.sin(eps) + zE * Math.cos(eps);
  // Equatorial cartesian (x,y,z) with z = north; map to Three Y-up
  return { x, y: z, z: y };
}

/**
 * Visual heliocentric scale: real distance (AU) -> scene units, Eyes-style.
 *
 * Planets are drawn far larger than true scale (Earth's sphere is 1.08 units),
 * so the old smooth power curve left Venus's orbit 0.56 units inside Earth's
 * while the two spheres span 1.62: near inferior conjunction they overlapped
 * on screen and read as a collision. These anchors (interpolated in log-AU)
 * give every neighbouring pair room at its closest real approach — Mercury
 * clears the corona, Venus clears Earth plus the Moon, Mars clears Earth's
 * aphelion — while Jupiter and beyond keep their familiar positions
 * (Neptune ~30).
 */
const ORBIT_ANCHORS: ReadonlyArray<readonly [au: number, units: number]> = [
  [0.2, 3.3],
  [0.387, 4.3],  // Mercury
  [0.723, 6.6],  // Venus
  [1.0, 9.5],    // Earth
  [1.524, 13.1], // Mars
  [2.77, 14.4],  // Ceres / main belt
  [5.2, 17.2],   // Jupiter
  [9.54, 21.6],  // Saturn
  [19.2, 26.0],  // Uranus
  [30.1, 29.6],  // Neptune
  [39.5, 32.0],  // Pluto
  [100, 40.0],   // scattered disk
];

export function visualOrbitRadius(au: number): number {
  const x = Math.log(Math.max(Math.abs(au), 1e-3));
  const last = ORBIT_ANCHORS.length - 1;
  // Find the segment; extrapolate the end segments' log-slope beyond the table.
  let i = 0;
  while (i < last - 1 && x > Math.log(ORBIT_ANCHORS[i + 1]![0])) i++;
  const [a0, r0] = ORBIT_ANCHORS[i]!;
  const [a1, r1] = ORBIT_ANCHORS[i + 1]!;
  const t = (x - Math.log(a0)) / (Math.log(a1) - Math.log(a0));
  return r0 + t * (r1 - r0);
}

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
