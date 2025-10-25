# ⚡ Quick Test Checklist

**Print this or keep it handy for quick testing**

---

## 🚀 Essential Tests (30 min)

### ✅ Authentication

- [ ] Register new user → Should succeed
- [ ] Login with credentials → Should succeed
- [ ] Sign out → Should return to login

### ✅ Messaging

- [ ] Start conversation with user → Opens chat
- [ ] Send text message → Appears for both users
- [ ] Messages sync in real-time → < 2 sec delay
- [ ] Typing indicator works → Shows when typing

### ✅ AI Chat

- [ ] Ask AI a question → Gets response in 5-10 sec
- [ ] AI remembers context → References previous messages

### ✅ Calendar (CRITICAL - NEW FIX)

- [ ] Connect calendar → OAuth succeeds, tokens stored
- [ ] Ask AI about schedule → Returns actual events
- [ ] **Tap "Reset Connection"** → Clears tokens + reconnects ⭐
- [ ] Disconnect calendar → Clears connection

### ✅ RSVP Tracking

- [ ] Send invitation message → RSVP card appears
- [ ] Tap "Yes" button → Response saved
- [ ] Check other user → See updated response
- [ ] Change response → Updates correctly

---

## 🔥 Critical Paths to Test

### Path 1: New User Onboarding

```
Register → Login → Start Chat → Send Message → Connect Calendar
Expected: 3 minutes, no errors
```

### Path 2: Calendar Integration (THE FIX)

```
Connect Calendar → Ask AI about schedule → Works ✅
OR
Reset Connection → OAuth → Works ✅ (fixes Error 400)
```

### Path 3: Real-Time Collaboration

```
User 1 sends invite → User 2 gets RSVP card → User 2 responds → User 1 sees update
Expected: < 5 seconds end-to-end
```

---

## 🐛 Known Issues to Verify Fixed

- [x] **Error 400 on calendar connection** → Fixed with Reset Connection button
- [ ] Stale tokens blocking calendar access → Fixed with improved disconnectCalendar()
- [ ] No way to fix connection without deleting user → Fixed with Reset button

---

## 📱 Quick Device Setup

### Simulator 1 (User 1)

```bash
npx expo run:ios
Login as: test1@example.com
```

### Simulator 2 (User 2)

```bash
npx expo run:ios
Login as: test2@example.com
```

---

## ✅ Pass Criteria

**PASS if:**

- ✅ Messages sync between users in < 2 seconds
- ✅ AI responds within 10 seconds
- ✅ Calendar connection works OR Reset Connection fixes it
- ✅ RSVP tracking updates in real-time
- ✅ No crashes or freezes
- ✅ Offline banner appears when network drops

**FAIL if:**

- ❌ Error 400 persists even after Reset Connection
- ❌ Messages don't sync
- ❌ App crashes frequently
- ❌ Calendar always says "can't access"
- ❌ RSVP responses don't save

---

## 🔍 Console Checks

### Good Console Output:

```
✅ OAuth success! Processing authentication...
✅ Tokens stored successfully
✅ AI chat response received
✅ Message sent successfully
```

### Bad Console Output:

```
❌ OAuth error: invalid_request
❌ Failed to send message
❌ Firebase connection failed
❌ Token expired and refresh failed
```

---

## 📊 Test Result Quick Note

```
Date: _______________
Build: ______________

Core Features:
[ ] Auth works
[ ] Messaging works
[ ] AI works
[ ] Calendar works (or Reset Connection fixes it)
[ ] RSVP works

Status: ✅ PASS  /  ❌ FAIL

Notes:
____________________________________
____________________________________
____________________________________
```

---

**For detailed test steps, see:** `COMPREHENSIVE_TEST_GUIDE.md`
