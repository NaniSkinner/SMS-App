/**
 * Chats Screen (Main Tab)
 * Displays list of conversations
 */

import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatsScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.subtitle}>Welcome, {user?.displayName}!</Text>
      <Text style={styles.text}>Your conversations will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.light.textSecondary,
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: colors.light.textTertiary,
    textAlign: "center",
  },
});
