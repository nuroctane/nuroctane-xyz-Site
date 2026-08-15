#!/usr/bin/env python3
"""Detect Raindrop image quotes, parse author notes, and OCR image bytes.

Used by the Hermes Raindrop ingester. Image recognition is local (Windows OCR
via SnipOCR's venv when the Hermes interpreter has no winrt).
"""
from __future__ import annotations

import io
import os
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from typing import Any, Callable, Optional
from urllib.parse import urlparse


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
    ".avif",
    ".heic",
}
IMAGE_HOST_MARKERS = (
    "pbs.twimg.com/media/",
    "pbs.twimg.com/ext_tw_video_thumb/",
    "i.imgur.com/",
    "media.discordapp.net/",
    "cdninstagram.com/",
    "images.unsplash.com/",
)
# Raindrop's website screenshot proxy is not a quote image.
RENDER_HOST_MARKERS = ("rdl.ink/render",)
AUTHOR_PREFIX_RE = re.compile(
    r"^(?:(?:author|credit|source|attr(?:ibution)?)\s*[:\-—–]\s*|by\s+)",
    re.I,
)
LEADING_DASH_RE = re.compile(r"^[\-—–]+\s*")
SOCIAL_HANDLE_RE = re.compile(r"^@?[\w.]{1,30}$")
DEFAULT_SNIPOCR_PYTHON = Path(r"C:\Users\david\Laboratory\snipocr\.venv\Scripts\python.exe")
HELPER_NAME = "_ocr_windows_helper.py"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)


def looks_like_image_url(url: str) -> bool:
    raw = (url or "").strip()
    if not raw:
        return False
    lower = raw.lower()
    if any(marker in lower for marker in RENDER_HOST_MARKERS):
        return False
    if any(marker in lower for marker in IMAGE_HOST_MARKERS):
        return True
    path = urlparse(raw).path
    stem_ext = Path(path).suffix.lower()
    if stem_ext in IMAGE_EXTENSIONS:
        return True
    # Twitter CDN sometimes appends :large / :orig after the extension
    if re.search(r"\.(?:jpe?g|png|gif|webp|bmp|tiff?)(?::[a-z0-9]+)?(?:\?|#|$)", lower):
        return True
    return False


def _note_looks_like_author(note: str) -> bool:
    return author_from_raindrop_note(note) is not None


def is_image_raindrop(item: dict[str, Any]) -> bool:
    """True when this Raindrop should be treated as an image quote.

    Direct image links / type=image always qualify. An X/status (or other page)
    qualifies only when it has a real image asset *and* the user put an author
    in the Raindrop note — that is the contract for image-quote tweets.
    """
    if str(item.get("type") or "").lower() == "image":
        return True
    link = str(item.get("link") or item.get("url") or "")
    if looks_like_image_url(link):
        return True
    image_asset = image_url_from_item(item)
    if not image_asset:
        return False
    return _note_looks_like_author(str(item.get("note") or ""))


def image_url_from_item(item: dict[str, Any]) -> Optional[str]:
    link = str(item.get("link") or item.get("url") or "").strip()
    if looks_like_image_url(link):
        return link
    media = item.get("media") or []
    if isinstance(media, list):
        for entry in media:
            if not isinstance(entry, dict):
                continue
            mlink = str(entry.get("link") or "").strip()
            if mlink and (
                str(entry.get("type") or "").lower() == "image" or looks_like_image_url(mlink)
            ):
                return mlink
    cover = str(item.get("cover") or "").strip()
    if looks_like_image_url(cover):
        return cover
    return None


