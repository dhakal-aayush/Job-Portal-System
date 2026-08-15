from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_title_location", "title", "location"),
    )

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills = Column(String(500), nullable=True)  # comma-separated, used by AI engine
    location = Column(String(100), index=True)
    salary = Column(String(50))
    job_type = Column(String(50))  # full_time, part_time, contract, internship, remote
    status = Column(String(20), default="open", nullable=False)  # open, closed

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    applications = relationship(
        "Application", back_populates="job",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    saved_by = relationship(
        "SavedJob", back_populates="job",
        cascade="all, delete-orphan", passive_deletes=True,
    )
