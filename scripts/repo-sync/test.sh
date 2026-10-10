#!/usr/bin/env bash
# Scenario test for sync.ps1: local bare repos pose as GitHub through insteadOf,
# and every rule (fast-forward, blocked, diverged, hooks off, worktrees, grace,
# one batched notification, offline) is checked against real git.
# Needs bash, git and PowerShell 7 (pwsh; PWSH=/path/to/pwsh to override).
# Run it on Linux (a cloud session, WSL): on Windows sync.ps1 would
# raise real notifications.
set -u
PW=${PWSH:-pwsh}
SYNC="$(cd "$(dirname "$0")" && pwd)/sync.ps1"
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T"/{remote/nuroctane,remote/other,lab,cloud,data}
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
export GIT_CONFIG_GLOBAL=$T/gitconfig
git config --file "$T/gitconfig" init.defaultBranch main
git config --file "$T/gitconfig" url."$T/remote/".insteadOf https://github.com/
git config --file "$T/gitconfig" advice.detachedHead false
FAIL=0
ok()   { echo "  PASS $*"; }
bad()  { echo "  FAIL $*"; FAIL=1; }
check(){ if eval "$1"; then ok "$2"; else bad "$2"; fi; }

mkrepo() { # owner name
  git init -q --bare "$T/remote/$1/$2.git"
  git clone -q "https://github.com/$1/$2" "$T/cloud/$2" 2>/dev/null
  ( cd "$T/cloud/$2" && echo base > file.txt && echo readme > README && git add . && git commit -qm base && git push -q origin main )
  git clone -q "https://github.com/$1/$2" "$T/lab/$2"
}
cloud() { # name file content [branch]
  ( cd "$T/cloud/$1" && git checkout -q "${4:-main}" 2>/dev/null || git checkout -q -b "${4:-main}"; echo "$3" > "$2" && git add . && git commit -qm "cloud $2" && git push -q origin "${4:-main}" )
}
sha() { git -C "$1" rev-parse "$2"; }
run() { "$PW" -NoProfile -File "$SYNC" -ConfigPath "$T/data/config.json" -DataDir "$T/data" > "$T/out.txt" 2>&1; echo $? > "$T/code.txt"; }
status() { "$PW" -NoProfile -c "(Get-Content '$T/data/status.json' -Raw | ConvertFrom-Json).repos | ? repo -eq '$1' | % { \$_.$2 }"; }

cat > "$T/data/config.json" <<J
{ "roots": ["$T/lab"], "owners": ["nuroctane"], "notify": true }
J

for r in a b c d e f g; do mkrepo nuroctane $r; done
mkrepo other z

# a: clean and behind; hook must not run; side branch behind; cloud branch appears
( cd "$T/cloud/a" && git checkout -q -b feature && git push -q -u origin feature && git checkout -q main )
git -C "$T/lab/a" fetch -q && git -C "$T/lab/a" branch -q --track feature origin/feature
printf '#!/bin/sh\ntouch "%s/HOOK_RAN"\n' "$T" > "$T/lab/a/.git/hooks/post-merge"; chmod +x "$T/lab/a/.git/hooks/post-merge"
cloud a file.txt a2; cloud a f.txt feat feature; cloud a c.txt claude-work claude/nifty
# linked worktree on branch wt, behind; and a sibling worktree dir that discovery must skip
( cd "$T/cloud/a" && git checkout -q -b wt main && git push -q -u origin wt && git checkout -q main )
git -C "$T/lab/a" fetch -q && git -C "$T/lab/a" worktree add -q --track -b wt "$T/lab/a-wt" origin/wt
cloud a w.txt wt-new wt
# b: dirty in a file the incoming commit doesn't touch
echo local-edit > "$T/lab/b/README"; cloud b other.txt b2
# c: dirty in the file the incoming commit changes
echo local-edit > "$T/lab/c/file.txt"; cloud c file.txt c2
# d: diverged
( cd "$T/lab/d" && echo mine > mine.txt && git add . && git commit -qm mine ); cloud d file.txt d2
# e: no upstream configured
git -C "$T/lab/e" branch -q --unset-upstream; cloud e file.txt e2
# f: merge in progress
( cd "$T/lab/f" && git checkout -q -b side && echo x > side.txt && git add . && git commit -qm side && git checkout -q main && git merge -q --no-ff --no-commit side >/dev/null 2>&1 ); cloud f other.txt f2
# g: fresh index.lock (busy) and a fetch-only repo with a missing remote
touch "$T/lab/g/.git/index.lock"; cloud g file.txt g2
git clone -q "https://github.com/nuroctane/a" "$T/lab/h" && git -C "$T/lab/h" remote set-url origin https://github.com/nuroctane/missing
# z: someone else's repo, must be ignored
cloud z file.txt z2

