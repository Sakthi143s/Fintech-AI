from typing import List, Dict

def calculate_health_score(
    income: float,
    total_spent: float,
    total_savings: float,
    total_invested: float,
    debt: float = 0,
) -> dict:
    """
    Financial health score 0-100 based on:
      - Savings rate (30 pts)
      - Expense control (25 pts)
      - Debt ratio (25 pts)
      - Investment habit (20 pts)
    """
    if income <= 0:
        return {"score": 0, "grade": "N/A", "breakdown": {}}

    # Savings rate score (0-30)
    savings_rate = total_savings / income
    savings_score = min(30, int(savings_rate * 150))  # 20%+ savings → full score

    # Expense control score (0-25)
    spending_ratio = total_spent / income
    if spending_ratio <= 0.5:
        spending_score = 25
    elif spending_ratio <= 0.7:
        spending_score = 20
    elif spending_ratio <= 0.85:
        spending_score = 15
    elif spending_ratio <= 1.0:
        spending_score = 5
    else:
        spending_score = 0

    # Investment activity score (0-20)
    investment_ratio = total_invested / income if income > 0 else 0
    investment_score = min(20, int(investment_ratio * 100))  # 20%+ → full score

    # Debt ratio score (0-25)
    debt_ratio = debt / income if income > 0 else 0
    if debt_ratio == 0:
        debt_score = 25
    elif debt_ratio <= 0.2:
        debt_score = 15
    elif debt_ratio <= 0.4:
        debt_score = 10
    else:
        debt_score = max(0, 25 - int(debt_ratio * 50))

    total = savings_score + spending_score + investment_score + debt_score

    if total >= 80:
        grade = "A"
    elif total >= 65:
        grade = "B"
    elif total >= 50:
        grade = "C"
    elif total >= 35:
        grade = "D"
    else:
        grade = "F"

    return {
        "score": total,
        "grade": grade,
        "breakdown": {
            "savings_rate": {"score": savings_score, "max": 30, "value": round(savings_rate * 100, 1)},
            "spending_control": {"score": spending_score, "max": 25, "value": round(spending_ratio * 100, 1)},
            "investment_activity": {"score": investment_score, "max": 20, "value": round(investment_ratio * 100, 1)},
            "debt_management": {"score": debt_score, "max": 25, "value": round(debt_ratio * 100, 1)},
        },
    }

def analyze_emergency_fund_risk(total_spent_current: float, total_savings: float) -> str:
    if total_spent_current > 0:
        ef_months = total_savings / total_spent_current
    else:
        ef_months = 0
    
    if ef_months >= 4:
        return f"Your emergency fund safely covers {ef_months:.1f} months of expenses. Great job building a secure buffer! (Green)"
    elif ef_months >= 2:
        return f"Your emergency fund covers {ef_months:.1f} months of expenses. Try to push it to 4+ months for ultimate safety. (Yellow)"
    else:
        return f"Your emergency fund currently covers {ef_months:.1f} months of expenses. Increasing it gradually could improve financial security. (Red)"
