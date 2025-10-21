/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 */

import { ApiResponse } from "@/types";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.config";

/**
 * Register a new user with email, password, and display name
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<ApiResponse<FirebaseUser>> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    console.log("✅ User registered successfully:", userCredential.user.email);

    return {
      success: true,
      data: userCredential.user,
    };
  } catch (error: any) {
    console.error("❌ Sign up error:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<ApiResponse<FirebaseUser>> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ User signed in successfully:", userCredential.user.email);

    return {
      success: true,
      data: userCredential.user,
    };
  } catch (error: any) {
    console.error("❌ Sign in error:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<ApiResponse<void>> => {
  try {
    await firebaseSignOut(auth);
    console.log("✅ User signed out successfully");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Sign out error:", error);
    return {
      success: false,
      error: "Failed to sign out. Please try again.",
    };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    default:
      return "An error occurred. Please try again.";
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (minimum 6 characters)
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
