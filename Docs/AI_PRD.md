# MessageAI - Product Requirements Document

## Executive Summary

### Product Vision

Extend the existing production-quality messaging app with an AI-powered scheduling copilot that automatically detects calendar conflicts, extracts events from conversations, and helps busy parents manage their family schedules without the mental overhead of juggling multiple calendars and message threads.

### Problem Statement

Busy parents and caregivers receive dozens of scheduling-related messages daily across multiple conversations—doctor's appointments, sports practices, birthday parties, school events, and social commitments. Critical information gets buried in message threads, double-bookings happen frequently, and parents spend 2+ hours weekly manually cross-referencing calendars and messages.

### Solution

An AI assistant seamlessly integrated into the existing messaging app that:

- **Proactively detects** scheduling conflicts in real-time as messages arrive
- **Intelligently extracts** event information from conversational text
- **Provides a conversational interface** for calendar management via natural language
- **Maintains user control** through transparent reasoning and confirmation loops

### Success Criteria

- Extract events from messages with ≥90% accuracy
- Detect calendar conflicts with <2 second latency
- Reduce scheduling friction from 2 hours/week to <15 minutes/week
- Zero critical errors in calendar operations (no accidental bookings)
- User satisfaction score ≥4.5/5 in initial testing

---

## Product Overview

### Key Features

#### 1. AI Chat Assistant (Dedicated Interface)

A conversational AI interface where users can:

- Query their schedule ("What's on my calendar Saturday?")
- Create calendar events via natural language ("Book Saturday 3PM for family time")
- Get scheduling recommendations ("When am I free this week?")
- See AI's reasoning process transparently

#### 2. Intelligent Conflict Detection (Inline AI)

Automatic analysis of incoming messages that:

- Detects scheduling information in message text
- Checks for conflicts with existing calendar events
- Displays non-intrusive pop-up warnings
- Allows users to view conflicts and make informed decisions

#### 3. Multi-Step Agentic Workflows

AI orchestrates multiple tools to complete complex tasks:

- Parse message text → Extract event details → Query calendar → Detect conflicts → Suggest alternatives → Create events
- Context retention across conversation turns
- Error recovery and graceful degradation

### Platform Specifications

- **Primary Platform:** iOS 14.0+
- **Test Device:** iPhone 16 Pro
- **Tech Stack:**
  - Frontend: React Native, Expo SDK 54+, TypeScript
  - Backend: AWS Lambda, Node.js
  - AI: OpenAI GPT-4 (function calling)
  - Calendar: Google Calendar API (OAuth 2.0)
  - Database: Firebase Firestore (existing)

---

## Target Users

### Primary Persona: "Busy Parent/Caregiver"

**Demographics:**

- Age: 25-45
- Tech literacy: Medium to High
- Context: Managing personal, work, and children's schedules
- Device: iPhone as primary communication and organization tool
- Family: 1-3 children with multiple activities each

**Needs:**

- Quick, reliable calendar management without switching apps
- Automatic conflict detection before double-booking
- Natural language interaction (no complex interfaces)
- Clear visibility into schedule overlaps
- Trust and transparency in AI decisions

**Pain Points:**

- **Time pressure:** No time to manually check multiple calendars
- **Information overload:** 50+ scheduling messages per week
- **Mental overhead:** Constant context-switching between messages and calendar
- **Double-booking anxiety:** Fear of missing events or creating conflicts
- **Buried information:** Important dates lost in long message threads

**Key Use Cases:**

- Coordinating children's sports practices and games
- Managing medical appointments for family members
- Planning birthday parties and social events
- School activities and parent-teacher meetings
- Balancing work commitments with family obligations

**Quantified Impact:**