A_FEAT_BEFORE=$(sha "$T/lab/a" feature)
C_HEAD=$(sha "$T/lab/c" HEAD); D_HEAD=$(sha "$T/lab/d" HEAD); F_HEAD=$(sha "$T/lab/f" HEAD); G_HEAD=$(sha "$T/lab/g" HEAD); Z_HEAD=$(sha "$T/lab/z" HEAD)
WT_BEFORE=$(sha "$T/lab/a" wt)

echo "== run 1"; run; cat "$T/out.txt"
check '[ "$(cat $T/code.txt)" = 1 ]' "exit code 1 when something needs attention"
check '[ "$(sha $T/lab/a HEAD)" = "$(sha $T/cloud/a main)" ]' "a: checked-out main fast-forwarded"
check '[ "$(cat $T/lab/a/file.txt)" = a2 ]' "a: working tree updated"
check '[ ! -e $T/HOOK_RAN ]' "a: post-merge hook did not run"
check '[ "$(sha $T/lab/a feature)" = "$(sha $T/cloud/a feature)" ]' "a: side branch fast-forwarded"
check 'git -C $T/lab/a reflog feature | head -1 | grep -q repo-sync' "a: side branch reflog names repo-sync"
check 'git -C $T/lab/a rev-parse -q --verify origin/claude/nifty >/dev/null' "a: cloud branch fetched as origin/claude/nifty"
check '[ "$(sha $T/lab/a wt)" = "$WT_BEFORE" ]' "a: branch checked out in linked worktree left alone"
check '[ -z "$(status a-wt repo)" ]' "a-wt: linked worktree not discovered as a repo"
check '[ "$(sha $T/lab/b HEAD)" = "$(sha $T/cloud/b main)" ] && [ "$(cat $T/lab/b/README)" = local-edit ]' "b: fast-forwarded and kept the unrelated local edit"
check '[ "$(sha $T/lab/c HEAD)" = "$C_HEAD" ] && [ "$(cat $T/lab/c/file.txt)" = local-edit ]' "c: blocked, nothing moved, local edit intact"
check 'status c state | grep -q "uncommitted changes are in the way (file.txt)"' "c: status names the blocking file"
check '[ "$(sha $T/lab/d HEAD)" = "$D_HEAD" ] && [ "$(status d state)" = diverged ]' "d: diverged left alone"
check '[ "$(sha $T/lab/e HEAD)" = "$(sha $T/cloud/e main)" ]' "e: no-upstream main followed origin/main"
check '[ "$(sha $T/lab/f HEAD)" = "$F_HEAD" ] && [ -e $T/lab/f/.git/MERGE_HEAD ] && status f state | grep -q "in progress"' "f: skipped during merge, merge state intact"
check '[ "$(sha $T/lab/g HEAD)" = "$G_HEAD" ] && status g state | grep -q busy' "g: fresh index.lock skipped as busy"
check 'status h fetch | grep -q failed' "h: fetch failure recorded"
check '[ -z "$(status z repo)" ] && [ "$(sha $T/lab/z HEAD)" = "$Z_HEAD" ]' "z: other owner ignored"
check '! grep -q "notify:" $T/out.txt' "no notification before the grace period"

echo "== run 2 (problems aged past grace)"
"$PW" -NoProfile -c "\$s = Get-Content '$T/data/state.json' -Raw | ConvertFrom-Json; foreach (\$p in \$s.problems.PSObject.Properties) { \$p.Value.firstSeen -= 3600 }; \$s | ConvertTo-Json -Depth 5 | Set-Content '$T/data/state.json'"
touch -d '2 hours ago' "$T/lab/g/.git/index.lock"
run; cat "$T/out.txt"
check 'grep -q "notify: Repo sync needs you" $T/out.txt' "one notification once problems outlast the grace"
check '[ "$(grep -c "notify:" $T/out.txt)" = 1 ]' "problems batched into a single notification"
check 'grep -q "c: main is 1 commit behind origin/main, but uncommitted changes" $T/out.txt' "notification covers the blocked repo"
check 'grep -q "f: main is 1 commit behind origin/main, skipped while a merge" $T/out.txt' "notification covers the in-progress merge"
check 'grep -q "d: main has local commits and origin/main has 1 commit it doesn" $T/out.txt' "notification covers the diverged repo"
check 'grep -q "h: can.t fetch from GitHub (.*does not appear to be a git repository)" $T/out.txt' "notification covers the failing fetch"

