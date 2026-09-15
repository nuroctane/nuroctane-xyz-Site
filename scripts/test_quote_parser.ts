import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseQuotes } from '../artifacts/blackboard/src/lib/parseQuotes';

const fixture = `## Index
> Not a quote
## Faith
_Description_
> [!note] Private callout
> This is not public quote text.

> First paragraph.
>
> Second paragraph.
> — @one
> Next quote without a separator.
> -- @two

> A list:
> - keep this bullet
>
> Last line.
> – Author
>

## Life
> Last quote at EOF.`;
for (const input of [fixture, fixture.replaceAll('\n', '\r\n')]) {
  const sections = parseQuotes(input);
  assert.deepEqual(sections.map(s => s.name), ['Faith', 'Life']);
  assert.equal(sections[0].description, 'Description');
  assert.deepEqual(sections[0].quotes, [
    { text: 'First paragraph.\n\nSecond paragraph.', source: '@one' },
    { text: 'Next quote without a separator.', source: '@two' },
    { text: 'A list:\n- keep this bullet\n\nLast line.', source: 'Author' },
  ]);
  assert.equal(sections[1].quotes[0].text, 'Last quote at EOF.');
}

const raw = readFileSync(new URL('../artifacts/blackboard/src/content/quotes.md', import.meta.url), 'utf8');
const sections = parseQuotes(raw);
assert.equal(sections.length, 12);
for (const section of sections) {
  assert(section.quotes.length > 0, `Empty category: ${section.name}`);
  assert(raw.includes(`[[#${section.name}|${section.name}]] (${section.quotes.length})`), `Index count drift: ${section.name}`);
}
const quotes = sections.flatMap(s => s.quotes);
const industry = quotes.filter(q => q.text.startsWith("The entire spiritual industry is a coward's invention"));
assert.equal(industry.length, 1, 'Cutoff duplicate returned');
assert(industry[0].text.endsWith('the aesthetic of having paid it.'));
for (const prefix of ['The reason you have a hard time trusting your intuition', 'One energy that used to trip me up in people was certainty']) {
  assert.equal(quotes.find(q => q.text.startsWith(prefix))?.source, '@Maryamhasnaa');
}
assert(!sections.some(s => /Index|Unsorted Sparks/.test(s.name)));
console.log(`QUOTE PARSER OK — ${quotes.length} quotes, 12 matching index counts, attribution/paragraph/callout fixtures`);
