import assert from 'node:assert/strict';
import { chooseExceptPrevious, refreshChoice, refreshShuffledChoice, rememberChoice } from '../artifacts/blackboard/src/lib/refreshChoice';

const items = ['a', 'b', 'c'];
const identity = (id: string) => id;
for (const previous of items) {
  const draws = Array.from({ length: 100 }, (_, i) =>
    chooseExceptPrevious(items, previous, identity, () => i / 100));
  assert(!draws.includes(previous));
  for (const eligible of items.filter(id => id !== previous)) {
    assert.equal(draws.filter(id => id === eligible).length, 50);
  }
}
assert.equal(chooseExceptPrevious(items, 'removed', identity, () => 0), 'a');
assert.equal(chooseExceptPrevious(['only'], 'only', identity), 'only');
assert.throws(() => chooseExceptPrevious([], null, identity));

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
} });
rememberChoice('wallpaper', 'b');
rememberChoice('music', 'a');
for (let i = 0; i < 1000; i++) {
  const lastWallpaper = storage.get('wallpaper');
  const lastMusic = storage.get('music');
  const wallpaper = refreshChoice('wallpaper', items, identity);
  assert.notEqual(wallpaper, lastWallpaper);
  assert.equal(storage.get('music'), lastMusic, 'wallpaper never alters music history');
  assert.notEqual(refreshChoice('music', items, identity), lastMusic);
}
// A manual wallpaper change must be the one excluded on the next refresh.
rememberChoice('wallpaper', 'c');
assert.notEqual(refreshChoice('wallpaper', items, identity), 'c');

let seed = 12345;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const library = Array.from({ length: 31 }, (_, i) => `track-${i}`);
const history: string[] = [];
const untouchedWallpaper = storage.get('wallpaper');
for (let cycle = 0; cycle < 100; cycle++) {
  const rotation: string[] = [];
  for (let i = 0; i < library.length; i++) {
    const track = refreshShuffledChoice('balanced-music', library, identity, random);
    assert(!history.slice(-5).includes(track), 'last five excluded even across cycle boundaries');
    history.push(track);
    rotation.push(track);
  }
  assert.equal(new Set(rotation).size, library.length, 'every song gets exactly one turn per cycle');
}
assert.equal(storage.get('wallpaper'), untouchedWallpaper, 'music leaves wallpaper history alone');
// The serialized queue is authoritative, as it will be after a page refresh.
storage.set('restored:rotation', JSON.stringify({ version: 1, catalogue: library,
  remaining: ['track-8', 'track-9'], recent: library.slice(0, 5) }));
assert.equal(refreshShuffledChoice('restored', library, identity, random), 'track-8');
assert.equal(refreshShuffledChoice('restored', library, identity, random), 'track-9');
rememberChoice('legacy-music', 'track-0');
assert.notEqual(refreshShuffledChoice('legacy-music', library, identity, () => 0.999), 'track-0', 'migrate the old last-song exclusion');
for (let size = 1; size <= 6; size++) {
  const small = library.slice(0, size);
  const recent: string[] = [];
  for (let i = 0; i < 120; i++) {
    const track = refreshShuffledChoice(`small-${size}`, small, identity, random);
    if (size > 1) assert(!recent.slice(-(size - 1)).includes(track));
    recent.push(track);
  }
}
assert.throws(() => refreshShuffledChoice('empty', [], identity));
storage.set('changed:rotation', JSON.stringify({ version: 1, catalogue: ['a', 'b', 'removed'],
  remaining: ['removed', 'b', 'b'], recent: ['removed', 'a'] }));
assert.equal(refreshShuffledChoice('changed', ['a', 'b', 'new'], identity, random), 'b');
assert.equal(refreshShuffledChoice('changed', ['a', 'b', 'new'], identity, random), 'new');
for (const invalid of ['not json', '{}', '{"version":1,"remaining":[null]}']) {
  storage.set('corrupt:rotation', invalid);
  assert(library.includes(refreshShuffledChoice('corrupt', library, identity, random)));
}
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
assert.doesNotThrow(() => refreshChoice('wallpaper', items, identity));
const blockedHistory: string[] = [];
for (let i = 0; i < 100; i++) {
  const track = refreshShuffledChoice('blocked-music', library, identity, random);
  assert(!blockedHistory.slice(-5).includes(track));
  blockedHistory.push(track);
}
delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
console.log('Refresh selection: 100 balanced 31-song cycles, last-five exclusion, persistence, migration, small libraries, catalogue changes, and storage recovery passed.');