echo "== run 3 (no repeat)"
"$PW" -NoProfile -c "\$s = Get-Content '$T/data/state.json' -Raw | ConvertFrom-Json; foreach (\$p in \$s.problems.PSObject.Properties) { \$p.Value.firstSeen -= 3600 }; \$s | ConvertTo-Json -Depth 5 | Set-Content '$T/data/state.json'"
run
check '[ "$(grep -c "notify:" $T/out.txt)" = 1 ] && grep -q "notify: Repo sync needs you | g: .git.index.lock is" $T/out.txt' "stale lock raised alone, 30 min after it was first seen"
"$PW" -NoProfile -c "\$s = Get-Content '$T/data/state.json' -Raw | ConvertFrom-Json; foreach (\$p in \$s.problems.PSObject.Properties) { \$p.Value.firstSeen -= 3600 }; \$s | ConvertTo-Json -Depth 5 | Set-Content '$T/data/state.json'"
run
check '! grep -q "notify:" $T/out.txt' "already-notified problems stay quiet"

echo "== run 4 (resolve c, prune deleted cloud branch, crash recovery)"
git -C "$T/lab/c" checkout -q -- file.txt
( cd "$T/cloud/a" && git push -q origin --delete claude/nifty )
run
check '[ "$(sha $T/lab/c HEAD)" = "$(sha $T/cloud/c main)" ]' "c: fast-forwarded once the local edit was gone"
check '! git -C $T/lab/a rev-parse -q --verify origin/claude/nifty >/dev/null' "a: deleted cloud branch pruned"
check '! grep -q "|blocked|" $T/data/state.json' "c: resolved problem dropped from state"
echo '{' > "$T/data/config.json.bad"; cp "$T/data/config.json" "$T/data/config.good"; cp "$T/data/config.json.bad" "$T/data/config.json"
run
check '[ "$(cat $T/code.txt)" = 2 ] && grep -q "notify: Repo sync needs you | Repo sync stopped working" $T/out.txt' "broken config notifies at once (exit 2)"
cp "$T/data/config.good" "$T/data/config.json"; run
check '! grep -q "\"crash\"" $T/data/state.json' "crash entry cleared by the next good run"

echo "== offline"
git -C "$T/lab/e" config url.https://nonexistent.invalid/nuroctane/e.insteadOf https://github.com/nuroctane/e
env -u HTTPS_PROXY -u https_proxy -u HTTP_PROXY -u http_proxy bash -c "$(declare -f run); PW='$PW' SYNC='$SYNC' T='$T' run"
"$PW" -NoProfile -c "\$s = Get-Content '$T/data/state.json' -Raw | ConvertFrom-Json; foreach (\$p in \$s.problems.PSObject.Properties) { \$p.Value.firstSeen -= 3600 }; \$s | ConvertTo-Json -Depth 5 | Set-Content '$T/data/state.json'"
env -u HTTPS_PROXY -u https_proxy -u HTTP_PROXY -u http_proxy bash -c "$(declare -f run); PW='$PW' SYNC='$SYNC' T='$T' run"
check 'status e fetch | grep -qi "resolve host"' "e: offline fetch recorded"
check '! grep -q "e|fetch" $T/data/state.json && ! grep -q "notify:.* e:" $T/out.txt' "e: offline is never a problem, even past the grace"

echo "== self-update"
TOOL=$(dirname "$SYNC")
SD=$T/self; mkdir -p "$SD"
( cd "$T/cloud/a" && git checkout -q main && git pull -q && mkdir -p scripts/repo-sync && cp "$TOOL"/{sync.ps1,launch.js,install.ps1} scripts/repo-sync/ && git add . && git commit -qm tool && git push -q origin main )
cp "$TOOL"/{sync.ps1,launch.js,install.ps1} "$SD/"
cat > "$SD/config.json" <<J
{ "roots": [], "repos": ["$T/lab/a"], "owners": ["nuroctane"],
  "selfUpdate": { "repo": "$T/lab/a", "ref": "refs/remotes/origin/main", "path": "scripts/repo-sync" } }
