/** Exhaustive observatory catalogs — house systems, ayanamsas, aspects, bodies, chart types.
 * Target parity: Time Nomad + Astro-Seek + Swiss Ephemeris full canon.
 */

export type ChartTypeId =
  | 'moment'
  | 'natal'
  | 'transit'
  | 'secondary_progressed'
  | 'solar_arc'
  | 'synastry'
  | 'composite'
  | 'davison'
  | 'draconic'
  | 'heliocentric'
  | 'return_solar'
  | 'return_lunar';

export interface ChartTypeMeta {
  id: ChartTypeId;
  label: string;
  needsBirth: boolean;
  needsSecond: boolean;
  note?: string;
}

export const CHART_TYPES: ChartTypeMeta[] = [
  { id: 'moment', label: 'Moment / Live', needsBirth: false, needsSecond: false },
  { id: 'natal', label: 'Natal', needsBirth: true, needsSecond: false },
  { id: 'transit', label: 'Transits to Natal', needsBirth: true, needsSecond: false, note: 'moment vs birth' },
  { id: 'secondary_progressed', label: 'Secondary Progressions', needsBirth: true, needsSecond: false, note: 'day-for-year' },
  { id: 'solar_arc', label: 'Solar Arc Directions', needsBirth: true, needsSecond: false },
  { id: 'synastry', label: 'Synastry', needsBirth: true, needsSecond: true, note: 'two charts, cross-aspects only' },
  { id: 'composite', label: 'Composite (midpoint)', needsBirth: false, needsSecond: true, note: '(chart1+chart2)/2' },
  { id: 'davison', label: 'Davison Relationship', needsBirth: false, needsSecond: true, note: 'midpoint time+place' },
  { id: 'draconic', label: 'Draconic (Node zodiac)', needsBirth: true, needsSecond: false, note: 'Moon Node = 0° Aries' },
  { id: 'heliocentric', label: 'Heliocentric', needsBirth: false, needsSecond: false, note: 'Sun-centered ecliptic' },
  { id: 'return_solar', label: 'Solar Return', needsBirth: true, needsSecond: false, note: 'Sun return to natal' },
  { id: 'return_lunar', label: 'Lunar Return', needsBirth: true, needsSecond: false, note: 'Moon return to natal' },
];

/** Swiss Ephemeris house system letter codes. */
export type HouseSystemId =
  | 'P' | 'K' | 'O' | 'R' | 'C' | 'A' | 'E' | 'V' | 'W' | 'X'
  | 'H' | 'T' | 'B' | 'M' | 'U' | 'G' | 'Y' | 'i' | 'S' | 'L'
  | 'Q' | 'N' | 'F' | 'D' | 'I';

export interface HouseSystemMeta {
  id: HouseSystemId;
  label: string;
  group: 'classical' | 'modern' | 'equal' | 'specialty';
}

export const HOUSE_SYSTEMS: HouseSystemMeta[] = [
  { id: 'P', label: 'Placidus', group: 'modern' },
  { id: 'K', label: 'Koch', group: 'modern' },
  { id: 'O', label: 'Porphyry', group: 'classical' },
  { id: 'R', label: 'Regiomontanus', group: 'classical' },
  { id: 'C', label: 'Campanus', group: 'classical' },
  { id: 'B', label: 'Alcabitius', group: 'classical' },
  { id: 'M', label: 'Morinus', group: 'classical' },
  { id: 'T', label: 'Topocentric (Polich/Page)', group: 'modern' },
  { id: 'A', label: 'Equal (from Asc)', group: 'equal' },
  { id: 'E', label: 'Equal (Asc = cusp 1)', group: 'equal' },
  { id: 'V', label: 'Vehlow Equal', group: 'equal' },
  { id: 'W', label: 'Whole Sign', group: 'equal' },
  { id: 'N', label: 'Equal (from MC)', group: 'equal' },
  { id: 'D', label: 'Equal (MC midpoint)', group: 'equal' },
  { id: 'X', label: 'Meridian / Axial Rotation', group: 'specialty' },
  { id: 'H', label: 'Horizontal / Azimuthal', group: 'specialty' },
  { id: 'U', label: 'Krusinski–Pisa–Goelzer', group: 'specialty' },
  { id: 'G', label: 'Gauquelin Sectors', group: 'specialty' },
  { id: 'Y', label: 'APC Houses', group: 'specialty' },
  { id: 'i', label: 'Sunshine (Treindl)', group: 'specialty' },
  { id: 'S', label: 'Sripati', group: 'specialty' },
  { id: 'L', label: 'Pullen SD (sine-ratio)', group: 'specialty' },
  { id: 'Q', label: 'Pullen SR (neo-Porphyry)', group: 'specialty' },
  { id: 'F', label: 'Carter Poli-Equatorial', group: 'specialty' },
  { id: 'I', label: 'Sunshine (alt)', group: 'specialty' },
];

