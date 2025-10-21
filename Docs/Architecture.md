graph TB
subgraph "CLIENT LAYER - React Native App"
subgraph "UI Components"
A1[Screens: Auth/Chats/Profile/Chat]
A2[Components: MessageBubble/Avatar/Input]
A3[Theme Provider<br/>Light/Dark/System]
end

        subgraph "State Management"
            B1[Zustand Stores<br/>auth/chat/ui]
            B2[Local Cache<br/>AsyncStorage<br/>Messages/Theme/Queue]
        end

        subgraph "Services Layer"
            C1[Auth Service<br/>Login/Register/Session]
            C2[Chat Service<br/>Send/Receive/Subscribe]
            C3[Presence Service<br/>Online/Offline/LastSeen]
            C4[Notification Service<br/>Permissions/Tokens]
            C5[Cache Service<br/>Read/Write/Sync]
        end
    end

    subgraph "FIREBASE BACKEND"
        subgraph "Authentication"
            D1[Firebase Auth<br/>Email/Password]
        end

        subgraph "Database - Firestore"
            E1[users Collection<br/>id/email/name/pushToken/<br/>isOnline/lastSeen/theme]
            E2[conversations Collection<br/>id/type/participants/<br/>lastMessage/groupName]
            E3[messages Subcollection<br/>id/text/senderId/timestamp/<br/>status/readBy]
            E4[userConversations<br/>Subcollection<br/>unreadCount/lastMessage]
        end

        subgraph "Cloud Functions"
            F1[onMessageCreated<br/>Trigger: New Message]
            F2[sendPushNotification<br/>Get Recipients/Tokens]
            F3[updateReadReceipts<br/>Batch Updates]
        end

        subgraph "Push Notifications"
            G1[Firebase Cloud<br/>Messaging FCM]
        end
    end

    subgraph "EXTERNAL SERVICES"
        H1[Apple Push<br/>Notification APNs]
        H2[Expo Push<br/>Service]
    end

    subgraph "DATA FLOWS"
        subgraph "Send Message Flow"
            I1[1. User Types → Send]
            I2[2. Generate LocalID]
            I3[3. Optimistic UI<br/>Status: sending]
            I4[4. Write to Firestore]
            I5[5. Confirm → sent]
            I6[6. Trigger Cloud Function]
            I7[7. Push to Recipients]
        end

        subgraph "Receive Message Flow"
            J1[1. Firestore Listener<br/>Real-time Snapshot]
            J2[2. Update Store]
            J3[3. Render UI]
            J4[4. Mark Read<br/>Update readBy]
            J5[5. Cache Locally]
        end

        subgraph "Offline Flow"
            K1[1. Detect Offline]
            K2[2. Queue Message<br/>AsyncStorage]
            K3[3. Show Sending Status]
            K4[4. Network Restored]
            K5[5. Process Queue]
            K6[6. Send to Firestore]
        end
    end

    subgraph "SECURITY"
        L1[Firestore Rules<br/>- Authenticated Only<br/>- Participant Check<br/>- Owner Validation]
        L2[Auth Tokens<br/>JWT Verification]
    end

    %% UI to State
    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> B2

    %% State to Services
    B1 --> C1
    B1 --> C2
    B1 --> C3
    B1 --> C4
    B2 --> C5

    %% Services to Firebase
    C1 --> D1
    C2 --> E2
    C2 --> E3
    C3 --> E1
    C4 --> G1
    C5 --> B2

    %% Firebase Internal
    D1 --> E1
    E2 --> E3
    E1 --> E4
    E2 --> E4
    E3 --> F1
    F1 --> F2
    F2 --> G1

    %% Push Flow
    G1 --> H2
    H2 --> H1
    H1 --> A1

    %% Data Flows - Send
    I1 --> I2
    I2 --> I3
    I3 --> I4
    I4 --> I5
    I5 --> I6
    I6 --> I7
    I7 --> G1

    %% Data Flows - Receive
    E3 --> J1
    J1 --> J2
    J2 --> J3
    J3 --> J4
    J4 --> E3
    J4 --> J5
    J5 --> B2

    %% Data Flows - Offline
    A1 --> K1
    K1 --> K2
    K2 --> K3
    K3 --> K4
    K4 --> K5
    K5 --> K6
    K6 --> E3

    %% Security
    L2 --> D1
    L1 --> E1
    L1 --> E2
    L1 --> E3

    %% Real-time Listener
    E3 -.Real-time Snapshot.-> C2

    %% Optimistic Update Connection
    C2 -.Optimistic UI.-> B1

    %% Cache Sync
    B2 -.Sync on Connect.-> E3

    %% Styling
    style A1 fill:#4361EE,color:#fff,stroke:#333
    style B1 fill:#AB4E68,color:#fff,stroke:#333
    style E2 fill:#9DC183,color:#000,stroke:#333
    style E3 fill:#9DC183,color:#000,stroke:#333
    style F1 fill:#E6C0E9,color:#000,stroke:#333
    style F2 fill:#E6C0E9,color:#000,stroke:#333
    style G1 fill:#1C0221,color:#fff,stroke:#333
    style I3 fill:#4361EE,color:#fff,stroke:#333
    style J1 fill:#AB4E68,color:#fff,stroke:#333
    style K2 fill:#9DC183,color:#000,stroke:#333
    style L1 fill:#1C0221,color:#fff,stroke:#333

```

## Architecture Legend

**Colors:**
- 🔵 **Blue (#4361EE)**: Primary user-facing components
- 🔴 **Pink (#AB4E68)**: State management & real-time listeners
- 🟢 **Green (#9DC183)**: Database & caching
- 🟣 **Lavender (#E6C0E9)**: Cloud Functions & serverless
- ⚫ **Dark (#1C0221)**: Security & messaging infrastructure

**Line Types:**
- **Solid lines** (→): Direct data flow / API calls
- **Dotted lines** (-.->): Real-time subscriptions / async updates

**Key Data Structures:**
```

User: {id, email, name, pushToken, isOnline, lastSeen, theme}
Conversation: {id, type, participants[], lastMessage{}, groupName?}
Message: {id, text, senderId, timestamp, status, readBy[]}
UserConversation: {conversationId, unreadCount, lastMessageTimestamp}
