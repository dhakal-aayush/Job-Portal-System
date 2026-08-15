from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.module.applications.models import Application, SavedJob
from app.module.jobs.models import Job
from app.module.companies.models import Company
from app.module.users.models import User
from app.module.resumes.models import Resume


def _compute_match_score(db: Session, user: User, job: Job) -> int | None:
    """
    Compute a cosine similarity match score between the user's profile
    and the job at apply time. Returns an integer 0-100, or None if the
    user has no profile text to compare against.
    """
    try:
        from app.module.ai_engine.cosine_similarity import calculate_pairwise_similarity

        # Build candidate profile text from primary resume + skills
        profile_parts = []

        resume = db.query(Resume).filter(
            Resume.user_id == user.id,
            Resume.is_primary.is_(True),
        ).first()

        if resume and resume.parsed_text:
            profile_parts.append(resume.parsed_text)
        if user.skills:
            profile_parts.append(user.skills)

        profile_text = " ".join(profile_parts).strip()
        if not profile_text:
            return None  # No profile data — can't compute a meaningful score

        # Build job text
        job_text = " ".join(filter(None, [job.title, job.description, job.required_skills]))

        score = calculate_pairwise_similarity(profile_text, job_text)
        return int(round(score * 100))

    except Exception:
        return None  # Never fail an application because of AI scoring


class ApplicationService:

    @staticmethod
    def apply_job(db: Session, data, current_user: User) -> Application:
        job = db.query(Job).filter(Job.id == data.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.status != "open":
            raise HTTPException(status_code=400, detail="This job is no longer accepting applications")

        # Calculate AI match score at apply time
        match_score = _compute_match_score(db, current_user, job)

        application = Application(
            user_id=current_user.id,
            job_id=data.job_id,
            resume_id=data.resume_id,
            status="pending",
            match_score=match_score,
        )
        db.add(application)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="You have already applied to this job")
        db.refresh(application)
        return application

    @staticmethod
    def get_my_applications(db: Session, current_user: User):
        return db.query(Application).filter(Application.user_id == current_user.id)\
                 .order_by(Application.applied_at.desc()).all()

    @staticmethod
    def get_applications_for_job(db: Session, job_id: int, current_user: User):
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        ApplicationService._assert_job_owner(db, job, current_user)

        applications = db.query(Application).filter(Application.job_id == job_id)\
                         .order_by(Application.match_score.desc().nullslast()).all()

        result = []
        for app in applications:
            applicant = db.query(User).filter(User.id == app.user_id).first()
            result.append({
                "id": app.id,
                "user_id": app.user_id,
                "job_id": app.job_id,
                "resume_id": app.resume_id,
                "status": app.status,
                "match_score": app.match_score,
                "applied_at": app.applied_at,
                "applicant_name": applicant.name if applicant else "Unknown",
                "applicant_email": applicant.email if applicant else "Unknown",
            })
        return result

    @staticmethod
    def update_status(db: Session, application_id: int, new_status: str,
                      current_user: User) -> Application:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        job = db.query(Job).filter(Job.id == app.job_id).first()
        ApplicationService._assert_job_owner(db, job, current_user)
        valid = {"pending", "reviewed", "shortlisted", "rejected", "hired"}
        if new_status not in valid:
            raise HTTPException(status_code=400, detail="Invalid status value")
        app.status = new_status
        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def _assert_job_owner(db: Session, job: Job, current_user: User):
        if current_user.role == "admin":
            return
        company = db.query(Company).filter(Company.id == job.company_id).first()
        if not company or company.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="You do not have permission to view these applications")


class SavedJobService:

    @staticmethod
    def save_job(db: Session, job_id: int, current_user: User) -> SavedJob:
        if not db.query(Job).filter(Job.id == job_id).first():
            raise HTTPException(status_code=404, detail="Job not found")
        saved = SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(saved)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Job already saved")
        db.refresh(saved)
        return saved

    @staticmethod
    def unsave_job(db: Session, job_id: int, current_user: User):
        saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id, SavedJob.job_id == job_id
        ).first()
        if not saved:
            raise HTTPException(status_code=404, detail="Saved job not found")
        db.delete(saved)
        db.commit()
        return {"message": "Job removed from saved list"}

    @staticmethod
    def get_saved_jobs(db: Session, current_user: User):
        return db.query(SavedJob).filter(SavedJob.user_id == current_user.id)\
                 .order_by(SavedJob.saved_at.desc()).all()
