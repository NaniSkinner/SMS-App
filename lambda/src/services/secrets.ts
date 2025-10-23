/**
 * AWS Secrets Manager Service
 * Retrieves and caches secrets from AWS Secrets Manager
 */

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { AppError, FirebaseSecrets, GoogleOAuthSecrets } from "../utils/types";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-2",
});

// In-memory cache for secrets (Lambda container reuse)
const secretsCache = new Map<string, any>();

/**
 * Generic function to retrieve a secret from AWS Secrets Manager
 */
async function getSecret<T>(secretName: string): Promise<T> {
  // Check cache first
  if (secretsCache.has(secretName)) {
    console.log(`✅ Retrieved secret from cache: ${secretName}`);
    return secretsCache.get(secretName) as T;
  }

  try {
    console.log(`📥 Fetching secret from AWS: ${secretName}`);

    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new AppError(
        `Secret ${secretName} has no value`,
        500,
        "SECRET_EMPTY"
      );
    }

    const secret = JSON.parse(response.SecretString) as T;

    // Cache the secret
    secretsCache.set(secretName, secret);

    console.log(`✅ Secret retrieved and cached: ${secretName}`);
    return secret;
  } catch (error: any) {
    console.error(`❌ Failed to retrieve secret ${secretName}:`, error);

    if (error.name === "ResourceNotFoundException") {
      throw new AppError(
        `Secret not found: ${secretName}`,
        500,
        "SECRET_NOT_FOUND"
      );
    }

    if (error.name === "AccessDeniedException") {
      throw new AppError(
        `Access denied to secret: ${secretName}`,
        500,
        "SECRET_ACCESS_DENIED"
      );
    }

    throw new AppError(
      `Failed to retrieve secret: ${error.message}`,
      500,
      "SECRET_RETRIEVAL_ERROR"
    );
  }
}

/**
 * Get OpenAI API key
 */
export async function getOpenAIKey(): Promise<string> {
  const secretName = process.env.OPENAI_API_KEY_SECRET_NAME;

  if (!secretName) {
    throw new AppError(
      "OPENAI_API_KEY_SECRET_NAME environment variable not set",
      500,
      "CONFIG_ERROR"
    );
  }

  // Secret is stored as a plain string, not JSON
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new AppError(`OpenAI secret has no value`, 500, "SECRET_EMPTY");
    }

    return response.SecretString;
  } catch (error: any) {
    console.error(`❌ Failed to retrieve OpenAI key:`, error);
    throw new AppError(
      `Failed to retrieve OpenAI key: ${error.message}`,
      500,
      "OPENAI_KEY_ERROR"
    );
  }
}

/**
 * Get Firebase Admin SDK credentials
 */
export async function getFirebaseCredentials(): Promise<FirebaseSecrets> {
  const secretName = process.env.FIREBASE_ADMIN_SECRET_NAME;

  if (!secretName) {
    throw new AppError(
      "FIREBASE_ADMIN_SECRET_NAME environment variable not set",
      500,
      "CONFIG_ERROR"
    );
  }

  return getSecret<FirebaseSecrets>(secretName);
}

/**
 * Get Google OAuth credentials
 */
export async function getGoogleOAuthCredentials(): Promise<GoogleOAuthSecrets> {
  const secretName = process.env.GOOGLE_CLIENT_SECRET_NAME;

  if (!secretName) {
    throw new AppError(
      "GOOGLE_CLIENT_SECRET_NAME environment variable not set",
      500,
      "CONFIG_ERROR"
    );
  }

  return getSecret<GoogleOAuthSecrets>(secretName);
}

/**
 * Clear the secrets cache (useful for testing or forcing refresh)
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
  console.log("🧹 Secrets cache cleared");
}
