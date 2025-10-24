# MessageAI - Developer Guide

## Overview

This guide provides technical documentation for developers working on or integrating with MessageAI.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [API Documentation](#api-documentation)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring & Debugging](#monitoring--debugging)
10. [Contributing](#contributing)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (iOS)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  UI Layer  │  │   Stores   │  │   Service Layer        │ │
│  │            │  │  (Zustand) │  │  - AI Service          │ │
│  │ - AI Chat  │→ │  - aiStore │→ │  - Calendar Service    │ │
│  │ - Messages │  │  - chatStore│  │  - Auth Service        │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Firebase       │ │  AWS Lambda     │ │  Google APIs    │
│  - Auth         │ │  - AI Handler   │ │  - Calendar API │
│  - Firestore    │ │  - OpenAI       │ │  - OAuth 2.0    │
│  - Storage      │ │  - Tools        │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Data Flow

**AI Chat Request:**

1. User types message → AI Chat Screen
2. Message sent to aiStore
3. aiStore calls AI Service
4. AI Service → AWS Lambda `/ai/chat`
5. Lambda → OpenAI (function calling)
6. Lambda → Google Calendar (if needed)
7. Response → AI Service → aiStore → UI
8. Conversation saved to Firestore

**Message Analysis:**

1. User long-presses message → MessageBubble
2. MessageList → extractEventFromText()
3. AI Service → Lambda `/ai/extract-event`
4. Lambda → OpenAI + Calendar conflict check
5. Response displayed in modal
6. User can book event or dismiss

---

## Tech Stack

### Frontend (React Native/Expo)

- **Framework:** React Native 0.76.x, Expo SDK 54+
- **Language:** TypeScript 5.3+
- **State Management:** Zustand 4.x
- **Navigation:** Expo Router (file-based)
- **UI:** React Native built-in components
- **Network:** Fetch API + NetInfo
- **Auth:** Firebase Auth 10.x
- **Database:** Firebase Firestore 10.x

### Backend (AWS Lambda)

- **Runtime:** Node.js 20.x
- **Language:** TypeScript 5.x
- **Framework:** None (vanilla Lambda)
- **API Gateway:** AWS API Gateway (REST)
- **AI:** OpenAI API (GPT-4o, GPT-4o-mini)
- **Calendar:** Google Calendar API v3
- **Deployment:** AWS Lambda + SAM

### External APIs

- **OpenAI:** GPT-4o for complex reasoning, GPT-4o-mini for simple tasks
- **Google Calendar:** OAuth 2.0, Events API
- **Firebase:** Authentication, Firestore, Cloud Functions

---

## Project Structure

```
messageapp/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Tab navigator
│   │   └── ai-chat.tsx    # AI Chat screen
│   ├── chat/[id].tsx      # Chat screen
│   └── index.tsx          # Entry point
├── components/
│   ├── chat/              # Chat components
│   │   ├── MessageBubble.tsx
│   │   ├── MessageList.tsx
│   │   ├── AIMessageBubble.tsx
│   │   └── MessageInput.tsx
│   └── common/            # Shared components
├── services/              # API services
│   ├── ai.ts              # AI Lambda API
│   ├── auth.ts            # Firebase Auth
│   ├── chat.ts            # Chat operations
│   ├── googleAuth.ts      # Google OAuth
│   └── firebase.config.ts # Firebase setup
├── stores/                # Zustand stores
│   ├── aiStore.ts         # AI chat state
│   ├── authStore.ts       # Auth state
│   ├── chatStore.ts       # Messaging state
│   └── uiStore.ts         # UI state
├── types/                 # TypeScript types
│   └── index.ts
├── theme/                 # Styling
│   └── colors.ts
├── lambda/                # AWS Lambda backend
│   ├── src/
│   │   ├── handlers/      # Lambda handlers
│   │   │   ├── chat.ts
│   │   │   └── extractEvent.ts
│   │   ├── services/      # Business logic
│   │   │   ├── calendar.ts
│   │   │   ├── openai.ts
│   │   │   └── secrets.ts
│   │   ├── tools/         # OpenAI tools
│   │   │   ├── registry.ts
│   │   │   └── helpers.ts
│   │   ├── utils/         # Utilities
│   │   │   └── types.ts
│   │   └── index.ts       # Entry point
│   ├── __tests__/         # Jest tests
│   ├── package.json
│   └── tsconfig.json
└── Docs/                  # Documentation
    ├── AI_PRD.md
    ├── AI_Arch.md
    ├── AI_Tasks.md
    ├── USER_GUIDE.md
    └── DEVELOPER_GUIDE.md
```

---

## Development Setup

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Xcode 15+ (for iOS)
- AWS CLI configured
- Firebase project set up
- Google Cloud project with Calendar API enabled

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd messageapp

# Install dependencies
npm install

# Install Lambda dependencies
cd lambda
npm install
cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Start development server
npx expo start
```

### Environment Variables

Create `.env` in project root:

```bash
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

Lambda environment (AWS Secrets Manager):

```
OPENAI_API_KEY
GOOGLE_CALENDAR_CLIENT_ID
GOOGLE_CALENDAR_CLIENT_SECRET
```

### Running Locally

**Frontend:**

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on physical device
# Scan QR code with Expo Go app
```

**Lambda (Local Testing):**

```bash
cd lambda

# Run unit tests
npm test

# Run specific test file
npm test -- conflictDetection.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## API Documentation

### Base URLs

**Production:**

```
https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging
```

**Staging:**

```
https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging
```

### Authentication

All requests require:

- `Content-Type: application/json`
- User must be authenticated with Firebase
- userId provided in request body

### Endpoints

#### POST /ai/chat

Conversational AI with function calling.

**Request:**

```typescript
{
  userId: string;
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  timezone?: string; // IANA timezone (e.g., "America/Los_Angeles")
}
```

**Response:**

```typescript
{
  reply: string;
  reasoning?: string[];
  toolsCalled?: string[];
  events?: any[];
}
```

**Example:**

```bash
curl -X POST https://...amazonaws.com/staging/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "abc123",
    "message": "What is on my calendar tomorrow?",
    "timezone": "America/Los_Angeles"
  }'
```

**Status Codes:**

- `200` - Success
- `400` - Bad request (missing fields, invalid input)
- `401` - Unauthorized (invalid userId)
- `429` - Rate limit exceeded
- `500` - Internal server error

---

#### POST /ai/extract-event

Extract event from message text and detect conflicts.

**Request:**

```typescript
{
  userId: string;
  messageText: string;
  timezone?: string;
}
```

**Response:**

```typescript
{
  hasEvent: boolean;
  event?: {
    title: string;
    dateTime: string;
    location?: string;
    description?: string;
    confidence: "high" | "medium" | "low";
  };
  conflicts?: Array<{
    eventId: string;
    title: string;
    start: string;
    end: string;
    overlapMinutes: number;
  }>;
  alternativeTimes?: Array<{
    start: string;
    end: string;
  }>;
  needsConfirmation?: boolean;
  timestamp: string;
}
```

**Example:**

```bash
curl -X POST https://...amazonaws.com/staging/ai/extract-event \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "abc123",
    "messageText": "Soccer practice Saturday 3PM",
    "timezone": "America/New_York"
  }'
```

---

#### GET /health

Health check endpoint.

**Response:**

```typescript
{
  status: "ok" | "degraded" | "down";
  version: string;
  timestamp: string;
}
```

**Example:**

```bash
curl https://...amazonaws.com/staging/health
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: string; // User-friendly message
  code: string; // Machine-readable code
}
```

### Error Codes

| Code                  | Status  | Description            | Retryable          |
| --------------------- | ------- | ---------------------- | ------------------ |
| `OFFLINE`             | N/A     | No internet connection | Yes                |
| `TIMEOUT`             | N/A     | Request timed out      | Yes                |
| `RATE_LIMIT`          | 429     | Too many requests      | Yes (with backoff) |
| `PERMISSION_DENIED`   | 403     | Calendar access denied | No                 |
| `SERVICE_UNAVAILABLE` | 500-503 | Backend unavailable    | Yes                |
| `NETWORK_ERROR`       | N/A     | Network failure        | Yes                |
| `MISSING_USER_ID`     | 400     | userId not provided    | No                 |
| `MISSING_MESSAGE`     | 400     | message not provided   | No                 |
| `INVALID_TOKEN`       | 401     | Auth token invalid     | No                 |

### Retry Logic

**Frontend (ai.ts):**

- Max 3 retry attempts
- Exponential backoff: 1s, 2s, 4s
- Retries 5xx, 429, network errors
- Does NOT retry 4xx (except 429)

**Backend (Lambda):**

- OpenAI: Built-in retry via SDK
- Google Calendar: Exponential backoff
- Max 3 attempts per operation

### Error Handling in Code

**Frontend:**

```typescript
try {
  const response = await sendAIChat(userId, message);

  if (response.success) {
    // Handle success
  } else {
    // Handle error with code
    if (response.code === "PERMISSION_DENIED") {
      showCalendarPermissionDeniedAlert();
    } else if (response.code === "OFFLINE") {
      // Show offline banner
    }
    // Display error message
  }
} catch (error) {
  // Unexpected error
  console.error(error);
}
```

**Backend:**

```typescript
try {
  // Business logic
} catch (error: any) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: error.message,
        code: error.code,
      }),
    };
  }

  // Generic error
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    }),
  };
}
```

---

## Testing

### Test Structure

```
lambda/src/__tests__/
├── conflictDetection.test.ts   # 19 tests
├── eventExtraction.test.ts     # 35 tests
└── errorHandling.test.ts       # 30 tests

Total: 84 tests
```

### Running Tests

```bash
cd lambda

# All tests
npm test

# Specific file
npm test conflictDetection

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Categories

**Unit Tests:**

- Conflict detection algorithm
- Event extraction logic
- Helper functions
- Error handling

**Integration Tests:**

- Full event extraction flow
- Calendar API integration
- OpenAI API integration

**Test Coverage:**

- Conflict Detection: 100%
- Event Extraction: 100%
- Error Handling: 100%

### Writing New Tests

```typescript
describe("Feature Name", () => {
  it("should do something specific", () => {
    // Arrange
    const input = "test input";

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe("expected output");
  });
});
```

### Manual Testing

See `Docs/Phase2_Manual_Testing_Guide.md` for comprehensive manual test cases.

---

## Deployment

### Frontend Deployment (Expo/EAS)

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios

# Update OTA
eas update --branch production
```

### Backend Deployment (Lambda)

```bash
cd lambda

# Build TypeScript
npm run build

# Deploy to AWS
npm run deploy

# Or using AWS SAM
sam build
sam deploy --guided
```

### Deployment Checklist

- [ ] Run all tests (`npm test`)
- [ ] Update version numbers
- [ ] Check environment variables
- [ ] Review security rules (Firestore)
- [ ] Test in staging first
- [ ] Monitor for errors after deploy
- [ ] Verify health endpoint
- [ ] Check CloudWatch logs

### CI/CD Pipeline

**GitHub Actions:**

```yaml
name: Deploy Lambda
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: cd lambda && npm install
      - name: Run tests
        run: cd lambda && npm test
      - name: Build
        run: cd lambda && npm run build
      - name: Deploy
        run: cd lambda && npm run deploy
```

---

## Monitoring & Debugging

### Logging

**Frontend:**

```typescript
console.log("✅ Success message");
console.warn("⚠️ Warning message");
console.error("❌ Error message");
```

**Backend:**

```typescript
console.log("🤖 AI operation");
console.log("📅 Calendar operation");
console.log("🔧 Tool execution");
```

### CloudWatch (Lambda)

```bash
# View logs
aws logs tail /aws/lambda/messageai-function --follow

# Filter errors
aws logs filter-pattern /aws/lambda/messageai-function --filter-pattern "ERROR"
```

### Debugging Tips

**Frontend:**

1. Use React Native Debugger
2. Check Network tab for API calls
3. Enable verbose logging in Expo
4. Use Flipper for advanced debugging

**Backend:**

1. Check CloudWatch logs
2. Test locally with `sam local invoke`
3. Use AWS X-Ray for tracing
4. Monitor API Gateway metrics

### Common Issues

**"Calendar not connected"**

- Check OAuth credentials
- Verify token refresh logic
- Check Firestore token document

**"AI request timeout"**

- Check OpenAI API status
- Verify Lambda timeout (30s)
- Check network connectivity

**"Conflict detection wrong"**

- Verify timezone handling
- Check date parsing logic
- Review calendar event format

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow Airbnb style guide
- Use Prettier for formatting
- Write descriptive commit messages

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactor
- `chore`: Maintenance

**Example:**

```
feat(ai-chat): add retry logic for failed requests

- Added exponential backoff
- Max 3 retry attempts
- Better error messages

Closes #123
```

### Pull Request Checklist

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] New tests added (if applicable)
- [ ] Documentation updated
- [ ] No linter errors
- [ ] Tested on device/simulator
- [ ] Screenshots attached (for UI changes)

---

## Performance Optimization

### Frontend

**Caching:**

- Cache conversation history (last 50 messages)
- Cache user preferences (session)
- Use React memo for expensive components

**Network:**

- Debounce user input (500ms)
- Batch API requests when possible
- Use optimistic UI updates

### Backend

**Lambda:**

- Provisioned concurrency (10 instances)
- In-memory cache (5 min TTL)
- Connection pooling for Firestore

**OpenAI:**

- Use GPT-4o-mini for simple tasks
- Cache similar queries (60 min TTL)
- Optimize prompts to reduce tokens

**Google Calendar:**

- Batch fetch events
- Cache aggressively
- Use ETags for conditional requests

---

## Security

### Best Practices

1. **Never commit secrets**

   - Use environment variables
   - Use AWS Secrets Manager
   - Use `.gitignore`

2. **Validate all inputs**

   - Sanitize user input
   - Validate date formats
   - Length limits (max 5000 chars)

3. **Use HTTPS everywhere**

   - All API calls over TLS 1.3
   - Certificate validation

4. **Rate limiting**

   - 30 req/min per user
   - 1000 req/hour per IP
   - Budget caps

5. **Least privilege**
   - IAM roles with minimal permissions
   - Firestore security rules
   - OAuth scopes limited

### Security Checklist

- [ ] Environment variables not committed
- [ ] API keys rotated regularly
- [ ] Firestore rules tested
- [ ] Rate limiting configured
- [ ] Input validation in place
- [ ] Error messages don't leak info
- [ ] HTTPS enforced
- [ ] Dependencies up to date

---

## Troubleshooting

### Build Errors

**iOS Build Fails:**

```bash
# Clean build
cd ios && pod deintegrate && pod install
cd .. && npx expo run:ios --clean
```

**TypeScript Errors:**

```bash
# Regenerate types
npx expo customize tsconfig.json
```

### Runtime Errors

**"Network request failed":**

- Check internet connection
- Verify API endpoints
- Check CORS settings

**"Calendar API error":**

- Check OAuth credentials
- Verify scopes
- Check quota limits

**"OpenAI API error":**

- Check API key
- Verify quota
- Check rate limits

---

## Additional Resources

### Documentation

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)

### Tools

- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [Postman](https://www.postman.com/) (API testing)
- [AWS Console](https://console.aws.amazon.com/)

### Support

- GitHub Issues: [link]
- Slack Channel: [link]
- Email: dev@messageai.app

---

**Version:** 1.0  
**Last Updated:** October 24, 2025  
**Maintainer:** MessageAI Team
