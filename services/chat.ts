/**
 * Chat Service
 * Handles message sending, receiving, and real-time subscriptions
 */

import {
  ApiResponse,
  Message,
  MessageStatus,
  OptimisticMessage,
} from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase.config";

/**
 * Get all messages for a conversation
 */
export const getMessages = async (
  conversationId: string
): Promise<ApiResponse<Message[]>> => {
  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const messages: Message[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status as MessageStatus,
        readBy: data.readBy || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    console.log(
      `✅ Loaded ${messages.length} messages for conversation ${conversationId}`
    );

    return {
      success: true,
      data: messages,
    };
  } catch (error: any) {
    console.error("❌ Error getting messages:", error);
    return {
      success: false,
      error: "Failed to load messages.",
    };
  }
};

/**
 * Create an optimistic message for instant UI feedback
 */
export const createOptimisticMessage = (
  conversationId: string,
  text: string,
  senderId: string
): OptimisticMessage => {
  const localId = uuidv4();
  const now = new Date();

  return {
    id: "", // Will be replaced with server ID
    localId,
    conversationId,
    senderId,
    text: text.trim(),
    timestamp: now,
    status: "sending",
    readBy: [senderId],
    createdAt: now,
  };
};

/**
 * Send a message to a conversation with optimistic UI support
 */
export const sendMessage = async (
  conversationId: string,
  text: string,
  senderId: string,
  localId?: string // Optional localId for tracking optimistic message
): Promise<ApiResponse<Message>> => {
  try {
    if (!text.trim()) {
      return {
        success: false,
        error: "Message cannot be empty.",
      };
    }

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    const messageData = {
      conversationId,
      senderId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      status: "sent" as MessageStatus,
      readBy: [senderId], // Sender has read their own message
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, messageData);

    console.log(`✅ Message sent successfully: ${docRef.id}`);

    // Return the message with the generated ID and localId for replacement
    const message: Message = {
      id: docRef.id,
      localId: localId, // Keep localId for optimistic replacement
      conversationId,
      senderId,
      text: text.trim(),
      timestamp: new Date(),
      status: "sent",
      readBy: [senderId],
      createdAt: new Date(),
    };

    return {
      success: true,
      data: message,
    };
  } catch (error: any) {
    console.error("❌ Error sending message:", error);
    return {
      success: false,
      error: "Failed to send message.",
    };
  }
};

/**
 * Subscribe to real-time message updates for a conversation
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  console.log(`📡 Subscribing to messages for conversation ${conversationId}`);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status as MessageStatus,
          readBy: data.readBy || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      console.log(
        `📩 Received ${messages.length} messages for conversation ${conversationId}`
      );
      callback(messages);
    },
    (error) => {
      console.error("❌ Error subscribing to messages:", error);
    }
  );

  return unsubscribe;
};

/**
 * Mark messages as delivered for a user
 */
export const markMessagesAsDelivered = async (
  conversationId: string,
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const batch: any[] = [];
    querySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Mark as delivered if: not sent by current user, status is "sent", and user not in readBy
      if (
        data.senderId !== userId &&
        data.status === "sent" &&
        !data.readBy?.includes(userId)
      ) {
        const messageRef = doc(
          db,
          "conversations",
          conversationId,
          "messages",
          docSnap.id
        );
        batch.push(
          updateDoc(messageRef, {
            status: "delivered",
          })
        );
      }
    });

    // Execute all updates
    await Promise.all(batch);

    if (batch.length > 0) {
      console.log(`✅ Marked ${batch.length} messages as delivered`);
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error marking messages as delivered:", error);
    return {
      success: false,
      error: "Failed to mark messages as delivered.",
    };
  }
};

// Throttle map to prevent excessive read receipt updates
const readReceiptThrottleMap = new Map<string, number>();
const THROTTLE_DELAY = 2000; // 2 seconds

/**
 * Mark messages as read for a user (with throttling)
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    // Throttle read receipts: only allow one update per conversation every 2 seconds
    const throttleKey = `${conversationId}-${userId}`;
    const lastUpdate = readReceiptThrottleMap.get(throttleKey) || 0;
    const now = Date.now();

    if (now - lastUpdate < THROTTLE_DELAY) {
      console.log("⏱️ Throttling read receipt update");
      return { success: true };
    }

    readReceiptThrottleMap.set(throttleKey, now);

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const batch: any[] = [];
    querySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Mark as read if: not sent by current user and user not in readBy
      if (data.senderId !== userId && !data.readBy?.includes(userId)) {
        const messageRef = doc(
          db,
          "conversations",
          conversationId,
          "messages",
          docSnap.id
        );
        const currentReadBy = data.readBy || [];
        batch.push(
          updateDoc(messageRef, {
            status: "read",
            readBy: [...currentReadBy, userId],
          })
        );
      }
    });

    // Execute all updates in parallel (batching)
    await Promise.all(batch);

    if (batch.length > 0) {
      console.log(`✅ Marked ${batch.length} messages as read`);
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error marking messages as read:", error);
    return {
      success: false,
      error: "Failed to mark messages as read.",
    };
  }
};
