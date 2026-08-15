#!/usr/bin/env python3
"""OCR one image path with Windows.Media.Ocr and print the text.

Intended to run under SnipOCR's venv (has winrt + Pillow). The quotes
ingester shells out here when Hermes Python has no winrt.
"""
from __future__ import annotations

import sys
from pathlib import Path

SNIPOCR_ROOT = Path(r"C:\Users\david\Laboratory\snipocr")
if str(SNIPOCR_ROOT) not in sys.path:
    sys.path.insert(0, str(SNIPOCR_ROOT))

from PIL import Image  # noqa: E402
from app.ocr.windows_ocr import WindowsOCREngine  # noqa: E402


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: _ocr_windows_helper.py <image-path>", file=sys.stderr)
        return 2
    path = Path(argv[1])
    if not path.is_file():
        print(f"image not found: {path}", file=sys.stderr)
        return 1
    engine = WindowsOCREngine()
    if not engine.ready():
        print(engine.init_error() or "Windows OCR not ready", file=sys.stderr)
        return 1
    result = engine.recognize(Image.open(path))
    sys.stdout.write((result.text or "").strip())
    if result.text:
        sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
