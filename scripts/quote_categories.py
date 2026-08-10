#!/usr/bin/env python3
"""Canonical semantic taxonomy for automatic quote ingestion.

This module is the single source of truth shared by the repository-owned
pipeline and the installed Hermes ingester.  The public bank has exactly
twelve categories; weak, aphoristic matches fall back to Life rather than
creating a thirteenth ``Unsorted`` section that can leak into production.
"""
from __future__ import annotations

from collections.abc import Iterable
from difflib import SequenceMatcher
from functools import lru_cache
from pathlib import Path
import re


SECTIONS = [
    "Faith, God & Surrender",
    "Reality, Consciousness & Perception",
    "Manifestation, Desire & Abundance",
    "Self, Identity & Awakening",
    "Mind, Belief & Inner Work",
    "Action, Discipline & Mastery",
    "Creativity, Purpose & Expression",
    "Love, Relationships & Boundaries",
    "Shadow, Discernment & Protection",
    "Body, Emotion & Nervous System",
    "Work, Wealth & Value",
    "Life, Joy & Meaning",
]

SECTION_DESCRIPTIONS = {
    "Faith, God & Surrender": "Prayer, grace, divine timing, sacred responsibility, surrender, and the metaphysical weather around God.",
    "Reality, Consciousness & Perception": "Consciousness, time, illusion, energy, synchronicity, metaphysics, and the architecture of experience.",
    "Manifestation, Desire & Abundance": "Imagination, intention, frequency, prosperity, timelines, desire, and allowing reality to answer.",
    "Self, Identity & Awakening": "Ego, authenticity, self-concept, inner freedom, memory, awakening, and becoming real to yourself.",
    "Mind, Belief & Inner Work": "Thought, belief, attention, subconscious patterns, self-talk, perspective, and the stories that shape experience.",
    "Action, Discipline & Mastery": "Doing the hard thing, skill, courage, habits, decisions, focus, and embodied momentum.",
    "Creativity, Purpose & Expression": "Calling, craft, art, play, service, voice, vision, and making what only you can make.",
    "Love, Relationships & Boundaries": "Love, friendship, projection, intimacy, standards, rejection, and who gets access.",
    "Shadow, Discernment & Protection": "Enemies, manipulation, resentment, power, spiritual attack, discernment, and energetic hygiene.",
    "Body, Emotion & Nervous System": "Health, breath, body intelligence, emotion, pain, stress, sleep, and nervous-system state.",
    "Work, Wealth & Value": "Money, career, value creation, leverage, spending, wealth, and worldly stewardship.",
    "Life, Joy & Meaning": "Presence, change, beauty, mortality, play, gratitude, paradox, and what makes a life worth living.",
}

FALLBACK_SECTION = "Life, Joy & Meaning"
LABELED_BANK = (
    Path(__file__).resolve().parents[1]
    / "artifacts"
    / "digital-sea"
    / "src"
    / "content"
    / "quotes.md"
)

LEGACY_TO_CANONICAL = {
    "Reality, Manifestation & Abundance": "Manifestation, Desire & Abundance",
    "Relationships, Boundaries & Love": "Love, Relationships & Boundaries",
    "Wealth, Work & Value": "Work, Wealth & Value",
}


