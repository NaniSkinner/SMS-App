#!/bin/bash

# Script to update AWS Secrets Manager with iOS OAuth client credentials
# This ensures Lambda and the iOS app use the SAME OAuth client

set -e  # Exit on error

echo "🔧 OAuth Configuration Fix Script"
echo "=================================="
echo ""
echo "This script will update AWS Secrets Manager to use the iOS OAuth client."
echo "This fixes the 'unauthorized_client' error by ensuring app and Lambda"
echo "use the SAME OAuth client for token refresh."
echo ""

# iOS OAuth Client (from Google Cloud Console)
IOS_CLIENT_ID="703601462595-qm6fnoqu40dqiqleejiiaean8v703639.apps.googleusercontent.com"

# Prompt for client secret
echo "⚠️  You need the iOS OAuth Client Secret from Google Cloud Console"
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   Find: MessageApp iOS (703601462595-qm6fnoqu40dqiqleejiiaean8v703639)"
echo "   Copy the Client Secret"
echo ""
read -p "Enter iOS Client Secret (or press Enter to skip): " IOS_CLIENT_SECRET

if [ -z "$IOS_CLIENT_SECRET" ]; then
    echo ""
    echo "❌ No client secret provided. Cannot update AWS Secrets Manager."
    echo ""
    echo "To fix this manually:"
    echo "1. Get iOS client secret from Google Cloud Console"
    echo "2. Run this script again with the secret"
    echo ""
    echo "Or update AWS Secrets Manager manually:"
    echo "  aws secretsmanager put-secret-value \\"
    echo "    --secret-id messageai/google-oauth-credentials \\"
    echo "    --secret-string '{\"client_id\":\"$IOS_CLIENT_ID\",\"client_secret\":\"YOUR_SECRET\",\"redirect_uris\":[\"com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639:/oauth2redirect/google\"]}'"
    exit 1
fi

echo ""
echo "📝 Updating AWS Secrets Manager..."

# Create the secret JSON
SECRET_JSON=$(cat <<EOF
{
  "client_id": "$IOS_CLIENT_ID",
  "client_secret": "$IOS_CLIENT_SECRET",
  "redirect_uris": [
    "com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639:/oauth2redirect/google"
  ]
}
EOF
)

# Update the secret
aws secretsmanager put-secret-value \
  --secret-id messageai/google-oauth-credentials \
  --secret-string "$SECRET_JSON" \
  --region us-east-2

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ AWS Secrets Manager updated successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Rebuild the iOS app: npx expo run:ios"
    echo "2. Users must disconnect and reconnect their Google Calendar"
    echo "3. Run diagnostic: bash scripts/diagnose-calendar.sh"
    echo ""
    echo "✅ Configuration should now be consistent!"
else
    echo ""
    echo "❌ Failed to update AWS Secrets Manager"
    echo "   Check your AWS credentials and permissions"
    exit 1
fi

