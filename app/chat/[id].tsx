/**
 * Chat Screen
 * Individual conversation screen with messages
 */

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import {
  markMessagesAsDelivered,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "@/services/chat";
import { updateLastMessage } from "@/services/conversations";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { colors } from "@/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
    setActiveConversation,
  } = useChatStore();

  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversationId = id!;
  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (!conversationId || !user) return;

    setActiveConversation(conversationId);

    // Mark messages as delivered when conversation opens
    markMessagesAsDelivered(conversationId, user.id);

    // Mark messages as read when viewing the conversation
    markMessagesAsRead(conversationId, user.id);

    // Subscribe to real-time messages
    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(conversationId, newMessages);
      setIsLoadingMessages(false);

      // Mark new messages as delivered and read when they arrive
      setTimeout(() => {
        markMessagesAsDelivered(conversationId, user.id);
        markMessagesAsRead(conversationId, user.id);
      }, 500);
    });

    // Cleanup
    return () => {
      unsubscribe();
      setActiveConversation(null);
    };
  }, [conversationId, user]);

  const handleSendMessage = async (text: string) => {
    if (!user || !conversation) return;

    setIsSending(true);
    setError(null);

    try {
      // Send message to Firestore
      const result = await sendMessage(conversationId, text, user.id);

      if (result.success && result.data) {
        // Update last message in conversation
        await updateLastMessage(conversationId, {
          text,
          senderId: user.id,
          senderName: user.displayName,
        });

        console.log("✅ Message sent successfully");
      } else {
        setError(result.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Get header info
  const getHeaderInfo = () => {
    if (!conversation) return { title: "Chat", subtitle: "" };

    if (conversation.type === "direct") {
      const otherUserId = conversation.participants.find(
        (id) => id !== user?.id
      );
      if (otherUserId) {
        const otherUser = conversation.participantDetails[otherUserId];
        return {
          title: otherUser?.displayName || "Unknown User",
          subtitle: otherUser?.isOnline
            ? "Online"
            : otherUser?.lastSeen
            ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
            : "Offline",
        };
      }
    } else {
      const memberCount = conversation.participants.length;
      return {
        title: conversation.groupName || "Group Chat",
        subtitle: `${memberCount} members`,
      };
    }

    return { title: "Chat", subtitle: "" };
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerInfo.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {headerInfo.subtitle}
          </Text>
        </View>
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
          />
        )}
      </View>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} isSending={isSending} />
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
});