# Phrases carry the classification.  Keywords resolve shorter captures and
# reinforce phrases, but are deliberately less influential.
PHRASE_RULES: dict[str, tuple[str, ...]] = {
    "Faith, God & Surrender": (
        "most high", "talk to god", "ask god", "god will", "with god",
        "in prayer", "divine timing", "holy spirit", "divine plan",
        "let go and let god", "child of god", "ask and it shall",
        "spiritual practice", "spiritual industry", "sacred responsibility",
    ),
    "Reality, Consciousness & Perception": (
        "nature of reality", "level of consciousness", "linear time",
        "the illusion", "in the illusion", "the simulation", "this simulation",
        "observer effect", "quantum field", "quantum entanglement",
        "schrodinger", "architecture of experience", "world within",
        "world without", "life happens through you", "medium is the message",
        "separate self", "waking from the dream", "liberation from the dream",
    ),
    "Manifestation, Desire & Abundance": (
        "law of attraction", "law of assumption", "already yours",
        "create your reality", "manifest your", "manifest what", "manifesting what",
        "universe responds", "universe will", "act as if", "living in the end",
        "vibrational alignment", "vibrational harmony", "desired timeline",
        "quantum leap", "count your blessings", "ask and you shall receive",
        "what you desire", "getting what you want", "state your intent",
    ),
    "Self, Identity & Awakening": (
        "who you are", "be yourself", "true self", "higher self",
        "know yourself", "self concept", "self-concept", "come home to yourself",
        "being yourself", "your own person", "believe in yourself",
        "approval of others", "people's opinions", "people’s opinions",
        "taken seriously", "false self", "wearing a mask", "your mask",
        "honor who you", "choose yourself", "trust yourself", "trust your intuition",
    ),
    "Mind, Belief & Inner Work": (
        "subconscious mind", "unconscious program", "limiting belief",
        "change the narrative", "mental construction", "self talk", "self-talk",
        "what you think", "your thoughts", "train your mind", "change your mind",
        "change your perspective", "mental model", "overthinking",
        "thoughts keep looping", "story in your mind", "belief is",
        "focus your attention", "make the unconscious conscious",
    ),
    "Action, Discipline & Mastery": (
        "stay in the game", "in motion", "at rest", "keep going", "never fold",
        "foot down", "hard thing", "do the work", "show up", "take action",
        "out-discipline", "rig your environment", "seize them", "seize the",
        "goes further", "get to work", "just start", "daily routine",
        "consistent action", "follow your procedures", "positive excuses",
        "high achieving", "high-achieving", "sense of urgency", "small task",
        "even at 1 hp", "arrows that travel", "pulled back the farthest",
        "leave a comfortable life", "no thing is hard", "it is only new",
    ),
    "Creativity, Purpose & Expression": (
        "creative project", "creative potential", "creative work", "your creations",
        "pleasure of creating", "follow your dreams", "follow your passion",
        "mastering your art", "share your work", "put yourself out there",
        "unique talents", "only you can", "your mission", "your calling",
        "what to build", "deciding what to build", "pointless creativity",
        "create something different", "make what", "express yourself",
    ),
    "Love, Relationships & Boundaries": (
        "fall in love", "in a relationship", "your partner", "life partner",
        "wrong people", "right relationships", "wrong relationships",
        "honest from the beginning", "relational intelligence", "set boundaries",
        "good boundaries", "people pleasing", "people-pleasing", "loving yourself",
        "people will paint you", "paint you with the colors", "phone call away",
        "rejection betrayal", "fear of rejection", "childhood needs",
    ),
    "Shadow, Discernment & Protection": (
        "psychic vampire", "energy vampire", "psychic attack", "toxic person",
        "toxic people", "watch who you", "trust no one", "evil people",
        "good or evil", "without feeling shame", "manipulate your boundaries",
        "projection tactic", "passive-aggressive", "secretly loathes",
        "wishes me ill", "judge a book", "no advice from the defeated",
        "advice from the defeated", "taken advantage of", "protect your energy",
    ),
    "Body, Emotion & Nervous System": (
        "nervous system", "take a breath", "mental health", "emotional capacity",
        "fight-or-flight", "fight or flight", "stress hormones", "gut feeling",
        "listen to your body", "trapped emotions", "feel your emotions",
        "negative emotions", "unprocessed emotion", "heart rate",
        "muscles tense", "your body thinks", "health and happiness",
        "motion is your meditation", "make yourself feel safe",
    ),
    "Work, Wealth & Value": (
        "make money", "get paid", "net worth", "passive income", "job interview",
        "build wealth", "cash flow", "financial freedom", "consumer debt",
        "sources of income", "charge high", "rich clients", "work for free",
        "business niche", "market saturation", "eye-watering gains",
        "same distribution as wipeouts", "career opportunity", "value your time",
    ),
    "Life, Joy & Meaning": (
        "enjoy your life", "meaning of life", "what makes a life", "one day at a time",
        "present moment", "this moment", "only constant is change", "embrace change",
        "be grateful", "practice gratitude", "choose joy", "enjoying life",
        "happiness is", "feel happy", "spark joy", "dance in the rain",
        "life is not a straight line", "make peace with", "silver lining",
    ),
}

