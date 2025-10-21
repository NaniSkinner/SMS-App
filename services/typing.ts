/**
 * Typing Indicator Service
 * Handles typing status for conversations
 */

import { ApiResponse } from "@/types";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.config";

/**
 * Set user as typing in a conversation
 */
export const setUserTyping = async (
  conversationId: string,
  userId: string,
  displayName: string
): Promise<ApiResponse<void>> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    await updateDoc(conversationRef, {
      typingUsers: {
        [userId]: {
          displayName,
          timestamp: serverTimestamp(),
        },
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error setting typing status:", error);
    return {
      success: false,
      error: "Failed to update typing status.",
    };
  }
};

/**
 * Clear user's typing status
 */
export const clearUserTyping = async (
  conversationId: string,
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    await updateDoc(conversationRef, {
      [`typingUsers.${userId}`]: null,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error clearing typing status:", error);
    return {
      success: false,
      error: "Failed to clear typing status.",
    };
  }
};

/**
 * Subscribe to typing status updates for a conversation
 */
export const subscribeToTypingStatus = (
  conversationId: string,
  currentUserId: string,
  callback: (typingUserNames: string[]) => void
): Unsubscribe => {
  const conversationRef = doc(db, "conversations", conversationId);

  const unsubscribe = onSnapshot(
    conversationRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const typingUsers = data.typingUsers || {};

        // Filter out current user and expired typing statuses (>5 seconds old)
        const now = Date.now();
        const typingNames: string[] = [];

        Object.entries(typingUsers).forEach(
          ([userId, userData]: [string, any]) => {
            if (
              userId !== currentUserId &&
              userData &&
              userData.displayName &&
              userData.timestamp
            ) {
              const typingTime = userData.timestamp.toDate().getTime();
              const timeDiff = now - typingTime;

              // Only show if less than 5 seconds old
              if (timeDiff < 5000) {
                typingNames.push(userData.displayName);
              }
            }
          }
        );

        callback(typingNames);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("❌ Error subscribing to typing status:", error);
    }
  );

  return unsubscribe;
};
