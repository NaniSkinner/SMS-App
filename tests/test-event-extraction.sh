#!/bin/bash

# Test Event Extraction Endpoint
# Tests the /ai/extract-event Lambda endpoint with various date/time formats

API_URL="https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/ai/extract-event"
USER_ID="test-user-123"
TIMEZONE="America/Chicago"

echo "🧪 Testing Event Extraction with various formats..."
echo "=================================================="
echo ""

# Test 1: Simple date and time
echo "Test 1: Simple date and time"
echo "Message: 'Soccer practice Saturday 3pm'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Soccer practice Saturday 3pm\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Full date with location
echo "Test 2: Full date with location"
echo "Message: 'Doctor appointment October 30th at 10:00 AM at Memorial Hospital'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Doctor appointment October 30th at 10:00 AM at Memorial Hospital\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Relative date
echo "Test 3: Relative date"
echo "Message: 'Team meeting tomorrow at 2pm for 1 hour'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Team meeting tomorrow at 2pm for 1 hour\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Casual format
echo "Test 4: Casual format"
echo "Message: 'Let's grab coffee next Monday around 9'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Let's grab coffee next Monday around 9\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Date with duration
echo "Test 5: Date with duration"
echo "Message: 'Birthday party Sunday November 3rd 2pm-5pm at the park'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Birthday party Sunday November 3rd 2pm-5pm at the park\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 6: No event (negative test)
echo "Test 6: No event (negative test)"
echo "Message: 'How are you doing today?'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"How are you doing today?\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 7: Multiple time formats
echo "Test 7: Multiple time formats"
echo "Message: 'Dentist on 10/28 at 3:30pm'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Dentist on 10/28 at 3:30pm\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 8: 24-hour format
echo "Test 8: 24-hour format"
echo "Message: 'Conference call at 14:00 on Friday'"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"messageText\": \"Conference call at 14:00 on Friday\",
    \"timezone\": \"$TIMEZONE\"
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Expected Results:"
echo "- Tests 1-5, 7-8: Should extract events with hasEvent: true"
echo "- Test 6: Should return hasEvent: false (no event detected)"
echo "- All extractions should include: title, date, time, duration, confidence"
echo "- Conflicts should be detected if calendar is connected"

