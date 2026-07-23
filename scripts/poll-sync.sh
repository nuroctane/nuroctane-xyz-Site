#!/bin/bash
# Unified poller: checks for remote changes to books.md, pulls if found
# Also runs quotes sync (Obsidian → repo)
# Tracks last run to enforce ~90 min interval between pulls

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"
STATE_FILE="$REPO_ROOT/.sync-state"
NOW=$(date +%s)
INTERVAL=5400  # 90 minutes in seconds

cd "$REPO_ROOT" || exit 1

# Read last run timestamp
LAST_RUN=0
[[ -f "$STATE_FILE" ]] && LAST_RUN=$(cat "$STATE_FILE" 2>/dev/null || echo 0)

# Check if enough time has passed (for git pull)
SHOULD_PULL=0
if (( NOW - LAST_RUN >= INTERVAL )); then
    SHOULD_PULL=1
fi

# Always run quotes sync (Obsidian → repo) - it's cheap and only commits on change
"$REPO_ROOT/scripts/sync-quotes.sh"

# Conditional git pull for books (repo → Obsidian)
if (( SHOULD_PULL )); then
    git fetch origin main >/dev/null 2>&1
    if git diff HEAD origin/main --name-only | grep -q 'artifacts/digital-sea/src/content/books.md'; then
        git pull origin main
        echo "[$(date)] Pulled books.md update"
    else
        echo "[$(date)] No remote changes to books.md"
    fi
    # Update timestamp regardless (avoid hammering on every cron tick)
    echo "$NOW" > "$STATE_FILE"
else
    REMAIN=$(( (LAST_RUN + INTERVAL - NOW) / 60 ))
    echo "[$(date)] Skipping pull (next check in ~${REMAIN} min)"
fi
