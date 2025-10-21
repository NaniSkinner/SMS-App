/**
 * Group Info Screen
 * Shows group details, members, and settings
 */

import { Avatar } from "@/components/common/Avatar";
import { subscribeToUserPresence } from "@/services/presence";
import { useChatStore } from "@/stores/chatStore";
import { colors } from "@/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GroupInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations } = useChatStore();
  const [memberPresence, setMemberPresence] = useState<
    Record<string, { isOnline: boolean; lastSeen: Date | null }>
  >({});

  const conversation = conversations.find((c) => c.id === id);

  useEffect(() => {
    if (!conversation) return;

    // Subscribe to presence for all members
    const unsubscribes: (() => void)[] = [];

    conversation.participants.forEach((userId) => {
      const unsubscribe = subscribeToUserPresence(
        userId,
        (isOnline, lastSeen) => {
          setMemberPresence((prev) => ({
            ...prev,
            [userId]: {
              isOnline,
              lastSeen,
            },
          }));
        }
      );
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [conversation]);

  if (!conversation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading group info...</Text>
      </View>
    );
  }

  if (conversation.type !== "group") {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>This is not a group conversation</Text>
      </View>
    );
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCreatorName = (): string => {
    if (!conversation.createdBy) return "Unknown";
    const creator = conversation.participantDetails[conversation.createdBy];
    return creator?.displayName || "Unknown";
  };

  const renderMember = ({ item }: { item: [string, any] }) => {
    const [userId, details] = item;
    const presence = memberPresence[userId] || {
      isOnline: details.isOnline,
      lastSeen: details.lastSeen,
    };

    return (
      <View style={styles.memberItem}>
        <Avatar
          displayName={details.displayName}
          photoURL={details.photoURL}
          size={48}
          showOnlineIndicator
          isOnline={presence.isOnline}
        />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{details.displayName}</Text>
          <Text style={styles.memberStatus}>
            {presence.isOnline ? "Online" : "Offline"}
          </Text>
        </View>
        {userId === conversation.createdBy && (
          <View style={styles.creatorBadge}>
            <Text style={styles.creatorBadgeText}>Creator</Text>
          </View>
        )}
      </View>
    );
  };

  const memberEntries = Object.entries(conversation.participantDetails);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Group Info</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Group Details */}
      <View style={styles.groupDetails}>
        <View style={styles.groupIcon}>
          <Text style={styles.groupIconText}>
            {conversation.groupName?.charAt(0).toUpperCase() || "G"}
          </Text>
        </View>
        <Text style={styles.groupName}>{conversation.groupName}</Text>
        <Text style={styles.groupMeta}>
          Created by {getCreatorName()} on {formatDate(conversation.createdAt)}
        </Text>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Members ({memberEntries.length})
        </Text>
        <FlatList
          data={memberEntries}
          renderItem={renderMember}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.membersList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  groupDetails: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  groupIcon: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  groupIconText: {
    fontSize: 48,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  groupMeta: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  section: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  membersList: {
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  creatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary + "20",
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.light.border,
    marginLeft: 60,
  },
});
