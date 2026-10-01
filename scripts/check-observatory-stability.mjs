import { readFileSync } from 'node:fs';

const context = readFileSync(
  new URL('../artifacts/blackboard/src/observatory/state/ObservatoryContext.tsx', import.meta.url),
  'utf8',
);
const world = readFileSync(
  new URL('../artifacts/blackboard/src/observatory/modes/UnifiedWorld.tsx', import.meta.url),
  'utf8',
);
const field = readFileSync(
  new URL('../artifacts/blackboard/src/observatory/modes/SatelliteField.tsx', import.meta.url),
  'utf8',
);
const meteo = readFileSync(
  new URL('../artifacts/blackboard/src/observatory/lib/meteo.ts', import.meta.url),
  'utf8',
);

const failures = [];

if (context.includes('requestAnimationFrame(tick)')) {
  failures.push('Observatory context must not publish time state on every animation frame');
}
if (!context.includes('const intervalMs = live ? 1_000 : 100')) {
  failures.push('Observatory clock cadence guard is missing');
}
if (!context.includes('const SWISS_WASM_BROWSER_ENABLED = false')) {
  failures.push('Broken Swiss WASM browser initialization was re-enabled');
}
if (!field.includes('if (selectedIndex >= 0)')) {
  failures.push('Satellite camera map must update only the selected satellite');
}
if (/map\.set\([^\n]+new THREE\.Vector3/.test(field) || /map\.set\([^\n]+new THREE\.Vector3/.test(world)) {
  failures.push('Satellite frame loop must not allocate Vector3 objects in map.set');
}
if (world.includes('wheretheiss.at') || world.includes('Math.random()')) {
  failures.push('Observatory world must use propagated TLE, not random orbits or the ISS poll');
}
if (meteo.includes('tasks.push')) {
  failures.push('Wind grid must be one Open-Meteo request, not one request per cell');
}

if (failures.length) {
  for (const failure of failures) console.error(`OBSERVATORY STABILITY FAIL: ${failure}`);
  process.exit(1);
}

console.log('OBSERVATORY STABILITY OK — throttled ephemeris updates and bounded frame allocations');
