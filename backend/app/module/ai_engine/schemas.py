from pydantic import BaseModel


class ResumeTextRequest(BaseModel):
    resume_text: str


class SkillsResponse(BaseModel):
    skills: list[str]


class JobMatchResponse(BaseModel):
    match_score: float
    skills: list[str]


class RecommendedJob(BaseModel):
    job_id: int
    title: str
    company_name: str
    score: float


class RecommendationsResponse(BaseModel):
    recommendations: list[RecommendedJob]


class RankedCandidate(BaseModel):
    user_id: int
    name: str
    resume_id: int | None
    score: float


class RankedCandidatesResponse(BaseModel):
    candidates: list[RankedCandidate]
