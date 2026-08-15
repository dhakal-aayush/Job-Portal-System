from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.module.ai_engine.skill_extraction import extract_skills
from app.module.ai_engine.cosine_similarity import calculate_pairwise_similarity
from app.module.ai_engine.knn_recommendation import recommend_top_k

from app.module.jobs.models import Job
from app.module.companies.models import Company
from app.module.resumes.models import Resume
from app.module.applications.models import Application
from app.module.users.models import User


# =========================
# JOB TEXT BUILDER
# =========================

def _job_corpus_text(job: Job) -> str:
    parts = [
        job.title or "",
        job.description or "",
        job.required_skills or ""
    ]

    return " ".join(
        item for item in parts if item
    )


class AIService:


    # =========================
    # RESUME SKILL EXTRACTION
    # =========================

    @staticmethod
    def get_resume_skills(resume_text: str):

        return {
            "skills": extract_skills(resume_text)
        }



    # =========================
    # RESUME VS JOB MATCH SCORE
    # =========================

    @staticmethod
    def match_resume_to_job(
            db: Session,
            resume_text: str,
            job_id: int
    ):

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found"
            )


        job_text = _job_corpus_text(job)


        score = calculate_pairwise_similarity(
            resume_text,
            job_text
        )


        return {

            "job_id": job.id,

            "skills":
                extract_skills(resume_text),

            "match_score":
                round(score * 100, 2)

        }



    # =========================
    # JOB RECOMMENDATION
    # =========================

    @staticmethod
    def recommend_jobs_for_user(
            db: Session,
            user: User,
            top_k: int = 5
    ):


        resume = (
            db.query(Resume)
            .filter(
                Resume.user_id == user.id,
                Resume.is_primary.is_(True)
            )
            .first()
        )


        profile = []


        if resume and resume.parsed_text:
            profile.append(
                resume.parsed_text
            )


        if user.skills:
            profile.append(
                user.skills
            )


        profile_text = " ".join(profile)



        applied_jobs = {

            row[0]

            for row in
            db.query(Application.job_id)
            .filter(
                Application.user_id == user.id
            )
            .all()

        }



        jobs = (
            db.query(Job)
            .filter(
                Job.status == "open"
            )
            .all()
        )



        jobs = [

            job

            for job in jobs

            if job.id not in applied_jobs

        ]



        if not profile_text or not jobs:

            return {
                "recommendations": []
            }



        corpus = [

            _job_corpus_text(job)

            for job in jobs

        ]



        results = recommend_top_k(
            profile_text,
            corpus,
            k=top_k
        )



        recommendations = []



        for item in results:

            job = jobs[item["index"]]


            company = (
                db.query(Company)
                .filter(
                    Company.id == job.company_id
                )
                .first()
            )


            recommendations.append({

                "job_id":
                    job.id,

                "title":
                    job.title,

                "company":
                    company.company_name
                    if company else "Unknown",

                "score":
                    round(
                        item["score"] * 100,
                        2
                    )

            })


        return {

            "recommendations":
                recommendations

        }




    # =========================
    # ADMIN ANALYTICS
    # =========================

    @staticmethod
    def get_recommendation_analytics(
            db: Session
    ):


        total_jobs = (
            db.query(Job)
            .count()
        )


        open_jobs = (
            db.query(Job)
            .filter(
                Job.status=="open"
            )
            .count()
        )


        total_applications = (
            db.query(Application)
            .count()
        )



        scored = (

            db.query(Application)

            .filter(
                Application.match_score != None
            )

            .all()

        )



        average_score = 0



        if scored:

            average_score = round(

                sum(
                    app.match_score
                    for app in scored
                )
                /
                len(scored),

                2

            )



        return {

            "total_jobs":
                total_jobs,

            "open_jobs":
                open_jobs,

            "total_applications":
                total_applications,

            "scored_applications":
                len(scored),

            "average_match_score":
                average_score

        }




    # =========================
    # RANK APPLICANTS FOR EMPLOYER
    # =========================

    @staticmethod
    def rank_candidates(
            db: Session,
            job_id: int,
            top_k: int = 10
    ):


        job = (
            db.query(Job)
            .filter(
                Job.id == job_id
            )
            .first()
        )


        if not job:

            raise HTTPException(
                status_code=404,
                detail="Job not found"
            )



        applications = (

            db.query(Application)

            .filter(
                Application.job_id == job_id
            )

            .all()

        )



        if not applications:

            return {

                "candidates": []

            }



        job_text = _job_corpus_text(job)



        resumes = []

        candidates = []



        for application in applications:


            resume = (

                db.query(Resume)

                .filter(
                    Resume.id ==
                    application.resume_id
                )

                .first()

            )


            user = (

                db.query(User)

                .filter(
                    User.id ==
                    application.user_id
                )

                .first()

            )


            resume_text = ""

            if resume and resume.parsed_text:

                resume_text = resume.parsed_text

            elif user and user.skills:

                resume_text = user.skills



            resumes.append(
                resume_text
            )


            candidates.append({

                "application":
                    application,

                "user_id":
                    application.user_id,

                "name":
                    user.name
                    if user else "Unknown",

                "resume_id":
                    resume.id
                    if resume else None

            })




        ranking = recommend_top_k(

            job_text,

            resumes,

            k=min(
                top_k,
                len(resumes)
            )

        )



        result = []



        for item in ranking:


            candidate = candidates[item["index"]]


            score = round(

                item["score"] * 100,

                2

            )


            candidate["application"].match_score = int(score)



            result.append({

                "user_id":
                    candidate["user_id"],

                "name":
                    candidate["name"],

                "resume_id":
                    candidate["resume_id"],

                "match_score":
                    score

            })



        db.commit()



        return {

            "candidates":
                result

        }