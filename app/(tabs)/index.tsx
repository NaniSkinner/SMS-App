/**
 * Chats Screen (Main Tab)
 * Displays list of conversations
 */

import { ConversationListItem } from "@/components/conversation/ConversationListItem";
import { cacheConversations, getCachedConversations } from "@/services/cache";
import {
  getConversations,
  subscribeToUserConversations,
} from "@/services/conversations";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { colors } from "@/theme/colors";
import { Conversation } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, setConversations } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let hasLoadedCache = false;

    // Load cached conversations first
    const loadCached = async () => {
      const cached = await getCachedConversations();
      if (cached.length > 0 && !hasLoadedCache) {
        hasLoadedCache = true;
        setConversations(cached);
        setIsLoading(false);
        console.log(
          `📂 Loaded ${cached.length} cached conversations instantly`
        );
      }
    };

    loadCached();

    // Load fresh conversations from server
    loadConversations();
  }, [user]);

  // Subscribe to real-time unread count updates
  useEffect(() => {
    if (!user) return;

    console.log(
      `📡 Setting up real-time unread count subscription for user ${user.id}`
    );

    const unsubscribe = subscribeToUserConversations(
      user.id,
      (updatedCounts) => {
        setUnreadCounts(updatedCounts);
      }
    );

    return () => {
      console.log("🔌 Unsubscribing from unread count updates");
      unsubscribe();
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    setError(null);
    const result = await getConversations(user.id);

    if (result.success && result.data) {
      setConversations(result.data);
      // Cache the conversations
      await cacheConversations(result.data);

      // Note: Unread counts are handled by real-time subscription
    } else {
      setError(result.error || "Failed to load conversations");
    }

    setIsLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  }, [user]);

  const handleNewChat = () => {
    router.push("/users");
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    if (!user) return null;
    return (
      <ConversationListItem
        conversation={item}
        currentUserId={user.id}
        unreadCount={unreadCounts[item.id] || 0}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={
          conversations.length === 0 && styles.emptyListContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Conversations Yet</Text>
            <Text style={styles.emptyText}>
              Start a new conversation by tapping the button below
            </Text>
            <Pressable style={styles.emptyButton} onPress={handleNewChat}>
              <Text style={styles.emptyButtonText}>Start Chatting</Text>
            </Pressable>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleNewChat}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
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
  errorBanner: {
    backgroundColor: colors.error + "20",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
  fabText: {
    fontSize: 32,
    fontWeight: "300",
    color: "#FFFFFF",
    lineHeight: 36,
  },
});