export interface AyanamsaMeta {
  id: number;
  label: string;
  group: 'vedic' | 'western-sidereal' | 'babylonian' | 'galactic' | 'other';
}

/** Full Swiss Ephemeris sidereal mode table (ids match SE_SIDM_*). */
export const AYANAMSAS: AyanamsaMeta[] = [
  { id: 0, label: 'Fagan/Bradley', group: 'western-sidereal' },
  { id: 1, label: 'Lahiri (Chitrapaksha)', group: 'vedic' },
  { id: 2, label: 'De Luce', group: 'vedic' },
  { id: 3, label: 'Raman', group: 'vedic' },
  { id: 4, label: 'Usha/Shashi', group: 'vedic' },
  { id: 5, label: 'Krishnamurti (KP)', group: 'vedic' },
  { id: 6, label: 'Djwhal Khul', group: 'other' },
  { id: 7, label: 'Yukteshwar', group: 'vedic' },
  { id: 8, label: 'J.N. Bhasin', group: 'vedic' },
  { id: 9, label: 'Babylonian/Kugler 1', group: 'babylonian' },
  { id: 10, label: 'Babylonian/Kugler 2', group: 'babylonian' },
  { id: 11, label: 'Babylonian/Kugler 3', group: 'babylonian' },
  { id: 12, label: 'Babylonian/Huber', group: 'babylonian' },
  { id: 13, label: 'Babylonian/Eta Piscium', group: 'babylonian' },
  { id: 14, label: 'Babylonian/Aldebaran 15° Tau', group: 'babylonian' },
  { id: 15, label: 'Hipparchos', group: 'other' },
  { id: 16, label: 'Sassanian', group: 'other' },
  { id: 17, label: 'Galactic Center = 0° Sag', group: 'galactic' },
  { id: 18, label: 'J2000', group: 'other' },
  { id: 19, label: 'J1900', group: 'other' },
  { id: 20, label: 'B1950', group: 'other' },
  { id: 21, label: 'Suryasiddhanta', group: 'vedic' },
  { id: 22, label: 'Suryasiddhanta (mean Sun)', group: 'vedic' },
  { id: 23, label: 'Aryabhata', group: 'vedic' },
  { id: 24, label: 'Aryabhata (mean Sun)', group: 'vedic' },
  { id: 25, label: 'SS Revati', group: 'vedic' },
  { id: 26, label: 'SS Citra', group: 'vedic' },
  { id: 27, label: 'True Citra', group: 'vedic' },
  { id: 28, label: 'True Revati', group: 'vedic' },
  { id: 29, label: 'True Pushya (PVRN Rao)', group: 'vedic' },
  { id: 30, label: 'Galactic Center (Gil Brand)', group: 'galactic' },
  { id: 31, label: 'Galactic Equator (IAU1958)', group: 'galactic' },
  { id: 32, label: 'Galactic Equator', group: 'galactic' },
  { id: 33, label: 'Galactic Equator mid-Mula', group: 'galactic' },
  { id: 34, label: 'Skydram (Mardyks)', group: 'galactic' },
  { id: 35, label: 'True Mula (Chandra Hari)', group: 'vedic' },
  { id: 36, label: 'Dhruva/Gal.Center/Mula (Wilhelm)', group: 'galactic' },
  { id: 37, label: 'Aryabhata 522', group: 'vedic' },
  { id: 38, label: 'Babylonian/Britton', group: 'babylonian' },
  { id: 39, label: 'Vedic/Sheoran', group: 'vedic' },
  { id: 40, label: 'Cochrane (GC = 0° Cap)', group: 'galactic' },
  { id: 41, label: 'Fiorenza (GC = 0° Cap next)', group: 'galactic' },
  { id: 42, label: 'Valens Moon', group: 'other' },
];

export type AspectId =
  | 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
  | 'quincunx' | 'semisextile' | 'semisquare' | 'sesquiquadrate'
  | 'quintile' | 'biquintile' | 'septile' | 'biseptile' | 'triseptile'
  | 'novile' | 'binovile' | 'decile' | 'undecile' | 'vigintile'
  | 'quindecile' | 'tredecile' | 'quadranovile' | 'semiquintile'
  | 'parallel' | 'contraparallel';

export interface AspectDef {
  id: AspectId;
  label: string;
  angle: number;
  defaultOrb: number;
  color: string;
  family: 'ptolemaic' | 'minor' | 'harmonic' | 'declination';
}

