#!/bin/bash
# Sync quotes: Obsidian vault → digital-sea repo (commits only on change)
# Strips YAML frontmatter from Obsidian file

SRC="/c/Users/david/iCloudDrive/iCloud~md~obsidian/∞∞∞/Metaphysics/Quotes.md"
DEST="/c/Users/david/Laboratory/nuroctane.xyz/artifacts/digital-sea/src/content/quotes.md"
REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"

# Exit if source doesn't exist
[[ -f "$SRC" ]] || { echo "Source not found: $SRC"; exit 1; }

# Create temp file with frontmatter stripped
# Frontmatter: lines between first --- and second ---
awk '
  NR == 1 && /^---$/ { in_fm=1; next }
  in_fm && /^---$/ { in_fm=0; next }
  !in_fm
' "$SRC" > "$DEST.tmp"

# Compare and commit only if different
if ! cmp -s "$DEST.tmp" "$DEST"; then
    mv "$DEST.tmp" "$DEST"
    cd "$REPO_ROOT"
    git add artifacts/digital-sea/src/content/quotes.md
    git commit -m "chore: sync quotes from Obsidian vault [auto]"
    git push origin main
    echo "[$(date)] Quotes synced and pushed"
else
    rm -f "$DEST.tmp"
    echo "[$(date)] Quotes unchanged, no sync needed"
fi
