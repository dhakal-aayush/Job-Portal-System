from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_job_seeker, require_employer

from app.module.applications.schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    SavedJobCreate,
    SavedJobResponse,
)
from app.module.applications.service import ApplicationService, SavedJobService
from app.module.users.models import User

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse, status_code=201)
def apply_job(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return ApplicationService.apply_job(db, data, current_user)


@router.get("/me", response_model=list[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ApplicationService.get_my_applications(db, current_user)


@router.get("/job/{job_id}")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    # Returns enriched dicts (not ORM objects) so no response_model needed
    return ApplicationService.get_applications_for_job(db, job_id, current_user)


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return ApplicationService.update_status(db, application_id, data.status, current_user)


@router.post("/saved", response_model=SavedJobResponse, status_code=201)
def save_job(
    data: SavedJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return SavedJobService.save_job(db, data.job_id, current_user)


@router.get("/saved", response_model=list[SavedJobResponse])
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return SavedJobService.get_saved_jobs(db, current_user)


@router.delete("/saved/{job_id}")
def unsave_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return SavedJobService.unsave_job(db, job_id, current_user)
