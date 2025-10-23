# MessageAI - Detailed Implementation Tasks

## 📊 Overall Progress

**Messaging App MVP:** ✅ 100% Complete (83/83 tasks)  
**AI Features:** 🚧 10/200+ tasks (5%)

### Completed Tasks (Latest First)

- **2025-10-22:** ✅ Connected all API Gateway endpoints to Lambda with proxy integration
- **2025-10-22:** ✅ Created all 4 API Gateway resources (/health GET, /ai/chat POST, /ai/extract-event POST, /ai/detect-conflicts POST)
- **2025-10-22:** ✅ Created API Gateway REST API 'messageai-api' (Regional, IPv4, us-east-2)
- **2025-10-22:** ✅ Lambda function tested successfully (health endpoint returns 200 OK)
- **2025-10-22:** ✅ Deployed Lambda code (TypeScript compiled + packaged)
- **2025-10-22:** ✅ Configured Lambda settings (512MB memory, 30sec timeout)
- **2025-10-22:** ✅ Created Lambda function 'messageai-service' (Node.js 22.x, us-east-2)
- **2025-10-22:** ✅ Configured AWS CLI with IAM user credentials (region: us-east-2)
- **2025-10-22:** ✅ Created IAM user 'messageai-developer' with Lambda/API Gateway/CloudWatch permissions
- **2025-10-22:** Created Lambda function structure with TypeScript
- **2025-10-22:** Set up package.json with OpenAI, Google APIs, Firebase Admin dependencies
- **2025-10-22:** Created all 4 API endpoints (health, chat, extract-event, detect-conflicts)
- **2025-10-22:** Created AWS setup guide with step-by-step instructions
- **2025-10-22:** Updated .gitignore to protect AWS credentials

### Current Status

**Working on:** Epic 0.1 - AWS Lambda Setup (90% complete - CORS + Deploy remaining)  
**Next up:** Enable CORS, Deploy API, then integrate OpenAI (Epic 0.2)  
**Files created:** `/lambda/*` (complete Lambda structure deployed to AWS)

### Quick Stats

- **Lines of code added:** ~400 (Lambda handler + config)
- **AWS Resources created:** Lambda function + API Gateway with 4 endpoints
- **Time invested:** ~2 hours (setup + AWS deployment)
- **Remaining for Phase 0.1:** ~15 minutes (CORS + Deploy API)

---

## Phase 0: Foundation Setup

**Goal:** Set up all external integrations and infrastructure

**Status:** 🚧 IN PROGRESS  
**Started:** October 22, 2025  
**Phase 0 Progress:** Epic 0.1 (In Progress) → Epic 0.2 (Not Started) → Epic 0.3 (Not Started)

### Epic 0.1: AWS Lambda Setup

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Status:** 🔄 90% COMPLETE - CORS & DEPLOYMENT REMAINING

#### Task 0.1.1: Create AWS Account and IAM Setup

- [x] **0.1.1.1** Create AWS account (company credentials)

  - ✅ User has existing AWS account
  - **Status:** COMPLETE (existing)

- [x] **0.1.1.2** Create IAM user for development

  - ✅ Created user: `messageai-developer`
  - ✅ Attached policies: `AWSLambdaFullAccess`, `APIGatewayAdministrator`, `CloudWatchFullAccess`
  - ✅ Generated access key and secret key
  - ✅ Saved credentials securely
  - **Status:** COMPLETE
  - **Guide:** See `lambda/AWS_SETUP_GUIDE.md` Task 0.1.1.2

- [x] **0.1.1.3** Install and configure AWS CLI

  - ✅ AWS CLI installed
  - ✅ Configured with access credentials (region: us-east-2)
  - ✅ Verified with `aws sts get-caller-identity`
  - **Status:** COMPLETE
  - **Guide:** See `lambda/AWS_SETUP_GUIDE.md` Task 0.1.1.3

#### Task 0.1.2: Create Lambda Function

- [x] **0.1.2.1** Create Lambda function via AWS Console

  - ✅ Function name: `messageai-service`
  - ✅ Runtime: Node.js 22.x (latest)
  - ✅ Architecture: x86_64
  - ✅ Execution role: Created with basic Lambda permissions
  - ✅ Region: us-east-2 (Ohio)
  - **Status:** COMPLETE

- [x] **0.1.2.2** Configure Lambda settings

  - ✅ Memory: 512 MB
  - ✅ Timeout: 30 seconds
  - ✅ Ephemeral storage: 512 MB (default)
  - **Status:** COMPLETE

- [x] **0.1.2.3** Create deployment package structure locally

  - ✅ Created `/lambda` directory structure
  - ✅ `package.json` with OpenAI, Google APIs, Firebase Admin dependencies
  - ✅ `tsconfig.json` for TypeScript compilation
  - ✅ `src/index.ts` with handler for all 4 endpoints (health, chat, extract-event, detect-conflicts)
  - ✅ `.gitignore` for Lambda artifacts
  - ✅ Build scripts: `npm run build`, `npm run package`, `npm run deploy`
  - **Status:** COMPLETE
  - **Files:** `/lambda/src/index.ts`, `/lambda/package.json`, `/lambda/tsconfig.json`

- [x] **0.1.2.4** Deploy initial function

  - ✅ Built TypeScript: `npm run build`
  - ✅ Packaged: `npm run package`
  - ✅ Deployed to AWS: `npm run deploy`
  - ✅ Tested health endpoint: Returns 200 OK with {"status":"ok","version":"1.0.0"}
  - **Status:** COMPLETE

#### Task 0.1.3: Set up API Gateway

- [x] **0.1.3.1** Create REST API in API Gateway

  - ✅ API name: `messageai-api`
  - ✅ Description: "AI-powered scheduling assistant API"
  - ✅ Endpoint type: Regional
  - ✅ IP address type: IPv4
  - ✅ Region: us-east-2 (Ohio)
  - **Status:** COMPLETE

- [x] **0.1.3.2** Create resources and methods

  - ✅ Resource: `/health` with GET method
  - ✅ Resource: `/ai` (parent)
  - ✅ Resource: `/ai/chat` with POST method
  - ✅ Resource: `/ai/extract-event` with POST method
  - ✅ Resource: `/ai/detect-conflicts` with POST method
  - **Status:** COMPLETE - All 4 endpoints created

- [x] **0.1.3.3** Connect endpoints to Lambda

  - ✅ Integration type: Lambda Function
  - ✅ Lambda proxy integration: Enabled for all endpoints
  - ✅ Lambda function: `messageai-service` (us-east-2)
  - ✅ Permissions granted automatically
  - **Status:** COMPLETE - All endpoints connected

- [ ] **0.1.3.4** Enable CORS

  - Access-Control-Allow-Origin: `*` (for now, restrict in prod)
  - Access-Control-Allow-Headers: `Content-Type,Authorization`
  - Access-Control-Allow-Methods: `GET,POST,OPTIONS`
  - **Time:** 10 minutes
  - **Acceptance:** CORS headers present in responses

- [ ] **0.1.3.5** Deploy API to staging

  - Create deployment stage: `staging`
  - Deploy API
  - Note invoke URL: `https://xxxxx.execute-api.us-east-1.amazonaws.com/staging`
  - **Time:** 5 minutes
  - **Acceptance:** Can call API via curl/Postman

- [ ] **0.1.3.6** Set up API key (optional for now)
  - Create API key: `messageai-dev-key`
  - Create usage plan: 1000 requests/day
  - Associate with staging deployment
  - **Time:** 10 minutes
  - **Acceptance:** API requires key in header

#### Task 0.1.4: Environment Variables and Secrets

- [ ] **0.1.4.1** Set up AWS Secrets Manager

  - Create secret: `messageai/openai-api-key`
  - Create secret: `messageai/google-oauth-credentials`
  - Create secret: `messageai/firebase-admin-key`
  - **Time:** 15 minutes
  - **Acceptance:** Secrets stored and retrievable

- [ ] **0.1.4.2** Configure Lambda environment variables

  - `OPENAI_API_KEY_SECRET_NAME=messageai/openai-api-key`
  - `GOOGLE_CLIENT_ID_SECRET_NAME=messageai/google-oauth-credentials`
  - `FIREBASE_ADMIN_SECRET_NAME=messageai/firebase-admin-key`
  - `NODE_ENV=staging`
  - **Time:** 10 minutes
  - **Acceptance:** Variables visible in Lambda console

- [ ] **0.1.4.3** Grant Lambda permissions to read secrets
  - Attach policy to Lambda execution role: `SecretsManagerReadWrite`
  - Test retrieving secrets from Lambda code
  - **Time:** 10 minutes
  - **Acceptance:** Lambda can read secrets without errors

#### Task 0.1.5: Testing and Validation

- [ ] **0.1.5.1** Test health endpoint

  ```bash
  curl https://your-api-url/staging/health
  # Expected: {"status":"ok","version":"1.0.0","timestamp":"..."}
  ```

  - **Time:** 5 minutes
  - **Acceptance:** Returns 200 OK with JSON

- [ ] **0.1.5.2** Test API Gateway → Lambda integration

  ```bash
  curl -X POST https://your-api-url/staging/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"hello"}'
  ```

  - **Time:** 10 minutes
  - **Acceptance:** Lambda function invoked successfully

- [ ] **0.1.5.3** Monitor CloudWatch Logs
  - Open CloudWatch Logs
  - Find log group: `/aws/lambda/messageai-service`
  - Verify logs appear when invoking function
  - **Time:** 10 minutes
  - **Acceptance:** Logs visible and readable

**Epic 0.1 Total Time:** 2-3 hours

---

### Epic 0.2: OpenAI Integration

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Epic 0.1 (Lambda setup)

#### Task 0.2.1: OpenAI Account Setup

- [ ] **0.2.1.1** Create/verify OpenAI account

  - Go to platform.openai.com
  - Sign up or log in
  - Verify email and phone number
  - **Time:** 10 minutes
  - **Acceptance:** Can access OpenAI dashboard

