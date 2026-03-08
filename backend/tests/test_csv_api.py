import requests

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    # 1. Login to get token
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    if login_resp.status_code != 200:
        # Register if needed
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        })
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Upload CSV
    with open("../test_statement.csv", "rb") as f:
        files = {"file": ("test_statement.csv", f, "text/csv")}
        upload_resp = requests.post(f"{BASE_URL}/api/bank/import-csv", headers=headers, files=files)
        
    print("Upload Response:", upload_resp.status_code, upload_resp.text)
    
    # 3. Check Subscriptions
    subs_resp = requests.get(f"{BASE_URL}/api/insights/subscriptions", headers=headers)
    print("Subscriptions:", subs_resp.status_code, subs_resp.json())

if __name__ == "__main__":
    test_flow()
