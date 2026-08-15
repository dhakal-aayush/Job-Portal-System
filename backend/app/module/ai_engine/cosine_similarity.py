from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity

from app.module.ai_engine.tfidf import build_tfidf_vectorizer


def calculate_similarity_matrix(query_text: str, corpus: list[str]) -> list[float]:
    """
    Computes the cosine similarity between `query_text` (e.g. a resume) and
    every document in `corpus` (e.g. job descriptions).

    A single TF-IDF vectorizer is fit across [query_text] + corpus so all
    vectors share a vocabulary -- this avoids the bug where each call fits
    its own vectorizer on mismatched/empty text and produces meaningless
    (often zero or NaN) similarity scores.

    Returns a list of similarity scores (0.0 - 1.0), one per corpus document.
    """
    if not corpus:
        return []

    documents = [query_text or ""] + corpus
    _, matrix = build_tfidf_vectorizer(documents)

    query_vector = matrix[0:1]
    corpus_vectors = matrix[1:]

    similarities = sk_cosine_similarity(query_vector, corpus_vectors)[0]
    return [float(s) for s in similarities]


def calculate_pairwise_similarity(text_a: str, text_b: str) -> float:
    """Cosine similarity between exactly two documents (e.g. resume vs one job)."""
    scores = calculate_similarity_matrix(text_a, [text_b or ""])
    return scores[0] if scores else 0.0
