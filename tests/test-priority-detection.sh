#!/bin/bash

# Priority Detection Test Script
# Tests the /ai/detect-priority Lambda endpoint with various message types

# Configuration
API_URL="https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging"
ENDPOINT="/ai/detect-priority"
FULL_URL="${API_URL}${ENDPOINT}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Priority Detection Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Testing endpoint: $FULL_URL"
echo ""

# Function to test priority detection
test_priority() {
  local test_name="$1"
  local message_text="$2"
  local expected_priority="$3"
  
  echo -e "${YELLOW}Test $((TESTS_RUN + 1)): ${test_name}${NC}"
  echo "Message: \"$message_text\""
  echo "Expected: $expected_priority priority"
  
  # Create request payload
  local payload=$(cat <<EOF
{
  "messageText": "$message_text",
  "messageId": "test-msg-$((TESTS_RUN + 1))",
  "conversationId": "test-conv-123",
  "userId": "test-user-456",
  "timezone": "America/Chicago"
}
EOF
)
  
  # Make API request
  local response=$(curl -s -X POST "$FULL_URL" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  # Check if request was successful
  if [ -z "$response" ]; then
    echo -e "${RED}❌ FAILED: No response from server${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    return
  fi
  
  # Parse response
  local has_priority=$(echo "$response" | jq -r '.hasPriority')
  local detected_priority=$(echo "$response" | jq -r '.priority')
  local reason=$(echo "$response" | jq -r '.reason')
  local confidence=$(echo "$response" | jq -r '.confidence')
  
  # Display results
  echo "Response:"
  echo "  - Has Priority: $has_priority"
  echo "  - Priority Level: $detected_priority"
  echo "  - Reason: $reason"
  echo "  - Confidence: $confidence"
  
  # Verify expected priority
  if [ "$detected_priority" == "$expected_priority" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FAILED: Expected '$expected_priority', got '$detected_priority'${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  TESTS_RUN=$((TESTS_RUN + 1))
  echo ""
}

echo -e "${BLUE}--- High Priority Tests ---${NC}"
echo ""

# Test 1: Emergency
test_priority \
  "Emergency Message" \
  "URGENT: School is closing early due to weather emergency. Pick up kids by 1pm!" \
  "high"

# Test 2: Immediate action required
test_priority \
  "Immediate Action" \
  "Eva is sick at school. The nurse says you need to pick her up ASAP." \
  "high"

# Test 3: Critical problem
test_priority \
  "Critical Problem" \
  "HELP! The babysitter just canceled and I'm stuck at work!" \
  "high"

# Test 4: Safety issue
test_priority \
  "Safety Issue" \
  "Emma fell off the playground and hit her head. We're taking her to the hospital." \
  "high"

echo -e "${BLUE}--- Medium Priority Tests ---${NC}"
echo ""

# Test 5: Important but not immediate
test_priority \
  "Important Deadline" \
  "Reminder: Permission slip for the field trip is due tomorrow morning." \
  "medium"

# Test 6: Coordination needed
test_priority \
  "Coordination Needed" \
  "We need to decide on dinner plans tonight. What time works for everyone?" \
  "medium"

# Test 7: Task with near deadline
test_priority \
  "Near Deadline" \
  "Don't forget the school fundraiser form needs to be submitted by Friday." \
  "medium"

# Test 8: Important update
test_priority \
  "Important Update" \
  "Doctor called - appointment moved to tomorrow at 3pm instead of next week." \
  "medium"

echo -e "${BLUE}--- Low Priority Tests ---${NC}"
echo ""

# Test 9: FYI message
test_priority \
  "FYI Message" \
  "FYI: School pictures are next month. Just a heads up!" \
  "low"

# Test 10: Reminder (no urgency)
test_priority \
  "Non-urgent Reminder" \
  "Reminder to sign up for parent-teacher conferences when you get a chance." \
  "low"

echo -e "${BLUE}--- No Priority Tests ---${NC}"
echo ""

# Test 11: Normal conversation
test_priority \
  "Normal Conversation" \
  "How was your day? Hope work wasn't too stressful." \
  "none"

# Test 12: Social chat
test_priority \
  "Social Chat" \
  "Thanks for picking up Emma yesterday! She had a great time at soccer." \
  "none"

# Test 13: General question
test_priority \
  "General Question" \
  "Do you want to try that new restaurant sometime next month?" \
  "none"

# Test 14: Simple acknowledgment
test_priority \
  "Acknowledgment" \
  "Sounds good! See you later." \
  "none"

# Test 15: Casual planning
test_priority \
  "Casual Planning" \
  "Maybe we should think about planning a family vacation for the summer?" \
  "none"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
  exit 1
fi