KEYWORD_RULES: dict[str, tuple[str, ...]] = {
    "Faith, God & Surrender": (
        "god", "allah", "prayer", "pray", "faith", "grace", "divine", "angel",
        "heaven", "surrender", "soul", "sacred", "devil", "priest", "worship",
        "christ", "jesus", "bible", "quran", "church", "holy", "sin", "providence",
    ),
    "Reality, Consciousness & Perception": (
        "reality", "consciousness", "perception", "illusion", "simulation",
        "quantum", "observer", "time", "synchronicity", "metaphysics", "multidimensional",
    ),
    "Manifestation, Desire & Abundance": (
        "manifest", "abundance", "attract", "neville", "imagination", "frequency",
        "vibration", "desire", "affirmation", "visualize", "visualization",
        "intention", "prosperity", "timeline", "miracle", "luck",
    ),
    "Self, Identity & Awakening": (
        "identity", "awaken", "authentic", "selfhood", "ego", "self-worth",
        "self", "shame", "approval", "mask", "individuality", "freedom",
    ),
    "Mind, Belief & Inner Work": (
        "thought", "belief", "mindset", "subconscious", "unconscious", "narrative",
        "perspective", "attention", "focus", "worry", "thinking", "story",
        "programming", "judgment", "decision", "awareness",
    ),
    "Action, Discipline & Mastery": (
        "discipline", "willpower", "mastery", "practice", "consistency", "pressure",
        "habit", "strategy", "execution", "momentum", "effort", "action", "motion",
        "start", "finish", "commit", "courage", "risk", "train", "skill", "urgency",
        "progress", "improve", "failure", "leader", "accountability",
    ),
    "Creativity, Purpose & Expression": (
        "create", "creative", "creativity", "art", "artist", "craft", "write",
        "writer", "voice", "expression", "vision", "purpose", "calling", "mission",
        "talent", "idea", "dream",
    ),
    "Love, Relationships & Boundaries": (
        "relationship", "boundary", "love", "partner", "marriage", "marry", "friend",
        "intimacy", "rejection", "loyalty", "trust", "betrayal", "attachment",
        "family", "parents", "connection", "respect", "codependence",
    ),
    "Shadow, Discernment & Protection": (
        "psychic", "vampire", "enemy", "manipulation", "discernment", "protection",
        "resentment", "narcissist", "cruel", "toxic", "evil", "attack", "predator",
        "deceive", "liar", "projection", "hatred", "jealousy", "guilt", "curse",
    ),
    "Body, Emotion & Nervous System": (
        "nervous", "anxiety", "anxious", "emotion", "breath", "breathe", "sleep",
        "body", "health", "stress", "feeling", "mindfulness", "meditate", "calm",
        "somatic", "trauma", "dopamine", "cortisol", "rest", "tired", "fatigue",
        "pain", "heal", "anger", "sadness", "depression", "heart", "gut",
    ),
    "Work, Wealth & Value": (
        "money", "wealth", "cash", "business", "income", "rich", "career", "salary",
        "invest", "capital", "profit", "leverage", "client", "customer", "market",
        "sell", "pricing", "equity", "job", "company", "startup", "entrepreneur",
        "finance", "spending", "paid", "gains",
    ),
    "Life, Joy & Meaning": (
        "life", "joy", "happy", "happiness", "gratitude", "grateful", "beauty",
        "mortality", "death", "change", "presence", "play", "meaning", "paradox",
        "tomorrow", "today", "journey", "peace", "wonder",
    ),
}

FOLDER_HINTS: tuple[tuple[str, str], ...] = (
    ("prayer", "Faith, God & Surrender"),
    ("faith", "Faith, God & Surrender"),
    ("god", "Faith, God & Surrender"),
    ("religion", "Faith, God & Surrender"),
    ("consciousness", "Reality, Consciousness & Perception"),
    ("metaphysics", "Reality, Consciousness & Perception"),
    ("esoterica", "Reality, Consciousness & Perception"),
    ("manifestation", "Manifestation, Desire & Abundance"),
    ("abundance", "Manifestation, Desire & Abundance"),
    ("identity", "Self, Identity & Awakening"),
    ("self", "Self, Identity & Awakening"),
    ("psychology", "Mind, Belief & Inner Work"),
    ("mindset", "Mind, Belief & Inner Work"),
    ("discipline", "Action, Discipline & Mastery"),
    ("mastery", "Action, Discipline & Mastery"),
    ("productivity", "Action, Discipline & Mastery"),
    ("creativity", "Creativity, Purpose & Expression"),
    ("writing", "Creativity, Purpose & Expression"),
    ("art", "Creativity, Purpose & Expression"),
    ("relationship", "Love, Relationships & Boundaries"),
    ("dating", "Love, Relationships & Boundaries"),
    ("shadow", "Shadow, Discernment & Protection"),
    ("discernment", "Shadow, Discernment & Protection"),
    ("mindfulness", "Body, Emotion & Nervous System"),
    ("health", "Body, Emotion & Nervous System"),
    ("holistic", "Body, Emotion & Nervous System"),
    ("somatic", "Body, Emotion & Nervous System"),
    ("finance", "Work, Wealth & Value"),
    ("money", "Work, Wealth & Value"),
    ("crypto", "Work, Wealth & Value"),
    ("business", "Work, Wealth & Value"),
    ("career", "Work, Wealth & Value"),
    ("life", "Life, Joy & Meaning"),
    ("joy", "Life, Joy & Meaning"),
)


def _contains(text: str, signal: str) -> bool:
    """Match phrases literally and single words at lexical boundaries."""
    if " " in signal or "-" in signal or "’" in signal or "'" in signal:
        return signal in text
    return re.search(rf"(?<![\w-]){re.escape(signal)}(?![\w-])", text) is not None


