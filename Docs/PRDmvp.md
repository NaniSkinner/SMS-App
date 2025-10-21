PRD - WhatsApp-Style Messaging App MVP

Document Version: 1.2 (Lean)
Last Updated: October 20, 2025
Project Duration: 7 Days (Full-time)
Platform: iOS (React Native + Expo)
Status: Ready for Development
Related Documents:

Technical Architecture Document - System design, data models, architecture diagrams
Implementation Guide - Day-by-day development tasks and code examples
Design System Guide - UI components, color palette, styling guidelines

Table of Contents

Executive Summary
Product Overview
Target Users
Core Features & Requirements
User Stories
Success Metrics
Timeline & Milestones
Out of Scope
Dependencies & Risks

Executive Summary
Product Vision
Build a production-quality, real-time messaging application that demonstrates the core infrastructure and user experience of WhatsApp, deployable within 7 days. The app will support one-on-one and group messaging with enterprise-grade reliability, offline functionality, and real-time synchronization.
Problem Statement
Modern users expect instant, reliable communication that works seamlessly across network conditions. Busy parents and caregivers, in particular, need simple, reliable messaging to coordinate schedules and manage multiple responsibilities without information overload or decision fatigue.
Solution
A React Native mobile application (iOS-focused) leveraging Firebase's real-time infrastructure to provide WhatsApp-level messaging capabilities. The app prioritizes message delivery reliability, user experience polish, and architectural scalability.
Success Criteria

Two users can exchange messages with <1 second latency
Messages persist across app restarts and work offline
Optimistic UI provides instant feedback (<100ms)
Group chats support 3+ users reliably
Push notifications deliver consistently
App runs smoothly on iPhone 16 Pro

Product Overview
Key Features

Real-time one-on-one messaging with instant delivery
Group chat supporting 3-10 users
Optimistic UI for instant message appearance
Offline-first architecture with intelligent sync
Online/offline status indicators and "last seen"
Read receipts with delivery confirmation
Push notifications for engagement
Light/Dark theme support (system preference detection)

Platform Specifications

Primary Platform: iOS 14.0+
Test Device: iPhone 16 Pro
Tech Stack: React Native, Expo SDK 51+, Firebase
Deployment: Expo Go (MVP) → TestFlight (optional)

Target Users
Primary Persona: "Tech-Savvy Communicator"
Demographics:

Age: 18-35
Tech literacy: High
Device: Modern iPhone (12+)
Usage: Daily messaging, multiple apps

Needs:

Fast, reliable messaging that works on poor networks
Group coordination capabilities
Clear read receipts and delivery status
Instant delivery confirmation

Pain Points:

Messages getting lost or delayed
Unclear message status
Clunky group chat experiences
Slow performance on poor networks

Secondary Persona: "Busy Parent/Caregiver"
Demographics:

Age: 25-45
Tech literacy: Medium to High
Context: Managing multiple responsibilities, often multitasking
Device: iPhone as primary communication tool

Needs:

Quick, reliable communication for coordinating schedules
Clear message status to confirm information delivery
Group chats for family coordination
Simple, distraction-free interface
Works in various lighting conditions

Pain Points:

Schedule juggling: Missing important timing details
Missing dates/appointments: Information buried in conversations
Decision fatigue: Too many features causing confusion
Information overload: Difficulty finding important messages

Key Use Cases:

Coordinating pickup/drop-off times with spouse
Managing children's activity schedules
Quick check-ins with elderly parents
Family group chat for meal planning
Emergency communication with caregivers

Core Features & Requirements

1. User Authentication
   1.1 Registration & Login
   Priority: P0 (Critical)
   Requirements:

Email and password authentication
Email format validation, minimum 6-character password
Display name (required), profile photo (optional)
Session persistence across app restarts
Automatic login after successful registration
Clear error messaging for invalid credentials

Acceptance Criteria:

User can register with email/password
User can login with valid credentials
Invalid inputs show clear error messages
Session persists after app restart
User profile created in database with all required fields

2. One-on-One Messaging
   2.1 Chat List (Inbox)
   Priority: P0 (Critical)
   Requirements:

Display all user conversations in reverse chronological order
Show last message preview (truncated to 1 line)
Show timestamp of last message
Show unread count badge (if >0)
Show online/offline status of other user
Real-time updates without manual refresh
Pull-to-refresh capability
Empty state for new users with helpful message

