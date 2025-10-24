#!/bin/bash

# Script to delete calendar tokens from Firestore
# This clears old tokens so users can reconnect with the new OAuth client

echo "🗑️  Delete Calendar Tokens from Firestore"
echo "=========================================="
echo ""
echo "This script helps you delete old OAuth tokens from Firestore."
echo "This is necessary when switching OAuth clients."
echo ""

# Prompt for user ID
echo "📋 You need the Firebase User ID (UID) of the user"
echo "   You can find this in:"
echo "   - Firebase Console → Authentication → Users"
echo "   - Or check the app logs when the user logs in"
echo ""
read -p "Enter Firebase User ID (UID): " USER_ID

if [ -z "$USER_ID" ]; then
    echo ""
    echo "❌ No User ID provided. Cannot delete tokens."
    exit 1
fi

echo ""
echo "🔥 Deleting tokens for user: $USER_ID"
echo ""

# Show the Firebase Console URL for manual deletion
FIREBASE_PROJECT="messageai-be478"  # Update if different
CONSOLE_URL="https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore/data/~2Fusers~2F${USER_ID}~2Ftokens~2Fgoogle"

echo "📝 Manual Deletion (Recommended):"
echo ""
echo "1. Open Firebase Console:"
echo "   $CONSOLE_URL"
echo ""
echo "2. You should see the 'google' document under tokens"
echo ""
echo "3. Click the three dots (⋮) on the right"
echo ""
echo "4. Click 'Delete document'"
echo ""
echo "5. Confirm deletion"
echo ""
echo "✅ Done! Tokens are deleted."
echo ""
echo "📱 Next Steps:"
echo "   1. Update Lambda: bash scripts/fix-oauth-secrets.sh"
echo "   2. Rebuild app: npx expo run:ios"
echo "   3. Open app and connect calendar again"
echo ""

