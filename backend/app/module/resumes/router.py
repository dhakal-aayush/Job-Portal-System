from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_job_seeker
from app.module.resumes.schemas import ResumeResponse
from app.module.resumes.service import ResumeService
from app.module.users.models import User

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/", response_model=ResumeResponse, status_code=201)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return ResumeService.upload_resume(db, file, current_user)


@router.get("/", response_model=list[ResumeResponse])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ResumeService.get_my_resumes(db, current_user)


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ResumeService.delete_resume(db, resume_id, current_user)
