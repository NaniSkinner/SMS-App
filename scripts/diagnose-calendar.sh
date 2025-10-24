#!/bin/bash

# Calendar OAuth Diagnostic Tool
# Run this to diagnose calendar connection issues
# This tool validates the LOCKED OAuth configuration

echo "🔍 MessageAI Calendar Diagnostic Tool"
echo "======================================"
echo ""
echo "📌 Expected Configuration: Native iOS OAuth"
echo "   iOS Client: 703601462595-qm6fnoqu40dqiqleejiiaean8v703639"
echo "   See OAuth/IMPORTANT.md for details"
echo ""

# Check if AWS CLI is configured
echo "1️⃣  Checking AWS CLI..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS CLI configured"
else
    echo "⚠️  AWS CLI not configured (skipping Lambda checks)"
    echo "   To check Lambda: configure AWS CLI or check AWS Console"
fi

echo ""

# Check Lambda OAuth credentials
echo "2️⃣  Checking Lambda OAuth credentials in AWS Secrets Manager..."
if aws sts get-caller-identity &> /dev/null; then
    CLIENT_ID=$(aws secretsmanager get-secret-value \
        --secret-id messageai/google-oauth-credentials \
        --query SecretString --output text 2>/dev/null | jq -r '.client_id' 2>/dev/null)

    if [ -n "$CLIENT_ID" ] && [ "$CLIENT_ID" != "null" ]; then
        echo "   Lambda Client ID: $CLIENT_ID"
        
        # Check if it matches the iOS client
        if [[ "$CLIENT_ID" == "703601462595-qm6fnoqu40dqiqleejiiaean8v703639"* ]]; then
            echo "   ✅ Matches iOS client - CORRECT!"
        else
            echo "   ❌ MISMATCH! Expected iOS client: 703601462595-qm6fnoqu40dqiqleejiiaean8v703639"
            echo "   🛠️  Fix: Update AWS Secrets Manager with iOS client credentials"
        fi
    else
        echo "   ❌ Could not retrieve OAuth credentials"
    fi
else
    echo "   ⏭️  Skipped (AWS CLI not configured)"
fi

echo ""

# Check app OAuth configuration
echo "3️⃣  Checking app OAuth configuration..."
OAUTH_CONFIG=$(grep -A 2 "GOOGLE_IOS_CLIENT_ID\|GOOGLE_WEB_CLIENT_ID" services/googleAuth.ts 2>/dev/null)

if echo "$OAUTH_CONFIG" | grep -q "GOOGLE_IOS_CLIENT_ID"; then
    echo "   ✅ App uses iOS client (iosClientId) - CORRECT!"
    
    APP_CLIENT=$(grep "GOOGLE_IOS_CLIENT_ID" services/googleAuth.ts | grep -oE '[0-9]+-[a-z0-9]+' | head -1)
    
    if [ "$APP_CLIENT" == "703601462595-qm6fnoqu40dqiqleejiiaean8v703639" ]; then
        echo "   ✅ App iOS client ID matches expected - CORRECT!"
    else
        echo "   ❌ WRONG CLIENT! App has: $APP_CLIENT"
        echo "   🛠️  Fix: Update GOOGLE_IOS_CLIENT_ID in services/googleAuth.ts"
    fi
    
    # Check for native OAuth (no redirectUri for iOS)
    if ! grep -q "redirectUri:" services/googleAuth.ts; then
        echo "   ✅ Using native iOS OAuth (no Expo proxy) - CORRECT!"
    else
        echo "   ⚠️  Warning: redirectUri found (should not be needed for iOS OAuth)"
    fi
    
elif echo "$OAUTH_CONFIG" | grep -q "GOOGLE_WEB_CLIENT_ID"; then
    echo "   ❌ WRONG! App uses Web client (clientId)"
    echo "   Expected: iOS client with iosClientId parameter"
    echo "   🛠️  Fix: App should use iOS client for bare workflow native OAuth"