export const ASPECT_DEFS: AspectDef[] = [
  { id: 'conjunction', label: 'Conjunction', angle: 0, defaultOrb: 8, color: '#f8fafc', family: 'ptolemaic' },
  { id: 'opposition', label: 'Opposition', angle: 180, defaultOrb: 8, color: '#f87171', family: 'ptolemaic' },
  { id: 'trine', label: 'Trine', angle: 120, defaultOrb: 7, color: '#60a5fa', family: 'ptolemaic' },
  { id: 'square', label: 'Square', angle: 90, defaultOrb: 7, color: '#fb923c', family: 'ptolemaic' },
  { id: 'sextile', label: 'Sextile', angle: 60, defaultOrb: 5, color: '#34d399', family: 'ptolemaic' },
  // minor
  { id: 'quincunx', label: 'Quincunx', angle: 150, defaultOrb: 3, color: '#c084fc', family: 'minor' },
  { id: 'semisextile', label: 'Semi-sextile', angle: 30, defaultOrb: 2, color: '#a3e635', family: 'minor' },
  { id: 'semisquare', label: 'Semi-square', angle: 45, defaultOrb: 2, color: '#fbbf24', family: 'minor' },
  { id: 'sesquiquadrate', label: 'Sesquiquadrate', angle: 135, defaultOrb: 2, color: '#f472b6', family: 'minor' },
  { id: 'quindecile', label: 'Quindecile', angle: 24, defaultOrb: 1.5, color: '#fdba74', family: 'minor' },
  { id: 'tredecile', label: 'Tredecile', angle: 108, defaultOrb: 2, color: '#fb7185', family: 'minor' },
  // harmonic / quintile family
  { id: 'quintile', label: 'Quintile', angle: 72, defaultOrb: 2, color: '#22d3ee', family: 'harmonic' },
  { id: 'biquintile', label: 'Bi-quintile', angle: 144, defaultOrb: 2, color: '#67e8f9', family: 'harmonic' },
  { id: 'semiquintile', label: 'Semi-quintile / Decile', angle: 36, defaultOrb: 1.5, color: '#5eead4', family: 'harmonic' },
  { id: 'decile', label: 'Decile', angle: 36, defaultOrb: 1.5, color: '#5eead4', family: 'harmonic' },
  // septile family
  { id: 'septile', label: 'Septile', angle: 360 / 7, defaultOrb: 1.5, color: '#e879f9', family: 'harmonic' },
  { id: 'biseptile', label: 'Bi-septile', angle: (360 / 7) * 2, defaultOrb: 1.5, color: '#d946ef', family: 'harmonic' },
  { id: 'triseptile', label: 'Tri-septile', angle: (360 / 7) * 3, defaultOrb: 1.5, color: '#c026d3', family: 'harmonic' },
  // novile family
  { id: 'novile', label: 'Novile', angle: 40, defaultOrb: 1.5, color: '#86efac', family: 'harmonic' },
  { id: 'binovile', label: 'Bi-novile', angle: 80, defaultOrb: 1.5, color: '#4ade80', family: 'harmonic' },
  { id: 'quadranovile', label: 'Quad-novile', angle: 160, defaultOrb: 1.2, color: '#bbf7d0', family: 'harmonic' },
  // other harmonics
  { id: 'undecile', label: 'Undecile', angle: 360 / 11, defaultOrb: 1, color: '#fda4af', family: 'harmonic' },
  { id: 'vigintile', label: 'Vigintile', angle: 18, defaultOrb: 1, color: '#fdba74', family: 'harmonic' },
  // declination
  { id: 'parallel', label: 'Parallel (δ)', angle: 0, defaultOrb: 1.2, color: '#e0f2fe', family: 'declination' },
  { id: 'contraparallel', label: 'Contra-Parallel (δ)', angle: 180, defaultOrb: 1.2, color: '#bae6fd', family: 'declination' },
];

export type BodyId =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'
  | 'Uranus' | 'Neptune' | 'Pluto' | 'Earth'
  | 'MeanNode' | 'TrueNode' | 'SouthNode'
  | 'MeanLilith' | 'TrueLilith' | 'Priapus'
  | 'Chiron' | 'Pholus' | 'Ceres' | 'Pallas' | 'Juno' | 'Vesta'
  | 'Eris' | 'Haumea' | 'Makemake' | 'Sedna' | 'Quaoar' | 'Orcus' | 'Ixion' | 'Varuna' | 'Chaos' | 'Deucalion'
  | 'Cupido' | 'Hades' | 'Zeus' | 'Kronos' | 'Apollon' | 'Admetos' | 'Vulcanus' | 'Poseidon'
  | 'Isis' | 'WhiteMoon' | 'Proserpina' | 'Vulcan'
  | 'Fortune' | 'Spirit' | 'Vertex' | 'AntiVertex' | 'EastPoint' | 'APoC';

