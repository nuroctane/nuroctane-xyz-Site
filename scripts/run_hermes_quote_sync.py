#!/usr/bin/env python3
"""Keep the external Hermes sync pointed at the live Blackboard content."""
import os
from pathlib import Path
import sys
import types

from quote_editorial import apply_editorial


def load_sync():
    source = Path(os.environ.get("LOCALAPPDATA", "")) / "hermes/scripts/sync-quotes.py"
    sys.path.insert(0, str(source.parent))
    module = types.ModuleType("hermes_sync_quotes_blackboard")
    module.__file__ = str(source)
    sys.modules[module.__name__] = module
    exec(compile(source.read_text(encoding="utf-8"), str(source), "exec"), module.__dict__)
    module.REPO_ROOT = Path(__file__).resolve().parents[1]
    module.REL_DEST = "artifacts/blackboard/src/content/quotes.md"
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
    branch = git("branch", "--show-current", check=False)
    if branch.returncode != 0 or branch.stdout.strip() != "main":
        log(f"Expected main; found {branch.stdout.strip() or 'detached HEAD'}. Leaving quotes for the next run")
        return False
    if git("fetch", "origin", "main", check=False).returncode != 0:
        log("Could not fetch origin/main; leaving quotes for the next run")
        return False
    ahead = git("rev-list", "--count", "origin/main..HEAD", check=False)
    if ahead.returncode != 0 or ahead.stdout.strip() != "0":
        log(f"main has {ahead.stdout.strip() or '?'} unpushed local commit(s); leaving quotes for the next run")
        return False
    if git("pull", "--ff-only", "origin", "main", check=False).returncode != 0:
        log("Could not fast-forward main; leaving quotes for the next run")
        return False
    return True


if __name__ == "__main__":
    raise SystemExit(load_sync().main())
