# MessageAI - User Guide

## Welcome to MessageAI! 🤖📅

MessageAI is your intelligent scheduling assistant that lives right in your messaging app. It helps busy parents manage calendars, detect conflicts, and never miss important events—all through simple conversations.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [AI Chat Assistant](#ai-chat-assistant)
3. [Message Analysis & Conflict Detection](#message-analysis--conflict-detection)
4. [Managing Your Calendar](#managing-your-calendar)
5. [Troubleshooting](#troubleshooting)
6. [Privacy & Security](#privacy--security)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First-Time Setup

1. **Connect Your Calendar**

   - Open the Profile tab
   - Tap "Connect Google Calendar"
   - Sign in with your Google account
   - Grant calendar permissions
   - Your calendar is now connected! ✅

2. **Try Your First AI Chat**
   - Tap the "AI Chat" tab at the bottom
   - Type: "What's on my calendar today?"
   - The AI will show your schedule
   - That's it! You're ready to go.

### Requirements

- iOS 14.0 or later
- Internet connection
- Google Calendar account

---

## AI Chat Assistant

The AI Chat tab is your personal scheduling assistant. Talk to it naturally—no commands to memorize!

### What You Can Ask

#### Check Your Schedule

```
"What's on my calendar tomorrow?"
"Do I have any meetings on Friday?"
"What's my schedule for next week?"
"Am I free Saturday afternoon?"
```

#### Create Events

```
"Book Saturday 3PM for family time"
"Add doctor appointment Thursday at 10am"
"Schedule soccer practice Monday 5PM"
"Create event: Birthday party Sunday 2PM at the park"
```

#### Find Available Time

```
"When am I free this week?"
"Find me a 1-hour slot on Tuesday"
"What time works for coffee tomorrow?"
"Show me my available times this weekend"
```

#### Get Help

```
"Help"
"What can you do?"
"How do I create an event?"
```

### How It Works

1. **Type Your Request**

   - Use natural language
   - No special syntax needed
   - The AI understands context

2. **AI Checks Your Calendar**

   - Automatically queries Google Calendar
   - Detects conflicts
   - Finds available times

3. **Get Clear Responses**

   - Simple, friendly answers
   - List of events or times
   - Conflict warnings when needed

4. **Confirm Actions**
   - AI always asks before creating events
   - You stay in control
   - No surprises

### Example Conversation

**You:** "What's on my calendar tomorrow?"

**AI:** "Tomorrow (Saturday, October 26) you have:

- 9:00 AM - Soccer practice (1 hour)
- 2:00 PM - Eva's birthday party (3 hours)

You're free in the afternoon before 2 PM and after 5 PM."

**You:** "Book 11 AM for grocery shopping"

**AI:** "I can create 'Grocery shopping' tomorrow at 11:00 AM. This doesn't conflict with your existing events. Should I add it?"

**You:** "Yes"

**AI:** "✓ Event created! 'Grocery shopping' is now on your calendar for tomorrow at 11:00 AM."

---

## Message Analysis & Conflict Detection

MessageAI can analyze messages in your conversations to find scheduling information and check for conflicts.

### How to Analyze a Message

1. **Long-Press Any Message**

   - In any conversation, long-press a message
   - Action sheet appears

2. **Select "Analyze with AI 🤖"**

   - AI reads the message
   - Extracts event details
   - Checks your calendar for conflicts

3. **View Results**
   - Event details displayed
   - Conflicts shown (if any)
   - Alternative times suggested

### What It Looks Like

#### No Conflict ✅

```
Message: "Birthday party Sunday 2PM at the park"

AI Found Event:
📅 Title: Birthday party
📆 Date: Sunday, October 27, 2025
⏰ Time: 2:00 PM
📍 Location: at the park

✅ No conflicts! Your calendar is free.

[Add to Calendar] [Dismiss]
```

#### Conflict Detected ⚠️

```
Message: "Soccer practice moved to Saturday 3PM"

AI Found Event:
📅 Title: Soccer practice
📆 Date: Saturday, October 26, 2025
⏰ Time: 3:00 PM

⚠️ CONFLICT DETECTED

Overlaps with:
• Eva's birthday party
  2:00 PM - 5:00 PM (Saturday)
  Overlap: 2 hours

Alternative Times Available:
• Saturday, 11:00 AM - 12:00 PM
• Saturday, 6:00 PM - 7:00 PM
• Sunday, 9:00 AM - 10:00 AM

[View Calendar] [Book Anyway] [Dismiss]
```

### Understanding Conflicts

**Conflict Severity:**

- 🔴 **High** - Overlap > 1 hour
- 🟠 **Medium** - Overlap 30-60 minutes
- 🟡 **Low** - Overlap < 30 minutes

**Your Options:**

- **View Calendar** - Opens your calendar app
- **Book Anyway** - Creates event despite conflict
- **Dismiss** - Closes the modal, no action

---

## Managing Your Calendar

### Checking Connection Status

**Profile Tab → Calendar Section:**

- ✅ **Connected** - Calendar is working
- ⚠️ **Disconnected** - Tap to reconnect
- 🔄 **Connecting** - Please wait

### Reconnecting Your Calendar

If your calendar disconnects:

1. Open Profile tab
2. Tap "Connect Google Calendar"
3. Sign in again
4. Grant permissions
5. Done!

### Disconnecting Your Calendar

To remove calendar access:

1. Open Profile tab
2. Tap "Disconnect Calendar"
3. Confirm
4. Calendar data is removed from the app

**Note:** AI scheduling features won't work without a connected calendar.

---

## Troubleshooting

### "No internet connection"

**Problem:** Device is offline

**Solution:**

- Check WiFi or cellular connection
- Toggle Airplane mode off
- Retry your request

---

### "Calendar access denied"

**Problem:** Calendar permissions revoked

**Solution:**

1. Open iPhone Settings
2. Search for your app name
3. Ensure Calendar permission is enabled
4. Return to app and try again

**Or:**

- Disconnect and reconnect calendar in Profile tab

---

### "Request timed out"

**Problem:** AI service took too long

**Solution:**

- Wait a moment
- Try a simpler question
- Check internet speed

---

### "Too many requests"

**Problem:** Rate limit exceeded

**Solution:**

- Wait 1-2 minutes
- Avoid rapid-fire requests
- Try again

---

### "AI service temporarily unavailable"

**Problem:** Backend service down

**Solution:**

- Wait 5-10 minutes
- Check status later
- Service usually auto-recovers

---

### Event extraction is wrong

**Problem:** AI misunderstood the message

**Solution:**

- AI isn't perfect with complex/vague messages
- Try rephrasing more clearly
- Include specific date/time
- Example: Instead of "next Friday" → "Friday, October 25 at 3PM"

---

### Ambiguous dates

**Problem:** "Next Friday" could mean multiple dates

**Solution:**

- AI will ask for clarification
- Choose the specific date you meant
- Be more explicit in future messages

---

### No events detected

**Problem:** Message analyzed but no events found

**Solution:**

- Message might not contain scheduling info
- Try messages with clear dates/times
- Example: "Meeting tomorrow at 2PM" (clear)
- Not: "We should catch up soon" (vague)

---

## Privacy & Security

### What Data We Collect

**Calendar Data:**

- Event titles, dates, times
- Used only for conflict detection
- Never shared with third parties (except OpenAI for processing)

**Messages:**

- Only messages you explicitly analyze
- Not stored permanently
- Used to extract event information

**Conversation History:**

- Last 50 AI chat messages
- Stored in your Firebase account
- You can delete anytime

### What We Don't Collect

- ❌ Your contacts
- ❌ Location data
- ❌ Device information beyond basic app usage
- ❌ Messages you don't analyze

### How We Protect Your Data

**Encryption:**

- Calendar tokens encrypted at rest
- HTTPS/TLS for all API calls
- Secure token storage in Firebase

**Access Control:**

- Only you can access your data
- No cross-user data exposure
- Calendar tokens never logged

**Third-Party Services:**

- **Google Calendar API** - Calendar operations only
- **OpenAI API** - Text processing only (not used for AI training)
- **AWS Lambda** - Backend processing only

### Your Rights

**You Can:**

- View all your data anytime
- Delete your data anytime
- Disconnect calendar anytime
- Revoke permissions anytime

**To Delete Your Data:**

1. Profile → Disconnect Calendar
2. Profile → Delete Account (if available)
3. Or contact support

---

## Tips & Best Practices

### Getting Better Results

**Be Specific:**

- ✅ "Book Saturday October 26 at 3PM for soccer"
- ❌ "Add soccer sometime this weekend"

**Include Duration:**

- ✅ "Schedule 2-hour meeting Tuesday at 10AM"
- ❌ "Meeting Tuesday morning"

**Use Clear Dates:**

- ✅ "Friday, October 25"
- ❌ "Next Friday" (ambiguous)

### Maximizing Efficiency

**Use Context:**

- AI remembers recent conversation
- Follow-up questions work great
- Example: "What about next week?" (after asking about this week)

**Check Availability First:**

- Ask "When am I free?" before booking
- Avoid conflicts proactively

**Analyze Important Messages:**

- Long-press messages about appointments
- Catch conflicts before they happen

### Common Mistakes to Avoid

❌ **Don't:**

- Send very long messages (>500 words)
- Rapid-fire requests (wait for responses)
- Expect AI to read your mind
- Use highly ambiguous language

✅ **Do:**

- Keep requests focused
- Wait for AI responses
- Be explicit about dates/times
- Rephrase if AI doesn't understand

---

## Feedback & Support

### Rate the AI

After the AI helps you, you can provide feedback:

- 👍 Thumbs up - AI was helpful
- 👎 Thumbs down - AI made a mistake

Your feedback helps us improve!

### Get Help

**In-App:**

- AI Chat tab → Type "Help"

**Contact Support:**

- Profile → Help & Support
- Email: support@messageai.app

**Report Bugs:**

- Profile → Report a Bug
- Include screenshots if possible

---

## What's Next?

### Coming Soon

- 🔮 Predictive scheduling suggestions
- 👥 Family calendar sharing
- 📧 Email event extraction
- 🗓️ Recurring event support
- 🌤️ Weather-based suggestions

### Stay Updated

- Check the app for update notifications
- Read release notes for new features
- Follow our blog at blog.messageai.app

---

## Quick Reference Card

| Task               | Command Example                     |
| ------------------ | ----------------------------------- |
| Check schedule     | "What's on my calendar tomorrow?"   |
| Create event       | "Book Saturday 3PM for family time" |
| Find free time     | "When am I free this week?"         |
| Analyze message    | Long-press → "Analyze with AI 🤖"   |
| Reconnect calendar | Profile → "Connect Google Calendar" |
| Get help           | Type "Help" in AI Chat              |

---

**Version:** 1.0  
**Last Updated:** October 24, 2025  
**Platform:** iOS 14.0+

---

**Need More Help?**  
Visit our support site: https://help.messageai.app  
Or email: support@messageai.app
