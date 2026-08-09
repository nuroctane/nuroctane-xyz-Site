#!/usr/bin/env python3
"""Merge legacy quote categories into the current canonical bank."""
from __future__ import annotations

import argparse
import re
from pathlib import Path


DEFAULT_SOURCE = Path(
    r"C:\Users\david\iCloudDrive\iCloud~md~obsidian\∞∞∞\Metaphysics\Quotes.md"
)

LEGACY_TO_CANONICAL = {
    "Reality, Manifestation & Abundance": "Manifestation, Desire & Abundance",
    "Relationships, Boundaries & Love": "Love, Relationships & Boundaries",
    "Wealth, Work & Value": "Work, Wealth & Value",
}

SECTION_RE = re.compile(
    r"(?ms)^## (?P<name>[^\r\n]+)\r?\n(?P<body>.*?)(?=^## |\Z)"
)


def strip_frontmatter(text: str) -> tuple[str, str]:
    match = re.match(r"(?s)^---\r?\n.*?^---\r?\n", text)
    if not match:
        return "", text
    return match.group(0), text[match.end() :]


def quote_blocks(body: str) -> list[str]:
    lines = body.splitlines()
    blocks: list[list[str]] = []
    current: list[str] = []
    for line in lines + [""]:
        if line.startswith(">"):
            current.append(line)
        elif current:
            blocks.append(current)
            current = []
    return ["\n".join(block).rstrip() for block in blocks if block]


def rebuild_index(body: str) -> str:
    sections: list[tuple[str, int]] = []
    for match in SECTION_RE.finditer(body):
        name = match.group("name").strip()
        if name == "Index":
            continue
        sections.append((name, len(quote_blocks(match.group("body")))))

    index = "## Index\n" + "".join(
        f"- [[#{name}|{name}]] ({count})\n" for name, count in sections
    )
    return re.sub(
        r"(?ms)^## Index\r?\n.*?(?=^## (?!Index\b))",
        index,
        body,
        count=1,
    )


def normalize(text: str) -> tuple[str, bool]:
    frontmatter, body = strip_frontmatter(text)
    sections = list(SECTION_RE.finditer(body))
    if not sections:
        raise ValueError("Quotes.md contains no ## sections")

    additions: dict[str, list[str]] = {}
    removals: set[str] = set()
    for match in sections:
        name = match.group("name").strip()
        destination = LEGACY_TO_CANONICAL.get(name)
        if destination:
            additions.setdefault(destination, []).extend(quote_blocks(match.group("body")))
            removals.add(name)

    if not removals:
        return text, False

    rebuilt: list[str] = []
    for match in sections:
        name = match.group("name").strip()
        if name == "Index" or name in removals:
            continue
        section = match.group(0).rstrip()
        if name in additions:
            section += "\n\n" + "\n\n".join(additions[name])
        rebuilt.append(section)

    normalized_body = "## Index\n\n" + "\n\n".join(rebuilt) + "\n"
    normalized_body = rebuild_index(normalized_body)
    normalized = frontmatter + normalized_body
    return normalized, normalized != text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if not args.source.is_file():
        raise SystemExit(f"Source not found: {args.source}")
    original = args.source.read_text(encoding="utf-8")
    normalized, changed = normalize(original)
    if changed and not args.check:
        args.source.write_text(normalized, encoding="utf-8", newline="\n")
    print(f"legacy categories: {'merged' if changed else 'none found'}")
    return 1 if changed and args.check else 0


if __name__ == "__main__":
    raise SystemExit(main())
