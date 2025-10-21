/**
 * Cache Service
 * Handles local caching of messages and conversations using AsyncStorage
 */

import {
  CachedConversation,
  CachedMessage,
  Conversation,
  Message,
  OfflineQueueItem,
  OptimisticMessage,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache keys
const CACHE_KEYS = {
  MESSAGES: "messages_cache",
  CONVERSATIONS: "conversations_cache",
  OFFLINE_QUEUE: "offline_queue",
};

// Maximum messages to cache per conversation
const MAX_MESSAGES_PER_CONVERSATION = 100;

// ========================================
// MESSAGE CACHING
// ========================================

/**
 * Cache messages for a conversation
 */
export const cacheMessages = async (
  conversationId: string,
  messages: Message[]
): Promise<void> => {
  try {
    // Get existing cache
    const cacheData = await AsyncStorage.getItem(CACHE_KEYS.MESSAGES);
    const cache: { [conversationId: string]: CachedMessage[] } = cacheData
      ? JSON.parse(cacheData)
      : {};

    // Keep only the last MAX_MESSAGES_PER_CONVERSATION messages
    const messagesToCache = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);

    // Convert messages to cached messages with timestamp
    const cachedMessages: CachedMessage[] = messagesToCache.map((msg) => ({
      ...msg,
      timestamp:
        msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      createdAt:
        msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
      cachedAt: new Date(),
    }));

    // Update cache
    cache[conversationId] = cachedMessages;

    // Save to AsyncStorage
    await AsyncStorage.setItem(CACHE_KEYS.MESSAGES, JSON.stringify(cache));

    console.log(
      `💾 Cached ${cachedMessages.length} messages for conversation ${conversationId}`
    );
  } catch (error) {
    console.error("❌ Error caching messages:", error);
  }
};

/**
 * Get cached messages for a conversation
 */
export const getCachedMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const cacheData = await AsyncStorage.getItem(CACHE_KEYS.MESSAGES);
    if (!cacheData) return [];

    const cache: { [conversationId: string]: CachedMessage[] } =
      JSON.parse(cacheData);
    const cachedMessages = cache[conversationId] || [];

    // Convert cached messages back to regular messages
    const messages: Message[] = cachedMessages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      createdAt: new Date(msg.createdAt),
    }));

    console.log(
      `📂 Loaded ${messages.length} cached messages for conversation ${conversationId}`
    );

    return messages;
  } catch (error) {
    console.error("❌ Error getting cached messages:", error);
    return [];
  }
};

/**
 * Clear cached messages for a conversation
 */
export const clearCachedMessages = async (
  conversationId: string
): Promise<void> => {
  try {
    const cacheData = await AsyncStorage.getItem(CACHE_KEYS.MESSAGES);
    if (!cacheData) return;

    const cache: { [conversationId: string]: CachedMessage[] } =
      JSON.parse(cacheData);
    delete cache[conversationId];

    await AsyncStorage.setItem(CACHE_KEYS.MESSAGES, JSON.stringify(cache));
    console.log(
      `🗑️  Cleared cached messages for conversation ${conversationId}`
    );
  } catch (error) {
    console.error("❌ Error clearing cached messages:", error);
  }
};

// ========================================
// CONVERSATION CACHING
// ========================================

/**
 * Cache conversations
 */
export const cacheConversations = async (
  conversations: Conversation[]
): Promise<void> => {
  try {
    const cachedConversations: CachedConversation[] = conversations.map(
      (conv) => ({
        ...conv,
        createdAt:
          conv.createdAt instanceof Date
            ? conv.createdAt
            : new Date(conv.createdAt),
        updatedAt:
          conv.updatedAt instanceof Date
            ? conv.updatedAt
            : new Date(conv.updatedAt),
        lastMessage: conv.lastMessage
          ? {
              ...conv.lastMessage,
              timestamp:
                conv.lastMessage.timestamp instanceof Date
                  ? conv.lastMessage.timestamp
                  : new Date(conv.lastMessage.timestamp),
            }
          : undefined,
        cachedAt: new Date(),
      })
    );

    await AsyncStorage.setItem(
      CACHE_KEYS.CONVERSATIONS,
      JSON.stringify(cachedConversations)
    );

    console.log(`💾 Cached ${cachedConversations.length} conversations`);
  } catch (error) {
    console.error("❌ Error caching conversations:", error);
  }
};

/**
 * Get cached conversations
 */
export const getCachedConversations = async (): Promise<Conversation[]> => {
  try {
    const cacheData = await AsyncStorage.getItem(CACHE_KEYS.CONVERSATIONS);
    if (!cacheData) return [];

    const cachedConversations: CachedConversation[] = JSON.parse(cacheData);

    // Convert cached conversations back to regular conversations
    const conversations: Conversation[] = cachedConversations.map((conv) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      lastMessage: conv.lastMessage
        ? {
            ...conv.lastMessage,
            timestamp: new Date(conv.lastMessage.timestamp),
          }
        : undefined,
    }));

    console.log(`📂 Loaded ${conversations.length} cached conversations`);

    return conversations;
  } catch (error) {
    console.error("❌ Error getting cached conversations:", error);
    return [];
  }
};

