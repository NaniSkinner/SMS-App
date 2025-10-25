#!/bin/bash

# Rebuild and Test OAuth Fix Script
# This script completely rebuilds the app with the OAuth fix applied

echo "🔧 Rebuilding MessageApp with OAuth Fix"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

echo -e "${BLUE}📍 Working directory: $(pwd)${NC}"
echo ""

# Step 1: Kill existing simulators
echo -e "${YELLOW}Step 1: Killing existing simulators...${NC}"
killall Simulator 2>/dev/null || true
echo "✅ Simulators killed"
echo ""

# Step 2: Clean iOS build
echo -e "${YELLOW}Step 2: Cleaning iOS build...${NC}"
cd ios || exit 1

echo "  - Removing build directory..."
rm -rf build

echo "  - Removing DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/messageapp-*

echo "  - Deintegrating CocoaPods..."
pod deintegrate

echo "  - Installing CocoaPods..."
pod install

cd ..
echo "✅ iOS build cleaned"
echo ""

# Step 3: Verify OAuth configuration
echo -e "${YELLOW}Step 3: Verifying OAuth configuration...${NC}"

if grep -q "redirectUri: GOOGLE_REDIRECT_URI" services/googleAuth.ts; then
  echo "✅ OAuth fix applied: explicit redirectUri present"
else
  echo "❌ ERROR: OAuth fix missing - redirectUri not found"
  exit 1
fi

if grep -q "usePKCE: true" services/googleAuth.ts; then
  echo "✅ OAuth fix applied: PKCE explicitly enabled"
else
  echo "❌ ERROR: OAuth fix missing - usePKCE not found"
  exit 1
fi

echo ""

# Step 4: Build and run
echo -e "${YELLOW}Step 4: Building and launching app...${NC}"
echo "This may take several minutes..."
echo ""

npx expo run:ios --no-build-cache

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Build Complete!${NC}"
echo "========================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Once the app launches, check the console for:"
echo "   ${BLUE}🔍 OAuth Request Configuration:${NC}"
echo "      - Client ID"
echo "      - Redirect URI (should be explicit)"
echo "      - PKCE codeVerifier: Present"
echo ""
echo "2. Test calendar connection:"
echo "   - Go to AI Chat or Profile"
echo "   - Tap 'Connect Calendar'"
echo "   - Should see Google sign-in (NO ERROR 400) ✅"
echo "   - Sign in and grant permissions"
echo "   - Should redirect back to app ✅"
echo ""
echo "3. Test AI calendar access:"
echo "   - Ask AI: 'What's on my schedule today?'"
echo "   - Should get calendar response ✅"
echo ""
echo "📄 For troubleshooting, see: OAuth/CRITICAL_FIX_APPLIED.md"
echo ""

