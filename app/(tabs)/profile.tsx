/**
 * Profile Screen
 * User profile and settings
 */

import { signOut } from "@/services/auth";
import {
  disconnectCalendar,
  isCalendarConnected,
  useGoogleCalendarAuth,
} from "@/services/googleAuth";
import { updateUserProfile } from "@/services/user";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, clearUser, setUser } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [calendarConnected, setCalendarConnected] = React.useState(false);
  const [checkingCalendar, setCheckingCalendar] = React.useState(true);

  // Edit profile states
  const [showEditNameModal, setShowEditNameModal] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Popular emojis for avatar
  const emojiOptions = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "🤗",
    "🤩",
    "🤔",
    "🤨",
    "😐",
    "😑",
    "😶",
    "🙄",
    "😏",
    "😣",
    "😥",
    "😮",
    "🤐",
    "😯",
    "😪",
    "😫",
    "🥱",
    "😴",
    "😌",
    "😛",
    "😜",
    "😝",
    "🤤",
    "😒",
    "😓",
    "😔",
    "😕",
    "🙁",
    "😖",
    "😞",
    "😟",
    "😤",
    "😢",
    "😭",
    "😦",
    "😧",
    "😨",
    "😩",
    "🤯",
    "😬",
    "😰",
    "😱",
    "🥵",
    "🥶",
    "😳",
    "🤪",
    "😵",
    "🥴",
    "😠",
    "😡",
    "🤬",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🪱",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🪰",
    "🪲",
    "🪳",
    "🦟",
    "🦗",
    "🕷️",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐡",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    "🦈",
    "🐊",
    "🐅",
    "🐆",
    "🦓",
    "🦍",
    "🦧",
    "🦣",
    "🐘",
    "🦛",
    "🦏",
    "🐪",
    "🐫",
    "🦒",
    "🦘",
    "🦬",
    "🐃",
    "🐂",
    "🐄",
    "🐎",
    "🐖",
    "🐏",
    "🐑",
    "🦙",
    "🐐",
    "🦌",
    "🐕",
    "🐩",
    "🦮",
    "🐕‍🦺",
    "🐈",
    "🐈‍⬛",
    "🪶",
    "🐓",
    "🦃",
    "🦤",
    "🦚",
    "🦜",
    "🦢",
    "🦩",
    "🕊️",
    "🐇",
    "🦝",
    "🦨",
    "🦡",
    "🦫",
    "🦦",
    "🦥",
    "🐁",
    "🐀",
    "🐿️",
    "🦔",
    "🐾",
    "🐉",
    "🐲",
    "🌵",
    "🎄",
    "🌲",
    "🌳",
    "🌴",
    "🪵",
    "🌱",
    "🌿",
    "☘️",
    "🍀",
    "🎍",
    "🪴",
    "🎋",
    "🍃",
    "🍂",
    "🍁",
    "🍄",
    "🐚",
    "🪨",
    "🌾",
    "💐",
    "🌷",
    "🌹",
    "🥀",
    "🌺",
    "🌸",
    "🌼",
    "🌻",
    "🌞",
    "🌝",
    "🌛",
    "🌜",
    "🌚",
    "🌕",
    "🌖",
    "🌗",
    "🌘",
    "🌑",
    "🌒",
    "🌓",
    "🌔",
    "🌙",
    "🌎",
    "🌍",
    "🌏",
    "🪐",
    "💫",
    "⭐",
    "🌟",
    "✨",
    "⚡",
    "☄️",
    "💥",
    "🔥",
    "🌪️",
    "🌈",
    "☀️",
    "🌤️",
    "⛅",
    "🌥️",
    "☁️",
    "🌦️",
    "🌧️",
    "⛈️",
    "🌩️",
    "🌨️",
    "❄️",
    "☃️",
    "⛄",
    "🌬️",
    "💨",
    "💧",
    "💦",
    "☔",
    "☂️",
    "🌊",
    "🌫️",
  ];

  // Google Calendar OAuth hook
  const { promptAsync, isLoading: isAuthLoading } = useGoogleCalendarAuth();

  // Check calendar connection status on mount
  useEffect(() => {
    checkCalendarConnection();
  }, []);

  const checkCalendarConnection = async () => {
    setCheckingCalendar(true);
    const connected = await isCalendarConnected();
    setCalendarConnected(connected);
    setCheckingCalendar(false);
  };

  const handleConnectCalendar = async () => {
    try {
      const result = await promptAsync();

      if (result?.type === "success") {
        Alert.alert(
          "✅ Calendar Connected",
          "Your Google Calendar has been connected successfully!",
          [{ text: "OK", onPress: () => checkCalendarConnection() }]
        );
      } else if (result?.type === "error") {
        Alert.alert(
          "❌ Connection Failed",
          "Failed to connect Google Calendar. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      Alert.alert(
        "❌ Error",
        "An error occurred while connecting your calendar.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDisconnectCalendar = async () => {
    Alert.alert(
      "Disconnect Calendar",
      "Are you sure you want to disconnect your Google Calendar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await disconnectCalendar();
              setCalendarConnected(false);
              Alert.alert(
                "✅ Disconnected",
                "Your Google Calendar has been disconnected. You can reconnect anytime.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Error disconnecting calendar:", error);
              Alert.alert(
                "❌ Error",
                "Failed to disconnect calendar. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleResetConnection = async () => {
    Alert.alert(
      "🔄 Reset Calendar Connection",
      "This will clear your calendar connection and let you reconnect with fresh credentials. Use this if you're having connection issues.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset & Reconnect",
          onPress: async () => {
            try {
              // First disconnect to clear stale tokens
              await disconnectCalendar();
              setCalendarConnected(false);

              // Wait a moment for cleanup
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Then immediately reconnect
              const result = await promptAsync();

              if (result?.type === "success") {
                Alert.alert(
                  "✅ Connection Reset!",
                  "Your Google Calendar has been reconnected successfully!",
                  [{ text: "OK", onPress: () => checkCalendarConnection() }]
                );
              } else if (result?.type === "error") {
                Alert.alert(
                  "❌ Connection Failed",
                  "Failed to reconnect. Please try connecting again from the button.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Error resetting connection:", error);
              Alert.alert(
                "❌ Error",
                "Failed to reset connection. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleEditName = () => {
    setEditedName(user?.displayName || "");
    setShowEditNameModal(true);
  };

  const handleSaveName = async () => {
    if (!user || !editedName.trim()) return;

    setIsUpdating(true);
    const result = await updateUserProfile(user.id, {
      displayName: editedName.trim(),
    });

    if (result.success) {
      // Update local user state
      setUser({ ...user, displayName: editedName.trim() });
      setShowEditNameModal(false);
      Alert.alert("✅ Success", "Display name updated successfully!");
    } else {
      Alert.alert("❌ Error", result.error || "Failed to update display name");
    }

    setIsUpdating(false);
  };

  const handleSelectEmoji = async (emoji: string) => {
    if (!user) return;

    setIsUpdating(true);
    const result = await updateUserProfile(user.id, {
      photoURL: emoji,
    });

    if (result.success) {
      // Update local user state
      setUser({ ...user, photoURL: emoji });
      setShowEmojiPicker(false);
      Alert.alert("✅ Success", "Avatar updated successfully!");
    } else {
      Alert.alert("❌ Error", result.error || "Failed to update avatar");
    }

    setIsUpdating(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your avatar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsUpdating(true);
            const result = await updateUserProfile(user.id, {
              photoURL: null,
            });

            if (result.success) {
              setUser({ ...user, photoURL: undefined });
              Alert.alert("✅ Success", "Avatar removed successfully!");
            } else {
              Alert.alert(
                "❌ Error",
                result.error || "Failed to remove avatar"
              );
            }

            setIsUpdating(false);
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const result = await signOut();
          setLoading(false);

          if (result.success) {
            clearUser();
            // Navigation will be handled by root layout
          } else {
            Alert.alert("Error", result.error || "Failed to sign out");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar with Edit Button */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowEmojiPicker(true)}
          disabled={isUpdating}
        >
          <View style={styles.avatar}>
            {user?.photoURL ? (
              <Text style={styles.avatarEmoji}>{user.photoURL}</Text>
            ) : (
              <Text style={styles.avatarText}>
                {user?.displayName && user.displayName.length > 0
                  ? user.displayName.charAt(0).toUpperCase()
                  : "U"}
              </Text>
            )}
          </View>
          <View style={styles.editAvatarBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* User Info with Edit Button */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user?.displayName || "User"}</Text>
          <TouchableOpacity
            onPress={handleEditName}
            disabled={isUpdating}
            style={styles.editNameButton}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.email}>{user?.email || "No email"}</Text>

        {/* Calendar Integration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar Integration</Text>

          {/* Calendar Status Card */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Ionicons
                name={calendarConnected ? "calendar" : "calendar-outline"}
                size={24}
                color={
                  calendarConnected
                    ? colors.primary
                    : colors.light.textSecondary
                }
              />
              <View style={styles.calendarHeaderText}>
                <Text style={styles.calendarStatusTitle}>Google Calendar</Text>
                <Text style={styles.calendarStatusText}>
                  {checkingCalendar
                    ? "Checking connection..."
                    : calendarConnected
                    ? "✅ Connected"
                    : "Not connected"}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {!calendarConnected && !checkingCalendar ? (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectCalendar}
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="link" size={18} color="#fff" />
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : calendarConnected ? (
              <View style={styles.calendarActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetConnection}
                >
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnectCalendar}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.light.error}
                  />
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {calendarConnected && (
            <Text style={styles.calendarHint}>
              💡 Use AI Assistant to create events, check your schedule, and
              detect conflicts
            </Text>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, loading && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditNameModal(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Display Name</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor={colors.light.textTertiary}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditNameModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!editedName.trim() || isUpdating) && styles.buttonDisabled,
                ]}
                onPress={handleSaveName}
                disabled={!editedName.trim() || isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.emojiModalContainer}>
          <View style={styles.emojiModalContent}>
            <View style={styles.emojiModalHeader}>
              <Text style={styles.emojiModalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.light.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.emojiGrid}
              contentContainerStyle={styles.emojiGridContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.emojiRowContainer}>
                {emojiOptions.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiItem,
                      user?.photoURL === emoji && styles.emojiItemSelected,
                    ]}
                    onPress={() => handleSelectEmoji(emoji)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {user?.photoURL && (
              <TouchableOpacity
                style={styles.removeAvatarButton}
                onPress={handleRemoveAvatar}
                disabled={isUpdating}
              >
                <Text style={styles.removeAvatarButtonText}>Remove Avatar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  avatarEmoji: {
    fontSize: 60,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.light.background,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.textPrimary,
  },
  editNameButton: {
    padding: 4,
  },
  email: {
    fontSize: 16,
    color: colors.light.textSecondary,
    marginBottom: 32,
  },
  section: {
    width: "100%",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: colors.light.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  calendarHeaderText: {
    flex: 1,
  },
  calendarStatusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  calendarStatusText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  calendarActions: {
    flexDirection: "row",
    gap: 8,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.light.background,
    flex: 1,
    justifyContent: "center",
  },
  resetButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.error,
    backgroundColor: colors.light.background,
    flex: 1,
    justifyContent: "center",
  },
  disconnectButtonText: {
    fontSize: 13,
    color: colors.light.error,
    fontWeight: "600",
  },
  calendarHint: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  signOutButton: {
    backgroundColor: colors.light.error,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 150,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.light.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.light.textPrimary,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.light.inputBackground,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emojiModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  emojiModalContent: {
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    height: "80%",
  },
  emojiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  emojiModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    padding: 16,
  },
  emojiRowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  emojiItem: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 12,
  },
  emojiItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "20",
  },
  emojiText: {
    fontSize: 32,
  },
  removeAvatarButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.light.error + "20",
    borderWidth: 1,
    borderColor: colors.light.error,
    alignItems: "center",
  },
  removeAvatarButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.error,
  },
});
