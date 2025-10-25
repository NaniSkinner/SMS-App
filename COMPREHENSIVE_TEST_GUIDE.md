# 📋 Comprehensive Test Guide - MessageApp

**Last Updated:** October 25, 2025  
**App Version:** 1.0.0  
**Test Environment:** iOS Simulator / Physical Device  
**Branch:** AIFeature

---

## 🎯 Testing Prerequisites

### Setup Requirements

- [ ] Two test users configured in Firebase Auth
- [ ] Both test users added to Google OAuth consent screen (if in Testing mode)
- [ ] Two iOS simulators or devices available
- [ ] Firebase Console access for verification
- [ ] AWS Console access (optional, for Lambda verification)

### Test User Accounts

- **User 1:** [Your test email 1]
- **User 2:** [Your test email 2]

---

## 🔐 FEATURE 1: Authentication & Registration

### Test 1.1: New User Registration

**Objective:** Verify new users can register successfully

**Steps:**

1. Launch app on Simulator 1
2. Should see login screen automatically
3. Tap **"Register"** tab/link
4. Enter test user 1 credentials:
   - Display Name: "Test User One"
   - Email: [test email 1]
   - Password: [secure password]
5. Tap **"Register"** button

**Expected Results:**

- ✅ Registration succeeds
- ✅ User automatically logged in
- ✅ Redirected to Chats screen (empty state)
- ✅ User document created in Firestore (`users/{userId}`)

**Firebase Verification:**

```
Firestore > users > [userId]
Should contain:
- displayName: "Test User One"
- email: [email]
- createdAt: [timestamp]
- presence: { status: "online" }
```

---

### Test 1.2: User Login

**Objective:** Verify existing users can log in

**Steps:**

1. If logged in, sign out first
2. On login screen, enter credentials:
   - Email: [test email 1]
   - Password: [password]
3. Tap **"Login"** button

**Expected Results:**

- ✅ Login succeeds
- ✅ Redirected to Chats screen
- ✅ User status set to "online" in Firestore
- ✅ Tab bar visible at bottom (Chats, AI, Profile)

---

### Test 1.3: Login Validation

**Objective:** Verify error handling for invalid credentials

**Steps:**

1. Try logging in with:
   - Wrong email: `wrong@email.com`
   - Wrong password: `wrongpassword`
2. Try with empty fields

**Expected Results:**

- ❌ Login fails with appropriate error message
- ❌ "Invalid email or password" shown
- ❌ Empty fields show validation error

---

### Test 1.4: User Logout

**Objective:** Verify logout functionality

**Steps:**

1. Log in with test user 1
2. Navigate to **Profile** tab
3. Tap **"Sign Out"** button
4. Confirm sign out in alert

**Expected Results:**

- ✅ User signed out successfully
- ✅ Redirected to login screen
- ✅ User status set to "offline" in Firestore
- ✅ Cannot access app without re-login

---

## 💬 FEATURE 2: One-on-One Messaging

### Test 2.1: Start New Conversation

**Objective:** Verify users can start a conversation

**Prerequisites:**

- User 1 logged in on Simulator 1
- User 2 logged in on Simulator 2

**Steps (Simulator 1 - User 1):**

1. On Chats screen, tap **"+"** FAB (Floating Action Button)
2. Should see "New Chat" modal
3. Tap **"Direct Message"**
4. Should see users list
5. Select **"Test User Two"** from list
6. Should navigate to chat screen

**Expected Results:**

- ✅ Modal appears with options
- ✅ Users list shows available users (User 2)
- ✅ Chat screen opens with User 2's name in header
- ✅ Message input visible at bottom
- ✅ Empty state message shown (no messages yet)

---

### Test 2.2: Send Text Message

**Objective:** Verify message sending and receiving

**Steps (Simulator 1 - User 1):**

1. In chat with User 2
2. Type message: "Hello! This is a test message."
3. Tap send button (paper plane icon)

**Expected Results (Sender - Simulator 1):**

- ✅ Message appears immediately in chat
- ✅ Message aligned to right (sender side)
- ✅ Message shows timestamp
- ✅ Input field clears after sending
- ✅ Keyboard remains visible

**Expected Results (Receiver - Simulator 2):**

- ✅ Message appears in real-time (within 1-2 seconds)
- ✅ Message aligned to left (receiver side)
- ✅ Push notification received (if app in background)
- ✅ Conversation appears in Chats list

**Firebase Verification:**

```
Firestore > conversations > [conversationId] > messages > [messageId]
Should contain:
- content: "Hello! This is a test message."
- senderId: [user1Id]
- timestamp: [firestore timestamp]
- type: "text"
```

---

### Test 2.3: Message Persistence