- [ ] **0.2.1.2** Set up billing

  - Add payment method
  - Set usage limit: $100/month initially
  - Set email alerts at $50, $80, $100
  - **Time:** 10 minutes
  - **Acceptance:** Billing configured, limits set

- [ ] **0.2.1.3** Generate API key
  - Create new secret key
  - Name: `messageai-production`
  - Copy key (only shown once!)
  - Store in AWS Secrets Manager: `messageai/openai-api-key`
  - **Time:** 5 minutes
  - **Acceptance:** API key stored securely

#### Task 0.2.2: OpenAI SDK Integration

- [ ] **0.2.2.1** Install OpenAI SDK in Lambda project

  ```bash
  cd messageai-lambda
  npm install openai@^4.20.0
  ```

  - **Time:** 5 minutes
  - **Acceptance:** Package installed, package.json updated

- [ ] **0.2.2.2** Create OpenAI service wrapper

  ```javascript
  // services/openai.js
  const OpenAI = require("openai");

  class OpenAIService {
    constructor() {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    async chat(messages, tools) {
      // Implementation
    }
  }

  module.exports = OpenAIService;
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Service class created with basic structure

- [ ] **0.2.2.3** Test basic chat completion
  ```javascript
  // Test simple chat (no tools)
  const response = await openaiService.chat([
    { role: "user", content: "Say hello" },
  ]);
  console.log(response); // Should return a greeting
  ```
  - **Time:** 15 minutes
  - **Acceptance:** Can get response from OpenAI

#### Task 0.2.3: Define Function Calling Tools

- [ ] **0.2.3.1** Define getCalendarEvents tool

  ```javascript
  const tools = [
    {
      type: "function",
      function: {
        name: "getCalendarEvents",
        description: "Fetch user's calendar events for a specific date range",
        parameters: {
          type: "object",
          properties: {
            userId: { type: "string" },
            startDate: { type: "string", description: "ISO 8601 date" },
            endDate: { type: "string", description: "ISO 8601 date" },
          },
          required: ["userId", "startDate", "endDate"],
        },
      },
    },
  ];
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Tool definition matches OpenAI spec

- [ ] **0.2.3.2** Define createCalendarEvent tool

  - Properties: userId, title, date, startTime, duration, description, location
  - Required: userId, title, date, startTime, duration
  - **Time:** 15 minutes
  - **Acceptance:** Tool definition complete

- [ ] **0.2.3.3** Define detectConflicts tool

  - Properties: userId, proposedEvent (object with date, startTime, duration)
  - Required: userId, proposedEvent
  - **Time:** 15 minutes
  - **Acceptance:** Tool definition complete

- [ ] **0.2.3.4** Create tools registry
  ```javascript
  // tools/registry.js
  const TOOLS = {
    getCalendarEvents: {
      definition: {...},
      handler: async (args) => { /* implementation */ }
    },
    createCalendarEvent: {...},
    detectConflicts: {...}
  };
  ```
  - **Time:** 20 minutes
  - **Acceptance:** All tools registered with handlers

#### Task 0.2.4: Implement Function Calling Flow

