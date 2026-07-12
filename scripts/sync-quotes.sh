#!/bin/bash
# Sync quotes: Obsidian vault -> digital-sea repo (commits only on change).
#
# Steps:
#   1. Strip YAML frontmatter (--- ... ---) from the source md
#   2. Auto-refresh the "## Index" list from the actual "## " headings in the
#      body (Obsidian index drifts when sections are added; the client reads
#      the body but the index is what the site UI shows).
#   3. Parse-sanity-check the result the same way QuotesPage.tsx does. Zero
#      quotes or a zero-quote section is a hard fail; log a warning without
#      blocking on soft issues (index/body count mismatch, callouts leaking
#      into sections).
#   4. Commit + push only if something actually changed after step 3.

set -uo pipefail

SRC="/c/Users/david/iCloudDrive/iCloud~md~obsidian/∞∞∞/Metaphysics/Quotes.md"
DEST="/c/Users/david/Laboratory/nuroctane.xyz/artifacts/digital-sea/src/content/quotes.md"
REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"
REL_DEST="artifacts/digital-sea/src/content/quotes.md"

[[ -f "$SRC" ]] || { echo "Source not found: $SRC"; exit 1; }
[[ -d "$REPO_ROOT/.git" ]] || { echo "Repo root not found: $REPO_ROOT"; exit 1; }

# 1. Strip frontmatter.
STRIPPED="$(mktemp)"
awk '
  NR == 1 && /^---$/ { in_fm=1; next }
  in_fm && /^---$/   { in_fm=0; next }
  !in_fm
' "$SRC" > "$STRIPPED"

# 2. Auto-refresh "## Index" from actual body headings + quote counts.
#    Pass 1: collect (name, count) pairs to a sidecar file. A quote is a
#    contiguous run of "> " lines; count blocks, not lines. Callouts
#    ("> [!...") are excluded to match the client parser.
IDX="$STRIPPED.idx"
awk '
  {
    if ($0 ~ /^## Index[[:space:]]*$/) { in_index=1; in_quote=0; next }
    if (in_index && $0 ~ /^## /)       { in_index=0 }
    if (in_index) next
    if ($0 ~ /^## /) {
      cur = $0; sub(/^## /, "", cur)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", cur)
      order[++n] = cur; count[cur] = 0; in_quote=0; next
    }
    if (cur != "" && $0 ~ /^>/) {
      # Contiguous `>` lines = one entry (bare `>` blank lines keep the block).
      # Callouts ("> [!...") are excluded to match the client parser.
      if (!in_quote && $0 !~ /^> \[!/) { count[cur]++; in_quote=1 }
      else if (!in_quote) { in_quote=1 }  # callout line: consume, do not count
      next
    }
    in_quote=0
  }
  END {
    for (i=1; i<=n; i++) print order[i] "\t" count[order[i]] > "'"$IDX"'"
  }
' "$STRIPPED"

REINDEXED="$(mktemp)"
awk -v idxfile="$IDX" '
  BEGIN {
    while ((getline line < idxfile) > 0) {
      split(line, a, "\t")
      idx[++n] = a[1]; cnt[a[1]] = a[2]
    }
    close(idxfile)
  }
  {
    if ($0 ~ /^## Index[[:space:]]*$/) {
      print "## Index"
      for (i=1; i<=n; i++) printf "- [[#%s|%s]] (%d)\n", idx[i], idx[i], cnt[idx[i]]
      skipping=1
      next
    }
    if (skipping) {
      if ($0 ~ /^## /) { skipping=0; print ""; print; next }
      next
    }
    print
  }
' "$STRIPPED" > "$REINDEXED"
rm -f "$IDX"

# 3. Parser sanity check. Mirrors QuotesPage.tsx section+quote extraction.
node - "$REINDEXED" <<'JS'
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2], 'utf-8');
const lines = src.split('\n');
const sections = [];
let cur = null, inIndex = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('## Index')) { inIndex = true; continue; }
  if (inIndex && l.startsWith('## ') && !l.startsWith('## Index')) inIndex = false;
  if (inIndex) continue;
  if (l.startsWith('## ') && !l.startsWith('## Index')) {
    if (cur) sections.push(cur);
    const name = l.replace(/^## /, '').trim();
    let d = i + 1;
    while (d < lines.length && lines[d].trim() === '') d++;
    const dl = d < lines.length ? lines[d].trim() : '';
    if (dl.startsWith('_') && dl.endsWith('_')) i = d;
    cur = { name, quotes: [], leakedCallouts: 0 };
    continue;
  }
  if (l.startsWith('>') && cur && !l.startsWith('> [!')) {
    const ql = [];
    let j = i;
    while (j < lines.length && lines[j].startsWith('>') && !lines[j].startsWith('> [!')) {
      ql.push(lines[j].replace(/^>\s?/, ''));
      j++;
    }
    i = j - 1;
    if (ql[0]?.startsWith('[!')) { cur.leakedCallouts++; continue; }
    cur.quotes.push(ql.join('\n'));
  }
}
if (cur) sections.push(cur);

const errs = [], warns = [];
if (sections.length === 0) errs.push('no sections parsed');
let total = 0;
for (const s of sections) {
  total += s.quotes.length;
  if (s.quotes.length === 0) errs.push(`section "${s.name}" has zero quotes`);
  if (s.leakedCallouts > 0)  warns.push(`section "${s.name}" contains ${s.leakedCallouts} callout block(s) - ignored`);
}
if (total === 0) errs.push('total quote count is zero');

console.log(`  sections: ${sections.length}, total quotes: ${total}`);
for (const s of sections) console.log(`    - ${s.name}: ${s.quotes.length}`);
if (warns.length) { console.log('  warnings:'); for (const w of warns) console.log('    ! ' + w); }
if (errs.length)  { console.error('  errors:');  for (const e of errs)  console.error('    x ' + e); process.exit(2); }
JS
SANITY=$?
if [[ $SANITY -ne 0 ]]; then
    echo "[$(date)] Parser sanity check FAILED - aborting sync"
    rm -f "$STRIPPED" "$REINDEXED"
    exit $SANITY
fi

# 4. Commit + push only if something actually changed.
if cmp -s "$REINDEXED" "$DEST"; then
    rm -f "$STRIPPED" "$REINDEXED"
    echo "[$(date)] Quotes unchanged, no sync needed"
    exit 0
fi

mv "$REINDEXED" "$DEST"
rm -f "$STRIPPED"
cd "$REPO_ROOT" || exit 1
git add "$REL_DEST"

# Commit-guard: if git-diff shows nothing staged (line endings normalized
# by .gitattributes, etc.), skip the commit + push instead of pushing empty.
if git diff --cached --quiet -- "$REL_DEST"; then
    echo "[$(date)] File differs but git sees no staged changes (line endings normalized?), no push"
    exit 0
fi

git commit -m "chore: sync quotes from Obsidian vault [auto]"
git push origin main
echo "[$(date)] Quotes synced and pushed"
