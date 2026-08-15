from pydantic import BaseModel, EmailStr
from typing import Optional


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    email: str
    website: Optional[str]
    location: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True
