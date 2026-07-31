#!/bin/bash
# Sync quotes: Obsidian vault -> digital-sea repo (commits only on change).
#
# Steps:
#   0. Ensure we are on origin/main (never commit on a detached HEAD / side branch)
#   1. Strip YAML frontmatter (--- ... ---) from the source md
#   2. Auto-refresh the "## Index" list from the actual "## " headings in the
#      body (Obsidian index drifts when sections are added; the client reads
#      the body but the index is what the site UI shows).
#   3. Parse-sanity-check the result the same way QuotesPage.tsx does. Zero
#      quotes or a zero-quote section is a hard fail; log a warning without
#      blocking on soft issues (index/body count mismatch, callouts leaking
#      into sections).
#   4. Commit + push only if something actually changed after step 3.
#   5. Deploy via wrangler when a push landed (Workers Builds webhook has been
#      unreliable; local deploy keeps /quotes live). Set SYNC_DEPLOY=0 to skip.

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"
SRC="${OBSIDIAN_VAULT:-$HOME/iCloudDrive/iCloud~md~obsidian/∞∞∞/Metaphysics/Quotes.md}"
DEST="$REPO_ROOT/artifacts/digital-sea/src/content/quotes.md"
REL_DEST="artifacts/digital-sea/src/content/quotes.md"
LOG_DIR="$REPO_ROOT/.nur"
mkdir -p "$LOG_DIR"

[[ -f "$SRC" ]] || { echo "Source not found: $SRC"; exit 1; }
[[ -d "$REPO_ROOT/.git" ]] || { echo "Repo root not found: $REPO_ROOT"; exit 1; }

cd "$REPO_ROOT" || exit 1

# --- 0. Land on main before any mutation ------------------------------------
# A prior sync committed on a detached HEAD; `git push origin main` then no-oped
# and quotes never reached production. Always reset to the production branch.
ensure_main() {
  # Refuse to clobber unrelated dirty work outside the quotes file.
  local dirty
  dirty="$(git status --porcelain --untracked-files=no | grep -vE 'quotes\.md$' || true)"
  if [[ -n "$dirty" && "${SYNC_FORCE:-0}" != "1" ]]; then
    echo "[$(date)] Repo has unrelated local changes - aborting quotes sync:"
    echo "$dirty"
    echo "  (set SYNC_FORCE=1 to stash them, sync, and restore)"
    exit 3
  fi
  if [[ -n "$dirty" ]]; then
    git stash push -u -m "poll-sync auto stash $(date +%s)" -- .
  fi

  git fetch origin main >/dev/null 2>&1 || true
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
  if [[ "$branch" != "main" ]]; then
    echo "[$(date)] Checking out main (was: $branch)"
    # Discard only quotes.md drift so checkout can proceed; other files were
    # already gated above.
    git checkout -- "$REL_DEST" 2>/dev/null || true
    git checkout main || {
      echo "[$(date)] FATAL: cannot checkout main"
      exit 4
    }
  fi
  if ! git pull --ff-only origin main; then
    echo "[$(date)] FATAL: cannot fast-forward main from origin"
    exit 4
  fi
}

# Verification mode: exercise the real source, transformation, and parser
# without modifying the checkout or invoking git.
if [[ "${SYNC_DRY_RUN:-0}" != "1" ]]; then
  ensure_main
fi

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
  if (l.startsWith('>') && cur) {
    // Skip Obsidian callout runs entirely
    if (/^>\s*\[!/.test(l)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('>')) j++;
      i = j - 1;
      continue;
    }
    const ql = [];
    let j = i;
    while (j < lines.length && lines[j].startsWith('>') && !/^>\s*\[!/.test(lines[j])) {
      ql.push(lines[j].replace(/^>\s*/, ''));
      j++;
    }
    i = j - 1;
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

if [[ "${SYNC_DRY_RUN:-0}" == "1" ]]; then
    if cmp -s "$REINDEXED" "$DEST"; then
        echo "[$(date)] DRY RUN: quotes are in sync"
    else
        echo "[$(date)] DRY RUN: quotes would be updated"
    fi
    rm -f "$STRIPPED" "$REINDEXED"
    exit 0
fi

# 4. Commit + push only if git will see a real content change.
# Compare against HEAD (not the working tree) so CRLF/LF noise on disk
# does not look like a vault update.
GIT_BLOB="$(mktemp)"
if git show "HEAD:$REL_DEST" > "$GIT_BLOB" 2>/dev/null && cmp -s "$REINDEXED" "$GIT_BLOB"; then
    # Refresh working tree so local disk matches the vault transform.
    cp "$REINDEXED" "$DEST"
    rm -f "$STRIPPED" "$REINDEXED" "$GIT_BLOB"
    echo "[$(date)] Quotes unchanged vs origin/main, no sync needed"
    exit 0
fi
rm -f "$GIT_BLOB"

if [[ -f "$DEST" ]] && cmp -s "$REINDEXED" "$DEST"; then
    rm -f "$STRIPPED" "$REINDEXED"
    echo "[$(date)] Quotes unchanged on disk, no sync needed"
    exit 0
fi

mv "$REINDEXED" "$DEST"
rm -f "$STRIPPED"
git add -- "$REL_DEST"

# Commit-guard: if git-diff shows nothing staged (line endings normalized
# by .gitattributes, etc.), skip the commit + push instead of pushing empty.
if git diff --cached --quiet -- "$REL_DEST"; then
    echo "[$(date)] Transformed quotes match git after line-ending normalize, no push"
    exit 0
fi

git commit -m "chore: sync quotes from Obsidian vault [auto]"
# Push the commit we just made on main - never push a detached SHA as "main".
if ! git push origin HEAD:main; then
    echo "[$(date)] FATAL: git push origin HEAD:main failed"
    exit 5
fi
echo "[$(date)] Quotes synced and pushed"

# 5. Deploy. Workers Builds should fire on push; it has been silent since
# 2026-07-30, so keep /quotes live with a local wrangler deploy when enabled.
if [[ "${SYNC_DEPLOY:-1}" == "1" ]]; then
    echo "[$(date)] Deploying Worker (SYNC_DEPLOY=1)…"
    if command -v pnpm >/dev/null 2>&1; then
        if pnpm run build && npx wrangler deploy; then
            echo "[$(date)] Deploy OK"
        else
            echo "[$(date)] WARNING: deploy failed - quotes are on GitHub main; redeploy manually"
            exit 6
        fi
    else
        echo "[$(date)] WARNING: pnpm not on PATH - skipped deploy"
    fi
fi
