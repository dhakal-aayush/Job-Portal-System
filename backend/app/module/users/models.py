from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('job_seeker', 'employer', 'admin')",
            name="ck_users_role_valid",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String(50), nullable=False, default="job_seeker")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Job-seeker specific profile fields
    skills = Column(String(1000), nullable=True)  # comma-separated; see resumes module for parsed version
    experience_years = Column(Integer, nullable=True, default=0)

    # Relationships
    company = relationship(
        "Company", back_populates="owner", uselist=False,
        cascade="all, delete-orphan", passive_deletes=True,
    )
    resumes = relationship(
        "Resume", back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    applications = relationship(
        "Application", back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    saved_jobs = relationship(
        "SavedJob", back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True,
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index("ix_refresh_tokens_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    __table_args__ = (
        Index("ix_password_reset_tokens_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
