from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    company_name = Column(String(200), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False)
    website = Column(String(255))
    location = Column(String(100))
    description = Column(Text)

    # Relationships
    owner = relationship("User", back_populates="company")
    jobs = relationship(
        "Job", back_populates="company",
        cascade="all, delete-orphan", passive_deletes=True,
    )
