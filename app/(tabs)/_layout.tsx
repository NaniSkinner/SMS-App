/**
 * Tabs Layout
 * Main navigation for authenticated users
 */

import { OfflineBanner } from "@/components/common/OfflineBanner";
import { processOfflineQueue } from "@/services/queueProcessor";
import { useUIStore } from "@/stores/uiStore";
import { colors } from "@/theme/colors";
import { useNetworkStatus } from "@/utils/network";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";

export default function TabsLayout() {
  const { isOffline } = useNetworkStatus();
  const { setOffline, offlineBannerVisible } = useUIStore();
  const previousOfflineStatus = useRef(isOffline);

  // Update offline state in store when network status changes
  useEffect(() => {
    setOffline(isOffline);

    // Process offline queue when coming back online
    if (previousOfflineStatus.current && !isOffline) {
      console.log("🌐 Network restored, processing offline queue...");
      processOfflineQueue();
    }

    previousOfflineStatus.current = isOffline;
  }, [isOffline, setOffline]);

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner visible={offlineBannerVisible} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.light.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.light.background,
            borderTopColor: colors.light.border,
          },
          headerStyle: {
            backgroundColor: colors.light.background,
          },
          headerTintColor: colors.light.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Chats",
            tabBarLabel: "Chats",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
          }}
        />
      </Tabs>
    </View>
  );
}
