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
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, clearUser } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [calendarConnected, setCalendarConnected] = React.useState(false);
  const [checkingCalendar, setCheckingCalendar] = React.useState(true);

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
      <View style={styles.content}>
        {/* Avatar Placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName && user.displayName.length > 0
              ? user.displayName.charAt(0).toUpperCase()
              : "U"}
          </Text>
        </View>

        {/* User Info */}
        <Text style={styles.name}>{user?.displayName || "User"}</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.textPrimary,
    marginBottom: 4,
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
});
