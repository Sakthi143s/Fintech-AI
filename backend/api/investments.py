import math
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Investment
from schemas import (
    InvestmentCreate, InvestmentOut,
    CompoundCalcRequest, CompoundCalcResponse,
    SIPCalcRequest, SIPCalcResponse,
)
from api.auth import get_current_user

router = APIRouter(prefix="/api/investments", tags=["Investments"])


@router.post("/", response_model=InvestmentOut)
def create_investment(data: InvestmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inv = Investment(
        user_id=user.id,
        type=data.type,
        monthly_amount=data.monthly_amount,
        expected_return=data.expected_return,
        duration_years=data.duration_years,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.get("/", response_model=List[InvestmentOut])
def list_investments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Investment).filter(Investment.user_id == user.id).all()


@router.delete("/{inv_id}")
def delete_investment(inv_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inv = db.query(Investment).filter(Investment.id == inv_id, Investment.user_id == user.id).first()
    if inv:
        db.delete(inv)
        db.commit()
    return {"detail": "Deleted"}


# ── Calculators (no auth required for quick use) ──────────
@router.post("/calc/compound", response_model=CompoundCalcResponse)
def compound_interest(data: CompoundCalcRequest):
    """A = P (1 + r/n)^(nt)"""
    r = data.rate / 100
    n = data.compounding_frequency
    t = data.years
    A = data.principal * math.pow(1 + r / n, n * t)
    total_invested = data.principal
    return CompoundCalcResponse(
        final_amount=round(A, 2),
        total_invested=round(total_invested, 2),
        total_interest=round(A - total_invested, 2),
    )


@router.post("/calc/sip", response_model=SIPCalcResponse)
def sip_calculator(data: SIPCalcRequest):
    """FV = P × ((1+r)^n − 1) / r × (1+r)"""
    monthly_rate = data.rate / 100 / 12
    months = data.years * 12
    if monthly_rate == 0:
        fv = data.monthly_amount * months
    else:
        fv = data.monthly_amount * ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * (1 + monthly_rate)
    total_invested = data.monthly_amount * months
    return SIPCalcResponse(
        future_value=round(fv, 2),
        total_invested=round(total_invested, 2),
        total_returns=round(fv - total_invested, 2),
    )
