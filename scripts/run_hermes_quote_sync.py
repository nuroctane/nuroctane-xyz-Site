#!/usr/bin/env python3
"""Publish the canonical quotes bank: live first, git once a day.

The bank is built with the external Hermes sync's own helpers (index rebuild,
sanity check) plus the repo's editorial pass, exactly as before. Then:

1. Live: PUT it to https://www.nuroctane.xyz/api/quotes (worker/quotes.ts).
   The Quotes pages read that, so a new quote shows within about a minute of
   this run, with no build or deploy. Git state never blocks this step.
2. Git snapshot: shared/content/quotes.md is committed and pushed (which
   deploys) at most once a day, so history and the bundled fallback stay
   current without a deploy per quote.
3. Fallback: if the live publish cannot be made (no token, network, server
   error), the git publish runs at once, as every run did before.

Exit 3 means the git step was deferred (wrong branch, unpushed commits or a
moved main); the live bank is still published.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
import sys
import time
import types
import urllib.error
import urllib.request

from quote_editorial import apply_editorial

LIVE_URL = os.environ.get("NUROCTANE_QUOTES_API", "https://www.nuroctane.xyz/api/quotes")
TOKEN_FILE = Path(os.environ.get("LOCALAPPDATA", "")) / "nuroctane" / "quotes-publish-token"
SNAPSHOT_SECONDS = float(os.environ.get("QUOTES_SNAPSHOT_HOURS", "24")) * 3600
COMMIT_MESSAGE = "chore: sync quotes from Obsidian vault [auto]"
# Cloudflare challenges Python's default User-Agent, so every request names itself.
USER_AGENT = "nuroctane-quotes-pipeline"


def load_sync():
    source = Path(os.environ.get("LOCALAPPDATA", "")) / "hermes/scripts/sync-quotes.py"
    sys.path.insert(0, str(source.parent))
    module = types.ModuleType("hermes_sync_quotes_blackboard")
    module.__file__ = str(source)
    sys.modules[module.__name__] = module
    exec(compile(source.read_text(encoding="utf-8"), str(source), "exec"), module.__dict__)
    module.REPO_ROOT = Path(__file__).resolve().parents[1]
    module.REL_DEST = "shared/content/quotes.md"
    module.DEST = module.REPO_ROOT / module.REL_DEST
    rebuild = module.rebuild_index
    module.rebuild_index = lambda body: rebuild(apply_editorial(body))
    module.ensure_publishable_main = lambda: ensure_publishable_main(module)
    # The push-rejected retry runs `git pull --rebase`, which refuses to start
    # over uncommitted edits. Stash them around the rebase instead.
    os.environ["GIT_CONFIG_COUNT"] = "1"
    os.environ["GIT_CONFIG_KEY_0"] = "rebase.autoStash"
    os.environ["GIT_CONFIG_VALUE_0"] = "true"
    return module


def ensure_publishable_main(module) -> bool:
    """Publish over uncommitted edits, never over unpushed commits.

    The sync commits with `--only quotes.md`, so other dirty files stay local.
    Unpushed local commits would ride along with the quotes push and deploy.
    """
    git, log = module.git, module.log
    if not on_main(module):
        log("Not on main; leaving the git snapshot for the next run")
        return False
    if git("fetch", "origin", "main", check=False).returncode != 0:
        log("Could not fetch origin/main; leaving the git snapshot for the next run")
        return False
    ahead = git("rev-list", "--count", "origin/main..HEAD", check=False)
    if ahead.returncode != 0 or ahead.stdout.strip() != "0":
        log(f"main has {ahead.stdout.strip() or '?'} unpushed local commit(s); leaving the git snapshot for the next run")
        return False
    if git("pull", "--ff-only", "origin", "main", check=False).returncode != 0:
        log("Could not fast-forward main; leaving the git snapshot for the next run")
        return False
    return True


def on_main(module) -> bool:
    branch = module.git("branch", "--show-current", check=False)
    return branch.returncode == 0 and branch.stdout.strip() == "main"


def read_token() -> str:
    token = os.environ.get("NUROCTANE_QUOTES_TOKEN", "").strip()
    if not token and TOKEN_FILE.is_file():
        token = TOKEN_FILE.read_text(encoding="utf-8").strip()
    return token


def publish_live(bank: str, log) -> str:
    """'same', 'published', 'refused' (the server judged the bank unsafe; do not
    fall back to git), or 'failed' (could not reach or authorise; fall back)."""
    token = read_token()
    if not token:
        log(f"live publish skipped: no token (NUROCTANE_QUOTES_TOKEN or {TOKEN_FILE})")
        return "failed"
    body = bank.encode("utf-8")
    sha = hashlib.sha256(body).hexdigest()
    probe = urllib.request.Request(
        LIVE_URL, method="HEAD", headers={"If-None-Match": f'"{sha}"', "User-Agent": USER_AGENT}
    )
    try:
        with urllib.request.urlopen(probe, timeout=30) as response:
            if response.headers.get("ETag") == f'"{sha}"':
                return "same"
    except urllib.error.HTTPError as err:
        if err.code == 304:
            return "same"
        if err.code != 404:
            log(f"live probe answered {err.code}; publishing anyway")
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        log(f"live probe failed: {err}")
        return "failed"
    put = urllib.request.Request(
        LIVE_URL,
        data=body,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "text/markdown; charset=utf-8",
            "User-Agent": USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(put, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")[:300]
        log(f"live publish answered {err.code}: {detail}")
        return "refused" if err.code in (409, 413, 422) else "failed"
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        log(f"live publish failed: {err}")
        return "failed"
    log(f"live publish: {result.get('quotes')} quotes, sha {str(result.get('sha', ''))[:12]}, changed={result.get('changed')}")
    return "published" if result.get("changed") else "same"


def snapshot_due(module) -> tuple[bool, str]:
    shown = module.git("log", "-1", "--format=%ct", "--", module.REL_DEST, check=False)
    try:
        last = int(shown.stdout.strip())
    except ValueError:
        return True, "no earlier commit"
    age = time.time() - last
    if age >= SNAPSHOT_SECONDS:
        return True, f"last commit {age / 3600:.1f}h ago"
    return False, f"next in {(SNAPSHOT_SECONDS - age) / 3600:.1f}h"


def committed_bank(module) -> str | None:
    """quotes.md at HEAD. Read as UTF-8 here: Hermes' git() decodes with the
    Windows code page, which cannot read the bank."""
    shown = subprocess.run(
        ["git", "show", f"HEAD:{module.REL_DEST}"],
        cwd=str(module.REPO_ROOT),
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    return shown.stdout.replace("\r\n", "\n") if shown.returncode == 0 else None


def git_publish(module, bank: str, *, now: bool) -> int:
    """Commit and push quotes.md when it differs from HEAD; daily unless `now`."""
    git, log, rel = module.git, module.log, module.REL_DEST
    if not on_main(module):
        log("git snapshot deferred: not on main")
        return 3
    if committed_bank(module) == bank:
        return 0
    if not now:
        due, why = snapshot_due(module)
        if not due:
            log(f"git snapshot not due ({why}); the live bank is current")
            return 0
        log(f"git snapshot due ({why})")
    if not module.ensure_publishable_main():
        return 3
    module.DEST.write_text(bank, encoding="utf-8", newline="\n")
    git("add", rel)
    if git("diff", "--cached", "--quiet", "--", rel, check=False).returncode == 0:
        log("quotes.md matches HEAD after pulling; nothing to commit")
        return 0
    # Commit only the generated content path, never anything else staged.
    git("commit", "--only", "-m", COMMIT_MESSAGE, "--", rel)
    push = git("push", "origin", "main", check=False)
    if push.returncode != 0:
        err = (push.stderr or push.stdout or "").strip()
        if "non-fast-forward" not in err and "rejected" not in err.lower():
            log(f"Push failed: {err}")
            return push.returncode
        log("Push rejected (non-fast-forward); pull --rebase and retry")
        pull = git("pull", "--rebase", "origin", "main", check=False)
        if pull.returncode != 0:
            log(f"Rebase failed: {(pull.stderr or pull.stdout or '').strip()}")
            return pull.returncode
        push = git("push", "origin", "main", check=False)
        if push.returncode != 0:
            log(f"Push retry failed: {(push.stderr or push.stdout or '').strip()}")
            return push.returncode
    log("Quotes committed and pushed (deploys)")
    return 0


def main(argv: list[str]) -> int:
    module = load_sync()
    log = module.log
    if not module.SRC.is_file():
        log(f"Source not found: {module.SRC}")
        return 1
    raw = module.SRC.read_text(encoding="utf-8")
    bank = module.rebuild_index(module.strip_frontmatter(raw)).replace("\r\n", "\n")
    module.sanity_check(bank)

    # Keep the Obsidian bank identical to the published copy (index counts too).
    if bank != raw.replace("\r\n", "\n"):
        module.SRC.write_text(bank, encoding="utf-8", newline="\n")
        log(f"Wrote reindexed vault bank → {module.SRC}")
    # The working copy follows the published bank on main (dev and the next
    # snapshot read it); another branch's checkout is left alone.
    if on_main(module):
        current = module.DEST.read_text(encoding="utf-8") if module.DEST.is_file() else ""
        if current.replace("\r\n", "\n") != bank:
            module.DEST.write_text(bank, encoding="utf-8", newline="\n")

    live = publish_live(bank, log)
    if live == "refused":
        log("live bank refused by the server; not publishing through git either")
        return 2
    if live == "failed":
        log("live publish unavailable; falling back to an immediate git publish")
        return git_publish(module, bank, now=True)
    if live == "same":
        log("live bank already current")
    return git_publish(module, bank, now="--git-now" in argv)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
