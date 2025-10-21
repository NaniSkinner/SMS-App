/**
 * Color Palette for Messaging App
 * Based on PRD specifications
 */

export const colors = {
  // Primary Colors
  primary: "#4361EE", // Blue - Primary actions, sent messages
  primaryDark: "#2D4BCE", // Darker blue for pressed states
  secondary: "#AB4E68", // Pink - Accents, highlights
  accent: "#E6C0E9", // Lavender - Subtle highlights
  success: "#9DC183", // Green - Success states, online indicator
  error: "#DC3545", // Red - Error states
  darkPurple: "#1C0221", // Very Dark Purple - Dark mode backgrounds

  // Light Theme
  light: {
    // Backgrounds
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#E8E8E8",

    // Message Bubbles
    messageSent: "#4361EE",
    messageReceived: "#E8E8E8",

    // Text
    textPrimary: "#1C0221",
    textSecondary: "#666666",
    textTertiary: "#999999",
    textInverse: "#FFFFFF",

    // Borders
    border: "#E0E0E0",
    borderLight: "#F0F0F0",

    // Status
    online: "#9DC183",
    offline: "#999999",
    error: "#DC3545",
    warning: "#FFC107",

    // UI Elements
    inputBackground: "#F5F5F5",
    inputBorder: "#E0E0E0",
    buttonPrimary: "#4361EE",
    buttonSecondary: "#AB4E68",
    buttonDisabled: "#CCCCCC",

    // Unread/Badges
    unreadBadge: "#DC3545",
    unreadText: "#FFFFFF",
  },

  // Dark Theme
  dark: {
    // Backgrounds
    background: "#1C0221",
    backgroundSecondary: "#2A1030",
    backgroundTertiary: "#3D1F4A",

    // Message Bubbles
    messageSent: "#4361EE",
    messageReceived: "#3D1F4A",

    // Text
    textPrimary: "#FFFFFF",
    textSecondary: "#CCCCCC",
    textTertiary: "#999999",
    textInverse: "#1C0221",

    // Borders
    border: "#3D1F4A",
    borderLight: "#2A1030",

    // Status
    online: "#9DC183",
    offline: "#999999",
    error: "#FF4D5A",
    warning: "#FFD60A",

    // UI Elements
    inputBackground: "#2A1030",
    inputBorder: "#3D1F4A",
    buttonPrimary: "#4361EE",
    buttonSecondary: "#AB4E68",
    buttonDisabled: "#444444",

    // Unread/Badges
    unreadBadge: "#DC3545",
    unreadText: "#FFFFFF",
  },

  // Status Colors (theme-independent)
  status: {
    sending: "#999999",
    sent: "#999999",
    delivered: "#4361EE",
    read: "#4361EE",
    failed: "#DC3545",
  },
};

// Theme type for TypeScript
export type Theme = "light" | "dark" | "system";
export type ThemeColors = typeof colors.light;

/**
 * Get colors for a specific theme
 */
export const getThemeColors = (
  theme: Theme,
  systemTheme?: "light" | "dark"
): ThemeColors => {
  if (theme === "system") {
    return systemTheme === "dark" ? colors.dark : colors.light;
  }
  return theme === "dark" ? colors.dark : colors.light;
};
