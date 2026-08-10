#!/usr/bin/env python3
"""Regression tests for the canonical twelve-category quote classifier."""
from __future__ import annotations

import importlib.util
from pathlib import Path

from quote_categories import (
    LEGACY_TO_CANONICAL,
    SECTIONS,
    categorize,
    find_labeled_match,
    labeled_examples,
)


CASES = [
    (
        "Faith, God & Surrender",
        "The spiritual practice is prayer offered to God with faith and surrender.",
    ),
    (
        "Reality, Consciousness & Perception",
        "U realize it’s all a Schrodinger’s cat in the end.",
    ),
    (
        "Manifestation, Desire & Abundance",
        "Visualize what you desire as already yours and enter vibrational alignment.",
    ),
    (
        "Self, Identity & Awakening",
        "Have the courage to be exactly who you are without apology. Release all shame.",
    ),
    (
        "Mind, Belief & Inner Work",
        "Change the narrative by making the unconscious conscious and examining your beliefs.",
    ),
    (
        "Action, Discipline & Mastery",
        "High-achieving individuals have urgency: the small task is done and they commit in one motion.",
    ),
    (
        "Creativity, Purpose & Expression",
        "Make what only you can make; share your creative work and follow your calling.",
    ),
    (
        "Love, Relationships & Boundaries",
        "People will paint you with the colors they have, so keep good boundaries in relationships.",
    ),
    (
        "Shadow, Discernment & Protection",
        "Whether you're good or evil, guilt and shame can become a curse. Use discernment.",
    ),
    (
        "Body, Emotion & Nervous System",
        "When you're triggered, your nervous system reacts to old emotional data and your heart rate rises.",
    ),
    (
        "Work, Wealth & Value",
        "Eye-watering gains are drawn from the same distribution as wipeouts in the market.",
    ),
    (
        "Life, Joy & Meaning",
        "Enjoy your life, choose joy, and be grateful for this present moment.",
    ),
    (
        "Action, Discipline & Mastery",
        "even at 1 hp, you can do 200 damage",
    ),
    (
        "Shadow, Discernment & Protection",
        "No advice from the defeated person. Ever.",
    ),
]


def main() -> int:
    failures = 0
    if len(SECTIONS) != 12 or len(set(SECTIONS)) != 12 or "Unsorted Sparks" in SECTIONS:
        print(f"FAIL taxonomy must contain exactly 12 unique public categories: {SECTIONS}")
        failures += 1
    else:
        print("OK   taxonomy contains exactly 12 public categories")

    expected_aliases = {
        "Reality, Manifestation & Abundance": "Manifestation, Desire & Abundance",
        "Relationships, Boundaries & Love": "Love, Relationships & Boundaries",
        "Wealth, Work & Value": "Work, Wealth & Value",
    }
    if LEGACY_TO_CANONICAL != expected_aliases:
        print(f"FAIL legacy aliases drifted: {LEGACY_TO_CANONICAL}")
        failures += 1
    else:
        print("OK   legacy category aliases are canonical")

    for expected, quote in CASES:
        actual = categorize(quote)
        if actual != expected:
            print(f"FAIL expected {expected!r}, got {actual!r}: {quote}")
            failures += 1
        else:
            print(f"OK   {expected}: {quote[:54]}")

    fallback = categorize("Entropy over ennui…")
    if fallback != "Life, Joy & Meaning":
        print(f"FAIL weak aphorism fallback: {fallback}")
        failures += 1
    else:
        print("OK   weak aphorisms fall back to Life, not Unsorted")

    examples = labeled_examples()
    represented = {section for section, _ in examples}
    if len(examples) < 600 or represented != set(SECTIONS):
        print(f"FAIL curated exemplar bank: examples={len(examples)} sections={sorted(represented)}")
        failures += 1
    else:
        print(f"OK   curated bank supplies {len(examples)} labeled exemplars across all 12 categories")

    placement_mismatches = [
        (section, categorize(body))
        for section, body in examples
        if categorize(body) != section
    ]
    if placement_mismatches:
        print(f"FAIL curated placements are not stable: {placement_mismatches[:5]}")
        failures += 1
    else:
        print("OK   all curated quote placements are stable under re-ingestion")

    near_duplicate = (
        "one common trait I find in high achieving individuals is urgency. "
        "it looks almost like impatience until you understand it is closer to reverence, "
        "a deep refusal to waste the one thing they cannot buy more of. the alarm goes "
        "and they rise. the message is answered while it is still warm. the small task "
        "is done before it can find a shelf to hide on."
    )
    matched = find_labeled_match(near_duplicate)
    if matched != "Action, Discipline & Mastery":
        print(f"FAIL near-duplicate placement inheritance: {matched}")
        failures += 1
    else:
        print("OK   punctuation/wording variants inherit the curated category")

    normalizer_path = Path(__file__).with_name("normalize-quotes-categories.py")
    spec = importlib.util.spec_from_file_location("quote_category_normalizer", normalizer_path)
    assert spec and spec.loader
    normalizer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(normalizer)
    fixture = (
        "## Index\n"
        "- [[#Action, Discipline & Mastery|Action, Discipline & Mastery]] (1)\n"
        "- [[#Unsorted Sparks|Unsorted Sparks]] (1)\n"
        "- [[#Wealth, Work & Value|Wealth, Work & Value]] (1)\n\n"
        "## Action, Discipline & Mastery\n\n_desc_\n\n> Keep going.\n\n"
        "## Unsorted Sparks\n\n_Auto-created section._\n\n"
        "> even at 1 hp, you can do 200 damage\n\n"
        "## Wealth, Work & Value\n\n_desc_\n\n> Cash flow matters.\n"
    )
    normalized, changed = normalizer.normalize(fixture)
    normalization_ok = (
        changed
        and "Unsorted Sparks" not in normalized
        and "## Work, Wealth & Value" in normalized
        and normalized.count("even at 1 hp") == 1
    )
    if not normalization_ok:
        print("FAIL normalizer did not eliminate legacy/Unsorted categories")
        failures += 1
    else:
        print("OK   normalizer migrates legacy names and eliminates Unsorted")

    print(f"\n{failures} failure(s)" if failures else "\nAll category tests passed.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
