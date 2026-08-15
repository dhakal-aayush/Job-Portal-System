"""
Evaluation metrics for the AI recommendation system.

These are intended for offline evaluation (e.g. a notebook or scheduled job)
where you have a held-out set of (user, relevant_job_ids) pairs and the
recommender's ranked output for each user. They are not called from the
live API request path.
"""


def precision_at_k(recommended_ids: list[int], relevant_ids: set[int], k: int) -> float:
    if k == 0:
        return 0.0
    top_k = recommended_ids[:k]
    hits = sum(1 for item in top_k if item in relevant_ids)
    return hits / k


def recall_at_k(recommended_ids: list[int], relevant_ids: set[int], k: int) -> float:
    if not relevant_ids:
        return 0.0
    top_k = recommended_ids[:k]
    hits = sum(1 for item in top_k if item in relevant_ids)
    return hits / len(relevant_ids)


def f1_at_k(recommended_ids: list[int], relevant_ids: set[int], k: int) -> float:
    p = precision_at_k(recommended_ids, relevant_ids, k)
    r = recall_at_k(recommended_ids, relevant_ids, k)
    if p + r == 0:
        return 0.0
    return 2 * p * r / (p + r)


def average_precision(recommended_ids: list[int], relevant_ids: set[int]) -> float:
    """Average Precision for a single user's ranked list."""
    if not relevant_ids:
        return 0.0

    hits = 0
    score_sum = 0.0
    for i, item in enumerate(recommended_ids, start=1):
        if item in relevant_ids:
            hits += 1
            score_sum += hits / i

    return score_sum / len(relevant_ids)


def mean_average_precision(
    all_recommended: list[list[int]],
    all_relevant: list[set[int]],
) -> float:
    """Mean Average Precision (MAP) across multiple users."""
    if not all_recommended:
        return 0.0

    scores = [
        average_precision(rec, rel)
        for rec, rel in zip(all_recommended, all_relevant)
    ]
    return sum(scores) / len(scores)
