/**
 * PriorityDetailsModal Component
 * Shows priority analysis details and reasoning
 */

import { colors } from "@/theme/colors";
import { Message } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

interface PriorityDetailsModalProps {
  visible: boolean;
  message: Message;
  onClose: () => void;
}

export const PriorityDetailsModal: React.FC<PriorityDetailsModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  if (!message.priority || message.priority === "none") {
    return null;
  }

  // Get priority configuration
  const getPriorityConfig = () => {
    switch (message.priority) {
      case "high":
        return {
          icon: "🚨",
          label: "High Priority",
          color: themeColors.error,
          backgroundColor: themeColors.error + "15",
          description: "Requires immediate attention",
        };
      case "medium":
        return {
          icon: "⚠️",
          label: "Medium Priority",
          color: themeColors.warning,
          backgroundColor: themeColors.warning + "15",
          description: "Important but not immediate",
        };
      case "low":
        return {
          icon: "ℹ️",
          label: "Low Priority",
          color: colors.primary,
          backgroundColor: colors.primary + "15",
          description: "Informational, worth noting",
        };
      default:
        return null;
    }
  };

  const config = getPriorityConfig();
  if (!config) return null;

  // Format confidence as percentage
  const confidencePercent = message.priorityConfidence
    ? Math.round(message.priorityConfidence * 100)
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: config.backgroundColor },
                ]}
              >
                <Text style={styles.iconText}>{config.icon}</Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  {config.label}
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {config.description}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Message Preview */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                Message
              </Text>
              <View
                style={[
                  styles.messageCard,
                  { backgroundColor: themeColors.backgroundSecondary },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>

            {/* Reason */}
            {message.priorityReason && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Why This Priority?
                </Text>
                <View
                  style={[
                    styles.reasonCard,
                    {
                      backgroundColor: config.backgroundColor,
                      borderColor: config.color,
                    },
                  ]}
                >
                  <Text style={[styles.reasonText, { color: config.color }]}>
                    {message.priorityReason}
                  </Text>
                </View>
              </View>
            )}

            {/* Urgency Factors */}
            {message.urgencyFactors && message.urgencyFactors.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Urgency Indicators
                </Text>
                <View style={styles.factorsList}>
                  {message.urgencyFactors.map((factor, index) => (
                    <View
                      key={index}
                      style={[
                        styles.factorChip,
                        {
                          backgroundColor: themeColors.backgroundSecondary,
                          borderColor: themeColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.factorText,
                          { color: themeColors.textPrimary },
                        ]}
                      >
                        {factor}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Required */}
            {message.actionRequired && (
              <View style={styles.section}>
                <View
                  style={[
                    styles.actionCard,
                    {
                      backgroundColor: config.backgroundColor,
                      borderColor: config.color,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={config.color}
                  />
                  <Text style={[styles.actionText, { color: config.color }]}>
                    Action required from you
                  </Text>
                </View>
              </View>
            )}

            {/* Confidence Score */}
            {confidencePercent > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  AI Confidence
                </Text>
                <View
                  style={[
                    styles.confidenceCard,
                    { backgroundColor: themeColors.backgroundSecondary },
                  ]}
                >
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceBarFill,
                        {
                          width: `${confidencePercent}%`,
                          backgroundColor: config.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {confidencePercent}% confident
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { backgroundColor: themeColors.backgroundSecondary },
            ]}
          >
            <Pressable
              onPress={onClose}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.buttonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  messageCard: {
    padding: 16,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  reasonCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  factorsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  factorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  factorText: {
    fontSize: 13,
    fontWeight: "500",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confidenceCard: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
