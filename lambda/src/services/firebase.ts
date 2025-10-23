/**
 * Firebase Admin Service
 * Initializes Firebase Admin SDK for Firestore and Auth operations
 */

import * as admin from "firebase-admin";
import { AppError } from "../utils/types";
import { getFirebaseCredentials } from "./secrets";

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
export async function initializeFirebase(): Promise<void> {
  if (firebaseInitialized) {
    console.log("✅ Firebase already initialized");
    return;
  }

  try {
    console.log("🔥 Initializing Firebase Admin SDK...");

    const credentials = await getFirebaseCredentials();

    admin.initializeApp({
      credential: admin.credential.cert(credentials as admin.ServiceAccount),
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized");
  } catch (error: any) {
    console.error("❌ Failed to initialize Firebase:", error);
    throw new AppError(
      `Firebase initialization failed: ${error.message}`,
      500,
      "FIREBASE_INIT_ERROR"
    );
  }
}

/**
 * Get Firestore instance
 */
export function getFirestore(): admin.firestore.Firestore {
  if (!firebaseInitialized) {
    throw new AppError(
      "Firebase not initialized. Call initializeFirebase() first.",
      500,
      "FIREBASE_NOT_INITIALIZED"
    );
  }
  return admin.firestore();
}

/**
 * Verify Firebase Auth token
 */
export async function verifyAuthToken(
  token: string
): Promise<admin.auth.DecodedIdToken> {
  if (!firebaseInitialized) {
    await initializeFirebase();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(`✅ Auth token verified for user: ${decodedToken.uid}`);
    return decodedToken;
  } catch (error: any) {
    console.error("❌ Auth token verification failed:", error);
    throw new AppError(
      "Invalid or expired authentication token",
      401,
      "INVALID_AUTH_TOKEN"
    );
  }
}
