from fastapi.testclient import TestClient
from main import app

def test_signup_login_flow(client: TestClient):
    # Black Box Test: User Registration & Login
    
    # 1. Signup
    signup_data = {
        "name": "Integration Test User",
        "email": "test@integration.com",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/signup", json=signup_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Enable test token
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Login
    login_data = {
        "email": "test@integration.com",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # 3. Invalid Login
    invalid_data = {
        "email": "test@integration.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=invalid_data)
    assert response.status_code == 401
    
    # 4. Profile validation
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@integration.com"

def test_budget_flow(client: TestClient):
    # Setup user
    client.post("/api/auth/signup", json={"name": "B User", "email": "b@test.com", "password": "123"})
    token = client.post("/api/auth/login", json={"email": "b@test.com", "password": "123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add Income
    income_data = {"month": "2024-03", "amount": 10000.0, "source": "Salary"}
    response = client.post("/api/income", json=income_data, headers=headers)
    assert response.status_code == 200
    
    # Add Budget Allocation
    budget_data = {"category": "Housing", "percentage": 30.0, "month": "2024-03"}
    response = client.post("/api/budget", json=budget_data, headers=headers)
    assert response.status_code == 200
    # Expected allocated amount: 10000 * 30% = 3000
    assert response.json()["allocated_amount"] == 3000.0
    
def test_expense_flow(client: TestClient):
    # Setup user
    client.post("/api/auth/signup", json={"name": "E User", "email": "e@test.com", "password": "123"})
    token = client.post("/api/auth/login", json={"email": "e@test.com", "password": "123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add Income and Budget
    client.post("/api/income", json={"month": "2024-03", "amount": 5000.0, "source": "Job"}, headers=headers)
    client.post("/api/budget", json={"category": "Food", "percentage": 10.0, "month": "2024-03"}, headers=headers) # 500 allocated
    
    # Add Expense
    expense_data = {"category": "Food", "amount": 100.0, "date": "2024-03-05", "description": "Groceries"}
    response = client.post("/api/expenses", json=expense_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["amount"] == 100.0
    
    # Fetch Summary - Remaining should be 400
    response = client.get("/api/expenses/summary?month=2024-03", headers=headers)
    assert response.status_code == 200
    summary = response.json()
    assert "categories" in summary
    assert len(summary["categories"]) == 1
    food_summary = summary["categories"][0]
    
    assert food_summary["category"] == "Food"
    assert food_summary["spent"] == 100.0
    assert food_summary["allocated"] == 500.0
    assert food_summary["remaining"] == 400.0
    assert food_summary["over_budget"] == False
