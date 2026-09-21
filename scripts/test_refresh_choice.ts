import assert from 'node:assert/strict';
import { chooseExceptPrevious, refreshChoice, rememberChoice } from '../artifacts/blackboard/src/lib/refreshChoice';

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
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
assert.doesNotThrow(() => refreshChoice('wallpaper', items, identity));
delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
console.log('Refresh selection: exclusion, independence, stale history and unavailable storage passed.');
