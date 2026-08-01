import { readFileSync } from 'node:fs';

const context = readFileSync(
  new URL('../artifacts/digital-sea/src/observatory/state/ObservatoryContext.tsx', import.meta.url),
  'utf8',
);
const world = readFileSync(
  new URL('../artifacts/digital-sea/src/observatory/modes/UnifiedWorld.tsx', import.meta.url),
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
if (!world.includes('if (selectedIndex >= 0)')) {
  failures.push('Satellite camera map must update only the selected satellite');
}
if (/map\.set\([^\n]+new THREE\.Vector3/.test(world)) {
  failures.push('Satellite frame loop must not allocate Vector3 objects in map.set');
}

if (failures.length) {
  for (const failure of failures) console.error(`OBSERVATORY STABILITY FAIL: ${failure}`);
  process.exit(1);
}

console.log('OBSERVATORY STABILITY OK — throttled ephemeris updates and bounded frame allocations');
