"""
AI Match Scoring

Overall Score =
70% Skill Match +
30% Resume Similarity
"""

from typing import List, Tuple


def calculate_skill_score(
    required_skills: List[str],
    candidate_skills: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Returns:
        score,
        matched_skills,
        missing_skills
    """

    required = {
        skill.lower().strip()
        for skill in required_skills
        if skill.strip()
    }

    candidate = {
        skill.lower().strip()
        for skill in candidate_skills
        if skill.strip()
    }

    if not required:
        return 100.0, [], []

    matched = sorted(required & candidate)
    missing = sorted(required - candidate)

    score = round(
        (len(matched) / len(required)) * 100,
        2,
    )

    return score, matched, missing


def calculate_final_score(
    skill_score: float,
    resume_score: float,
) -> float:
    """
    Overall AI Score

    70% Skill Match
    30% Resume Similarity
    """

    return round(
        skill_score * 0.70 +
        resume_score * 0.30,
        2,
    )


def recommendation(score: float) -> str:

    if score >= 90:
        return "Excellent Match"

    if score >= 75:
        return "Strong Match"

    if score >= 60:
        return "Good Match"

    if score >= 40:
        return "Average Match"

    return "Poor Match"