/**
 * RSVP Tracker Card Component
 * Displays RSVP summary and participant responses for event invitations
 */

import { colors } from "@/theme/colors";
import { RSVPTracker } from "@/types";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

interface RSVPTrackerCardProps {
  tracker: RSVPTracker;
  onClose?: () => void;
}

export const RSVPTrackerCard: React.FC<RSVPTrackerCardProps> = ({
  tracker,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showDetails, setShowDetails] = useState(false);

  const { invitation, responses, participantIds } = tracker;

  // Count responses by status
  const yesCount = responses.filter((r) => r.status === "yes").length;
  const noCount = responses.filter((r) => r.status === "no").length;
  const maybeCount = responses.filter((r) => r.status === "maybe").length;
  const respondedIds = responses.map((r) => r.userId);
  const pendingCount = participantIds.filter(
    (id) => id !== invitation.senderId && !respondedIds.includes(id)
  ).length;

  // Get responses by status
  const yesResponses = responses.filter((r) => r.status === "yes");
  const noResponses = responses.filter((r) => r.status === "no");
  const maybeResponses = responses.filter((r) => r.status === "maybe");
  const pendingIds = participantIds.filter(
    (id) => id !== invitation.senderId && !respondedIds.includes(id)
  );

  // Format event details
  const formatEventDetails = () => {
    const parts: string[] = [];
    if (invitation.eventDate) parts.push(invitation.eventDate);
    if (invitation.eventTime) parts.push(invitation.eventTime);
    if (invitation.eventLocation) parts.push(invitation.eventLocation);
    return parts.join(" • ");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.dark.background : colors.light.card,
          borderColor: isDark ? colors.dark.border : colors.light.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>🎉</Text>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                { color: isDark ? colors.dark.text : colors.light.text },
              ]}
              numberOfLines={1}
            >
              {invitation.eventTitle}
            </Text>
            {formatEventDetails() && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isDark
                      ? colors.dark.textSecondary
                      : colors.light.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {formatEventDetails()}
              </Text>
            )}
          </View>
        </View>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* RSVP Summary */}
      <View style={styles.summary}>
        {/* Yes */}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>✅</Text>
          <Text
            style={[
              styles.summaryCount,
              { color: isDark ? colors.dark.text : colors.light.text },
            ]}
          >
            {yesCount}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              {
                color: isDark
                  ? colors.dark.textSecondary
                  : colors.light.textSecondary,
              },
            ]}
          >
            Yes
          </Text>
        </View>

        {/* No */}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>❌</Text>
          <Text
            style={[
              styles.summaryCount,
              { color: isDark ? colors.dark.text : colors.light.text },
            ]}
          >
            {noCount}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              {
                color: isDark
                  ? colors.dark.textSecondary
                  : colors.light.textSecondary,
              },
            ]}
          >
            No
          </Text>
        </View>

        {/* Maybe */}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>🤔</Text>
          <Text
            style={[
              styles.summaryCount,
              { color: isDark ? colors.dark.text : colors.light.text },
            ]}
          >
            {maybeCount}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              {
                color: isDark
                  ? colors.dark.textSecondary
                  : colors.light.textSecondary,
              },
            ]}
          >
            Maybe
          </Text>
        </View>

        {/* Pending */}
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>❓</Text>
          <Text
            style={[
              styles.summaryCount,
              { color: isDark ? colors.dark.text : colors.light.text },
            ]}
          >
            {pendingCount}
          </Text>
          <Text
            style={[
              styles.summaryLabel,
              {
                color: isDark
                  ? colors.dark.textSecondary
                  : colors.light.textSecondary,
              },
            ]}
          >
            Pending
          </Text>
        </View>
      </View>

      {/* Toggle Details Button */}
      {responses.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.detailsButton,
            {
              backgroundColor: isDark
                ? colors.dark.backgroundSecondary
                : colors.light.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
            {showDetails ? "Hide Details" : "Show Details"}
          </Text>
          <Text style={styles.detailsButtonIcon}>
            {showDetails ? "▲" : "▼"}
          </Text>
        </Pressable>
      )}

      {/* Detailed Responses */}
      {showDetails && (
        <ScrollView style={styles.detailsContainer} nestedScrollEnabled>
          {/* Yes Responses */}
          {yesResponses.length > 0 && (
            <View style={styles.responseGroup}>
              <Text
                style={[
                  styles.responseGroupTitle,
                  {
                    color: isDark
                      ? colors.dark.textSecondary
                      : colors.light.textSecondary,
                  },
                ]}
              >
                ✅ Attending ({yesResponses.length})
              </Text>
              {yesResponses.map((response, index) => (
                <View
                  key={`yes-${index}`}
                  style={[
                    styles.responseItem,
                    {
                      backgroundColor: isDark
                        ? colors.dark.backgroundSecondary
                        : colors.light.backgroundSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.responseName,
                      {
                        color: isDark ? colors.dark.text : colors.light.text,
                      },
                    ]}
                  >
                    {response.userName}
                    {response.numberOfPeople && response.numberOfPeople > 1
                      ? ` (+${response.numberOfPeople - 1})`
                      : ""}
                  </Text>
                  {response.conditions && (
                    <Text
                      style={[
                        styles.responseConditions,
                        {
                          color: isDark
                            ? colors.dark.textSecondary
                            : colors.light.textSecondary,
                        },
                      ]}
                    >
                      {response.conditions}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Maybe Responses */}
          {maybeResponses.length > 0 && (
            <View style={styles.responseGroup}>
              <Text
                style={[
                  styles.responseGroupTitle,
                  {
                    color: isDark
                      ? colors.dark.textSecondary
                      : colors.light.textSecondary,
                  },
                ]}
              >
                🤔 Maybe ({maybeResponses.length})
              </Text>
              {maybeResponses.map((response, index) => (
                <View
                  key={`maybe-${index}`}
                  style={[
                    styles.responseItem,
                    {
                      backgroundColor: isDark
                        ? colors.dark.backgroundSecondary
                        : colors.light.backgroundSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.responseName,
                      {
                        color: isDark ? colors.dark.text : colors.light.text,
                      },
                    ]}
                  >
                    {response.userName}
                  </Text>
                  {response.conditions && (
                    <Text
                      style={[
                        styles.responseConditions,
                        {
                          color: isDark
                            ? colors.dark.textSecondary
                            : colors.light.textSecondary,
                        },
                      ]}
                    >
                      {response.conditions}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* No Responses */}
          {noResponses.length > 0 && (
            <View style={styles.responseGroup}>
              <Text
                style={[
                  styles.responseGroupTitle,
                  {
                    color: isDark
                      ? colors.dark.textSecondary
                      : colors.light.textSecondary,
                  },
                ]}
              >
                ❌ Can't Attend ({noResponses.length})
              </Text>
              {noResponses.map((response, index) => (
                <View
                  key={`no-${index}`}
                  style={[
                    styles.responseItem,
                    {
                      backgroundColor: isDark
                        ? colors.dark.backgroundSecondary
                        : colors.light.backgroundSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.responseName,
                      {
                        color: isDark ? colors.dark.text : colors.light.text,
                      },
                    ]}
                  >
                    {response.userName}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#999",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailsButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  detailsButtonIcon: {
    fontSize: 10,
    color: colors.primary,
  },
  detailsContainer: {
    marginTop: 12,
    maxHeight: 300,
  },
  responseGroup: {
    marginBottom: 16,
  },
  responseGroupTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  responseItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  responseName: {
    fontSize: 14,
    fontWeight: "500",
  },
  responseConditions: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
});
