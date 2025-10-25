# Phase 2 Manual Testing Guide

## Epic 2.5: Testing & Validation

**Test Date:** October 24, 2025  
**Tester:** Development Team  
**Device:** iPhone 17 Pro Simulator (iOS)  
**App Version:** Phase 2 (Conflict Detection)

---

## Pre-Testing Setup ✅

### Prerequisites

- [x] iPhone 17 Pro simulator booted
- [x] App running via `expo run:ios`
- [x] Google Calendar connected with test account
- [ ] Test calendar has at least 2-3 events for today/tomorrow
- [ ] Network connection active

### Test Calendar Events Needed

Create these test events in your Google Calendar before testing:

1. **"Soccer Practice"** - Today at 3:00 PM (1 hour)
2. **"Dentist Appointment"** - Tomorrow at 2:00 PM (1 hour)
3. **"Birthday Party"** - This Saturday at 4:00 PM (2 hours)

---

## Test Suite 1: Complete Conflict Detection Flow ⏳

### Test Case 1.1: Detect Obvious Conflict

**Objective:** Verify AI detects conflict when message time overlaps with existing event

**Steps:**

1. Open app and navigate to any chat conversation
2. Send yourself a test message: `"Soccer practice moved to 3:30 PM today"`
3. Long-press on the message
4. Select **"Analyze with AI"** from action sheet
5. Wait for analysis (should take <2 seconds)

**Expected Results:**

- ✅ Loading indicator appears briefly
- ✅ AI badge (⚠️) appears on message
- ✅ Badge color indicates conflict (orange/red)
- ✅ Tap badge → Conflict modal opens
- ✅ Modal shows:
  - Proposed event: "Soccer practice moved" at 3:30 PM
  - Conflicting event: "Soccer Practice" at 3:00 PM
  - Overlap duration displayed (e.g., "30 minutes overlap")
  - Alternative times suggested (2-3 options)

**Performance:**

- [ ] Analysis completes in <2 seconds
- [ ] Modal opens smoothly (no lag)
- [ ] Times displayed in user's timezone

**Actions to Test:**

- [ ] Tap "View Calendar" → Opens native calendar app
- [ ] Tap "Book Anyway" → Creates event despite conflict
- [ ] Tap "Dismiss" → Closes modal, no action taken

---

### Test Case 1.2: Multiple Conflicts

**Objective:** Verify system handles multiple conflicting events

**Steps:**

1. Create test events in calendar:
   - Event A: 2:00 PM - 3:00 PM
   - Event B: 2:30 PM - 3:30 PM
2. Send message: `"Meeting tomorrow at 2:45 PM"`
3. Long-press → "Analyze with AI"

**Expected Results:**

- ✅ AI detects conflict with BOTH events
- ✅ Modal shows all conflicting events
- ✅ Shows total overlap time
- ✅ Alternative times avoid both conflicts

---

## Test Suite 2: No-Conflict Flow (Clean Event Extraction) ⏳

### Test Case 2.1: Extract Event with No Conflicts

**Objective:** Verify clean event extraction when calendar is free

**Steps:**

1. Find a free time slot in your calendar (e.g., 10:00 AM tomorrow)
2. Send message: `"Coffee meeting tomorrow at 10 AM"`
3. Long-press → "Analyze with AI"
4. Wait for analysis

**Expected Results:**

- ✅ AI badge (📅) appears (NOT conflict warning)
- ✅ Badge is green/blue (no conflict color)
- ✅ Tap badge → Event extraction modal opens
- ✅ Modal shows:
  - Event title: "Coffee meeting"
  - Date: Tomorrow's date
  - Time: 10:00 AM
  - Duration: 60 minutes (default)
  - "No conflicts found" message
- ✅ "Add to Calendar" button prominently displayed

**Actions to Test:**

- [ ] Tap "Add to Calendar" → Creates event successfully
- [ ] Success toast appears: "✓ Event added"
- [ ] Event actually appears in Google Calendar
- [ ] No confirmation dialog (since no conflict)

---

### Test Case 2.2: Extract with Alternative Times Shown

**Objective:** Verify alternative suggestions even without conflicts

**Steps:**

1. Send message: `"Need to schedule a 2-hour meeting this week"`
2. Analyze with AI

**Expected Results:**

- ✅ AI extracts: "meeting", duration 120 min
- ✅ Shows "when would you like to schedule?"
- ✅ Suggests 3-5 available time slots
- ✅ Each suggestion is actually free (verified against calendar)

---

## Test Suite 3: Error Scenarios & Edge Cases ⏳

### Test Case 3.1: Network Failure

**Objective:** Verify graceful handling when network is unavailable

**Steps:**

1. Turn off WiFi on Mac (affects simulator)
2. Try to analyze a message
3. Wait for timeout

**Expected Results:**

