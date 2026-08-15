from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    # Extracted text used for TF-IDF / cosine similarity matching.
    parsed_text = Column(Text, nullable=True)
    extracted_skills = Column(String(1000), nullable=True)  # comma-separated

    is_primary = Column(Boolean, default=True, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