- [ ] **0.2.4.1** Create function executor

  ```javascript
  async function executeToolCall(toolCall) {
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    const tool = TOOLS[toolName];
    if (!tool) throw new Error(`Unknown tool: ${toolName}`);

    return await tool.handler(args);
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can execute tool calls from OpenAI

- [ ] **0.2.4.2** Implement multi-turn conversation loop

  ```javascript
  // Handle when OpenAI returns tool_calls
  while (response.finish_reason === "tool_calls") {
    // Execute each tool call
    // Add results to messages
    // Call OpenAI again
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Can handle multi-step tool orchestration

- [ ] **0.2.4.3** Add error handling and retries
  - Catch rate limit errors (429) → exponential backoff
  - Catch API errors (500) → retry 3 times
  - Catch invalid tool calls → return error to OpenAI
  - **Time:** 30 minutes
  - **Acceptance:** Errors handled gracefully

#### Task 0.2.5: Testing and Validation

- [ ] **0.2.5.1** Test simple query (no tools)

  ```javascript
  // Query: "Hello, how are you?"
  // Expected: Friendly greeting response
  ```

  - **Time:** 10 minutes
  - **Acceptance:** Returns coherent response

- [ ] **0.2.5.2** Test single tool call

  ```javascript
  // Query: "What's on my calendar tomorrow?"
  // Expected: Calls getCalendarEvents tool
  ```

  - **Time:** 15 minutes
  - **Acceptance:** Tool called with correct arguments

- [ ] **0.2.5.3** Test multi-step reasoning

  ```javascript
  // Query: "Book Saturday 3PM for family time"
  // Expected:
  //   1. Calls detectConflicts
  //   2. If no conflict, calls createCalendarEvent
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Multiple tools orchestrated correctly

- [ ] **0.2.5.4** Test error scenarios
  - Rate limit (simulate by making many requests)
  - Invalid tool call (malformed arguments)
  - Tool execution failure
  - **Time:** 20 minutes
  - **Acceptance:** All errors handled without crashes

**Epic 0.2 Total Time:** 2-3 hours

---

### Epic 0.3: Google Calendar API Integration

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Epic 0.1 (Lambda setup)

#### Task 0.3.1: Google Cloud Project Setup

- [ ] **0.3.1.1** Create Google Cloud Project

  - Go to console.cloud.google.com
  - Create new project: `messageai-production`
  - Note project ID
  - **Time:** 10 minutes
  - **Acceptance:** Project visible in console

- [ ] **0.3.1.2** Enable Google Calendar API

  - Go to APIs & Services → Library
  - Search "Google Calendar API"
  - Click "Enable"
  - **Time:** 5 minutes
  - **Acceptance:** API shows as enabled

- [ ] **0.3.1.3** Create OAuth 2.0 credentials

  - Go to APIs & Services → Credentials
  - Create OAuth client ID
  - Application type: Web application
  - Name: `MessageAI Mobile App`
  - Authorized redirect URIs: `https://your-app-domain.com/auth/callback`
  - **Time:** 15 minutes
  - **Acceptance:** Client ID and secret generated

- [ ] **0.3.1.4** Store OAuth credentials
  - Copy Client ID and Client Secret
  - Store in AWS Secrets Manager: `messageai/google-oauth-credentials`
  - Format: JSON with `client_id`, `client_secret`, `redirect_uri`
  - **Time:** 10 minutes
  - **Acceptance:** Credentials stored securely

#### Task 0.3.2: OAuth Flow Implementation (Client-Side)

- [ ] **0.3.2.1** Install Google Sign-In for React Native

  ```bash
  cd messageapp
  npx expo install expo-auth-session expo-web-browser
  ```

  - **Time:** 10 minutes
  - **Acceptance:** Packages installed

- [ ] **0.3.2.2** Create OAuth service

  ```typescript
  // services/googleAuth.ts
  import * as Google from "expo-auth-session/providers/google";

  export const useGoogleAuth = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    return { promptAsync };
  };
  ```

  - **Time:** 45 minutes
  - **Acceptance:** OAuth hook created

- [ ] **0.3.2.3** Implement OAuth flow in app

  - Add "Connect Calendar" button in AI Chat screen
  - On tap → trigger OAuth flow
  - Handle response (authorization code)
  - Exchange code for tokens (call backend)
  - **Time:** 1 hour
  - **Acceptance:** User can complete OAuth flow

- [ ] **0.3.2.4** Store tokens securely in Firestore
  ```typescript
  // After receiving tokens from backend
  await firestore
    .collection("users")
    .doc(userId)
    .collection("tokens")
    .doc("google")
    .set({
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: expiresAt,
      scope: scope,
      grantedAt: new Date(),
    });
  ```
  - **Time:** 30 minutes
  - **Acceptance:** Tokens stored encrypted

#### Task 0.3.3: Google Calendar SDK Integration (Server-Side)

- [ ] **0.3.3.1** Install Google APIs SDK in Lambda

  ```bash
  cd messageai-lambda
  npm install googleapis@^128.0.0
  ```

  - **Time:** 5 minutes
  - **Acceptance:** Package installed

- [ ] **0.3.3.2** Create Calendar service wrapper

  ```javascript
  // services/calendar.js
  const { google } = require("googleapis");

  class CalendarService {
    constructor(accessToken) {
      this.auth = new google.auth.OAuth2();
      this.auth.setCredentials({ access_token: accessToken });
      this.calendar = google.calendar({ version: "v3", auth: this.auth });
    }

    async listEvents(startDate, endDate) {
      // Implementation
    }

    async createEvent(eventDetails) {
      // Implementation
    }
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Service class created

- [ ] **0.3.3.3** Implement token refresh logic

  ```javascript
  async function refreshAccessToken(refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can refresh expired tokens

- [ ] **0.3.3.4** Implement token retrieval from Firestore

  ```javascript
  async function getAccessToken(userId) {
    // Fetch from Firestore
    const tokensDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("tokens")
      .doc("google")
      .get();

    const { accessToken, refreshToken, expiresAt } = tokensDoc.data();

    // Check if expired
    if (new Date() >= expiresAt) {
      // Refresh
      const newToken = await refreshAccessToken(refreshToken);
      // Update Firestore
      return newToken;
    }

    return decrypt(accessToken);
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Token management working

#### Task 0.3.4: Calendar Operations Implementation

- [ ] **0.3.4.1** Implement listEvents

  ```javascript
  async listEvents(userId, startDate, endDate) {
    const accessToken = await getAccessToken(userId);
    const calendar = new CalendarService(accessToken);

    const response = await calendar.calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.data.items;
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can fetch calendar events

- [ ] **0.3.4.2** Implement createEvent

  ```javascript
  async createEvent(userId, eventDetails) {
    const accessToken = await getAccessToken(userId);
    const calendar = new CalendarService(accessToken);

    const event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      location: eventDetails.location,
      start: {
        dateTime: eventDetails.startDateTime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: eventDetails.endDateTime,
        timeZone: 'America/New_York'
      }
    };

    const response = await calendar.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.data;
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can create calendar events

- [ ] **0.3.4.3** Implement updateEvent

  - Similar to createEvent but use `events.update`
  - Include eventId parameter
  - **Time:** 20 minutes
  - **Acceptance:** Can update existing events

- [ ] **0.3.4.4** Implement deleteEvent
  - Use `events.delete` API
  - Include eventId parameter
  - **Time:** 15 minutes
  - **Acceptance:** Can delete events

#### Task 0.3.5: Error Handling

- [ ] **0.3.5.1** Handle OAuth errors

  - User denies permission → Clear error message
  - Invalid credentials → Request re-authentication
  - Token revoked → Show "Reconnect Calendar" option
  - **Time:** 30 minutes
  - **Acceptance:** All OAuth errors handled

- [ ] **0.3.5.2** Handle API rate limits

  - Catch 429 error
  - Implement exponential backoff (1s, 2s, 4s)
  - Max 3 retries
  - **Time:** 20 minutes
  - **Acceptance:** Rate limits handled gracefully

- [ ] **0.3.5.3** Handle API errors
  - 401 Unauthorized → Refresh token
  - 404 Not Found → Event doesn't exist
  - 500 Server Error → Retry
  - **Time:** 20 minutes
  - **Acceptance:** API errors don't crash app

#### Task 0.3.6: Testing and Validation

- [ ] **0.3.6.1** Test OAuth flow end-to-end

  - User taps "Connect Calendar"
  - Completes Google OAuth
  - Tokens saved to Firestore
  - **Time:** 15 minutes
  - **Acceptance:** Can authenticate successfully

- [ ] **0.3.6.2** Test listEvents

  - Create test events in Google Calendar
  - Call listEvents for that date range
  - Verify correct events returned
  - **Time:** 15 minutes
  - **Acceptance:** Returns correct events

- [ ] **0.3.6.3** Test createEvent

  - Create event via API
  - Verify appears in Google Calendar
  - Check all fields (title, time, description)
  - **Time:** 15 minutes
  - **Acceptance:** Event created successfully

- [ ] **0.3.6.4** Test token refresh
  - Wait for token to expire (or manually set expired time)
  - Make API call
  - Verify token refreshed automatically
  - **Time:** 20 minutes
  - **Acceptance:** Token refresh works

**Epic 0.3 Total Time:** 2-3 hours

---

### Epic 0.4: Documentation

**Priority:** P1 (Nice to Have)  
**Estimated Time:** 30-45 minutes  
**Dependencies:** All Phase 0 epics complete

#### Task 0.4.1: Setup Documentation

- [ ] **0.4.1.1** Create AWS setup guide

  - Document: `docs/setup/AWS_SETUP.md`
  - Include: Account creation, IAM setup, Lambda deployment, API Gateway
  - **Time:** 15 minutes
  - **Acceptance:** Step-by-step guide complete

- [ ] **0.4.1.2** Create OpenAI setup guide

  - Document: `docs/setup/OPENAI_SETUP.md`
  - Include: Account creation, API key generation, usage limits
  - **Time:** 10 minutes
  - **Acceptance:** Guide complete

- [ ] **0.4.1.3** Create Google Calendar setup guide

  - Document: `docs/setup/GOOGLE_CALENDAR_SETUP.md`
  - Include: Project creation, OAuth setup, credential management
  - **Time:** 15 minutes
  - **Acceptance:** Guide complete

- [ ] **0.4.1.4** Update main README
  - Add Phase 0 completion status
  - Link to setup guides
  - Add environment variables reference
  - **Time:** 10 minutes
  - **Acceptance:** README updated

**Epic 0.4 Total Time:** 30-45 minutes

---

## Phase 1: AI Chat Assistant

**Goal:** Build conversational AI interface for calendar management

### Epic 1.1: UI Implementation - AI Chat Screen

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 0 complete

#### Task 1.1.1: Create AI Chat Screen Structure

- [ ] **1.1.1.1** Create new screen file

  ```bash
  mkdir -p app/ai-chat
  touch app/ai-chat/index.tsx
  ```

  - **Time:** 5 minutes
  - **Acceptance:** File created

- [ ] **1.1.1.2** Add AI Chat to tab navigator

  ```typescript
  // app/(tabs)/_layout.tsx
  <Tabs.Screen
    name="ai-chat"
    options={{
      title: "AI Assistant",
      tabBarIcon: ({ color }) => (
        <Ionicons name="sparkles" size={24} color={color} />
      ),
    }}
  />
  ```

  - **Time:** 15 minutes
  - **Acceptance:** New tab appears in bottom navigation

- [ ] **1.1.1.3** Create basic screen layout
  ```typescript
  export default function AIChatScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <MessageList />
        <MessageInput />
      </SafeAreaView>
    );
  }
  ```
  - **Time:** 30 minutes
  - **Acceptance:** Screen renders with all sections

#### Task 1.1.2: Header Component

- [ ] **1.1.2.1** Create header component

  ```typescript
  // components/ai-chat/Header.tsx
  export function Header() {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <TouchableOpacity onPress={openSettings}>
          <Ionicons name="settings-outline" size={24} />
        </TouchableOpacity>
      </View>
    );
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Header displays with title and settings icon

- [ ] **1.1.2.2** Add info button with modal

  - Info icon opens modal explaining AI capabilities
  - Modal content: "I can help you manage your calendar..."
  - **Time:** 30 minutes
  - **Acceptance:** Info modal displays on tap

- [ ] **1.1.2.3** Style header
  - Match existing app styling
  - Support light/dark mode
  - **Time:** 20 minutes
  - **Acceptance:** Looks consistent with app

#### Task 1.1.3: Message List Component

- [ ] **1.1.3.1** Create message list component

  ```typescript
  // components/ai-chat/MessageList.tsx
  export function MessageList({ messages }: Props) {
    return (
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        inverted
        style={styles.messageList}
      />
    );
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can render list of messages

- [ ] **1.1.3.2** Implement auto-scroll to bottom

  - Scroll to latest message when new message arrives
  - Smooth animation
  - **Time:** 20 minutes
  - **Acceptance:** Auto-scrolls on new message

- [ ] **1.1.3.3** Add empty state

  - Shows when no messages
  - Friendly message: "👋 Hi! I'm your AI scheduling assistant..."
  - Suggested prompts: "What's on my calendar?", "Book an event", etc.
  - **Time:** 30 minutes
  - **Acceptance:** Empty state displays correctly

- [ ] **1.1.3.4** Add loading state
  - Shows when fetching conversation history
  - Skeleton loaders for messages
  - **Time:** 20 minutes
  - **Acceptance:** Loading state displays

#### Task 1.1.4: Message Bubble Components

- [ ] **1.1.4.1** Create user message bubble

  ```typescript
  // components/ai-chat/UserMessageBubble.tsx
  export function UserMessageBubble({ message }: Props) {
    return (
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.content}</Text>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>
    );
  }
  ```

  - Right-aligned
  - Blue background (#007AFF)
  - White text
  - Rounded corners
  - **Time:** 30 minutes
  - **Acceptance:** User messages display correctly

- [ ] **1.1.4.2** Create AI message bubble

  ```typescript
  // components/ai-chat/AIMessageBubble.tsx
  export function AIMessageBubble({ message }: Props) {
    return (
      <View style={styles.aiBubble}>
        <View style={styles.aiIcon}>🤖</View>
        <View style={styles.aiContent}>
          <Text style={styles.aiText}>{message.content}</Text>
          {message.reasoning && (
            <CollapsibleReasoning reasoning={message.reasoning} />
          )}
          {message.events && <EventList events={message.events} />}
          <FeedbackButtons messageId={message.id} />
        </View>
      </View>
    );
  }
  ```

  - Left-aligned
  - Light gray background
  - Black text (light mode), white text (dark mode)
  - Robot icon
  - **Time:** 45 minutes
  - **Acceptance:** AI messages display with all sections

- [ ] **1.1.4.3** Create collapsible reasoning section

  - Initially collapsed
  - Tap "How I figured this out" to expand
  - Shows AI's thought process
  - **Time:** 30 minutes
  - **Acceptance:** Can expand/collapse reasoning

- [ ] **1.1.4.4** Create event list component

  ```typescript
  // components/ai-chat/EventList.tsx
  export function EventList({ events }: Props) {
    return (
      <View style={styles.eventList}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </View>
    );
  }
  ```

  - Shows calendar events in structured format
  - Time, title, location
  - **Time:** 30 minutes
  - **Acceptance:** Events display formatted

- [ ] **1.1.4.5** Create feedback buttons

  ```typescript
  <View style={styles.feedbackButtons}>
    <TouchableOpacity onPress={() => submitFeedback("helpful")}>
      <Text>👍</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => submitFeedback("not_helpful")}>
      <Text>👎</Text>
    </TouchableOpacity>
  </View>
  ```

  - Thumbs up / thumbs down
  - Haptic feedback on tap
  - **Time:** 20 minutes
  - **Acceptance:** Feedback can be submitted

- [ ] **1.1.4.6** Add message animations
  - Fade in + slide animation (200ms)
  - User messages slide from right
  - AI messages slide from left
  - **Time:** 30 minutes
  - **Acceptance:** Smooth animations

#### Task 1.1.5: Message Input Component

- [ ] **1.1.5.1** Create input component

  ```typescript
  // components/ai-chat/MessageInput.tsx
  export function MessageInput({ onSend }: Props) {
    const [text, setText] = useState("");

    return (
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask about your schedule..."
            multiline
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => onSend(text)}
            disabled={!text.trim()}
            style={[styles.sendButton, !text.trim() && styles.disabled]}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Input works, sends messages

- [ ] **1.1.5.2** Implement auto-growing text input

  - Grows as user types (max 5 lines)
  - Shrinks back when text deleted
  - **Time:** 30 minutes
  - **Acceptance:** Input height adjusts

- [ ] **1.1.5.3** Add keyboard handling

  - Input moves up with keyboard
  - Uses KeyboardAvoidingView
  - Respects safe area insets (home indicator)
  - **Time:** 20 minutes
  - **Acceptance:** Keyboard doesn't cover input

- [ ] **1.1.5.4** Add send button states

  - Disabled (gray) when input empty
  - Enabled (blue) when input has text
  - Loading state while sending
  - **Time:** 20 minutes
  - **Acceptance:** Button states work

- [ ] **1.1.5.5** Clear input after sending
  - Clear text field
  - Reset height to single line
  - **Time:** 10 minutes
  - **Acceptance:** Input clears

#### Task 1.1.6: Thinking Indicator

- [ ] **1.1.6.1** Create thinking indicator component

  ```typescript
  // components/ai-chat/ThinkingIndicator.tsx
  export function ThinkingIndicator() {
    return (
      <View style={styles.thinking}>
        <View style={styles.aiIcon}>🤖</View>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, animatedStyle1]} />
          <Animated.View style={[styles.dot, animatedStyle2]} />
          <Animated.View style={[styles.dot, animatedStyle3]} />
        </View>
      </View>
    );
  }
  ```

  - Three animated dots
  - Pulse animation
  - **Time:** 30 minutes
  - **Acceptance:** Shows while AI is thinking

- [ ] **1.1.6.2** Integrate into message list
  - Show at bottom of list when waiting for AI
  - Remove when AI response arrives
  - **Time:** 15 minutes
  - **Acceptance:** Appears/disappears correctly

**Epic 1.1 Total Time:** 3-4 hours

---

### Epic 1.2: State Management - AI Store

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Epic 1.1

#### Task 1.2.1: Create AI Zustand Store

- [ ] **1.2.1.1** Create store file

  ```typescript
  // stores/aiStore.ts
  import { create } from "zustand";

  interface AIStore {
    messages: Message[];
    isLoading: boolean;
    error: string | null;

    sendMessage: (content: string) => Promise<void>;
    loadConversation: () => Promise<void>;
    clearConversation: () => void;
  }

  export const useAIStore = create<AIStore>((set, get) => ({
    // implementation
  }));
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Store structure defined

- [ ] **1.2.1.2** Implement messages state

  - Store array of messages
  - Add message to state
  - Update message status (sending → sent → error)
  - **Time:** 20 minutes
  - **Acceptance:** Messages can be added/updated

- [ ] **1.2.1.3** Implement loading state

  - Set to true when sending message
  - Set to false when response received
  - Used for thinking indicator
  - **Time:** 10 minutes
  - **Acceptance:** Loading state updates correctly

- [ ] **1.2.1.4** Implement error state
  - Store error messages
  - Clear on next successful request
  - **Time:** 10 minutes
  - **Acceptance:** Errors stored

#### Task 1.2.2: Implement sendMessage Action

- [ ] **1.2.2.1** Create sendMessage function

  ```typescript
  sendMessage: async (content: string) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error("Not authenticated");

    // Add user message optimistically
    const userMessage: Message = {
      id: uuid(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Call AI service
      const response = await aiService.chat(userId, content);

      // Add AI response
      const aiMessage: Message = {
        id: uuid(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
        reasoning: response.reasoning,
        events: response.events,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));

      // Save to Firestore
      await saveConversation(userId, [userMessage, aiMessage]);
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
    }
  };
  ```

  - **Time:** 1 hour
  - **Acceptance:** Can send message and get response

- [ ] **1.2.2.2** Add optimistic UI

  - Message appears immediately
  - Shows "sending" status
  - Updates to "sent" when confirmed
  - **Time:** 20 minutes
  - **Acceptance:** Instant feedback

- [ ] **1.2.2.3** Add conversation context
  - Include last 10 messages in API call
  - Allows AI to maintain context
  - **Time:** 30 minutes
  - **Acceptance:** AI remembers previous context

#### Task 1.2.3: Implement loadConversation Action

- [ ] **1.2.3.1** Fetch from Firestore

  ```typescript
  loadConversation: async () => {
    const userId = useAuthStore.getState().user?.id;

    const conversationsRef = firestore
      .collection("users")
      .doc(userId)
      .collection("ai_conversations")
      .orderBy("updatedAt", "desc")
      .limit(1);

    const snapshot = await conversationsRef.get();

    if (!snapshot.empty) {
      const conversation = snapshot.docs[0].data();
      set({ messages: conversation.turns });
    }
  };
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Loads conversation history

- [ ] **1.2.3.2** Call on screen mount
  - useEffect hook in AIChatScreen
  - Load conversation when screen opens
  - **Time:** 15 minutes
  - **Acceptance:** Messages load automatically

#### Task 1.2.4: Implement Feedback Actions

- [ ] **1.2.4.1** Create submitFeedback function

  ```typescript
  submitFeedback: async (
    messageId: string,
    sentiment: "positive" | "negative"
  ) => {
    await firestore.collection("ai_feedback").add({
      messageId,
      userId: useAuthStore.getState().user?.id,
      sentiment,
      timestamp: new Date(),
    });

    // Update local state
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, feedback: sentiment } : m
      ),
    }));
  };
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Feedback saved

- [ ] **1.2.4.2** Add haptic feedback
  - Vibrate on thumbs up/down
  - Toast: "Thanks for your feedback!"
  - **Time:** 15 minutes
  - **Acceptance:** Haptic feedback works

**Epic 1.2 Total Time:** 2-3 hours

---

### Epic 1.3: AI Service Layer

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 0 complete

#### Task 1.3.1: Create AI Service Module

- [ ] **1.3.1.1** Create service file

  ```typescript
  // services/ai.ts
  const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL;

  export const aiService = {
    chat: async (userId: string, message: string, context?: Message[]) => {
      // implementation
    },

    extractEvent: async (messageText: string, userId: string) => {
      // implementation
    },

    detectConflicts: async (userId: string, proposedEvent: Event) => {
      // implementation
    },
  };
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Service structure created

- [ ] **1.3.1.2** Add authentication headers

  ```typescript
  async function makeAuthenticatedRequest(endpoint: string, body: any) {
    const token = await useAuthStore.getState().getIdToken();

    const response = await fetch(`${AI_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Authenticated requests work

#### Task 1.3.2: Implement chat Method

- [ ] **1.3.2.1** Implement basic chat

  ```typescript
  chat: async (userId: string, message: string, context?: Message[]) => {
    const response = await makeAuthenticatedRequest("/ai/chat", {
      userId,
      message,
      conversationHistory: context?.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      reply: response.reply,
      reasoning: response.reasoning,
      toolsCalled: response.toolsCalled,
      events: response.events,
    };
  };
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Can send/receive chat messages

- [ ] **1.3.2.2** Add error handling

  - Network errors
  - API errors (400, 500)
  - Timeout (30 seconds)
  - **Time:** 30 minutes
  - **Acceptance:** Errors handled gracefully

- [ ] **1.3.2.3** Add retry logic
  - Retry on network errors (3 attempts)
  - Exponential backoff (1s, 2s, 4s)
  - Don't retry on 4xx errors
  - **Time:** 30 minutes
  - **Acceptance:** Retries work

#### Task 1.3.3: Implement extractEvent Method

- [ ] **1.3.3.1** Implement extraction

  ```typescript
  extractEvent: async (messageText: string, userId: string) => {
    const response = await makeAuthenticatedRequest("/ai/extract-event", {
      messageText,
      userId,
    });

    return {
      hasEvent: response.hasEvent,
      event: response.event,
      conflicts: response.conflicts,
      needsConfirmation: response.needsConfirmation,
    };
  };
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Can extract events

- [ ] **1.3.3.2** Add validation
  - Validate response structure
  - Handle malformed responses
  - **Time:** 20 minutes
  - **Acceptance:** Validates responses

#### Task 1.3.4: Implement detectConflicts Method

- [ ] **1.3.4.1** Implement conflict detection

  ```typescript
  detectConflicts: async (userId: string, proposedEvent: Event) => {
    const response = await makeAuthenticatedRequest("/ai/detect-conflicts", {
      userId,
      proposedEvent: {
        date: proposedEvent.date,
        startTime: proposedEvent.startTime,
        duration: proposedEvent.duration,
      },
    });

    return {
      hasConflict: response.hasConflict,
      conflicts: response.conflicts,
      alternativeTimes: response.alternativeTimes,
    };
  };
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Can detect conflicts

#### Task 1.3.5: Testing

- [ ] **1.3.5.1** Test chat method

  - Send simple query
  - Verify response structure
  - **Time:** 15 minutes
  - **Acceptance:** Returns valid response

- [ ] **1.3.5.2** Test with conversation context

  - Send multiple messages
  - Verify AI remembers context
  - **Time:** 20 minutes
  - **Acceptance:** Context maintained

- [ ] **1.3.5.3** Test error scenarios
  - Network offline
  - API returns 500
  - Malformed response
  - **Time:** 30 minutes
  - **Acceptance:** Errors handled

**Epic 1.3 Total Time:** 3-4 hours

---

### Epic 1.4: Lambda Implementation - Chat Endpoint

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 0 complete

#### Task 1.4.1: Implement /ai/chat Endpoint

- [ ] **1.4.1.1** Create chat handler

  ```javascript
  // handlers/chat.js
  async function handleChat(event) {
    const { userId, message, conversationHistory } = JSON.parse(event.body);

    // Build messages array for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Call OpenAI
    const response = await openaiService.chat(messages, TOOLS);

    // Return formatted response
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: response.reply,
        reasoning: response.reasoning,
        toolsCalled: response.toolsCalled,
        events: response.events,
      }),
    };
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Endpoint returns responses

