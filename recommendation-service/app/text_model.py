"""A small, dependency-free TF-IDF + cosine-similarity content model.

scikit-learn would normally power this, but it has no prebuilt wheel for the
Python version used here and compiling from source is fragile. This module
provides the same content-based signal (TF-IDF document vectors compared with
cosine similarity) in pure Python, so the service installs and runs anywhere.
"""

import math
import re

_STOP_WORDS = {
    "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with",
    "is", "are", "be", "this", "that", "it", "as", "at", "by", "from",
    "your", "you", "our", "we", "will", "can", "made", "make",
}

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN_RE.findall((text or "").lower())
            if t not in _STOP_WORDS and len(t) > 1]


class TfidfModel:
    """Fit TF-IDF vectors over a corpus and expose cosine similarity."""

    def __init__(self, corpus: list[str]):
        self.vectors: list[dict[str, float]] = []
        self.norms: list[float] = []
        self._fit(corpus)

    def _fit(self, corpus: list[str]) -> None:
        tokenized = [_tokenize(doc) for doc in corpus]
        n_docs = len(tokenized) or 1

        # Document frequency for each term.
        doc_freq: dict[str, int] = {}
        for tokens in tokenized:
            for term in set(tokens):
                doc_freq[term] = doc_freq.get(term, 0) + 1

        # Smoothed inverse document frequency.
        idf = {
            term: math.log((1 + n_docs) / (1 + df)) + 1.0
            for term, df in doc_freq.items()
        }

        for tokens in tokenized:
            term_counts: dict[str, int] = {}
            for term in tokens:
                term_counts[term] = term_counts.get(term, 0) + 1
            total = len(tokens) or 1

            vector = {
                term: (count / total) * idf.get(term, 0.0)
                for term, count in term_counts.items()
            }
            norm = math.sqrt(sum(w * w for w in vector.values()))
            self.vectors.append(vector)
            self.norms.append(norm)

    def similarity(self, i: int, j: int) -> float:
        """Cosine similarity between documents `i` and `j`."""
        norm_i, norm_j = self.norms[i], self.norms[j]
        if norm_i == 0 or norm_j == 0:
            return 0.0

        vec_i, vec_j = self.vectors[i], self.vectors[j]
        # Iterate the smaller vector for the dot product.
        if len(vec_i) > len(vec_j):
            vec_i, vec_j = vec_j, vec_i
        dot = sum(weight * vec_j.get(term, 0.0) for term, weight in vec_i.items())
        return dot / (norm_i * norm_j)
