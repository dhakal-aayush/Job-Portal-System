from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_employer

from app.module.companies.schemas import CompanyUpdate, CompanyResponse
from app.module.companies.service import CompanyService
from app.module.users.models import User

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/", response_model=list[CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return CompanyService.get_all_companies(db)


@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employer),
):
    return CompanyService.get_my_company(db, current_user)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    return CompanyService.get_company_by_id(db, company_id)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CompanyService.update_company(db, company_id, company, current_user)


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CompanyService.delete_company(db, company_id, current_user)
