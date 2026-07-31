#!/bin/bash
# Unified poller: checks for remote changes to books.md, pulls if found
# Also runs quotes sync (Obsidian → repo)
# Tracks last run to enforce ~90 min interval between pulls
#
# Windows entrypoint: scripts/poll-sync.ps1 (Scheduled Task NuroctanePollSync)

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || REPO_ROOT="/c/Users/david/Laboratory/nuroctane.xyz"
STATE_FILE="$REPO_ROOT/.sync-state"
NOW=$(date +%s)
INTERVAL=5400  # 90 minutes in seconds

cd "$REPO_ROOT" || exit 1
mkdir -p "$REPO_ROOT/.nur"

# Read last run timestamp
LAST_RUN=0
[[ -f "$STATE_FILE" ]] && LAST_RUN=$(cat "$STATE_FILE" 2>/dev/null || echo 0)

# Check if enough time has passed (for git pull)
SHOULD_PULL=0
if (( NOW - LAST_RUN >= INTERVAL )); then
    SHOULD_PULL=1
fi

# Always run quotes sync (Obsidian → repo) - it's cheap and only commits on change.
# sync-quotes.sh enforces main, pushes, and deploys when content changes.
set +e
"$REPO_ROOT/scripts/sync-quotes.sh"
SYNC_RC=$?
set -e
if [[ $SYNC_RC -ne 0 ]]; then
    echo "[$(date)] quotes sync failed (exit $SYNC_RC)"
    # Still allow the books pull path below; do not abort the whole poller.
fi

# Conditional git pull for books (repo → local) when on a clean main.
if (( SHOULD_PULL )); then
    git fetch origin main >/dev/null 2>&1
    if git diff HEAD origin/main --name-only | grep -q 'artifacts/digital-sea/src/content/books.md'; then
        if git pull --ff-only origin main; then
            echo "[$(date)] Pulled books.md update"
        else
            echo "[$(date)] WARNING: could not ff-pull books.md update"
        fi
    else
        echo "[$(date)] No remote changes to books.md"
    fi
    # Update timestamp regardless (avoid hammering on every cron tick)
    echo "$NOW" > "$STATE_FILE"
else
    REMAIN=$(( (LAST_RUN + INTERVAL - NOW) / 60 ))
    echo "[$(date)] Skipping pull (next check in ~${REMAIN} min)"
fi