- ✅ Error toast appears: "Network error. Please check your connection."
- ✅ Message does not get AI badge
- ✅ Can retry after network restored
- ✅ No crash or frozen UI

---

### Test Case 3.2: Calendar Not Connected

**Objective:** Verify handling when user hasn't connected calendar

**Steps:**

1. Disconnect calendar (from AI Chat → "Disconnect Calendar")
2. Navigate to a chat
3. Try to analyze a message

**Expected Results:**

- ✅ Error message: "Calendar not connected"
- ✅ Button to connect calendar
- ✅ Analysis does not proceed
- ✅ Clear explanation to user

---

### Test Case 3.3: Ambiguous Message

**Objective:** Verify handling of vague scheduling information

**Steps:**

1. Send vague message: `"Maybe we can meet sometime next week?"`
2. Analyze with AI

**Expected Results:**

- ✅ AI recognizes low confidence
- ✅ Either: No event extracted (toast: "No clear scheduling info")
- ✅ Or: Asks clarifying questions in modal
- ✅ Does not create half-baked event

---

### Test Case 3.4: Past Date

**Objective:** Verify handling of past dates

**Steps:**

1. Send message: `"Soccer practice was yesterday at 3PM"`
2. Analyze with AI

**Expected Results:**

- ✅ AI detects past tense or past date
- ✅ Low confidence or no extraction
- ✅ Toast: "This event appears to be in the past"

---

### Test Case 3.5: Very Long Message

**Objective:** Verify handling of messages >5000 characters

**Steps:**

1. Send very long message with scheduling info buried in text
2. Analyze with AI

**Expected Results:**

- ✅ Message truncated if >5000 chars
- ✅ Warning shown if truncated
- ✅ Still extracts event if in first 5000 chars

---

### Test Case 3.6: Multiple Events in One Message

**Objective:** Verify handling of multiple scheduling references

**Steps:**

1. Send: `"Soccer at 3PM tomorrow and dentist at 2PM Monday"`
2. Analyze with AI

**Expected Results:**

- ✅ AI extracts first/primary event
- ✅ Or: Shows "Multiple events found" with options
- ✅ Does not combine incorrectly

---

## Test Suite 4: Performance Testing ⏳

### Test Case 4.1: Latency Measurement

**Objective:** Verify <2 second latency requirement

**Procedure:**

1. Prepare 10 test messages with scheduling info
2. For each message:
   - Start timer
   - Long-press → "Analyze with AI"
   - Stop timer when badge appears
3. Record all times

**Success Criteria:**

- ✅ p50 (median) < 1.5 seconds
- ✅ p95 < 2 seconds
- ✅ p99 < 3 seconds
- ✅ No requests timeout (>30 seconds)

**Results:**

- Test 1: **\_** seconds
- Test 2: **\_** seconds
- Test 3: **\_** seconds
- Test 4: **\_** seconds
- Test 5: **\_** seconds
- Test 6: **\_** seconds
- Test 7: **\_** seconds
- Test 8: **\_** seconds
- Test 9: **\_** seconds
- Test 10: **\_** seconds

**Median (p50):** **\_** seconds  
**95th percentile (p95):** **\_** seconds  
**Result:** PASS / FAIL

---

### Test Case 4.2: Rapid Sequential Requests

**Objective:** Verify system handles multiple quick analyses

**Steps:**

1. Send 5 messages quickly (all with scheduling info)
2. Analyze all 5 in quick succession (tap analyze on each)
3. Observe behavior

**Expected Results:**

- ✅ All requests complete successfully
- ✅ No requests dropped or fail
- ✅ Queue system works (or concurrent handling)
- ✅ UI remains responsive
- ✅ Badges appear on correct messages

---

## Test Suite 5: UI/UX Quality Checks ⏳

### Test Case 5.1: Visual Polish

**Objective:** Verify UI looks professional and polished

**Checklist:**

- [ ] AI badge positioned correctly (not obscuring text)
- [ ] Badge size appropriate (not too big/small)
- [ ] Modal animations smooth (fade in/out)
- [ ] Colors follow app theme (light/dark mode)
- [ ] Fonts consistent with app style
- [ ] Loading indicators visually clear
- [ ] Touch targets large enough (>44pt)

---

### Test Case 5.2: Accessibility

**Objective:** Verify accessible to all users

**Checklist:**

- [ ] VoiceOver reads AI badges correctly
- [ ] VoiceOver reads modal content in order
- [ ] Long-press gesture has haptic feedback
- [ ] Text contrast meets WCAG standards
- [ ] Dynamic type supported (text scales)
- [ ] Color-blind friendly (not relying only on color)

---

### Test Case 5.3: Dark Mode

**Objective:** Verify works in both light and dark modes

**Steps:**

1. Toggle device to dark mode (Settings → Display)
2. Test conflict detection flow
3. Test no-conflict flow

