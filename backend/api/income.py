from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Income
from schemas import IncomeCreate, IncomeOut
from api.auth import get_current_user

router = APIRouter(prefix="/api/income", tags=["Income"])


@router.post("/", response_model=IncomeOut)
def create_income(data: IncomeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Check if income already exists for this month — update if so
    existing = db.query(Income).filter(Income.user_id == user.id, Income.month == data.month).first()
    if existing:
        existing.amount = data.amount
        existing.source = data.source
        db.commit()
        db.refresh(existing)
        return existing

    income = Income(user_id=user.id, amount=data.amount, month=data.month, source=data.source)
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.get("/", response_model=List[IncomeOut])
def list_incomes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Income).filter(Income.user_id == user.id).order_by(Income.month.desc()).all()


@router.get("/{month}", response_model=IncomeOut)
def get_income_by_month(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.user_id == user.id, Income.month == month).first()
    if not income:
        raise HTTPException(status_code=404, detail="No income record for this month")
    return income


@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
    return {"detail": "Deleted"}