- [ ] **1.4.1.2** Implement tool execution logic

  - When OpenAI returns tool_calls
  - Execute each tool (getCalendarEvents, etc.)
  - Add results to messages
  - Call OpenAI again for natural language response
  - **Time:** 1.5 hours
  - **Acceptance:** Tools execute correctly

- [ ] **1.4.1.3** Add conversation state management
  - Track multi-turn conversations
  - Store intermediate tool results
  - **Time:** 30 minutes
  - **Acceptance:** Multi-turn works

#### Task 1.4.2: Implement System Prompt

- [ ] **1.4.2.1** Create scheduling assistant prompt

  ```javascript
  const SYSTEM_PROMPT = `
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
  5. Use 12-hour time format (3 PM, not 15:00)
  
  When you detect a conflict:
  - Clearly explain what conflicts
  - Mention when the conflict is
  - Suggest alternatives
  `;
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Prompt is clear and comprehensive

- [ ] **1.4.2.2** Test prompt effectiveness
  - Send various queries
  - Verify AI behavior matches guidelines
  - Refine prompt as needed
  - **Time:** 45 minutes
  - **Acceptance:** AI follows guidelines

#### Task 1.4.3: Error Handling and Logging

- [ ] **1.4.3.1** Add comprehensive error handling

  - Catch OpenAI errors
  - Catch calendar API errors
  - Catch malformed requests
  - **Time:** 30 minutes
  - **Acceptance:** All errors caught

- [ ] **1.4.3.2** Add CloudWatch logging

  - Log every request (userId, query)
  - Log tool calls
  - Log errors with stack traces
  - **Time:** 20 minutes
  - **Acceptance:** Logs visible in CloudWatch

- [ ] **1.4.3.3** Add performance logging
  - Log total request time
  - Log OpenAI API time
  - Log calendar API time
  - **Time:** 20 minutes
  - **Acceptance:** Can track performance

#### Task 1.4.4: Testing

- [ ] **1.4.4.1** Test simple queries

  - "What's on my calendar tomorrow?"
  - "When am I free this week?"
  - **Time:** 30 minutes
  - **Acceptance:** Returns correct responses

- [ ] **1.4.4.2** Test event creation

  - "Book Saturday 3PM for family time"
  - Verify AI confirms before creating
  - Verify event created in calendar
  - **Time:** 30 minutes
  - **Acceptance:** Creates events correctly

- [ ] **1.4.4.3** Test conflict detection
  - Request time that conflicts
  - Verify AI detects and warns
  - Verify suggests alternatives
  - **Time:** 30 minutes
  - **Acceptance:** Conflict detection works

**Epic 1.4 Total Time:** 3-4 hours

---

### Epic 1.5: Firestore Schema Implementation

**Priority:** P0 (Critical)  
**Estimated Time:** 1-2 hours  
**Dependencies:** None (can be done in parallel)

#### Task 1.5.1: Create Collections

- [ ] **1.5.1.1** Define ai_conversations collection

  - Path: `/users/{userId}/ai_conversations/{conversationId}`
  - Fields: id, userId, createdAt, updatedAt, status, turns, metadata
  - **Time:** 15 minutes
  - **Acceptance:** Collection structure defined

- [ ] **1.5.1.2** Define calendar_tokens collection

  - Path: `/users/{userId}/tokens/google`
  - Fields: accessToken (encrypted), refreshToken (encrypted), expiresAt, scope
  - **Time:** 15 minutes
  - **Acceptance:** Collection structure defined

- [ ] **1.5.1.3** Define ai_preferences collection

  - Path: `/users/{userId}/ai_preferences`
  - Fields: aiEnabled, conflictDetectionEnabled, defaultEventDuration, etc.
  - **Time:** 15 minutes
  - **Acceptance:** Collection structure defined

- [ ] **1.5.1.4** Define ai_feedback collection
  - Path: `/ai_feedback/{feedbackId}`
  - Fields: userId, messageId, sentiment, comment, timestamp
  - **Time:** 10 minutes
  - **Acceptance:** Collection structure defined

#### Task 1.5.2: Implement Security Rules

- [ ] **1.5.2.1** Rules for ai_conversations

  ```javascript
  match /users/{userId}/ai_conversations/{conversationId} {
    allow read, write: if request.auth.uid == userId;
  }
  ```

  - **Time:** 15 minutes
  - **Acceptance:** Rules deployed

- [ ] **1.5.2.2** Rules for calendar_tokens

  ```javascript
  match /users/{userId}/tokens/{tokenId} {
    allow read, write: if request.auth.uid == userId;
  }
  ```

  - **Time:** 10 minutes
  - **Acceptance:** Rules deployed

- [ ] **1.5.2.3** Rules for ai_preferences

  ```javascript
  match /users/{userId}/ai_preferences {
    allow read, write: if request.auth.uid == userId;
  }
  ```

  - **Time:** 10 minutes
  - **Acceptance:** Rules deployed

- [ ] **1.5.2.4** Rules for ai_feedback
  ```javascript
  match /ai_feedback/{feedbackId} {
    allow create: if request.auth != null;
    allow read, update, delete: if false;
  }
  ```
  - **Time:** 10 minutes
  - **Acceptance:** Rules deployed

#### Task 1.5.3: Create Helper Functions

- [ ] **1.5.3.1** Create saveConversation function

  ```typescript
  async function saveConversation(userId: string, messages: Message[]) {
    const conversationRef = firestore
      .collection("users")
      .doc(userId)
      .collection("ai_conversations")
      .doc();

    await conversationRef.set({
      id: conversationRef.id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      turns: messages,
      metadata: {
        totalTurns: messages.length,
        toolsCalled: [],
        eventsCreated: 0,
      },
    });
  }
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Can save conversations

