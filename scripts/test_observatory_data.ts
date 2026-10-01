import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import router from '../artifacts/api-server/src/routes/observatory';
import { loadObservatoryCatalog, parseTleCatalog, propagateGeodetic } from '../artifacts/blackboard/src/observatory/lib/tle';
import { fetchEarthquakes, fetchRealWindGrid, windFromCurrent } from '../artifacts/blackboard/src/observatory/lib/meteo';
import { SATELLITE_GROUPS, type SatelliteGroupId } from '../artifacts/blackboard/src/observatory/lib/types';

const originalFetch = globalThis.fetch;
const lines = readFileSync(new URL('../artifacts/blackboard/public/observatory-runtime/data/tle-visual.txt', import.meta.url), 'utf8').trim().split(/\r?\n/);
const first = lines.slice(0, 3).join('\n');
const second = lines.slice(3, 6).join('\n');
const enabled = Object.fromEntries(SATELLITE_GROUPS.map(g => [g.id, g.id === 'other'])) as Record<SatelliteGroupId, boolean>;
const spec = { id: 'visual', file: null, cap: 400, forceGroup: null };

try {
  const parsed = parseTleCatalog(first, spec);
  assert.equal(parsed.length, 1);
  const epoch = new Date((parsed[0].satrec.jdsatepoch - 2440587.5) * 86_400_000);
  const position = propagateGeodetic(parsed[0].satrec, epoch);
  assert.ok(position && Math.abs(position.lat) <= 90 && Math.abs(position.lon) <= 180 && position.altKm > 80);
  assert.equal(parseTleCatalog('not a catalog', spec).length, 0);

  // A broken snapshot cannot discard a different, healthy feed.
  globalThis.fetch = async input => {
    if (String(input).endsWith('set=stations')) return new Response(second);
    if (String(input).includes('/api/')) return new Response('', { status: 503 });
    throw new Error('snapshot unavailable');
  };
  const healthy = await loadObservatoryCatalog(enabled, new AbortController().signal);
  assert.equal(healthy.sats.length, 1);
  assert.equal(healthy.source, 'live');

  globalThis.fetch = async input => {
    const url = String(input);
    if (url.endsWith('set=stations')) return new Response(second);
    if (url.includes('/api/')) return new Response('<html>1 thing 2 things</html>');
    return new Response(first);
  };
  const mixed = await loadObservatoryCatalog(enabled, new AbortController().signal);
  assert.equal(mixed.sats.length, 2);
  assert.equal(mixed.source, 'mixed');
  const fresh = first.replace(/^1 .*/m, line => line.slice(0, 18) +
    (Number(line.slice(18, 32)) + 1).toFixed(8).padStart(14, '0') + line.slice(32));
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.endsWith('set=stations')) return new Response(fresh);
    if (url.includes('/api/')) return new Response('', { status: 503 });
    return new Response(first);
  };
  const deduped = await loadObservatoryCatalog(enabled, new AbortController().signal);
  assert.equal(deduped.sats.length, 1);
  assert.equal(deduped.source, 'live', 'A live duplicate must supersede its older snapshot');
  assert.equal(deduped.sats[0].satrec.jdsatepoch, parsed[0].satrec.jdsatepoch + 1);
  const none = { ...enabled, other: false };
  assert.equal((await loadObservatoryCatalog(none, new AbortController().signal)).sats.length, 0);

  const abort = new AbortController();
  abort.abort();
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError'); };
  await assert.rejects(loadObservatoryCatalog(enabled, abort.signal), { name: 'AbortError' });

  let calls = 0;
  globalThis.fetch = async (_input, init) => {
    calls++;
    assert.match(String((init?.headers as Record<string, string>)['User-Agent']), /nuroctane/);
    return new Response(first);
  };
  assert.equal((await router.request('http://localhost/observatory/tle?set=constructor')).status, 400);
  assert.equal(calls, 0);
  const live = await router.request('http://localhost/observatory/tle?set=stations');
  assert.equal(live.status, 200);
  assert.equal(await live.text(), first);
  assert.equal(live.headers.get('X-Observatory-TLE'), 'live');
  assert.equal((await router.request('http://localhost/observatory/tle?set=stations')).headers.get('X-Observatory-TLE'), 'cache');
  assert.equal(calls, 1);
  assert.equal(live.headers.get('Cache-Control'), 'public, max-age=7200');
  globalThis.fetch = async () => {
    calls++;
    await new Promise(resolve => setTimeout(resolve, 10));
    return new Response(first);
  };
  await Promise.all([
    router.request('http://localhost/observatory/tle?set=gps'),
    router.request('http://localhost/observatory/tle?set=gps'),
  ]);
  assert.equal(calls, 2, 'Concurrent requests must share one upstream fetch');
  calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('<html>upstream error</html>'); };
  assert.equal((await router.request('http://localhost/observatory/tle?set=visual')).status, 502);
  assert.equal((await router.request('http://localhost/observatory/tle?set=visual')).status, 502);
  assert.equal(calls, 1, 'An unavailable upstream must cool down rather than be retried on each refresh');
  assert.equal((await router.request('http://localhost/observatory/geocode?q=x')).status, 400);
  assert.equal((await router.request('http://localhost/observatory/geocode?q=Tokyo')).status, 502);
  globalThis.fetch = async () => Response.json([{ place_id: 1, display_name: 'Tokyo', lat: '35.68', lon: '139.76' }]);
  assert.equal((await router.request('http://localhost/observatory/geocode?q=Tokyo')).status, 200);

  // Meteorological direction is where wind comes FROM; u is east, v north.
  for (const [dir, u, v] of [[0, 0, -10], [90, -10, 0], [180, 0, 10], [270, 10, 0]]) {
    const got = windFromCurrent(0, 0, 10, dir);
    assert.ok(Math.abs(got.u - u) < 1e-10 && Math.abs(got.v - v) < 1e-10);
  }
  calls = 0;
  globalThis.fetch = async input => {
    calls++;
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('latitude')?.split(',').length, 99);
    assert.equal(url.searchParams.get('longitude')?.split(',').length, 99);
    assert.equal(url.searchParams.get('wind_speed_unit'), 'ms');
    return Response.json(Array.from({ length: 99 }, (_, i) => ({ current: { wind_speed_10m: i === 98 ? null : 10, wind_direction_10m: 0 } })));
  };
  assert.equal((await fetchRealWindGrid()).length, 98, 'Missing weather must not turn into invented calm wind');
  assert.equal((await fetchRealWindGrid()).length, 98);
  assert.equal(calls, 1, 'The entire grid loads once and is cached');

  globalThis.fetch = async () => Response.json({ features: [{ id: 'missing' }, { id: 'valid', geometry: { coordinates: [10, 20, 30] }, properties: { mag: 5 } }] });
  const quakes = await fetchEarthquakes();
  assert.equal(quakes.length, 1, 'Missing coordinates must not put a fake quake at 0,0');
  assert.equal(quakes[0].id, 'valid');
  globalThis.fetch = async input => String(input).startsWith('/api/')
    ? new Response('', { status: 502 })
    : new Response(readFileSync(new URL(`../artifacts/blackboard/public${input}`, import.meta.url), 'utf8'));
  const offline = await loadObservatoryCatalog(
    Object.fromEntries(SATELLITE_GROUPS.map(g => [g.id, true])) as Record<SatelliteGroupId, boolean>,
    new AbortController().signal,
  );
  assert.equal(offline.source, 'snapshot');
  assert.ok(offline.sats.length > 200 && offline.sats.length <= 640, 'All groups have working bounded fallback catalogs');
  console.log('OBSERVATORY DATA OK — SGP4, partial outages, snapshots, cancellation, proxy validation/cache, cardinal winds and batched weather');
} finally {
  globalThis.fetch = originalFetch;
}
