#!/usr/bin/env python3
"""Run the one authoritative local quotes pipeline.

The Windows task owns the schedule.  Each run is intentionally ordered:

1. Validate the twelve-category classifier (required tests, not --deep).
2. Read the user's Raindrop ``#quotes`` tag first (text + image OCR).
3. Fold in any new Obsidian ``#quotes`` notes as a secondary source.
4. Write the canonical Obsidian Quotes.md bank (Raindrop additions land here).
5. Copy that bank to the site's quotes.md, commit only that file, and push main.
6. Rewrite the vault bank so it matches the published copy.

The source-specific parser stays in Hermes because it owns the Raindrop token and
the durable de-duplication sidecar.  This small, versioned runner makes the
actual scheduled path explicit, observable, and safe to invoke repeatedly.
"""
from __future__ import annotations

import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


REPO_ROOT = Path(r"C:\Users\david\Laboratory\nuroctane.xyz")
HERMES_ROOT = Path(os.environ.get("LOCALAPPDATA", "")) / "hermes"
HERMES_SCRIPTS = HERMES_ROOT / "scripts"
HERMES_PYTHON = HERMES_ROOT / "hermes-agent" / "venv" / "Scripts" / "python.exe"
LOG_FILE = REPO_ROOT / ".nur" / "quotes-pipeline.log"
LOCK_FILE = REPO_ROOT / ".nur" / "quotes-pipeline.lock"
STALE_LOCK_SECONDS = 2 * 60 * 60
REL_QUOTES = "artifacts/digital-sea/src/content/quotes.md"


def log(message: str) -> None:
    line = f"[{datetime.now().isoformat(timespec='seconds')}] {message}"
    try:
        print(line, flush=True)
    except UnicodeEncodeError:
        print(line.encode("ascii", "replace").decode("ascii"), flush=True)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as stream:
        stream.write(line + "\n")


def command_flags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0)


def run(label: str, args: list[str]) -> int:
    log(f"{label}: start")
    child_env = os.environ.copy()
    # The vault path contains non-ASCII characters. Keep every child's output
    # UTF-8 even when an operator launches this script from an old CP1252 shell.
    child_env["PYTHONIOENCODING"] = "utf-8"
    child_env["PYTHONUNBUFFERED"] = "1"
    repo_scripts = str(REPO_ROOT / "scripts")
    existing_pythonpath = child_env.get("PYTHONPATH", "")
    child_env["PYTHONPATH"] = (
        repo_scripts
        if not existing_pythonpath
        else os.pathsep.join((repo_scripts, existing_pythonpath))
    )
    completed = subprocess.run(
        args,
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=command_flags(),
        env=child_env,
    )
    for stream_name, output in (("stdout", completed.stdout), ("stderr", completed.stderr)):
        if not output:
            continue
        for line in output.rstrip().splitlines():
            log(f"{label} {stream_name}: {line}")
    log(f"{label}: exit={completed.returncode}")
    return completed.returncode


def acquire_lock() -> bool:
    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(str(LOCK_FILE), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        try:
            age = time.time() - LOCK_FILE.stat().st_mtime
        except OSError:
            return False
        if age <= STALE_LOCK_SECONDS:
            log("another quotes pipeline run is active; leaving it alone")
            return False
        log(f"removing stale quotes pipeline lock ({int(age)} seconds old)")
        try:
            LOCK_FILE.unlink()
        except OSError as exc:
            log(f"could not remove stale lock: {exc}")
            return False
        return acquire_lock()
    else:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(f"pid={os.getpid()}\nstarted={datetime.now().isoformat()}\n")
        return True


def release_lock() -> None:
    try:
        LOCK_FILE.unlink()
    except FileNotFoundError:
        pass
    except OSError as exc:
        log(f"could not remove pipeline lock: {exc}")


def _blocks_quotes_publish(line: str) -> bool:
    path = line[3:].split(" -> ")[-1].strip().strip('"')
    if REL_QUOTES in path or path.endswith("quotes.md"):
        return False
    if path.replace("\\", "/").startswith("scripts/"):
        return False
    return True


def preflight_git() -> int:
    """Keep scheduled work from committing a user's unrelated tracked edits."""
    status = subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=no"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=command_flags(),
    )
    if status.returncode:
        log("git preflight failed: could not read repository status")
        return status.returncode
    unrelated = [line for line in status.stdout.splitlines() if _blocks_quotes_publish(line)]
    if unrelated:
        log("git preflight deferred: unrelated tracked work is present")
        for line in unrelated:
            log(f"git preflight: {line}")
        return 3

    branch = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=command_flags(),
    )
    if branch.returncode or branch.stdout.strip() != "main":
        log(f"git preflight deferred: expected main, found {branch.stdout.strip() or 'detached HEAD'}")
        return 4

    fetch = subprocess.run(
        ["git", "fetch", "origin", "main"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=command_flags(),
    )
    if fetch.returncode:
        log("git preflight deferred: fetch origin/main failed")
        return fetch.returncode
    pull = subprocess.run(
        ["git", "pull", "--ff-only", "origin", "main"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=command_flags(),
    )
    if pull.returncode:
        log("git preflight deferred: main could not fast-forward")
        return pull.returncode
    return 0


def main() -> int:
    if not acquire_lock():
        return 0
    try:
        if not HERMES_PYTHON.is_file():
            log(f"Hermes Python missing: {HERMES_PYTHON}")
            return 1
        ingest = HERMES_SCRIPTS / "ingest-quotes.py"
        sync = HERMES_SCRIPTS / "sync-quotes.py"
        ingest_adapter = REPO_ROOT / "scripts" / "run_hermes_quote_ingest.py"
        if not ingest.is_file() or not sync.is_file():
            log("Hermes quote scripts are missing; cannot run Raindrop pipeline")
            return 1
        if not ingest_adapter.is_file():
            log("Canonical Hermes quote adapter is missing; refusing legacy categorization")
            return 1

        category_tests = REPO_ROOT / "scripts" / "test_quote_categories.py"
        category_rc = run(
            "validate twelve-category classifier",
            [str(HERMES_PYTHON), "-u", str(category_tests)],
        )
        if category_rc:
            return category_rc

        # Raindrop first, then secondary Obsidian notes. Always write the vault
        # bank even if git later refuses to publish.
        ingest_rc = run(
            "raindrop-first ingest",
            [str(HERMES_PYTHON), "-u", str(ingest_adapter), "--pipeline"],
        )

        normalize = REPO_ROOT / "scripts" / "normalize-quotes-categories.py"
        normalize_rc = run(
            "canonicalize quote categories",
            [str(HERMES_PYTHON), "-u", str(normalize)],
        )
        if normalize_rc:
            return normalize_rc

        ready = preflight_git()
        if ready:
            log("vault ingest finished; site publish deferred until git is clean")
            return ingest_rc or ready

        # Publish the canonical bank to the site and main, then mirror that
        # exact reindexed copy back into Obsidian.
        sync_rc = run("obsidian-to-site sync", [str(HERMES_PYTHON), "-u", str(sync)])
        if sync_rc:
            return sync_rc
        return ingest_rc
    except OSError as exc:
        log(f"pipeline fatal: {exc}")
        return 1
    finally:
        release_lock()


if __name__ == "__main__":
    raise SystemExit(main())
