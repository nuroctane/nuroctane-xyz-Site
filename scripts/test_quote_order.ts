// Recency ordering for the Quotes pages (artifacts/*/src/lib/quoteRank.ts).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseQuotes } from "../artifacts/blackboard/src/lib/parseQuotes";
import { quoteKey } from "../artifacts/blackboard/src/lib/quoteKey";
import { rankByRecency } from "../artifacts/blackboard/src/lib/quoteRank";

const q = (text: string) => ({ text, source: "" });
const sections = [
  { name: "Faith", quotes: [q("f1"), q("f2")] },
  { name: "Love", quotes: [q("l1"), q("l2"), q("l3")] },
  { name: "Work", quotes: [q("w1")] },
];
const at = (pairs: Record<string, number>) =>
  Object.fromEntries(Object.entries(pairs).map(([text, t]) => [quoteKey(text), t]));
const dates = at({ f1: 10, f2: 50, l1: 20, l2: 30, l3: 40, w1: 60 });

const newest = rankByRecency(sections, "newest", dates);
assert.deepEqual(newest.map((s) => s.name), ["Work", "Faith", "Love"], "categories by latest addition");
assert.deepEqual(newest[1].quotes.map((x) => x.text), ["f2", "f1"]);
assert.deepEqual(newest[2].quotes.map((x) => x.text), ["l3", "l2", "l1"]);

const oldest = rankByRecency(sections, "oldest", dates);
assert.deepEqual(oldest.map((s) => s.name), ["Love", "Faith", "Work"], "oldest first mirrors newest");
assert.deepEqual(oldest[0].quotes.map((x) => x.text), ["l1", "l2", "l3"]);

// A live quote with no recorded date is the newest of all.
const live = rankByRecency(
  [...sections.slice(0, 2), { name: "Work", quotes: [q("w1"), q("brand new")] }],
  "newest",
  dates,
);
assert.equal(live[0].name, "Work");
assert.equal(live[0].quotes[0].text, "brand new");
const fresh = rankByRecency([{ name: "Love", quotes: [q("l1"), q("new in love")] }, ...sections], "newest", dates);
assert.equal(fresh[0].name, "Love", "a category that just gained a quote jumps to the front");

// No dates at all: the bank's own order, newest = reversed append order.
const plain = rankByRecency(sections, "newest", {});
assert.deepEqual(plain.map((s) => s.name), ["Faith", "Love", "Work"]);
assert.deepEqual(plain[1].quotes.map((x) => x.text), ["l3", "l2", "l1"]);

// Keys ignore punctuation and emphasis, so editorial repairs keep a quote's date.
assert.equal(quoteKey("Do it again — *now*!"), quoteKey("do it again, now"));
assert.notEqual(quoteKey("Do it again"), quoteKey("Do it later"));

// The committed dates should cover every bundled quote. A gap only means those
// quotes count as newest until the pipeline records them, so it warns rather
// than blocking a deploy.
const bank = readFileSync(new URL("../shared/content/quotes.md", import.meta.url), "utf8");
const recorded = JSON.parse(readFileSync(new URL("../shared/content/quotes-added.json", import.meta.url), "utf8")).added;
const missing = parseQuotes(bank).flatMap((s) => s.quotes).filter((x) => recorded[quoteKey(x.text)] === undefined);
if (missing.length) console.warn(`WARN: ${missing.length} bundled quotes have no added date; run scripts/quotes-added.ts`);

console.log(`QUOTE ORDER OK: categories and tabs by newest addition, mirrored oldest, undated live quotes newest, punctuation-proof keys${missing.length ? "" : ", full date coverage"}`);
