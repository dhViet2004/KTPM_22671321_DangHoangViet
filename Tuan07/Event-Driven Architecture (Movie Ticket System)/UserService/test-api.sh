#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:8081"
TOKEN_FILE="token.txt"

echo "================================================"
echo "   UserService API Test Script"
echo "================================================"
echo ""

# Register
echo -e "${YELLOW}[1] Testing Register API...${NC}"
echo "---------------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"testuser@example.com","password":"password123","firstName":"Test","lastName":"User","phoneNumber":"0912345678"}')

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
TOKEN=$(echo "$RESPONSE" | jq -r '.data.token' 2>/dev/null)
echo "$TOKEN" > "$TOKEN_FILE"
echo -e "${GREEN}Token saved${NC}"
echo ""

# Login
echo -e "${YELLOW}[2] Testing Login API...${NC}"
echo "---------------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
TOKEN=$(echo "$RESPONSE" | jq -r '.data.token' 2>/dev/null)
echo "$TOKEN" > "$TOKEN_FILE"
echo ""

# Get Profile (with token)
echo -e "${YELLOW}[3] Testing Get Profile API (with JWT)...${NC}"
echo "---------------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || \
  curl -s -X GET "$BASE_URL/api/v1/users/profile" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# Get Profile (without token - should fail)
echo -e "${YELLOW}[4] Testing Get Profile API (without JWT - should fail)...${NC}"
echo "---------------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/users/profile"
echo ""
echo ""

# Register with duplicate username
echo -e "${YELLOW}[5] Testing Register with duplicate username (should fail)...${NC}"
echo "---------------------------------------------"
curl -s -X POST "$BASE_URL/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"another@example.com","password":"password123"}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"another@example.com","password":"password123"}'
echo ""
echo ""

# Login with wrong password
echo -e "${YELLOW}[6] Testing Login with wrong password (should fail)...${NC}"
echo "---------------------------------------------"
curl -s -X POST "$BASE_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"wrongpassword"}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"wrongpassword"}'
echo ""
echo ""

# Cleanup
rm -f response_register.json response_login.json 2>/dev/null

echo "================================================"
echo "   Test Complete!"
echo "================================================"