**Objective:** Verify messages persist across app restarts

**Steps:**

1. Send several messages in conversation
2. Note the last message
3. Close app completely (swipe up from app switcher)
4. Reopen app
5. Navigate to same conversation

**Expected Results:**

- ✅ All messages still visible
- ✅ Messages in correct order (oldest to newest)
- ✅ Timestamps correct
- ✅ No duplicate messages

---

### Test 2.4: Real-Time Messaging

**Objective:** Verify bi-directional real-time updates

**Steps:**

1. User 1 sends: "Message from User 1"
2. User 2 immediately sends: "Message from User 2"
3. User 1 sends: "Another message from User 1"

**Expected Results:**

- ✅ Both users see all messages in correct order
- ✅ No delay or lag (< 2 seconds)
- ✅ Messages appear without refresh
- ✅ Scroll position maintained

---

### Test 2.5: Long Messages

**Objective:** Verify handling of long text messages

**Steps:**

1. Type a very long message (500+ characters)
2. Send message

**Expected Results:**

- ✅ Message sends successfully
- ✅ Message bubble wraps text properly
- ✅ No text cutoff
- ✅ Scrollable if needed
- ✅ Doesn't break UI layout

---

### Test 2.6: Special Characters & Emojis

**Objective:** Verify special character handling

**Steps:**

1. Send message with emojis: "Hello! 👋 🎉 ✨"
2. Send message with special chars: "Test: @#$%^&\*()\_+-={}[]|:;"<>?,./"
3. Send message with newlines (press return multiple times)

**Expected Results:**

- ✅ All characters display correctly
- ✅ Emojis render properly
- ✅ Special characters don't break anything
- ✅ Newlines preserved

---

### Test 2.7: Typing Indicator

**Objective:** Verify typing indicators work

**Steps:**

