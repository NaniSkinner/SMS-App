# AWS Setup Guide for MessageAI Lambda

Step-by-step instructions to set up AWS Lambda and API Gateway.

## Phase 0.1.1: IAM Setup (15 minutes)

### Task 0.1.1.1: Create AWS Account

✅ **You already have this!** Skip to next step.

### Task 0.1.1.2: Create IAM User for Development

1. **Log in to AWS Console:** https://console.aws.amazon.com/
2. **Navigate to IAM:**

   - Search for "IAM" in the top search bar
   - Click "IAM" (Identity and Access Management)

3. **Create Developer User:**

   - Click "Users" in left sidebar
   - Click "Create user" button
   - User name: `messageai-developer`
   - Click "Next"

4. **Set Permissions:**

   - Select "Attach policies directly"
   - Search and check these policies:
     - ✅ `AWSLambdaFullAccess`
     - ✅ `AmazonAPIGatewayAdministrator`
     - ✅ `CloudWatchFullAccess`
   - Click "Next"
   - Click "Create user"

5. **Create Access Keys:**
   - Click on the newly created user `messageai-developer`
   - Go to "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check "I understand" checkbox
   - Click "Next"
   - Description: "MessageAI Lambda deployment"
   - Click "Create access key"
6. **💾 IMPORTANT - Save These Credentials:**
   - Access key ID: `AKIA...`
   - Secret access key: `wJalrXUt...`
   - ⚠️ **Copy these NOW** - Secret key only shown once!
   - Click "Download .csv file" as backup

### Task 0.1.1.3: Configure AWS CLI

Open Terminal and run:

```bash
# Check if AWS CLI is installed
aws --version

# If not installed, install it:
brew install awscli

# Configure AWS CLI with your credentials
aws configure

# When prompted, enter:
# AWS Access Key ID: [paste your key from step 6]
# AWS Secret Access Key: [paste your secret from step 6]
# Default region name: us-east-1
# Default output format: json

# Test connection
aws sts get-caller-identity
```

**Expected output:**

```json
{
  "UserId": "AIDAI...",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/messageai-developer"
}
```

If you see this, ✅ **IAM setup complete!**

---

## Phase 0.1.2: Create Lambda Function (15 minutes)

### Task 0.1.2.1: Create Lambda Function via Console

1. **Navigate to Lambda:**

   - AWS Console → Search "Lambda"
   - Click "Lambda" service

2. **Create Function:**

   - Click "Create function" button
   - Select "Author from scratch"
   - Function name: `messageai-service`
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64`
   - Expand "Change default execution role"
   - Select "Create a new role with basic Lambda permissions"
   - Click "Create function"

3. **Wait for creation** (~30 seconds)
   - You'll see green banner: "Successfully created the function messageai-service"

### Task 0.1.2.2: Configure Lambda Settings

1. **In the function page, scroll to "Configuration" tab**
2. **General configuration:**

   - Click "Edit"
   - Memory: `512 MB`
   - Timeout: `30 seconds`
   - Click "Save"

3. **Environment variables** (we'll add these later in Phase 0.2)

### Task 0.1.2.3 & 0.1.2.4: Build and Deploy Lambda Code

**In Terminal, navigate to lambda directory:**

```bash
cd /Users/nanis/dev/Gauntlet/messageapp/lambda

# Install dependencies
npm install

# Build TypeScript
npm run build

# Package into ZIP
npm run package

# Deploy to AWS
aws lambda update-function-code \
  --function-name messageai-service \
  --zip-file fileb://function.zip \
  --region us-east-1
