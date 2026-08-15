"""
One-off script to backfill match_score for existing applications that have null scores.
Run from inside backend/ with venv active:
    python backfill_scores.py
"""
from app.core.database import SessionLocal
from app.module.applications.models import Application
from app.module.jobs.models import Job
from app.module.users.models import User
from app.module.resumes.models import Resume
from app.module.ai_engine.cosine_similarity import calculate_pairwise_similarity


def backfill():
    db = SessionLocal()
    try:
        # Get all applications with no score
        apps = db.query(Application).filter(Application.match_score.is_(None)).all()
        print(f"Found {len(apps)} applications with no match score")

        updated = 0
        for app in apps:
            user = db.query(User).filter(User.id == app.user_id).first()
            job = db.query(Job).filter(Job.id == app.job_id).first()

            if not user or not job:
                continue

            # Build profile text
            profile_parts = []
            resume = db.query(Resume).filter(
                Resume.user_id == user.id, Resume.is_primary.is_(True)
            ).first()
            if resume and resume.parsed_text:
                profile_parts.append(resume.parsed_text)
            if user.skills:
                profile_parts.append(user.skills)

            profile_text = " ".join(profile_parts).strip()
            if not profile_text:
                print(f"  Skipping app #{app.id} — user {user.email} has no profile text")
                continue

            # Build job text
            job_text = " ".join(filter(None, [job.title, job.description, job.required_skills]))

            score = int(round(calculate_pairwise_similarity(profile_text, job_text) * 100))
            app.match_score = score
            updated += 1
            print(f"  App #{app.id} — {user.email} → {job.title}: {score}%")

        db.commit()
        print(f"\nDone. Updated {updated}/{len(apps)} applications.")

    finally:
        db.close()


if __name__ == "__main__":
    backfill()
