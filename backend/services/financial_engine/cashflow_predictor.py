"""
Predictive models for estimating cash flow, detecting habits, and analyzing hidden spending.
"""
from datetime import datetime
from typing import List, Dict

def predict_cash_flow(current_month_expenses: List[Dict], current_balance: float) -> str:
    total_spent_current = sum(e.get("amount", 0) for e in current_month_expenses)
    days_in_month = datetime.now().day if datetime.now().day > 0 else 1
    avg_daily_spend = total_spent_current / days_in_month if days_in_month > 0 else 0
    days_left = 30 - days_in_month if (30 - days_in_month) > 0 else 1
    predicted_balance = current_balance - (avg_daily_spend * days_left)
    
    return f"At your current spending rate of ₹{avg_daily_spend:,.0f}/day, you may have approximately ₹{predicted_balance:,.0f} remaining before your next salary."

def analyze_habits(current_month_expenses: List[Dict]) -> str:
    desc_counts = {}
    for e in current_month_expenses:
        desc = str(e.get("description", "")).lower().strip()
        if desc:
            desc_counts[desc] = desc_counts.get(desc, 0) + 1
            
    habits = [(k, v) for k, v in desc_counts.items() if v >= 4]
    if habits:
        top_habit = max(habits, key=lambda x: x[1])
        return f"You purchased '{top_habit[0]}' {top_habit[1]} times this month. Reducing frequent small habits slightly could save money."
    return "No significant frequent purchasing habits detected this month."

def analyze_hidden_spending(current_month_expenses: List[Dict]) -> str:
    small_txs = [e for e in current_month_expenses if e.get("amount", 0) < 200]
    small_total = sum(e.get("amount", 0) for e in small_txs)
    return f"Small daily purchases under ₹200 totaled ₹{small_total:,.0f} this month across {len(small_txs)} transactions."
    
def generate_monthly_story(current_month_expenses: List[Dict], previous_month_expenses: List[Dict]) -> str:
    total_spent_current = sum(e.get("amount", 0) for e in current_month_expenses)
    total_spent_prev = sum(e.get("amount", 0) for e in previous_month_expenses)
    
    cat_spend = {}
    for e in current_month_expenses:
        cat_spend[e.get("category", "Other")] = cat_spend.get(e.get("category", "Other"), 0) + e.get("amount", 0)
    top_cat = max(cat_spend, key=cat_spend.get) if cat_spend else "None"
    top_cat_amt = cat_spend.get(top_cat, 0)
    
    pct_change = 0
    if total_spent_prev > 0:
        pct_change = ((total_spent_current - total_spent_prev) / total_spent_prev) * 100
        change_text = f"decreased by {abs(pct_change):.1f}%" if pct_change < 0 else f"increased by {pct_change:.1f}%"
    else:
        change_text = "remained comparable"
        
    return f"This month you spent ₹{total_spent_current:,.0f}. Your largest category was {top_cat} (₹{top_cat_amt:,.0f}). Compared to last month, your overall spending has {change_text}."
