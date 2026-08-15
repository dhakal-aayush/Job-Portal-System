from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_path: str
    extracted_skills: Optional[str]
    is_primary: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True
