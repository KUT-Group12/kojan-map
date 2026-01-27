#!/bin/bash
# 1. Login
LOGIN_RES=$(curl -s -X POST http://localhost:8080/api/auth/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"google_token": "manual-test-user-token", "role": "user"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"jwt_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo "Got Token: $TOKEN"

# 2. Create Post with 'other'
echo "Testing with genre: other"
curl -v -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Curl Test Post Other",
    "description": "Testing 500 error",
    "latitude": 33.605,
    "longitude": 133.6782,
    "genre": "other",
    "images": []
  }'
