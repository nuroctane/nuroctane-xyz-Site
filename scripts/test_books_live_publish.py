#!/usr/bin/env python3
"""publish_books_live.py parses lines exactly as worker/books.ts does (the same
fixtures as scripts/test_books_api.ts) and writes marks without other edits."""
from pathlib import Path

from publish_books_live import apply_marks, book_key

assert book_key("Adami, Christoph — The Evolution of Biological Information") == "The Evolution of Biological Information|Adami, Christoph"
assert book_key('Housel, Morgan — The Psychology of Money _(spine: "The Money")_') == "The Psychology of Money|Housel, Morgan"
assert book_key("NEA Banned Books List") == "NEA Banned Books List|"
assert book_key("Plate, Tom — Giants of Asia — Citizen Singapore") == "Giants of Asia — Citizen Singapore|Plate, Tom"

books = (Path(__file__).resolve().parents[1] / "shared/content/books.md").read_text(encoding="utf-8").replace("\r\n", "\n")
key = "The Denial of Death|Becker, Ernest"
marked = apply_marks(books, {key: True})
assert marked.count("- [x] Becker, Ernest — The Denial of Death") == 2, "every line of the book"
assert apply_marks(marked, {key: False}) == books, "unmarking restores the file byte for byte"
assert apply_marks(books, {"Nope|Nobody": True}) == books
assert apply_marks(books, {}) == books
print("BOOKS LIVE PUBLISH OK: keys match worker/books.ts; marks round-trip")