/**
 * Clear all cached conversations
 */
export const clearCachedConversations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.CONVERSATIONS);
    console.log("🗑️  Cleared all cached conversations");
  } catch (error) {
    console.error("❌ Error clearing cached conversations:", error);
  }
};

// ========================================
// OFFLINE QUEUE
// ========================================

/**
 * Add message to offline queue
 */
export const addToOfflineQueue = async (
  conversationId: string,
  message: OptimisticMessage
): Promise<void> => {
  try {
    const queueData = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
    const queue: OfflineQueueItem[] = queueData ? JSON.parse(queueData) : [];

    const queueItem: OfflineQueueItem = {
      id: message.localId,
      conversationId,
      message: {
        ...message,
        timestamp:
          message.timestamp instanceof Date
            ? message.timestamp
            : new Date(message.timestamp),
        createdAt:
          message.createdAt instanceof Date
            ? message.createdAt
            : new Date(message.createdAt),
      },
      timestamp: new Date(),
      retryCount: 0,
    };

    queue.push(queueItem);

    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));

    console.log(
      `📥 Added message ${message.localId} to offline queue (${queue.length} items)`
    );
  } catch (error) {
    console.error("❌ Error adding to offline queue:", error);
  }
};

/**
 * Get all items in offline queue
 */
export const getOfflineQueue = async (): Promise<OfflineQueueItem[]> => {
  try {
    const queueData = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
    if (!queueData) return [];

    const queue: OfflineQueueItem[] = JSON.parse(queueData);

    // Convert timestamps back to Date objects
    return queue.map((item) => ({
      ...item,
      message: {
        ...item.message,
        timestamp: new Date(item.message.timestamp),
        createdAt: new Date(item.message.createdAt),
      },
      timestamp: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error("❌ Error getting offline queue:", error);
    return [];
  }
};

/**
 * Remove item from offline queue
 */
export const removeFromOfflineQueue = async (itemId: string): Promise<void> => {
  try {
    const queueData = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
    if (!queueData) return;

    const queue: OfflineQueueItem[] = JSON.parse(queueData);
    const updatedQueue = queue.filter((item) => item.id !== itemId);

    await AsyncStorage.setItem(
      CACHE_KEYS.OFFLINE_QUEUE,
      JSON.stringify(updatedQueue)
    );

    console.log(
      `📤 Removed message ${itemId} from offline queue (${updatedQueue.length} items remaining)`
    );
  } catch (error) {
    console.error("❌ Error removing from offline queue:", error);
  }
};

/**
 * Update retry count for a queue item
 */
export const updateQueueItemRetryCount = async (
  itemId: string,
  retryCount: number
): Promise<void> => {
  try {
    const queueData = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
    if (!queueData) return;

    const queue: OfflineQueueItem[] = JSON.parse(queueData);
    const updatedQueue = queue.map((item) =>
      item.id === itemId ? { ...item, retryCount } : item
    );

    await AsyncStorage.setItem(
      CACHE_KEYS.OFFLINE_QUEUE,
      JSON.stringify(updatedQueue)
    );

    console.log(`🔄 Updated retry count for ${itemId}: ${retryCount}`);
  } catch (error) {
    console.error("❌ Error updating queue item retry count:", error);
  }
};

/**
 * Clear entire offline queue
 */
export const clearOfflineQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_QUEUE);
    console.log("🗑️  Cleared offline queue");
  } catch (error) {
    console.error("❌ Error clearing offline queue:", error);
  }
};

// ========================================
// CACHE MANAGEMENT
// ========================================

/**
 * Clear all cache data
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEYS.MESSAGES),
      AsyncStorage.removeItem(CACHE_KEYS.CONVERSATIONS),
      AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_QUEUE),
    ]);
    console.log("🗑️  Cleared all cache data");
  } catch (error) {
    console.error("❌ Error clearing all cache:", error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  messageCount: number;
  conversationCount: number;
  queueCount: number;
}> => {
  try {
    const [messagesData, conversationsData, queueData] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEYS.MESSAGES),
      AsyncStorage.getItem(CACHE_KEYS.CONVERSATIONS),
      AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE),
    ]);

    const messages: { [key: string]: CachedMessage[] } = messagesData
      ? JSON.parse(messagesData)
      : {};
    const conversations: CachedConversation[] = conversationsData
      ? JSON.parse(conversationsData)
      : [];
    const queue: OfflineQueueItem[] = queueData ? JSON.parse(queueData) : [];

    const messageCount = Object.values(messages).reduce(
      (total, msgs) => total + msgs.length,
      0
    );

    return {
      messageCount,
      conversationCount: conversations.length,
      queueCount: queue.length,
    };
  } catch (error) {
    console.error("❌ Error getting cache stats:", error);
    return {
      messageCount: 0,
      conversationCount: 0,
      queueCount: 0,
    };
  }
};
