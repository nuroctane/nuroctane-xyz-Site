import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldLoadFoglampMap } from './foglampEmbed.ts';

test('defers the first Foglamp load on mobile', () => {
  assert.equal(shouldLoadFoglampMap(false, false), false);
});

test('loads Foglamp automatically on desktop', () => {
  assert.equal(shouldLoadFoglampMap(true, false), true);
});

test('keeps Foglamp loaded after the viewport narrows', () => {
  assert.equal(shouldLoadFoglampMap(false, true), true);
});
