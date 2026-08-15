from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.module.users.models import User
from app.core.security import get_password_hash


class UserService:

    @staticmethod
    def get_all_users(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def create_user(db: Session, data) -> User:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        user = User(
            name=data.name,
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=data.role,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user_id: int, data) -> User:
        user = UserService.get_user_by_id(db, user_id)

        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_own_profile(db: Session, current_user: User, data) -> User:
        """
        Self-service profile update. Excludes role/is_active -- those
        require admin privileges via update_user().
        """
        update_data = data.dict(exclude_unset=True, exclude={"role", "is_active"})
        for field, value in update_data.items():
            setattr(current_user, field, value)

        db.commit()
        db.refresh(current_user)
        return current_user

    @staticmethod
    def delete_user(db: Session, user_id: int):
        user = UserService.get_user_by_id(db, user_id)
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
