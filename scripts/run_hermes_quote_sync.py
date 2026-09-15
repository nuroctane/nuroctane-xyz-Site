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
    return module


if __name__ == "__main__":
    raise SystemExit(load_sync().main())
