#!/bin/bash

# Quick OAuth Configuration Check
# Verifies Google Calendar OAuth setup is correct

echo "🔍 Checking Google Calendar OAuth Configuration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

EXPECTED_CLIENT_PREFIX="703601462595-qm6fnoqu40dqiqleejiiaean8v703639"

# 1. Check googleAuth.ts
echo "1️⃣ Checking services/googleAuth.ts..."
if grep -q "$EXPECTED_CLIENT_PREFIX" services/googleAuth.ts; then
  echo -e "${GREEN}✅ App uses correct iOS client${NC}"
else
  echo -e "${RED}❌ App does NOT use correct iOS client${NC}"
  echo "   Expected: $EXPECTED_CLIENT_PREFIX"
  exit 1
fi

# 2. Check Info.plist for correct URL scheme
echo ""
echo "2️⃣ Checking ios/messageapp/Info.plist..."
if grep -q "com.googleusercontent.apps.$EXPECTED_CLIENT_PREFIX" ios/messageapp/Info.plist; then
  echo -e "${GREEN}✅ Info.plist has correct URL scheme${NC}"
else
  echo -e "${RED}❌ Info.plist missing correct URL scheme${NC}"
  exit 1
fi

# 3. Check for old web client in Info.plist
if grep -q "703601462595-fl7kgnllp0m4lkmf0m516hvfop21tnf1" ios/messageapp/Info.plist; then
  echo -e "${RED}❌ Info.plist still has OLD web client URL scheme (should be removed)${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Old web client URL scheme removed${NC}"
fi

# 4. Check Bundle ID in project.pbxproj
echo ""
echo "3️⃣ Checking Bundle ID in Xcode project..."
if grep -q "com.messageapp.messaging" ios/messageapp.xcodeproj/project.pbxproj; then
  echo -e "${GREEN}✅ Bundle ID is correct in Xcode project${NC}"
else
  echo -e "${YELLOW}⚠️  Could not verify Bundle ID in Xcode project${NC}"
fi

# 5. Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 App Configuration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Client ID Prefix: $EXPECTED_CLIENT_PREFIX"
echo "Bundle ID: com.messageapp.messaging"
echo "OAuth Type: iOS Native (Bare Workflow)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo ""
echo "1. Verify Google Cloud Console configuration:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "   Required settings:"
echo "   - Type: iOS (NOT Web)"
echo "   - Client ID: ${EXPECTED_CLIENT_PREFIX}.apps.googleusercontent.com"
echo "   - Bundle ID: com.messageapp.messaging"
echo ""
echo "2. Verify OAuth Consent Screen:"
echo "   - Add both test users to Test Users list"
echo "   - Verify required scopes are added"
echo ""
echo "3. Rebuild and test:"
echo "   cd ios && rm -rf build && pod deintegrate && pod install && cd .."
echo "   npx expo run:ios"
echo ""
echo "📄 See OAuth/OAUTH_FIX_CHECKLIST.md for detailed steps"
echo ""