J
runself() { "$PW" -NoProfile -File "$SD/sync.ps1" -ConfigPath "$SD/config.json" -DataDir "$SD" > "$T/out.txt" 2>&1; echo $? > "$T/code.txt"; }
pushtool() { ( cd "$T/cloud/a" && git add . && git commit -qm "$1" && git push -q origin main ); }
runself
check '! grep -q "self-update" $T/out.txt' "same version on main: nothing to do"

echo '# v2' >> "$T/cloud/a/scripts/repo-sync/sync.ps1"; pushtool v2
runself
check 'grep -q "self-update: installed sync.ps1" $T/out.txt && tail -1 "$SD/sync.ps1" | grep -q "# v2" && [ -e "$SD/sync.ps1.prev" ]' "new sync.ps1 on main installed for the next run"
runself
check 'grep -q "ran cleanly" $T/out.txt && grep -q "\"pending\": null" "$SD/self-update.json"' "next run confirms it"

printf 'function Update-Self {\n  "unterminated\n' > "$T/cloud/a/scripts/repo-sync/sync.ps1"; pushtool broken
runself
check 'tail -1 "$SD/sync.ps1" | grep -q "# v2" && grep -q "notify: Repo sync needs you | RepoSync didn.t take the sync.ps1 on main .*doesn.t parse" $T/out.txt' "unparseable version refused and notified at once"
runself
check '! grep -q "notify:" $T/out.txt && tail -1 "$SD/sync.ps1" | grep -q "# v2"' "refused version not retried or re-notified"

echo 'Write-Host hi' > "$T/cloud/a/scripts/repo-sync/sync.ps1"; pushtool gutted
runself
check 'tail -1 "$SD/sync.ps1" | grep -q "# v2" && grep -q "no longer contains Update-Self" $T/out.txt' "version that could never update again refused"

sed 's/^  New-Item -ItemType Directory -Force -Path \$DataDir, \$NoHooksDir | Out-Null$/&\n  throw "boom"/' "$TOOL/sync.ps1" > "$T/cloud/a/scripts/repo-sync/sync.ps1"
grep -q 'throw "boom"' "$T/cloud/a/scripts/repo-sync/sync.ps1" || bad "test setup: boom not inserted"
pushtool boom
runself
check 'grep -q "self-update: installed" $T/out.txt' "crashing version installed (it parses)"
runself
check '[ "$(cat $T/code.txt)" = 2 ] && grep -q "rolled back" $T/out.txt && grep -q "notify: Repo sync needs you | RepoSync.s update .* failed on its first run and was rolled back: boom" $T/out.txt && tail -1 "$SD/sync.ps1" | grep -q "# v2"' "crash on its first run rolls back and notifies at once"
runself
check '[ "$(cat $T/code.txt)" != 2 ] && ! grep -q "notify:" $T/out.txt && ! grep -q "installed sync.ps1" $T/out.txt' "rolled-back version not retried or re-notified"

cp "$TOOL/sync.ps1" "$T/cloud/a/scripts/repo-sync/sync.ps1"; echo '# new trigger' >> "$T/cloud/a/scripts/repo-sync/install.ps1"; pushtool installer
runself
check 'grep -q "self-update: installed" $T/out.txt && ! grep -q "# v2" "$SD/sync.ps1" && grep -q "task setup changed on main" "$SD/status.json"' "next good version installed; installer change asks for install.ps1"

git -C "$T/lab/a" config core.autocrlf true
sed 's/$/\r/' "$SD/sync.ps1" > "$SD/crlf" && mv "$SD/crlf" "$SD/sync.ps1"
runself
check 'grep -q "ran cleanly" $T/out.txt && ! grep -q "installed sync.ps1" $T/out.txt' "a CRLF copy of the same version counts as current"

sed 's/^  \$script:FetchFailing = \$state.fetchFailing/&\n  throw "always"/' "$SD/sync.ps1" > "$SD/x" && mv "$SD/x" "$SD/sync.ps1"
grep -q 'throw "always"' "$SD/sync.ps1" || bad "test setup: always not inserted"
echo '# fix' >> "$T/cloud/a/scripts/repo-sync/sync.ps1"; pushtool fix
runself
check '[ "$(cat $T/code.txt)" = 2 ] && grep -q "self-update: installed" $T/out.txt && tail -1 "$SD/sync.ps1" | grep -q "# fix"' "a copy that fails every run still picks up the fix from main"
runself
check '[ "$(cat $T/code.txt)" != 2 ] && grep -q "ran cleanly" $T/out.txt' "the fix runs"

if [ $FAIL = 0 ]; then echo "ALL PASS"; else echo "SOME FAILED"; exit 1; fi
