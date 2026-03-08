from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Budget, Income
from schemas import BudgetCreate, BudgetOut
from api.auth import get_current_user

router = APIRouter(prefix="/api/budget", tags=["Budget"])


@router.post("/", response_model=BudgetOut)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Get income for the month to calculate allocated amount
    income = db.query(Income).filter(Income.user_id == user.id, Income.month == data.month).first()
    if not income:
        raise HTTPException(status_code=400, detail="Please set income for this month first")
    allocated_amount = income.amount * data.percentage / 100.0

    # Ensure total percentage doesn't exceed 100%
    existing_budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == data.month).all()
    current_total = sum(b.percentage for b in existing_budgets if b.category != data.category)
    
    if current_total + data.percentage > 100.0:
        raise HTTPException(
            status_code=400, 
            detail=f"Budget allocations cannot exceed 100%. You only have {100.0 - current_total:.1f}% remaining to allocate this month."
        )

    # Check if category budget exists for this month — update if so
    existing = db.query(Budget).filter(
        Budget.user_id == user.id, Budget.category == data.category, Budget.month == data.month
    ).first()
    if existing:
        existing.percentage = data.percentage
        existing.allocated_amount = allocated_amount
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(
        user_id=user.id,
        category=data.category,
        percentage=data.percentage,
        allocated_amount=allocated_amount,
        month=data.month,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=List[BudgetOut])
def list_budgets(month: str = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Budget).filter(Budget.user_id == user.id)
    if month:
        query = query.filter(Budget.month == month)
    return query.order_by(Budget.month.desc()).all()


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"detail": "Deleted"}
