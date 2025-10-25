# 🚨 Google Cloud Console Fix for Error 400: invalid_request

## The Problem

You're getting: **"Access blocked: Authorization Error - Error 400: invalid_request"**

This error means: **Google Cloud Console OAuth client is misconfigured or doesn't exist.**

---

## 🎯 EXACT STEPS TO FIX

### Step 1: Go to Google Cloud Console Credentials

Open: **https://console.cloud.google.com/apis/credentials**

**Select your project** (the one for MessageApp)

---

### Step 2: Find or Create iOS OAuth Client

Look for an OAuth 2.0 Client with:

- **Name:** Something like "MessageApp iOS" or "iOS client"
- **Type:** iOS
- **Client ID ends with:** `qm6fnoqu40dqiqleejiiaean8v703639.apps.googleusercontent.com`

#### ✅ If iOS Client EXISTS:

Click on it and verify:

```
Application type: iOS
Bundle ID: com.messageapp.messaging     ← MUST MATCH EXACTLY
```

**If Bundle ID is wrong or empty:**

1. Edit it
2. Change to: `com.messageapp.messaging`
3. Click **Save**
4. **CRITICAL:** Wait 5-10 minutes for Google to propagate the change

#### ❌ If iOS Client DOESN'T EXIST or Has Wrong Bundle ID:

**You need to CREATE a new iOS OAuth client:**

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth 2.0 Client ID"**
3. **Application type:** Select **"iOS"**
4. **Name:** `MessageApp iOS` (or whatever you want)
5. **Bundle ID:** `com.messageapp.messaging` ← **EXACT MATCH REQUIRED**
6. **App Store ID:** Leave empty (optional for development)
7. Click **"CREATE"**
8. **SAVE THE CLIENT ID** - you'll need it

---

### Step 3: Update Your App with New Client ID (If You Created New One)

**ONLY if you created a NEW iOS client in Step 2**, you need to update your app:

#### 3a. Copy the new Client ID

It should look like: `XXXXXXXXX-YYYYYYYY.apps.googleusercontent.com`

The prefix before the dash should be a number like `703601462595-qm6fnoqu40dqiqleejiiaean8v703639`

#### 3b. Update `services/googleAuth.ts`

```typescript
const GOOGLE_IOS_CLIENT_ID =
  "YOUR-NEW-CLIENT-ID-HERE.apps.googleusercontent.com";
```

#### 3c. Update `ios/messageapp/Info.plist`

Find the URL scheme section and update to:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>messageapp</string>
      <string>com.messageapp.messaging</string>
      <string>com.googleusercontent.apps.YOUR-CLIENT-ID-PREFIX</string>
    </array>
  </dict>
</array>
```

Where `YOUR-CLIENT-ID-PREFIX` is the part BEFORE `.apps.googleusercontent.com`

Example: If Client ID is `703601462595-abc123.apps.googleusercontent.com`
Then URL scheme is: `com.googleusercontent.apps.703601462595-abc123`

#### 3d. Update Lambda (If applicable)

Update AWS Secrets Manager:

```bash
aws secretsmanager put-secret-value \
  --secret-id messageai/google-oauth-credentials \
  --secret-string '{
    "client_id": "YOUR-NEW-CLIENT-ID.apps.googleusercontent.com",
    "client_secret": "YOUR_IOS_CLIENT_SECRET",
    "redirect_uris": ["com.googleusercontent.apps.YOUR-CLIENT-ID-PREFIX:/oauth2redirect/google"]
  }' \
  --region us-east-2
```

---

### Step 4: Verify OAuth Consent Screen

Go to: **https://console.cloud.google.com/apis/credentials/consent**

#### 4a. Check Publishing Status

**If status is "Testing":**

- You MUST add test users
- Click **"ADD USERS"**
- Add the email addresses of both test users
- Click **Save**

**If status is "In Production" or "Published":**

- Anyone with a Google account can sign in
- No test users needed

#### 4b. Verify Scopes

Click **"EDIT APP"** → Go to **"Scopes"** section

Required scopes:

```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
openid
profile
email
```

Click **"ADD OR REMOVE SCOPES"** and add any missing ones.

---

### Step 5: Enable Google Calendar API

Go to: **https://console.cloud.google.com/apis/library**

Search for: **"Google Calendar API"**

Click on it → Click **"ENABLE"** (if not already enabled)

---

### Step 6: Rebuild and Test

```bash
# Kill any running simulators
killall Simulator