- [ ] **1.5.3.2** Create loadConversation function

  - **Time:** 15 minutes
  - **Acceptance:** Can load conversations

- [ ] **1.5.3.3** Create saveTokens function (with encryption)
  - **Time:** 30 minutes
  - **Acceptance:** Tokens saved encrypted

**Epic 1.5 Total Time:** 1-2 hours

---

## Phase 2: Intelligent Conflict Detection

**Goal:** Implement inline AI that flags conflicts in messages

### Epic 2.1: Message Analysis System

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 1 complete

#### Task 2.1.1: Add "Analyze with AI" to Message Context Menu

- [ ] **2.1.1.1** Update MessageBubble component

  ```typescript
  // components/chat/MessageBubble.tsx
  const onLongPress = () => {
    showActionSheet(
      {
        options: [
          "Reply",
          "Copy",
          "Analyze with AI", // NEW
          "Delete",
          "Cancel",
        ],
        cancelButtonIndex: 4,
        destructiveButtonIndex: 3,
      },
      (index) => {
        if (index === 2) {
          analyzeMessageWithAI();
        }
      }
    );
  };
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Option appears in action sheet

- [ ] **2.1.1.2** Implement analyzeMessageWithAI function

  ```typescript
  async function analyzeMessageWithAI(messageId: string) {
    setAnalyzing(true);

    try {
      const message = messages.find((m) => m.id === messageId);
      const result = await aiService.extractEvent(message.text, currentUserId);

      if (result.hasEvent) {
        // Save suggestion to Firestore
        await saveSuggestion(messageId, result);

        // Show badge on message
        updateMessageWithSuggestion(messageId);

        // Show modal
        showSuggestionModal(result);
      } else {
        showToast("No scheduling information found");
      }
    } catch (error) {
      showToast("Failed to analyze message");
    } finally {
      setAnalyzing(false);
    }
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Can analyze messages

- [ ] **2.1.1.3** Add loading state during analysis
  - Show activity indicator
  - Disable other actions
  - **Time:** 20 minutes
  - **Acceptance:** Loading state displays

#### Task 2.1.2: Implement saveSuggestion Function

- [ ] **2.1.2.1** Save to Firestore

  ```typescript
  async function saveSuggestion(messageId: string, analysis: EventExtraction) {
    const suggestionRef = firestore
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId)
      .collection("ai_suggestions")
      .doc();

    await suggestionRef.set({
      id: suggestionRef.id,
      messageId,
      conversationId,
      userId: currentUserId,
      createdAt: new Date(),
      type:
        analysis.conflicts.length > 0 ? "conflict_detected" : "event_extracted",
      extractedEvent: analysis.event,
      conflict:
        analysis.conflicts.length > 0
          ? {
              proposedEvent: analysis.event,
              conflictingEvents: analysis.conflicts,
              severity: calculateSeverity(analysis.conflicts),
            }
          : null,
      userAction: null,
    });

    // Update message document
    await firestore
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId)
      .update({
        hasAISuggestion: true,
        aiSuggestionType:
          analysis.conflicts.length > 0
            ? "conflict_detected"
            : "event_extracted",
      });
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Suggestions saved to Firestore

- [ ] **2.1.2.2** Calculate conflict severity

  ```typescript
  function calculateSeverity(conflicts: Conflict[]): "high" | "medium" | "low" {
    const maxOverlap = Math.max(...conflicts.map((c) => c.overlapMinutes));

    if (maxOverlap > 60) return "high";
    if (maxOverlap > 30) return "medium";
    return "low";
  }
  ```

  - **Time:** 15 minutes
  - **Acceptance:** Severity calculated correctly

#### Task 2.1.3: Update Message Display with Badge

- [ ] **2.1.3.1** Add badge to message bubble

  ```typescript
  // components/chat/MessageBubble.tsx
  {
    message.hasAISuggestion && (
      <AISuggestionBadge
        type={message.aiSuggestionType}
        onPress={() => showSuggestionModal(messageId)}
      />
    );
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Badge displays on messages

- [ ] **2.1.3.2** Listen for suggestion updates
  - Real-time listener on ai_suggestions subcollection
  - Update message when suggestion added
  - **Time:** 30 minutes
  - **Acceptance:** Badge appears automatically

**Epic 2.1 Total Time:** 2-3 hours

---

### Epic 2.2: AI Pop-up Components

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** Epic 2.1

#### Task 2.2.1: Create AISuggestionBadge Component

- [ ] **2.2.1.1** Create badge component

  ```typescript
  // components/chat/AISuggestionBadge.tsx
  export function AISuggestionBadge({ type, onPress }: Props) {
    const icon = type === "conflict_detected" ? "⚠️" : "📅";
    const text =
      type === "conflict_detected" ? "Conflict detected" : "Event found";
    const bgColor = type === "conflict_detected" ? "#FFF9E6" : "#E6F9E6";

    return (
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: bgColor }]}
        onPress={onPress}
        accessibilityLabel="AI scheduling suggestion"
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    );
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Badge renders correctly

- [ ] **2.2.1.2** Add fade-in animation

  - Animate opacity from 0 to 1
  - Duration: 300ms
  - **Time:** 20 minutes
  - **Acceptance:** Smooth animation

- [ ] **2.2.1.3** Position badge correctly
  - Bottom-left of message bubble
  - Margin: 8px top
  - Don't overlap with message text
  - **Time:** 20 minutes
  - **Acceptance:** Position looks good

#### Task 2.2.2: Create Conflict Modal

- [ ] **2.2.2.1** Create modal component

  ```typescript
  // components/chat/ConflictModal.tsx
  export function ConflictModal({
    visible,
    suggestion,
    onClose,
    onAction,
  }: Props) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.container}>
          <Header title="⚠️ Schedule Conflict" onClose={onClose} />
          <ScrollView>
            <ProposedEventSection event={suggestion.extractedEvent} />
            <ConflictsSection
              conflicts={suggestion.conflict.conflictingEvents}
            />
            {suggestion.alternativeTimes && (
              <AlternativesSection times={suggestion.alternativeTimes} />
            )}
          </ScrollView>
          <Actions>
            <Button
              variant="secondary"
              onPress={() => onAction("view_calendar")}
              icon="calendar"
            >
              View Calendar
            </Button>
            <Button variant="secondary" onPress={() => onAction("dismiss")}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              onPress={() => onAction("book_anyway")}
              warning
            >
              Book Anyway
            </Button>
          </Actions>
        </SafeAreaView>
      </Modal>
    );
  }
  ```

  - **Time:** 1.5 hours
  - **Acceptance:** Modal displays all sections

- [ ] **2.2.2.2** Create ProposedEventSection

  - Shows extracted event details
  - Title, date, time, duration
  - **Time:** 30 minutes
  - **Acceptance:** Event details display

- [ ] **2.2.2.3** Create ConflictsSection

  - Lists all conflicting events
  - Shows time overlap
  - Highlight severity (high/medium/low)
  - **Time:** 45 minutes
  - **Acceptance:** Conflicts display clearly

- [ ] **2.2.2.4** Create AlternativesSection
  - Shows suggested alternative times
  - Tap to select alternative
  - **Time:** 30 minutes
  - **Acceptance:** Alternatives selectable

#### Task 2.2.3: Create Event Extraction Modal

- [ ] **2.2.3.1** Create modal for no-conflict scenario

  ```typescript
  // components/chat/EventExtractionModal.tsx
  export function EventExtractionModal({
    visible,
    suggestion,
    onClose,
    onAction,
  }: Props) {
    const [editing, setEditing] = useState(false);
    const [event, setEvent] = useState(suggestion.extractedEvent);

    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView>
          <Header title="📅 Event Found" onClose={onClose} />
          <Content>
            <Text style={styles.description}>
              I found a scheduling detail. Add to calendar?
            </Text>
            <EventForm event={event} editable={editing} onChange={setEvent} />
            <ConfidenceIndicator
              confidence={suggestion.extractedEvent.confidence}
            />
          </Content>
          <Actions>
            <Button onPress={() => setEditing(!editing)}>
              {editing ? "Done" : "Edit Details"}
            </Button>
            <Button variant="secondary" onPress={onClose}>
              Not Now
            </Button>
            <Button
              variant="primary"
              onPress={() => onAction("add_to_calendar", event)}
            >
              Add to Calendar
            </Button>
          </Actions>
        </SafeAreaView>
      </Modal>
    );
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Modal works for no-conflict case