**Expected Results:**

- ✅ Badge colors adapt to dark mode
- ✅ Modal background dark (not blinding white)
- ✅ Text readable in dark mode
- ✅ All colors appropriate for dark theme

---

## Test Suite 6: Integration Testing ⏳

### Test Case 6.1: End-to-End Event Creation

**Objective:** Verify complete flow from message to calendar

**Steps:**

1. Check Google Calendar (note current event count)
2. Send message: `"Team meeting Friday 2PM"`
3. Analyze with AI
4. Add to calendar from modal
5. Open Google Calendar and verify

**Expected Results:**

- ✅ Event appears in Google Calendar within 5 seconds
- ✅ Event details correct:
  - Title: "Team meeting"
  - Date: This Friday
  - Time: 2:00 PM in correct timezone
  - Duration: 60 minutes
- ✅ Event syncs to other devices

---

### Test Case 6.2: Conflict Resolution Flow

**Objective:** Verify alternative time booking works

**Steps:**

1. Analyze message with conflict
2. View alternative times
3. Select one alternative
4. Book the alternative time

**Expected Results:**

- ✅ Alternative time is actually free (verified)
- ✅ Creates event at selected alternative time
- ✅ Original conflicting time NOT booked

---

## Test Suite 7: Real-World Scenarios ⏳

### Test Case 7.1: Parent Scheduling Scenario

**Scenario:** Parent receives message about rescheduled activity

**Message:** `"Hi! Soccer practice is moved to Saturday 3PM this week. Can your son make it?"`

**Test Steps:**

1. Analyze message
2. Check for conflicts
3. Handle accordingly

**Expected Behavior:**

- Extracts: Saturday, 3PM, "Soccer practice"
- Checks calendar for conflicts
- If conflict: Shows alternatives
- Parent can make informed decision

---

### Test Case 7.2: Doctor Appointment Reminder

**Scenario:** Automated reminder from doctor's office

**Message:** `"Reminder: Your appointment with Dr. Smith is tomorrow at 2:15 PM. Reply CONFIRM or CANCEL."`

**Test Steps:**

1. Analyze message
2. Verify extraction

**Expected Behavior:**

- Extracts: Tomorrow, 2:15 PM, "appointment with Dr. Smith"
- Duration: 60 minutes (default for appointments)
- Checks for conflicts
- Offers to add to calendar

---

### Test Case 7.3: Birthday Party Invitation

**Scenario:** Group chat birthday party coordination

**Message:** `"🎉 You're all invited to Emma's 5th birthday party! Sunday, October 27th at 2 PM at our house. Bring the kids!"`

**Test Steps:**

1. Analyze message
2. Verify extraction with emojis/casual text

**Expected Behavior:**

- Extracts despite emojis and casual language
- Title: "Emma's 5th birthday party"
- Date: October 27th
- Time: 2 PM
- Duration: 2-3 hours (typical for party)

---

## Bugs Found During Testing 🐛

| #   | Severity | Description | Steps to Reproduce | Status |
| --- | -------- | ----------- | ------------------ | ------ |
| 1   |          |             |                    |        |
| 2   |          |             |                    |        |
| 3   |          |             |                    |        |

---

## UI Improvements Needed 💡

| #   | Priority | Improvement | Rationale | Status |
| --- | -------- | ----------- | --------- | ------ |
| 1   |          |             |           |        |
| 2   |          |             |           |        |
| 3   |          |             |           |        |

---

## Performance Results 📊

### Latency Results

- **Conflict Detection:** avg **\_** sec (target: <2s)
- **Event Extraction:** avg **\_** sec (target: <2s)
- **Calendar API Call:** avg **\_** sec (target: <0.5s)
- **OpenAI API Call:** avg **\_** sec (target: <2s)

### Success Rates

- **Event Extraction Accuracy:** \_\_\_% (target: ≥90%)
- **Conflict Detection Accuracy:** \_\_\_% (target: 100%)
- **False Positives:** \_\_\_ (target: <5%)
- **False Negatives:** \_\_\_ (target: <1%)

---

## Test Summary 📋

### Overall Results

- **Total Test Cases:** 25
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Blocked:** \_\_\_
- **Skipped:** \_\_\_

### Critical Issues Found

1.
2.
3.

### Ready for Production?

- [ ] YES - All critical tests pass
- [ ] NO - Issues must be fixed first

### Next Steps

1.
2.
3.

---

## Tester Notes

**What worked well:**

**What needs improvement:**

**Suggested enhancements:**

**Overall impression:**

---

**Test Completed:** \***\*\_\_\_\*\***  
**Tester Signature:** \***\*\_\_\_\*\***  
**Status:** ✅ Phase 2 Complete / 🚧 Fixes Needed / ❌ Major Issues
