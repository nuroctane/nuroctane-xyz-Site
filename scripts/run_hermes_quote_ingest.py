#!/usr/bin/env python3
"""Run Hermes quote ingestion with the repository's canonical classifier.

The adapter is intentionally versioned outside Hermes.  Even if a Hermes
upgrade restores its historical inline category tables, both scheduled entry
points load the ingester through this module and replace its classifier before
``main()`` runs.
"""
from __future__ import annotations

import os
from pathlib import Path
import sys
import types

from quote_categories import SECTIONS, categorize, validate_taxonomy


HERMES_INGEST = (
    Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / "scripts" / "ingest-quotes.py"
)


def load_ingester() -> types.ModuleType:
    if not HERMES_INGEST.is_file():
        raise FileNotFoundError(f"Hermes quote ingester not found: {HERMES_INGEST}")
    hermes_scripts = str(HERMES_INGEST.parent)
    if hermes_scripts not in sys.path:
        sys.path.insert(0, hermes_scripts)
    module = types.ModuleType("hermes_ingest_quotes_canonical")
    module.__file__ = str(HERMES_INGEST)
    sys.modules[module.__name__] = module
    code = HERMES_INGEST.read_text(encoding="utf-8")
    exec(compile(code, str(HERMES_INGEST), "exec"), module.__dict__)
    module.categorize = categorize
    module.SECTIONS = list(SECTIONS)
    return module


def main() -> int:
    validate_taxonomy()
    ingester = load_ingester()
    previous_argv = sys.argv
    try:
        sys.argv = [str(HERMES_INGEST), *previous_argv[1:]]
        result = ingester.main()
        return int(result or 0)
    finally:
        sys.argv = previous_argv


if __name__ == "__main__":
    raise SystemExit(main())
