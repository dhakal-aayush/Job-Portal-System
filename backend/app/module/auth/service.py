from datetime import datetime, timezone

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.module.users.models import User, RefreshToken, PasswordResetToken
from app.module.companies.models import Company

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_refresh_token,
    refresh_token_expiry,
    generate_password_reset_token,
    hash_password_reset_token,
    password_reset_token_expiry,
)

from app.module.auth.schemas import SignupSchema


class AuthService:

    # =========================
    # REGISTER USER
    # =========================
    @staticmethod
    def register_user(db: Session, data: SignupSchema):
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Employers must provide a company name; reject early with a clear message
        if data.role == "employer" and not data.company_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company name is required for employer accounts",
            )

        hashed_password = get_password_hash(data.password)

        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role=data.role.value if hasattr(data.role, "value") else data.role,
            is_active=True,
        )

        db.add(new_user)

        try:
            db.flush()  # assigns new_user.id without committing yet

            if new_user.role == "employer":
                company = Company(
                    user_id=new_user.id,
                    company_name=data.company_name,
                    email=data.email,
                    website=data.company_website,
                    location=data.company_location,
                    description=data.company_description,
                )
                db.add(company)

            db.commit()
            db.refresh(new_user)

        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create account due to a database error",
            )

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
            },
        }

    # =========================
    # LOGIN USER
    # =========================
    @staticmethod
    def login_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()

        # Generic message avoids leaking whether the email exists.
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )

        return AuthService._issue_tokens(db, user)

    # =========================
    # REFRESH ACCESS TOKEN
    # =========================
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str):
        token_hash = hash_refresh_token(refresh_token)

        stored = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )

        if not stored or stored.revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired",
            )

        user = db.query(User).filter(User.id == stored.user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        # Rotate: revoke old, issue new pair
        stored.revoked = True
        db.commit()

        return AuthService._issue_tokens(db, user)

    # =========================
    # LOGOUT (REVOKE REFRESH TOKEN)
    # =========================
    @staticmethod
    def logout(db: Session, refresh_token: str | None):
        if refresh_token:
            token_hash = hash_refresh_token(refresh_token)
            stored = (
                db.query(RefreshToken)
                .filter(RefreshToken.token_hash == token_hash)
                .first()
            )
            if stored:
                stored.revoked = True
                db.commit()

        return {"message": "Logged out successfully"}

    # =========================
    # PROFILE
    # =========================
    @staticmethod
    def get_profile(current_user: User):
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
        }

    # =========================
    # FORGOT PASSWORD (issue reset token)
    # =========================
    @staticmethod
    def forgot_password(db: Session, email: str):
        user = db.query(User).filter(User.email == email).first()

        # Always return a generic success message, even if the email
        # doesn't exist, to avoid leaking which emails are registered.
        generic_response = {
            "message": "If an account with that email exists, a password reset link has been sent."
        }

        if not user:
            return generic_response

        raw_token = generate_password_reset_token()
        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_password_reset_token(raw_token),
            expires_at=password_reset_token_expiry(),
        )
        db.add(reset_record)
        db.commit()

        # In production this token would be emailed to the user via an
        # email service rather than returned in the API response.
        # It is included here for development/testing convenience.
        response = dict(generic_response)
        if settings.DEBUG:
            response["dev_reset_token"] = raw_token

        return response

    # =========================
    # RESET PASSWORD
    # =========================
    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        token_hash = hash_password_reset_token(token)

        record = (
            db.query(PasswordResetToken)
            .filter(PasswordResetToken.token_hash == token_hash)
            .first()
        )

        if not record or record.used:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Reset token has expired")

        user = db.query(User).filter(User.id == record.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.password_hash = get_password_hash(new_password)
        record.used = True

        # Revoke all existing refresh tokens for security after password change
        db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"revoked": True})

        db.commit()

        return {"message": "Password has been reset successfully"}

    # =========================
    # INTERNAL: issue access + refresh token pair
    # =========================
    @staticmethod
    def _issue_tokens(db: Session, user: User) -> dict:
        payload = {"sub": user.email, "user_id": user.id, "role": user.role}
        access_token = create_access_token(payload)

        raw_refresh = generate_refresh_token()
        refresh_record = RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh),
            expires_at=refresh_token_expiry(),
        )
        db.add(refresh_record)
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
            },
        }
