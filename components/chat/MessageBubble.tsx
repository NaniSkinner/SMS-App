/**
 * MessageBubble Component
 * Displays a single message with proper styling and status
 */

import { Avatar } from "@/components/common/Avatar";
import { colors } from "@/theme/colors";
import { Message } from "@/types";
import React, { useEffect, useRef } from "react";
import {
  ActionSheetIOS,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderPhotoURL?: string;
  onRetry?: (message: Message) => void;
  isGroupChat?: boolean;
  totalParticipants?: number;
  onReadStatusPress?: (message: Message) => void;
  onAnalyzeWithAI?: (message: Message) => void; // NEW: Callback for AI analysis
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = false,
  senderName,
  senderPhotoURL,
  onRetry,
  isGroupChat = false,
  totalParticipants = 0,
  onReadStatusPress,
  onAnalyzeWithAI,
}) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Slide and fade in animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Check if this is a system message
  const isSystemMessage = message.senderId === "system";

  // For group chats, determine if all members have read
  const allMembersRead =
    isGroupChat && totalParticipants > 0
      ? message.readBy.length >= totalParticipants
      : false;

  // Format timestamp
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Get status icon
  const getStatusIcon = (): string => {
    switch (message.status) {
      case "sending":
        return "○"; // Circle for sending
      case "sent":
        return "✓"; // Single check
      case "delivered":
        return "✓✓"; // Double check
      case "read":
        return "✓✓"; // Double check (blue in styling)
      case "failed":
        return "!"; // Exclamation
      default:
        return "";
    }
  };

  // Handle long press - show action sheet with AI analysis option
  const handleLongPress = () => {
    if (Platform.OS === "ios") {
      const options = [
        "Copy",
        "Analyze with AI 🤖", // NEW: AI analysis
        "Delete",
        "Cancel",
      ];
      const destructiveButtonIndex = 2;
      const cancelButtonIndex = 3;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: "Message Actions",
        },
        (buttonIndex: number) => {
          if (buttonIndex === 0) {
            // Copy (could implement clipboard)
            console.log("Copy message:", message.text);
          } else if (buttonIndex === 1) {
            // Analyze with AI
            if (onAnalyzeWithAI) {
              console.log("🤖 Analyzing message with AI:", message.id);
              onAnalyzeWithAI(message);
            }
          } else if (buttonIndex === 2) {
            // Delete (could implement)
            console.log("Delete message:", message.id);
          }
        }
      );
    }
  };

  // Render system message
  if (isSystemMessage) {
    return (
      <Animated.View
        style={[
          styles.systemMessageContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.systemMessageBubble}>
          <Text style={styles.systemMessageText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isOwnMessage ? styles.containerOwn : styles.containerOther,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: isOwnMessage
                ? slideAnim
                : Animated.multiply(slideAnim, -1),
            },
          ],
        },
      ]}
    >
      {/* Avatar for received group messages */}
      {!isOwnMessage && showAvatar && (
        <View style={styles.avatarContainer}>
          <Avatar
            displayName={senderName || "User"}
            photoURL={senderPhotoURL}
            size={32}
          />
        </View>
      )}

      {/* Spacer when no avatar needed in groups (left side) */}
      {!isOwnMessage && isGroupChat && !showAvatar && (
        <View style={styles.avatarSpacer} />
      )}

      <View
        style={[
          styles.bubbleContainer,
          isOwnMessage && styles.bubbleContainerOwn,
        ]}
      >
        {/* Sender name for group messages (all messages) */}
        {isGroupChat && senderName && (
          <Text
            style={[styles.senderName, isOwnMessage && styles.senderNameOwn]}
          >
            {senderName}
          </Text>
        )}

        {/* Message bubble - with long press for AI analysis */}
        <Pressable
          onLongPress={onAnalyzeWithAI ? handleLongPress : undefined}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.bubble,
            isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
            message.status === "failed" && styles.bubbleFailed,
            pressed && styles.bubblePressed,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {message.text}
          </Text>

          {/* Timestamp and status */}
          <Pressable
            style={styles.metaContainer}
            onPress={() => {
              if (isGroupChat && isOwnMessage && onReadStatusPress) {
                onReadStatusPress(message);
              }
            }}
            disabled={!isGroupChat || !isOwnMessage || !onReadStatusPress}
          >
            <Text
              style={[
                styles.timestamp,
                isOwnMessage ? styles.timestampOwn : styles.timestampOther,
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>

            {isOwnMessage && (
              <Text
                style={[
                  styles.statusIcon,
                  (message.status === "read" || allMembersRead) &&
                    styles.statusIconRead,
                  message.status === "failed" && styles.statusIconFailed,
                ]}
              >
                {getStatusIcon()}
              </Text>
            )}
          </Pressable>
        </Pressable>

        {/* Failed message indicator with retry button */}
        {message.status === "failed" && onRetry && (
          <Pressable
            onPress={() => onRetry(message)}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.failedText}>⟲ Tap to retry</Text>
          </Pressable>
        )}
      </View>

      {/* Avatar for own group messages (right side) */}
      {isOwnMessage && showAvatar && (
        <View style={styles.avatarContainerOwn}>
          <Avatar
            displayName={senderName || "User"}
            photoURL={senderPhotoURL}
            size={32}
          />
        </View>
      )}

      {/* Spacer when no avatar needed in groups (right side) */}
      {isOwnMessage && isGroupChat && !showAvatar && (
        <View style={styles.avatarSpacer} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  containerOwn: {
    justifyContent: "flex-end",
  },
  containerOther: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  avatarContainerOwn: {
    marginRight: 0,
    marginLeft: 8,
  },
  avatarSpacer: {
    width: 40,
  },
  bubbleContainer: {
    maxWidth: "70%",
  },
  bubbleContainerOwn: {
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.light.textSecondary,
    marginBottom: 2,
    marginLeft: 12,
  },
  senderNameOwn: {
    marginLeft: 0,
    marginRight: 12,
    textAlign: "right",
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.light.inputBackground,
    borderBottomLeftRadius: 4,
  },
  bubbleFailed: {
    backgroundColor: colors.error + "20",
    borderWidth: 1,
    borderColor: colors.error,
  },
  bubblePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: colors.light.textPrimary,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  timestampOwn: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  timestampOther: {
    color: colors.light.textTertiary,
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  statusIconRead: {
    color: "#4ADE80", // Green for read (better visibility on blue)
  },
  statusIconFailed: {
    color: colors.error,
  },
  failedText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 2,
    fontStyle: "italic",
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.error + "10",
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  systemMessageBubble: {
    backgroundColor: colors.light.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  systemMessageText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
