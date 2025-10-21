/**
 * Cloud Functions for Push Notifications
 * Sends Expo push notifications when new messages are created
 */

import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Expo SDK
const expo = new Expo();

/**
 * Send push notification when a new message is created
 * Triggers on: conversations/{conversationId}/messages/{messageId}
 */
export const onMessageCreated = functions.firestore
  .document("conversations/{conversationId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const conversationId = context.params.conversationId;
    const messageId = context.params.messageId;

    console.log("📨 New message created:", {
      conversationId,
      messageId,
      senderId: messageData.senderId,
    });

    try {
      // Get conversation details
      const conversationDoc = await admin
        .firestore()
        .collection("conversations")
        .doc(conversationId)
        .get();

      if (!conversationDoc.exists) {
        console.error("❌ Conversation not found:", conversationId);
        return;
      }

      const conversationData = conversationDoc.data()!;
      const participants = conversationData.participants as string[];
      const senderId = messageData.senderId as string;
      const messageText = messageData.text as string;
      const conversationType = conversationData.type as "direct" | "group";
      const groupName = conversationData.groupName as string | undefined;

      // Get sender details
      const senderDetails = conversationData.participantDetails[senderId];
      const senderName = senderDetails?.displayName || "Someone";

      // Get recipients (exclude sender)
      const recipientIds = participants.filter((id) => id !== senderId);

      if (recipientIds.length === 0) {
        console.log("ℹ️ No recipients to notify");
        return;
      }

      console.log("👥 Recipients:", recipientIds);

      // Get recipient user documents to get push tokens and active conversation
      const recipientPromises = recipientIds.map((id) =>
        admin.firestore().collection("users").doc(id).get()
      );

      const recipientDocs = await Promise.all(recipientPromises);

      // Build notification messages
      const messages: ExpoPushMessage[] = [];

      for (const doc of recipientDocs) {
        if (!doc.exists) {
          console.log("⚠️ User not found:", doc.id);
          continue;
        }

        const userData = doc.data()!;
        const pushToken = userData.pushToken as string | undefined;

        // Skip if no push token
        if (!pushToken) {
          console.log("ℹ️ No push token for user:", doc.id);
          continue;
        }

        // Validate push token format
        if (!Expo.isExpoPushToken(pushToken)) {
          console.log("⚠️ Invalid push token format:", pushToken);
          continue;
        }

        // Check if user is currently viewing this conversation
        // We'll use a "activeConversationId" field that clients update
        const activeConversationId = userData.activeConversationId as
          | string
          | undefined;

        if (activeConversationId === conversationId) {
          console.log(
            "ℹ️ User is viewing this conversation, skipping notification:",
            doc.id
          );
          continue;
        }

        // Build notification title and body
        let title: string;
        let body: string;

        if (conversationType === "group" && groupName) {
          // Group message: "Family • Alice: Message text"
          title = groupName;
          body = `${senderName}: ${messageText}`;
        } else {
          // Direct message: "Alice: Message text"
          title = senderName;
          body = messageText;
        }

        // Create push message
        messages.push({
          to: pushToken,
          sound: "default",
          title: title,
          body: body.length > 100 ? body.substring(0, 97) + "..." : body,
          data: {
            conversationId,
            senderId,
            senderName,
            messageText,
            conversationType,
            groupName,
          },
          badge: 1, // Will be updated by client based on actual unread count
          priority: "high",
          channelId: "messages", // For Android
        });
      }

      if (messages.length === 0) {
        console.log("ℹ️ No notifications to send");
        return;
      }

      console.log(`📤 Sending ${messages.length} notification(s)`);

      // Send notifications in chunks (Expo recommends chunks of 100)
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log("✅ Sent chunk:", ticketChunk.length);
        } catch (error) {
          console.error("❌ Error sending chunk:", error);
        }
      }

      // Check for errors in tickets
      tickets.forEach((ticket, index) => {
        if (ticket.status === "error") {
          console.error("❌ Push notification error:", {
            message: messages[index],
            error: ticket.message,
            details: ticket.details,
          });
        } else {
          console.log("✅ Push notification sent:", ticket.id);
        }
      });

      console.log("✅ Notification processing complete");
    } catch (error) {
      console.error("❌ Error in onMessageCreated:", error);
      throw error;
    }
  });

/**
 * Helper function to update user's active conversation
 * Called by client when user opens/closes a chat
 */
export const updateActiveConversation = functions.https.onCall(
  async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const conversationId = data.conversationId as string | null;

    try {
      await admin.firestore().collection("users").doc(userId).update({
        activeConversationId: conversationId,
      });

      console.log("✅ Updated active conversation:", {
        userId,
        conversationId,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error updating active conversation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update active conversation"
      );
    }
  }
);
