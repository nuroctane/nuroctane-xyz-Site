import assert from 'node:assert/strict';
import { searchBooks } from '../artifacts/api-server/src/lib/book-search';

const originalFetch = globalThis.fetch;
let mode: 'healthy' | 'partial' | 'outage' = 'healthy';
let calls = 0;
globalThis.fetch = async (input) => {
  calls++;
  const url = new URL(String(input));
  if (mode === 'outage' || mode === 'partial' && url.hostname !== 'openlibrary.org') throw new Error('Catalog offline');
  let data: unknown = {};
  if (url.hostname === 'www.googleapis.com') data = { items: [{ id: 'dune', volumeInfo: { title: 'Dune', authors: ['Frank Herbert'], description: '<p>A desert &amp; its people.</p>', imageLinks: { thumbnail: 'http://example.com/cover.jpg' } } }] };
  if (url.hostname === 'openlibrary.org') data = { docs: [
    { key: '/works/sequel', title: 'Children of Dune', author_name: ['Frank Herbert'] },
    { key: '/works/dune', title: 'Dune', author_name: ['Frank Herbert'], first_publish_year: 1965 },
    { key: '/works/jp1', title: '雪国', author_name: ['川端康成'] },
    { key: '/works/jp2', title: 'こころ', author_name: ['夏目漱石'] },
    ...Array.from({length: 12}, (_, i) => ({key: `/works/other${i}`, title: `Other book ${i}`, author_name: ['Other author']})),
  ] };
  return Response.json(data);
};
try {
  const result = await searchBooks('Dune');
  assert.equal(result.sources.length, 6);
  assert.equal(result.results[0].title, 'Dune', 'Exact title must rank above sequel');
  assert.equal(result.results.filter(book => book.title === 'Dune').length, 1, 'Merge matching catalogs');
  assert.deepEqual(result.results[0].sources, ['Google Books', 'Open Library']);
  assert.equal(result.results[0].year, '1965');
  assert.equal(result.results[0].coverUrl, 'https://example.com/cover.jpg');
  assert.equal(result.results[0].description, 'A desert & its people.');
  assert.ok(result.results.length > 5, 'Keep deeper catalog matches');
  assert.ok(result.results.some(book => book.title === '雪国') && result.results.some(book => book.title === 'こころ'), 'Do not merge unrelated non-Latin books');
  const beforeCache = calls;
  await searchBooks('  DUNE  ');
  assert.equal(calls, beforeCache, 'Equivalent queries reuse cache');
  await searchBooks('雪国');
  const beforeUnicode = calls;
  await searchBooks('こころ');
  assert.equal(calls, beforeUnicode + 6, 'Distinct non-Latin queries must not collide');
  mode = 'partial';
  const partial = await searchBooks('partial availability');
  assert.deepEqual(partial.sources, ['Open Library']);
  assert.ok(partial.results.length > 0);
  mode = 'outage';
  await assert.rejects(searchBooks('recover after outage'), /unavailable/);
  mode = 'healthy';
  assert.equal((await searchBooks('recover after outage')).sources.length, 6, 'Outage cannot poison retry cache');
  console.log('Book search: ranking, metadata merge, >5 results, Unicode, cache, partial outage, recovery passed.');
} finally { globalThis.fetch = originalFetch; }
