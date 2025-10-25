/**
 * PriorityBadge Component
 * Displays a priority indicator badge on messages
 */

import { colors } from "@/theme/colors";
import React from "react";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
  onPress?: () => void;
  size?: "small" | "medium";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  onPress,
  size = "small",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Get priority configuration
  const getPriorityConfig = () => {
    switch (priority) {
      case "high":
        return {
          icon: "🚨",
          backgroundColor: isDark
            ? colors.dark.error + "20"
            : colors.light.error + "20",
          borderColor: isDark ? colors.dark.error : colors.light.error,
          label: "Urgent",
        };
      case "medium":
        return {
          icon: "⚠️",
          backgroundColor: isDark
            ? colors.dark.warning + "20"
            : colors.light.warning + "20",
          borderColor: isDark ? colors.dark.warning : colors.light.warning,
          label: "Important",
        };
      case "low":
        return {
          icon: "ℹ️",
          backgroundColor: isDark
            ? colors.primary + "20"
            : colors.primary + "20",
          borderColor: colors.primary,
          label: "Notice",
        };
    }
  };

  const config = getPriorityConfig();
  const sizeStyles = size === "small" ? styles.small : styles.medium;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.badge,
        sizeStyles,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.icon,
          size === "small" ? styles.iconSmall : styles.iconMedium,
        ]}
      >
        {config.icon}
      </Text>
      {size === "medium" && (
        <Text
          style={[
            styles.label,
            {
              color: config.borderColor,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  small: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 11,
  },
  iconMedium: {
    fontSize: 13,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
