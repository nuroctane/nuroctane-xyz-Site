import { ASPECT_DEFS, type AspectId, type BodyId } from './catalogs';
import type { AspectHit, PlanetPosition } from './types';
import { degDelta } from './math';

export function findAspects(
  planets: PlanetPosition[],
  opts?: {
    enabled?: Partial<Record<AspectId, boolean>>;
    orbScale?: number;
  },
): AspectHit[] {
  const enabled = opts?.enabled;
  const orbScale = opts?.orbScale ?? 1;
  const defs = ASPECT_DEFS.filter((d) => (enabled ? enabled[d.id] !== false : d.family === 'ptolemaic'));

  const hits: AspectHit[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i]!;
      const b = planets[j]!;
      if (a.id === 'Earth' || b.id === 'Earth') continue;
      const sep = degDelta(a.lon, b.lon);
      let best: AspectHit | null = null;
      for (const def of defs) {
        if (enabled && enabled[def.id] === false) continue;
        const delta = Math.abs(sep - def.angle);
        const orb = def.defaultOrb * orbScale;
        if (delta <= orb) {
          const hit: AspectHit = {
            a: a.id as BodyId,
            b: b.id as BodyId,
            aspect: def.id,
            label: def.label,
            color: def.color,
            angle: def.angle,
            delta,
            applying:
              a.speedDegPerDay !== undefined && b.speedDegPerDay !== undefined
                ? (a.speedDegPerDay - b.speedDegPerDay) * (sep > def.angle ? -1 : 1) > 0
                : undefined,
          };
          if (!best || hit.delta < best.delta) best = hit;
        }
      }
      if (best) hits.push(best);
    }
  }
  return hits.sort((x, y) => x.delta - y.delta);
}
