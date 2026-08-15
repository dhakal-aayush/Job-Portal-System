from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: Optional[str] = None  # comma-separated
    location: str
    salary: Optional[str] = None
    job_type: str  # full_time, part_time, contract, internship, remote


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = None  # open, closed


class JobResponse(BaseModel):
    id: int
    company_id: int
    title: str
    description: str
    required_skills: Optional[str]
    location: Optional[str]
    salary: Optional[str]
    job_type: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[JobResponse]