else
    echo "   ❌ Could not detect OAuth configuration"
    echo "   🛠️  Fix: Check services/googleAuth.ts exists and is readable"
fi

echo ""

# Test Lambda health
echo "4️⃣  Testing Lambda health endpoint..."
HEALTH_RESPONSE=$(curl -s https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/health)

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Lambda is healthy"
else
    echo "❌ Lambda health check failed"
    echo "   Response: $HEALTH_RESPONSE"
fi

echo ""

# Check Info.plist
echo "5️⃣  Checking Info.plist URL scheme..."
if grep -q "703601462595-qm6fnoqu40dqiqleejiiaean8v703639" ios/messageapp/Info.plist 2>/dev/null; then
    echo "✅ Info.plist has correct URL scheme"
else
    echo "⚠️  Could not verify Info.plist URL scheme"
    echo "   Make sure it contains: com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639"
fi

echo ""
echo "======================================"
echo "📋 Diagnosis Summary"
echo "======================================"
echo ""

# Check for common issues
ISSUES_FOUND=0

# Check OAuth client match (only if we could retrieve it)
if aws sts get-caller-identity &> /dev/null && [ -n "$CLIENT_ID" ] && [ "$CLIENT_ID" != "null" ]; then
    if [[ "$CLIENT_ID" == "703601462595-qm6fnoqu40dqiqleejiiaean8v703639"* ]]; then
        echo "✅ OAuth clients match (app & Lambda use same iOS client)"
    else
        echo "❌ OAuth client mismatch - THIS IS THE PROBLEM!"
        echo "   App uses: 703601462595-qm6fnoqu40dqiqleejiiaean8v703639"
        echo "   Lambda uses: $CLIENT_ID"
        echo ""
        echo "   🛠️  FIX: Update AWS Secrets Manager with iOS client credentials"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
fi

# Check if app config is correct
if echo "$OAUTH_CONFIG" | grep -q "GOOGLE_WEB_CLIENT_ID"; then
    echo "❌ App uses Web client (should use iOS client)"
    echo "   🛠️  FIX: App should use iOS client for bare workflow native OAuth"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo ""
    echo "✅ OAuth configuration is CORRECT!"
    echo ""
    echo "If calendar still doesn't work, the issue is likely:"
    echo ""
    echo "1. 🔄 Stale tokens in Firestore"
    echo "   Fix: Users must disconnect and reconnect their calendar"
    echo ""
    echo "2. 🔑 Calendar API permissions not granted"
    echo "   Fix: Check Google Cloud Console → API & Services → Calendar API"
    echo ""
    echo "3. ⚙️  Token refresh failing in Lambda"
    echo "   Fix: Check Lambda logs in AWS CloudWatch"
    echo ""
    echo "4. 📱 App needs rebuild after OAuth config changes"
    echo "   Fix: npx expo run:ios"
    echo ""
    echo "📚 For detailed troubleshooting, see OAuth/IMPORTANT.md"
else
    echo ""
    echo "❌ Found $ISSUES_FOUND configuration issue(s)"
    echo ""
    echo "🚨 CRITICAL: OAuth configuration is broken!"
    echo ""
    echo "This will cause 'unauthorized_client' errors when AI tries to"
    echo "access the calendar. Users will see 'I don't have access to your"
    echo "calendar' even though they connected it successfully."
    echo ""
    echo "🛠️  Quick Fix:"
    echo "   1. bash scripts/fix-oauth-secrets.sh"
    echo "   2. npx expo run:ios (rebuild app)"
    echo "   3. Users reconnect calendar in app"
    echo ""
    echo "📚 See OAuth/IMPORTANT.md for detailed explanation"
fi

echo ""
echo "======================================"
echo ""
echo "💡 Pro Tip: Run 'bash scripts/validate-oauth-config.sh' for"
echo "   comprehensive validation before building or deploying"
echo ""

