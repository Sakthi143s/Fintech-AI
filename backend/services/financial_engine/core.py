from typing import List, Dict
import math
from datetime import datetime

from .cashflow_predictor import predict_cash_flow, analyze_habits, analyze_hidden_spending, generate_monthly_story
from .financial_score import calculate_health_score, analyze_emergency_fund_risk
from .behavior_nudge import determine_spending_personality, recommend_budget, analyze_investment_potential
from .subscription_analyzer import SubscriptionAnalyzer

def generate_insights(
    income: float,
    category_spending: List[Dict],
    budgets: List[Dict],
    savings_rate: float,
) -> List[dict]:
    """Generate actionable financial insights."""
    insights = []

    if income <= 0:
        return [{"type": "info", "title": "Set Your Income", "message": "Add your monthly income to get personalized insights."}]

    # Overspending alerts per category
    budget_map = {b["category"]: b for b in budgets}
    for cs in category_spending:
        cat = cs["category"]
        spent = cs["spent"]
        if cat in budget_map:
            allocated = budget_map[cat]["allocated_amount"]
            pct_used = (spent / allocated * 100) if allocated > 0 else 0
            income_pct = (spent / income * 100) if income > 0 else 0

            if spent > allocated:
                insights.append({
                    "type": "warning",
                    "title": f"Over Budget: {cat}",
                    "message": f"You spent ₹{spent:,.0f} on {cat} — that's ₹{spent - allocated:,.0f} over your ₹{allocated:,.0f} budget ({pct_used:.0f}% used).",
                })
            elif pct_used > 80:
                insights.append({
                    "type": "warning",
                    "title": f"Nearing Limit: {cat}",
                    "message": f"You've used {pct_used:.0f}% of your {cat} budget (₹{spent:,.0f} of ₹{allocated:,.0f}).",
                })

    # Savings insights
    if savings_rate < 10:
        insights.append({
            "type": "warning",
            "title": "Low Savings Rate",
            "message": f"Your savings rate is only {savings_rate:.1f}%. Financial experts recommend saving at least 20% of income.",
        })
    elif savings_rate >= 20:
        insights.append({
            "type": "tip",
            "title": "Great Savings!",
            "message": f"Your savings rate of {savings_rate:.1f}% is excellent! Consider investing the surplus for compound growth.",
        })

    # Investment suggestion
    monthly_savings = income * savings_rate / 100
    if monthly_savings > 0:
        rate = 0.12
        months = 120
        fv = monthly_savings * ((math.pow(1 + rate / 12, months) - 1) / (rate / 12)) * (1 + rate / 12)
        insights.append({
            "type": "tip",
            "title": "Investment Projection",
            "message": f"If you invest ₹{monthly_savings:,.0f}/month at 12% return, you could accumulate ₹{fv:,.0f} in 10 years!",
        })

    if not insights:
        insights.append({
            "type": "info",
            "title": "Looking Good!",
            "message": "Your finances are on track. Keep adding expenses to get more personalized insights.",
        })

    return insights

