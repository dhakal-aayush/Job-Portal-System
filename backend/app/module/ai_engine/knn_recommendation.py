import numpy as np
from sklearn.neighbors import NearestNeighbors

from app.module.ai_engine.tfidf import build_tfidf_vectorizer


def recommend_top_k(query_text: str, corpus: list[str], k: int = 5) -> list[dict]:
    """
    Uses K-Nearest Neighbors (cosine distance) over TF-IDF vectors of
    `corpus` to find the `k` documents most similar to `query_text`.

    Returns a list of {"index": int, "score": float} sorted by similarity
    descending, where score = 1 - cosine_distance.

    `k` is automatically capped at len(corpus) to avoid sklearn errors when
    the corpus is smaller than the requested neighbor count.
    """
    if not corpus:
        return []

    k = min(k, len(corpus))

    documents = [query_text or ""] + corpus
    _, matrix = build_tfidf_vectorizer(documents)

    query_vector = matrix[0:1]
    corpus_vectors = matrix[1:]

    model = NearestNeighbors(n_neighbors=k, metric="cosine")
    model.fit(corpus_vectors)

    distances, indices = model.kneighbors(query_vector)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        results.append({
            "index": int(idx),
            "score": float(1 - dist),
        })

    # NearestNeighbors already returns sorted-by-distance, but be explicit
    results.sort(key=lambda r: r["score"], reverse=True)
    return results
