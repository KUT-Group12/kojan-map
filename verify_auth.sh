#!/bin/bash
# 1. Login to get token
LOGIN_RES=$(curl -s -X POST http://localhost:8080/api/auth/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"google_token": "manual-test-user-token", "role": "user"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"jwt_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo "Got Token: $TOKEN"

# 2. Check /api/auth/me
echo "Checking /api/auth/me..."
curl -v -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
