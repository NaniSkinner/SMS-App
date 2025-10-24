#!/bin/bash

# OAuth Configuration Validator
# Validates that all OAuth configurations match the locked configuration
# Run this before building or deploying

set -e  # Exit on error

LOCK_FILE="OAuth/config.lock"
ERRORS=0

echo "🔒 OAuth Configuration Validator"
echo "================================="
echo ""

# Check if lock file exists
if [ ! -f "$LOCK_FILE" ]; then
    echo "❌ ERROR: .oauth-config.lock file not found"
    echo "   This file is required to validate OAuth configuration"
    exit 1
fi

# Read expected values from lock file
EXPECTED_IOS_CLIENT_ID=$(grep "^IOS_CLIENT_ID=" "$LOCK_FILE" | cut -d'=' -f2)
EXPECTED_BUNDLE_ID=$(grep "^BUNDLE_ID=" "$LOCK_FILE" | cut -d'=' -f2)

echo "📋 Expected Configuration:"
echo "   OAuth Client Type: iOS (Native)"
echo "   iOS Client ID: $EXPECTED_IOS_CLIENT_ID"
echo "   Bundle ID: $EXPECTED_BUNDLE_ID"
echo ""
echo "🔍 Validating..."
echo ""

# Validate 1: Check services/googleAuth.ts uses iosClientId
echo "1️⃣  Checking services/googleAuth.ts..."
if grep -q "GOOGLE_IOS_CLIENT_ID" services/googleAuth.ts && \
   grep -q "$EXPECTED_IOS_CLIENT_ID" services/googleAuth.ts && \
   grep -q "iosClientId: GOOGLE_IOS_CLIENT_ID" services/googleAuth.ts; then
    echo "   ✅ App uses iOS client with native OAuth"
else
    echo "   ❌ VALIDATION FAILED: App OAuth configuration incorrect"
    echo "      Expected: iosClientId with $EXPECTED_IOS_CLIENT_ID"
    ERRORS=$((ERRORS + 1))
    
    # Check if it's using Web client instead
    if grep -q "GOOGLE_WEB_CLIENT_ID" services/googleAuth.ts || \
       grep -q "clientId:" services/googleAuth.ts; then
        echo "      ⚠️  Detected: App is using Web client (wrong!)"
        echo "      Fix: Run 'git checkout services/googleAuth.ts' to restore correct config"
    fi
fi

# Validate 2: Check Info.plist has correct URL scheme
echo "2️⃣  Checking ios/messageapp/Info.plist..."
if grep -q "$EXPECTED_IOS_CLIENT_ID" ios/messageapp/Info.plist; then
    echo "   ✅ Info.plist has correct URL scheme"
else
    echo "   ❌ VALIDATION FAILED: Info.plist missing iOS client URL scheme"
    echo "      Expected: com.googleusercontent.apps.$EXPECTED_IOS_CLIENT_ID"
    ERRORS=$((ERRORS + 1))
fi

# Validate 3: Check AWS Secrets Manager (if AWS CLI available)
echo "3️⃣  Checking Lambda OAuth credentials..."
if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
    LAMBDA_CLIENT_ID=$(aws secretsmanager get-secret-value \
        --secret-id messageai/google-oauth-credentials \
        --query SecretString --output text 2>/dev/null | jq -r '.client_id' 2>/dev/null)
    
    if [ -n "$LAMBDA_CLIENT_ID" ] && [ "$LAMBDA_CLIENT_ID" != "null" ]; then
        if [[ "$LAMBDA_CLIENT_ID" == "$EXPECTED_IOS_CLIENT_ID"* ]]; then
            echo "   ✅ Lambda uses correct iOS client"
        else
            echo "   ❌ VALIDATION FAILED: Lambda OAuth client mismatch"
            echo "      Expected: $EXPECTED_IOS_CLIENT_ID..."
            echo "      Got: $LAMBDA_CLIENT_ID"
            echo "      Fix: Run 'bash scripts/fix-oauth-secrets.sh'"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "   ⚠️  Could not retrieve Lambda OAuth credentials"
        echo "      (This might be okay if AWS credentials not configured locally)"
    fi
else
    echo "   ⏭️  Skipping (AWS CLI not configured)"
fi

# Validate 4: Check for forbidden patterns
echo "4️⃣  Checking for forbidden patterns..."
FORBIDDEN_FOUND=0

# Check for webClientId usage (breaks native OAuth)
if grep -q "webClientId:" services/googleAuth.ts; then
    echo "   ❌ FORBIDDEN: webClientId parameter found in googleAuth.ts"
    echo "      This breaks native iOS OAuth for bare workflow apps"
    ERRORS=$((ERRORS + 1))
    FORBIDDEN_FOUND=1
fi

# Check for Expo auth proxy usage (in actual code, not comments)
if grep -E "redirectUri.*auth\.expo\.io" services/googleAuth.ts; then
    echo "   ❌ FORBIDDEN: Expo auth proxy found in googleAuth.ts"
    echo "      Bare workflow apps use native OAuth, not Expo proxy"
    ERRORS=$((ERRORS + 1))
    FORBIDDEN_FOUND=1
fi

# Check for Web client ID
if grep -q "GOOGLE_WEB_CLIENT_ID" services/googleAuth.ts; then
    echo "   ⚠️  WARNING: Web client ID constant found"
    echo "      Make sure it's not being used in useGoogleCalendarAuth()"
fi

if [ $FORBIDDEN_FOUND -eq 0 ]; then
    echo "   ✅ No forbidden patterns detected"
fi

echo ""
echo "================================="
echo "📊 Validation Results"
echo "================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ All validations passed!"
    echo ""
    echo "OAuth configuration is correct and consistent."
    echo "App and Lambda use the same iOS OAuth client."
    echo ""
    exit 0
else
    echo "❌ Validation failed with $ERRORS error(s)"
    echo ""
    echo "🛠️  How to Fix:"
    echo "1. Read OAuth/IMPORTANT.md for the correct OAuth configuration"
    echo "2. Run 'bash scripts/diagnose-calendar.sh' for detailed diagnosis"
    echo "3. Run 'bash scripts/fix-oauth-secrets.sh' to fix Lambda credentials"
    echo "4. Restore app config: 'git checkout services/googleAuth.ts'"
    echo ""
    echo "⚠️  DO NOT BUILD OR DEPLOY until all validations pass!"
    echo ""
    exit 1
fi

