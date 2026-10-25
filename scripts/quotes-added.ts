// Keeps shared/content/quotes-added.json: when each quote first appeared.
//
//   tsx quotes-added.ts            record quotes the file has not seen, as now
//   tsx quotes-added.ts --backfill first-seen commit time for every quote in
//                                  the bank's git history, then the above
//
// The Quotes pages order categories, tabs and quotes by these times
// (artifacts/*/src/lib/quoteOrder.ts). The quotes pipeline runs the plain form
// every run and commits the file with the daily quotes snapshot. Entries are
// never removed, so a quote that leaves and returns keeps its first date.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseQuotes } from "../artifacts/blackboard/src/lib/parseQuotes";
import { quoteKey } from "../artifacts/blackboard/src/lib/quoteKey";

const root = fileURLToPath(new URL("../", import.meta.url));
const BANK = "shared/content/quotes.md";
const FILE = new URL("../shared/content/quotes-added.json", import.meta.url);

type Dates = Record<string, number>;

const keysOf = (bank: string) =>
  parseQuotes(bank).flatMap((section) => section.quotes.map((quote) => quoteKey(quote.text)));

function load(): Dates {
  if (!existsSync(FILE)) return {};
  return (JSON.parse(readFileSync(FILE, "utf8")) as { added?: Dates }).added ?? {};
}

function record(dates: Dates, keys: string[], at: number): number {
  let added = 0;
  for (const key of keys) {
    if (dates[key] === undefined) {
      dates[key] = at;
      added++;
    }
  }
  return added;
}

const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

function backfill(dates: Dates): number {
  // Follow the bank through its moves between folders. git cannot combine
  // --follow with --reverse (it returns one commit), so reverse here.
  const log = git("log", "--follow", "--format=%x00%H %ct", "--name-only", "--", BANK);
  let added = 0;
  for (const entry of log.split("\0").filter(Boolean).reverse()) {
    const [head, ...files] = entry.trim().split("\n");
    const [hash, time] = head.split(" ");
    const path = files.map((f) => f.trim()).find(Boolean);
    if (!path) continue;
    let bank: string;
    try {
      bank = git("show", `${hash}:${path}`);
    } catch {
      continue; // deleted in this commit
    }
    added += record(dates, keysOf(bank), Number(time));
  }
  return added;
}

const dates = load();
const before = Object.keys(dates).length;
const fromHistory = process.argv.includes("--backfill") ? backfill(dates) : 0;
const now = Math.floor(Date.now() / 1000);
const fresh = record(dates, keysOf(readFileSync(new URL(`../${BANK}`, import.meta.url), "utf8")), now);

if (Object.keys(dates).length !== before) {
  const sorted = Object.fromEntries(Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(FILE, `${JSON.stringify({ version: 1, added: sorted }, null, 1)}\n`);
}
console.log(`quote dates: ${Object.keys(dates).length} known, ${fromHistory} from history, ${fresh} new`);
