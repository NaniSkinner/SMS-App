#!/bin/bash

# Test Decision Summarization Endpoint
# Tests the /ai/summarize-decision Lambda endpoint with various conversation scenarios

API_URL="https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/ai/summarize-decision"
USER_ID="test-user-123"
CONVERSATION_ID="test-conv-123"
TIMEZONE="America/Chicago"

echo "🧪 Testing Decision Summarization with various scenarios..."
echo "==========================================================="
echo ""

# Test 1: Clear decision - Where to eat
echo "Test 1: Clear decision - Restaurant choice"
echo "Scenario: Group discussing where to eat dinner"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"conversationId\": \"$CONVERSATION_ID\",
    \"timezone\": \"$TIMEZONE\",
    \"messages\": [
      {
        \"senderId\": \"user1\",
        \"text\": \"Where should we go for dinner tonight?\",
        \"timestamp\": \"2025-10-25T18:00:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"How about Thai food? There's a great place downtown.\",
        \"timestamp\": \"2025-10-25T18:01:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"I'm in! Love Thai food.\",
        \"timestamp\": \"2025-10-25T18:01:30Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"Sounds good to me! What's the place called?\",
        \"timestamp\": \"2025-10-25T18:02:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"It's called Thai Basil. Let's meet there at 7pm!\",
        \"timestamp\": \"2025-10-25T18:02:30Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"Perfect! See you there.\",
        \"timestamp\": \"2025-10-25T18:03:00Z\"
      }
    ],
    \"participantNames\": {
      \"user1\": \"Sarah\",
      \"user2\": \"Mike\",
      \"user3\": \"John\"
    }
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Split decision - Movie choice
echo "Test 2: Split decision - Movie disagreement"
echo "Scenario: Group can't agree on which movie to watch"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"conversationId\": \"$CONVERSATION_ID\",
    \"timezone\": \"$TIMEZONE\",
    \"messages\": [
      {
        \"senderId\": \"user1\",
        \"text\": \"Movie night Friday? What should we watch?\",
        \"timestamp\": \"2025-10-25T14:00:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"I vote for the new Marvel movie!\",
        \"timestamp\": \"2025-10-25T14:01:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"Nah, let's watch that horror film instead.\",
        \"timestamp\": \"2025-10-25T14:02:00Z\"
      },
      {
        \"senderId\": \"user4\",
        \"text\": \"I'm with Sarah, Marvel sounds fun!\",
        \"timestamp\": \"2025-10-25T14:03:00Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"3 votes for Marvel, let's go with that!\",
        \"timestamp\": \"2025-10-25T14:04:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"Fine, I'll watch it too.\",
        \"timestamp\": \"2025-10-25T14:05:00Z\"
      }
    ],
    \"participantNames\": {
      \"user1\": \"Sarah\",
      \"user2\": \"Mike\",
      \"user3\": \"John\",
      \"user4\": \"Emma\"
    }
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Unanimous decision - Meeting time
echo "Test 3: Unanimous decision - Team meeting time"
echo "Scenario: Everyone agrees on meeting time quickly"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"conversationId\": \"$CONVERSATION_ID\",
    \"timezone\": \"$TIMEZONE\",
    \"messages\": [
      {
        \"senderId\": \"user1\",
        \"text\": \"Can everyone make it Tuesday at 2pm for the project meeting?\",
        \"timestamp\": \"2025-10-25T10:00:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"Yes, works for me\",
        \"timestamp\": \"2025-10-25T10:00:30Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"I'm free then too\",
        \"timestamp\": \"2025-10-25T10:00:45Z\"
      },
      {
        \"senderId\": \"user4\",
        \"text\": \"Sounds good!\",
        \"timestamp\": \"2025-10-25T10:01:00Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"Great! Tuesday at 2pm it is then.\",
        \"timestamp\": \"2025-10-25T10:01:15Z\"
      }
    ],
    \"participantNames\": {
      \"user1\": \"Sarah\",
      \"user2\": \"Mike\",
      \"user3\": \"John\",
      \"user4\": \"Emma\"
    }
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 4: No clear decision - Just chatting
echo "Test 4: No clear decision - Casual conversation"
echo "Scenario: No decision being made, just casual chat"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"conversationId\": \"$CONVERSATION_ID\",
    \"timezone\": \"$TIMEZONE\",
    \"messages\": [
      {
        \"senderId\": \"user1\",
        \"text\": \"How's everyone doing today?\",
        \"timestamp\": \"2025-10-25T09:00:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"Doing great! Just finished a project.\",
        \"timestamp\": \"2025-10-25T09:01:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"Nice! What was it about?\",
        \"timestamp\": \"2025-10-25T09:02:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"A new website redesign for a client. Turned out really well!\",
        \"timestamp\": \"2025-10-25T09:03:00Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"Awesome! Congrats!\",
        \"timestamp\": \"2025-10-25T09:04:00Z\"
      }
    ],
    \"participantNames\": {
      \"user1\": \"Sarah\",
      \"user2\": \"Mike\",
      \"user3\": \"John\"
    }
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Weekend plans decision
echo "Test 5: Weekend plans - Beach trip"
echo "Scenario: Planning weekend trip with some debate"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"conversationId\": \"$CONVERSATION_ID\",
    \"timezone\": \"$TIMEZONE\",
    \"messages\": [
      {
        \"senderId\": \"user1\",
        \"text\": \"Anyone want to do something this weekend?\",
        \"timestamp\": \"2025-10-25T16:00:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"Beach trip?\",
        \"timestamp\": \"2025-10-25T16:01:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"I was thinking hiking maybe\",
        \"timestamp\": \"2025-10-25T16:02:00Z\"
      },
      {
        \"senderId\": \"user4\",
        \"text\": \"Beach sounds more relaxing\",
        \"timestamp\": \"2025-10-25T16:03:00Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"Yeah let's do the beach, we can hike another time\",
        \"timestamp\": \"2025-10-25T16:04:00Z\"
      },
      {
        \"senderId\": \"user3\",
        \"text\": \"Okay works for me\",
        \"timestamp\": \"2025-10-25T16:05:00Z\"
      },
      {
        \"senderId\": \"user2\",
        \"text\": \"Perfect! Beach on Saturday?\",
        \"timestamp\": \"2025-10-25T16:06:00Z\"
      },
      {
        \"senderId\": \"user1\",
        \"text\": \"Saturday beach trip it is!\",
        \"timestamp\": \"2025-10-25T16:07:00Z\"
      }
    ],
    \"participantNames\": {
      \"user1\": \"Sarah\",
      \"user2\": \"Mike\",
      \"user3\": \"John\",
      \"user4\": \"Emma\"
    }
  }" \
  -s | jq '.'
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Expected Results:"
echo "- Test 1: hasDecision=true, decision='Thai Basil restaurant', consensusLevel='unanimous'"
echo "- Test 2: hasDecision=true, decision='Marvel movie', consensusLevel='strong' or 'moderate'"
echo "- Test 3: hasDecision=true, decision='Tuesday at 2pm', consensusLevel='unanimous'"
echo "- Test 4: hasDecision=false (no decision being made)"
echo "- Test 5: hasDecision=true, decision='Beach trip on Saturday', consensusLevel='strong'"
echo ""
echo "All responses should include:"
echo "- question: The main question being decided"
echo "- finalDecision: The agreed-upon choice"
echo "- participants: {agreed: [], disagreed: [], neutral: []}"
echo "- timeline: {startTime, endTime, durationMinutes}"
echo "- confidence: 0-1 score"
echo "- keyMessages: 2-3 important messages"
echo "- consensusLevel: 'unanimous' | 'strong' | 'moderate' | 'weak' | 'none'"