UI Components:

User avatar (square with rounded corners, 48x48px)
Display name (bold if unread messages)
Last message preview (gray text)
Timestamp (top right, formatted: "Today", "Yesterday", or date)
Unread badge (red circle with count)
Online indicator (green dot on avatar)

Acceptance Criteria:

All conversations display correctly
List updates in real-time when new messages arrive
Unread counts accurate
Tapping conversation navigates to chat screen
Adapts to light/dark theme

2.2 Chat Screen
Priority: P0 (Critical)
Requirements:
Header:

Other user's display name
Online/offline status indicator (green dot or "last seen")
Back button to chat list

Message Display:

All messages in reverse chronological order (newest at bottom)
Auto-scroll to bottom on new message
Manual scroll to view history
Date separators for different days
Pagination (load older messages on scroll up)

Message Bubbles:

Sent messages: right-aligned, themed blue background
Received messages: left-aligned, themed gray background
Message text, timestamp, status indicators
Sender avatar for received messages (square, rounded corners)

Message Status:

Single checkmark (✓): Sent
Double checkmark (✓✓): Delivered
Blue double checkmark (✓✓): Read

Input:

Multi-line text input (auto-growing, max 5 lines)
Send button (disabled when empty)
Loading state when sending

Acceptance Criteria:

All messages display correctly with proper alignment
Timestamps formatted appropriately
Date separators show correctly
Auto-scrolls to bottom for new messages
Can scroll up to view older messages
Send button only enabled when text present
Messages appear immediately on send (optimistic UI)
Status indicators update correctly
Online status displays in header

2.3 Send & Receive Messages
Priority: P0 (Critical)
Requirements:

Message appears instantly in UI (optimistic update)
Message sent to server asynchronously
Real-time delivery to recipient (<1 second)
Status progression: sending → sent → delivered → read
Failed messages show retry option
Cannot send empty messages
Input field clears after successful send

Acceptance Criteria:

Message visible instantly (<100ms)
Recipient receives message in real-time
Status indicators update correctly
Failed sends handled gracefully with retry
No duplicate messages created
Message order maintained

3. Message Persistence & Offline Support
   3.1 Local Caching
   Priority: P0 (Critical)
   Requirements:

Messages cached locally per conversation
Cached messages load instantly on app start
Sync with server after displaying cache
Cache last 100 messages per conversation
Messages persist across app restarts

Acceptance Criteria:

Messages load instantly from cache
Cache syncs with server automatically
No duplicate messages shown
Cache survives app restart

3.2 Offline Functionality
Priority: P0 (Critical)
Requirements:

Detect network connectivity status
Show clear offline indicator in UI
Queue messages when offline
Automatically send queued messages when back online
Display cached conversations and messages
Disable network-dependent features (user search)

Acceptance Criteria:

App opens and shows cached data when offline
Can view cached messages without network
Can type and queue messages offline
Queued messages send automatically when online
Clear offline indicator visible
Smooth transition between offline/online states

4. Real-Time Features
   4.1 Online/Offline Status
   Priority: P0 (Critical)
   Requirements:

Update user online status when app opens
Update to offline when app closes/backgrounds
Show green dot for online users
Show "last seen" timestamp for offline users (e.g., "Last seen 5m ago")
Real-time status updates (<5 seconds)
Reliable even if app crashes

Acceptance Criteria:

Green dot shows for online users
"Last seen" timestamp displays for offline users
Status updates within 5 seconds
Displayed in chat list and chat screen
Works reliably across app states

4.2 Read Receipts
Priority: P0 (Critical)
Requirements:

Mark messages as read when user views chat
Update message read status in real-time
Display read status to sender
Status indicators: ✓ (sent), ✓✓ (delivered), ✓✓ (blue, read)
Works in both one-on-one and group chats

Acceptance Criteria:

Messages marked as read when viewed
Read status updates within 2 seconds
Sender sees read status update
Status icons display correctly
Works in group chats (shows read count)

4.3 Typing Indicators (Optional)
Priority: P1 (Nice to have)
Requirements:

Detect when user is typing
Show "User is typing..." in other user's chat
Clear indicator after 3 seconds of no typing
Clear indicator when message sent

5. Group Chat
   5.1 Create Group
   Priority: P0 (Critical)
   Requirements:

