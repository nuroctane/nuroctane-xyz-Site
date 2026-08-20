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
RAINDROP_FILE_RE = re.compile(
    r"api\.raindrop\.io/(?:v2|rest/v1)/raindrop/(\d+)/file",
    re.I,
)
AUTHOR_PREFIX_RE = re.compile(
    r"^(?:(?:author|credit|source|attr(?:ibution)?)\s*[:\-—–]\s*|by\s+)",
    re.I,
)
LEADING_DASH_RE = re.compile(r"^[\-—–]+\s*")
SOCIAL_HANDLE_RE = re.compile(r"^@?[\w.]{1,30}$")
OCR_INDEX_RE = re.compile(r"^\d{1,6}$")
OCR_ATTR_RE = re.compile(r"^(?:—|--|–|-)\s+(.+)$")
OCR_TIMESTAMP_RE = re.compile(
    r"^\d{1,2}:\d{2}(?:\s*[AP]M)\b.*$",
    re.I,
)
OCR_HANDLE_LINE_RE = re.compile(r"^@[\w.]{1,30}$")
OCR_ENGAGEMENT_RE = re.compile(
    r"^(?:[\d,.]+[KMB]?\s+)?(?:likes?|reposts?|retweets?|quotes?|views?|replies|bookmarks?)\s*$",
    re.I,
)
OCR_UI_CHROME_RE = re.compile(
    r"^(?:show more|show this thread|translate(?:\s+to\s+\w+)?|read more|view (?:post|tweet|image))$",
    re.I,
)
OCR_SENTENCE_END_RE = re.compile(r"""[.!?…]["'”’)]*$""")
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
    if RAINDROP_FILE_RE.search(raw) or "up.raindrop.io/raindrop/files/" in lower:
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


def _raindrop_hosted_file_url(item: dict[str, Any]) -> Optional[str]:
    """Raindrop file uploads are not public CDNs.

    The item ``link`` is often ``api.raindrop.io/v2/.../file`` (an HTML
    interstitial). The bytes live at the authenticated REST file endpoint.
    """
    rid = item.get("_id") or item.get("id")
    file_meta = item.get("file") if isinstance(item.get("file"), dict) else {}
    file_is_image = str(file_meta.get("type") or "").lower().startswith("image/")
    type_is_image = str(item.get("type") or "").lower() == "image"
    link = str(item.get("link") or item.get("url") or "")
    match = RAINDROP_FILE_RE.search(link)
    if rid not in (None, "") and (type_is_image or file_is_image or match):
        return f"https://api.raindrop.io/rest/v1/raindrop/{rid}/file"
    if match:
        return f"https://api.raindrop.io/rest/v1/raindrop/{match.group(1)}/file"
    return None


def image_url_from_item(item: dict[str, Any]) -> Optional[str]:
    link = str(item.get("link") or item.get("url") or "").strip()
    if looks_like_image_url(link) and "api.raindrop.io" not in link.lower():
        return link
    hosted = _raindrop_hosted_file_url(item)
    if hosted:
        return hosted
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


def _raindrop_token() -> Optional[str]:
    for key in ("RAINDROP_TOKEN", "RAINDROP_API_TOKEN", "RAINDROP_ACCESS_TOKEN"):
        val = (os.environ.get(key) or "").strip()
        if val:
            return val
    env_paths = (
        Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / ".env",
        Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / "scripts" / ".env",
        Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / "scripts" / "raindrop.token",
    )
    for path in env_paths:
        if not path.is_file():
            continue
        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if path.name == "raindrop.token":
            tok = raw.strip()
            if tok:
                return tok
            continue
        for line in raw.splitlines():
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            key, value = s.split("=", 1)
            if key.strip() in ("RAINDROP_TOKEN", "RAINDROP_API_TOKEN", "RAINDROP_ACCESS_TOKEN"):
                value = value.strip().strip('"').strip("'")
                if value:
                    return value
    return None


