from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_employer
from app.module.jobs.schemas import JobCreate, JobUpdate, JobResponse, JobListResponse
from app.module.jobs.service import JobService
from app.module.users.models import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# =========================
# CREATE JOB (employer only)
# =========================
@router.post("/", response_model=JobResponse, status_code=201)
def create_job(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return JobService.create_job(db, data, current_user)


# =========================
# MY JOBS (employer dashboard)
# =========================
@router.get("/employer/mine", response_model=list[JobResponse])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return JobService.get_jobs_by_employer(db, current_user)


# =========================
# SEARCH / LIST JOBS (public)
# =========================
@router.get("/", response_model=JobListResponse)
def get_jobs(
    keyword: str | None = Query(default=None),
    location: str | None = Query(default=None),
    job_type: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return JobService.search_jobs(
        db, keyword=keyword, location=location, job_type=job_type,
        page=page, page_size=page_size,
    )


# =========================
# GET JOB DETAILS (public)
# =========================
@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    return JobService.get_job_by_id(db, job_id)


# =========================
# UPDATE JOB (owner employer only)
# =========================
@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return JobService.update_job(db, job_id, data, current_user)


# =========================
# DELETE JOB (owner employer only)
# =========================
@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return JobService.delete_job(db, job_id, current_user)
