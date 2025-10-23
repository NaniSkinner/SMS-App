# WhatsApp-Style Messaging App MVP

A production-quality, real-time messaging application built with React Native, Expo, and Firebase. This app demonstrates core messaging infrastructure similar to WhatsApp, with real-time synchronization, message status tracking, and offline support.

## Project Overview

**Platform:** iOS (React Native + Expo)  
**Backend:** Firebase (Firestore, Authentication, Cloud Functions)  
**State Management:** Zustand  
**Duration:** 7-day MVP sprint  
**Current Status:** Day 2 Complete (Core Messaging)

## Features Implemented

### Day 0: Setup & Configuration (Complete)

- Development environment setup
- Firebase project configuration
- Expo Router navigation structure
- Type definitions and theme system
- Core dependencies installed

### Day 1: Foundation & Authentication (Complete)

- Email/password authentication with Firebase
- User registration and login screens
- Session persistence with AsyncStorage
- User profile creation in Firestore
- Protected routes with navigation guards
- Auto-login for returning users

### Day 2: Core Messaging (Complete)

- Real-time one-on-one messaging
- Chat list with conversation previews
- Individual chat screens with message bubbles
- User picker for starting new conversations
- Message status indicators (sent, delivered, read)
- Online/offline status tracking
- Avatar components with initials
- Date separators in conversations
- Pull-to-refresh functionality
- Automatic message status updates
- Unread count tracking

## Tech Stack

### Frontend

- React Native
- Expo SDK 51+
- Expo Router (file-based routing)
- TypeScript
- Zustand (state management)

### Backend

- Firebase Authentication
- Cloud Firestore (database)
- Firebase Cloud Functions
- Firebase Cloud Messaging (push notifications)

### Development Tools

- Xcode (iOS Simulator)
- Expo CLI
- EAS CLI
- Firebase CLI

### AI Backend

- AWS Lambda (serverless functions)
- OpenAI GPT-4o (AI chat completion)
- AWS Secrets Manager (secure credential storage)
- AWS API Gateway (REST API endpoints)

The AI backend is a separate serverless system built on AWS Lambda. It provides intelligent features like chat completions and event extraction from natural language.

**Current Status:** Epic 0.2 Complete (OpenAI Integration)

**Available Endpoints:**

- `/health` - Health check
- `/ai/chat` - AI chat completions with GPT-4o
- `/ai/extract-event` - Extract calendar events from text

📄 **For deployment instructions and API documentation, see:**  
[`/lambda/DEPLOYMENT_GUIDE.md`](../lambda/DEPLOYMENT_GUIDE.md)

## Project Structure

