/**
 * Chat Screen
 * Individual conversation screen with messages
 */

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { Avatar } from "@/components/common/Avatar";
import {
  addToOfflineQueue,
  cacheMessages,
  getCachedMessages,
} from "@/services/cache";
import {
  createOptimisticMessage,
  markMessagesAsDelivered,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "@/services/chat";
import { resetUnreadCount, updateLastMessage } from "@/services/conversations";
import { subscribeToUserPresence } from "@/services/presence";
import {
  clearUserTyping,
  setUserTyping,
  subscribeToTypingStatus,
} from "@/services/typing";
import { updateActiveConversation } from "@/services/user";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { colors } from "@/theme/colors";
import { Message } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    conversations,
    messages,
    setMessages,
    addMessage,
    replaceOptimisticMessage,
    updateMessageStatus,
    setActiveConversation,
  } = useChatStore();
  const { isOffline } = useUIStore();

  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<Date | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showReadStatusModal, setShowReadStatusModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const conversationId = id!;
  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];

  // Get other user ID for direct conversations
  const otherUserId =
    conversation?.type === "direct"
      ? conversation.participants.find((id) => id !== user?.id)
      : null;

  useEffect(() => {
    if (!conversationId || !user) return;

    setActiveConversation(conversationId);

    // Update active conversation to prevent push notifications while viewing
    updateActiveConversation(user.id, conversationId);

    // Load cached messages first for instant display
    const loadCachedMessages = async () => {
      const cached = await getCachedMessages(conversationId);
      if (cached.length > 0) {
        setMessages(conversationId, cached);
        setIsLoadingMessages(false);
        console.log(`📂 Loaded ${cached.length} cached messages instantly`);
      }
    };

    loadCachedMessages();

    // Mark messages as delivered when conversation opens
    markMessagesAsDelivered(conversationId, user.id);

    // Mark messages as read when viewing the conversation
    markMessagesAsRead(conversationId, user.id);

    // Reset unread count
    resetUnreadCount(user.id, conversationId);

    // Subscribe to real-time messages
    const unsubscribeMessages = subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(conversationId, newMessages);
        setIsLoadingMessages(false);

        // Cache the new messages
        cacheMessages(conversationId, newMessages);

        // Mark new messages as delivered and read when they arrive
        setTimeout(() => {
          markMessagesAsDelivered(conversationId, user.id);
          markMessagesAsRead(conversationId, user.id);
          resetUnreadCount(user.id, conversationId);
        }, 500);
      }
    );

    // Subscribe to other user's presence (for direct conversations)
    let unsubscribePresence: (() => void) | undefined;
    if (otherUserId) {
      unsubscribePresence = subscribeToUserPresence(
        otherUserId,
        (online, lastSeen) => {
          setOtherUserOnline(online);
          setOtherUserLastSeen(lastSeen);
        }
      );
    }

    // Subscribe to typing status
    const unsubscribeTyping = subscribeToTypingStatus(
      conversationId,
      user.id,
      (typingNames) => {
        setTypingUsers(typingNames);
      }
    );

    // Cleanup
    return () => {
      unsubscribeMessages();
      if (unsubscribePresence) {
        unsubscribePresence();
      }
      unsubscribeTyping();
      // Clear own typing status on unmount
      clearUserTyping(conversationId, user.id);
      setActiveConversation(null);
      // Clear active conversation to allow push notifications again
      updateActiveConversation(user.id, null);
    };
  }, [conversationId, user, otherUserId]);

  const handleSendMessage = async (text: string) => {
    if (!user || !conversation) return;

    setError(null);

    // 1. Create optimistic message
    const optimisticMessage = createOptimisticMessage(
      conversationId,
      text,
      user.id
    );

    // 2. Add to store immediately for instant UI feedback
    addMessage(conversationId, optimisticMessage);

    console.log(
      `⚡ Optimistic message added with localId: ${optimisticMessage.localId}`
    );

    // 3. If offline, add to queue and return
    if (isOffline) {
      console.log("📥 Device offline, adding message to queue");
      await addToOfflineQueue(conversationId, optimisticMessage);
      return;
    }

    // 4. Send to Firestore asynchronously
    try {
      const result = await sendMessage(
        conversationId,
        text,
        user.id,
        optimisticMessage.localId // Pass localId for tracking
      );

      if (result.success && result.data) {
        // 5. Replace optimistic message with server message
        replaceOptimisticMessage(
          conversationId,
          optimisticMessage.localId,
          result.data
        );

        // Update last message in conversation
        await updateLastMessage(conversationId, {
          text,
          senderId: user.id,
          senderName: user.displayName,
        });

        console.log(
          `✅ Optimistic message replaced with server message: ${result.data.id}`
        );
      } else {
        // 6. Mark as failed if send fails
        updateMessageStatus(
          conversationId,
          optimisticMessage.localId,
          "failed"
        );
        setError(result.error || "Failed to send message");
        console.error("❌ Failed to send message:", result.error);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      updateMessageStatus(conversationId, optimisticMessage.localId, "failed");
      setError("Failed to send message");
    }
  };

  const handleRetryMessage = async (failedMessage: Message) => {
    if (!user) return;

    console.log(
      `🔄 Retrying failed message: ${failedMessage.localId || failedMessage.id}`
    );

    // Update status to sending
    const messageId = failedMessage.localId || failedMessage.id;
    updateMessageStatus(conversationId, messageId, "sending");

    // If offline, add to queue
    if (isOffline) {
      console.log("📥 Device offline, adding retry to queue");
      await addToOfflineQueue(conversationId, {
        ...failedMessage,
        status: "sending",
        localId: failedMessage.localId || failedMessage.id,
      } as any);
      return;
    }

    // Try to send again
    try {
      const result = await sendMessage(
        conversationId,
        failedMessage.text,
        user.id,
        failedMessage.localId
      );

      if (result.success && result.data) {
        replaceOptimisticMessage(
          conversationId,
          failedMessage.localId || failedMessage.id,
          result.data
        );

        await updateLastMessage(conversationId, {
          text: failedMessage.text,
          senderId: user.id,
          senderName: user.displayName,
        });

        console.log(`✅ Successfully retried message: ${result.data.id}`);
      } else {
        updateMessageStatus(conversationId, messageId, "failed");
        setError(result.error || "Failed to send message");
        console.error("❌ Retry failed:", result.error);
      }
    } catch (err) {
      console.error("❌ Error retrying message:", err);
      updateMessageStatus(conversationId, messageId, "failed");
      setError("Failed to send message");
    }
  };

  // Get header info with real-time presence
  const getHeaderInfo = () => {
    if (!conversation) return { title: "Chat", subtitle: "" };

    if (conversation.type === "direct") {
      const otherUser = otherUserId
        ? conversation.participantDetails[otherUserId]
        : null;

      return {
        title: otherUser?.displayName || "Unknown User",
        subtitle: otherUserOnline
          ? "Online"
          : otherUserLastSeen
          ? `Last seen ${formatLastSeen(otherUserLastSeen)}`
          : "Offline",
      };
    } else {
      const memberCount = conversation.participants.length;
      return {
        title: conversation.groupName || "Group Chat",
        subtitle: `${memberCount} members`,
      };
    }
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Handle typing start
  const handleTypingStart = () => {
    if (user) {
      setUserTyping(conversationId, user.id, user.displayName);
    }
  };

  // Handle typing stop
  const handleTypingStop = () => {
    if (user) {
      clearUserTyping(conversationId, user.id);
    }
  };

  // Format typing indicator text
  const getTypingText = (): string => {
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  // Handle read status press
  const handleReadStatusPress = (message: Message) => {
    setSelectedMessage(message);
    setShowReadStatusModal(true);
  };

  const headerInfo = getHeaderInfo();

  if (!conversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Pressable
          style={styles.headerInfo}
          onPress={() => {
            if (conversation?.type === "group") {
              router.push(`/group/${conversationId}/info` as any);
            }
          }}
          disabled={conversation?.type !== "group"}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerInfo.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {headerInfo.subtitle}
          </Text>
        </Pressable>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {user && (
          <MessageList
            messages={conversationMessages}
            currentUserId={user.id}
            conversation={conversation}
            isLoading={isLoadingMessages}
            onRetry={handleRetryMessage}
            onReadStatusPress={handleReadStatusPress}
          />
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{getTypingText()}</Text>
          </View>
        )}
      </View>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        isSending={isSending}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />

      {/* Read Status Modal */}
      {conversation?.type === "group" && selectedMessage && (
        <Modal
          visible={showReadStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReadStatusModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowReadStatusModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Read By</Text>

              <FlatList
                data={selectedMessage.readBy
                  .map((userId) => conversation.participantDetails[userId])
                  .filter((user) => user)}
                renderItem={({ item }) => (
                  <View style={styles.readStatusItem}>
                    <Avatar
                      displayName={item.displayName}
                      photoURL={item.photoURL}
                      size={40}
                      showOnlineIndicator
                      isOnline={item.isOnline}
                    />
                    <View style={styles.readStatusInfo}>
                      <Text style={styles.readStatusName}>
                        {item.displayName}
                      </Text>
                      <Text style={styles.readStatusText}>Read</Text>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.displayName}
                contentContainerStyle={styles.modalList}
                ListEmptyComponent={
                  <View style={styles.emptyReadStatus}>
                    <Text style={styles.emptyReadStatusText}>
                      No one has read this message yet
                    </Text>
                  </View>
                }
              />

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowReadStatusModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: colors.error + "20",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.background,
  },
  typingText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  readStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  readStatusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  readStatusName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  readStatusText: {
    fontSize: 13,
    color: colors.success,
  },
  emptyReadStatus: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyReadStatusText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  modalCloseButton: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
