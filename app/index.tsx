/**
 * Root Index
 * Redirects to appropriate route based on auth state
 */

import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    console.log("📍 Index page - Auth state:", {
      isAuthenticated,
      isLoading,
    });
  }, [isAuthenticated, isLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.light.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    console.log("➡️ Index: Redirecting to tabs (authenticated)");
    return <Redirect href="/(tabs)" />;
  } else {
    console.log("➡️ Index: Redirecting to login (not authenticated)");
    return <Redirect href="/(auth)/login" />;
  }
}
