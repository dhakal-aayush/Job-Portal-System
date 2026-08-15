from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.module.companies.models import Company
from app.module.users.models import User


class CompanyService:

    @staticmethod
    def get_all_companies(db: Session):
        return db.query(Company).all()

    @staticmethod
    def get_company_by_id(db: Session, company_id: int) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company

    @staticmethod
    def get_my_company(db: Session, current_user: User) -> Company:
        company = db.query(Company).filter(Company.user_id == current_user.id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company profile not found")
        return company

    @staticmethod
    def update_company(db: Session, company_id: int, data, current_user: User) -> Company:
        company = CompanyService.get_company_by_id(db, company_id)

        if current_user.role != "admin" and company.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this company",
            )

        # exclude_unset ensures fields the client didn't send are left
        # untouched, while explicitly-sent empty strings DO update (fixing
        # the original truthy-check bug that prevented clearing fields).
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(company, field, value)

        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def delete_company(db: Session, company_id: int, current_user: User):
        company = CompanyService.get_company_by_id(db, company_id)

        if current_user.role != "admin" and company.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this company",
            )

        db.delete(company)
        db.commit()
        return {"message": "Company deleted successfully"}
