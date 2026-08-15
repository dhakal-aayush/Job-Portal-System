from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.module.jobs.models import Job
from app.module.companies.models import Company
from app.module.users.models import User


class JobService:

    @staticmethod
    def create_job(db: Session, data, current_user: User):
        company = db.query(Company).filter(Company.user_id == current_user.id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must create a company profile before posting jobs",
            )

        job = Job(
            company_id=company.id,
            title=data.title,
            description=data.description,
            required_skills=data.required_skills,
            location=data.location,
            salary=data.salary,
            job_type=data.job_type,
        )

        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def get_job_by_id(db: Session, job_id: int) -> Job:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    def get_jobs_by_employer(db: Session, current_user: User):
        company = db.query(Company).filter(Company.user_id == current_user.id).first()
        if not company:
            return []

        return (
            db.query(Job)
            .filter(Job.company_id == company.id)
            .order_by(Job.created_at.desc())
            .all()
        )

    @staticmethod
    def search_jobs(
        db: Session,
        keyword: str | None = None,
        location: str | None = None,
        job_type: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Job).filter(Job.status == "open")

        if keyword:
            like = f"%{keyword}%"
            query = query.filter(
                or_(Job.title.ilike(like), Job.description.ilike(like))
            )

        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))

        if job_type:
            query = query.filter(Job.job_type == job_type)

        total = query.count()

        items = (
            query.order_by(Job.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    @staticmethod
    def update_job(db: Session, job_id: int, data, current_user: User) -> Job:
        job = JobService.get_job_by_id(db, job_id)
        JobService._assert_owner(db, job, current_user)

        for field, value in data.dict(exclude_unset=True).items():
            setattr(job, field, value)

        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def delete_job(db: Session, job_id: int, current_user: User):
        job = JobService.get_job_by_id(db, job_id)
        JobService._assert_owner(db, job, current_user)

        db.delete(job)
        db.commit()
        return {"message": "Job deleted successfully"}

    @staticmethod
    def _assert_owner(db: Session, job: Job, current_user: User):
        if current_user.role == "admin":
            return

        company = db.query(Company).filter(Company.id == job.company_id).first()
        if not company or company.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this job",
            )