def generate_advisor_plan(
    income: float, 
    role: str, 
    lifestyle: str, 
    living_situation: str, 
    risk_tolerance: str,
    current_month_expenses: List[Dict] = None,
    previous_month_expenses: List[Dict] = None,
    current_balance: float = 0.0
) -> dict:
    current_month_expenses = current_month_expenses or []
    previous_month_expenses = previous_month_expenses or []

    # 1. Base Allocations
    needs_pct = 50.0
    lifestyle_pct = 30.0
    savings_pct = 10.0
    investments_pct = 10.0

    # Adjust based on living situation
    if living_situation.lower() == "with parents":
        needs_pct -= 20.0
        savings_pct += 10.0
        investments_pct += 10.0
    elif living_situation.lower() in ["renting", "hostel"]:
        needs_pct += 5.0
        lifestyle_pct -= 5.0
    elif living_situation.lower() == "own house":
        needs_pct -= 10.0
        investments_pct += 10.0

    # Adjust based on lifestyle
    if lifestyle.lower() == "minimal":
        lifestyle_pct -= 10.0
        savings_pct += 5.0
        investments_pct += 5.0
    elif lifestyle.lower() == "luxury":
        lifestyle_pct += 10.0
        savings_pct -= 5.0
        investments_pct -= 5.0

    # Adjust based on role
    if role.lower() == "student":
        needs_pct += 10.0
        investments_pct -= 5.0
        savings_pct -= 5.0

    # Normalize roughly to 100% just in case
    total_pct = needs_pct + lifestyle_pct + savings_pct + investments_pct
    needs_pct = (needs_pct / total_pct) * 100
    lifestyle_pct = (lifestyle_pct / total_pct) * 100
    savings_pct = (savings_pct / total_pct) * 100
    investments_pct = (investments_pct / total_pct) * 100

    allocations = [
        {"category": "Needs", "percentage": needs_pct, "amount": income * (needs_pct / 100), "suggestion": "Housing, groceries, utilities, and essential transport."},
        {"category": "Lifestyle", "percentage": lifestyle_pct, "amount": income * (lifestyle_pct / 100), "suggestion": "Dining out, entertainment, shopping, and hobbies."},
        {"category": "Savings", "percentage": savings_pct, "amount": income * (savings_pct / 100), "suggestion": "Emergency fund and short-term goals."},
        {"category": "Investments", "percentage": investments_pct, "amount": income * (investments_pct / 100), "suggestion": "Long-term wealth building (stocks, mutual funds, real estate)."}
    ]

    # 2. Risk Tolerance & Wealth Estimation
    if risk_tolerance.lower() == "low":
        rate = 6.0 # FDs, Bonds
        strat_focus = "focus heavily on fixed-income instruments like fixed deposits and government bonds for maximum security."
    elif risk_tolerance.lower() == "moderate":
        rate = 10.0 # Index funds, balanced mutual funds
        strat_focus = "build a diversified portfolio with a mix of index mutual funds and stable bonds to balance growth and security."
    else:
        rate = 14.0 # Equities, direct stocks, crypto
        strat_focus = "allocate a large portion of your investments to broad-market equity mutual funds or direct stocks to maximize growth over the long term."

    monthly_invest = income * (investments_pct / 100)
    monthly_rate = rate / 100 / 12
    years = 10
    months = years * 12
    
    if monthly_rate == 0 or monthly_invest <= 0:
        fv = monthly_invest * months
    else:
        fv = monthly_invest * ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * (1 + monthly_rate)

    wealth_estimation = {
        "monthly_investment": monthly_invest,
        "rate": rate,
        "years": years,
        "future_value": fv
    }

    # 3. Strategy & Advice Generation
    strategies = [
        f"Because you live {living_situation}, we've adjusted your 'Needs' budget to {needs_pct:.0f}%.",
        f"With a {risk_tolerance} risk tolerance, you should {strat_focus}"
    ]
    if lifestyle.lower() == "luxury":
        strategies.append("While enjoying a luxury lifestyle is great, try to ensure your high spending doesn't bleed into your investment capital.")

    analysis = f"As a {role} living {living_situation}, your financial foundation looks promising. You prefer a {lifestyle} lifestyle and have a {risk_tolerance} risk appetite."
    
    friendly_advice = f"Hey there! Based on what you've shared, I've crafted a plan perfectly suited for you. Since you're a {role}, it's crucial we balance your current {lifestyle} lifestyle with your long-term wealth building. I recommend focusing heavily on saving {savings_pct:.0f}% for now. If you stay consistent with your ₹{monthly_invest:,.0f} monthly investments, compound interest could grow your wealth to over ₹{fv:,.0f} in the next 10 years! Stick to the plan, enjoy life, and let your money work for you."

    # --- NEW INTELLIGENCE LAYER via Modules ---
    
    total_spent_current = sum(e.get("amount", 0) for e in current_month_expenses)
    
    cash_flow_prediction = predict_cash_flow(current_month_expenses, current_balance)

    health_score_data = calculate_health_score(
        income=income,
        total_spent=total_spent_current,
        total_savings=0, 
        total_invested=monthly_invest,
        debt=0
    )

    financial_story = generate_monthly_story(current_month_expenses, previous_month_expenses)
    spending_personality = determine_spending_personality(income, total_spent_current)

    return {
        "analysis": analysis,
        "allocations": allocations,
        "strategies": strategies,
        "wealth_estimation": wealth_estimation,
        "friendly_advice": friendly_advice,
        "cash_flow_prediction": cash_flow_prediction,
        "health_score": health_score_data,
        "financial_story": financial_story,
        "spending_personality": spending_personality
    }

def generate_intelligence_summary(
    income: float,
    current_balance: float,
    current_month_expenses: List[Dict],
    previous_month_expenses: List[Dict],
    subscriptions: List[Dict],
    total_savings: float
) -> dict:
    
    current_month_expenses = current_month_expenses or []
    previous_month_expenses = previous_month_expenses or []
    subscriptions = subscriptions or []
    
    total_spent_current = sum(e.get("amount", 0) for e in current_month_expenses)
    
    cash_flow_prediction = predict_cash_flow(current_month_expenses, current_balance)
    subscription_summary = SubscriptionAnalyzer.summarize(subscriptions)
    habit_spending = analyze_habits(current_month_expenses)
    hidden_spending = analyze_hidden_spending(current_month_expenses)
    monthly_financial_story = generate_monthly_story(current_month_expenses, previous_month_expenses)
    budget_intelligence = recommend_budget(income)
    investment_insight = analyze_investment_potential(income, total_spent_current)
    ef_risk = analyze_emergency_fund_risk(total_spent_current, total_savings)
        
    return {
        "cash_flow_prediction": cash_flow_prediction,
        "subscription_summary": subscription_summary,
        "habit_spending": habit_spending,
        "hidden_spending": hidden_spending,
        "monthly_financial_story": monthly_financial_story,
        "budget_intelligence": budget_intelligence,
        "investment_insight": investment_insight,
        "emergency_fund_risk": ef_risk
    }
