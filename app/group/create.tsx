/**
 * Create Group Screen
 * Multi-select users to create a group chat
 */

import { Avatar } from "@/components/common/Avatar";
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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();
  const { addConversation } = useChatStore();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreateGroup = async () => {
    if (!currentUser || isCreating) return;

    // Validation
    if (groupName.trim().length === 0) {
      setError("Please enter a group name");
      return;
    }

    if (selectedUsers.size < 2) {
      setError("Please select at least 2 other users");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Import the createGroupConversation function
      const { createGroupConversation } = await import(
        "@/services/conversations"
      );

      // Create array of participant IDs (selected users + current user)
      const participantIds = [currentUser.id, ...Array.from(selectedUsers)];

      const result = await createGroupConversation(
        participantIds,
        groupName.trim(),
        currentUser.id
      );

      if (result.success && result.data) {
        console.log("✅ Group created successfully:", result.data.id);

        // Add conversation to store BEFORE navigating
        addConversation(result.data);

        // Navigate to the new group chat
        router.replace(`/chat/${result.data.id}` as any);
      } else {
        setError(result.error || "Failed to create group");
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group");
      setIsCreating(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.has(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.userItem,
          pressed && styles.userItemPressed,
          isSelected && styles.userItemSelected,
        ]}
        onPress={() => toggleUserSelection(item.id)}
      >
        <View style={styles.checkbox}>
          {isSelected && <View style={styles.checkboxChecked} />}
        </View>

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
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  const canCreate = groupName.trim().length > 0 && selectedUsers.size >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Group</Text>
        <Pressable
          style={[
            styles.createButton,
            !canCreate && styles.createButtonDisabled,
          ]}
          onPress={handleCreateGroup}
          disabled={!canCreate || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.createButtonText,
                !canCreate && styles.createButtonTextDisabled,
              ]}
            >
              Create
            </Text>
          )}
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.groupNameSection}>
        <Text style={styles.sectionLabel}>Group Name</Text>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Enter group name..."
          placeholderTextColor={colors.light.textTertiary}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
          autoFocus
        />
      </View>

      <View style={styles.participantsSection}>
        <Text style={styles.sectionLabel}>
          Add Participants ({selectedUsers.size} selected)
        </Text>
        <Text style={styles.sectionSubtitle}>
          Select at least 2 people to create a group
        </Text>
      </View>

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
              Create more accounts to start a group chat
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: colors.light.inputBackground,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  createButtonTextDisabled: {
    color: colors.light.textTertiary,
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
  groupNameSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 4,
  },
  groupNameInput: {
    fontSize: 16,
    color: colors.light.textPrimary,
    backgroundColor: colors.light.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  participantsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
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
  userItemSelected: {
    backgroundColor: colors.primary + "10",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.light.border,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
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
    marginLeft: 88,
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
});
