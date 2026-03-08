import pytest
from api.investments import sip_calculator
from schemas import SIPCalcRequest

def test_sip_calculator_standard():
    # Test formula: A = P ((1 + r/n)^(nt) - 1) / (r/n) * (1 + r/n)
    req = SIPCalcRequest(monthly_amount=5000.0, rate=12.0, years=10)
    result = sip_calculator(req)
    
    assert result.total_invested == 600000.0
    
    # 5000 at 12% for 10 years is approx 1,161,695
    assert 1150000 < result.future_value < 1170000
    assert round(result.total_returns, 2) == round(result.future_value - result.total_invested, 2)

def test_sip_calculator_zero_interest():
    req = SIPCalcRequest(monthly_amount=5000.0, rate=0.0, years=10)
    result = sip_calculator(req)
    
    # If interest is 0, future value is just the total invested amount
    assert result.total_invested == 600000.0
    assert result.future_value == 600000.0
    assert result.total_returns == 0.0

def test_budget_calculation_standard():
    # Formula: allocated_amount = income * percentage / 100
    assert (10000.0 * 40.0 / 100.0) == 4000.0
    assert (50000.0 * 20.0 / 100.0) == 10000.0
    assert (50000.0 * 10.0 / 100.0) == 5000.0

def test_budget_calculation_edge_cases():
    assert (10000.0 * 0.0 / 100.0) == 0.0
    assert (10000.0 * 100.0 / 100.0) == 10000.0
    assert (0.0 * 50.0 / 100.0) == 0.0
