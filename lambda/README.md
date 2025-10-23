# MessageAI Lambda Function

AI-powered scheduling assistant backend service.

## Setup

### Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS account with Lambda access

### Installation

```bash
cd lambda
npm install
```

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## Endpoints

### GET /health

Health check endpoint

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-10-22T..."
}
```

### POST /ai/chat

Conversational AI interface

**Request:**

```json
{
  "userId": "user123",
  "message": "What's on my calendar tomorrow?",
  "conversationHistory": []
}
```

**Response:**

```json
{
  "reply": "You have 3 events tomorrow...",
  "reasoning": ["Checked calendar", "Found 3 events"],
  "toolsCalled": ["getCalendarEvents"],
  "events": [...]
}
```

### POST /ai/extract-event

Extract scheduling information from text

**Request:**

```json
{
  "messageText": "Soccer practice Saturday 3PM",
  "userId": "user123"
}
```

**Response:**

```json
{
  "hasEvent": true,
  "event": {
    "title": "Soccer practice",
    "date": "2025-10-25",
    "time": "15:00",
    "duration": 60
  },
  "conflicts": []
}
```

### POST /ai/detect-conflicts

Check for scheduling conflicts

**Request:**

```json
{
  "userId": "user123",
  "proposedEvent": {
    "date": "2025-10-25",
    "startTime": "15:00",
    "duration": 60
  }
}
```

**Response:**

```json
{
  "hasConflict": true,
  "conflicts": [...],
  "alternativeTimes": [...]
}
```

## Development

### Local Testing

```bash
npm run build
npm test
```

### Environment Variables

Create `.env.aws` file (see `.env.aws.example`):

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Deployment

1. Build TypeScript: `npm run build`
2. Package function: `npm run package`
3. Deploy to AWS: `npm run deploy`

## Architecture

- **Runtime:** Node.js 18
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Integrations:** OpenAI GPT-4, Google Calendar API, Firebase Admin