def download_image(url: str, opener: Callable[..., Any] | None = None) -> bytes:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    }
    if "api.raindrop.io" in (url or "").lower():
        token = _raindrop_token()
        if not token:
            raise RuntimeError("Raindrop file URL needs RAINDROP_TOKEN")
        headers["Authorization"] = f"Bearer {token}"
        headers["User-Agent"] = "quotes-ingest/1.3"
    req = urllib.request.Request(
        url,
        headers=headers,
    )
    open_fn = opener or urllib.request.urlopen
    with open_fn(req, timeout=30) as resp:
        data = resp.read()
    if not data:
        raise RuntimeError(f"empty image body from {url}")
    if data.lstrip().startswith(b"<!DOCTYPE") or data.lstrip()[:1] == b"<":
        raise RuntimeError(f"image URL returned HTML, not bytes: {url}")
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


def _name_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (value or "").lower())


def _names_match(left: str, right: str) -> bool:
    a = _name_key(left.lstrip("@"))
    b = _name_key(right.lstrip("@"))
    if not a or not b:
        return False
    if a == b:
        return True
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    return len(shorter) >= 8 and shorter in longer


def _is_chrome_line(line: str) -> bool:
    text = line.strip()
    if not text:
        return False
    if OCR_TIMESTAMP_RE.match(text):
        return True
    if OCR_HANDLE_LINE_RE.match(text):
        return True
    if OCR_ENGAGEMENT_RE.match(text):
        return True
    if OCR_UI_CHROME_RE.match(text):
        return True
    return False


def _is_leading_chrome(line: str, author: Optional[str]) -> bool:
    text = line.strip()
    if not text:
        return True
    if OCR_INDEX_RE.fullmatch(text):
        return True
    if len(text) == 1:
        return True
    if author and _names_match(text, author):
        return True
    return False


def peel_ocr_attribution(text: str) -> tuple[str, Optional[str]]:
    """Split a trailing em-dash credit out of OCR text so ingest can re-attach it once."""
    lines = [ln.rstrip() for ln in (text or "").replace("\r\n", "\n").split("\n")]
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return "", None
    match = OCR_ATTR_RE.match(lines[-1].strip())
    if not match:
        return "\n".join(lines).strip(), None
    attr = match.group(1).strip() or None
    lines.pop()
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines).strip(), attr


def _should_join_ocr_lines(prev: str, nxt: str) -> bool:
    prev_s = prev.rstrip()
    nxt_s = nxt.lstrip()
    if not prev_s or not nxt_s:
        return False
    if OCR_SENTENCE_END_RE.search(prev_s):
        return False
    first = nxt_s[:1]
    if first.islower() or first.isdigit():
        return True
    if prev_s.endswith((",", ";", ":", "—", "–")):
        return True
    return False


def _unwrap_ocr_lines(lines: list[str]) -> list[str]:
    out: list[str] = []
    for raw in lines:
        stripped = raw.strip()
        if not stripped:
            if out and out[-1] != "":
                out.append("")
            continue
        if out and out[-1] and _should_join_ocr_lines(out[-1], stripped):
            out[-1] = out[-1].rstrip() + " " + stripped
        else:
            out.append(stripped)
    while out and not out[0]:
        out.pop(0)
    while out and not out[-1]:
        out.pop()
    return out


def clean_ocr_quote(text: str, *, author: Optional[str] = None) -> str:
    """Strip screenshot chrome, duplicate credits, and hard-wrapped OCR lines."""
    body, _peeled = peel_ocr_attribution(text)
    lines = [ln.rstrip() for ln in (body or "").split("\n")]
    lines = [ln for ln in lines if not _is_chrome_line(ln)]
    while lines and _is_leading_chrome(lines[0], author):
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if lines and author and _names_match(lines[-1], author):
        lines.pop()
        while lines and not lines[-1].strip():
            lines.pop()
    lines = _unwrap_ocr_lines(lines)
    return "\n".join(lines).strip()


def quote_from_image_item(
    item: dict[str, Any],
    *,
    ocr_fn: Callable[[str], str] | None = None,
) -> tuple[str, Optional[str]]:
    """Return (ocr_text, author) for an image raindrop."""
    url = image_url_from_item(item)
    if not url:
        raise RuntimeError("image raindrop has no image URL")
    raw = (ocr_fn or ocr_image_url)(url)
    body, ocr_attr = peel_ocr_attribution(raw)
    author = author_from_raindrop_note(str(item.get("note") or ""))
    if not author and ocr_attr:
        author = author_from_raindrop_note(ocr_attr) or ocr_attr
    text = clean_ocr_quote(body, author=author)
    if not (text or "").strip():
        raise RuntimeError("image OCR returned empty text")
    return text, author
