from typing import List, Dict
import math

def determine_spending_personality(income: float, total_spent_current: float) -> str:
    actual_savings_rate = 0
    if income > 0:
        actual_savings_rate = ((income - total_spent_current) / income) * 100
    
    if actual_savings_rate >= 30:
        return "Your spending behavior resembles a Saver. You maintain excellent financial discipline."
    elif actual_savings_rate >= 10:
        return "Your spending behavior resembles a Balanced Planner. You maintain stable spending with moderate savings."
    else:
        return "Your spending behavior resembles a Lifestyle Spender. You allocate significant funds to discretionary categories."

def recommend_budget(income: float) -> List[Dict]:
    needs_pct, lifestyle_pct, savings_pct = 50.0, 30.0, 20.0
    
    if income > 0:
        needs_amt = (needs_pct / 100) * income
        lifestyle_amt = (lifestyle_pct / 100) * income
        savings_amt = (savings_pct / 100) * income
    else:
        needs_amt, lifestyle_amt, savings_amt = 0, 0, 0

    return [
        {"category": "Needs", "percentage": needs_pct, "amount": needs_amt, "suggestion": "Essential housing, utilities, groceries"},
        {"category": "Lifestyle", "percentage": lifestyle_pct, "amount": lifestyle_amt, "suggestion": "Dining out, entertainment, hobbies"},
        {"category": "Savings", "percentage": savings_pct, "amount": savings_amt, "suggestion": "Emergency fund and long term investments"},
    ]

def analyze_investment_potential(income: float, total_spent_current: float) -> str:
    if income > total_spent_current:
        monthly_saving = income - total_spent_current
        # Calculate 10 year compound at 12%
        rate = 0.12
        months = 120
        fv = monthly_saving * ((math.pow(1 + rate / 12, months) - 1) / (rate / 12)) * (1 + rate / 12)
        return f"You saved ₹{monthly_saving:,.0f} this month. Investing this amount monthly at 12% return could grow to ₹{fv:,.0f} in 10 years."
    else:
        return "Focus on reducing spending to increase available funds for investment growth."
