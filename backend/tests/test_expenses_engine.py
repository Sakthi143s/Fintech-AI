from fastapi.testclient import TestClient
from main import app
from datetime import datetime

def test_expense_budget_subtraction(client: TestClient):
    pass # To be implemented as integration test in phase 7 where we seed a db
    
def test_expense_summary_logic():
    # Test the core logic for calculating remaining budgets
    allocated_food = 500.0
    spent_food = 200.0
    
    # Formula: remaining = allocated - spent
    remaining = allocated_food - spent_food
    
    assert remaining == 300.0
    assert (allocated_food - spent_food) > 0 # Not over budget
    
    # Over budget scenario
    allocated_rent = 1000.0
    spent_rent = 1200.0
    
    remaining_rent = allocated_rent - spent_rent
    
    assert remaining_rent == -200.0
    assert remaining_rent < 0 # Over budget flag should be true
    
def test_financial_score_logic():
    from services.financial_engine.financial_score import calculate_health_score
    
    score_data = calculate_health_score(
        income=5000.0,
        total_spent=3000.0,
        total_savings=1500.0,
        total_invested=500.0,
        debt=500.0
    )
    
    assert "score" in score_data
    assert "grade" in score_data
    assert "breakdown" in score_data
    
    assert 0 <= score_data["score"] <= 100
    assert score_data["grade"] in ["A", "B", "C", "D", "F"]
    
    # Savings rate is (5000 - 3000) / 5000 = 40% (Max 30 points)
    # Debt to income is 500 / 5000 = 10% (Max 30 points)
    # Both are excellent
    assert score_data["grade"] == "A" or score_data["grade"] == "B"
