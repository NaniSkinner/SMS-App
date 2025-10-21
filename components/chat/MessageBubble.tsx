/**
 * MessageBubble Component
 * Displays a single message with proper styling and status
 */

import { Avatar } from "@/components/common/Avatar";
import { colors } from "@/theme/colors";
import { Message } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderPhotoURL?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = false,
  senderName,
  senderPhotoURL,
}) => {
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

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && showAvatar && (
        <View style={styles.avatarContainer}>
          <Avatar
            displayName={senderName || "User"}
            photoURL={senderPhotoURL}
            size={32}
          />
        </View>
      )}

      {/* Spacer when no avatar needed */}
      {!isOwnMessage && !showAvatar && <View style={styles.avatarSpacer} />}

      <View
        style={[
          styles.bubbleContainer,
          isOwnMessage && styles.bubbleContainerOwn,
        ]}
      >
        {/* Sender name for group messages */}
        {!isOwnMessage && senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}

        {/* Message bubble */}
        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
            message.status === "failed" && styles.bubbleFailed,
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
          <View style={styles.metaContainer}>
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
                  message.status === "read" && styles.statusIconRead,
                  message.status === "failed" && styles.statusIconFailed,
                ]}
              >
                {getStatusIcon()}
              </Text>
            )}
          </View>
        </View>

        {/* Failed message indicator */}
        {message.status === "failed" && (
          <Text style={styles.failedText}>Tap to retry</Text>
        )}
      </View>
    </View>
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
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
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
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statusIconRead: {
    color: "#4FC3F7", // Light blue for read
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
});
