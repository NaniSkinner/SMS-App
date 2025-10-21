/**
 * Tabs Layout
 * Main navigation for authenticated users
 */

import { colors } from "@/theme/colors";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
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
  );
}