```
/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── chat/[id].tsx      # Individual chat screen
│   └── users.tsx          # User picker screen
├── components/            # React components
│   ├── chat/             # Message-related components
│   ├── common/           # Reusable components
│   └── conversation/     # Conversation list components
├── services/             # Firebase service layer
│   ├── auth.ts          # Authentication logic
│   ├── chat.ts          # Message operations
│   ├── conversations.ts # Conversation management
│   ├── user.ts          # User profile operations
│   └── firebase.config.ts
├── stores/              # Zustand state stores
│   ├── authStore.ts    # Authentication state
│   └── chatStore.ts    # Chat state
├── types/              # TypeScript definitions
├── theme/              # Color palette and styling
└── Docs/              # Documentation

```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Xcode (latest version, Mac only)
- Firebase account
- Expo account (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd messageapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Firebase:

   - Copy `services/firebase.config.template.ts` to `services/firebase.config.ts`
   - Add your Firebase project credentials
   - Deploy Firestore security rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

4. Start the development server:

   ```bash
   npx expo start
   ```

5. Open the app:
   - Press `i` to open in iOS Simulator
   - Or scan the QR code with Expo Go on your device

## Testing with Multiple Users

### Testing on Two Simulators

1. Open first simulator:

   ```bash
   xcrun simctl boot "iPhone 16 Pro"
   open -a Simulator
   ```

2. Open second simulator:

   ```bash
   xcrun simctl boot "iPhone 17 Pro"
   ```

3. Start Expo and press `i` twice to open on both simulators

4. Create test accounts:

   - Simulator 1: Register as `alice@test.com`
   - Simulator 2: Register as `bob@test.com`

5. Test messaging:
   - On Alice's device: Tap + button, select Bob, send message
   - On Bob's device: See conversation appear, reply
   - Verify real-time message delivery

## Key Features Explained

### Real-Time Messaging

Messages are synchronized in real-time using Firestore's `onSnapshot` listeners. When a user sends a message, it's immediately written to Firestore and propagated to all connected clients within 1 second.

### Message Status Indicators

- Single check mark: Message sent to server
- Double check mark: Message delivered to recipient
- Blue double check mark: Message read by recipient

Status updates are triggered automatically when users view conversations.

### Online Status

User presence is tracked through the `isOnline` field in user documents. The app updates this status when users open/close the app or navigate between screens.

### Security

Firestore security rules ensure:

- Users can only read their own profile data
- Only conversation participants can access messages
- Atomic operations prevent race conditions
- All operations require authentication

## Database Schema

### Users Collection

```
users/{userId}
  - id: string
  - email: string
  - displayName: string
  - photoURL: string (optional)
  - isOnline: boolean
  - lastSeen: timestamp
  - createdAt: timestamp
  - pushToken: string (optional)
  - theme: "light" | "dark" | "system"
```

### Conversations Collection

```
conversations/{conversationId}
  - id: string
  - type: "direct" | "group"
  - participants: string[]
  - participantDetails: object
  - lastMessage: object (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
  - groupName: string (optional, for groups)
  - createdBy: string (optional, for groups)
```

### Messages Subcollection

```
conversations/{conversationId}/messages/{messageId}
  - id: string
  - conversationId: string
  - senderId: string
  - text: string
  - timestamp: timestamp
  - status: "sending" | "sent" | "delivered" | "read" | "failed"
  - readBy: string[]
  - createdAt: timestamp
```

### User Conversations Subcollection

```
users/{userId}/conversations/{conversationId}
  - conversationId: string
  - unreadCount: number
  - lastMessageTimestamp: timestamp
  - isMuted: boolean
  - isPinned: boolean
```

## Development Progress

**Completed: 35/83 tasks (42%)**

- Day 0: Setup & Configuration (8/8 tasks)
- Day 1: Foundation & Auth (12/12 tasks)
- Day 2: Core Messaging (15/15 tasks)
- Day 3: Reliability (0/11 tasks) - Next
- Day 4: Presence & Receipts (0/9 tasks)
- Day 5: Group Chat (0/10 tasks)
- Day 6: Push Notifications (0/8 tasks)
- Day 7: Polish & Deploy (0/10 tasks)

## Roadmap

### Day 3: Reliability (Upcoming)

- Optimistic UI for instant feedback
- Offline message queuing
- Message caching with AsyncStorage
- Network status detection
- Retry failed messages

### Day 4: Presence & Receipts

- Enhanced online/offline tracking
- Last seen timestamps
- Read receipt improvements
- Typing indicators (optional)

### Day 5: Group Chat

- Create group conversations
- Group messaging functionality
- Group member management
- Group info screen

### Day 6: Push Notifications

- Firebase Cloud Messaging integration
- Notification permissions handling
- Background notification handling
- Deep linking from notifications

### Day 7: Polish & Deploy

- Bug fixes and edge case handling
- UI polish and animations
- Performance optimization
- TestFlight deployment (optional)

## Post-MVP Features

### Planned Enhancements

- Message editing and deletion
- Media sharing (photos, videos, files)
- Voice messages
- Message search functionality
- Message reactions
- Reply/quote functionality
- Group admin controls
- Block/report users
- End-to-end encryption
- Web version

### AI Features

- Message summarization
- Real-time translation
- Smart reply suggestions
- Action item extraction
- Sentiment analysis

## Troubleshooting

### Common Issues

**App won't load on simulator:**

```bash
# Reset the simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

**Firebase permission errors:**

```bash
# Redeploy security rules
firebase deploy --only firestore:rules
```

**Module not found errors:**

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

**Messages not appearing:**

- Check Firebase console for Firestore data
- Verify security rules are deployed
- Check network connectivity
- Review console logs for errors

## Performance Considerations

- Messages are loaded in batches for performance
- Firestore listeners are cleaned up on unmount
- Avatar images use optimized sizes
- List rendering uses FlatList for efficiency
- Atomic operations prevent race conditions

## Security Best Practices

- All API calls require authentication
- Firestore rules validate user permissions
- Sensitive data (passwords) never stored in app
- Firebase SDK handles token management
- HTTPS enforced for all connections

## Contributing

This is an MVP project built for demonstration purposes. For production use, consider:

- Implementing end-to-end encryption
- Adding comprehensive error tracking
- Setting up automated testing
- Implementing analytics
- Adding user feedback mechanisms

## License

This project is built for educational purposes.

## Contact

For questions or issues, please refer to the project documentation in the /Docs directory.

## Acknowledgments

Built with:

- React Native
- Expo
- Firebase
- Zustand
- TypeScript

For detailed implementation tasks, see TasksMVP.md in the Docs folder.
