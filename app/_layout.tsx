/**
 * Root Layout
 * Handles authentication state and navigation
 */

import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { Stack, router, usePathname, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    console.log("🧭 Navigation check:", {
      isAuthenticated,
      isLoading,
      pathname,
    });

    if (isLoading) return;

    // Check if we're in an auth route
    const inAuthGroup =
      pathname?.startsWith("/login") || pathname?.startsWith("/register");

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log("➡️ Redirecting to login (not authenticated)");
      // @ts-ignore - expo-router typed routes issue
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      console.log("➡️ Redirecting to main app (authenticated)");
      // @ts-ignore - expo-router typed routes issue
      router.replace("/(tabs)/");
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Show loading screen while checking auth
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