1. User 1: Start typing (don't send)
2. User 2: Observe chat screen

**Expected Results:**

- ✅ User 2 sees "Test User One is typing..." indicator
- ✅ Indicator disappears when User 1 stops typing (after ~3 seconds)
- ✅ Indicator updates in real-time

---

### Test 2.8: User Presence (Online/Offline)

**Objective:** Verify presence status updates

**Steps:**

1. User 2: Close app completely
2. User 1: Check conversation header
3. User 2: Reopen app
4. User 1: Observe status change

**Expected Results:**

- ✅ User 1 sees "Offline" when User 2 closes app
- ✅ Status updates to "Online" when User 2 reopens
- ✅ Status shows in conversation header
- ✅ Updates in real-time

---

## 👥 FEATURE 3: Group Chats

### Test 3.1: Create Group Chat

**Objective:** Verify group creation

**Steps (User 1):**

1. On Chats screen, tap **"+"** FAB
2. Tap **"Group Chat"**
3. Enter group name: "Test Group"
4. Select User 2 from members list
5. Tap **"Create Group"**

**Expected Results:**

- ✅ Group creation succeeds
- ✅ Navigates to group chat screen
- ✅ Group name shown in header
- ✅ Both users are members

**Firebase Verification:**

```
Firestore > conversations > [conversationId]
Should contain:
- type: "group"
- name: "Test Group"
- participants: [user1Id, user2Id]
- createdBy: user1Id
```

---

### Test 3.2: Group Messaging

**Objective:** Verify group messages work

**Steps:**

1. User 1: Send "Message from User 1" in group
2. User 2: Send "Message from User 2" in group
3. Both verify messages appear

**Expected Results:**

- ✅ All members see all messages
- ✅ Sender name shown on each message
- ✅ Real-time updates work
- ✅ Message order correct

---

### Test 3.3: View Group Info

**Objective:** Verify group information screen

**Steps:**

1. In group chat, tap group name in header
2. Should open Group Info screen

**Expected Results:**

- ✅ Group Info screen opens
- ✅ Shows group name
- ✅ Shows list of members
- ✅ Shows member avatars/names
- ✅ Back button works

---

### Test 3.4: Leave Group

**Objective:** Verify leaving a group

**Steps:**

1. User 2: Open Group Info
2. Tap **"Leave Group"** button
3. Confirm leave action

**Expected Results:**

- ✅ User 2 removed from group
- ✅ User 2 navigated back to Chats list
- ✅ Group no longer appears in User 2's chats
- ✅ User 1 still sees group
- ✅ User 1 sees system message: "User 2 left the group"

---

## 🤖 FEATURE 4: AI Chat Assistant

### Test 4.1: AI Chat Basic Interaction

**Objective:** Verify AI responds to messages

**Steps:**

1. Navigate to **AI** tab
2. Type message: "Hello, who are you?"
3. Tap send

**Expected Results:**

- ✅ Message sent and appears on right
- ✅ Thinking indicator appears (animated dots)
- ✅ AI response appears within 5-10 seconds
- ✅ AI response aligned to left
- ✅ Response is relevant and helpful
- ✅ Conversation persists

**Console Verification:**

```
Look for:
✅ AI chat response received
💾 Conversation saved to Firestore
```

---

### Test 4.2: AI Conversation History

**Objective:** Verify AI remembers conversation context

**Steps:**

1. Send: "My favorite color is blue"
2. Wait for response
3. Send: "What's my favorite color?"

**Expected Results:**

- ✅ AI responds with "blue" or references previous message
- ✅ Context maintained across messages
- ✅ Conversation history loaded on app restart

---

### Test 4.3: AI Error Handling

**Objective:** Verify graceful error handling

**Steps:**

1. Turn on Airplane Mode
2. Try sending AI message
3. Turn off Airplane Mode
4. Try again

**Expected Results:**

- ✅ Shows error message when offline
- ✅ Allows retry when back online
- ✅ No app crash
- ✅ Previous messages still visible

---

## 📅 FEATURE 5: Google Calendar Integration

### Test 5.1: First-Time Calendar Connection

**Objective:** Verify calendar OAuth flow works

**Steps:**

1. Go to AI tab
2. Should see "Calendar not connected" section
3. Tap **"Connect Google Calendar"** button
4. Browser/WebView opens with Google sign-in
5. Sign in with test user Google account
6. Grant calendar permissions (read + write)
7. Should redirect back to app

**Expected Results:**

- ✅ OAuth page opens in browser
- ✅ Google sign-in works
- ✅ Permission screen shows calendar scopes
- ✅ Redirects back to app automatically
- ✅ Shows "✅ Calendar Connected" alert
- ✅ Calendar connection status updates
- ✅ Shows hint: "Now you can ask me about your schedule..."
- ✅ Shows "Reset Connection" and "Disconnect" buttons

**Console Verification:**

```
🔍 OAuth Request Configuration:
  - Client ID: 703601462595-qm6fnoqu40dqiqleejiiaean8v703639...
  - Redirect URI: com.googleusercontent.apps...
  - PKCE codeVerifier: Present
✅ OAuth success! Processing authentication...
✅ Access token received
💾 Storing tokens in Firestore...
✅ Tokens stored successfully
✅ Google Calendar connected successfully!
```

**Firebase Verification:**

```
Firestore > users > [userId] > tokens > google
Should contain:
- accessToken: [token]
- refreshToken: [token]
- expiresAt: [timestamp]
- scope: "calendar.readonly calendar.events..."
```

---

### Test 5.2: Calendar Query - Today's Events

**Objective:** Verify AI can read calendar

**Steps:**

1. Ensure you have events on your Google Calendar for today
2. In AI chat, send: "What's on my schedule today?"

**Expected Results:**

- ✅ AI responds with your actual events
- ✅ Shows event names
- ✅ Shows event times
- ✅ Shows event details if available
- ✅ If no events: "You have no events today"

**Example Response:**

```
Here's your schedule for today:

1. Team Meeting - 10:00 AM to 11:00 AM
   Location: Conference Room A

2. Lunch with John - 12:30 PM to 1:30 PM

3. Project Review - 3:00 PM to 4:00 PM
```

---

### Test 5.3: Calendar Query - Specific Date

**Objective:** Verify AI can query specific dates

**Steps:**

1. Send: "What's on my calendar for tomorrow?"
2. Send: "Do I have anything scheduled for next Monday?"
3. Send: "What meetings do I have this week?"

**Expected Results:**

- ✅ AI correctly interprets date references
- ✅ Shows events for requested date/range
- ✅ Handles relative dates (tomorrow, next week, etc.)
- ✅ Shows "No events" if calendar is empty

---

### Test 5.4: Create Calendar Event via AI

**Objective:** Verify AI can create events

**Steps:**

1. Send: "Schedule a meeting with Sarah tomorrow at 2 PM for 1 hour"
2. Wait for AI response
3. Check your actual Google Calendar

**Expected Results:**

- ✅ AI confirms event creation
- ✅ Shows event details in response
- ✅ Event appears in Google Calendar with:
  - Title: "Meeting with Sarah" (or similar)
  - Date: Tomorrow
  - Time: 2:00 PM - 3:00 PM
  - Duration: 1 hour

**Alternative Test:**

```
Send: "Add 'Doctor appointment' to my calendar for Friday at 9 AM"
Expected: Event created on Friday at 9:00 AM
```

---

### Test 5.5: Reset Calendar Connection

**Objective:** Verify reset clears stale tokens and reconnects

**Steps:**

1. Ensure calendar is connected
2. Tap **"Reset Connection"** button
3. Confirm alert
4. Should immediately show OAuth page
5. Sign in with Google
6. Grant permissions

**Expected Results:**

- ✅ Alert explains what will happen
- ✅ OAuth page opens immediately after confirmation
- ✅ Old tokens cleared from Firestore
- ✅ New tokens stored
- ✅ Connection works after reset
- ✅ AI can access calendar with fresh tokens

**Console Verification:**

```
🔄 Disconnecting Google Calendar...
✅ Tokens deleted from Firestore
✅ User preferences updated
✅ Google Calendar disconnected successfully
🔍 OAuth Request Configuration: [new request]
✅ OAuth success! Processing authentication...
✅ Tokens stored successfully
```

**This fixes Error 400 issues!**

---

### Test 5.6: Disconnect Calendar

**Objective:** Verify disconnect clears connection

**Steps:**

1. Ensure calendar is connected
2. Tap **"Disconnect"** button
3. Confirm disconnection
4. Try asking AI about calendar

**Expected Results:**

- ✅ Alert confirms disconnection
- ✅ Calendar status updates to "not connected"
- ✅ "Connect Calendar" button appears again
- ✅ Reset/Disconnect buttons disappear
- ✅ AI responds: "I don't have access to your calendar. Please connect it first."

---

### Test 5.7: Calendar Token Refresh (Long-term)

**Objective:** Verify tokens refresh automatically

**Steps:**

1. Connect calendar
2. Wait 1+ hour (access token expiry)
3. Ask AI about calendar again

**Expected Results:**

- ✅ AI still accesses calendar (no re-auth needed)
- ✅ Lambda refreshes token in background
- ✅ No error messages
- ✅ Seamless user experience

---

## 🎉 FEATURE 6: RSVP Tracking

### Test 6.1: Detect RSVP Invitation

**Objective:** Verify app detects event invitations

**Steps:**

1. User 1 → User 2: Send "Hey! Want to join us for dinner on Friday at 7 PM at Mario's Restaurant?"
2. Wait 2-3 seconds for AI processing

**Expected Results:**

- ✅ RSVP card appears above message
- ✅ Card shows event details:
  - Title: "Dinner" or "Event"
  - Date/Time: Friday at 7 PM
  - Location: Mario's Restaurant (if detected)
- ✅ Shows RSVP buttons: Yes / Maybe / No
- ✅ Initially shows "No response yet"

---

### Test 6.2: Accept RSVP

**Objective:** Verify RSVP acceptance works

**Steps (User 2):**

1. See RSVP card for dinner invitation
2. Tap **"Yes"** button

**Expected Results (User 2):**

- ✅ Button highlights/changes color
- ✅ Shows "You: ✅ Yes"
- ✅ Response saves immediately

**Expected Results (User 1):**

- ✅ RSVP card updates in real-time
- ✅ Shows "User Two: ✅ Yes"
- ✅ Going count updates: "1 going"

**Firebase Verification:**

```
Firestore > conversations > [id] > messages > [msgId]
Should have aiMetadata:
- hasInvitation: true
- rsvpStatus: { [user2Id]: "yes" }
- goingCount: 1
```

---

### Test 6.3: Multiple RSVPs in Group

**Objective:** Verify group RSVP tracking

**Steps:**

1. In test group, User 1 sends: "Team lunch tomorrow at noon?"
2. User 2 taps **"Yes"**
3. Check RSVP counts

**Expected Results:**

- ✅ All group members see RSVP card
- ✅ Each member can respond independently
- ✅ Counts update: "X going, Y maybe, Z declined"
- ✅ Real-time updates for all members
- ✅ Each member sees "You: [response]"

---

### Test 6.4: Change RSVP Response

**Objective:** Verify users can change their response

**Steps:**

1. User 2: Tap **"Yes"** on invitation
2. Wait for update
3. User 2: Tap **"No"**

**Expected Results:**

- ✅ Response updates to "No"
- ✅ Going count decreases
- ✅ Declined count increases
- ✅ User 1 sees updated counts
- ✅ Previous response overwritten (not duplicated)

---

### Test 6.5: View All Responses

**Objective:** Verify response details view

**Steps:**

1. Multiple users RSVP to an event
2. Tap on RSVP card / "View All Responses" button
3. Should show detailed list

**Expected Results:**

- ✅ Modal/screen opens
- ✅ Lists all participants
- ✅ Shows each person's response
- ✅ Grouped by: Going / Maybe / No Response / Declined
- ✅ Shows user avatars/names
- ✅ Real-time updates

---

## 🎯 FEATURE 7: Event Extraction

### Test 7.1: Basic Event Detection

**Objective:** Verify app detects event mentions

**Steps:**

1. Send messages with event info:
   - "Meeting tomorrow at 3 PM"
   - "Conference call on Monday at 10 AM"
   - "Birthday party next Saturday at 5 PM"
2. Wait 2-3 seconds after each

**Expected Results:**

- ✅ Event card appears for each message
- ✅ Shows extracted info:
  - Event type (meeting, call, party, etc.)
  - Date/time
  - Title/description
- ✅ Card visually distinct from message
- ✅ Appears above the message content

---

### Test 7.2: Add Event to Calendar

**Objective:** Verify quick calendar add from extracted events

**Steps:**

1. Send: "Dentist appointment next Friday at 2 PM"
2. Event card appears
3. Tap **"Add to Calendar"** button (if implemented)
4. Check Google Calendar

**Expected Results:**

- ✅ Event added to calendar
- ✅ Shows success confirmation
- ✅ Event appears in Google Calendar
- ✅ Correct date, time, and title

---

### Test 7.3: Event with Location

**Objective:** Verify location extraction

**Steps:**

1. Send: "Let's meet at Starbucks on Main Street tomorrow at 4 PM"

**Expected Results:**

- ✅ Event card shows location: "Starbucks on Main Street"
- ✅ Location included if added to calendar
- ✅ Time and date correctly extracted

---

## ⚡ FEATURE 8: Priority Detection

### Test 8.1: Urgent Message Detection

**Objective:** Verify urgent messages are flagged

**Steps:**

1. Send messages with urgency keywords:
   - "URGENT: Server is down!"
   - "Emergency: Need help ASAP"
   - "CRITICAL: Deploy failed"
2. Wait for AI processing

**Expected Results:**

- ✅ Message shows priority badge/indicator
- ✅ Badge color: Red (for urgent/critical)
- ✅ Possibly shows "🔴" or "⚠️" icon
- ✅ Message visually stands out

---

### Test 8.2: Priority Details View

**Objective:** Verify priority information display

**Steps:**

1. Send urgent message: "URGENT: Client meeting moved to 2 PM today!"
2. Priority badge appears
3. Tap on priority badge

**Expected Results:**

- ✅ Modal opens showing:
  - Priority level: "Urgent"
  - Detected keywords: "URGENT", "today"
  - Suggested actions (if any)
  - Priority score/reasoning
- ✅ Close button works

---

### Test 8.3: Different Priority Levels

**Objective:** Verify multiple priority levels

**Steps:**

1. Send: "FYI: Report is ready" (Low priority)
2. Send: "Important: Review needed by EOD" (Medium)
3. Send: "URGENT: Production issue!" (High)

**Expected Results:**

- ✅ Each shows appropriate priority level
- ✅ Different colors:
  - Low: Gray/Blue
  - Medium: Yellow/Orange
  - High: Red
- ✅ Priority persists across app restarts

---

## 🤝 FEATURE 9: Decision Summarization

### Test 9.1: Detect Decision-Making Discussion

**Objective:** Verify app detects decisions in group chats

**Steps (In group chat):**

1. User 1: "Should we use React or Vue for the new project?"
2. User 2: "I vote for React"
3. User 1: "Sounds good, let's go with React"
4. Wait for AI processing

**Expected Results:**

- ✅ Decision card appears
- ✅ Shows summary: "Decision: Use React for new project"
- ✅ Shows participants involved
- ✅ Shows timestamp
- ✅ Shows decision status: "Decided" or "In Progress"

---

### Test 9.2: Decision with Multiple Options

**Objective:** Verify tracking of options/votes

**Steps:**

1. User 1: "Where should we have lunch? Pizza or Sushi?"
2. User 2: "Pizza!"
3. User 1: "Agreed, pizza it is"

**Expected Results:**

- ✅ Decision card shows options:
  - Pizza: 2 votes
  - Sushi: 0 votes
- ✅ Shows final decision: "Pizza"
- ✅ Lists who voted for what

---

### Test 9.3: View Decision History

**Objective:** Verify decision tracking over time

**Steps:**

1. Make several decisions in conversation
2. Scroll up to see older decision cards
3. Each should still be visible and accurate

**Expected Results:**

- ✅ All decision cards remain visible
- ✅ Correct chronological order
- ✅ Details preserved
- ✅ Can review past decisions anytime

---

## 📴 FEATURE 10: Offline Functionality

### Test 10.1: Offline Mode Banner

**Objective:** Verify offline detection

**Steps:**

1. Turn on Airplane Mode
2. Observe app behavior

**Expected Results:**

- ✅ Yellow banner appears at top: "You're offline"
- ✅ Banner persists while offline
- ✅ Banner disappears when back online
- ✅ App remains functional (read-only)

---

### Test 10.2: Offline Message Queue

**Objective:** Verify messages queue when offline

**Steps:**

1. Turn on Airplane Mode
2. Try sending a message
3. Turn off Airplane Mode

**Expected Results:**

- ✅ Message shows "pending" or "queued" indicator
- ✅ Message sends automatically when back online
- ✅ No duplicate messages
- ✅ Recipient receives message

---

### Test 10.3: Read Messages While Offline

**Objective:** Verify cached messages are accessible

**Steps:**

1. Load conversation with messages
2. Turn on Airplane Mode
3. Navigate away and back
4. Scroll through messages

**Expected Results:**

- ✅ All previously loaded messages visible
- ✅ Can scroll through conversation
- ✅ Timestamps and content correct
- ✅ No loading errors

---

## 👤 FEATURE 11: User Profile

### Test 11.1: View Profile

**Objective:** Verify profile displays correctly

**Steps:**

1. Navigate to **Profile** tab

**Expected Results:**

- ✅ Shows user avatar (initial letter if no photo)
- ✅ Shows display name
- ✅ Shows email address
- ✅ Shows "Sign Out" button
- ✅ UI is clean and readable

---

### Test 11.2: Sign Out

**Objective:** Verify logout works (tested earlier, verify again)

**Steps:**

1. Tap **"Sign Out"**
2. Confirm

**Expected Results:**

- ✅ User logged out
- ✅ Redirected to login screen
- ✅ Status set to offline
- ✅ No cached sensitive data accessible

---

## 🔔 FEATURE 12: Push Notifications

### Test 12.1: Notification Permissions

**Objective:** Verify notification permissions requested

**Steps:**

1. First launch of app (fresh install)
2. Complete registration/login

**Expected Results:**

- ✅ System asks for notification permission
- ✅ Can grant or deny
- ✅ App works either way

---

### Test 12.2: Receive Message Notification

**Objective:** Verify notifications for new messages

**Steps:**

1. User 1 app: Put in background
2. User 2: Send message to User 1
3. User 1: Check notification

**Expected Results:**

- ✅ Push notification appears on User 1's device
- ✅ Shows sender name: "Test User Two"
- ✅ Shows message preview
- ✅ Tapping notification opens app to conversation
- ✅ No notification if User 1 is in the conversation already

---

### Test 12.3: Notification in Active Conversation

**Objective:** Verify no notification spam in active chat

**Steps:**

1. User 1: Open conversation with User 2
2. User 2: Send message
3. User 1: Check for notification

**Expected Results:**

- ❌ No push notification (already in conversation)
- ✅ Message appears in chat immediately
- ✅ Sound/haptic feedback (optional)

---

## 🎨 FEATURE 13: UI/UX Elements

### Test 13.1: Dark Mode (if implemented)

**Objective:** Verify dark mode works

**Steps:**

1. Go to device Settings > Display
2. Enable Dark Mode
3. Return to app

**Expected Results:**

- ✅ App theme changes to dark
- ✅ All screens adapt
- ✅ Text readable on dark background
- ✅ Colors adjusted appropriately

---

### Test 13.2: Pull to Refresh

**Objective:** Verify refresh functionality

**Steps:**

1. On Chats list, pull down from top
2. Release

**Expected Results:**

- ✅ Shows refresh spinner
- ✅ Reloads conversations
- ✅ Spinner disappears when done
- ✅ New messages appear if any

---

### Test 13.3: Keyboard Behavior

**Objective:** Verify keyboard doesn't cover input

**Steps:**

1. Open any chat
2. Tap message input
3. Keyboard appears
4. Type long message

**Expected Results:**

- ✅ Keyboard pushes chat content up
- ✅ Input field remains visible
- ✅ Send button always accessible
- ✅ Can scroll messages while keyboard is open

---

### Test 13.4: Orientation Changes

**Objective:** Verify landscape mode works

**Steps:**

1. Rotate device to landscape
2. Navigate through different screens

**Expected Results:**

- ✅ UI adjusts to landscape
- ✅ No UI elements cut off
- ✅ Messages still readable
- ✅ Input fields accessible

---

## 🔥 FEATURE 14: Error Handling & Edge Cases

### Test 14.1: No Internet on Launch

**Objective:** Verify app handles offline launch

**Steps:**

1. Turn on Airplane Mode
2. Launch app
3. Turn off Airplane Mode

**Expected Results:**

- ✅ App launches without crash
- ✅ Shows offline banner
- ✅ Shows login screen
- ✅ When back online, login works

---

### Test 14.2: Firebase Connection Lost

**Objective:** Verify handling of Firebase disconnection

**Steps:**

1. While using app, turn on Airplane Mode briefly
2. Turn off Airplane Mode
3. Continue using app

**Expected Results:**

- ✅ App reconnects automatically
- ✅ Data syncs
- ✅ No data loss
- ✅ No crash

---

### Test 14.3: Empty States

**Objective:** Verify empty state messages

**Steps:**

1. New user with no conversations
2. Check Chats list
3. Check AI Chat history
4. Open conversation with no messages

**Expected Results:**

- ✅ Chats list: "No Conversations Yet" with CTA
- ✅ AI Chat: Welcome message with calendar connection info
- ✅ Empty conversation: Helpful placeholder
- ✅ All empty states have clear CTAs

---

### Test 14.4: Long Names & Text Overflow

**Objective:** Verify UI handles long text

**Steps:**

1. Create user with very long name: "Test User With An Extremely Long Name That Should Wrap"
2. Send message with long text
3. Create group with long name

**Expected Results:**

- ✅ Names truncate with "..." if needed
- ✅ No text overflow breaks layout
- ✅ UI remains usable
- ✅ Full text accessible on tap/hover

---

## 🚀 FEATURE 15: Performance & Stability

### Test 15.1: Large Conversation Load

**Objective:** Verify performance with many messages

**Steps:**

1. Send 100+ messages in a conversation
2. Scroll through all messages
3. Navigate away and back
4. Send new message

**Expected Results:**

- ✅ Scrolling is smooth (60 FPS)
- ✅ Messages load progressively (pagination)
- ✅ No lag or freeze
- ✅ Memory usage reasonable

---

### Test 15.2: Multiple Conversations

**Objective:** Verify app handles many conversations

**Steps:**

1. Create 10+ conversations
2. Send messages in each
3. Navigate between them
4. Check Chats list

**Expected Results:**

- ✅ All conversations listed
- ✅ Last message preview correct for each
- ✅ Unread counts accurate
- ✅ No performance degradation

---

### Test 15.3: Background/Foreground Transitions

**Objective:** Verify app handles state changes

**Steps:**

1. Use app normally
2. Switch to another app
3. Wait 5 minutes
4. Return to MessageApp
5. Repeat several times

**Expected Results:**

- ✅ App resumes where you left off
- ✅ New messages sync automatically
- ✅ No crash or freeze
- ✅ User stays logged in

---

### Test 15.4: Memory Leaks

**Objective:** Verify no memory issues

**Steps:**

1. Open and close many conversations
2. Navigate through all tabs repeatedly
3. Check device memory usage in Xcode
4. Use app for extended period

**Expected Results:**

- ✅ Memory usage stays reasonable (< 200MB)
- ✅ No continuous memory growth
- ✅ App doesn't slow down over time
- ✅ No "low memory" warnings

---

## 🔒 FEATURE 16: Security & Privacy

### Test 16.1: Session Persistence

**Objective:** Verify secure session handling

**Steps:**

1. Log in
2. Close app
3. Wait 24 hours
4. Reopen app

**Expected Results:**

- ✅ User still logged in (if session valid)
- ✅ OR redirected to login if session expired
- ✅ No unauthorized access

---

### Test 16.2: Token Security

**Objective:** Verify sensitive data not exposed

**Steps:**

1. Connect Google Calendar
2. Check console logs
3. Check app bundle/storage

**Expected Results:**

- ❌ No full tokens logged in console
- ❌ No sensitive data in plain text
- ✅ Tokens stored securely in Firestore
- ✅ Only user can access their own tokens

---

### Test 16.3: Unauthorized Access

**Objective:** Verify users can't access others' data

**Steps:**

1. Try to manually access another user's chat (if possible)
2. Check Firestore rules

**Expected Results:**

- ❌ Cannot read other users' messages
- ❌ Cannot write to conversations you're not in
- ✅ Firestore rules enforce access control
- ✅ Only conversation participants can read/write

---

## 📊 Test Results Summary Template

After completing all tests, fill out:

```
═══════════════════════════════════════════════════════════════
                     TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════════════

Tested By: [Your Name]
Date: [Date]
Build: [Version]
Device: [iPhone 17 Simulator / Physical Device]
iOS Version: [26.0]

FEATURE 1: Authentication & Registration
  ✅ Test 1.1: New User Registration
  ✅ Test 1.2: User Login
  ✅ Test 1.3: Login Validation
  ✅ Test 1.4: User Logout

FEATURE 2: One-on-One Messaging
  ✅ Test 2.1: Start New Conversation
  ✅ Test 2.2: Send Text Message
  ✅ Test 2.3: Message Persistence
  ✅ Test 2.4: Real-Time Messaging
  ✅ Test 2.5: Long Messages
  ✅ Test 2.6: Special Characters & Emojis
  ✅ Test 2.7: Typing Indicator
  ✅ Test 2.8: User Presence

FEATURE 3: Group Chats
  ✅ Test 3.1: Create Group Chat
  ✅ Test 3.2: Group Messaging
  ✅ Test 3.3: View Group Info
  ✅ Test 3.4: Leave Group

FEATURE 4: AI Chat Assistant
  ✅ Test 4.1: AI Chat Basic Interaction
  ✅ Test 4.2: AI Conversation History
  ✅ Test 4.3: AI Error Handling

FEATURE 5: Google Calendar Integration
  ✅ Test 5.1: First-Time Calendar Connection
  ✅ Test 5.2: Calendar Query - Today's Events
  ✅ Test 5.3: Calendar Query - Specific Date
  ✅ Test 5.4: Create Calendar Event via AI
  ✅ Test 5.5: Reset Calendar Connection ⭐ NEW FIX
  ✅ Test 5.6: Disconnect Calendar
  ✅ Test 5.7: Calendar Token Refresh

FEATURE 6: RSVP Tracking
  ✅ Test 6.1: Detect RSVP Invitation
  ✅ Test 6.2: Accept RSVP
  ✅ Test 6.3: Multiple RSVPs in Group
  ✅ Test 6.4: Change RSVP Response
  ✅ Test 6.5: View All Responses

FEATURE 7: Event Extraction
  ✅ Test 7.1: Basic Event Detection
  ✅ Test 7.2: Add Event to Calendar
  ✅ Test 7.3: Event with Location

FEATURE 8: Priority Detection
  ✅ Test 8.1: Urgent Message Detection
  ✅ Test 8.2: Priority Details View
  ✅ Test 8.3: Different Priority Levels

FEATURE 9: Decision Summarization
  ✅ Test 9.1: Detect Decision-Making Discussion
  ✅ Test 9.2: Decision with Multiple Options
  ✅ Test 9.3: View Decision History

FEATURE 10: Offline Functionality
  ✅ Test 10.1: Offline Mode Banner
  ✅ Test 10.2: Offline Message Queue
  ✅ Test 10.3: Read Messages While Offline

FEATURE 11: User Profile
  ✅ Test 11.1: View Profile
  ✅ Test 11.2: Sign Out

FEATURE 12: Push Notifications
  ✅ Test 12.1: Notification Permissions
  ✅ Test 12.2: Receive Message Notification
  ✅ Test 12.3: Notification in Active Conversation

FEATURE 13: UI/UX Elements
  ✅ Test 13.1: Dark Mode
  ✅ Test 13.2: Pull to Refresh
  ✅ Test 13.3: Keyboard Behavior
  ✅ Test 13.4: Orientation Changes

FEATURE 14: Error Handling & Edge Cases
  ✅ Test 14.1: No Internet on Launch
  ✅ Test 14.2: Firebase Connection Lost
  ✅ Test 14.3: Empty States
  ✅ Test 14.4: Long Names & Text Overflow

FEATURE 15: Performance & Stability
  ✅ Test 15.1: Large Conversation Load
  ✅ Test 15.2: Multiple Conversations
  ✅ Test 15.3: Background/Foreground Transitions
  ✅ Test 15.4: Memory Leaks

FEATURE 16: Security & Privacy
  ✅ Test 16.1: Session Persistence
  ✅ Test 16.2: Token Security
  ✅ Test 16.3: Unauthorized Access

═══════════════════════════════════════════════════════════════

TOTAL TESTS: 70
PASSED: ___
FAILED: ___
BLOCKED: ___

CRITICAL ISSUES FOUND:
[List any critical issues]

NOTES:
[Any additional observations]

═══════════════════════════════════════════════════════════════
```

---

## 🎯 Priority Tests (Quick Smoke Test)

If you have limited time, run these critical tests first:

1. **Authentication** (1.2 - Login)
2. **Messaging** (2.2 - Send Text Message)
3. **AI Chat** (4.1 - Basic Interaction)
4. **Calendar** (5.1 - First-Time Connection, 5.5 - Reset Connection)
5. **RSVP** (6.1 - Detect Invitation, 6.2 - Accept RSVP)

These cover the main user flows.

---

## 📝 Notes

- Some tests require real-time interaction between two devices/simulators
- Calendar tests require actual Google Calendar events
- Lambda tests require AWS access (optional for client-side testing)
- Performance tests best done on physical device
- Security tests may require code inspection

---

**Last Updated:** October 25, 2025  
**Total Test Cases:** 70  
**Estimated Testing Time:** 4-6 hours (full suite)  
**Quick Smoke Test Time:** 30-45 minutes
