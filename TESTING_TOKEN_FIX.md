# Testing Guide: Token Refresh Fix

## Quick Summary

**Issue Fixed:** AI assistant losing calendar access after several minutes  
**Root Cause:** Persistent Lambda client caching with expired tokens  
**Solution:** Always validate tokens, save refresh tokens, auto-cleanup invalid tokens

---

## Pre-Deployment: Local Testing

### 1. Build Lambda Function

```bash
cd lambda
npm install  # If dependencies changed
npm run build
```

✅ Should compile without errors

### 2. Run Tests (if available)

```bash
npm test
```

---

## Deployment

### Deploy to AWS Lambda

```bash
cd lambda
npm run deploy
```

✅ Wait for deployment to complete
✅ Note the Lambda function version/timestamp

---

## Post-Deployment: Manual Testing

### Test 1: Normal Calendar Access

**Steps:**

1. Open app → Go to AI Chat
2. If not connected, tap "Connect Google Calendar"
3. Sign in with Google
4. Ask AI: "What's on my calendar today?"

**Expected:** ✅ Calendar events displayed without error

**Check CloudWatch Logs for:**

```
🔐 Getting OAuth client for user: [userId]
📋 Token info for user [userId]:
   Has access token: true
   Has refresh token: true
```

---

### Test 2: Automatic Token Refresh

**Option A: Wait for Natural Expiry (1 hour)**

1. Connect calendar
2. Wait 61 minutes
3. Ask AI: "What's on my calendar tomorrow?"

**Option B: Force Expiry (Faster)**

1. Connect calendar
2. Go to Firebase Console → Firestore
3. Navigate to: `users/{userId}/tokens/google`
4. Change `expiresAt` to past date (e.g., 1 hour ago)
5. Go back to app
6. Ask AI: "What's on my calendar tomorrow?"

**Expected:** ✅ Calendar events displayed (token auto-refreshed)

**Check CloudWatch Logs for:**

```
🔄 Access token expired, refreshing...
   Expired at: [past timestamp]
   Current time: [now]
✅ Token refreshed successfully
   New expiry: [future timestamp]
   Refresh token updated: true
```

---

### Test 3: Invalid Token Cleanup

**Steps:**

1. Connect calendar
2. Go to Firebase Console → Firestore
3. Navigate to: `users/{userId}/tokens/google`
4. Change `refreshToken` to invalid value (e.g., "invalid_token_12345")
5. Go back to app
6. Ask AI: "What's on my calendar tomorrow?"

**Expected:**

- ❌ Error message: "Your calendar connection has expired. Please reconnect your Google Calendar."
- ✅ Token document deleted from Firestore automatically

**Check CloudWatch Logs for:**

```
❌ Token refresh failed: [error]
   Error details: { message: "invalid_grant", ... }
🗑️ Detected invalid/revoked token - clearing from Firestore
✅ Stale tokens cleared successfully
```

**Verify in Firestore:**

- Token document should be deleted
- Can verify: `users/{userId}/tokens/google` should not exist

---

### Test 4: Reconnection After Invalid Token

**Steps:**

1. After Test 3 (invalid token cleared)
2. In app, tap "Reset Connection" or "Connect Calendar"
3. Sign in with Google again
4. Ask AI: "What's on my calendar today?"

**Expected:** ✅ Calendar events displayed

---

### Test 5: Long Session (Stress Test)

**Steps:**

1. Connect calendar
2. Keep AI chat open
3. Make calendar requests every 5-10 minutes for 2 hours
   - "What's on my calendar today?"
   - "Create event: Team meeting tomorrow at 2pm"
   - "Do I have any conflicts at 3pm?"

**Expected:**

- ✅ All requests work seamlessly
- ✅ At least one auto-refresh happens (around 60-minute mark)
- ✅ No errors or disconnections

**Check CloudWatch for:**

- Token refresh logs around 60-minute mark
- No error patterns
- Consistent successful API calls

---

## Monitoring After Deployment

### CloudWatch Logs to Monitor

**Log Group:** `/aws/lambda/[your-function-name]`

**Search Patterns:**

1. **Successful Token Refresh:**

   ```
   filterPattern: "Token refreshed successfully"
   ```

2. **Invalid Token Detection:**

   ```
   filterPattern: "invalid/revoked token"
   ```

3. **Calendar API Errors:**
   ```
   filterPattern: "❌" OR "ERROR"
   ```

### Key Metrics to Track

| Metric                    | What to Watch                     | Action Threshold             |
| ------------------------- | --------------------------------- | ---------------------------- |
| Token refresh rate        | Should be ~1/hour per active user | > 10/hour = investigate      |
| Invalid token errors      | Should be rare                    | > 5/day = check OAuth config |
| Calendar API success rate | Should be > 99%                   | < 95% = investigate          |
| Average response time     | Should be 50-100ms                | > 200ms = performance issue  |

---

## Common Issues & Troubleshooting

### Issue: "Calendar not connected" despite connecting

**Diagnosis:**

```bash
# Check Firestore for token data
# Firebase Console → Firestore → users/{userId}/tokens/google
```

**Check for:**

- `accessToken` field exists and not empty
- `refreshToken` field exists and not empty
- `expiresAt` is a valid timestamp

**Fix:**

- If missing: User needs to reconnect
- If corrupted: Delete token document, reconnect

---

### Issue: "Token refresh failed" repeatedly

**Diagnosis:**
Check CloudWatch logs for specific error:

1. **"invalid_grant"** = Refresh token revoked/expired

   - Fix: User needs to reconnect (automatic cleanup should trigger)

2. **"unauthorized_client"** = OAuth client mismatch

   - Fix: Check AWS Secrets Manager has correct iOS client credentials
   - Verify client ID: 703601462595-qm6fnoqu40dqiqleejiiaean8v703639

3. **Network errors** = Temporary issue
   - Fix: Should auto-retry, no action needed

---

### Issue: High latency after fix

**Expected:** ~50ms per request (vs ~5ms with cache)

**If > 200ms:**

1. Check CloudWatch for slow token fetches
2. Check Firestore read latency
3. Consider implementing smart caching (Phase 2)

---

## Success Criteria

✅ **All tests pass**
✅ **Token auto-refresh works seamlessly**
✅ **Invalid tokens cleaned up automatically**
✅ **No manual Firebase account deletion needed**
✅ **CloudWatch shows expected log patterns**
✅ **Users report improved reliability**

---

## Rollback Procedure

If issues arise:

1. **Immediately:**

   ```bash
   cd lambda
   git log --oneline  # Find previous commit
   git checkout [previous-commit-hash]
   npm run build
   npm run deploy
   ```

2. **Document issue:**

   - Screenshot CloudWatch errors
   - Note which test failed
   - Document user impact

3. **Investigate offline:**
   - Review logs
   - Test fix locally
   - Prepare improved fix

---

## Next Steps After Successful Deployment

1. **Monitor for 24 hours**

   - Check CloudWatch hourly
   - Look for unexpected patterns
   - Verify no user complaints

2. **Gather user feedback**

   - Ask beta users about reliability
   - Track support tickets
   - Monitor app reviews

3. **Consider Phase 2 enhancements**
   - Proactive token refresh
   - App-side error handling
   - Smart client caching

---

**Last Updated:** October 25, 2025  
**Version:** Phase 1 - Core Fixes  
**Status:** Ready for Testing
