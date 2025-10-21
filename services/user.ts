/**
 * User Service
 * Handles user profile creation and management in Firestore
 */

import { ApiResponse, User } from "@/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.config";

/**
 * Helper function to safely convert timestamps to Date objects
 * Handles Firestore Timestamps, Date objects, strings, and null
 */
function convertToDate(timestamp: any): Date | null {
  if (!timestamp) return null;

  if (typeof timestamp.toDate === "function") {
    // It's a Firestore Timestamp
    return timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // It's already a Date
    return timestamp;
  } else if (typeof timestamp === "string") {
    // It's a string (from JSON serialization)
    return new Date(timestamp);
  } else if (typeof timestamp === "number") {
    // It's a timestamp number
    return new Date(timestamp);
  }

  return null;
}

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
    console.error("❌ Error details:", error.message, error.code);
    return {
      success: false,
      error: `Failed to create user profile: ${
        error.message || error.code || "Unknown error"
      }`,
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
      lastSeen: convertToDate(data.lastSeen),
      createdAt: convertToDate(data.createdAt) || new Date(),
      pushToken: data.pushToken || undefined,
      theme: data.theme || "system",
    };

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error("❌ Error getting user profile:", error);
    console.error("❌ Error details:", error.message, error.code);
    return {
      success: false,
      error: `Failed to load user profile: ${
        error.message || error.code || "Unknown error"
      }`,
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

/**
 * Get all users from Firestore (excluding current user)
 */
export const getAllUsers = async (
  excludeUserId?: string
): Promise<ApiResponse<User[]>> => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      // Exclude the current user if specified
      if (excludeUserId && doc.id === excludeUserId) {
        return;
      }

      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL || undefined,
        isOnline: data.isOnline,
        lastSeen: convertToDate(data.lastSeen),
        createdAt: convertToDate(data.createdAt) || new Date(),
        pushToken: data.pushToken || undefined,
        theme: data.theme || "system",
      });
    });

    console.log(`✅ Loaded ${users.length} users`);

    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    console.error("❌ Error getting all users:", error);
    return {
      success: false,
      error: "Failed to load users.",
    };
  }
};

/**
 * Update the user's active conversation ID
 * Used to prevent push notifications when user is viewing a conversation
 */
export const updateActiveConversation = async (
  userId: string,
  conversationId: string | null
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      activeConversationId: conversationId,
    });
    console.log("✅ Updated active conversation:", conversationId);
  } catch (error) {
    console.error("❌ Error updating active conversation:", error);
    // Don't throw - this is not critical
  }
};