Multi-select user picker (minimum 2 other users, max 10)
Group name input (required)
Group photo upload (optional, default icon provided)
System message showing group creation
Group appears in all participants' chat lists

Acceptance Criteria:

Can select 2-10 users
Group name required
Group appears in all participants' inboxes
System message displays group creation
Creator can send first message

5.2 Group Chat Screen
Priority: P0 (Critical)
Requirements:

Same functionality as one-on-one chat plus:

Show sender name above each message
Show sender avatar for all messages
Group name in header
Member count in header (e.g., "Family • 5 members")
Group info screen accessible via header tap

Acceptance Criteria:

All group messages display correctly
Sender name visible for each message
Sender avatar shown (square with rounded corners)
Group name and member count in header
Can access group info screen

5.3 Group Info Screen (Optional)
Priority: P1 (Nice to have)
Requirements:

Display group name and photo
List all members with avatars and online status
Show member count, creation date, creator
Exit group option (functionality post-MVP)

6. Push Notifications
   6.1 Notification Setup
   Priority: P0 (Critical)
   Requirements:

Request notification permission on first app open
Save push token to user profile
Handle permission denied gracefully
Update token when changed

Acceptance Criteria:

Permission requested on first launch
Push token saved successfully
Handles denied permission gracefully
Token updates when changed

6.2 Receive Notifications
Priority: P0 (Critical)
Requirements:

Notifications for new messages
Don't send if user viewing that conversation
Show sender name and message preview
Show group name for group messages
Notification sound and badge count
Tap notification opens relevant chat

Notification Format:

One-on-one: "John: Hey, how are you?"
Group: "Family • Alice: Dinner at 6pm"

Acceptance Criteria:

Notifications received in foreground, background, and killed state
Tapping notification opens correct chat
No notification when viewing active chat
Badge count shows total unread messages
Sound plays for new notifications

7. Theme System (Optional)
   7.1 Light/Dark Theme
   Priority: P1 (Nice to have - Day 7 if time permits)
   Requirements:

Detect device system theme on launch
Follow system theme by default
Manual theme override in Profile/Settings
Persist user's theme preference
Apply theme across all screens
Smooth theme transition animations

Color Palette:

Primary: #4361EE (Blue)
Secondary: #AB4E68 (Pink)
Accent: #E6C0E9 (Lavender)
Dark: #1C0221 (Very Dark Purple)
Success: #9DC183 (Green)

Theme Options:

Light mode
Dark mode
System default (follow device settings)

Acceptance Criteria:

App detects system theme on launch
Theme toggle in Profile/Settings screen
Theme preference persists across sessions
All screens adapt to selected theme
Text maintains proper contrast (WCAG AA)
Smooth transitions when switching

User Stories
Authentication
As a new user
I want to create an account with my email
So that I can start messaging others

As a returning user
I want to stay logged in after closing the app
So that I don't have to re-enter credentials

```

### Messaging
```

As a user
I want to send messages that appear instantly
So that the app feels responsive

As a user
I want to receive messages in real-time
So that I can have fluid conversations

As a user
I want my messages to persist after closing the app
So that I don't lose my conversation history

As a busy parent
I want to quickly see who messaged me last
So that I can prioritize responses based on urgency

```

### Status & Receipts
```

As a user
I want to see if my contact is online
So that I know if they'll respond quickly

As a sender
I want to see when my message is read
So that I know the recipient saw it

As a busy parent
I want to know if my spouse read my message about pickup time
So that I know they received the important information

```

### Group Chat
```

As a user
I want to create a group chat with multiple people
So that we can all communicate together

As a busy parent
I want to coordinate with multiple family members at once
So that everyone stays informed about schedules and plans

```

### Offline & Reliability
```

As a user
I want to send messages even without internet
So that I can compose messages anytime

As a user
I want to view my conversation history offline
So that I can reference past messages

```

### Notifications
```

As a user
I want to receive notifications for new messages
So that I don't miss important conversations

As a busy parent
I want timely notifications for messages
So that I don't miss time-sensitive coordination

```

### Theme
```

As a user
I want to switch between light and dark themes
So that I can use the app comfortably in different lighting

As a busy parent checking messages at night
I want the app to use dark mode automatically
So that the bright screen doesn't disturb my sleeping children

Success Metrics
MVP Success Criteria
Technical Performance:

Message delivery success rate: >99%
Real-time latency: <1 second
Optimistic UI response: <100ms
App crash rate: <1%
Message load time: <1 second
Push notification delivery: >95%

Functional Completeness:

2 users can exchange messages successfully
Group chat with 3+ users works reliably
Messages persist across app restarts
Offline mode queues and sends messages
All MVP features functional on iPhone 16 Pro
Online status updates accurately
Read receipts work correctly

User Experience:

App feels snappy and responsive (60fps scrolling)
No janky animations
Clear error messages for all failure states
Intuitive navigation
Professional UI polish

Post-MVP Metrics (Future)

Daily Active Users (DAU)
Messages sent per user per day
Average session duration
User retention (Day 1, Day 7, Day 30)
Push notification open rate
Theme preference distribution

Timeline & Milestones
Day 1: Foundation (Monday)
Goal: Auth + Navigation
Deliverables:

Project setup complete
Firebase configured
Auth flow functional
Basic navigation

Checkpoint: Can create account and log in

Day 2: Core Messaging (Tuesday)
Goal: One-on-one chat working
Deliverables:

Chat list screen
Chat screen UI
Send/receive messages
Real-time updates

Checkpoint: Two users can exchange messages

Day 3: Reliability (Wednesday)
Goal: Optimistic UI + Offline
Deliverables:

Optimistic message sending
Message caching
Offline detection & queue
Status indicators

Checkpoint: Messages appear instantly and work offline

Day 4: Presence & Receipts (Thursday)
Goal: Status + Read receipts
Deliverables:

Online/offline status
Last seen timestamps
Read receipt tracking

Checkpoint: Can see who's online and when messages are read

Day 5: Group Chat (Friday)
Goal: Group messaging
Deliverables:

Group creation flow
Group chat screen
Multi-user delivery

Checkpoint: 3+ users can chat in a group

Day 6: Push Notifications (Saturday)
Goal: Notifications working
Deliverables:

Notification permissions
Cloud Function deployment
Push notification sending
Deep linking

Checkpoint: Notifications work in all app states

Day 7: Polish & Deploy (Sunday)
Goal: Production-ready MVP
Deliverables:

Bug fixes
UI polish
Error handling
Theme toggle (if time permits)
Testing on iPhone 16 Pro
TestFlight build (optional)

Checkpoint: MVP complete and demo-ready

Out of Scope (MVP)
Explicitly excluded features:
Media & Communication

Photo/video/file sharing
Voice/video calls
Voice messages
Location sharing

Advanced Messaging

Message editing/deletion
Message forwarding
Message search
Message reactions
Reply/quote functionality
Message starring/pinning

Security & Privacy

End-to-end encryption
Disappearing messages
Blocking users
Privacy settings

Social & Discovery

Stories/Status
Public channels
Broadcast lists
User profiles beyond basic info

Advanced Group Features

Admin roles
Remove participants
Group permissions
Invite links

Platform Expansion

Web version
Desktop app
Android version (beyond basic testing)
App Store submission

AI Features

Message summarization
Translation
Smart replies
Action item extraction

Dependencies & Risks
Critical Dependencies
External Services:

Firebase (Firestore, Auth, Cloud Functions, FCM)
Apple Developer Account (for TestFlight/production push)
Expo Services (EAS Build)

Technical Requirements:

Internet connection (mitigated by offline mode)
Device permissions (notifications)
Physical iPhone 16 Pro for testing

Key Risks
RiskImpactMitigationTime constraint (7 days)HighStrict scope adherence, daily checkpointsFirebase quota exceededMediumMonitor usage, free tier is generousNotification permissions deniedMediumRequest at optimal time, clear explanationNetwork sync bugsHighThorough testing, use transactionsiOS build failuresHighStart EAS Build early, test frequentlyFeature creepHighStick to MVP, park extras for post-MVP
Contingency Plans
If Behind Schedule:

Day 3: Simplify optimistic UI, focus on core delivery
Day 5: Basic 3-person groups only, skip advanced features
Day 6: Foreground notifications only, defer background
Day 7: Skip theme implementation, focus on bug fixes

Minimum Viable MVP (Last Resort):

One-on-one chat only
Basic persistence & real-time delivery
Simple optimistic UI
No groups, notifications, or themes
Still demonstrates core messaging competency