def author_from_raindrop_note(note: str) -> Optional[str]:
    """Parse a Raindrop note as an author credit for image quotes.

    Accepts short credits like ``Fyodor Dostoevsky``, ``Author: …``,
    ``— G. K. Chesterton, Orthodoxy``, or ``@handle``. Rejects empty notes
    and long pasted quote bodies so those stay quote text, not attribution.
    """
    text = (note or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        return None
    first = next((ln.strip() for ln in text.split("\n") if ln.strip()), "")
    if not first:
        return None
    first = AUTHOR_PREFIX_RE.sub("", first).strip()
    first = LEADING_DASH_RE.sub("", first).strip()
    if not first:
        return None
    if len(first) > 120 or first.count(" ") > 12:
        return None
    return first


def format_credit(*, handle: Optional[str] = None, author: Optional[str] = None) -> Optional[str]:
    """Attribution to place after an em dash. Literary names stay un-@'d."""
    if author:
        cleaned = author_from_raindrop_note(author) or str(author).strip()
        if not cleaned:
            return None
        if cleaned.startswith("@"):
            return cleaned
        if SOCIAL_HANDLE_RE.fullmatch(cleaned) and " " not in cleaned:
            return f"@{cleaned.lstrip('@')}"
        return cleaned
    if handle:
        h = str(handle).strip()
        if not h:
            return None
        return h if h.startswith("@") else f"@{h.lstrip('@')}"
    return None


def download_image(url: str, opener: Callable[..., Any] | None = None) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )
    open_fn = opener or urllib.request.urlopen
    with open_fn(req, timeout=30) as resp:
        data = resp.read()
    if not data:
        raise RuntimeError(f"empty image body from {url}")
    return data


def _ocr_with_local_winrt(image_bytes: bytes) -> Optional[str]:
    try:
        from PIL import Image  # type: ignore
    except ImportError:
        return None
    try:
        from winrt.windows.globalization import Language  # type: ignore
        from winrt.windows.media.ocr import OcrEngine  # type: ignore
    except ImportError:
        return None
    try:
        from app.ocr.windows_ocr import WindowsOCREngine  # type: ignore
    except ImportError:
        snipocr = Path(r"C:\Users\david\Laboratory\snipocr")
        if snipocr.is_dir():
            import sys

            sys.path.insert(0, str(snipocr))
            try:
                from app.ocr.windows_ocr import WindowsOCREngine  # type: ignore
            except Exception:
                return None
        else:
            return None
    engine = WindowsOCREngine()
    if not engine.ready():
        return None
    image = Image.open(io.BytesIO(image_bytes))
    result = engine.recognize(image)
    return (result.text or "").strip()


def _snipocr_python() -> Optional[Path]:
    override = os.environ.get("QUOTES_OCR_PYTHON", "").strip()
    candidates = [
        Path(override) if override else None,
        DEFAULT_SNIPOCR_PYTHON,
    ]
    for path in candidates:
        if path and path.is_file():
            return path
    return None


def _ocr_with_helper(image_bytes: bytes) -> str:
    python = _snipocr_python()
    if python is None:
        raise RuntimeError("no Windows OCR helper python (set QUOTES_OCR_PYTHON)")
    helper = Path(__file__).with_name(HELPER_NAME)
    if not helper.is_file():
        raise RuntimeError(f"missing OCR helper: {helper}")
    suffix = ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name
    try:
        completed = subprocess.run(
            [str(python), "-u", str(helper), tmp_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=60,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
    if completed.returncode != 0:
        err = (completed.stderr or completed.stdout or "").strip()
        raise RuntimeError(f"OCR helper failed: {err or completed.returncode}")
    return (completed.stdout or "").strip()


def ocr_image_bytes(image_bytes: bytes) -> str:
    local = _ocr_with_local_winrt(image_bytes)
    if local:
        return local
    return _ocr_with_helper(image_bytes)


def ocr_image_url(url: str) -> str:
    return ocr_image_bytes(download_image(url))


def quote_from_image_item(
    item: dict[str, Any],
    *,
    ocr_fn: Callable[[str], str] | None = None,
) -> tuple[str, Optional[str]]:
    """Return (ocr_text, author) for an image raindrop."""
    url = image_url_from_item(item)
    if not url:
        raise RuntimeError("image raindrop has no image URL")
    text = (ocr_fn or ocr_image_url)(url)
    if not (text or "").strip():
        raise RuntimeError("image OCR returned empty text")
    author = author_from_raindrop_note(str(item.get("note") or ""))
    return text.strip(), author
