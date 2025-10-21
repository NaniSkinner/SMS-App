/**
 * Conversation Service
 * Handles conversation creation and management
 */

import { ApiResponse, Conversation, ConversationType } from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { getUserProfile } from "./user";

/**
 * Get or create a direct conversation between two users
 */
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<ApiResponse<Conversation>> => {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("type", "==", "direct"),
      where("participants", "array-contains", userId1)
    );

    const querySnapshot = await getDocs(q);

    // Find existing conversation with both users
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (
        data.participants.includes(userId1) &&
        data.participants.includes(userId2)
      ) {
        console.log(
          `✅ Found existing conversation: ${docSnap.id} between ${userId1} and ${userId2}`
        );

        // Return existing conversation
        const conversation: Conversation = {
          id: docSnap.id,
          type: data.type,
          participants: data.participants,
          participantDetails: convertParticipantDetails(
            data.participantDetails
          ),
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text,
                timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
                senderId: data.lastMessage.senderId,
                senderName: data.lastMessage.senderName,
              }
            : undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return {
          success: true,
          data: conversation,
        };
      }
    }

    // No existing conversation found, create new one
    console.log(
      `📝 Creating new conversation between ${userId1} and ${userId2}`
    );
    return await createConversation([userId1, userId2]);
  } catch (error: any) {
    console.error("❌ Error getting or creating conversation:", error);
    return {
      success: false,
      error: "Failed to create conversation.",
    };
  }
};

/**
 * Create a new conversation (direct or group)
 */
export const createConversation = async (
  participantIds: string[],
  groupName?: string,
  createdBy?: string
): Promise<ApiResponse<Conversation>> => {
  try {
    if (participantIds.length < 2) {
      return {
        success: false,
        error: "At least 2 participants are required.",
      };
    }

    // Fetch participant details
    const participantDetails: Conversation["participantDetails"] = {};
    for (const userId of participantIds) {
      const result = await getUserProfile(userId);
      if (result.success && result.data) {
        participantDetails[userId] = {
          displayName: result.data.displayName,
          photoURL: result.data.photoURL, // Can be undefined
          isOnline: result.data.isOnline,
          lastSeen: result.data.lastSeen,
        };
      }
    }

    const conversationType: ConversationType =
      participantIds.length === 2 ? "direct" : "group";

    const conversationData = {
      type: conversationType,
      participants: participantIds,
      participantDetails,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(conversationType === "group" && {
        groupName: groupName || "New Group",
        createdBy: createdBy || participantIds[0],
      }),
    };

    const conversationsRef = collection(db, "conversations");
    const docRef = await addDoc(conversationsRef, conversationData);

    console.log(`✅ Conversation created: ${docRef.id}`);

    // Create userConversations subcollection for each participant
    for (const userId of participantIds) {
      try {
        const userConvRef = doc(
          db,
          "users",
          userId,
          "conversations",
          docRef.id
        );
        await setDoc(userConvRef, {
          conversationId: docRef.id,
          unreadCount: 0,
          lastMessageTimestamp: serverTimestamp(),
          isMuted: false,
          isPinned: false,
        });
        console.log(`✅ Created userConversation for user ${userId}`);
      } catch (error: any) {
        console.error(
          `❌ Failed to create userConversation for user ${userId}:`,
          error.message
        );
        throw error; // Re-throw to fail the whole operation
      }
    }

    console.log(
      `✅ Created userConversations for ${participantIds.length} users`
    );

    // Return the created conversation
    const conversation: Conversation = {
      id: docRef.id,
      type: conversationType,
      participants: participantIds,
      participantDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(conversationType === "group" && {
        groupName: groupName || "New Group",
        createdBy: createdBy || participantIds[0],
      }),
    };

    return {
      success: true,
      data: conversation,
    };
  } catch (error: any) {
    console.error("❌ Error creating conversation:", error);
    return {
      success: false,
      error: "Failed to create conversation.",
    };
  }
};

/**
 * Update the last message in a conversation
 */
export const updateLastMessage = async (
  conversationId: string,
  message: {
    text: string;
    senderId: string;
    senderName: string;
  }
): Promise<ApiResponse<void>> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    await updateDoc(conversationRef, {
      lastMessage: {
        text: message.text,
        timestamp: serverTimestamp(),
        senderId: message.senderId,
        senderName: message.senderName,
      },
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Updated last message for conversation ${conversationId}`);

    // Update lastMessageTimestamp in all participants' userConversations
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const participants = conversationSnap.data().participants as string[];

      for (const userId of participants) {
        const userConvRef = doc(
          db,
          "users",
          userId,
          "conversations",
          conversationId
        );

        // Increment unread count for everyone except the sender
        if (userId !== message.senderId) {
          // Use setDoc with merge to update or create without reading first
          await setDoc(
            userConvRef,
            {
              lastMessageTimestamp: serverTimestamp(),
              unreadCount: increment(1),
            },
            { merge: true }
          );
        } else {
          await setDoc(
            userConvRef,
            {
              lastMessageTimestamp: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error updating last message:", error);
    return {
      success: false,
      error: "Failed to update conversation.",
    };
  }
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (
  userId: string
): Promise<ApiResponse<Conversation[]>> => {
  try {
    // Get user's conversation IDs from userConversations subcollection
    const userConversationsRef = collection(
      db,
      "users",
      userId,
      "conversations"
    );
    const userConvSnapshot = await getDocs(userConversationsRef);

    const conversationIds = userConvSnapshot.docs.map((doc) => doc.id);

    if (conversationIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Fetch all conversations
    const conversations: Conversation[] = [];
    for (const convId of conversationIds) {
      const conversationRef = doc(db, "conversations", convId);
      const convSnap = await getDoc(conversationRef);

      if (convSnap.exists()) {
        const data = convSnap.data();
        conversations.push({
          id: convSnap.id,
          type: data.type,
          participants: data.participants,
          participantDetails: convertParticipantDetails(
            data.participantDetails
          ),
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text,
                timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
                senderId: data.lastMessage.senderId,
                senderName: data.lastMessage.senderName,
              }
            : undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          groupName: data.groupName,
          groupPhoto: data.groupPhoto,
          createdBy: data.createdBy,
        });
      }
    }

    // Sort by updatedAt (most recent first)
    conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    console.log(
      `✅ Loaded ${conversations.length} conversations for user ${userId}`
    );

    return {
      success: true,
      data: conversations,
    };
  } catch (error: any) {
    console.error("❌ Error getting conversations:", error);
    return {
      success: false,
      error: "Failed to load conversations.",
    };
  }
};

/**
 * Helper function to convert participant details from Firestore format
 */
function convertParticipantDetails(
  participantDetails: any
): Conversation["participantDetails"] {
  const converted: Conversation["participantDetails"] = {};

  for (const userId in participantDetails) {
    const detail = participantDetails[userId];
    converted[userId] = {
      displayName: detail.displayName,
      photoURL: detail.photoURL,
      isOnline: detail.isOnline,
      lastSeen: detail.lastSeen?.toDate() || null,
    };
  }

  return converted;
}