def _similarity_text(text: str) -> str:
    lines = []
    for line in (text or "").splitlines():
        cleaned = re.sub(r"^>\s?", "", line).strip()
        if re.match(r"^(?:—|--|–)\s*", cleaned) or re.match(r"^-\s+@", cleaned):
            continue
        lines.append(cleaned)
    joined = " ".join(lines).lower().replace("’", "'")
    return " ".join(re.findall(r"[a-z0-9]+", joined))


@lru_cache(maxsize=1)
def labeled_examples() -> tuple[tuple[str, str], ...]:
    """Read the manually curated bank as durable category exemplars."""
    if not LABELED_BANK.is_file():
        return ()
    examples: list[tuple[str, str]] = []
    current = ""
    quote_lines: list[str] = []

    def flush() -> None:
        nonlocal quote_lines
        if quote_lines and current in SECTIONS:
            normalized = _similarity_text("\n".join(quote_lines))
            if normalized:
                examples.append((current, normalized))
        quote_lines = []

    for line in LABELED_BANK.read_text(encoding="utf-8").splitlines():
        if line.startswith("## ") and line != "## Index":
            flush()
            current = line[3:].strip()
        elif line.startswith(">") and current:
            quote_lines.append(line)
        else:
            flush()
    flush()
    return tuple(examples)


def find_labeled_match(text: str) -> str | None:
    """Preserve manual placement for exact and near-duplicate re-ingests.

    Raindrop and X frequently change punctuation, hyphenation, or one typo in
    an already-captured post.  The ordinary body deduper can miss that variant;
    this labeled comparison makes it inherit the existing curated category.
    """
    candidate = _similarity_text(text)
    if not candidate:
        return None
    candidate_tokens = set(candidate.split())
    for section, example in labeled_examples():
        if candidate == example:
            return section
    if len(candidate_tokens) < 7 or len(candidate) < 45:
        return None

    best_section: str | None = None
    best_score = 0.0
    for section, example in labeled_examples():
        ratio = len(candidate) / max(1, len(example))
        if ratio < 0.6 or ratio > 1.67:
            continue
        example_tokens = set(example.split())
        shared = len(candidate_tokens & example_tokens)
        union = len(candidate_tokens | example_tokens) or 1
        overlap = shared / max(1, min(len(candidate_tokens), len(example_tokens)))
        jaccard = shared / union
        if overlap < 0.84 or jaccard < 0.50:
            continue
        sequence = SequenceMatcher(None, candidate, example, autojunk=False).ratio()
        score = max(sequence, (0.6 * overlap) + (0.4 * jaccard))
        if score > best_score:
            best_section, best_score = section, score
    return best_section if best_score >= 0.79 else None


def score_quote(text: str, path_str: str = "", folder_hint: str = "") -> dict[str, int]:
    text_l = re.sub(r"\s+", " ", (text or "").lower()).strip()
    path_l = f"{path_str} {folder_hint}".lower().replace("\\", "/")
    scores = {section: 0 for section in SECTIONS}

    segments = [segment.strip() for segment in path_l.split("/") if segment.strip()]
    for depth, segment in enumerate(reversed(segments)):
        weight = 8 if depth == 0 else (5 if depth == 1 else 3)
        seen: set[str] = set()
        for needle, section in FOLDER_HINTS:
            if section not in seen and _contains(segment, needle):
                scores[section] += weight
                seen.add(section)

    for section, phrases in PHRASE_RULES.items():
        scores[section] += 5 * sum(1 for phrase in phrases if _contains(text_l, phrase))
    for section, keywords in KEYWORD_RULES.items():
        scores[section] += sum(1 for keyword in keywords if _contains(text_l, keyword))

    return scores


def categorize(text: str, path_str: str = "", folder_hint: str = "") -> str:
    """Return exactly one of the twelve canonical public categories."""
    labeled = find_labeled_match(text)
    if labeled:
        return labeled
    scores = score_quote(text, path_str, folder_hint)
    best = max(scores.values(), default=0)
    if best < 2:
        return FALLBACK_SECTION
    # Stable tie-breaking follows the intentional public taxonomy order.
    return next(section for section in SECTIONS if scores[section] == best)


def validate_taxonomy() -> None:
    if set(SECTION_DESCRIPTIONS) != set(SECTIONS):
        raise ValueError("section-description taxonomy drift")
    rule_groups: Iterable[dict[str, tuple[str, ...]]] = (PHRASE_RULES, KEYWORD_RULES)
    for rules in rule_groups:
        if set(rules) != set(SECTIONS):
            missing = set(SECTIONS) - set(rules)
            extra = set(rules) - set(SECTIONS)
            raise ValueError(f"taxonomy drift: missing={sorted(missing)} extra={sorted(extra)}")
    for _, section in FOLDER_HINTS:
        if section not in SECTIONS:
            raise ValueError(f"unknown folder-hint section: {section}")


validate_taxonomy()