- [ ] **2.2.3.2** Create EventForm component

  - Editable fields: title, date, time, duration
  - Date picker for date
  - Time picker for time
  - **Time:** 1 hour
  - **Acceptance:** Can edit event details

- [ ] **2.2.3.3** Create ConfidenceIndicator
  - Shows confidence percentage
  - Visual indicator (progress bar or color)
  - **Time:** 20 minutes
  - **Acceptance:** Confidence displayed

#### Task 2.2.4: Implement Modal Actions

- [ ] **2.2.4.1** Implement "View Calendar" action

  ```typescript
  async function handleViewCalendar(date: Date) {
    const calendarUrl = Platform.select({
      ios: `calshow:${Math.floor(date.getTime() / 1000)}`,
      android: `content://com.android.calendar/time/${date.getTime()}`,
    });

    const canOpen = await Linking.canOpenURL(calendarUrl);
    if (canOpen) {
      await Linking.openURL(calendarUrl);
    } else {
      // Fallback to Google Calendar web
      const webUrl = `https://calendar.google.com/calendar/r/day/${formatDate(
        date
      )}`;
      await Linking.openURL(webUrl);
    }
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Opens calendar app

- [ ] **2.2.4.2** Implement "Book Anyway" action

  ```typescript
  async function handleBookAnyway(event: Event, conflicts: Conflict[]) {
    // Show confirmation
    Alert.alert(
      "Confirm Double Booking",
      `This overlaps with ${conflicts.length} event(s). Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Anyway",
          style: "destructive",
          onPress: async () => {
            await createCalendarEvent(event);
            await logManualOverride(event, conflicts);
            showToast("✓ Event added to calendar");
          },
        },
      ]
    );
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Creates event with confirmation

- [ ] **2.2.4.3** Implement "Add to Calendar" action

  ```typescript
  async function handleAddToCalendar(event: Event) {
    try {
      const created = await calendarService.createEvent(currentUserId, event);

      // Update Firestore suggestion
      await updateSuggestion(suggestionId, {
        userAction: "accepted",
        userActionAt: new Date(),
      });

      showToast("✓ Event added to calendar");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Creates event successfully

- [ ] **2.2.4.4** Implement "Dismiss" action

  ```typescript
  async function handleDismiss(suggestionId: string) {
    await updateSuggestion(suggestionId, {
      userAction: "dismissed",
      userActionAt: new Date(),
    });

    onClose();
  }
  ```

  - **Time:** 15 minutes
  - **Acceptance:** Logs dismissal

**Epic 2.2 Total Time:** 3-4 hours

---

### Epic 2.3: Lambda Implementation - Extract Event Endpoint

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 0 complete

#### Task 2.3.1: Implement /ai/extract-event Endpoint

- [ ] **2.3.1.1** Create handler

  ```javascript
  // handlers/extractEvent.js
  async function handleExtractEvent(event) {
    const { messageText, userId, conversationId, messageId } = JSON.parse(
      event.body
    );

    // Call OpenAI for event extraction
    const extraction = await openaiService.extractEvent(messageText);

    if (!extraction.hasEvent) {
      return {
        statusCode: 200,
        body: JSON.stringify({ hasEvent: false }),
      };
    }

    // Check for conflicts
    const conflicts = await calendarService.detectConflicts(
      userId,
      extraction.event
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        hasEvent: true,
        event: extraction.event,
        conflicts,
        needsConfirmation: extraction.confidence < 0.7,
      }),
    };
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Endpoint returns event extraction

- [ ] **2.3.1.2** Create event extraction prompt

  ```javascript
  const EVENT_EXTRACTION_PROMPT = `
  Extract scheduling information from the following text.
  
  Output JSON format:
  {
    "hasEvent": boolean,
    "event": {
      "title": string,
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "duration": number (minutes),
      "confidence": number (0-1)
    },
    "ambiguousFields": string[],
    "needsConfirmation": boolean
  }
  
  Rules:
  1. Extract explicit dates/times
  2. Infer reasonable defaults (1 hour duration)
  3. Flag ambiguous information
  4. Be conservative
  `;
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Prompt is comprehensive

- [ ] **2.3.1.3** Implement conflict detection logic

  ```javascript
  async function detectConflicts(userId, proposedEvent) {
    // Get calendar events for that date
    const events = await calendarService.listEvents(
      userId,
      proposedEvent.date,
      proposedEvent.date
    );

    // Calculate overlaps
    const conflicts = events
      .filter((event) => {
        return hasTimeOverlap(proposedEvent, event);
      })
      .map((event) => ({
        ...event,
        overlapMinutes: calculateOverlap(proposedEvent, event),
      }));

    return conflicts;
  }

  function hasTimeOverlap(event1, event2) {
    const start1 = parseTime(event1.time);
    const end1 = start1 + event1.duration;
    const start2 = parseTime(event2.start.dateTime);
    const end2 = parseTime(event2.end.dateTime);

    return start1 < end2 && end1 > start2;
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Conflicts detected accurately

#### Task 2.3.2: Testing

- [ ] **2.3.2.1** Test event extraction

  - Message: "Soccer practice Saturday 3PM"
  - Expected: Extracts title, date, time
  - **Time:** 20 minutes
  - **Acceptance:** Extraction works

- [ ] **2.3.2.2** Test conflict detection

  - Pre-populate calendar with event
  - Extract conflicting event
  - Verify conflict returned
  - **Time:** 30 minutes
  - **Acceptance:** Conflicts detected

- [ ] **2.3.2.3** Test ambiguous dates
  - Message: "Let's meet next Friday"
  - Expected: needsConfirmation=true
  - **Time:** 20 minutes
  - **Acceptance:** Ambiguity flagged

**Epic 2.3 Total Time:** 2-3 hours

---

### Epic 2.4: Calendar Service Updates

**Priority:** P0 (Critical)  
**Estimated Time:** 1-2 hours  
**Dependencies:** Phase 0 Epic 0.3

#### Task 2.4.1: Add Caching to Calendar Service

- [ ] **2.4.1.1** Implement in-memory cache

  ```typescript
  // services/calendar.ts
  const cache = new Map<string, { events: Event[]; timestamp: Date }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async function getEvents(
    userId: string,
    startDate: Date,
    endDate: Date,
    forceRefresh: boolean = false
  ): Promise<Event[]> {
    const cacheKey = `${userId}-${startDate.toISOString()}-${endDate.toISOString()}`;

    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < CACHE_TTL) {
        return cached.events;
      }
    }

    // Fetch from API
    const events = await fetchFromGoogleCalendar(userId, startDate, endDate);

    // Cache
    cache.set(cacheKey, { events, timestamp: new Date() });

    return events;
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Caching works

- [ ] **2.4.1.2** Invalidate cache on write operations
  - Clear cache when event created/updated/deleted
  - **Time:** 20 minutes
  - **Acceptance:** Cache invalidates correctly

#### Task 2.4.2: Add Error Recovery

- [ ] **2.4.2.1** Implement retry logic

  - Retry on network errors (3 attempts)
  - Exponential backoff
  - **Time:** 30 minutes
  - **Acceptance:** Retries work

- [ ] **2.4.2.2** Add fallback to cached data
  - If API fails, return cached data with warning
  - **Time:** 20 minutes
  - **Acceptance:** Fallback works

**Epic 2.4 Total Time:** 1-2 hours

---

### Epic 2.5: Testing & Validation

**Priority:** P0 (Critical)  
**Estimated Time:** 1-2 hours  
**Dependencies:** All Phase 2 epics

#### Task 2.5.1: End-to-End Testing

- [ ] **2.5.1.1** Test complete conflict detection flow

  1. Receive message with scheduling info
  2. Long-press → "Analyze with AI"
  3. AI detects conflict
  4. Badge appears
  5. Tap badge → Modal opens
  6. View conflict details

  - **Time:** 30 minutes
  - **Acceptance:** Full flow works

- [ ] **2.5.1.2** Test no-conflict flow

  1. Analyze message
  2. No conflicts found
  3. Different badge appears
  4. Tap → Event extraction modal
  5. Add to calendar

  - **Time:** 20 minutes
  - **Acceptance:** Flow works

- [ ] **2.5.1.3** Test error scenarios
  - Calendar permission denied
  - Network failure
  - API error
  - **Time:** 30 minutes
  - **Acceptance:** Errors handled

#### Task 2.5.2: Performance Testing

- [ ] **2.5.2.1** Measure latency

  - Analysis should complete in <2 seconds
  - **Time:** 15 minutes
  - **Acceptance:** Meets target

- [ ] **2.5.2.2** Test with multiple messages
  - Analyze 10 messages in a row
  - Verify no slowdown
  - **Time:** 15 minutes
  - **Acceptance:** Performance stable

#### Task 2.5.3: User Testing

- [ ] **2.5.3.1** Test with real scheduling messages
  - Forward real messages to app
  - Test various formats
  - **Time:** 30 minutes
  - **Acceptance:** Handles real messages

**Epic 2.5 Total Time:** 1-2 hours

---

## Phase 3: Polish & Edge Cases

**Goal:** Handle all edge cases, optimize costs, collect feedback

### Epic 3.1: Comprehensive Error Handling

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 1 & 2 complete

#### Task 3.1.1: Calendar Permission Denied

- [ ] **3.1.1.1** Detect permission error

  ```typescript
  try {
    await calendarService.getEvents(...);
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      handleCalendarPermissionDenied();
    }
  }
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Detects permission errors

