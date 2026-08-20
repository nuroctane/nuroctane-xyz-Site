#!/usr/bin/env python3
"""Unit tests for Raindrop image-quote OCR helpers (no network)."""
from __future__ import annotations

from quote_image_ocr import (
    author_from_raindrop_note,
    clean_ocr_quote,
    format_credit,
    image_url_from_item,
    is_image_raindrop,
    looks_like_image_url,
    peel_ocr_attribution,
    quote_from_image_item,
)


def main() -> int:
    fails = 0

    def check(cond: bool, msg: str) -> None:
        nonlocal fails
        if cond:
            print(f"  OK  {msg}")
        else:
            print(f"  FAIL {msg}")
            fails += 1

    check(looks_like_image_url("https://pbs.twimg.com/media/HPlwchDXsAAOOY6.jpg"), "twimg media is image")
    check(
        looks_like_image_url("https://pbs.twimg.com/media/HPi-rjVXUAAlYuN.jpg:large"),
        "twimg :large is image",
    )
    check(looks_like_image_url("https://i.imgur.com/abc.png"), "imgur png is image")
    check(not looks_like_image_url("https://x.com/foo/status/123"), "status url is not image")
    check(not looks_like_image_url("https://rdl.ink/render/https%3A%2F%2Fx.com%2Ffoo"), "raindrop render is not image")

    image_item = {
        "type": "image",
        "link": "https://pbs.twimg.com/media/HPlwchDXsAAOOY6.jpg",
        "title": "HPlwchDXsAAOOY6.jpg",
        "excerpt": "",
        "note": "Fyodor Dostoevsky",
    }
    check(is_image_raindrop(image_item), "type=image is an image raindrop")
    check(
        image_url_from_item(image_item) == "https://pbs.twimg.com/media/HPlwchDXsAAOOY6.jpg",
        "image url taken from link",
    )

    jpg_link = {
        "type": "link",
        "link": "https://cdn.example.com/quote.jpeg?name=1",
        "note": "Marcus Aurelius",
    }
    check(is_image_raindrop(jpg_link), "direct jpeg link is an image raindrop")

    tweet = {
        "type": "link",
        "link": "https://x.com/augustusdelano/status/2088032973983551938?s=12",
        "cover": "https://rdl.ink/render/https%3A%2F%2Fx.com%2Faugustusdelano",
        "note": "",
    }
    check(not is_image_raindrop(tweet), "plain X status is not an image raindrop")

    tweet_with_author_and_photo = {
        "type": "link",
        "link": "https://x.com/promptllm/status/2087628100284584383?s=12",
        "cover": "https://pbs.twimg.com/media/HPi-rjVXUAAlYuN.jpg:large",
        "note": "Unknown",
    }
    check(
        is_image_raindrop(tweet_with_author_and_photo),
        "X status with media image + author note is an image raindrop",
    )
    check(
        image_url_from_item(tweet_with_author_and_photo)
        == "https://pbs.twimg.com/media/HPi-rjVXUAAlYuN.jpg:large",
        "cover used when tweet link is not a file",
    )

    raindrop_file = {
        "_id": 1820755259,
        "type": "image",
        "title": "C3816F74-5B8D-43DF-B72B-A570D9ED4294.png",
        "link": "https://api.raindrop.io/v2/raindrop/1820755259/file?type=image/png",
        "cover": "https://rdl.ink/render/https%3A%2F%2Fup.raindrop.io%2Fraindrop%2Ffiles%2F182%2F075%2F525%2F9%2Fquote.png",
        "file": {"name": "C3816F74-5B8D-43DF-B72B-A570D9ED4294.png", "type": "image/png", "size": 45147},
        "note": "Luc de Clapiers, marquis de Vauvenargues",
        "media": [],
    }
    check(is_image_raindrop(raindrop_file), "raindrop file upload is an image raindrop")
    check(
        image_url_from_item(raindrop_file)
        == "https://api.raindrop.io/rest/v1/raindrop/1820755259/file",
        "raindrop file uses authenticated REST file URL, not the v2 HTML link",
    )
    check(
        author_from_raindrop_note(raindrop_file["note"])
        == "Luc de Clapiers, marquis de Vauvenargues",
        "literary raindrop note is the author",
    )

    check(
        clean_ocr_quote(
            "644\nWhen I see a man infatuated with logic, I wager\nat once that he is not logical."
        )
        == "When I see a man infatuated with logic, I wager at once that he is not logical.",
        "leading book index is stripped and wrap is joined",
    )

    pessoa_ocr = (
        '"Ah, who will save\n'
        "me from existing? It's\n"
        "neither death nor life\n"
        'that I want."\n'
        "— Fernando Pessoa"
    )
    check(
        clean_ocr_quote(pessoa_ocr, author="Fernando Pessoa")
        == '"Ah, who will save me from existing? It\'s neither death nor life that I want."',
        "Pessoa wrap joined and duplicate credit peeled",
    )
    body, attr = peel_ocr_attribution(pessoa_ocr)
    check(attr == "Fernando Pessoa", "Pessoa OCR attribution peeled")
    check("Fernando Pessoa" not in body, "peeled body has no credit line")

    newman_ocr = (
        "Captain Newman, M.D.\n"
        "I learned that it is the weak who are cruel, and that\n"
        "gentleness is to be expected only from the strong."
    )
    check(
        clean_ocr_quote(newman_ocr, author="Captain Newman, MD.")
        == "I learned that it is the weak who are cruel, and that gentleness is to be expected only from the strong.",
        "title matching the credit is stripped and wrap joined",
    )

    brute_ocr = (
        "e\n"
        "brute de force\n"
        "@brutedeforce\n"
        "Why are you as a grown man getting nice\n"
        "shit so you can have even less fun?\n"
        "Freak out if someone spills a drink in ur car,\n"
        "anxiety about ashing your nice clothes,\n"
        "scuffing ur watch, can't take ur nice SUV off\n"
        "road?\n"
        "Beyond soy\n"
        "11:39 AM • 8/27/22"
    )
    check(
        clean_ocr_quote(brute_ocr, author="@brutedeforce")
        == (
            "Why are you as a grown man getting nice shit so you can have even less fun?\n"
            "Freak out if someone spills a drink in ur car, anxiety about ashing your nice clothes, "
            "scuffing ur watch, can't take ur nice SUV off road?\n"
            "Beyond soy"
        ),
        "tweet screenshot chrome is stripped and wraps joined",
    )

    caps_poster = (
        "HAVE THE COURAGE TO BE\n"
        "EXACTLY WHO YOU ARE\n"
        "WITHOUT APOLOGY."
    )
    check(
        clean_ocr_quote(caps_poster) == caps_poster,
        "intentional all-caps line breaks are kept",
    )

    pessoa_item = {
        "type": "image",
        "link": "https://pbs.twimg.com/media/pessoa.jpg",
        "note": "Fernando Pessoa",
    }
    text, author = quote_from_image_item(
        pessoa_item, ocr_fn=lambda _url: pessoa_ocr
    )
    check(
        text == '"Ah, who will save me from existing? It\'s neither death nor life that I want."',
        "image item OCR is cleaned before ingest",
    )
    check(author == "Fernando Pessoa", "raindrop note remains the credit")
    check(
        format_credit(author=author) == "Fernando Pessoa",
        "cleaned Pessoa credit is attached once",
    )

    check(author_from_raindrop_note("Fyodor Dostoevsky") == "Fyodor Dostoevsky", "plain author")
    check(author_from_raindrop_note("  — Fyodor Dostoevsky  ") == "Fyodor Dostoevsky", "emdash author")
    check(author_from_raindrop_note("Author: Fyodor Dostoevsky") == "Fyodor Dostoevsky", "Author: prefix")
    check(author_from_raindrop_note("by G. K. Chesterton, Orthodoxy") == "G. K. Chesterton, Orthodoxy", "by prefix")
    check(author_from_raindrop_note("@lichthauch") == "@lichthauch", "keeps @handle")
    check(author_from_raindrop_note("") is None, "empty note")
    long_note = (
        "When I look back on my past and think how much time I wasted on nothing, "
        "how much time has been lost in futilities, errors, laziness"
    )
    check(author_from_raindrop_note(long_note) is None, "long note is not an author")

    check(format_credit(author="Fyodor Dostoevsky") == "Fyodor Dostoevsky", "literary credit has no @")
    check(format_credit(handle="augustusdelano") == "@augustusdelano", "social handle gets @")
    check(format_credit(author="@lichthauch") == "@lichthauch", "author handle keeps one @")
    check(
        format_credit(handle="augustusdelano", author="Fyodor Dostoevsky") == "Fyodor Dostoevsky",
        "explicit author wins over handle",
    )

    print(f"\n{fails} failure(s)" if fails else "\nAll image-ocr helper tests passed.")
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
