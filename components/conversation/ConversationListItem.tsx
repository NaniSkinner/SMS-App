/**
 * ConversationListItem Component
 * Displays a single conversation in the chat list with real-time presence
 */

import { Avatar } from "@/components/common/Avatar";
import { subscribeToUserPresence } from "@/services/presence";
import { colors } from "@/theme/colors";
import { Conversation } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  unreadCount?: number;
  onDeleteMessages?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  unreadCount = 0,
  onDeleteMessages,
  onDeleteConversation,
}) => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation for unread badge
  useEffect(() => {
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(badgeScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      badgeScale.setValue(1);
    }
  }, [unreadCount]);

  // Get the other user's details (for direct conversations)
  const getOtherUser = () => {
    if (conversation.type === "direct") {
      const otherUserId = conversation.participants.find(
        (id) => id !== currentUserId
      );
      if (otherUserId) {
        return {
          ...conversation.participantDetails[otherUserId],
          userId: otherUserId,
        };
      }
    }
    return null;
  };

  const otherUser = getOtherUser();

  // Subscribe to real-time presence for the other user (direct chats only)
  useEffect(() => {
    if (!otherUser || conversation.type !== "direct") return;

    const unsubscribe = subscribeToUserPresence(
      otherUser.userId,
      (online, lastSeenDate) => {
        setIsOnline(online);
        setLastSeen(lastSeenDate);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [otherUser?.userId, conversation.type]);

  // Determine display name
  const displayName =
    conversation.type === "group"
      ? conversation.groupName || "Group Chat"
      : otherUser?.displayName || "Unknown User";

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d`;

    // Format as date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Truncate message preview
  const truncateText = (text: string, maxLength: number = 40): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handlePress = () => {
    router.push(`/chat/${conversation.id}`);
  };

  const handleLongPress = () => {
    setShowActionModal(true);
  };

  const handleDeleteMessages = () => {
    setShowActionModal(false);
    Alert.alert(
      "Delete All Messages",
      `Are you sure you want to delete all messages in this conversation? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDeleteMessages) {
              onDeleteMessages(conversation.id);
            }
          },
        },
      ]
    );
  };

  const handleDeleteConversation = () => {
    setShowActionModal(false);
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete this conversation? It will be removed from your chat list. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDeleteConversation) {
              onDeleteConversation(conversation.id);
            }
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <Avatar
          displayName={displayName}
          photoURL={
            conversation.type === "direct" ? otherUser?.photoURL : undefined
          }
          size={48}
          showOnlineIndicator={conversation.type === "direct"}
          isOnline={isOnline}
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text
              style={[styles.name, unreadCount > 0 && styles.nameUnread]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {conversation.lastMessage && (
              <Text style={styles.timestamp}>
                {formatTimestamp(conversation.lastMessage.timestamp)}
              </Text>
            )}
          </View>

          <View style={styles.bottomRow}>
            {conversation.lastMessage ? (
              <Text
                style={[
                  styles.lastMessage,
                  unreadCount > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {conversation.type === "group" &&
                  conversation.lastMessage.senderId !== currentUserId &&
                  `${conversation.lastMessage.senderName}: `}
                {truncateText(conversation.lastMessage.text)}
              </Text>
            ) : (
              <Text style={styles.noMessages}>No messages yet</Text>
            )}

            {unreadCount > 0 && (
              <Animated.View
                style={[
                  styles.unreadBadge,
                  { transform: [{ scale: badgeScale }] },
                ]}
              >
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </Pressable>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable
          style={styles.actionModalOverlay}
          onPress={() => setShowActionModal(false)}
        >
          <Pressable style={styles.actionModalContent}>
            <TouchableOpacity
              style={[styles.actionModalButton, styles.actionModalButtonFirst]}
              onPress={handleDeleteMessages}
            >
              <Text style={styles.actionModalButtonTextDelete}>
                Delete All Messages
              </Text>
            </TouchableOpacity>

            <View style={styles.actionModalDivider} />

            <TouchableOpacity
              style={styles.actionModalButton}
              onPress={handleDeleteConversation}
            >
              <Text style={styles.actionModalButtonTextDelete}>
                Delete Conversation
              </Text>
            </TouchableOpacity>

            <View style={styles.actionModalDivider} />

            <TouchableOpacity
              style={[
                styles.actionModalButton,
                styles.actionModalButtonLast,
                styles.actionModalButtonCancel,
              ]}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.actionModalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  pressed: {
    backgroundColor: colors.light.inputBackground,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: colors.light.textPrimary,
    fontWeight: "400",
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 13,
    color: colors.light.textTertiary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: colors.light.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: colors.light.textPrimary,
    fontWeight: "500",
  },
  noMessages: {
    fontSize: 14,
    color: colors.light.textTertiary,
    fontStyle: "italic",
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 14,
    width: "80%",
    maxWidth: 300,
    overflow: "hidden",
  },
  actionModalButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionModalButtonFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  actionModalButtonLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  actionModalButtonDelete: {
    backgroundColor: colors.light.background,
  },
  actionModalButtonCancel: {
    backgroundColor: colors.light.background,
  },
  actionModalButtonTextDelete: {
    fontSize: 17,
    color: colors.light.error,
    fontWeight: "600",
  },
  actionModalButtonTextCancel: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: "400",
  },
  actionModalDivider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
});
