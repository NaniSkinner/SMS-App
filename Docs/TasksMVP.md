Day 0: Setup & Configuration [■■■■■■■■] 8/8 tasks ✅ COMPLETE
Day 1: Foundation & Auth [■■■■■■■■■■■■] 12/12 tasks ✅ COMPLETE  
Day 2: Core Messaging [ ] 0/15 tasks
Day 3: Reliability [ ] 0/11 tasks
Day 4: Presence & Receipts [ ] 0/9 tasks
Day 5: Group Chat [ ] 0/10 tasks
Day 6: Push Notifications [ ] 0/8 tasks
Day 7: Polish & Deploy [ ] 0/10 tasks

Total Progress: 20/83 tasks (24%)

```

---

## Day 0: Setup & Configuration (Before Starting)

**Goal:** Development environment ready
**Time:** 2-3 hours

### Environment Setup
- [x] **Install Required Software**
  - [x] Install Node.js (v18+)
  - [x] Install Xcode (latest version)
  - [x] Install Expo CLI globally: `npm install -g expo-cli`
  - [x] Install EAS CLI: `npm install -g eas-cli`
  - [x] Verify installations with version checks

- [x] **Firebase Project Setup**
  - [x] Create new Firebase project in console
  - [x] Enable Firebase Authentication (Email/Password)
  - [x] Enable Cloud Firestore
  - [x] Enable Cloud Functions
  - [x] Enable Firebase Cloud Messaging (FCM)
  - [ ] Download `google-services.json` (Android) - Not needed for iOS simulator
  - [ ] Download `GoogleService-Info.plist` (iOS) - Not needed for Expo Go

- [x] **Project Initialization**
  - [x] Run: `npx create-expo-app messaging-app --template blank`
  - [x] Navigate to project: `cd messaging-app`
  - [x] Initialize Git: `git init`
  - [x] Create `.gitignore` (include Firebase config files)
  - [x] Initial commit

- [x] **Install Core Dependencies**
  - [x] Install Expo Router: `npx expo install expo-router react-native-safe-area-context react-native-screens`
  - [x] Install Firebase: `npm install firebase`
  - [x] Install Zustand: `npm install zustand`
  - [x] Install AsyncStorage: `npx expo install @react-native-async-storage/async-storage`
  - [x] Install Notifications: `npx expo install expo-notifications expo-device expo-constants`
  - [x] Install NetInfo: `npx expo install @react-native-community/netinfo`
  - [x] Install UUID: `npm install uuid @types/uuid`

- [x] **Project Structure Setup**
  - [x] Create `/app` directory structure
  - [x] Create `/components` directory with subdirectories
  - [x] Create `/services` directory
  - [x] Create `/stores` directory
  - [x] Create `/types` directory
  - [x] Create `/utils` directory
  - [x] Create `/theme` directory
  - [x] Create type definitions in `/types/index.ts`
  - [x] Create color palette in `/theme/colors.ts`

- [x] **Firebase Configuration**
  - [x] Create `services/firebase.config.template.ts`
  - [x] Copy template to `services/firebase.config.ts` with actual credentials
  - [x] Test Firebase connection
  - [x] Export auth, db, storage services

- [x] **Expo Configuration**
  - [x] Update `app.json` with proper config
  - [x] Add notifications plugin to `app.json`
  - [x] Configure iOS bundle identifier
  - [x] Configure app name and slug
  - [x] Set up Expo Router entry point

- [x] **Development Tools**
  - [x] Install iPhone simulator (if using Mac)
  - [x] Install TypeScript & types
  - [x] Test app runs: `npx expo start`
  - [x] Verify app loads with Firebase connection test
  - [ ] Set up EAS account: `eas login` - Optional for now

**Checkpoint:** ✅ App runs successfully with Firebase connected!

---

## Day 1: Foundation & Authentication (Monday)

**Goal:** Working auth, navigation, and Firebase setup
**Time:** 6-8 hours

### 1.1 Navigation Setup (1 hour)
- [x] **Configure Expo Router**
  - [x] Create `app/_layout.tsx` (root layout)
  - [x] Create `app/(auth)/_layout.tsx` (auth stack)
  - [x] Create `app/(tabs)/_layout.tsx` (main tabs)
  - [x] Test navigation between screens
  - [x] Add navigation guards (auth check)

### 1.2 Authentication Service (2 hours)
- [x] **Create Auth Service**
  - [x] Create `services/auth.ts`
  - [x] Implement `signUp(email, password, displayName)`
  - [x] Implement `signIn(email, password)`
  - [x] Implement `signOut()`
  - [x] Implement `getCurrentUser()`
  - [x] Add error handling for all functions
  - [x] Test each function in console

### 1.3 Auth Store (1 hour)
- [x] **Create Zustand Auth Store**
  - [x] Create `stores/authStore.ts`
  - [x] Add state: `user`, `isAuthenticated`, `isLoading`
  - [x] Add actions: `setUser`, `clearUser`, `setLoading`
  - [x] Implement `initializeAuth()` for session restore
  - [x] Test store updates

### 1.4 Registration Screen (1.5 hours)
- [x] **Build Registration UI**
  - [x] Create `app/(auth)/register.tsx`
  - [x] Add email input with validation
  - [x] Add password input with visibility toggle
  - [x] Add display name input
  - [x] Add register button
  - [x] Add loading state
  - [x] Add error message display
  - [x] Add "Already have account?" link to login
  - [x] Test with valid/invalid inputs

### 1.5 Login Screen (1 hour)
- [x] **Build Login UI**
  - [x] Create `app/(auth)/login.tsx`
  - [x] Add email input
  - [x] Add password input
  - [x] Add login button
  - [x] Add loading state
  - [x] Add error message display
  - [x] Add "Don't have account?" link to register
  - [x] Test with valid/invalid credentials

### 1.6 User Profile Creation (1.5 hours)
- [x] **Firestore User Document**
  - [x] Create function `createUserProfile(userId, data)`
  - [x] On registration, create user doc in Firestore
  - [x] Add fields: id, email, displayName, photoURL, isOnline, lastSeen, createdAt
  - [x] Add default values (photoURL: null, isOnline: true)
  - [x] Test profile creation
  - [x] Verify document appears in Firebase console

### 1.7 Session Persistence (1 hour)
- [x] **Auth State Persistence**
  - [x] Save auth token to AsyncStorage on login
  - [x] Load auth token on app start
  - [x] Verify token with Firebase
  - [x] Auto-login if token valid
  - [x] Navigate to main app if authenticated
  - [x] Test: close app, reopen, should stay logged in

### 1.8 Basic Theme Setup (1 hour)
- [x] **Theme Foundation**
  - [x] Create `theme/colors.ts` with color palette
  - [ ] Create `theme/ThemeContext.tsx`
  - [ ] Add system theme detection
  - [ ] Wrap app with ThemeProvider
  - [ ] Test theme toggles with system settings

**Day 1 Checkpoint:** ✅ Can register, login, and session persists

---

## Day 2: Core Messaging (Tuesday)

**Goal:** Basic one-on-one chat working
**Time:** 8-10 hours

### 2.1 Chat Store Setup (1 hour)
- [ ] **Create Chat Store**
  - [ ] Create `stores/chatStore.ts`
  - [ ] Add state: `conversations`, `activeConversationId`
  - [ ] Add actions: `setConversations`, `addMessage`, `updateMessageStatus`
  - [ ] Add action: `setActiveConversation`
  - [ ] Test store with mock data

### 2.2 Chat Service (1.5 hours)
- [ ] **Create Chat Service**
  - [ ] Create `services/chat.ts`
  - [ ] Implement `getConversations(userId)`
  - [ ] Implement `getMessages(conversationId)`
  - [ ] Implement `sendMessage(conversationId, text, senderId)`
  - [ ] Implement `subscribeToMessages(conversationId, callback)`
  - [ ] Add error handling
  - [ ] Test each function

### 2.3 Conversation Service (1 hour)
- [ ] **Conversation Management**
  - [ ] Create `services/conversations.ts`
  - [ ] Implement `createConversation(participantIds)`
  - [ ] Implement `getOrCreateConversation(userId1, userId2)`
  - [ ] Implement `updateLastMessage(conversationId, message)`
  - [ ] Test conversation creation

### 2.4 Chat List Screen (2 hours)
- [ ] **Build Chat List UI**
  - [ ] Create `app/(tabs)/chats.tsx`
  - [ ] Fetch user's conversations from Firestore
  - [ ] Display conversations in FlatList
  - [ ] Show last message preview
  - [ ] Show timestamp
  - [ ] Show unread count (placeholder for now)
  - [ ] Add pull-to-refresh
  - [ ] Add empty state ("No conversations yet")
  - [ ] Navigate to chat screen on tap

### 2.5 Conversation List Item Component (1 hour)
- [ ] **Create ConversationListItem**
  - [ ] Create `components/conversation/ConversationListItem.tsx`
  - [ ] Display user avatar (square with rounded corners, 48x48)
  - [ ] Display user name (bold if unread)
  - [ ] Display last message preview (truncated)
  - [ ] Display timestamp (formatted)
  - [ ] Display unread badge
  - [ ] Display online indicator (green dot)
  - [ ] Add press handler
  - [ ] Test with different states

### 2.6 Avatar Component (30 mins)
- [ ] **Create Avatar Component**
  - [ ] Create `components/common/Avatar.tsx`
  - [ ] Square shape with borderRadius: 8
  - [ ] Size: 48x48 (default), accept size prop
  - [ ] Show image if photoURL provided
  - [ ] Show initials if no image
  - [ ] Add online indicator prop
  - [ ] Style for light/dark theme

### 2.7 Chat Screen UI (2 hours)
- [ ] **Build Chat Screen**
  - [ ] Create `app/chat/[id].tsx`
  - [ ] Add header with user name and back button
  - [ ] Add online/offline status in header
  - [ ] Create message list area
  - [ ] Create message input area
  - [ ] Style layout properly
  - [ ] Test navigation from chat list

### 2.8 Message List Component (1.5 hours)
- [ ] **Create MessageList**
  - [ ] Create `components/chat/MessageList.tsx`
  - [ ] Use FlatList with inverted
  - [ ] Render MessageBubble for each message
  - [ ] Add date separators
  - [ ] Auto-scroll to bottom on new message
  - [ ] Enable manual scroll
  - [ ] Add loading indicator

### 2.9 Message Bubble Component (1.5 hours)
- [ ] **Create MessageBubble**
  - [ ] Create `components/chat/MessageBubble.tsx`
  - [ ] Sent messages: right-aligned, blue background
  - [ ] Received messages: left-aligned, gray background
  - [ ] Display message text
  - [ ] Display timestamp (small, gray)
  - [ ] Display status icons (✓, ✓✓)
  - [ ] Add avatar for received messages
  - [ ] Style for light/dark theme
  - [ ] Add bubble tail (optional)

### 2.10 Message Input Component (1 hour)
- [ ] **Create MessageInput**
  - [ ] Create `components/chat/MessageInput.tsx`
  - [ ] Multi-line TextInput (auto-growing, max 5 lines)
  - [ ] Send button (icon or text)
  - [ ] Disable send button when empty
  - [ ] Clear input after send
  - [ ] Add placeholder text
  - [ ] Style for theme

### 2.11 Send Message Implementation (1.5 hours)
- [ ] **Wire Up Send Functionality**
  - [ ] Connect MessageInput to chat service
  - [ ] Call `sendMessage()` on button press
  - [ ] Add message to Firestore
  - [ ] Update conversation's lastMessage
  - [ ] Update both users' userConversations
  - [ ] Test message appears in Firestore
  - [ ] Test recipient sees message (use 2 accounts)

### 2.12 Real-Time Message Listener (1.5 hours)
- [ ] **Implement Real-Time Updates**
  - [ ] Subscribe to messages on chat screen mount
  - [ ] Use Firestore onSnapshot
  - [ ] Update chat store with new messages
  - [ ] Unsubscribe on unmount (cleanup)
  - [ ] Test: send message from Account A, see in Account B instantly
  - [ ] Test: multiple messages in quick succession

**Day 2 Checkpoint:** ✅ Two users can exchange messages in real-time

---

## Day 3: Reliability (Wednesday)

**Goal:** Optimistic UI + Offline support
**Time:** 8 hours

### 3.1 Optimistic UI - Setup (1 hour)
- [ ] **Prepare for Optimistic Updates**
  - [ ] Install UUID: `npm install uuid` and `npm install --save-dev @types/uuid`
  - [ ] Add `localId` field to Message type
  - [ ] Add `status` field to Message type
  - [ ] Update MessageBubble to show status
  - [ ] Add retry button for failed messages

### 3.2 Optimistic Send Implementation (2 hours)
- [ ] **Implement Optimistic Send**
  - [ ] Generate localId (UUID) on send
  - [ ] Create optimistic message object (status: 'sending')
  - [ ] Add to store immediately (addMessage action)
  - [ ] Add to UI instantly
  - [ ] Send to Firestore asynchronously
  - [ ] On success: replace localId with serverId, status: 'sent'
  - [ ] On failure: update status to 'failed'
  - [ ] Test: message appears instantly (<100ms)

### 3.3 Message Status Updates (1 hour)
- [ ] **Status Tracking**
  - [ ] Update `updateMessageStatus` action in store
  - [ ] Handle status transitions: sending → sent → delivered → read
  - [ ] Update UI checkmarks based on status
  - [ ] Test status progression with 2 accounts

### 3.4 Cache Service Setup (1 hour)
- [ ] **Create Cache Service**
  - [ ] Create `services/cache.ts`
  - [ ] Implement `cacheMessages(conversationId, messages)`
  - [ ] Implement `getCachedMessages(conversationId)`
  - [ ] Implement `cacheConversations(conversations)`
  - [ ] Implement `getCachedConversations()`
  - [ ] Keep last 100 messages per conversation
  - [ ] Test save/load cycle

### 3.5 Message Caching Implementation (1.5 hours)
- [ ] **Integrate Caching**
  - [ ] Cache messages when received from Firestore
  - [ ] Load cached messages on chat screen mount
  - [ ] Display cached messages immediately
  - [ ] Then subscribe to Firestore for updates
  - [ ] Merge cached + real-time data (deduplicate)
  - [ ] Test: close app, reopen, messages load instantly

### 3.6 Offline Detection (1 hour)
- [ ] **Network Status Monitoring**
  - [ ] Install NetInfo: `npx expo install @react-native-community/netinfo`
  - [ ] Create `utils/network.ts`
  - [ ] Implement `useNetworkStatus()` hook
  - [ ] Add network status to UI store
  - [ ] Show offline banner when disconnected
  - [ ] Test: enable airplane mode

### 3.7 Offline Message Queue (2 hours)
- [ ] **Queue Mechanism**
  - [ ] Create offline queue in AsyncStorage
  - [ ] Add messages to queue when offline
  - [ ] Show 'sending' status for queued messages
  - [ ] Monitor network status changes
  - [ ] Process queue when back online
  - [ ] Send queued messages to Firestore
  - [ ] Update message statuses
  - [ ] Remove from queue on success
  - [ ] Test: send offline, go online, messages deliver

### 3.8 Retry Failed Messages (1 hour)
- [ ] **Retry Logic**
  - [ ] Add retry button to failed messages
  - [ ] Implement retry handler
  - [ ] Attempt to resend to Firestore
  - [ ] Update status accordingly
  - [ ] Test: force failure, tap retry

### 3.9 Conversation Caching (30 mins)
- [ ] **Cache Conversation List**
  - [ ] Cache conversations on load
  - [ ] Load cached conversations on app start
  - [ ] Show cached list immediately
  - [ ] Sync with Firestore in background
  - [ ] Test: offline conversation list shows cached data

**Day 3 Checkpoint:** ✅ Messages appear instantly, work offline, persist across restarts

---

## Day 4: Presence & Receipts (Thursday)

**Goal:** Online status + Read receipts
**Time:** 6-8 hours

### 4.1 Presence Service Setup (1 hour)
- [ ] **Create Presence Service**
  - [ ] Create `services/presence.ts`
  - [ ] Implement `setUserOnline(userId)`
  - [ ] Implement `setUserOffline(userId)`
  - [ ] Implement `subscribeToUserPresence(userId, callback)`
  - [ ] Test presence updates in Firestore

### 4.2 App State Listeners (1.5 hours)
- [ ] **Monitor App State**
  - [ ] Use React Native `AppState` API
  - [ ] Set user online on app foreground
  - [ ] Set user offline on app background
  - [ ] Update lastSeen timestamp
  - [ ] Implement onDisconnect fallback (Firebase Realtime Database or Cloud Function)
  - [ ] Test: background app, user goes offline
  - [ ] Test: force quit app, user goes offline

### 4.3 Online Status UI - Chat List (1 hour)
- [ ] **Display Online Status in List**
  - [ ] Subscribe to presence for each conversation user
  - [ ] Show green dot for online users
  - [ ] Show "last seen" for offline users
  - [ ] Format timestamp: "5m ago", "2h ago", "Yesterday"
  - [ ] Update in real-time
  - [ ] Test with 2 accounts

### 4.4 Online Status UI - Chat Screen (30 mins)
- [ ] **Display Online Status in Header**
  - [ ] Subscribe to other user's presence
  - [ ] Show "Online" with green dot
  - [ ] Show "Last seen X ago" when offline
  - [ ] Update in real-time
  - [ ] Test status changes

### 4.5 Read Receipt Tracking (1.5 hours)
- [ ] **Implement Read Receipts**
  - [ ] Track when user opens/views chat
  - [ ] Get unread messages in conversation
  - [ ] Batch update `readBy` array for unread messages
  - [ ] Use Firestore transaction for atomicity
  - [ ] Throttle updates (max 1 per second)
  - [ ] Test: Account A sends, Account B opens chat, readBy updates

### 4.6 Read Receipt UI (1 hour)
- [ ] **Display Read Status**
  - [ ] Update MessageBubble status icons
  - [ ] Single checkmark (✓): sent
  - [ ] Double checkmark (✓✓): delivered (all recipients received)
  - [ ] Blue double checkmark (✓✓): read (all recipients read)
  - [ ] Listen for readBy updates
  - [ ] Update UI when message read
  - [ ] Test with 2 accounts

### 4.7 Unread Count (1 hour)
- [ ] **Implement Unread Badges**
  - [ ] Track unread count per conversation in userConversations
  - [ ] Increment on new message (if not sender)
  - [ ] Decrement when messages marked as read
  - [ ] Display count in ConversationListItem
  - [ ] Bold conversation name if unread > 0
  - [ ] Test unread count updates

### 4.8 Typing Indicators (Optional - 1.5 hours)
- [ ] **Add Typing Indicators**
  - [ ] Track typing state in conversation doc
  - [ ] Update when user types (debounced)
  - [ ] Clear after 3 seconds of no typing
  - [ ] Clear when message sent
  - [ ] Display "User is typing..." in chat
  - [ ] Test typing indicator appears/disappears

**Day 4 Checkpoint:** ✅ Can see who's online and when messages are read

---

## Day 5: Group Chat (Friday)

**Goal:** Group messaging functional
**Time:** 8-10 hours

### 5.1 Group Service (1 hour)
- [ ] **Create Group Service**
  - [ ] Create `services/groups.ts`
  - [ ] Implement `createGroup(name, participantIds, creatorId)`
  - [ ] Implement `addParticipants(groupId, userIds)`
  - [ ] Implement `getGroupInfo(groupId)`
  - [ ] Test group creation in Firestore

### 5.2 User Picker Component (1.5 hours)
- [ ] **Create User Picker**
  - [ ] Create `components/conversation/UserPicker.tsx`
  - [ ] Fetch all users from Firestore
  - [ ] Display in searchable list
  - [ ] Multi-select functionality
  - [ ] Show selected count
  - [ ] Prevent selecting self
  - [ ] Return selected user IDs

### 5.3 Create Group Screen (2 hours)
- [ ] **Build Group Creation UI**
  - [ ] Create `app/group/create.tsx`
  - [ ] Add group name input
  - [ ] Add user picker (min 2 users)
  - [ ] Add optional group photo upload (placeholder for MVP)
  - [ ] Add create button (disabled until valid)
  - [ ] Validate inputs
  - [ ] Call createGroup service
  - [ ] Navigate to group chat on success
  - [ ] Test with 3+ users

### 5.4 Group Conversation Creation (1.5 hours)
- [ ] **Wire Up Group Creation**
  - [ ] Create conversation doc (type: 'group')
  - [ ] Add all participants to participants array
  - [ ] Add participantDetails for each user
  - [ ] Set groupName and createdBy
  - [ ] Create userConversations for all participants
  - [ ] Add system message: "User created group"
  - [ ] Test group appears in all users' chat lists

### 5.5 Group Chat UI - Chat Screen (1.5 hours)
- [ ] **Adapt Chat Screen for Groups**
  - [ ] Detect conversation type (direct vs group)
  - [ ] Show group name in header
  - [ ] Show member count: "Group Name • 5 members"
  - [ ] Display sender name above each message
  - [ ] Display sender avatar for all messages
  - [ ] Own messages still right-aligned
  - [ ] Test UI with group messages

### 5.6 Group Message Sending (1 hour)
- [ ] **Send Messages to Group**
  - [ ] Adapt sendMessage for group type
  - [ ] Send message to conversation (same as 1-on-1)
  - [ ] Update all participants' userConversations
  - [ ] Increment unread count for all except sender
  - [ ] Test message delivered to all members

### 5.7 Group Message Receiving (1 hour)
- [ ] **Receive Group Messages**
  - [ ] Subscribe to group messages (same listener)
  - [ ] Display with sender info
  - [ ] Test with 3+ users, all receive messages
  - [ ] Test sending from different users

### 5.8 Group Info Screen (Optional - 1.5 hours)
- [ ] **Build Group Info UI**
  - [ ] Create `app/group/[id].tsx`
  - [ ] Display group name and photo
  - [ ] List all members with avatars
  - [ ] Show online status for each member
  - [ ] Show member count
  - [ ] Show created date and creator
  - [ ] Add "Exit Group" button (functionality post-MVP)
  - [ ] Navigate from chat header

### 5.9 Read Receipts in Groups (1 hour)
- [ ] **Adapt Read Receipts for Groups**
  - [ ] Update readBy array with user IDs
  - [ ] Show read count in message: "Read by 3"
  - [ ] Or show checkmarks when all read
  - [ ] Test with multiple users reading

**Day 5 Checkpoint:** ✅ 3+ users can chat in a group

---

## Day 6: Push Notifications (Saturday)

**Goal:** Notifications working
**Time:** 6-8 hours

### 6.1 Notification Permissions (1 hour)
- [ ] **Request Permissions**
  - [ ] Create `services/notifications.ts`
  - [ ] Implement `requestPermissions()`
  - [ ] Request on first app open (after login)
  - [ ] Handle permission granted/denied
  - [ ] Save permission status
  - [ ] Test on physical device

### 6.2 Push Token Management (1 hour)
- [ ] **Get and Store Push Token**
  - [ ] Implement `getPushToken()`
  - [ ] Get Expo push token
  - [ ] Save token to user document in Firestore
  - [ ] Update token on change
  - [ ] Implement `savePushToken(userId, token)`
  - [ ] Test token saved to Firestore

### 6.3 Notification Handler Setup (1 hour)
- [ ] **Handle Incoming Notifications**
  - [ ] Implement `setupNotificationHandlers()`
  - [ ] Handle notification received (foreground)
  - [ ] Handle notification tapped (background/killed)
  - [ ] Extract conversationId from notification data
  - [ ] Navigate to correct chat on tap
  - [ ] Test notification appears

### 6.4 Firebase Cloud Functions Setup (1 hour)
- [ ] **Initialize Cloud Functions**
  - [ ] Install Firebase CLI: `npm install -g firebase-tools`
  - [ ] Login: `firebase login`
  - [ ] Initialize functions: `firebase init functions`
  - [ ] Choose TypeScript
  - [ ] Install dependencies in `/functions`
  - [ ] Test deploy: `firebase deploy --only functions`

### 6.5 Cloud Function - Send Push Notification (2 hours)
- [ ] **Create Notification Function**
  - [ ] Create function in `functions/src/index.ts`
  - [ ] Trigger: `onDocumentCreated('conversations/{convId}/messages/{msgId}')`
  - [ ] Get conversation document
  - [ ] Get recipient user IDs (exclude sender)
  - [ ] Get recipients' push tokens from Firestore
  - [ ] Check if recipient is viewing conversation (skip if yes)
  - [ ] Build notification payload
  - [ ] Send via Firebase Cloud Messaging (FCM)
  - [ ] Handle errors (invalid tokens)
  - [ ] Deploy function: `firebase deploy --only functions`
  - [ ] Test function triggers on new message

### 6.6 Notification Content (1 hour)
- [ ] **Format Notification Properly**
  - [ ] One-on-one: "John: Hey, how are you?"
  - [ ] Group: "Family • Alice: Dinner at 6pm"
  - [ ] Include conversationId in data
  - [ ] Add sound and badge
  - [ ] Test notification content looks good

### 6.7 Foreground Notifications (30 mins)
- [ ] **Show Notifications in Foreground**
  - [ ] Configure to show when app open
  - [ ] Style notification banner
  - [ ] Test receiving while app open
  - [ ] Don't show if viewing that conversation

### 6.8 Deep Linking (1 hour)
- [ ] **Navigate from Notification**
  - [ ] Extract conversationId from notification data
  - [ ] Navigate to chat/[id] screen
  - [ ] Test: tap notification, opens correct chat
  - [ ] Test from: foreground, background, killed state

**Day 6 Checkpoint:** ✅ Notifications work in all app states

---

## Day 7: Polish & Deploy (Sunday)

**Goal:** Production-ready MVP
**Time:** 8 hours

### 7.1 Bug Fixes & Edge Cases (2 hours)
- [ ] **Fix Known Issues**
  - [ ] Test all features with 2-3 user accounts
  - [ ] Fix any crashes or errors
  - [ ] Handle empty states properly
  - [ ] Fix race conditions in message sending
  - [ ] Handle deleted users gracefully
  - [ ] Fix any UI layout issues
  - [ ] Test on poor network (3G simulation)

### 7.2 UI Polish (1.5 hours)
- [ ] **Improve Visual Design**
  - [ ] Review all screens for consistency
  - [ ] Add loading states where missing
  - [ ] Improve empty states with friendly messages
  - [ ] Add smooth animations (fade in, slide)
  - [ ] Polish message bubbles (shadows, borders)
  - [ ] Ensure proper spacing and padding
  - [ ] Add haptic feedback (optional)
  - [ ] Test UI in both light and dark mode

### 7.3 Error Handling (1 hour)
- [ ] **User-Friendly Error Messages**
  - [ ] Review all try-catch blocks
  - [ ] Display clear error messages to user
  - [ ] Add retry options where appropriate
  - [ ] Log errors to console for debugging
  - [ ] Test error scenarios: no internet, invalid input, etc.

### 7.4 Performance Optimization (1 hour)
- [ ] **Optimize App Performance**
  - [ ] Add React.memo to expensive components
  - [ ] Optimize FlatList (windowSize, maxToRenderPerBatch)
  - [ ] Check for memory leaks (unsubscribe listeners)
  - [ ] Minimize re-renders in chat screen
  - [ ] Test scroll performance with 100+ messages
  - [ ] Profile app with React Native Profiler

### 7.5 Theme Implementation (Optional - 1.5 hours)
- [ ] **Add Theme Toggle (if time permits)**
  - [ ] Create settings/profile screen
  - [ ] Add theme selector: Light / Dark / System
  - [ ] Implement theme switching logic
  - [ ] Update all components to use theme
  - [ ] Test theme changes on all screens
  - [ ] Ensure text contrast (WCAG AA)
  - [ ] Test theme persists after restart

### 7.6 Final Testing (1.5 hours)
- [ ] **Comprehensive Testing**
  - [ ] Test on physical iPhone 16 Pro
  - [ ] Test all MVP features checklist:
    - [ ] Registration and login
    - [ ] Send/receive messages
    - [ ] Optimistic UI
    - [ ] Offline mode
    - [ ] Message persistence
    - [ ] Online status
    - [ ] Read receipts
    - [ ] Group chat (3+ users)
    - [ ] Push notifications (all states)
  - [ ] Test edge cases: app kill, poor network, etc.
  - [ ] Document any known issues

### 7.7 Firestore Security Rules (30 mins)
- [ ] **Deploy Security Rules**
  - [ ] Review security rules in Firebase console
  - [ ] Test rules with different user scenarios
  - [ ] Ensure users can only access their data
  - [ ] Deploy rules to production
  - [ ] Test app still works with rules active

### 7.8 EAS Build (Optional - 1 hour)
- [ ] **Create iOS Build**
  - [ ] Configure `eas.json`
  - [ ] Run: `eas build --platform ios --profile development`
  - [ ] Wait for build to complete
  - [ ] Download and install on iPhone 16 Pro
  - [ ] Test on physical device
  - [ ] OR: Stay with Expo Go if builds fail

### 7.9 TestFlight Deployment (Optional - 1 hour)
- [ ] **Deploy to TestFlight (if Apple Developer account)**
  - [ ] Create app in App Store Connect
  - [ ] Upload build via EAS
  - [ ] Add internal testers
  - [ ] Enable TestFlight testing
  - [ ] Install via TestFlight on iPhone
  - [ ] Test all features on TestFlight build

### 7.10 Documentation (30 mins)
- [ ] **Create Project Documentation**
  - [ ] Write README.md with setup instructions
  - [ ] Document environment variables needed
  - [ ] Add screenshots of app
  - [ ] Create demo video (1-2 minutes)
  - [ ] Document known issues/limitations
  - [ ] Add future roadmap section

**Day 7 Checkpoint:** ✅ MVP complete, tested, and deployed!

---

## Post-MVP Tasks (Future)

### Enhancements
- [ ] Message editing and deletion
- [ ] Media sharing (photos, videos, files)
- [ ] Voice messages
- [ ] Message search functionality
- [ ] Message reactions (emoji)
- [ ] Reply/quote functionality
- [ ] Group admin controls
- [ ] Block/report users
- [ ] End-to-end encryption
- [ ] Web version
- [ ] Desktop app

### AI Features
- [ ] Message summarization
- [ ] Real-time translation
- [ ] Smart reply suggestions
- [ ] Action item extraction
- [ ] Sentiment analysis

---
```