- Average parent receives 47 scheduling-related messages per week
- 68% report missing events due to buried information
- 2.3 hours/week spent manually managing schedules
- 34% have experienced double-booking in past month
- 89% check 2+ calendar sources (phone + partner's + school portal)

---

## Core Problem Statement

### Root Causes

1. **Fragmented information:** Schedules communicated via messages, emails, apps, paper
2. **No centralized intelligence:** User's brain is the only integration point
3. **Reactive management:** Problems discovered when already double-booked
4. **Cognitive load:** Decision fatigue from constant context-switching

### Why Existing Solutions Fail

- **Traditional calendars:** Require manual entry, no message integration
- **Passive AI assistants:** Only answer questions, don't proactively help
- **Aggressive auto-scheduling:** Remove user control, cause errors
- **Separate apps:** Add complexity instead of reducing it

### Desired Outcome

A scheduling copilot that:

- Lives where the conversations already happen (messaging app)
- Proactively identifies conflicts before they become problems
- Reduces manual calendar management by 85%
- Maintains user agency through transparent reasoning
- Feels like a helpful assistant, not an intrusive automation

---

## Solution Overview

### Design Philosophy

**Principle 1: Embedded Intelligence**  
AI lives within the natural communication flow, not as a separate app or complex feature.

**Principle 2: Proactive, Not Pushy**  
The AI surfaces relevant information at the right moment but never acts without permission.

**Principle 3: Transparency > Black Box**  
Users always understand why the AI made a suggestion and can override it.

**Principle 4: User Control**  
All AI actions require explicit or implicit user confirmation. No silent auto-scheduling.

### Core Capabilities

**Capability 1: Natural Language Understanding**

- Extract events from conversational text
- Parse dates, times, durations with high accuracy
- Handle ambiguity through clarifying questions

**Capability 2: Calendar Intelligence**

- Query calendar for availability
- Calculate free blocks
- Suggest optimal times based on user patterns

**Capability 3: Conflict Detection**

- Real-time analysis of proposed events
- Calculate overlaps with existing calendar
- Severity assessment (high/medium/low conflict)

**Capability 4: Multi-Step Reasoning**

- Chain multiple operations together
- Maintain context across conversation
- Recover gracefully from errors

---

## Feature Requirements

### Phase 0: Foundation Setup

**F0.1 AWS Lambda Infrastructure**

- Priority: P0 (Critical)
- Set up Lambda function for AI service
- Configure API Gateway with REST endpoints
- Environment variable management
- Error monitoring and alerting

**Endpoints:**

- `POST /ai/chat` - Conversational AI interface
- `POST /ai/extract-event` - Event extraction from text
- `POST /ai/detect-conflicts` - Conflict detection
- `GET /health` - Service health check

**Acceptance Criteria:**

- Lambda function deployed and accessible
- Average response time <1 second
- Error rate <0.1%

---

**F0.2 OpenAI GPT-4 Integration**

- Priority: P0 (Critical)
- OpenAI SDK integration with function calling
- Define calendar management tools (get, create, update, delete)
- Implement error handling and retry logic
- Rate limiting and cost management

**Function Calling Tools:**

- `getCalendarEvents` - Fetch events for date range
- `createCalendarEvent` - Create new calendar event
- `detectConflicts` - Check for scheduling conflicts

**Acceptance Criteria:**

- Function calling working with all 3 tools
- Handles multi-step tool orchestration
- Retry logic for transient failures (3 attempts)
- Response time <2 seconds for simple queries

**Cost Management:**

- Use GPT-4o-mini for simple extractions (<$0.01/request)
- Use GPT-4o for complex reasoning (<$0.05/request)
- Cache similar queries (60 min TTL)
- Monthly budget: $100 for testing phase

---

**F0.3 Google Calendar API Integration**

- Priority: P0 (Critical)
- OAuth 2.0 flow implementation
- Secure token storage in Firestore
- Token refresh automation
- Calendar read/write operations

**Calendar Operations:**

- List events for date range
- Create new event
- Update existing event
- Delete event

**Acceptance Criteria:**

- OAuth flow works end-to-end
- Tokens stored securely with encryption
- Automatic token refresh before expiry
- All CRUD operations functional
- Handles API rate limits (backoff + retry)

---

### Phase 1: AI Chat Assistant

**F1.1 AI Chat Screen UI**

- Priority: P0 (Critical)
- Dedicated chat screen accessible from tab bar
- Message bubbles (user vs AI differentiation)
- Input field with send button
- Loading states during AI processing
- Display AI reasoning process (transparency)
- Conversation history persistence

**UI Components:**

- Chat Screen Layout (header, message list, input area)
- AI Message Bubble (with reasoning section, feedback buttons)
- User Message Bubble (with timestamp, status)

**Acceptance Criteria:**

- AI chat accessible from new tab in tab bar
- Messages display with correct styling
- Conversation history loads from Firestore
- Works in light and dark mode
- Accessible via VoiceOver

---

**F1.2 Conversational AI Logic**

- Priority: P0 (Critical)
- Natural language understanding for scheduling queries
- Context retention across conversation turns
- Multi-turn dialogue support
- Tool orchestration (calendar operations)
- Reasoning transparency

**Supported Query Types:**

1. **Schedule Inquiry** - "What's on my calendar tomorrow?"
2. **Event Creation** - "Book Saturday 3PM for family time"
3. **Availability Check** - "When am I free this week for coffee?"
4. **Conflict Resolution** - "I need to reschedule my dentist appointment"

**Acceptance Criteria:**

- Understands all 4 query types
- Maintains context for at least 5 turns
- Confirms before creating/modifying events
- Shows reasoning for recommendations
- Handles ambiguity by asking clarifying questions
- Response time <3 seconds

---

**F1.3 Calendar Service Integration**

- Priority: P0 (Critical)
- Wrapper service for Google Calendar API
- Token management and refresh
- Error handling and retries
- Rate limiting compliance
- Event caching for performance

**Service Methods:**

- `getEvents()` - Fetch events with caching
- `createEvent()` - Create new event
- `detectConflicts()` - Find overlapping events
- `getAccessToken()` - Handle token refresh

**Acceptance Criteria:**

- All calendar operations functional
- Token refresh works automatically
- Caching reduces API calls by 60%
- Handles rate limits gracefully
- Average response time <500ms (cached)

---

**F1.4 Firestore Schema Extensions**

- Priority: P0 (Critical)
- Store AI conversation history
- Store calendar OAuth tokens securely
- Store AI suggestions and feedback
- Store user preferences for AI

**New Collections:**

- `users/{userId}/ai_conversations` - Conversation history
- `users/{userId}/tokens/google` - OAuth tokens (encrypted)
- `conversations/{convId}/messages/{msgId}/ai_suggestions` - AI suggestions
- `users/{userId}/ai_preferences` - User preferences
- `ai_feedback` - Global feedback collection

**Acceptance Criteria:**

- All collections defined in Firestore
- Security rules implemented
- Tokens encrypted at rest
- Indexes created for query performance

---

### Phase 2: Intelligent Conflict Detection

**F2.1 Message Analysis System**

- Priority: P0 (Critical)
- Automatic detection of scheduling information in messages
- Trigger AI analysis (on-demand or real-time)
- Extract events with confidence scoring
- Store suggestions for user review

**Analysis Trigger Options:**

- **Option A:** Real-time (Firebase Cloud Function on message create)
- **Option B:** On-demand (user long-presses message → "Analyze with AI")
- **Recommendation:** Start with Option B (simpler), add Option A later

**Acceptance Criteria:**

- Can analyze messages on-demand
- Extracts event details with ≥90% accuracy
- Detects conflicts within 2 seconds
- Stores suggestions in Firestore
- Works for both 1-on-1 and group chats

---

**F2.2 AI Pop-up Component**

- Priority: P0 (Critical)
- Non-intrusive visual indicator on messages with scheduling info
- Tap to expand and view details
- Clear conflict warnings
- Actions: View Calendar, Book Anyway, Dismiss

**UI Components:**

1. **AI Suggestion Badge** - Small indicator on message bubble
2. **Conflict Details Modal** - Shows proposed event and conflicts
3. **Event Extraction Modal** - Shows extracted event (no conflict)

**Acceptance Criteria:**

- Badge appears on messages with AI suggestions
- Badge is subtle, doesn't obscure message text
- Tapping badge opens appropriate modal
- Conflict modal shows all conflicting events
- Can view full calendar from modal
- "Book Anyway" creates event despite conflict
- Animations are smooth (fade in 200ms)

---

**F2.3 Calendar View Integration**

- Priority: P1 (Nice to Have)
- Open native calendar app or embedded calendar view
- Highlight conflicting events
- Allow booking from within app

**Implementation:**

- Deep link to native Calendar app using URL scheme
- Opens to correct date
- Fallback if calendar app unavailable

**Acceptance Criteria:**

- "View Calendar" button opens calendar app
- Opens to correct date
- Fallback if calendar app unavailable

---

### Phase 3: Polish & Edge Cases

**F3.1 Comprehensive Error Handling**

- Priority: P0 (Critical)
- Graceful degradation for all failure scenarios
- Clear user-facing error messages
- Automatic retry logic with exponential backoff
- Error logging and monitoring

**Error Scenarios (see detailed section below):**

1. Calendar Permission Denied
2. OpenAI API Rate Limit
3. Ambiguous Date/Time
4. Wrong Event Extraction
5. Network Failure

**Acceptance Criteria:**

- All edge cases handled gracefully
- No crashes or broken UI states
- Error messages are clear and actionable
- Retry logic works for transient failures
- User feedback mechanism functional

---

**F3.2 Cost Optimization**

- Priority: P1 (Nice to Have)
- Minimize OpenAI API costs
- Cache frequently requested data
- Use appropriate model tiers
- Monitor and alert on budget thresholds

**Strategies:**

1. **Smart Model Selection** - GPT-4o-mini vs GPT-4o
2. **Response Caching** - Hash similar queries
3. **Batch Processing** - Process multiple messages together
4. **Budget Monitoring** - Track usage and costs

**Acceptance Criteria:**

- Model selection reduces costs by 40%
- Caching hits for 30% of queries
- Budget monitoring alerts at 90%
- Daily cost stays under $10 in testing

---

**F3.3 User Feedback System**

- Priority: P1 (Nice to Have)
- Collect user feedback on AI accuracy
- Allow corrections to improve prompts
- Track satisfaction metrics
- Use feedback for continuous improvement

**Feedback Mechanisms:**

- Thumbs up/down on AI messages
- Optional comment field
- Correction forms for wrong extractions

**Acceptance Criteria:**

- Feedback buttons on all AI messages
- Feedback stored in Firestore
- Analytics dashboard tracks trends
- 60%+ positive feedback rate

---

## User Stories

### Epic 1: AI Chat Assistant

**Story 1.1: Query Schedule**

```
As a busy parent
I want to ask my AI assistant about my schedule
So that I can quickly check availability without opening calendar

Acceptance Criteria:
- Given I'm in the AI Chat screen
- When I type "What's on my calendar tomorrow?"
- Then the AI responds with a list of all events for tomorrow
- And shows event times and titles
- And completes response in <3 seconds
```

**Story 1.2: Create Event via Chat**

```
As a busy parent
I want to create calendar events using natural language
So that I don't have to manually enter event details

Acceptance Criteria:
- Given I'm in the AI Chat screen
- When I type "Book Saturday 3PM for family time"
- Then the AI extracts event details (title, date, time)
- And checks for conflicts
- And asks for confirmation
- When I confirm
- Then the event is created in my Google Calendar
- And I see a success message
```

**Story 1.3: Find Available Time**

```
As a busy parent
I want the AI to suggest available times
So that I can quickly find slots for new commitments

Acceptance Criteria:
- Given I'm in the AI Chat screen
- When I type "When am I free this week?"
- Then the AI analyzes my calendar
- And suggests free time blocks (≥1 hour)
- And formats response clearly by day
```

---

### Epic 2: Conflict Detection

**Story 2.1: Detect Scheduling Conflict**

```
As a busy parent
I want to be warned when a message mentions a time I'm already booked
So that I can avoid double-booking

Acceptance Criteria:
- Given I receive a message "Soccer practice moved to Saturday 3PM"
- And I already have "Eva's party 2-5PM" on Saturday
- When I long-press the message and select "Analyze with AI"
- Then I see a ⚠️ badge appear on the message
- When I tap the badge
- Then I see a conflict modal showing both events
- And I can choose to view calendar, book anyway, or dismiss
```

**Story 2.2: No Conflict Detection**

```
As a busy parent
I want to quickly add events that don't conflict
So that I can save time scheduling

Acceptance Criteria:
- Given I receive "Birthday party Sunday 2PM at the park"
- And I have no events Sunday afternoon
- When I long-press and select "Analyze with AI"
- Then I see a 📅 badge appear
- When I tap the badge
- Then I see extracted event details
- And option to add to calendar
- When I tap "Add to Calendar"
- Then event is created without further confirmation
```

---

### Epic 3: Edge Cases

**Story 3.1: Handle Ambiguous Date**

```
As a busy parent
I want the AI to ask for clarification on ambiguous dates
So that events are scheduled correctly

Acceptance Criteria:
- Given a message contains "next Friday"
- When the AI extracts the event
- Then it recognizes date ambiguity
- And asks which Friday I meant
- And provides specific date options
- When I select the correct date
- Then the event uses that date
```

**Story 3.2: Handle Permission Denied**

```
As a busy parent
I want to be notified if calendar access is denied
So that I understand why AI features don't work

Acceptance Criteria:
- Given I've revoked calendar permissions
- When I try to use AI scheduling features
- Then I see a clear error message
- And a button to open Settings
- And AI chat still works for non-calendar queries
```

---

## Success Metrics

### Primary Metrics

**1. Event Extraction Accuracy**

- Target: ≥90% accuracy
- Measurement: Compare AI-extracted events to user corrections
- Baseline: 75% (typical NLP systems)
- Goal: 90% by end of testing phase

**2. Conflict Detection Latency**

- Target: <2 seconds
- Measurement: Time from user action to pop-up display
- Goal: p95 latency under 2 seconds

**3. Time Saved Per Week**

- Target: Reduce from 2 hours to <15 minutes
- Measurement: Pre/post usage surveys
- Baseline: 2 hours/week (from user research)
- Goal: 85% reduction → 15 minutes/week

**4. Feature Adoption Rate**

- Target: 60% of users engage with AI features within 7 days
- Measurement: Track users who interact with AI chat or pop-ups
- Goal: 60% adoption in first week

### Secondary Metrics

**5. User Satisfaction Score**

- Target: ≥4.5/5.0
- Measurement: In-app rating prompt after 5 AI interactions
- Goal: 4.5+ average rating

**6. Error Rate**

- Target: <1% critical errors
- Categories: Critical (wrong event created), Major (feature doesn't work), Minor (slow response)
- Goal: Zero critical errors, <1% major errors

**7. Cost Per User**

- Target: <$0.50 per user per month
- Measurement: Total API costs / Active users
- Goal: Sustainable at scale

---

## Security & Privacy

### Data Privacy Principles

**1. Data Minimization**

- Only collect data necessary for functionality
- What we collect: Message text, calendar events, user preferences, OAuth tokens
- What we DON'T collect: Location, device IDs, contact info beyond app

**2. User Consent**

- Explicit opt-in required for AI features
- First-time setup permission screen
- Settings toggle to enable/disable AI
- Clear privacy policy link

**3. Data Encryption**

- At Rest: OAuth tokens (AES-256), API keys (AWS Secrets Manager)
- In Transit: HTTPS/TLS 1.3 for all API calls
- Access Control: Firestore Security Rules, AWS IAM

**4. Data Retention**

- AI Conversations: 90 days (user can delete anytime)
- Calendar Tokens: Until user revokes access
- AI Suggestions: 30 days
- User Feedback: 1 year (anonymized)

**5. Third-Party Data Sharing**

- OpenAI: Message text, calendar events (not used for training)
- Google Calendar: OAuth credentials
- AWS: Hosting AI service
- No other third parties

### Security Measures

**1. Authentication & Authorization**

- Firebase Auth (email/password)
- API Gateway: API key required
- Lambda: Verify Firebase Auth token
- OAuth 2.0 for Google Calendar

**2. Input Validation**

- Sanitize all user input
- Validate date formats
- Length limits (max 5000 chars)
- Prevent injection attacks

**3. Rate Limiting**

- Per User: 30 AI messages/hour, 50 analyses/day
- Per IP: 1000 requests/hour
- System-wide budget cap: $100/day

**4. Monitoring & Alerting**

- AWS CloudWatch for Lambda errors
- Firebase for auth failures
- OpenAI rate limit monitoring
- Budget anomaly detection

**5. Compliance**

- GDPR: Right to access, erasure, portability
- CCPA: Data disclosure, deletion requests
- Children's Privacy: No users under 13
- Terms of Service with clear policies

---

## Edge Cases & Error Handling

### Critical Edge Cases

**1. Calendar Permission Denied**

- Scenario: User revokes calendar access
- Impact: High - Core feature broken
- Handling: Show clear alert with "Open Settings" button, disable calendar features gracefully, allow AI chat for non-calendar queries
- User Experience: Alert with action button, fallback behavior for each feature

**2. OpenAI API Rate Limit**

- Scenario: Too many requests exceed quota
- Impact: High - AI features unavailable
- Handling: Queue request, show user-friendly message, exponential backoff, retry up to 3 times
- User Experience: Toast "AI assistant is busy. Processing your request..."

**3. Ambiguous Date/Time**

- Scenario: Message says "next Friday" (unclear which Friday)
- Impact: Medium - Wrong event created
- Handling: AI detects confidence <0.7, request clarification, show date picker options
- User Experience: AI asks "Did you mean October 25 or November 1?"

**4. Wrong Event Extraction**

- Scenario: AI extracts incorrect event details
- Impact: High - User frustration
- Handling: Always show extracted details before creating, allow editing, provide feedback mechanism
- User Experience: Extraction preview with "Edit Details" and "⚠️ Wrong info?" buttons

**5. Network Failure**

- Scenario: Poor/no internet connection
- Impact: High - Features unavailable
- Handling: Detect network error, show offline indicator, queue operations, sync when restored
- User Experience: Banner "You're offline. AI features unavailable."

### Non-Critical Edge Cases

**6. Duplicate Event Detection**

- Check calendar for similar events before creating
- Ask user: "This event might already be on your calendar. Add anyway?"

**7. Very Long Message**

- Truncate to 5000 characters
- Show warning: "Message too long. Analyzing first 5000 characters..."

**8. No Calendar Events**

- User has empty calendar
- AI responds: "Your calendar is free that day!"

**9. Past Date Mentioned**

- AI detects date is in the past
- Ask: "Did you mean [past date] or [future date]?"

**10. Multiple Events in One Message**

- Extract all events
- Show list: "I found 3 events:" with option to select which to add

---

## Dependencies & Risks

### External Dependencies

**1. OpenAI API**

- Risk Level: HIGH
- Risks: Service downtime, rate limits, cost increases, API changes
- Mitigation: Retry logic, caching, budget alerts, monitor API updates
- Contingency: Queue requests, graceful degradation, switch to alternative LLM

**2. Google Calendar API**

- Risk Level: MEDIUM
- Risks: OAuth changes, rate limits, user revokes access, API downtime
- Mitigation: OAuth best practices, caching, handle revoked tokens, request quota increase
- Contingency: Cache calendar events, show cached data, allow manual entry

**3. AWS Lambda/API Gateway**

- Risk Level: LOW
- Risks: Cold start latency, concurrency limits, outages, cost overruns
- Mitigation: Provision concurrency, CloudWatch alarms, budget alerts
- Contingency: Increase timeout, scale concurrency, migrate to alternative

**4. Firebase (Existing)**

- Risk Level: LOW
- Risks: Quota exceeded, auth downtime, security rule misconfiguration
- Mitigation: Monitor quota, review security rules, test with emulator
- Contingency: Existing offline capabilities

### Technical Risks

**5. AI Accuracy**

- Risk Level: MEDIUM
- Risks: Event extraction errors, missed conflicts, false positives
- Mitigation: Always confirm before creating, show confidence scores, feedback loop
- Contingency: User can edit/override, manual mode, improve prompts

**6. Performance**

- Risk Level: MEDIUM
- Risks: Slow response times, UI lag, battery drain
- Mitigation: Optimize API calls, loading indicators, limit background processing
- Contingency: Increase Lambda memory, reduce complexity

**7. Cost Overruns**

- Risk Level: MEDIUM
- Expected: ~$0.13 per user per month
- Risk Scenarios: 10x usage spike, bot attacks, inefficient prompts
- Mitigation: Daily budget caps, rate limits, cost monitoring, optimize models
- Contingency: Pause features if budget exceeded, reduce availability

### Product Risks

**8. User Adoption**

- Risk Level: MEDIUM
- Risks: Users don't understand features, don't trust AI, prefer manual control
- Mitigation: Clear onboarding, transparency, full user control, iterate on feedback
- Contingency: Simplify features, better education

**9. Privacy Concerns**

- Risk Level: LOW-MEDIUM
- Risks: Users uncomfortable with data sharing, regulatory compliance, data breach
- Mitigation: Transparent privacy policy, explicit consent, minimal data, encryption
- Contingency: Local-only mode, clear data deletion

**10. Scope Creep**

- Risk Level: MEDIUM
- Risks: Adding too many features, overcomplicating UX, extending timeline
- Mitigation: Strict PRD adherence, regular reviews, clear prioritization, timebox phases
- Contingency: Cut "Nice to have" features, ship MVP, iterate

---

## Out of Scope

### Features Explicitly NOT Included

**1. Advanced AI Features**

- NOT in scope: Predictive scheduling, sentiment analysis, auto-categorization, multi-user coordination, smart rescheduling, travel time, weather-based suggestions
- Rationale: Complexity too high for MVP
- Future: Phase 4-5

**2. Additional Calendar Integrations**

- NOT in scope: Apple Calendar, Outlook/Exchange, CalDAV, multiple calendars
- Rationale: Google Calendar covers 60%+ of users, OAuth flows complex
- Future: Phase 6-7

**3. Email Integration**

- NOT in scope: Email analysis, calendar invites via email, email reminders
- Rationale: Requires Gmail API, privacy concerns, scope expansion
- Future: Phase 8

**4. Voice Interface**

- NOT in scope: Voice commands, voice-to-text, Siri integration
- Rationale: Requires speech-to-text, complexity, text-first simpler
- Future: Phase 9

**5. Collaborative Features**

- NOT in scope: Shared family calendar, group availability, meeting voting, collaborative planning
- Rationale: Multi-user logic complexity, privacy complexities
- Future: Phase 10

**6. Advanced Calendar Features**

- NOT in scope: Recurring events, all-day events, event reminders, attachments, calendar sharing
- Rationale: Google Calendar handles these, focus on AI value-add
- Future: Leverage calendar app

**7. Other Messaging Integrations**

- NOT in scope: SMS/iMessage, WhatsApp, Slack, email app
- Rationale: Works within our app only (MVP), external APIs complex
- Future: Phase 11

**8. Monetization**

- NOT in scope: Subscriptions, in-app purchases, ads, premium features
- Rationale: MVP focus is validation, not revenue
- Future: Phase 12

**9. Web/Desktop Versions**

- NOT in scope: Web app, desktop app, browser extension
- Rationale: iOS mobile app only
- Future: Phase 13-14

**10. Advanced Analytics**

- NOT in scope: User behavior dashboard, A/B testing, heatmaps, session recordings
- Rationale: Basic analytics sufficient for MVP
- Future: Phase 15

### Scope Management Decision Framework

1. Does it support the core value proposition? → If NO: Out of scope
2. Is it required for MVP functionality? → If NO: Out of scope
3. Can it be added later without rearchitecting? → If YES: Out of scope
4. Does it increase complexity >20%? → If YES: Out of scope
5. Does user research validate this need? → If NO: Out of scope

---

## Technical Specifications

### API Endpoints

**AWS Lambda Endpoints:**

```typescript
// POST /ai/chat
Request: { userId: string; message: string; conversationHistory?: Array }
Response: { reply: string; reasoning?: string[]; toolsCalled?: string[]; events?: CalendarEvent[] }

// POST /ai/extract-event
Request: { messageText: string; userId: string; conversationId?: string; messageId?: string }
Response: { hasEvent: boolean; event?: EventDetails; conflicts?: Conflict[]; needsConfirmation?: boolean }

// POST /ai/detect-conflicts
Request: { userId: string; proposedEvent: { date, startTime, duration } }
Response: { hasConflict: boolean; conflicts?: CalendarEvent[]; alternativeTimes?: string[] }

// GET /health
Response: { status: 'ok' | 'degraded' | 'down'; version: string; timestamp: string }
```

### Data Models

**Firestore Collections:**

```typescript
// users/{userId}/ai_conversations/{conversationId}
{
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'archived';
  turns: Array<{ role, content, timestamp, reasoning?, toolCalls? }>;
  metadata: { totalTurns, toolsCalled, eventsCreated, conflictsDetected };
}

// conversations/{convId}/messages/{msgId}/ai_suggestions/{suggestionId}
{
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  createdAt: Timestamp;
  type: 'conflict_detected' | 'event_extracted' | 'recommendation';
  extractedEvent?: { title, date, time, duration, confidence };
  conflict?: { proposedEvent, conflictingEvents, severity };
  userAction?: 'accepted' | 'dismissed' | 'modified';
  wasHelpful?: boolean;
}

// users/{userId}/ai_preferences
{
  userId: string;
  aiEnabled: boolean;
  conflictDetectionEnabled: boolean;
  autoExtractEvents: boolean;
  notifyOnConflict: boolean;
  defaultEventDuration: number;
  workingHours: { start, end };
  quietHours: { enabled, start, end };
  dataSharingConsent: boolean;
  updatedAt: Timestamp;
}

// ai_feedback (global)
{
  id: string;
  userId: string;
  messageId?: string;
  sentiment: 'positive' | 'negative';
  comment?: string;
  aiResponse: string;
  userQuery?: string;
  timestamp: Timestamp;
}
```

### OpenAI Function Definitions

```typescript
// Tool 1: getCalendarEvents
{
  name: "getCalendarEvents",
  description: "Fetch user's calendar events for a specific date range",
  parameters: {
    userId: string,
    startDate: string (ISO 8601),
    endDate: string (ISO 8601)
  }
}

// Tool 2: createCalendarEvent
{
  name: "createCalendarEvent",
  description: "Create a new event in user's Google Calendar",
  parameters: {
    userId: string,
    title: string,
    date: string (ISO),
    startTime: string (HH:MM),
    duration: number (minutes),
    description?: string,
    location?: string
  }
}

// Tool 3: detectConflicts
{
  name: "detectConflicts",
  description: "Check if a proposed event conflicts with existing calendar",
  parameters: {
    userId: string,
    proposedEvent: { date, startTime, duration }
  }
}
```

### System Prompts

**Scheduling Assistant Prompt:**

```
You are a helpful scheduling assistant for busy parents.

Your capabilities:
- Check calendar events
- Create new events
- Detect scheduling conflicts
- Suggest available times

Guidelines:
1. Always confirm before modifying calendar
2. Be concise but friendly
3. Show your reasoning when suggesting times
4. Ask clarifying questions for ambiguous dates
5. Prioritize user's explicit preferences
6. Default to 1-hour duration if not specified
7. Use 12-hour time format (3 PM, not 15:00)

When you detect a conflict:
- Explain what conflicts
- Mention when the conflict is
- Suggest alternatives
```

**Event Extraction Prompt:**

```
You are an expert at extracting scheduling information from casual conversation.

Your task: Identify dates, times, and event details from text.

Output format (JSON):
{
  "hasEvent": boolean,
  "event": { "title", "date" (YYYY-MM-DD), "time" (HH:MM), "duration" (minutes), "confidence" (0-1) },
  "ambiguousFields": string[],
  "needsConfirmation": boolean
}

Rules:
1. Extract explicit dates/times
2. Infer reasonable defaults (1 hour duration)
3. Flag ambiguous information
4. Be conservative (better to ask than guess wrong)
```

---

## Implementation Timeline

### Phase Overview

- **Phase 0:** Foundation Setup (1-2 days, 6-8 hours)
- **Phase 1:** AI Chat Assistant (3-4 days, 12-16 hours)
- **Phase 2:** Conflict Detection (2-3 days, 10-12 hours)
- **Phase 3:** Polish & Edge Cases (2-3 days, 8-12 hours)

**Total:** 8-12 days (32-48 hours)

### Completion Criteria

**Phase 0 Complete:**

- AWS Lambda deployed and responding
- OpenAI integration functional
- Google Calendar OAuth working
- All APIs returning 200 OK

**Phase 1 Complete:**

- 10 users can chat with AI assistant
- 90% of queries answered correctly
- <3 second average response time
- Calendar events created successfully
- Zero critical bugs

**Phase 2 Complete:**

- Conflict detection works in real conversations
- Pop-ups appear within 2 seconds
- Users can act on conflicts
- 80% user satisfaction with feature

**Phase 3 Complete:**

- All edge cases handled gracefully
- Error rate <1%
- Cost <$0.50 per user
- User feedback system functional
- Documentation complete

---

**Document Status:** ✅ Ready for Development  
**Next Steps:** Generate architecture diagrams and detailed task breakdowns in separate documents  
**Last Review:** October 22, 2025
