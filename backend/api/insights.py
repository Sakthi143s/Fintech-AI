from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, Income, Budget, Expense, Investment
from schemas import InsightItem, HealthScore, AdvisorRequest, AdvisorResponse
from api.auth import get_current_user
from services.financial_engine.core import generate_insights, generate_advisor_plan, generate_intelligence_summary
from services.financial_engine.financial_score import calculate_health_score
from services.ml_engine import ml_service
from services.subscription_engine import SubscriptionEngine

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("/health-score")
def get_health_score(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    income_rec = db.query(Income).filter(Income.user_id == user.id, Income.month == month).first()
    income = income_rec.amount if income_rec else 0

    total_spent = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == month)
        .scalar() or 0
    )

    total_invested = (
        db.query(func.sum(Investment.monthly_amount))
        .filter(Investment.user_id == user.id)
        .scalar() or 0
    )

    total_savings = max(0, income - total_spent)

    result = calculate_health_score(
        income=income,
        total_spent=total_spent,
        total_savings=total_savings,
        total_invested=total_invested,
    )
    return result


@router.get("/recommendations")
def get_recommendations(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    income_rec = db.query(Income).filter(Income.user_id == user.id, Income.month == month).first()
    income = income_rec.amount if income_rec else 0

    # Category spending
    expenses = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == month)
        .group_by(Expense.category)
        .all()
    )
    category_spending = [{"category": cat, "spent": total} for cat, total in expenses]

    # Budgets
    budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == month).all()
    budget_list = [{"category": b.category, "allocated_amount": b.allocated_amount} for b in budgets]

    total_spent = sum(cs["spent"] for cs in category_spending)
    savings_rate = ((income - total_spent) / income * 100) if income > 0 else 0

    insights = generate_insights(
        income=income,
        category_spending=category_spending,
        budgets=budget_list,
        savings_rate=savings_rate,
    )
    return insights


@router.get("/dashboard-summary")
def dashboard_summary(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Single endpoint returning all dashboard data for a month."""
    income_rec = db.query(Income).filter(Income.user_id == user.id, Income.month == month).first()
    income = income_rec.amount if income_rec else 0

    # Category spending
    expenses = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == month)
        .group_by(Expense.category)
        .all()
    )
    category_spending = [{"category": cat, "spent": round(total, 2)} for cat, total in expenses]

    # Budgets
    budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == month).all()
    budget_list = [
        {"category": b.category, "percentage": b.percentage, "allocated": round(b.allocated_amount, 2)}
        for b in budgets
    ]

    total_spent = sum(cs["spent"] for cs in category_spending)
    total_allocated = sum(b["allocated"] for b in budget_list)
    remaining = income - total_spent
    savings_rate = ((remaining) / income * 100) if income > 0 else 0

    # ML Behavior Clustering
    needs_ratio = 0.5
    lifestyle_ratio = 0.3
    # Approximate ratio calculations for the ML cluster
    if income > 0 and category_spending:
        needs_spent = sum(cs["spent"] for cs in category_spending if cs["category"] in ["Housing", "Food", "Transport", "Bills", "Groceries"])
        lifestyle_spent = sum(cs["spent"] for cs in category_spending if cs["category"] not in ["Housing", "Food", "Transport", "Bills", "Groceries"])
        needs_ratio = needs_spent / income
        lifestyle_ratio = lifestyle_spent / income

    user_metrics = {
        "savings_rate": max(0, remaining / income) if income > 0 else 0,
        "needs_ratio": needs_ratio,
        "lifestyle_ratio": lifestyle_ratio
    }
    behavior_cluster = ml_service.cluster_user_behavior(user_metrics)

    # Last 6 months trend
    trend = []
    from datetime import datetime
    try:
        year, mo = map(int, month.split("-"))
        for i in range(5, -1, -1):
            m = mo - i
            y = year
            while m <= 0:
                m += 12
                y -= 1
            m_str = f"{y}-{m:02d}"
            m_spent = (
                db.query(func.sum(Expense.amount))
                .filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == m_str)
                .scalar() or 0
            )
            m_income_rec = db.query(Income).filter(Income.user_id == user.id, Income.month == m_str).first()
            m_income = m_income_rec.amount if m_income_rec else 0
            trend.append({"month": m_str, "income": m_income, "spent": round(m_spent, 2)})
    except Exception:
        pass

    return {
        "income": income,
        "total_spent": round(total_spent, 2),
        "total_allocated": round(total_allocated, 2),
        "remaining": round(remaining, 2),
        "savings_rate": round(savings_rate, 1),
        "behavior_cluster": behavior_cluster,
        "category_spending": category_spending,
        "budgets": budget_list,
        "trend": trend,
    }


@router.post("/advisor", response_model=AdvisorResponse)
def get_advisor_plan(data: AdvisorRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Generates a personalized AI financial plan based on user inputs."""
    from datetime import datetime, timedelta
    
    # 1. Calculate balances and dates
    current_date = datetime.now()
    current_month_str = current_date.strftime("%Y-%m")
    prev_month_date = current_date.replace(day=1) - timedelta(days=1)
    prev_month_str = prev_month_date.strftime("%Y-%m")
    
    # Get all incomes/expenses for balance
    total_lifetime_income = db.query(func.sum(Income.amount)).filter(Income.user_id == user.id).scalar() or 0
    total_lifetime_expense = db.query(func.sum(Expense.amount)).filter(Expense.user_id == user.id).scalar() or 0
    current_balance = total_lifetime_income - total_lifetime_expense
    
    # 2. Get Current & Previous Month Expenses
    curr_expenses = db.query(Expense).filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == current_month_str).all()
    prev_expenses = db.query(Expense).filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == prev_month_str).all()
    
    curr_exp_dicts = [{"amount": e.amount, "category": e.category, "description": e.description, "date": e.date} for e in curr_expenses]
    prev_exp_dicts = [{"amount": e.amount, "category": e.category, "description": e.description, "date": e.date} for e in prev_expenses]

    result = generate_advisor_plan(
        income=data.income,
        role=data.role,
        lifestyle=data.lifestyle,
        living_situation=data.living_situation,
        risk_tolerance=data.risk_tolerance,
        current_month_expenses=curr_exp_dicts,
        previous_month_expenses=prev_exp_dicts,
        current_balance=current_balance
    )
    return result