- [ ] **3.1.1.2** Show clear error message

  ```typescript
  Alert.alert(
    "Calendar Access Required",
    "To use AI scheduling features, please grant calendar access.",
    [
      {
        text: "Open Settings",
        onPress: () => Linking.openSettings(),
      },
      { text: "Not Now", style: "cancel" },
    ]
  );
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Alert displays with actions

- [ ] **3.1.1.3** Disable calendar features gracefully

  - Update user preferences: calendarConnected = false
  - Show warning in AI Chat: "Calendar access needed..."
  - Disable conflict detection
  - **Time:** 45 minutes
  - **Acceptance:** Features disabled gracefully

- [ ] **3.1.1.4** Add reconnect flow
  - "Connect Calendar" button in settings
  - Retry OAuth flow
  - **Time:** 30 minutes
  - **Acceptance:** Can reconnect

#### Task 3.1.2: OpenAI API Rate Limit

- [ ] **3.1.2.1** Detect rate limit error

  ```typescript
  try {
    await openai.chat.completions.create(...);
  } catch (error) {
    if (error.code === 'rate_limit_exceeded') {
      handleRateLimit(request);
    }
  }
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Detects rate limits

- [ ] **3.1.2.2** Implement request queue

  ```typescript
  class RequestQueue {
    private queue: Request[] = [];

    async add(request: Request) {
      this.queue.push(request);
      await this.saveToStorage();
    }

    async process() {
      while (this.queue.length > 0) {
        const request = this.queue[0];
        try {
          await executeRequest(request);
          this.queue.shift();
        } catch (error) {
          if (error.code === "rate_limit_exceeded") {
            // Exponential backoff
            await sleep(Math.pow(2, request.retryCount) * 1000);
            request.retryCount++;
          } else {
            this.queue.shift(); // Remove failed request
          }
        }
      }
    }
  }
  ```

  - **Time:** 1.5 hours
  - **Acceptance:** Queue works

- [ ] **3.1.2.3** Show user-friendly message

  ```typescript
  showToast({
    message: "AI assistant is busy. Processing your request...",
    duration: 3000,
    type: "info",
  });
  ```

  - **Time:** 15 minutes
  - **Acceptance:** Toast displays

- [ ] **3.1.2.4** Notify when request completes
  - Local notification when queued request finishes
  - **Time:** 30 minutes
  - **Acceptance:** Notifications work

#### Task 3.1.3: Ambiguous Date/Time Handling

- [ ] **3.1.3.1** Detect ambiguous dates

  - confidence < 0.7
  - OR ambiguousFields includes 'date' or 'time'
  - **Time:** 20 minutes
  - **Acceptance:** Detects ambiguity

- [ ] **3.1.3.2** Create clarification modal

  ```typescript
  // components/ai-chat/DateClarificationModal.tsx
  export function DateClarificationModal({
    extractedEvent,
    options,
    onSelect,
  }: Props) {
    return (
      <Modal>
        <Text>
          I found "{extractedEvent.date}" but I'm not sure which date.
        </Text>
        {options.map((option) => (
          <TouchableOpacity
            key={option.date}
            onPress={() => onSelect(option.date)}
          >
            <Text>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </Modal>
    );
  }
  ```

  - **Time:** 45 minutes
  - **Acceptance:** Modal allows date selection

