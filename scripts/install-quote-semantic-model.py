#!/usr/bin/env python3
"""Install the pinned local ONNX model used by quote categorization."""
from __future__ import annotations

import argparse
from hashlib import sha256
import os
from pathlib import Path
import tempfile
from urllib.request import Request, urlopen

from quote_semantic import (
    MODEL_DIR,
    MODEL_PATH,
    MODEL_REVISION,
    MODEL_SHA256,
    TOKENIZER_PATH,
    TOKENIZER_SHA256,
    file_sha256,
    semantic_healthcheck,
    validate_model_files,
)


BASE_URL = (
    "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/"
    f"{MODEL_REVISION}"
)
ASSETS = (
    (MODEL_PATH, f"{BASE_URL}/onnx/model_quint8_avx2.onnx", MODEL_SHA256),
    (TOKENIZER_PATH, f"{BASE_URL}/tokenizer.json", TOKENIZER_SHA256),
)


def download(target: Path, url: str, expected: str) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    digest = sha256()
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", prefix=f"{target.name}-", suffix=".download", dir=target.parent, delete=False
        ) as output:
            temporary = Path(output.name)
            request = Request(url, headers={"User-Agent": "nuroctane-quotes/1.0"})
            with urlopen(request, timeout=120) as response:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
                    digest.update(chunk)
        actual = digest.hexdigest()
        if actual != expected:
            raise RuntimeError(f"download integrity failure for {target.name}: {actual} != {expected}")
        os.replace(temporary, target)
    finally:
        if temporary and temporary.exists():
            temporary.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    for target, url, expected in ASSETS:
        if not args.force and target.is_file() and file_sha256(target) == expected:
            print(f"OK   {target.name} already installed")
            continue
        print(f"GET  {url}")
        download(target, url, expected)
        print(f"OK   {target.name} installed")
    validate_model_files.cache_clear()
    validate_model_files()
    health = semantic_healthcheck()
    print(
        f"OK   semantic runtime: {health['model']} revision={health['revision']} "
        f"dimensions={health['dimensions']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
