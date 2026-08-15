from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, get_current_active_user

from app.module.users.schemas import UserCreate, UserUpdate, UserSelfUpdate, UserResponse, UserProfileResponse
from app.module.users.service import UserService
from app.module.users.models import User

router = APIRouter(prefix="/users", tags=["Users"])


# =========================
# CURRENT USER: VIEW / UPDATE OWN PROFILE
# =========================
@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    data: UserSelfUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return UserService.update_own_profile(db, current_user, data)


# =========================
# ADMIN: LIST ALL USERS
# =========================
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return UserService.get_all_users(db)


# =========================
# ADMIN: GET USER BY ID
# =========================
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return UserService.get_user_by_id(db, user_id)


# =========================
# ADMIN: CREATE USER
# =========================
@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return UserService.create_user(db, user)


# =========================
# ADMIN: UPDATE USER (role, status, etc.)
# =========================
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return UserService.update_user(db, user_id, user)


# =========================
# ADMIN: DELETE USER
# =========================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return UserService.delete_user(db, user_id)
