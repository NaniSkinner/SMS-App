# Lambda Deployment Guide

## 🚀 Quick Deploy

To deploy updates to the Lambda function:

```bash
cd /Users/nanis/dev/Gauntlet/messageapp/lambda
npm run deploy
```

This will:

1. Build TypeScript → JavaScript
2. Create production package (no dev dependencies)
3. Upload 32MB package to S3
4. Update Lambda function from S3

## 📋 What Gets Deployed

- **Code:** `dist/` (compiled TypeScript)
- **Dependencies:** `node_modules/` (production only)
- **Package:** `package.json`
- **Size:** ~33.7MB

## 🔧 Manual Steps (if needed)

### 1. Build Only

```bash
npm run build
```

### 2. Package Only

```bash
npm run package:lite
```

### 3. Deploy Manually

```bash
# Upload to S3
aws s3 cp function.zip s3://messageai-lambda-deployments/function.zip --region us-east-2

# Update Lambda
aws lambda update-function-code \
  --function-name messageai-service \
  --s3-bucket messageai-lambda-deployments \
  --s3-key function.zip \
  --region us-east-2
```

## 🧪 Test After Deployment

```bash
# Test health endpoint
curl https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/health

# Test chat endpoint
curl -X POST https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"Hello!"}'

# Test event extraction
curl -X POST https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging/ai/extract-event \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","messageText":"Meeting tomorrow at 3pm"}'
```

## 📝 Check Logs

```bash
# View recent logs
aws logs tail /aws/lambda/messageai-service --region us-east-2 --since 5m

# Follow logs (live)
aws logs tail /aws/lambda/messageai-service --region us-east-2 --follow
```

## 🔐 Update Secrets

If you need to update OpenAI key, Firebase credentials, or Google OAuth:

https://console.aws.amazon.com/secretsmanager/home?region=us-east-2

After updating secrets, force Lambda to refresh cache:

```bash
aws lambda update-function-configuration \
  --function-name messageai-service \
  --description "Force cache refresh" \
  --region us-east-2
```

## 📊 Resources

- **Lambda Function:** https://console.aws.amazon.com/lambda/home?region=us-east-2#/functions/messageai-service
- **API Gateway:** https://console.aws.amazon.com/apigateway/main/apis/ouydtx31yk/resources?api=ouydtx31yk&region=us-east-2
- **S3 Bucket:** https://s3.console.aws.amazon.com/s3/buckets/messageai-lambda-deployments?region=us-east-2
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fmessageai-service
- **Secrets Manager:** https://console.aws.amazon.com/secretsmanager/home?region=us-east-2

## ⚠️ Troubleshooting

### Deployment fails

- Check S3 bucket exists: `messageai-lambda-deployments`
- Verify IAM permissions include S3FullAccess

### API returns errors after deployment

- Wait 5-10 seconds for Lambda to finish updating
- Check CloudWatch logs for specific errors
- Verify secrets are correctly stored

### "Cannot find module" errors

- Ensure you ran `npm install --production` before packaging
- Check that `node_modules/` is included in the zip file

## 🎯 Current Status

✅ **Epic 0.1:** AWS Lambda Setup - COMPLETE  
✅ **Epic 0.2:** OpenAI Integration - COMPLETE  
🚧 **Epic 0.3:** Google Calendar Integration - NEXT

**Deployed Version:** 1.1.0  
**Last Deployed:** October 23, 2025
