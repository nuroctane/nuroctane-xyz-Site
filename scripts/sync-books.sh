#!/bin/bash
# Sync books the other direction: digital-sea repo -> Obsidian vault.
#
# Source of truth for the site wishlist is:
#   artifacts/digital-sea/src/content/books.md
# Vault mirror (same body, no frontmatter today):
#   ∞∞∞/Books/Book Wishlist.md
#
# Called from poll-sync after a books.md pull, and also whenever the two
# files differ (cheap cmp) so a manual pull / Workers deploy still lands
# in Obsidian without waiting for the 90-min interval.

set -uo pipefail

export HOME="${HOME:-/c/Users/david}"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"
SRC="$REPO_ROOT/artifacts/digital-sea/src/content/books.md"
DEST="${OBSIDIAN_BOOKS:-$HOME/iCloudDrive/iCloud~md~obsidian/∞∞∞/Books/Book Wishlist.md}"

[[ -f "$SRC" ]] || { echo "books.md not found: $SRC"; exit 1; }
[[ -f "$DEST" ]] || { echo "Book Wishlist.md not found: $DEST"; exit 1; }

if cmp -s "$SRC" "$DEST"; then
  echo "[$(date)] Books unchanged (repo == Book Wishlist.md)"
  exit 0
fi

# Preserve any YAML frontmatter the vault note may grow later; today the
# wishlist has none, so this is a straight copy.
if head -n 1 "$DEST" | grep -qx -- '---'; then
  BODY="$(mktemp)"
  awk '
    NR == 1 && /^---$/ { in_fm=1; print; next }
    in_fm { print; if (/^---$/) in_fm=0; next }
    { exit }
  ' "$DEST" > "$BODY.fm"
  cat "$BODY.fm" "$SRC" > "$BODY"
  mv "$BODY" "$DEST"
  rm -f "$BODY.fm"
else
  cp "$SRC" "$DEST"
fi

echo "[$(date)] Synced books.md -> Book Wishlist.md"
exit 0
