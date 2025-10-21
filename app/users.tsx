/**
 * User Picker Screen
 * Select a user to start a new conversation
 */

import { Avatar } from "@/components/common/Avatar";
import { getOrCreateConversation } from "@/services/conversations";
import { getAllUsers } from "@/services/user";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { colors } from "@/theme/colors";
import { User } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function UsersScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { addConversation } = useChatStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    const result = await getAllUsers(currentUser.id);

    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      setError(result.error || "Failed to load users");
    }

    setIsLoading(false);
  };

  const handleUserSelect = async (selectedUser: User) => {
    if (!currentUser || isCreatingConversation) return;

    setIsCreatingConversation(true);

    try {
      // Get or create conversation with selected user
      const result = await getOrCreateConversation(
        currentUser.id,
        selectedUser.id
      );

      if (result.success && result.data) {
        console.log("✅ Conversation ready, adding to store and navigating...");

        // Add conversation to store first
        addConversation(result.data);

        // Navigate to the conversation
        router.push(`/chat/${result.data.id}`);
      } else {
        setError(result.error || "Failed to create conversation");
        setIsCreatingConversation(false);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation");
      setIsCreatingConversation(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      style={({ pressed }) => [
        styles.userItem,
        pressed && styles.userItemPressed,
      ]}
      onPress={() => handleUserSelect(item)}
      disabled={isCreatingConversation}
    >
      <Avatar
        displayName={item.displayName}
        photoURL={item.photoURL}
        size={48}
        showOnlineIndicator
        isOnline={item.isOnline}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      {item.isOnline && (
        <View style={styles.onlineStatus}>
          <Text style={styles.onlineText}>Online</Text>
        </View>
      )}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadUsers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select User</Text>
        <Text style={styles.headerSubtitle}>Start a new conversation</Text>
      </View>

      {isCreatingConversation && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Creating conversation...</Text>
        </View>
      )}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              Create more accounts to start chatting
            </Text>
          </View>
        }
      />
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  listContent: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.light.background,
  },
  userItemPressed: {
    backgroundColor: colors.light.inputBackground,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  onlineStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.success + "20",
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.success,
  },
  separator: {
    height: 1,
    backgroundColor: colors.light.border,
    marginLeft: 76,
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
