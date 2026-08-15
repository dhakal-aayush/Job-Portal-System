from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_employer, require_admin

from app.module.ai_engine.schemas import ResumeTextRequest
from app.module.ai_engine.service import AIService
from app.module.users.models import User


router = APIRouter(prefix="/ai", tags=["AI Engine"])


# =========================
# EXTRACT SKILLS FROM TEXT
# =========================
@router.post("/skills")
def extract_skills(data: ResumeTextRequest):
    return AIService.get_resume_skills(data.resume_text)


# =========================
# MATCH RESUME TEXT AGAINST A SPECIFIC JOB
# =========================
@router.post("/match/{job_id}")
def match_resume(
    job_id: int,
    data: ResumeTextRequest,
    db: Session = Depends(get_db),
):
    return AIService.match_resume_to_job(db, data.resume_text, job_id)


# =========================
# PERSONALIZED JOB RECOMMENDATIONS (job seeker)
# =========================
@router.get("/recommendations")
def get_recommendations(
    top_k: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AIService.recommend_jobs_for_user(db, current_user, top_k=top_k)


# =========================
# AI-RANKED CANDIDATES FOR A JOB (employer)
# =========================
@router.get("/jobs/{job_id}/candidates")
def get_ranked_candidates(
    job_id: int,
    top_k: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return AIService.rank_candidates_for_job(db, job_id, top_k=top_k)


# =========================
# RECOMMENDATION ANALYTICS (admin)
# =========================
@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return AIService.get_recommendation_analytics(db)