export interface BodyMeta {
  id: BodyId;
  label: string;
  /** Swiss Ephemeris id; -1 derived, >=10000 asteroid. */
  se: number;
  color: string;
  group: 'luminary' | 'personal' | 'social' | 'outer' | 'transnept' | 'node' | 'asteroid' | 'centaur' | 'tno' | 'uranian' | 'hypothetical' | 'lot' | 'angle';
  defaultOn: boolean;
  mpcNum?: number;
}

export const BODIES: BodyMeta[] = [
  // luminaries & personal
  { id: 'Sun', label: 'Sun', se: 0, color: '#fbbf24', group: 'luminary', defaultOn: true },
  { id: 'Moon', label: 'Moon', se: 1, color: '#e2e8f0', group: 'luminary', defaultOn: true },
  { id: 'Mercury', label: 'Mercury', se: 2, color: '#94a3b8', group: 'personal', defaultOn: true },
  { id: 'Venus', label: 'Venus', se: 3, color: '#fcd34d', group: 'personal', defaultOn: true },
  { id: 'Mars', label: 'Mars', se: 4, color: '#f87171', group: 'personal', defaultOn: true },
  { id: 'Jupiter', label: 'Jupiter', se: 5, color: '#fdba74', group: 'social', defaultOn: true },
  { id: 'Saturn', label: 'Saturn', se: 6, color: '#fde68a', group: 'social', defaultOn: true },
  { id: 'Uranus', label: 'Uranus', se: 7, color: '#67e8f9', group: 'outer', defaultOn: true },
  { id: 'Neptune', label: 'Neptune', se: 8, color: '#818cf8', group: 'outer', defaultOn: true },
  { id: 'Pluto', label: 'Pluto', se: 9, color: '#c4b5fd', group: 'outer', defaultOn: true },
  { id: 'Earth', label: 'Earth', se: 14, color: '#38bdf8', group: 'personal', defaultOn: true },

  // nodes & lilith
  { id: 'MeanNode', label: 'Mean North Node (Rahu)', se: 10, color: '#a78bfa', group: 'node', defaultOn: true },
  { id: 'TrueNode', label: 'True North Node', se: 11, color: '#8b5cf6', group: 'node', defaultOn: false },
  { id: 'SouthNode', label: 'South Node (Ketu)', se: -1, color: '#6d28d9', group: 'node', defaultOn: true },
  { id: 'MeanLilith', label: 'Mean Lilith (Black Moon)', se: 12, color: '#9ca3af', group: 'node', defaultOn: false },
  { id: 'TrueLilith', label: 'True Lilith (Osc. Apogee)', se: 13, color: '#6b7280', group: 'node', defaultOn: false },
  { id: 'Priapus', label: 'Priapus (Perigee / Retrograde Lilith)', se: 22, color: '#52525b', group: 'node', defaultOn: false },

  // centaurs
  { id: 'Chiron', label: 'Chiron (2060)', se: 15, color: '#f0abfc', group: 'centaur', defaultOn: true },
  { id: 'Pholus', label: 'Pholus (5145)', se: 16, color: '#e879f9', group: 'centaur', defaultOn: false },

  // main belt
  { id: 'Ceres', label: 'Ceres (1)', se: 17, color: '#86efac', group: 'asteroid', defaultOn: false },
  { id: 'Pallas', label: 'Pallas (2)', se: 18, color: '#6ee7b7', group: 'asteroid', defaultOn: false },
  { id: 'Juno', label: 'Juno (3)', se: 19, color: '#5eead4', group: 'asteroid', defaultOn: false },
  { id: 'Vesta', label: 'Vesta (4)', se: 20, color: '#2dd4bf', group: 'asteroid', defaultOn: false },

  // TNOs / dwarf planets — SE_AST_OFFSET = 10000 + Mpc number
  { id: 'Eris', label: 'Eris (136199)', se: 10000 + 136199, color: '#f9a8d4', group: 'tno', defaultOn: false, mpcNum: 136199 },
  { id: 'Haumea', label: 'Haumea (136108)', se: 10000 + 136108, color: '#c7d2fe', group: 'tno', defaultOn: false, mpcNum: 136108 },
  { id: 'Makemake', label: 'Makemake (136472)', se: 10000 + 136472, color: '#bfdbfe', group: 'tno', defaultOn: false, mpcNum: 136472 },
  { id: 'Sedna', label: 'Sedna (90377)', se: 10000 + 90377, color: '#fca5a5', group: 'tno', defaultOn: false, mpcNum: 90377 },
  { id: 'Quaoar', label: 'Quaoar (50000)', se: 10000 + 50000, color: '#a7f3d0', group: 'tno', defaultOn: false, mpcNum: 50000 },
  { id: 'Orcus', label: 'Orcus (90482)', se: 10000 + 90482, color: '#ddd6fe', group: 'tno', defaultOn: false, mpcNum: 90482 },
  { id: 'Ixion', label: 'Ixion (28978)', se: 10000 + 28978, color: '#fecdd3', group: 'tno', defaultOn: false, mpcNum: 28978 },
  { id: 'Varuna', label: 'Varuna (20000)', se: 30000, color: '#bae6fd', group: 'tno', defaultOn: false, mpcNum: 20000 },
  { id: 'Chaos', label: 'Chaos (19521)', se: 10000 + 19521, color: '#e9d5ff', group: 'tno', defaultOn: false, mpcNum: 19521 },
  { id: 'Deucalion', label: 'Deucalion (184212)', se: 10000 + 184212, color: '#f5d0fe', group: 'tno', defaultOn: false, mpcNum: 184212 },

  // Uranian / hypothetical (Hamburg)
  { id: 'Cupido', label: 'Cupido', se: 40, color: '#fbcfe8', group: 'uranian', defaultOn: false },
  { id: 'Hades', label: 'Hades', se: 41, color: '#71717a', group: 'uranian', defaultOn: false },
  { id: 'Zeus', label: 'Zeus', se: 42, color: '#fdba74', group: 'uranian', defaultOn: false },
  { id: 'Kronos', label: 'Kronos', se: 43, color: '#fde68a', group: 'uranian', defaultOn: false },
  { id: 'Apollon', label: 'Apollon', se: 44, color: '#fef08a', group: 'uranian', defaultOn: false },
  { id: 'Admetos', label: 'Admetos', se: 45, color: '#a3a3a3', group: 'uranian', defaultOn: false },
  { id: 'Vulcanus', label: 'Vulcanus', se: 46, color: '#f87171', group: 'uranian', defaultOn: false },
  { id: 'Poseidon', label: 'Poseidon', se: 47, color: '#38bdf8', group: 'uranian', defaultOn: false },
  { id: 'Isis', label: 'Isis (Transpluto)', se: 48, color: '#c4b5fd', group: 'hypothetical', defaultOn: false },
  { id: 'WhiteMoon', label: 'White Moon Selena', se: 56, color: '#fef9c3', group: 'hypothetical', defaultOn: false },
  { id: 'Proserpina', label: 'Proserpina', se: 57, color: '#bbf7d0', group: 'hypothetical', defaultOn: false },
  { id: 'Vulcan', label: 'Vulcan (Intra-Mercurian)', se: 55, color: '#f87171', group: 'hypothetical', defaultOn: false },

  // lots & angles
  { id: 'Fortune', label: 'Part of Fortune', se: -1, color: '#fef08a', group: 'lot', defaultOn: true },
  { id: 'Spirit', label: 'Part of Spirit', se: -1, color: '#fde047', group: 'lot', defaultOn: false },
  { id: 'Vertex', label: 'Vertex', se: -1, color: '#fda4af', group: 'angle', defaultOn: false },
  { id: 'AntiVertex', label: 'Anti-Vertex', se: -1, color: '#fb7185', group: 'angle', defaultOn: false },
  { id: 'EastPoint', label: 'East Point', se: -1, color: '#fdba74', group: 'angle', defaultOn: false },
  { id: 'APoC', label: 'Co-Ascendant (W. Koch)', se: -1, color: '#f5f5f4', group: 'angle', defaultOn: false },
];

export type ZodiacMode = 'tropical' | 'sidereal' | 'draconic' | 'heliocentric';

export type NodeMode = 'mean' | 'true';
export type LilithMode = 'mean' | 'true' | 'oscillating' | 'both' | 'off';
export type FortuneFormula = 'day' | 'night' | 'auto';
export type HouseCalcNutaton = 'true' | 'mean';

export const EPHEMERIS_MIN = new Date(Date.UTC(1800, 0, 1, 0, 0, 0));
export const EPHEMERIS_MAX = new Date(Date.UTC(2100, 11, 31, 23, 59, 59));

export function bodyDefaultOn(id: string): boolean {
  return BODIES.find((b) => b.id === id)?.defaultOn ?? false;
}
