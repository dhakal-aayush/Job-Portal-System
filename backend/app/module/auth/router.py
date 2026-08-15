from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.module.auth.schemas import (
    SignupSchema,
    RefreshTokenRequest,
    ForgotPasswordSchema,
    ResetPasswordSchema,
)
from app.module.auth.service import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================
# SIGNUP
# =========================
@router.post("/signup", status_code=201)
def signup(user: SignupSchema, db: Session = Depends(get_db)):
    return AuthService.register_user(db, user)


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return AuthService.login_user(db, form_data.username, form_data.password)


# =========================
# REFRESH ACCESS TOKEN
# =========================
@router.post("/refresh")
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return AuthService.refresh_access_token(db, data.refresh_token)


# =========================
# PROFILE
# =========================
@router.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return AuthService.get_profile(current_user)


# =========================
# LOGOUT (revokes refresh token)
# =========================
@router.post("/logout")
def logout(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return AuthService.logout(db, data.refresh_token)


# =========================
# FORGOT PASSWORD
# =========================
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    return AuthService.forgot_password(db, data.email)


# =========================
# RESET PASSWORD
# =========================
@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    return AuthService.reset_password(db, data.token, data.new_password)