from schemas import IntelligenceSummary

@router.get("/engine", response_model=IntelligenceSummary)
def get_intelligence_engine(month: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timedelta
    
    # 1. Income & Balances
    income_rec = db.query(Income).filter(Income.user_id == user.id, Income.month == month).first()
    income = income_rec.amount if income_rec else 0
    
    total_lifetime_income = db.query(func.sum(Income.amount)).filter(Income.user_id == user.id).scalar() or 0
    total_lifetime_expense = db.query(func.sum(Expense.amount)).filter(Expense.user_id == user.id).scalar() or 0
    current_balance = total_lifetime_income - total_lifetime_expense
    
    # Calculate approx total savings as sum(incomes) - sum(expenses)
    total_savings = current_balance if current_balance > 0 else 0
    
    # 2. Get Expenses for the month and previous month
    curr_expenses = db.query(Expense).filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == month).all()
    
    try:
        y, m = map(int, month.split("-"))
        if m == 1:
            prev_m_str = f"{y-1}-12"
        else:
            prev_m_str = f"{y}-{m-1:02d}"
    except:
        prev_m_str = month # Fallback
        
    prev_expenses = db.query(Expense).filter(Expense.user_id == user.id, func.strftime("%Y-%m", Expense.date) == prev_m_str).all()
    
    curr_exp_dicts = [{"amount": e.amount, "category": e.category, "description": e.description, "date": e.date} for e in curr_expenses]
    prev_exp_dicts = [{"amount": e.amount, "category": e.category, "description": e.description, "date": e.date} for e in prev_expenses]
    
    # 3. Get Subscriptions
    current_date = datetime.now()
    six_months_ago = current_date - timedelta(days=180)
    recent_expenses = db.query(Expense).filter(Expense.user_id == user.id, Expense.date >= six_months_ago.date()).all()
    tx_dicts = [{"date": e.date, "amount": e.amount, "description": e.description} for e in recent_expenses]
    subscriptions = SubscriptionEngine.detect_subscriptions(tx_dicts)
    
    summary = generate_intelligence_summary(
        income=income,
        current_balance=current_balance,
        current_month_expenses=curr_exp_dicts,
        previous_month_expenses=prev_exp_dicts,
        subscriptions=subscriptions,
        total_savings=total_savings
    )
    return summary

@router.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Detects subscriptions from the user's past 6 months of expenses."""
    from datetime import datetime, timedelta
    
    # Get last 6 months of expenses
    six_months_ago = datetime.now() - timedelta(days=180)
    expenses = db.query(Expense).filter(Expense.user_id == user.id, Expense.date >= six_months_ago.date()).all()
    
    tx_dicts = [
        {"date": e.date, "amount": e.amount, "description": e.description}
        for e in expenses
    ]
    
    subscriptions = SubscriptionEngine.detect_subscriptions(tx_dicts)
    return subscriptions

