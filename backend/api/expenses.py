from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import User, Expense, Budget
from schemas import ExpenseCreate, ExpenseOut
from api.auth import get_current_user
from services.ml_engine import ml_service

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseOut)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Auto-categorize via ML if category is missing or set to 'Auto'
    category = data.category
    if not category or category.lower() == "auto":
        category = ml_service.predict_category(data.description)
        
    expense = Expense(
        user_id=user.id,
        category=category,
        amount=data.amount,
        date=data.date,
        description=data.description,
        source=data.source,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    # We must return it with `is_anomaly` which defaults to False initially
    return expense


@router.get("/", response_model=List[ExpenseOut])
def list_expenses(month: str = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Expense).filter(Expense.user_id == user.id)
    if month:
        query = query.filter(func.strftime("%Y-%m", Expense.date) == month)
        
    records = query.order_by(Expense.date.desc()).all()
    
    # Process through ML Anomaly Detection using Isolation Forest
    expense_dicts = [
        {"id": r.id, "category": r.category, "amount": r.amount, "date": r.date, "description": r.description, "source": r.source} 
        for r in records
    ]
    
    analyzed_expenses = ml_service.detect_anomalies(expense_dicts)
    return analyzed_expenses


@router.get("/summary")
def expense_summary(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get per-category spending summary with remaining budget for a month."""
    expenses = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == month)
        .group_by(Expense.category)
        .all()
    )
    budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == month).all()
    budget_map = {b.category: b.allocated_amount for b in budgets}

    summary = []
    total_spent = 0
    for cat, spent in expenses:
        allocated = budget_map.get(cat, 0)
        remaining = allocated - spent
        summary.append({
            "category": cat,
            "spent": round(spent, 2),
            "allocated": round(allocated, 2),
            "remaining": round(remaining, 2),
            "over_budget": remaining < 0,
        })
        total_spent += spent

    total_allocated = sum(budget_map.values())
    return {
        "month": month,
        "categories": summary,
        "total_spent": round(total_spent, 2),
        "total_allocated": round(total_allocated, 2),
        "total_remaining": round(total_allocated - total_spent, 2),
    }


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"detail": "Deleted"}
