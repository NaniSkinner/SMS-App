#!/bin/bash
# Quick API Test Script for Phase 2 Conflict Detection

API_URL="https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging"
USER_ID="test-user-123" # Replace with actual user ID if testing with real calendar

echo "🚀 Testing Phase 2 Conflict Detection API"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
curl -s "$API_URL/health" | jq
echo ""
echo ""

# Test 2: Extract Event (No Conflict)
echo "Test 2: Extract Event - Simple Time"
echo "-----------------------------------"
curl -s -X POST "$API_URL/ai/extract-event" \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "Soccer practice Saturday 3PM",
    "userId": "'"$USER_ID"'",
    "timezone": "America/Chicago"
  }' | jq
echo ""
echo ""

# Test 3: Extract Event with Time Range
echo "Test 3: Extract Event - Time Range"
echo "----------------------------------"
curl -s -X POST "$API_URL/ai/extract-event" \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "Dentist appointment tomorrow 2PM-3PM",
    "userId": "'"$USER_ID"'",
    "timezone": "America/Chicago"
  }' | jq
echo ""
echo ""

# Test 4: Extract Event - Complex Message
echo "Test 4: Extract Event - Complex Message"
echo "---------------------------------------"
curl -s -X POST "$API_URL/ai/extract-event" \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "Hey! Can you make it to Emmas birthday party on Sunday at 2 PM? Its at Central Park",
    "userId": "'"$USER_ID"'",
    "timezone": "America/Chicago"
  }' | jq
echo ""
echo ""

# Test 5: Vague Message (Should have low confidence)
echo "Test 5: Vague Message"
echo "--------------------"
curl -s -X POST "$API_URL/ai/extract-event" \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "Maybe we can meet sometime next week?",
    "userId": "'"$USER_ID"'",
    "timezone": "America/Chicago"
  }' | jq
echo ""
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "Note: To test with actual calendar conflicts, replace USER_ID with your Firebase user ID"

