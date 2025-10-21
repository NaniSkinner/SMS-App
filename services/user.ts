/**
 * User Service
 * Handles user profile creation and management in Firestore
 */

import { ApiResponse, User } from "@/types";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.config";

/**
 * Create a new user profile document in Firestore
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
): Promise<ApiResponse<User>> => {
  try {
    const userRef = doc(db, "users", userId);

    const userData = {
      id: userId,
      email,
      displayName,
      photoURL: null,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      pushToken: null,
      theme: "system" as const,
    };

    await setDoc(userRef, userData);

    console.log("✅ User profile created:", userId);

    // Return user data (converting serverTimestamp to Date for local use)
    const user: User = {
      id: userId,
      email,
      displayName,
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      theme: "system" as const,
    };

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error("❌ Error creating user profile:", error);
    return {
      success: false,
      error: "Failed to create user profile. Please try again.",
    };
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (
  userId: string
): Promise<ApiResponse<User>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        error: "User profile not found.",
      };
    }

    const data = userSnap.data();

    const user: User = {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL || undefined,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen?.toDate() || null,
      createdAt: data.createdAt?.toDate() || new Date(),
      pushToken: data.pushToken || undefined,
      theme: data.theme || "system",
    };

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error("❌ Error getting user profile:", error);
    return {
      success: false,
      error: "Failed to load user profile.",
    };
  }
};

/**
 * Update user's online status
 */
export const updateUserOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error updating online status:", error);
    return {
      success: false,
      error: "Failed to update online status.",
    };
  }
};

/**
 * Update user's push notification token
 */
export const updatePushToken = async (
  userId: string,
  pushToken: string
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      pushToken,
    });

    console.log("✅ Push token updated for user:", userId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error updating push token:", error);
    return {
      success: false,
      error: "Failed to update push token.",
    };
  }
};