# Clean iOS build completely
cd /Users/nanis/dev/Gauntlet/messageapp
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/messageapp-*
pod deintegrate
pod install
cd ..

# Rebuild app
npx expo run:ios --no-build-cache
```

**Wait for build to complete, then test:**

1. Open app
2. Go to AI Chat or Profile
3. Tap **"Connect Calendar"**
4. Should see Google sign-in page ✅
5. Sign in with one of your test users
6. Grant permissions
7. Should redirect back to app successfully!

---

## 🔍 How to Verify You Fixed It

### Quick Check: What Bundle ID Does Google Have?

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your iOS OAuth client
3. Look at **"Bundle ID"** field
4. It should say: `com.messageapp.messaging`
5. If it's different or empty → **THAT'S YOUR PROBLEM**

### Quick Check: Is It Actually an iOS Client?

1. Same page as above
2. Look at **"Application type"**
3. It should say: **"iOS"**
4. If it says "Web application" → **THAT'S YOUR PROBLEM** (create iOS client instead)

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Wrong Client Type

**Problem:** Using Web OAuth client instead of iOS
**Fix:** Create NEW iOS OAuth client (Step 2 above)

### ❌ Mistake 2: Bundle ID Mismatch

**Problem:** Google Cloud Console has different Bundle ID than app
**Fix:** Edit iOS client → Change Bundle ID to `com.messageapp.messaging`

### ❌ Mistake 3: Test Users Not Added

**Problem:** OAuth consent screen is in "Testing" mode but test users not added
**Fix:** Add both test user emails to test users list

### ❌ Mistake 4: Calendar API Not Enabled

**Problem:** Calendar API is disabled for the project
**Fix:** Enable Google Calendar API (Step 5 above)

### ❌ Mistake 5: Not Waiting for Changes to Propagate

**Problem:** Made changes in Google Cloud Console but tested immediately
**Fix:** Wait 5-10 minutes after saving changes before testing

---

## 📸 What Success Looks Like

### In Google Cloud Console:

**OAuth Client:**

```
Name: MessageApp iOS
Type: iOS
Client ID: [some-id].apps.googleusercontent.com
Bundle ID: com.messageapp.messaging ✅
```

**OAuth Consent Screen:**

```
Publishing status: Testing
Test users:
  - user1@gmail.com ✅
  - user2@gmail.com ✅
Scopes: calendar.readonly, calendar.events, openid, profile, email ✅
```

**APIs:**

```
Google Calendar API: ENABLED ✅
```

### In Your App:

1. Tap "Connect Calendar"
2. Browser opens with Google sign-in
3. Sign in with test user
4. See permission request for calendar access
5. Click "Allow"
6. **Redirects back to app automatically** ✅
7. See "Calendar Connected" message ✅
8. Ask AI: "What's on my calendar?" → Gets response ✅

---

## 🆘 Still Not Working?

### Get the Exact Error Details

When you see the error screen, look for:

1. **Error code:** "Error 400: invalid_request"
2. **Error details:** Any additional text below the error
3. **Screenshot it** and we can diagnose further

### Check Different Things Based on Error:

**"Error 400: invalid_request"** → Bundle ID mismatch or wrong client type

**"Error 403: access_denied"** → Test users not added to consent screen

**"Error 401: unauthorized_client"** → Client ID doesn't exist or is disabled

**"redirect_uri_mismatch"** → URL scheme in Info.plist doesn't match

---

## 📝 Your Current Configuration

**What your app expects:**

- Bundle ID: `com.messageapp.messaging`
- OAuth Type: iOS Native
- Client ID: `703601462595-qm6fnoqu40dqiqleejiiaean8v703639.apps.googleusercontent.com`
- URL Scheme: `com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639`

**What Google Cloud Console MUST have:**

- iOS OAuth client with Bundle ID: `com.messageapp.messaging`
- OAuth consent screen with test users added (if in Testing mode)
- Google Calendar API enabled

**If these don't match → Error 400**

---

## 🎯 Most Likely Fix (90% of cases)

Based on your error, the most likely issue is:

**Your Google Cloud Console iOS client has the WRONG Bundle ID or doesn't exist.**

**To fix:**

1. Go to https://console.cloud.google.com/apis/credentials
2. Find iOS OAuth client
3. Click to edit
4. Set Bundle ID to: `com.messageapp.messaging`
5. Save
6. Wait 5 minutes
7. Rebuild app
8. Test again

---

**Last Updated:** October 25, 2025  
**Status:** Diagnostic guide for Error 400 fix
