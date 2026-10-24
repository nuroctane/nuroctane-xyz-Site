#!/usr/bin/env python3
"""Publish shared/content/books.md live, and bring the site's read marks home.

Run by quotes-pipeline.py every 15 minutes, before the Obsidian books mirror.

1. Admin read toggles on /books land in the live bank at once and wait on the
   Worker as marks (worker/books.ts). Fetch them and write them into books.md,
   the one record of what has been read.
2. When that changed books.md and the file was otherwise clean, commit it
   (`--only`) and push main, so git, the next deploy and the Obsidian mirror
   all carry the marks. Local edits in progress are never committed here.
3. PUT the working copy to /api/books, so an edit that has not been deployed
   shows on /books within one run. The PUT also tells the Worker which marks
   books.md now carries, and those marks are dropped.

A deploy refreshes the live bank by itself (the Worker carries the books.md it
was built with), so this script is what covers undeployed edits and toggles.
It never publishes a books.md older than origin/main's.

Exit 0 on success or nothing to do, 2 when the server refused the list (too
small, not a list), 3 when publishing was deferred (not on main, behind
origin with local edits), 1 on other failures.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

from run_hermes_quote_sync import USER_AGENT, publish_live, read_token

REPO_ROOT = Path(__file__).resolve().parents[1]
REL_BOOKS = "shared/content/books.md"
BOOKS = REPO_ROOT / REL_BOOKS
BOOKS_URL = os.environ.get("NUROCTANE_BOOKS_API", "https://www.nuroctane.xyz/api/books")
COMMIT_MESSAGE = "chore: books read marks from the site [auto]"
# Parsed exactly as worker/books.ts and both Books pages parse a line.
BOOK_LINE = re.compile(r"^- \[([ x])\] (.+)$")
NOTE = re.compile(r"_\(.+?\)_")


def log(message: str) -> None:
    print(f"[{datetime.now().isoformat(timespec='seconds')}] {message}", flush=True)


def git(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=str(REPO_ROOT),
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )


def book_key(content: str) -> str:
    """`Title|Author`, the key the Books pages give a curated book."""
    text = content.strip()
    sep = text.find(" — ")
    author = text[:sep].strip() if sep > 0 else ""
    title = NOTE.sub("", text[sep + 3 :] if sep > 0 else text, count=1).strip()
    return f"{title}|{author}"


def apply_marks(text: str, marks: dict[str, bool]) -> str:
    lines = []
    for line in text.split("\n"):
        match = BOOK_LINE.match(line)
        want = marks.get(book_key(match.group(2))) if match else None
        if match and want is not None and (match.group(1) == "x") != want:
            line = f"- [{'x' if want else ' '}] {match.group(2)}"
        lines.append(line)
    return "\n".join(lines)


def fetch_marks(token: str) -> dict[str, bool] | None:
    request = urllib.request.Request(
        f"{BOOKS_URL}/marks",
        headers={"Authorization": f"Bearer {token}", "User-Agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            marks = json.loads(response.read().decode("utf-8") or "{}").get("marks", {})
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as err:
        log(f"books marks unavailable: {err}")
        return None
    return {key: value for key, value in marks.items() if isinstance(key, str) and isinstance(value, bool)}


def committed_books() -> str | None:
    shown = git("show", f"HEAD:{REL_BOOKS}")
    return shown.stdout.replace("\r\n", "\n") if shown.returncode == 0 else None


def working_books() -> str:
    return BOOKS.read_text(encoding="utf-8").replace("\r\n", "\n")


def count(rev_range: str) -> int | None:
    shown = git("rev-list", "--count", rev_range)
    return int(shown.stdout.strip()) if shown.returncode == 0 and shown.stdout.strip().isdigit() else None


def catch_up() -> bool:
    """Bring main level with origin before publishing, so an older books.md
    never replaces a newer deployed one. False means do not publish."""
    if git("fetch", "origin", "main").returncode != 0:
        log("books: could not fetch origin/main; not publishing")
        return False
    behind = count("HEAD..origin/main")
    if behind is None:
        log("books: could not compare main with origin; not publishing")
        return False
    if behind == 0:
        return True
    upstream_changed = git("diff", "--quiet", "HEAD", "origin/main", "--", REL_BOOKS).returncode != 0
    if git("pull", "--ff-only", "origin", "main").returncode == 0:
        return True
    if upstream_changed:
        log(f"books: main is {behind} commit(s) behind origin and cannot fast-forward; not publishing an older books.md")
        return False
    return True  # origin moved, but not books.md: the working copy is still current


def commit_marks() -> None:
    if count("origin/main..HEAD") != 0:
        log("books: main has unpushed commits; read marks left uncommitted in books.md")
        return
    git("add", REL_BOOKS)
    if git("commit", "--only", "-m", COMMIT_MESSAGE, "--", REL_BOOKS).returncode != 0:
        log("books: commit failed; read marks left uncommitted in books.md")
        return
    if git("push", "origin", "main").returncode != 0:
        os.environ.update({"GIT_CONFIG_COUNT": "1", "GIT_CONFIG_KEY_0": "rebase.autoStash", "GIT_CONFIG_VALUE_0": "true"})
        if git("pull", "--rebase", "origin", "main").returncode != 0 or git("push", "origin", "main").returncode != 0:
            log("books: push failed; the marks commit is local until the next push")
            return
    log("books: read marks committed and pushed (deploys)")


def main() -> int:
    branch = git("branch", "--show-current").stdout.strip()
    if branch != "main":
        log(f"books: on {branch or 'a detached HEAD'}, not main; not publishing")
        return 3
    if not catch_up():
        return 3
    token = read_token()
    if not token:
        log("books: no publish token; not publishing")
        return 1

    marks = fetch_marks(token) or {}
    before = working_books()
    after = apply_marks(before, marks)
    if after != before:
        clean = committed_books() == before
        BOOKS.write_text(after, encoding="utf-8", newline="\n")
        log(f"books: wrote {len(marks)} read mark(s) from the site into {REL_BOOKS}")
        if clean:
            commit_marks()
        else:
            log("books: books.md has local edits; read marks written but not committed")

    # With marks waiting, PUT even if the text matches, so the Worker drops them.
    result = publish_live(after, log, url=BOOKS_URL, noun="books", force=bool(marks))
    if result == "refused":
        return 2
    if result == "failed":
        return 1
    if result == "same":
        log("books: live list already current")
    return 0


if __name__ == "__main__":
    sys.exit(main())
