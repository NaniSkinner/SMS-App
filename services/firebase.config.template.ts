/**
 * Firebase Configuration Template
 *
 * Instructions:
 * 1. Copy this file to `firebase.config.ts`
 * 2. Replace all placeholder values with your actual Firebase credentials
 * 3. Get credentials from: Firebase Console > Project Settings > General > Your apps
 * 4. IMPORTANT: Add `firebase.config.ts` to .gitignore to keep credentials secure
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
// Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // Optional: Add measurementId if using Analytics
  // measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (persistence is automatic in React Native)
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Export Firebase services
export { app, auth, db };

// Export default for convenience
export default app;
