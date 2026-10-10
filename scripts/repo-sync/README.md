# RepoSync

Keeps the clones on this PC up to date with what was pushed to GitHub from
somewhere else: cloud Claude sessions, the Tunerz admin console, another
machine. It runs invisibly whenever you're signed in: at sign-in, on unlock,
on wake from sleep, and every 10 minutes.

Every git repo directly under `%USERPROFILE%\Laboratory` whose remote is
`github.com/nuroctane/*` is included. New clones there are picked up on their own.

## What it does, and what it never does

Each run, for each repo:

1. `git fetch --prune` from GitHub. Branches pushed from the cloud show up as
   `origin/claude/<name>` without touching anything you're working on.
2. Fast-forwards the checked-out branch to its upstream. If an uncommitted or
   untracked file is in the way, git refuses and nothing moves. Edits to other
   files are kept as they are.
3. Fast-forwards other local branches that are strictly behind their upstream,
   except branches checked out in another worktree.

It never merges, rebases, stashes, resets, deletes a branch or pushes, so it
can't lose work. Hooks are off while it runs, so a background pull never runs
a project's post-merge install or database push. When a lockfile or
`package.json` changes, the log says to run the install yourself.

A branch with no upstream set follows the branch of the same name on GitHub.
Linked worktrees (agent workspaces) and submodules are left alone.

## Getting cloud work onto the PC

Cloud sessions push to `claude/<name>` branches. The fetch brings those down
right away, and the folder you work in picks them up once they reach the
branch you have checked out:

- merge the pull request, and the next run fast-forwards local `main`;
- or `git switch claude/<name>` to work on it locally, and later pushes to
  that branch keep coming in.

## When it needs you

If something lasts 30 minutes, one Windows notification lists it, and it
isn't repeated until it clears and comes back:

- the checked-out branch is behind but your uncommitted changes are in the way;
- it diverged (local commits and new ones on GitHub): pull with rebase or merge;
- a merge, rebase or bisect is in progress;
- a `.git\index.lock` is over an hour old;
- fetching fails for a reason other than being offline, such as an expired
  sign-in or a deleted repo, or it hangs waiting on a prompt.

Being offline is never reported. If the script itself fails, it notifies you
right away.

## Updates to RepoSync itself

`sync.ps1` updates itself from this repo's `origin/main`: push a new version
to `main` from anywhere, and the next run on the PC installs it for the run
after that. It only takes a version that parses the way Windows PowerShell
reads it and still contains `Update-Self`. A version that fails on its first
run is rolled back at once, skipped from then on, and reported in a
notification. Even a copy that fails on every run still checks `main` for a
fix.

Keep `sync.ps1` plain ASCII: Windows PowerShell reads a script without a BOM
in the ANSI code page, where a UTF-8 dash can turn into a quote mark.

`launch.js` and the task's triggers only change when `install.ps1` runs. When
they change on `main`, a notification asks you to run it once.
`install.ps1 -NoSelfUpdate` turns self-update off; running it from a folder
that isn't a git clone leaves it off too.

## Install, update, remove

From this folder (no admin needed):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1
```

It copies `sync.ps1`, `launch.js` and `install.ps1` to `%LOCALAPPDATA%\RepoSync`,
so switching branches here never changes the running copy. Then it registers
the per-user task `RepoSync`, runs it once and prints a table of every repo
(or, if that run fails, the end of the log). Running it again is safe, and it
keeps your settings unless you pass new ones:

```powershell
install.ps1 -Root C:\Users\david\Laboratory, D:\Code   # folders whose subfolders are clones
install.ps1 -Owner nuroctane, someone-else             # GitHub owners to include
install.ps1 -IntervalMinutes 5
install.ps1 -NoNotify                                  # log only
install.ps1 -NoSelfUpdate                              # don't take new sync.ps1 versions from main
install.ps1 -Uninstall                                 # removes the task and %LOCALAPPDATA%\RepoSync
```

Repos outside those folders can be listed under `"repos"` in
`%LOCALAPPDATA%\RepoSync\config.json`.

## Checking on it

- `%LOCALAPPDATA%\RepoSync\sync.log`: every update and problem (1 MB, then rotated).
- `%LOCALAPPDATA%\RepoSync\status.json`: the last run, repo by repo.
- `Get-ScheduledTaskInfo RepoSync`: `LastTaskResult` 0 = all good,
  1 = something needs you, 2 = the script failed.
- `Start-ScheduledTask RepoSync` runs it now.

## Why it's built this way

- **No window, ever.** The task runs `wscript.exe //E:JScript launch.js`.
  wscript is a GUI program, so no console is created, and it starts PowerShell
  hidden. A task that runs `powershell.exe` directly flashes a console even
  with `-WindowStyle Hidden`. The launcher is JScript rather than VBScript
  because Windows is phasing VBScript out.
- **Interactive logon type**, so it runs as you, with your Git Credential
  Manager sign-in and SSH agent. S4U would need admin rights to register and
  can't read Credential Manager.
- **Nothing waits on a prompt.** `GIT_TERMINAL_PROMPT=0` and
  `GCM_INTERACTIVE=never` are set, stdin is closed, and every git call has a
  timeout, after which the whole process tree is killed.

## Tests

`./test.sh` runs every rule against real git, with local bare repos standing
in for GitHub, including self-update (refused, rolled-back and recovered
versions). It needs bash, git and PowerShell 7 (`PWSH=/path/to/pwsh`), and runs
on Linux (a cloud session or WSL): on Windows it would raise real
notifications. Run it before pushing a change to `sync.ps1`, because `main`
reaches the PC on its own.
