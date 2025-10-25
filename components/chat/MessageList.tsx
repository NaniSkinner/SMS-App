/**
 * MessageList Component
 * Displays list of messages with auto-scroll and date separators
 */

import { MessageBubble } from "@/components/chat/MessageBubble";
import { colors } from "@/theme/colors";
import { Conversation, Message } from "@/types";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversation: Conversation;
  isLoading?: boolean;
  onRetry?: (message: Message) => void;
  onReadStatusPress?: (message: Message) => void;
  onAnalyzeWithAI?: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  conversation,
  isLoading = false,
  onRetry,
  onReadStatusPress,
  onAnalyzeWithAI,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Format date separator
  const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  // Check if we need a date separator
  const shouldShowDateSeparator = (
    currentMessage: Message,
    previousMessage?: Message
  ): boolean => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() !== previousDate.getTime();
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const previousMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

    // Get sender details for group messages (for all messages in groups, not just received)
    const senderDetails =
      conversation.type === "group"
        ? conversation.participantDetails[item.senderId]
        : undefined;

    // Show avatar for the last message in a group from each sender (including own messages)
    const nextMessage =
      index < messages.length - 1 ? messages[index + 1] : undefined;
    const showAvatar =
      conversation.type === "group" &&
      (!nextMessage || nextMessage.senderId !== item.senderId);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.timestamp)}
            </Text>
          </View>
        )}
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showAvatar={showAvatar}
          senderName={senderDetails?.displayName}
          senderPhotoURL={senderDetails?.photoURL}
          onRetry={onRetry}
          isGroupChat={conversation.type === "group"}
          totalParticipants={conversation.participants.length}
          onReadStatusPress={onReadStatusPress}
          onAnalyzeWithAI={onAnalyzeWithAI}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item, index) =>
        item.localId || item.id || `message-${index}`
      }
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Send a message to start the conversation
          </Text>
        </View>
      }
      onContentSizeChange={() => {
        // Auto-scroll when content size changes
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 12,
    paddingBottom: 80, // Extra padding for input area
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.light.textTertiary,
    textAlign: "center",
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.light.textTertiary,
    backgroundColor: colors.light.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
