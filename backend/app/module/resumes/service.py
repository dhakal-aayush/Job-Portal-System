import os
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.module.resumes.models import Resume
from app.module.users.models import User
from app.module.ai_engine.skill_extraction import extract_skills

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}


def _extract_text_from_pdf(path: str) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""

    try:
        reader = PdfReader(path)
        return " ".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return ""


class ResumeService:

    @staticmethod
    def upload_resume(db: Session, file: UploadFile, current_user: User) -> Resume:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF, DOC, and DOCX files are supported",
            )

        upload_dir = settings.RESUME_UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)

        # Use a UUID filename to avoid collisions and path traversal issues
        # from user-supplied filenames.
        stored_filename = f"{uuid.uuid4().hex}{ext}"
        stored_path = os.path.join(upload_dir, stored_filename)

        contents = file.file.read()

        max_bytes = settings.MAX_RESUME_SIZE_MB * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Resume must be smaller than {settings.MAX_RESUME_SIZE_MB}MB",
            )

        with open(stored_path, "wb") as f:
            f.write(contents)

        parsed_text = ""
        if ext == ".pdf":
            parsed_text = _extract_text_from_pdf(stored_path)

        extracted_skills = extract_skills(parsed_text)

        # New upload becomes primary; demote any existing primary resume
        db.query(Resume).filter(
            Resume.user_id == current_user.id, Resume.is_primary.is_(True)
        ).update({"is_primary": False})

        resume = Resume(
            user_id=current_user.id,
            file_name=file.filename,
            file_path=stored_path,
            parsed_text=parsed_text or None,
            extracted_skills=", ".join(extracted_skills) or None,
            is_primary=True,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def get_my_resumes(db: Session, current_user: User):
        return (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.uploaded_at.desc())
            .all()
        )

    @staticmethod
    def delete_resume(db: Session, resume_id: int, current_user: User):
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        if resume.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="You cannot delete this resume")

        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)

        db.delete(resume)
        db.commit()
        return {"message": "Resume deleted"}