```

**Expected output:**

```json
{
  "FunctionName": "messageai-service",
  "FunctionArn": "arn:aws:lambda:us-east-1:...",
  "Runtime": "nodejs20.x",
  "CodeSize": 12345,
  "LastModified": "2025-10-22T..."
}
```

### Test the Lambda Function

1. **In AWS Console Lambda page:**

   - Go to "Test" tab
   - Click "Test" button
   - Event name: `test-health`
   - Event JSON:

   ```json
   {
     "path": "/health",
     "httpMethod": "GET"
   }
   ```

   - Click "Save"
   - Click "Test"

2. **Expected result:**
   ```json
   {
     "statusCode": 200,
     "headers": { "Content-Type": "application/json" },
     "body": "{\"status\":\"ok\",\"version\":\"1.0.0\",\"timestamp\":\"...\"}"
   }
   ```

✅ **If you see status 200, Lambda is working!**

---

## Phase 0.1.3: Set up API Gateway (25 minutes)

### Task 0.1.3.1: Create REST API

1. **Navigate to API Gateway:**

   - AWS Console → Search "API Gateway"
   - Click "API Gateway" service

2. **Create API:**
   - Click "Create API"
   - Choose "REST API" (not private)
   - Click "Build"
   - Protocol: `REST`
   - Create new API: `New API`
   - API name: `messageai-api`
   - Description: `AI-powered scheduling assistant API`
   - Endpoint Type: `Regional`
   - Click "Create API"

### Task 0.1.3.2: Create Resources and Methods

**Create /health endpoint:**

1. Click "Create Resource" button
2. Resource Name: `health`
3. Click "Create Resource"
4. With `/health` selected, click "Create Method"
5. Method type: `GET`
6. Integration type: `Lambda Function`
7. Lambda proxy integration: ✅ **Check this box**
8. Lambda function: `messageai-service`
9. Click "Create Method"

**Create /ai resource:**

1. Click root `/` in resources
2. Click "Create Resource"
3. Resource Name: `ai`
4. Click "Create Resource"

**Create /ai/chat endpoint:**

1. Select `/ai` resource
2. Click "Create Method"
3. Method type: `POST`
4. Integration type: `Lambda Function`
5. Lambda proxy integration: ✅ **Check**
6. Lambda function: `messageai-service`
7. Click "Create Method"

**Repeat for /ai/extract-event:**

1. Select `/ai` resource
2. Click "Create Method"
3. Method type: `POST`
4. Lambda function: `messageai-service`
5. Lambda proxy integration: ✅ **Check**
6. Click "Create Method"

**Repeat for /ai/detect-conflicts:**

1. Select `/ai` resource
2. Click "Create Method"
3. Method type: `POST`
4. Lambda function: `messageai-service`
5. Lambda proxy integration: ✅ **Check**
6. Click "Create Method"

### Task 0.1.3.4: Enable CORS

For **each** endpoint (`/health`, `/ai/chat`, `/ai/extract-event`, `/ai/detect-conflicts`):

1. Select the endpoint
2. Click "Enable CORS" button (top right)
3. Keep defaults:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: (default)
   - Access-Control-Allow-Methods: (default)
4. Click "Save"

### Task 0.1.3.5: Deploy API

1. **Click "Deploy API" button** (orange button, top right)
2. Stage: `New Stage`
3. Stage name: `staging`
4. Click "Deploy"

5. **Copy your Invoke URL:**
   - You'll see: "Invoke URL: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/staging"
   - 💾 **Save this URL!** You'll need it in React Native app

### Test API Gateway

**In Terminal:**

```bash
# Test health endpoint
curl https://YOUR-API-URL/staging/health

# Expected output:
# {"status":"ok","version":"1.0.0","timestamp":"..."}

# Test AI chat endpoint
curl -X POST https://YOUR-API-URL/staging/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","message":"hello"}'

# Expected: Mock AI response
```

✅ **If both work, API Gateway is live!**

---

## Phase 0.1.4: Environment Variables (Skip for now)

We'll set these up in Phase 0.2 when we add OpenAI.

---

## Phase 0.1.5: Verification Checklist

- [ ] IAM user created
- [ ] AWS CLI configured
- [ ] Lambda function deployed
- [ ] Lambda test passes (health check)
- [ ] API Gateway created
- [ ] All 4 endpoints defined
- [ ] CORS enabled
- [ ] API deployed to staging
- [ ] Health endpoint returns 200 OK
- [ ] Chat endpoint returns mock response

**If all checked, Phase 0.1 is COMPLETE! 🎉**

---

## Troubleshooting

### Lambda deployment fails

```bash
# Check AWS CLI is authenticated
aws sts get-caller-identity

# Ensure you're in the lambda directory
cd /Users/nanis/dev/Gauntlet/messageapp/lambda

# Rebuild and retry
npm run build && npm run package && npm run deploy
```

### API Gateway returns 403

- Check Lambda proxy integration is enabled
- Redeploy API after changes
- Check CORS settings

### Lambda execution role error

- Go to Lambda → Configuration → Permissions
- Ensure execution role exists and has basic permissions

---

## Next Steps

After completing Phase 0.1:

- ✅ Phase 0.2: Integrate OpenAI GPT-4
- ✅ Phase 0.3: Set up Google Calendar API
- ✅ Phase 1: Build AI Chat UI in React Native

**Time to complete:** ~45 minutes  
**Status:** Ready to begin!
