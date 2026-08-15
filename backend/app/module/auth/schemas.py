from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from enum import Enum
import re


# =========================
# ROLE SYSTEM
# =========================
class RoleEnum(str, Enum):
    job_seeker = "job_seeker"
    employer = "employer"
    admin = "admin"


# =========================
# PASSWORD VALIDATION (shared)
# =========================
def _validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", v):
        raise ValueError("Password must contain at least one number")
    return v


# =========================
# SIGNUP SCHEMA
# =========================
class SignupSchema(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    role: RoleEnum = RoleEnum.job_seeker

    # Optional employer-only fields, used when role == employer
    company_name: Optional[str] = Field(default=None, max_length=200)
    company_website: Optional[str] = None
    company_location: Optional[str] = Field(default=None, max_length=100)
    company_description: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return _validate_password_strength(v)


# =========================
# LOGIN SCHEMA
# =========================
class LoginSchema(BaseModel):
    email: EmailStr
    password: str


# =========================
# PASSWORD RESET
# =========================
class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        return _validate_password_strength(v)


# =========================
# TOKEN REFRESH
# =========================
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# =========================
# RESPONSES
# =========================
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
