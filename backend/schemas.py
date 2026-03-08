from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Income ────────────────────────────────────────────
class IncomeCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Income amount must be positive")
    month: str
    source: str = "Salary"


class IncomeOut(BaseModel):
    id: int
    amount: float
    month: str
    source: str

    class Config:
        from_attributes = True


# ── Budget ────────────────────────────────────────────
class BudgetCreate(BaseModel):
    category: str
    percentage: float = Field(..., gt=0, le=100, description="Percentage must be between 0 and 100")
    month: str


class BudgetOut(BaseModel):
    id: int
    category: str
    percentage: float
    allocated_amount: float
    month: str

    class Config:
        from_attributes = True


# ── Expense ───────────────────────────────────────────
class ExpenseCreate(BaseModel):
    category: str
    amount: float = Field(..., gt=0, description="Expense amount must be positive")
    date: date
    description: str = ""
    source: str = "manual"


class ExpenseOut(BaseModel):
    id: int
    category: str
    amount: float
    date: date
    description: str
    source: str
    is_anomaly: bool = False

    class Config:
        from_attributes = True


# ── Investment ────────────────────────────────────────
class InvestmentCreate(BaseModel):
    type: str
    monthly_amount: float
    expected_return: float
    duration_years: int


class InvestmentOut(BaseModel):
    id: int
    type: str
    monthly_amount: float
    expected_return: float
    duration_years: int

    class Config:
        from_attributes = True


# ── Investment Calculator ─────────────────────────────
class CompoundCalcRequest(BaseModel):
    principal: float
    rate: float  # annual % e.g. 12
    compounding_frequency: int = 12  # monthly
    years: int


class CompoundCalcResponse(BaseModel):
    final_amount: float
    total_invested: float
    total_interest: float


class SIPCalcRequest(BaseModel):
    monthly_amount: float
    rate: float  # annual %
    years: int


class SIPCalcResponse(BaseModel):
    future_value: float
    total_invested: float
    total_returns: float


# ── Insights ──────────────────────────────────────────
class InsightItem(BaseModel):
    type: str  # "warning", "tip", "info"
    title: str
    message: str


class HealthScore(BaseModel):
    score: int  # 0-100
    grade: str  # A, B, C, D, F
    breakdown: dict

class AdvisorRequest(BaseModel):
    income: float
    role: str            # student, working professional, freelancer, business owner
    lifestyle: str       # minimal, balanced, luxury
    living_situation: str # with parents, renting, hostel, own house
    financial_goals: str # saving, investing, buying assets, travel
    risk_tolerance: str  # low, moderate, high

class AllocationPlan(BaseModel):
    category: str
    percentage: float
    amount: float
    suggestion: str

class WealthEstimation(BaseModel):
    monthly_investment: float
    rate: float
    years: int
    future_value: float

class IntelligenceSummary(BaseModel):
    cash_flow_prediction: str
    subscription_summary: str
    habit_spending: str
    hidden_spending: str
    monthly_financial_story: str
    budget_intelligence: list[AllocationPlan]
    investment_insight: str
    emergency_fund_risk: str

class AdvisorResponse(BaseModel):
    analysis: str
    allocations: list[AllocationPlan]
    strategies: list[str]
    wealth_estimation: WealthEstimation
    friendly_advice: str
    
    # New Intelligence Layer
    cash_flow_prediction: str = ""
    health_score: dict = {}
    financial_story: str = ""
    spending_personality: str = ""
    emergency_fund_risk: str = ""
    subscription_summary: str = ""
    habit_spending: str = ""
    hidden_spending: str = ""
