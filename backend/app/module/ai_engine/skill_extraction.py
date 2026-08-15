import re

# A broader, more realistic skill taxonomy. Multi-word skills are listed
# explicitly so they can be matched as phrases.
COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "sql", "nosql", "postgresql", "mysql", "mongodb", "redis",
    "fastapi", "django", "flask", "spring", "express",
    "react", "vue", "angular", "next.js", "node.js",
    "machine learning", "deep learning", "data analysis", "data science",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "git",
    "html", "css", "tailwind", "rest api", "graphql",
    "linux", "agile", "scrum", "communication", "leadership",
]


def extract_skills(text: str) -> list[str]:
    """
    Extracts known skills from free text using whole-word / phrase matching
    so that substrings like "java" do not falsely match inside "javascript".
    """
    if not text:
        return []

    text_lower = text.lower()
    found = []

    for skill in COMMON_SKILLS:
        # Escape regex special chars (e.g. "c++", "c#", "next.js")
        pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        if re.search(pattern, text_lower):
            found.append(skill)

    return found
