
import requests
import json

BASE_URL = "http://localhost:8080/api"

def run():
    # 1. Login/Register to get JWT
    print("Logging in...")
    auth_res = requests.post(f"{BASE_URL}/auth/exchange-token", json={
        "google_token": "manual-test-user-token",
        "role": "user"
    })
    if auth_res.status_code != 200:
        print(f"Login failed: {auth_res.text}")
        return
    
    jwt = auth_res.json()["jwt_token"]
    print("Got JWT.")

    # 2. Create Post
    headers = {"Authorization": f"Bearer {jwt}"}
    payload = {
        "title": "Manual Test Post",
        "description": "Testing 500 error",
        "latitude": 33.605,
        "longitude": 133.6782,
        "genre": "food", # Assuming 'food' exists
        "images": []
    }
    
    print(f"Sending POST to {BASE_URL}/posts...")
    print(f"Payload: {json.dumps(payload)}")
    
    res = requests.post(f"{BASE_URL}/posts", json=payload, headers=headers)
    
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    run()
