#!/usr/bin/env python3
"""Local semantic embeddings for the canonical quote classifier.

The model is deliberately small, pinned, and stored outside the repository in
Hermes' local model directory.  Category centroids are learned from the current
curated quote bank and cached by a fingerprint of those labels, so a manual
reorganization automatically becomes the classifier's new semantic baseline.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from hashlib import sha256
import json
import math
import os
from pathlib import Path
import tempfile
from typing import Sequence


MODEL_REVISION = "1110a243fdf4706b3f48f1d95db1a4f5529b4d41"
MODEL_SHA256 = "b941bf19f1f1283680f449fa6a7336bb5600bdcd5f84d10ddc5cd72218a0fd21"
TOKENIZER_SHA256 = "be50c3628f2bf5bb5e3a7f17b1f74611b2561a3a27eeab05e5aa30f411572037"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def _local_appdata() -> Path:
    configured = os.environ.get("LOCALAPPDATA")
    if configured:
        return Path(configured)
    return Path.home() / "AppData" / "Local"


MODEL_DIR = Path(
    os.environ.get(
        "NUROCTANE_QUOTE_MODEL_DIR",
        str(_local_appdata() / "hermes" / "models" / "quote-semantic"),
    )
)
MODEL_PATH = MODEL_DIR / "model.onnx"
TOKENIZER_PATH = MODEL_DIR / "tokenizer.json"
CACHE_PATH = _local_appdata() / "hermes" / "cache" / "quote-semantic-centroids.npz"


class SemanticModelError(RuntimeError):
    """The pinned semantic model cannot be used safely."""


@dataclass(frozen=True)
class SemanticResult:
    scores: dict[str, float]
    neighbor_scores: dict[str, float]
    best_section: str
    best_score: float
    margin: float


def file_sha256(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@lru_cache(maxsize=1)
def validate_model_files() -> None:
    expected = ((MODEL_PATH, MODEL_SHA256), (TOKENIZER_PATH, TOKENIZER_SHA256))
    for path, wanted in expected:
        if not path.is_file():
            raise SemanticModelError(
                f"semantic quote model is missing: {path}; run scripts/install-quote-semantic-model.py"
            )
        actual = file_sha256(path)
        if actual != wanted:
            raise SemanticModelError(
                f"semantic quote model integrity failure for {path}: {actual} != {wanted}"
            )


@lru_cache(maxsize=1)
def _runtime():
    validate_model_files()
    try:
        import numpy as np
        import onnxruntime as ort
        from tokenizers import Tokenizer
    except ImportError as exc:
        raise SemanticModelError(
            "semantic quote classification requires numpy, onnxruntime, and tokenizers"
        ) from exc

    options = ort.SessionOptions()
    options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    options.intra_op_num_threads = max(1, min(4, os.cpu_count() or 1))
    session = ort.InferenceSession(
        str(MODEL_PATH),
        sess_options=options,
        providers=["CPUExecutionProvider"],
    )
    tokenizer = Tokenizer.from_file(str(TOKENIZER_PATH))
    tokenizer.enable_truncation(max_length=256)
    tokenizer.enable_padding(pad_id=0, pad_token="[PAD]")
    return np, session, tokenizer


def embed_texts(texts: Sequence[str], batch_size: int = 64):
    """Return normalized 384-dimensional sentence embeddings."""
    np, session, tokenizer = _runtime()
    if not texts:
        return np.empty((0, 384), dtype=np.float32)
    batches = []
    for start in range(0, len(texts), batch_size):
        encoded = tokenizer.encode_batch(list(texts[start : start + batch_size]))
        input_ids = np.asarray([item.ids for item in encoded], dtype=np.int64)
        attention = np.asarray([item.attention_mask for item in encoded], dtype=np.int64)
        token_types = np.asarray([item.type_ids for item in encoded], dtype=np.int64)
        hidden = session.run(
            None,
            {
                "input_ids": input_ids,
                "attention_mask": attention,
                "token_type_ids": token_types,
            },
        )[0]
        pooled = (hidden * attention[:, :, None]).sum(axis=1)
        pooled /= np.maximum(attention.sum(axis=1, keepdims=True), 1)
        pooled /= np.maximum(np.linalg.norm(pooled, axis=1, keepdims=True), 1e-12)
        batches.append(pooled.astype(np.float32))
    return np.vstack(batches)


def examples_fingerprint(examples: Sequence[tuple[str, str]], sections: Sequence[str]) -> str:
    payload = json.dumps(
        {"model": MODEL_SHA256, "sections": list(sections), "examples": list(examples)},
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    return sha256(payload).hexdigest()


def _load_cached_index(fingerprint: str, sections: Sequence[str], example_count: int):
    np, _, _ = _runtime()
    if not CACHE_PATH.is_file():
        return None
    try:
        with np.load(CACHE_PATH, allow_pickle=False) as cached:
            cached_fingerprint = str(cached["fingerprint"].item())
            cached_sections = tuple(str(item) for item in cached["sections"].tolist())
            centroids = cached["centroids"].astype(np.float32)
            vectors = cached["vectors"].astype(np.float32)
        if cached_fingerprint != fingerprint or cached_sections != tuple(sections):
            return None
        if centroids.shape != (len(sections), 384) or not np.isfinite(centroids).all():
            return None
        if vectors.shape != (example_count, 384) or not np.isfinite(vectors).all():
            return None
        return centroids, vectors
    except (OSError, ValueError, KeyError):
        return None


def _write_cached_index(fingerprint: str, sections: Sequence[str], centroids, vectors) -> None:
    np, _, _ = _runtime()
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", prefix="quote-centroids-", suffix=".npz", dir=CACHE_PATH.parent, delete=False
        ) as stream:
            temporary = Path(stream.name)
            np.savez_compressed(
                stream,
                fingerprint=np.asarray(fingerprint),
                sections=np.asarray(list(sections)),
                centroids=centroids,
                vectors=vectors,
            )
        os.replace(temporary, CACHE_PATH)
    finally:
        if temporary and temporary.exists():
            temporary.unlink(missing_ok=True)


@lru_cache(maxsize=2)
def semantic_index(
    fingerprint: str,
    sections: tuple[str, ...],
    examples: tuple[tuple[str, str], ...],
):
    """Load or learn normalized examples and one centroid per category."""
    np, _, _ = _runtime()
    cached = _load_cached_index(fingerprint, sections, len(examples))
    if cached is not None:
        return cached

    vectors = embed_texts([text for _, text in examples])
    centroids = []
    for section in sections:
        indexes = [index for index, (label, _) in enumerate(examples) if label == section]
        if not indexes:
            raise SemanticModelError(f"no curated examples for semantic category {section!r}")
        centroid = vectors[indexes].mean(axis=0)
        centroid /= max(float(np.linalg.norm(centroid)), 1e-12)
        centroids.append(centroid)
    result = np.vstack(centroids).astype(np.float32)
    _write_cached_index(fingerprint, sections, result, vectors)
    return result, vectors


def category_centroids(
    fingerprint: str,
    sections: tuple[str, ...],
    examples: tuple[tuple[str, str], ...],
):
    return semantic_index(fingerprint, sections, examples)[0]


def leave_one_out_semantic_scores(
    sections: Sequence[str],
    examples: Sequence[tuple[str, str]],
) -> list[tuple[dict[str, float], dict[str, float]]]:
    """Score each curated example against centroids that exclude itself.

    This is a regression benchmark, not the production path. It prevents an
    exact labeled example from inflating the reported semantic quality.
    """
    np, _, _ = _runtime()
    section_tuple = tuple(sections)
    example_tuple = tuple(examples)
    fingerprint = examples_fingerprint(example_tuple, section_tuple)
    _, vectors = semantic_index(fingerprint, section_tuple, example_tuple)
    labels = [label for label, _ in example_tuple]
    sums = {
        section: vectors[[index for index, label in enumerate(labels) if label == section]].sum(axis=0)
        for section in section_tuple
    }
    counts = {section: labels.count(section) for section in section_tuple}
    similarities = vectors @ vectors.T
    np.fill_diagonal(similarities, -2.0)
    results: list[tuple[dict[str, float], dict[str, float]]] = []
    for index, expected in enumerate(labels):
        row: dict[str, float] = {}
        neighbors: dict[str, float] = {}
        for section in section_tuple:
            count = counts[section] - (1 if section == expected else 0)
            if count <= 0:
                raise SemanticModelError(f"not enough examples to benchmark {section!r}")
            centroid = sums[section] - (vectors[index] if section == expected else 0)
            centroid = centroid / count
            centroid /= max(float(np.linalg.norm(centroid)), 1e-12)
            row[section] = float(centroid @ vectors[index])
            section_values = sorted(
                (
                    float(similarities[index, other])
                    for other, label in enumerate(labels)
                    if label == section and other != index
                ),
                reverse=True,
            )[:3]
            neighbors[section] = sum(
                weight * value
                for weight, value in zip((0.65, 0.25, 0.10), section_values)
            )
        results.append((row, neighbors))
    return results


def semantic_result(
    text: str,
    sections: Sequence[str],
    examples: Sequence[tuple[str, str]],
) -> SemanticResult:
    if not examples:
        raise SemanticModelError("the curated quote bank contains no semantic examples")
    section_tuple = tuple(sections)
    example_tuple = tuple(examples)
    fingerprint = examples_fingerprint(example_tuple, section_tuple)
    centroids, example_vectors = semantic_index(fingerprint, section_tuple, example_tuple)
    vector = embed_texts([text])[0]
    raw_scores = centroids @ vector
    scores = {section: float(raw_scores[index]) for index, section in enumerate(section_tuple)}
    similarities = example_vectors @ vector
    neighbor_scores: dict[str, float] = {}
    for section in section_tuple:
        section_values = sorted(
            (
                float(similarities[index])
                for index, (label, _) in enumerate(example_tuple)
                if label == section
            ),
            reverse=True,
        )[:3]
        weights = (0.65, 0.25, 0.10)
        neighbor_scores[section] = sum(
            weight * value for weight, value in zip(weights, section_values)
        )
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    best_section, best_score = ranked[0]
    margin = best_score - ranked[1][1] if len(ranked) > 1 else best_score
    if not math.isfinite(best_score) or not math.isfinite(margin):
        raise SemanticModelError("semantic quote classifier produced a non-finite score")
    return SemanticResult(scores, neighbor_scores, best_section, best_score, margin)


def semantic_healthcheck() -> dict[str, str | int]:
    """Load the pinned runtime and execute one real inference."""
    vector = embed_texts(["A meaningful life is built with attention and courage."])
    return {
        "model": MODEL_NAME,
        "revision": MODEL_REVISION,
        "dimensions": int(vector.shape[1]),
        "model_sha256": MODEL_SHA256,
    }
