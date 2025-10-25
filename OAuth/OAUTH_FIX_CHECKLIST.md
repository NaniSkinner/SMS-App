# Google Calendar OAuth Fix Checklist

## 🚨 Current Issue

Error: "Access blocked: Authorization Error - Error 400: invalid_request"

## ✅ Step-by-Step Fix

### 1. ✅ COMPLETED - Clean Info.plist

- Removed old web client URL scheme
- Now only has correct iOS client URL scheme

### 2. ⚠️ ACTION REQUIRED - Verify Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

#### Check iOS OAuth Client Configuration:

**Client ID should be:** `703601462595-qm6fnoqu40dqiqleejiiaean8v703639`

**Required Settings:**

- [ ] **Type:** iOS (NOT Web, NOT Android)
- [ ] **Bundle ID:** `com.messageapp.messaging` (MUST match EXACTLY)
- [ ] **App Store ID:** (Can be empty during development)

#### If Bundle ID is Wrong:

1. Click on the iOS client
2. Edit the Bundle ID to: `com.messageapp.messaging`
3. Save changes

#### If iOS Client Doesn't Exist:

You'll need to create it:

1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: **iOS**
3. Name: MessageApp iOS
4. Bundle ID: `com.messageapp.messaging`
5. Save and note the Client ID

### 3. ⚠️ Verify OAuth Consent Screen

Go to: https://console.cloud.google.com/apis/credentials/consent

**Required Settings:**

- [ ] **App name:** MessageApp (or your app name)
- [ ] **User support email:** Your email
- [ ] **Publishing status:** Testing or Published
- [ ] **Test users added:** (If in Testing mode, add both test users)
  - Add the emails of your two testers who need access

**Required Scopes:**

- [ ] `https://www.googleapis.com/auth/calendar.readonly`
- [ ] `https://www.googleapis.com/auth/calendar.events`
- [ ] `openid`
- [ ] `profile`
- [ ] `email`

### 4. ⚠️ Check Enabled APIs

Go to: https://console.cloud.google.com/apis/library

Verify these APIs are ENABLED:

- [ ] **Google Calendar API** - MUST be enabled
- [ ] **Google+ API** (if available)

### 5. 🔄 Rebuild and Test

After verifying Google Cloud Console:

```bash
# Clean iOS build
cd ios
rm -rf build
pod deintegrate
pod install
cd ..

# Rebuild app with fresh native code
npx expo run:ios --device
```

### 6. 🧪 Test Calendar Connection

1. Open app on both simulators
2. Go to AI Chat
3. Tap "Connect Calendar" button
4. Should see Google sign-in page
5. Sign in with test user
6. Grant permissions
7. Should redirect back to app ✅
8. Should see "Calendar Connected" message

### 7. 🎯 Common Issues & Solutions

#### Issue: "invalid_request" persists

**Solution:** Bundle ID mismatch in Google Cloud Console

- Verify Bundle ID is EXACTLY: `com.messageapp.messaging`
- No extra spaces, correct capitalization

#### Issue: "access_denied"

**Solution:** Test users not added to OAuth consent screen

- Add both test user emails to test users list

#### Issue: "unauthorized_client"

**Solution:** Wrong OAuth client type

- Must be iOS client, not Web or Android

#### Issue: Redirect doesn't work

**Solution:** URL scheme mismatch

- Info.plist has: `com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639`
- This is automatically correct after our fix

### 8. 📝 Verification Commands

Run diagnostic to verify configuration:

```bash
# Check app configuration
grep "GOOGLE_IOS_CLIENT_ID" services/googleAuth.ts

# Check Info.plist
grep -A 8 "CFBundleURLTypes" ios/messageapp/Info.plist

# Check Lambda matches (if deployed)
aws secretsmanager get-secret-value \
  --secret-id messageai/google-oauth-credentials \
  --region us-east-2 \
  --query SecretString --output text | jq -r '.client_id'
```

### 9. 🔐 After Successful Connection

Once calendar connects successfully:

1. Test AI calendar query: "What's on my calendar today?"
2. Test on both simulators/users
3. Verify tokens are stored in Firestore:
   - Firebase Console → Firestore → users → {userId} → tokens → google
4. Check for no errors in Lambda logs

---

## 📞 Need More Help?

If issues persist after completing all steps:

1. **Check exact error message** from Google OAuth screen
2. **Screenshot the error** for more specific diagnosis
3. **Check Lambda logs** in AWS CloudWatch for backend issues
4. **Verify Firestore rules** allow token storage

## ⚙️ Current Configuration Summary

| Component           | Configuration                                                            |
| ------------------- | ------------------------------------------------------------------------ |
| **OAuth Type**      | iOS Native (Bare Workflow)                                               |
| **Client ID**       | 703601462595-qm6fnoqu40dqiqleejiiaean8v703639                            |
| **Bundle ID**       | com.messageapp.messaging                                                 |
| **URL Scheme**      | com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639 |
| **Redirect**        | Native iOS (automatic via URL scheme)                                    |
| **Expo Auth Proxy** | NOT USED (bare workflow)                                                 |

---

**Last Updated:** October 25, 2025  
**Status:** Info.plist fixed, pending Google Cloud Console verification