- [ ] **3.1.3.3** Generate date options

  ```typescript
  function generateDateOptions(ambiguousDate: string): DateOption[] {
    // "next Friday" → Oct 25 or Nov 1?
    // "tomorrow" → Depends on current time
    // etc.
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Generates correct options

- [ ] **3.1.3.4** Update event with selected date
  - User selects date
  - Update extraction
  - Proceed with conflict detection
  - **Time:** 30 minutes
  - **Acceptance:** Selection works

#### Task 3.1.4: Wrong Event Extraction

- [ ] **3.1.4.1** Always show extracted details before creating

  - Already implemented in EventExtractionModal
  - Verify user can review
  - **Time:** 10 minutes (verification)
  - **Acceptance:** User sees details

- [ ] **3.1.4.2** Allow editing before confirmation

  - Already implemented with EventForm
  - Verify all fields editable
  - **Time:** 10 minutes (verification)
  - **Acceptance:** Can edit

- [ ] **3.1.4.3** Create feedback/correction form

  ```typescript
  // components/ai-chat/CorrectionModal.tsx
  export function CorrectionModal({ originalExtraction, onSubmit }: Props) {
    const [corrected, setCorrected] = useState(originalExtraction);

    return (
      <Modal>
        <Text>Help improve AI accuracy</Text>
        <EventForm event={corrected} onChange={setCorrected} />
        <Button onPress={() => onSubmit(corrected, "corrected")}>
          Submit Correction
        </Button>
        <Button onPress={() => onSubmit(null, "completely_wrong")}>
          This is completely wrong
        </Button>
      </Modal>
    );
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Can submit corrections

- [ ] **3.1.4.4** Store corrections in Firestore
  ```typescript
  await firestore.collection("ai_feedback").add({
    userId,
    messageId,
    messageText,
    originalExtraction,
    userCorrection: corrected,
    feedbackType: "correction",
    timestamp: new Date(),
  });
  ```
  - **Time:** 20 minutes
  - **Acceptance:** Corrections saved

#### Task 3.1.5: Network Failure

- [ ] **3.1.5.1** Detect network status

  ```typescript
  import NetInfo from "@react-native-community/netinfo";

  NetInfo.addEventListener((state) => {
    if (!state.isConnected) {
      showOfflineBanner();
    } else {
      hideOfflineBanner();
    }
  });
  ```

  - **Time:** 20 minutes
  - **Acceptance:** Network status detected

- [ ] **3.1.5.2** Show offline banner

  - Persistent banner at top: "You're offline. AI features unavailable."
  - Orange background
  - **Time:** 30 minutes
  - **Acceptance:** Banner displays

- [ ] **3.1.5.3** Disable AI features when offline

  - Gray out AI Chat tab
  - Disable "Analyze with AI" option
  - Show toast if user tries to use
  - **Time:** 30 minutes
  - **Acceptance:** Features disabled

- [ ] **3.1.5.4** Queue operations for when online
  - Store failed requests
  - Retry when network restored
  - **Time:** 45 minutes
  - **Acceptance:** Sync works when back online

**Epic 3.1 Total Time:** 3-4 hours

---

### Epic 3.2: Cost Optimization

**Priority:** P1 (Nice to Have)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 1 complete

#### Task 3.2.1: Smart Model Selection

- [ ] **3.2.1.1** Implement model selector

  ```javascript
  function selectModel(task) {
    const simpleTasks = [
      "date_extraction",
      "time_extraction",
      "simple_yes_no",
      "title_extraction",
    ];

    if (simpleTasks.includes(task.type)) {
      return "gpt-4o-mini"; // Cheaper
    }

    return "gpt-4o"; // Complex reasoning
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Model selection works

- [ ] **3.2.1.2** Update OpenAI calls to use selector

  - Classify task before calling
  - Pass appropriate model
  - **Time:** 45 minutes
  - **Acceptance:** Uses correct model

- [ ] **3.2.1.3** Log model usage
  - Track which model used per request
  - CloudWatch metrics
  - **Time:** 30 minutes
  - **Acceptance:** Usage logged

#### Task 3.2.2: Response Caching

- [ ] **3.2.2.1** Implement cache

  ```javascript
  class AIResponseCache {
    cache = new Map();

    generateKey(query) {
      return crypto
        .createHash("md5")
        .update(query.toLowerCase().trim())
        .digest("hex");
    }

    async get(query) {
      const key = this.generateKey(query);
      const entry = this.cache.get(key);

      if (!entry) return null;

      const age = Date.now() - entry.timestamp;
      if (age > 3600000) {
        // 1 hour
        this.cache.delete(key);
        return null;
      }

      return entry.response;
    }

    set(query, response) {
      const key = this.generateKey(query);
      this.cache.set(key, {
        response,
        timestamp: Date.now(),
      });
    }
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Caching works

- [ ] **3.2.2.2** Integrate into AI service
  - Check cache before API call
  - Save response to cache
  - **Time:** 30 minutes
  - **Acceptance:** Cache integrated

#### Task 3.2.3: Budget Monitoring

- [ ] **3.2.3.1** Implement cost tracking

  ```javascript
  class CostMonitor {
    async trackRequest(model, inputTokens, outputTokens) {
      const cost = this.calculateCost(model, inputTokens, outputTokens);

      await this.updateMetrics(cost);

      if (this.metrics.dailyCost > this.dailyBudget * 0.9) {
        await this.alertBudgetThreshold();
      }

      if (this.metrics.dailyCost >= this.dailyBudget) {
        throw new BudgetExceededError();
      }
    }
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Cost tracking works

- [ ] **3.2.3.2** Set up CloudWatch alarms

  - Alert at 80% budget
  - Alert at 90% budget
  - Alert at 100% budget
  - **Time:** 30 minutes
  - **Acceptance:** Alarms configured

- [ ] **3.2.3.3** Create cost dashboard
  - Daily spend
  - Cost per user
  - Most expensive operations
  - **Time:** 1 hour
  - **Acceptance:** Dashboard shows metrics

**Epic 3.2 Total Time:** 2-3 hours

---

### Epic 3.3: User Feedback System

**Priority:** P1 (Nice to Have)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 1 complete

#### Task 3.3.1: Feedback Collection UI

- [ ] **3.3.1.1** Add feedback buttons to AI messages

  - Already implemented in Epic 1.1
  - Verify working correctly
  - **Time:** 10 minutes (verification)
  - **Acceptance:** Buttons work

- [ ] **3.3.1.2** Create feedback detail modal
  ```typescript
  // When user taps thumbs down
  Alert.prompt(
    "Help Us Improve",
    "What could be better?",
    [
      { text: "Skip", style: "cancel" },
      {
        text: "Submit",
        onPress: (comment) => submitDetailedFeedback(sentiment, comment),
      },
    ],
    "plain-text"
  );
  ```
  - **Time:** 30 minutes
  - **Acceptance:** Prompt works

#### Task 3.3.2: Feedback Storage

- [ ] **3.3.2.1** Save feedback to Firestore

  ```typescript
  async function submitFeedback(
    messageId: string,
    sentiment: "positive" | "negative",
    comment?: string
  ) {
    await firestore.collection("ai_feedback").add({
      userId: currentUser.id,
      messageId,
      sentiment,
      comment,
      aiResponse: message.content,
      userQuery: message.replyingTo?.content,
      conversationContext: recentMessages,
      extractedEvent: message.extractedEvent,
      conflictsDetected: message.conflicts,
      timestamp: new Date(),
    });

    showToast("Thanks for your feedback!");
  }
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Feedback saved

- [ ] **3.3.2.2** Add feedback indicator to message
  - Show checkmark when feedback submitted
  - Prevent duplicate feedback
  - **Time:** 20 minutes
  - **Acceptance:** Indicator shows

#### Task 3.3.3: Feedback Analytics (Backend)

- [ ] **3.3.3.1** Create feedback query functions

  ```javascript
  async function getFeedbackAnalytics(dateRange) {
    const feedbackDocs = await firestore
      .collection("ai_feedback")
      .where("timestamp", ">=", dateRange.start)
      .where("timestamp", "<=", dateRange.end)
      .get();

    const feedback = feedbackDocs.docs.map((d) => d.data());

    return {
      total: feedback.length,
      positive: feedback.filter((f) => f.sentiment === "positive").length,
      negative: feedback.filter((f) => f.sentiment === "negative").length,
      positiveRate: calculateRate(feedback, "positive"),
      commonIssues: extractCommonIssues(feedback),
    };
  }
  ```

  - **Time:** 1 hour
  - **Acceptance:** Can query feedback

- [ ] **3.3.3.2** Create feedback dashboard (simple)
  - Script to generate report
  - Run weekly
  - Output: console or email
  - **Time:** 1 hour
  - **Acceptance:** Report generated

#### Task 3.3.4: Use Feedback for Improvements

- [ ] **3.3.4.1** Review feedback weekly

  - Look for patterns
  - Identify prompt improvements
  - **Time:** 30 minutes per week (ongoing)
  - **Acceptance:** Process established

- [ ] **3.3.4.2** Iterate on prompts based on feedback
  - Update system prompts
  - Test improvements
  - **Time:** Ongoing
  - **Acceptance:** Prompts improve over time

**Epic 3.3 Total Time:** 2-3 hours

---

### Epic 3.4: Performance Optimization

**Priority:** P1 (Nice to Have)  
**Estimated Time:** 1-2 hours  
**Dependencies:** Phase 1 & 2 complete

#### Task 3.4.1: Measure Current Performance

- [ ] **3.4.1.1** Add performance logging

  ```javascript
  const startTime = Date.now();

  // ... operation ...

  const duration = Date.now() - startTime;
  console.log(`Operation took ${duration}ms`);

  // Log to CloudWatch
  await cloudwatch.putMetricData({
    Namespace: "MessageAI",
    MetricData: [
      {
        MetricName: "AIResponseTime",
        Value: duration,
        Unit: "Milliseconds",
      },
    ],
  });
  ```

  - **Time:** 30 minutes
  - **Acceptance:** Metrics logged

- [ ] **3.4.1.2** Collect baseline metrics
  - Run 100 test queries
  - Record p50, p95, p99 latencies
  - **Time:** 30 minutes
  - **Acceptance:** Baseline established

#### Task 3.4.2: Optimize Slow Operations

- [ ] **3.4.2.1** Identify bottlenecks

  - OpenAI API calls
  - Calendar API calls
  - Firestore queries
  - **Time:** 20 minutes
  - **Acceptance:** Bottlenecks identified

- [ ] **3.4.2.2** Optimize API calls

  - Batch where possible
  - Add caching
  - Use CDN for static content
  - **Time:** 45 minutes
  - **Acceptance:** Improved latency

- [ ] **3.4.2.3** Optimize Lambda cold starts
  - Increase memory (faster CPU)
  - Provision concurrency (eliminate cold starts)
  - **Time:** 30 minutes
  - **Acceptance:** Cold starts <500ms

#### Task 3.4.3: Verify Improvements

- [ ] **3.4.3.1** Re-run performance tests
  - Compare to baseline
  - Verify targets met
  - **Time:** 30 minutes
  - **Acceptance:** Performance improved

**Epic 3.4 Total Time:** 1-2 hours

---

### Epic 3.5: Documentation & Final Testing

**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours  
**Dependencies:** All Phase 3 epics

#### Task 3.5.1: Update Documentation

- [ ] **3.5.1.1** Update README

  - Add Phase 3 completion
  - Document all edge cases
  - Add troubleshooting guide
  - **Time:** 30 minutes
  - **Acceptance:** README complete

- [ ] **3.5.1.2** Create user guide

  - How to use AI features
  - Common issues and solutions
  - Privacy information
  - **Time:** 45 minutes
  - **Acceptance:** User guide complete

- [ ] **3.5.1.3** Document API endpoints
  - Request/response examples
  - Error codes
  - Rate limits
  - **Time:** 30 minutes
  - **Acceptance:** API docs complete

#### Task 3.5.2: Comprehensive Testing

- [ ] **3.5.2.1** Test all happy paths

  - AI chat queries (5 types)
  - Event extraction (with/without conflicts)
  - Event creation
  - **Time:** 45 minutes
  - **Acceptance:** All features work

- [ ] **3.5.2.2** Test all error scenarios

  - Calendar permission denied
  - Rate limit exceeded
  - Ambiguous dates
  - Wrong extraction
  - Network failure
  - **Time:** 1 hour
  - **Acceptance:** All errors handled

- [ ] **3.5.2.3** Performance testing

  - Verify latency targets met
  - Test with 10+ concurrent users
  - **Time:** 30 minutes
  - **Acceptance:** Performance acceptable

- [ ] **3.5.2.4** Security testing
  - Test with invalid tokens
  - Test with expired OAuth
  - Test SQL injection attempts (should be protected)
  - **Time:** 30 minutes
  - **Acceptance:** Security holds

#### Task 3.5.3: User Acceptance Testing

- [ ] **3.5.3.1** Recruit 5-10 beta testers

  - Parents/caregivers (target persona)
  - Give access to app
  - **Time:** 1 hour (setup)
  - **Acceptance:** Testers onboarded

- [ ] **3.5.3.2** Collect feedback

  - Survey after 1 week
  - Questions: satisfaction, time saved, issues
  - **Time:** Ongoing (1 week)
  - **Acceptance:** Feedback collected

- [ ] **3.5.3.3** Address critical issues
  - Fix any critical bugs reported
  - Prioritize other feedback
  - **Time:** Variable (2-4 hours estimate)
  - **Acceptance:** Critical issues resolved

**Epic 3.5 Total Time:** 2-3 hours (+ 1 week user testing)

---

## Task Status Legend

```
Status Indicators:
[ ] - Not Started
[~] - In Progress
[✓] - Complete
[x] - Blocked
[!] - Needs Attention
```

## Priority Definitions

**P0 - Critical:**

- Blocks other work
- Core functionality
- Must be done to ship MVP

**P1 - Nice to Have:**

- Enhances experience
- Can be deferred if time constrained
- Should be done before launch

**P2 - Future:**

- Not in current scope
- Document for later
