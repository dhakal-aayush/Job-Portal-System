from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserSelfUpdate(BaseModel):
    """Fields a user may update on their own profile."""
    name: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    skills: Optional[str] = None
    experience_years: Optional[int] = None

    class Config:
        from_attributes = True
