#!/bin/bash

# Test RSVP Tracking Feature
# Tests invitation detection and RSVP response tracking

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Lambda API endpoint
API_URL="https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}RSVP Tracking Test Suite${NC}"
echo -e "${BLUE}================================${NC}\n"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test invitation detection
test_invitation() {
    local test_name="$1"
    local message="$2"
    local expected_is_invitation="$3"
    local expected_type="${4:-}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Test $TOTAL_TESTS:${NC} $test_name"
    echo "Message: \"$message\""
    
    # Make API request
    response=$(curl -s -X POST "$API_URL/ai/detect-invitation" \
        -H "Content-Type: application/json" \
        -d "{
            \"messageText\": \"$message\",
            \"conversationId\": \"test-conv-123\",
            \"senderId\": \"test-user-456\",
            \"timezone\": \"America/Chicago\"
        }")
    
    # Extract fields
    is_invitation=$(echo "$response" | grep -o '"isInvitation":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    invitation_type=$(echo "$response" | grep -o '"invitationType":"[^"]*"' | cut -d'"' -f4)
    event_title=$(echo "$response" | grep -o '"eventTitle":"[^"]*"' | cut -d'"' -f4)
    requires_rsvp=$(echo "$response" | grep -o '"requiresRSVP":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    confidence=$(echo "$response" | grep -o '"confidence":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    
    # Check results
    if [ "$is_invitation" = "$expected_is_invitation" ]; then
        if [ "$is_invitation" = "true" ] && [ -n "$expected_type" ] && [ "$invitation_type" != "$expected_type" ]; then
            echo -e "${RED}❌ FAILED${NC} - Expected type: $expected_type, Got: $invitation_type"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        else
            echo -e "${GREEN}✅ PASSED${NC}"
            echo "  - Is Invitation: $is_invitation"
            [ "$is_invitation" = "true" ] && echo "  - Type: $invitation_type"
            [ "$is_invitation" = "true" ] && echo "  - Event: $event_title"
            [ "$is_invitation" = "true" ] && echo "  - Requires RSVP: $requires_rsvp"
            echo "  - Confidence: $confidence"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Expected: $expected_is_invitation, Got: $is_invitation"
        echo "Response: $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Function to test RSVP detection
test_rsvp() {
    local test_name="$1"
    local invitation_text="$2"
    local response_text="$3"
    local expected_is_rsvp="$4"
    local expected_status="${5:-}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Test $TOTAL_TESTS:${NC} $test_name"
    echo "Invitation: \"$invitation_text\""
    echo "Response: \"$response_text\""
    
    # Make API request
    response=$(curl -s -X POST "$API_URL/ai/detect-rsvp" \
        -H "Content-Type: application/json" \
        -d "{
            \"messageText\": \"$response_text\",
            \"invitationText\": \"$invitation_text\",
            \"senderId\": \"test-user-789\",
            \"senderName\": \"Alice\",
            \"conversationId\": \"test-conv-123\"
        }")
    
    # Extract fields
    is_rsvp=$(echo "$response" | grep -o '"isRSVP":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    rsvp_status=$(echo "$response" | grep -o '"rsvpStatus":"[^"]*"' | cut -d'"' -f4)
    confidence=$(echo "$response" | grep -o '"confidence":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    reason=$(echo "$response" | grep -o '"reason":"[^"]*"' | cut -d'"' -f4)
    
    # Check results
    if [ "$is_rsvp" = "$expected_is_rsvp" ]; then
        if [ "$is_rsvp" = "true" ] && [ -n "$expected_status" ] && [ "$rsvp_status" != "$expected_status" ]; then
            echo -e "${RED}❌ FAILED${NC} - Expected status: $expected_status, Got: $rsvp_status"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        else
            echo -e "${GREEN}✅ PASSED${NC}"
            echo "  - Is RSVP: $is_rsvp"
            [ "$is_rsvp" = "true" ] && echo "  - Status: $rsvp_status"
            [ "$is_rsvp" = "true" ] && echo "  - Reason: $reason"
            echo "  - Confidence: $confidence"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Expected: $expected_is_rsvp, Got: $is_rsvp"
        echo "Response: $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# ==========================================
# INVITATION DETECTION TESTS
# ==========================================

echo -e "${BLUE}--- Invitation Detection Tests ---${NC}\n"

# Party invitations
test_invitation "Birthday Party" \
    "You're all invited to Emma's 7th birthday party this Saturday at 2pm at our house!" \
    "true" \
    "party"

test_invitation "Casual Party" \
    "Having a BBQ party next weekend, everyone is invited! Bring the kids!" \
    "true" \
    "party"

# Playdate invitations
test_invitation "Playdate at Park" \
    "Anyone want to meet at the park tomorrow for a playdate? The kids would love it!" \
    "true" \
    "playdate"

test_invitation "Playdate at Home" \
    "Want to bring the kids over Friday afternoon for a playdate?" \
    "true" \
    "playdate"

# Meeting invitations
test_invitation "Parent Meeting" \
    "Parent-teacher conference meeting Monday at 3:30pm. Please let me know if you can make it." \
    "true" \
    "meeting"

# Event invitations
test_invitation "School Event" \
    "School potluck next Friday evening! Join us at 6pm in the cafeteria." \
    "true" \
    "event"

test_invitation "Sports Event" \
    "Soccer game this Saturday at 10am. Who wants to come watch?" \
    "true" \
    "activity"

# NOT invitations
test_invitation "Just Asking Availability" \
    "Are you free on Friday?" \
    "false"

test_invitation "Tentative Suggestion" \
    "We should hang out sometime soon" \
    "false"

test_invitation "Past Event" \
    "Thanks for coming to the party yesterday!" \
    "false"

test_invitation "General Chat" \
    "How was your day at school?" \
    "false"

# ==========================================
# RSVP DETECTION TESTS
# ==========================================

echo -e "${BLUE}--- RSVP Detection Tests ---${NC}\n"

INVITATION="You're all invited to Emma's 7th birthday party this Saturday at 2pm!"

# YES responses
test_rsvp "Simple Yes" \
    "$INVITATION" \
    "Yes, we'll be there!" \
    "true" \
    "yes"

test_rsvp "Enthusiastic Yes" \
    "$INVITATION" \
    "Sounds great! We're in! Can't wait!" \
    "true" \
    "yes"

test_rsvp "Count Me In" \
    "$INVITATION" \
    "Count us in! We'll bring a gift." \
    "true" \
    "yes"

test_rsvp "Emoji Yes" \
    "$INVITATION" \
    "👍 We'll be there" \
    "true" \
    "yes"

# NO responses
test_rsvp "Simple No" \
    "$INVITATION" \
    "Sorry, we can't make it" \
    "true" \
    "no"

test_rsvp "Polite Decline" \
    "$INVITATION" \
    "Unfortunately we have a prior commitment. Sorry to miss it!" \
    "true" \
    "no"

test_rsvp "Can't Attend" \
    "$INVITATION" \
    "We won't be able to attend, but hope you have a great time!" \
    "true" \
    "no"

# MAYBE responses
test_rsvp "Maybe Response" \
    "$INVITATION" \
    "Maybe! Need to check our schedule first." \
    "true" \
    "maybe"

test_rsvp "Tentative Response" \
    "$INVITATION" \
    "I'll let you know by Wednesday" \
    "true" \
    "maybe"

test_rsvp "Depends Response" \
    "$INVITATION" \
    "Depends if we can get a babysitter" \
    "true" \
    "maybe"

# NOT RSVP responses
test_rsvp "Question About Event" \
    "$INVITATION" \
    "What time does it start again?" \
    "false"

test_rsvp "Unrelated Message" \
    "$INVITATION" \
    "How was your day?" \
    "false"

test_rsvp "General Acknowledgment" \
    "$INVITATION" \
    "Thanks for the invite!" \
    "false"

# ==========================================
# SUMMARY
# ==========================================

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "\n${YELLOW}Pass Rate: ${PASS_RATE}%${NC}"
    exit 1
fi

