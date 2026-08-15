from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None


class ApplicationStatusUpdate(BaseModel):
    status: str  # pending, reviewed, shortlisted, rejected, hired


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int]
    status: str
    match_score: Optional[int]
    applied_at: datetime

    class Config:
        from_attributes = True


class SavedJobCreate(BaseModel):
    job_id: int


class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    saved_at: datetime

    class Config:
        from_attributes = True
