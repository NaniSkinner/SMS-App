/**
 * Presence Service
 * Handles online/offline status using Firebase Realtime Database
 * Uses RTDB for reliable onDisconnect() handling
 */

import { ApiResponse } from "@/types";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp as rtdbServerTimestamp,
  Unsubscribe as RTDBUnsubscribe,
  set,
} from "firebase/database";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, rtdb } from "./firebase.config";

/**
 * Set user as online with automatic offline on disconnect
 */
export const setUserOnline = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    // Reference to user's presence in RTDB
    const presenceRef = ref(rtdb, `presence/${userId}`);

    // Set up automatic offline on disconnect
    await onDisconnect(presenceRef).set({
      isOnline: false,
      lastSeen: rtdbServerTimestamp(),
    });

    // Set user as online in RTDB
    await set(presenceRef, {
      isOnline: true,
      lastSeen: rtdbServerTimestamp(),
    });

    // Also update Firestore for consistency
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    console.log("✅ User set online with onDisconnect handler:", userId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error setting user online:", error);
    return {
      success: false,
      error: "Failed to update online status.",
    };
  }
};

/**
 * Set user as offline manually
 */
export const setUserOffline = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    // Reference to user's presence in RTDB
    const presenceRef = ref(rtdb, `presence/${userId}`);

    // Cancel any pending onDisconnect
    await onDisconnect(presenceRef).cancel();

    // Set user as offline in RTDB
    await set(presenceRef, {
      isOnline: false,
      lastSeen: rtdbServerTimestamp(),
    });

    // Also update Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });

    console.log("✅ User set offline:", userId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error setting user offline:", error);
    return {
      success: false,
      error: "Failed to update offline status.",
    };
  }
};

/**
 * Subscribe to user's presence status in real-time
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (isOnline: boolean, lastSeen: Date | null) => void
): RTDBUnsubscribe => {
  const presenceRef = ref(rtdb, `presence/${userId}`);

  console.log(`📡 Subscribing to presence for user: ${userId}`);

  const unsubscribe = onValue(
    presenceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const isOnline = data.isOnline || false;
        const lastSeen = data.lastSeen ? new Date(data.lastSeen) : null;

        console.log(
          `📊 Presence update for ${userId}: ${isOnline ? "online" : "offline"}`
        );

        callback(isOnline, lastSeen);
      } else {
        // No presence data, assume offline
        callback(false, null);
      }
    },
    (error) => {
      console.error("❌ Error subscribing to presence:", error);
    }
  );

  return unsubscribe;
};

/**
 * Update presence heartbeat (call periodically while app is active)
 */
export const updatePresenceHeartbeat = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const presenceRef = ref(rtdb, `presence/${userId}`);

    // Update timestamp to show user is still active
    await set(presenceRef, {
      isOnline: true,
      lastSeen: rtdbServerTimestamp(),
    });

    // Refresh onDisconnect handler
    await onDisconnect(presenceRef).set({
      isOnline: false,
      lastSeen: rtdbServerTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error updating heartbeat:", error);
    return {
      success: false,
      error: "Failed to update heartbeat.",
    };
  }
};
