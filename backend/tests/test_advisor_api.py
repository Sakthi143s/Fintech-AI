import requests

BASE_URL = "http://127.0.0.1:8000"

def test_ai_advisor():
    # 1. Login to get token
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Advisor with new data structure...")
    
    payload = {
        "income": 85000,
        "role": "working professional",
        "lifestyle": "balanced",
        "living_situation": "renting",
        "financial_goals": "saving",
        "risk_tolerance": "moderate",
        "goal_amount": 500000,
        "current_savings": 50000
    }
    
    res = requests.post(f"{BASE_URL}/api/insights/advisor", headers=headers, json=payload)
    
    print("Response Status:", res.status_code)
    
    if res.status_code == 200:
        data = res.json()
        print("\n--- INTELLIGENCE FIELDS RETRIEVED ---\n")
        print("Health Score:", data.get("health_score", {}).get("score"))
        print("Financial Story:", data.get("financial_story"))
        print("Spending Personality:", data.get("spending_personality"))
        print("Prediction:", data.get("cash_flow_prediction"))
        print("Habit:", data.get("habit_spending"))
        print("Hidden:", data.get("hidden_spending"))
        print("Subscription:", data.get("subscription_summary"))
        print("EF Risk:", data.get("emergency_fund_risk"))
        print("Goal Plan:", data.get("goal_plan"))
    else:
        print(res.text)

if __name__ == "__main__":
    test_ai_advisor()
