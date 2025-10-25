/**
 * DecisionSummaryCard Component
 * Displays summarized group decision with participant consensus
 * Shows timeline, key messages, and confidence level
 */

import { colors } from "@/theme/colors";
import { DecisionSummary } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface DecisionSummaryCardProps {
  summary: DecisionSummary;
  onDismiss: () => void;
}

export const DecisionSummaryCard: React.FC<DecisionSummaryCardProps> = ({
  summary,
  onDismiss,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Get consensus level badge color
  const getConsensusColor = (): string => {
    switch (summary.consensusLevel) {
      case "unanimous":
        return colors.success;
      case "strong":
        return colors.primary;
      case "moderate":
        return colors.light.warning;
      case "weak":
        return colors.error;
      default:
        return colors.light.textSecondary;
    }
  };

  // Get consensus level emoji
  const getConsensusEmoji = (): string => {
    switch (summary.consensusLevel) {
      case "unanimous":
        return "✅";
      case "strong":
        return "👍";
      case "moderate":
        return "🤝";
      case "weak":
        return "⚖️";
      default:
        return "❓";
    }
  };

  // Get confidence badge
  const getConfidenceBadge = (): {
    label: string;
    color: string;
    emoji: string;
  } => {
    if (summary.confidence >= 0.8) {
      return { label: "High", color: colors.success, emoji: "🎯" };
    } else if (summary.confidence >= 0.6) {
      return { label: "Medium", color: colors.light.warning, emoji: "📊" };
    } else {
      return { label: "Low", color: colors.error, emoji: "⚠️" };
    }
  };

  const confidenceBadge = getConfidenceBadge();
  const consensusColor = getConsensusColor();
  const consensusEmoji = getConsensusEmoji();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="people-outline"
            size={20}
            color={colors.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Decision Summary</Text>
        </View>
        <Pressable
          onPress={() => onDismiss()}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.light.textSecondary} />
        </Pressable>
      </View>

      {/* Question */}
      <View style={styles.section}>
        <Text style={styles.label}>Question</Text>
        <Text style={styles.question}>{summary.question}</Text>
      </View>

      {/* Final Decision */}
      <View style={[styles.section, styles.decisionSection]}>
        <Text style={styles.label}>Final Decision</Text>
        <Text style={styles.finalDecision}>{summary.finalDecision}</Text>
      </View>

      {/* Consensus & Confidence Row */}
      <View style={styles.badgesRow}>
        {/* Consensus Badge */}
        <View
          style={[styles.badge, { backgroundColor: consensusColor + "20" }]}
        >
          <Text style={styles.badgeEmoji}>{consensusEmoji}</Text>
          <Text style={[styles.badgeText, { color: consensusColor }]}>
            {summary.consensusLevel.charAt(0).toUpperCase() +
              summary.consensusLevel.slice(1)}
          </Text>
        </View>

        {/* Confidence Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: confidenceBadge.color + "20" },
          ]}
        >
          <Text style={styles.badgeEmoji}>{confidenceBadge.emoji}</Text>
          <Text style={[styles.badgeText, { color: confidenceBadge.color }]}>
            {confidenceBadge.label} Confidence
          </Text>
        </View>
      </View>

      {/* Participants */}
      <View style={styles.section}>
        <Text style={styles.label}>Participants</Text>
        <View style={styles.participantsContainer}>
          {/* Agreed */}
          {summary.participants.agreed.length > 0 && (
            <View style={styles.participantGroup}>
              <View style={styles.participantHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.success}
                />
                <Text
                  style={[styles.participantLabel, { color: colors.success }]}
                >
                  Agreed ({summary.participants.agreed.length})
                </Text>
              </View>
              <Text style={styles.participantNames}>
                {summary.participants.agreed.join(", ")}
              </Text>
            </View>
          )}

          {/* Disagreed */}
          {summary.participants.disagreed.length > 0 && (
            <View style={styles.participantGroup}>
              <View style={styles.participantHeader}>
                <Ionicons name="close-circle" size={16} color={colors.error} />
                <Text
                  style={[styles.participantLabel, { color: colors.error }]}
                >
                  Disagreed ({summary.participants.disagreed.length})
                </Text>
              </View>
              <Text style={styles.participantNames}>
                {summary.participants.disagreed.join(", ")}
              </Text>
            </View>
          )}

          {/* Neutral */}
          {summary.participants.neutral.length > 0 && (
            <View style={styles.participantGroup}>
              <View style={styles.participantHeader}>
                <Ionicons
                  name="remove-circle"
                  size={16}
                  color={colors.light.textSecondary}
                />
                <Text
                  style={[
                    styles.participantLabel,
                    { color: colors.light.textSecondary },
                  ]}
                >
                  Neutral ({summary.participants.neutral.length})
                </Text>
              </View>
              <Text style={styles.participantNames}>
                {summary.participants.neutral.join(", ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <View style={styles.timelineHeader}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.light.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.timelineText}>
            Decision made in {summary.timeline.durationMinutes} minutes
          </Text>
        </View>
        <Text style={styles.timelineDetail}>
          {summary.timeline.startTime} → {summary.timeline.endTime}
        </Text>
      </View>

      {/* Key Messages Toggle */}
      {summary.keyMessages && summary.keyMessages.length > 0 && (
        <Pressable
          onPress={() => setShowDetails(!showDetails)}
          style={({ pressed }) => [
            styles.detailsToggle,
            pressed && styles.detailsTogglePressed,
          ]}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? "Hide" : "Show"} Key Messages
          </Text>
          <Ionicons
            name={showDetails ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      )}

      {/* Key Messages */}
      {showDetails && summary.keyMessages && summary.keyMessages.length > 0 && (
        <View style={styles.keyMessagesContainer}>
          <ScrollView
            style={styles.keyMessagesScroll}
            showsVerticalScrollIndicator={false}
          >
            {summary.keyMessages.map((message, index) => (
              <View key={index} style={styles.keyMessage}>
                <View style={styles.keyMessageDot} />
                <Text style={styles.keyMessageText}>{message}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  closeButtonPressed: {
    backgroundColor: colors.light.border,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.light.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  decisionSection: {
    backgroundColor: colors.primary + "10",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  finalDecision: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  participantsContainer: {
    gap: 10,
  },
  participantGroup: {
    gap: 4,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  participantLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  participantNames: {
    fontSize: 14,
    color: colors.light.textPrimary,
    marginLeft: 22,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.textSecondary,
  },
  timelineDetail: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginLeft: 22,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    marginTop: 4,
    gap: 6,
  },
  detailsTogglePressed: {
    opacity: 0.6,
  },
  detailsToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  keyMessagesContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  keyMessagesScroll: {
    backgroundColor: colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
  },
  keyMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  keyMessageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  keyMessageText: {
    flex: 1,
    fontSize: 13,
    color: colors.light.textPrimary,
    lineHeight: 18,
  },
});
