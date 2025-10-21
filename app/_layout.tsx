/**
 * Root Layout
 * Handles authentication state, navigation, and presence monitoring
 */

import {
  getLastNotificationResponse,
  registerForPushNotifications,
  setupNotificationReceivedListener,
  setupNotificationResponseListener,
} from "@/services/notifications";
import {
  setUserOffline,
  setUserOnline,
  updatePresenceHeartbeat,
} from "@/services/presence";
import { updateActiveConversation } from "@/services/user";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { Stack, router, usePathname, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  View,
} from "react-native";

export default function RootLayout() {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const appState = useRef(AppState.currentState);
  const heartbeatInterval = useRef<number | null>(null);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle notification that opened the app from killed state
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLastNotification = async () => {
      const lastResponse = await getLastNotificationResponse();
      if (lastResponse) {
        console.log("📱 App opened via notification:", lastResponse);
        const data = lastResponse.notification.request.content.data;

        // Navigate to the conversation after a short delay to ensure navigation is ready
        if (data.conversationId) {
          setTimeout(() => {
            console.log("➡️ Navigating to conversation:", data.conversationId);
            router.push(`/chat/${data.conversationId}`);
          }, 1000);
        }
      }
    };

    checkLastNotification();
  }, [isAuthenticated]);

  // Monitor app state and update presence
  useEffect(() => {
    if (!user) return;

    // Set user online when authenticated (with error handling)
    const initializePresence = async () => {
      try {
        await setUserOnline(user.id);
        console.log("✅ User presence initialized");
      } catch (error) {
        console.error("⚠️ Failed to initialize presence:", error);
        // Continue anyway - presence is not critical for app function
      }
    };

    // Register for push notifications
    const initializePushNotifications = async () => {
      try {
        const token = await registerForPushNotifications(user.id);
        if (token) {
          console.log("✅ Push notifications registered");
        } else {
          console.log(
            "ℹ️ Push notifications not available (simulator or permission denied)"
          );
        }
      } catch (error) {
        console.error("⚠️ Failed to register push notifications:", error);
        // Continue anyway - notifications are not critical for app function
      }
    };

    initializePresence();
    initializePushNotifications();

    // Start heartbeat (every 30 seconds)
    heartbeatInterval.current = setInterval(async () => {
      if (appState.current === "active") {
        try {
          await updatePresenceHeartbeat(user.id);
        } catch (error) {
          console.error("⚠️ Heartbeat failed:", error);
          // Silently fail - will retry on next interval
        }
      }
    }, 30000) as unknown as number; // 30 seconds

    // Listen to app state changes
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        const previousState = appState.current;
        appState.current = nextAppState;

        if (
          previousState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground
          console.log("🟢 App foregrounded - setting user online");
          try {
            await setUserOnline(user.id);
          } catch (error) {
            console.error("⚠️ Failed to set online:", error);
          }
        } else if (
          previousState === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // App went to background
          console.log("🔴 App backgrounded - setting user offline");
          try {
            await setUserOffline(user.id);
            // CRITICAL: Clear active conversation so notifications work when backgrounded
            await updateActiveConversation(user.id, null);
            console.log("✅ Cleared active conversation for notifications");
          } catch (error) {
            console.error("⚠️ Failed to set offline:", error);
          }
        }
      }
    );

    // Setup notification listeners
    // Listen for notifications received while app is in foreground
    const notificationListener = setupNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification received in foreground:", notification);
        // Notification will be displayed by the system
        // We don't need to do anything here - the badge and sound are automatic
      }
    );

    // Listen for notification taps (background or foreground)
    const responseListener = setupNotificationResponseListener((response) => {
      console.log("📱 Notification tapped:", response);
      const data = response.notification.request.content.data;

      // Navigate to the conversation
      if (data.conversationId) {
        console.log("➡️ Navigating to conversation:", data.conversationId);
        router.push(`/chat/${data.conversationId}`);
      }
    });

    // Cleanup
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      subscription.remove();
      notificationListener.remove();
      responseListener.remove();
      // Set offline when unmounting (fire and forget)
      setUserOffline(user.id).catch((error) => {
        console.error("⚠️ Failed to set offline on cleanup:", error);
      });
    };
  }, [user]);

  // Handle navigation based on auth state changes (not initial load)
  useEffect(() => {
    if (isLoading) return;

    console.log("🧭 Navigation check:", {
      isAuthenticated,
      pathname,
      segments: segments.join("/"),
    });

    // Only redirect if auth state changes while app is running
    // Initial routing is handled by app/index.tsx
    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    // If logged out and in main app, go to login
    if (!isAuthenticated && inTabsGroup) {
      console.log("➡️ User logged out, redirecting to login");
      // @ts-ignore
      router.replace("/(auth)/login");
    }
    // If logged in and in auth screens, go to main app
    else if (isAuthenticated && inAuthGroup) {
      console.log("➡️ User logged in, redirecting to main app");
      // @ts-ignore
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

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
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
