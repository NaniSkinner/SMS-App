# OAuth Configuration Scripts

This directory contains scripts to manage and validate the OAuth configuration for Google Calendar integration.

## 🔒 The Configuration is LOCKED

This app uses **Native iOS OAuth** with a single iOS OAuth client shared between the app and Lambda. This configuration is locked to prevent breaking changes.

## 📜 Available Scripts

### `validate-oauth-config.sh`

**Purpose:** Validates that all OAuth configurations match the locked configuration.

**When to run:**

- Before building the app
- Before deploying Lambda
- After making any OAuth-related changes
- As part of CI/CD pipeline

**Usage:**

```bash
bash scripts/validate-oauth-config.sh
```

**What it checks:**

- ✅ App uses iOS client with `iosClientId`
- ✅ Info.plist has correct URL scheme
- ✅ Lambda AWS Secrets has iOS client
- ✅ No forbidden patterns (webClientId, Expo proxy)

**Exit codes:**

- `0` - All validations passed
- `1` - Validation failed (do not build/deploy)

---

### `diagnose-calendar.sh`

**Purpose:** Diagnose calendar connection issues by checking OAuth configuration.

**When to run:**

- Calendar connection works but AI can't access calendar
- "unauthorized_client" errors in Lambda logs
- After OAuth configuration changes
- When troubleshooting user-reported issues

**Usage:**

```bash
bash scripts/diagnose-calendar.sh
```

**What it checks:**

- AWS CLI configuration
- Lambda OAuth credentials in AWS Secrets Manager
- App OAuth configuration in `services/googleAuth.ts`
- Lambda health endpoint
- Info.plist URL scheme

**Output:** Detailed diagnostic report with fix instructions

---

### `fix-oauth-secrets.sh`

**Purpose:** Update AWS Secrets Manager with correct iOS OAuth client credentials.

**When to run:**

- After diagnostic script detects OAuth client mismatch
- When switching from Web to iOS OAuth client
- When setting up Lambda for the first time

**Usage:**

```bash
bash scripts/fix-oauth-secrets.sh
```

**Requirements:**

- AWS CLI configured with appropriate permissions
- iOS OAuth Client Secret from Google Cloud Console
  - Go to: https://console.cloud.google.com/apis/credentials
  - Find: MessageApp iOS (703601462595-qm6fnoqu40dqiqleejiiaean8v703639)
  - Copy the Client Secret

**What it does:**

1. Prompts for iOS Client Secret
2. Updates AWS Secrets Manager with iOS client credentials
3. Provides next steps for completing the fix

**After running:**

1. Rebuild the iOS app: `npx expo run:ios`
2. Users must disconnect and reconnect their Google Calendar
3. Run diagnostic: `bash scripts/diagnose-calendar.sh`

---

### `diagnose-calendar.sh` (Legacy)

The older diagnostic script. Use `diagnose-calendar.sh` instead.

---

## 🚨 Common Issues & Fixes

### Issue: "I don't have access to your calendar"

**Symptoms:**

- Calendar connects successfully in app
- AI says "I don't have access to your calendar"
- Lambda logs show `unauthorized_client` error

**Cause:** OAuth client mismatch between app and Lambda

**Fix:**

```bash
# 1. Diagnose
bash scripts/diagnose-calendar.sh

# 2. Fix Lambda credentials
bash scripts/fix-oauth-secrets.sh

# 3. Rebuild app
npx expo run:ios

# 4. Users reconnect calendar
```

---

### Issue: Validation fails before build

**Symptoms:**

- `validate-oauth-config.sh` exits with error
- App or Lambda configuration doesn't match locked config

**Fix:**

```bash
# Check what's wrong
bash scripts/validate-oauth-config.sh

# For app config issues
git checkout services/googleAuth.ts

# For Lambda config issues
bash scripts/fix-oauth-secrets.sh

# Verify fix
bash scripts/validate-oauth-config.sh
```

---

## 🔐 The Locked Configuration

**OAuth Client Type:** iOS Application (Native OAuth)

**iOS Client ID:** `703601462595-qm6fnoqu40dqiqleejiiaean8v703639.apps.googleusercontent.com`

**Bundle ID:** `com.messageapp.messaging`

**Used By:**

- iOS App (`services/googleAuth.ts`)
- Lambda (`AWS Secrets Manager`)

**Why iOS Client:**

- Simpler configuration
- Native iOS redirects (faster, no proxy)
- No external dependencies
- Works perfectly for bare workflow apps

**Why NOT Web Client:**

- Requires Expo auth proxy (doesn't work for bare workflow)
- More complex configuration
- Slower OAuth flow
- Caused repeated breakage in the past

---

## 📋 Workflow: Making OAuth Changes

**⚠️ Only proceed with explicit team approval**

1. **Read documentation:**

   ```bash
   cat IMPORTANT.md
   ```

2. **Understand current state:**

   ```bash
   bash scripts/diagnose-calendar.sh
   ```

3. **Make changes** (if absolutely necessary)

4. **Validate changes:**

   ```bash
   bash scripts/validate-oauth-config.sh
   ```

5. **Update Lambda:**

   ```bash
   bash scripts/fix-oauth-secrets.sh
   ```

6. **Test thoroughly:**

   - Connect calendar in app
   - Ask AI about calendar
   - Check Lambda logs for errors
   - Verify token refresh works

7. **Document changes:**
   - Update IMPORTANT.md
   - Update `.oauth-config.lock`
   - Update this README if needed

---

## 🧪 CI/CD Integration

Add this to your build pipeline:

```bash
# Validate OAuth configuration before building
bash scripts/validate-oauth-config.sh

# If validation fails, stop the build
if [ $? -ne 0 ]; then
    echo "❌ OAuth configuration validation failed!"
    echo "   Run 'bash scripts/diagnose-calendar.sh' for details"
    exit 1
fi

# Continue with build
npx expo run:ios
```

---

## 📚 Additional Resources

- **Full OAuth documentation:** `IMPORTANT.md`
- **Configuration lock file:** `.oauth-config.lock`
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **AWS Secrets Manager:** `messageai/google-oauth-credentials`

---

## 🆘 Need Help?

1. **Read IMPORTANT.md first** - It has the complete OAuth architecture
2. **Run diagnostic script** - It will tell you what's wrong
3. **Check Lambda logs** - AWS CloudWatch for detailed errors
4. **Don't guess** - Use the fix scripts provided

**Remember:** This configuration was locked down after multiple incidents of breakage. If it's not broken, don't fix it! 🙏
