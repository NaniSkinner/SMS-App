/**
 * Queue Processor Service
 * Handles processing of offline message queue
 */

import { useChatStore } from "@/stores/chatStore";
import {
  getOfflineQueue,
  removeFromOfflineQueue,
  updateQueueItemRetryCount,
} from "./cache";
import { sendMessage } from "./chat";
import { updateLastMessage } from "./conversations";

const MAX_RETRY_COUNT = 3;

/**
 * Process all messages in the offline queue
 */
export const processOfflineQueue = async (): Promise<void> => {
  console.log("🔄 Processing offline queue...");

  const queue = await getOfflineQueue();

  if (queue.length === 0) {
    console.log("✅ Offline queue is empty");
    return;
  }

  console.log(`📤 Found ${queue.length} messages in offline queue`);

  // Process each queued message
  for (const item of queue) {
    try {
      // Check if we've exceeded max retry count
      if (item.retryCount >= MAX_RETRY_COUNT) {
        console.error(
          `❌ Max retry count reached for message ${item.id}, marking as failed`
        );

        // Mark message as failed in store
        const { updateMessageStatus } = useChatStore.getState();
        updateMessageStatus(item.conversationId, item.id, "failed");

        // Remove from queue
        await removeFromOfflineQueue(item.id);
        continue;
      }

      // Try to send the message
      console.log(
        `📤 Sending queued message ${item.id} (attempt ${item.retryCount + 1})`
      );

      const result = await sendMessage(
        item.conversationId,
        item.message.text,
        item.message.senderId,
        item.message.localId
      );

      if (result.success && result.data) {
        console.log(`✅ Successfully sent queued message ${item.id}`);

        // Replace optimistic message with server message
        const { replaceOptimisticMessage } = useChatStore.getState();
        replaceOptimisticMessage(
          item.conversationId,
          item.message.localId,
          result.data
        );

        // Update last message in conversation
        await updateLastMessage(item.conversationId, {
          text: item.message.text,
          senderId: item.message.senderId,
          senderName: "", // We don't have access to display name here, conversation service will handle it
        });

        // Remove from queue
        await removeFromOfflineQueue(item.id);
      } else {
        console.error(
          `❌ Failed to send queued message ${item.id}:`,
          result.error
        );

        // Increment retry count
        await updateQueueItemRetryCount(item.id, item.retryCount + 1);
      }
    } catch (error) {
      console.error(`❌ Error processing queued message ${item.id}:`, error);

      // Increment retry count
      await updateQueueItemRetryCount(item.id, item.retryCount + 1);
    }
  }

  console.log("✅ Finished processing offline queue");
};

/**
 * Process queue for a specific conversation
 */
export const processQueueForConversation = async (
  conversationId: string
): Promise<void> => {
  console.log(`🔄 Processing queue for conversation ${conversationId}...`);

  const queue = await getOfflineQueue();
  const conversationQueue = queue.filter(
    (item) => item.conversationId === conversationId
  );

  if (conversationQueue.length === 0) {
    console.log(`✅ No queued messages for conversation ${conversationId}`);
    return;
  }

  console.log(
    `📤 Found ${conversationQueue.length} messages in queue for conversation ${conversationId}`
  );

  // Process messages sequentially to maintain order
  for (const item of conversationQueue) {
    try {
      if (item.retryCount >= MAX_RETRY_COUNT) {
        console.error(
          `❌ Max retry count reached for message ${item.id}, marking as failed`
        );

        const { updateMessageStatus } = useChatStore.getState();
        updateMessageStatus(item.conversationId, item.id, "failed");
        await removeFromOfflineQueue(item.id);
        continue;
      }

      const result = await sendMessage(
        item.conversationId,
        item.message.text,
        item.message.senderId,
        item.message.localId
      );

      if (result.success && result.data) {
        const { replaceOptimisticMessage } = useChatStore.getState();
        replaceOptimisticMessage(
          item.conversationId,
          item.message.localId,
          result.data
        );

        await updateLastMessage(item.conversationId, {
          text: item.message.text,
          senderId: item.message.senderId,
          senderName: "",
        });

        await removeFromOfflineQueue(item.id);
        console.log(`✅ Successfully sent queued message ${item.id}`);
      } else {
        await updateQueueItemRetryCount(item.id, item.retryCount + 1);
        console.error(
          `❌ Failed to send queued message ${item.id}:`,
          result.error
        );
      }
    } catch (error) {
      await updateQueueItemRetryCount(item.id, item.retryCount + 1);
      console.error(`❌ Error processing queued message ${item.id}:`, error);
    }
  }

  console.log(
    `✅ Finished processing queue for conversation ${conversationId}`
  );
};
