import {
  ASPECT_DEFS,
  AYANAMSAS,
  BODIES,
  CHART_TYPES,
  EPHEMERIS_MAX,
  EPHEMERIS_MIN,
  HOUSE_SYSTEMS,
  type AspectId,
  type AyanamsaMeta,
  type BodyId,
  type BodyMeta,
  type ChartTypeId,
  type FortuneFormula,
  type HouseSystemId,
  type LilithMode,
  type NodeMode,
  type ZodiacMode,
} from './catalogs';

export type ObservatoryMode = 'earth' | 'solar' | 'sky' | 'missions';

export type {
  AspectId,
  AyanamsaMeta,
  BodyId,
  BodyMeta,
  ChartTypeId,
  FortuneFormula,
  HouseSystemId,
  LilithMode,
  NodeMode,
  ZodiacMode,
};

export { ASPECT_DEFS, AYANAMSAS, BODIES, CHART_TYPES, EPHEMERIS_MAX, EPHEMERIS_MIN, HOUSE_SYSTEMS };

export interface AspectDef {
  id: AspectId;
  label: string;
  angle: number;
  defaultOrb: number;
  color: string;
  family: 'ptolemaic' | 'minor' | 'harmonic' | 'declination';
}

export interface HouseSystemMeta {
  id: HouseSystemId;
  label: string;
  group: string;
}

export interface PlanetPosition {
  id: BodyId;
  name: string;
  lon: number;
  lat: number;
  distAu: number;
  tropicalLon: number;
  speedDegPerDay?: number;
  retro?: boolean;
  color: string;
  sky: { x: number; y: number; z: number };
  helio: { x: number; y: number; z: number };
  group?: string;
}

export interface AspectHit {
  a: BodyId;
  b: BodyId;
  aspect: AspectId;
  label: string;
  color: string;
  angle: number;
  delta: number;
  applying?: boolean;
}

export interface HouseCusp {
  house: number;
  lon: number;
}

export interface ChartSnapshot {
  time: Date;
  zodiac: ZodiacMode;
  ayanamsa: number;
  ayanamsaId: number;
  houseSystem: HouseSystemId;
  observer: { lat: number; lon: number; alt?: number };
  planets: PlanetPosition[];
  aspects: AspectHit[];
  houses: HouseCusp[];
  asc: number;
  mc: number;
  vertex: number;
  armc: number;
  engine: 'swiss' | 'fallback';
  engineVersion?: string;
  chartType: ChartTypeId;
}

export interface LayerState {
  planets: boolean;
  orbits: boolean;
  constellations: boolean;
  aspects: boolean;
  houses: boolean;
  labels: boolean;
  ecliptic: boolean;
  grid: boolean;
  satellites: boolean;
  missions: boolean;
  asteroids: boolean;
  nodes: boolean;
  lots: boolean;
  buildings: boolean;
  cities: boolean;
  terrain: boolean;
  // Earth meteorology / disaster / traffic
  earthquakes: boolean;
  eonet: boolean;
  storms: boolean;
  wildfires: boolean;
  volcanoes: boolean;
  clouds: boolean;
  precipitation: boolean;
  temperature: boolean;
  winds: boolean;
  traffic: boolean;
  astroCartography: boolean;
}

export interface MissionEntry {
  id: string;
  name: string;
  agency: string;
  domain: 'earth' | 'solar' | 'rover' | 'telescope';
  status: 'active' | 'past' | 'en-route';
  summary: string;
  eyesUrl?: string;
  horizonsId?: string;
  target?: string;
  color: string;
}

export const DEFAULT_OBSERVER = { lat: 40.7128, lon: -74.006, alt: 10 };

export const DEFAULT_LAYERS: LayerState = {
  planets: true,
  orbits: true,
  constellations: true,
  aspects: true,
  houses: true,
  labels: true,
  ecliptic: true,
  grid: false,
  satellites: true,
  missions: true,
  asteroids: true,
  nodes: true,
  lots: true,
  buildings: true,
  cities: false,
  terrain: true,
  earthquakes: true,
  eonet: true,
  storms: true,
  wildfires: false,
  volcanoes: false,
  clouds: true,
  precipitation: false,
  temperature: false,
  winds: true,
  traffic: false,
  astroCartography: false,
};

export type SatelliteGroupId = 'starlink' | 'oneweb' | 'planet' | 'iridium' | 'gps' | 'galileo' | 'glonass' | 'debris' | 'cosmos' | 'other';
export interface SatelliteGroupMeta { id: SatelliteGroupId; label: string; color: string; owner: string; count: number; }
export const SATELLITE_GROUPS: SatelliteGroupMeta[] = [
  { id: 'starlink', label: 'Starlink', color: '#38bdf8', owner: 'SpaceX', count: 4200 },
  { id: 'oneweb', label: 'OneWeb', color: '#e2e8f0', owner: 'OneWeb', count: 620 },
  { id: 'planet', label: 'Planet Labs', color: '#fde68a', owner: 'Planet', count: 420 },
  { id: 'iridium', label: 'Iridium', color: '#94a3b8', owner: 'Iridium', count: 86 },
  { id: 'gps', label: 'GPS', color: '#4ade80', owner: 'US / GPS', count: 32 },
  { id: 'galileo', label: 'Galileo', color: '#a78bfa', owner: 'EU / Galileo', count: 28 },
  { id: 'glonass', label: 'GLONASS', color: '#fb923c', owner: 'RU / GLONASS', count: 26 },
  { id: 'debris', label: 'Debris', color: '#ef4444', owner: 'Debris / Fengyun / Cosmos debris', count: 1100 },
  { id: 'cosmos', label: 'Cosmos & Legacy', color: '#71717a', owner: 'RU / Legacy', count: 400 },
  { id: 'other', label: 'Other', color: '#64748b', owner: 'Mixed', count: 298 },
];
export function defaultSatelliteEnabled(): Record<SatelliteGroupId, boolean> {
  const out = {} as Record<SatelliteGroupId, boolean>;
  for (const g of SATELLITE_GROUPS) out[g.id] = true;
  return out;
}

export function defaultBodyEnabled(): Record<BodyId, boolean> {
  const out = {} as Record<BodyId, boolean>;
  for (const b of BODIES) out[b.id] = b.defaultOn;
  return out;
}

export function defaultAspectEnabled(): Record<AspectId, boolean> {
  const out = {} as Record<AspectId, boolean>;
  for (const a of ASPECT_DEFS) out[a.id] = a.family === 'ptolemaic';
  return out;
}

/** Legacy aliases used by older mode code. */
export type PlanetId = BodyId;
export const PLANET_COLORS = Object.fromEntries(BODIES.map((b) => [b.id, b.color])) as Record<BodyId, string>;
export const CHART_PLANETS: BodyId[] = BODIES.filter((b) => b.defaultOn && b.group !== 'angle').map((b) => b.id);
export const SOLAR_BODIES: BodyId[] = [
  'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];
