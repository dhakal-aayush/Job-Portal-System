import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


# =========================
# PASSWORD HASHING
# =========================

_BCRYPT_MAX_BYTES = 72


def get_password_hash(password: str) -> str:
    password_bytes = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except ValueError:
        # Malformed hash (e.g. legacy/corrupt data) - treat as no match.
        return False


# =========================
# ACCESS TOKEN (JWT)
# =========================
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    })

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Decodes and validates an access token.
    Returns the payload dict, or None if invalid/expired/wrong type.
    Does NOT raise — callers decide how to respond.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        return None

    if payload.get("type") != "access":
        return None

    return payload


# =========================
# REFRESH TOKEN (OPAQUE, ROTATED, HASHED IN DB)
# =========================
def generate_refresh_token() -> str:
    """Cryptographically secure opaque refresh token (not a JWT)."""
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """Hash refresh token before DB storage. Plaintext is never stored."""
    return hashlib.sha256(token.encode()).hexdigest()


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)


# =========================
# PASSWORD RESET TOKEN (OPAQUE, HASHED IN DB, SHORT-LIVED)
# =========================
def generate_password_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_password_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def password_reset_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=1)