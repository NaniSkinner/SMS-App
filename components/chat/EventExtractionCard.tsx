/**
 * EventExtractionCard Component
 * Displays extracted event details with conflict warnings
 * Allows user to add event to calendar or view conflicts
 */

import { colors } from "@/theme/colors";
import { AIExtractedEvent, CalendarEvent } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface EventExtractionCardProps {
  event: AIExtractedEvent;
  conflicts?: CalendarEvent[];
  alternativeTimes?: string[];
  onAddToCalendar: () => void;
  onViewConflicts: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const EventExtractionCard: React.FC<EventExtractionCardProps> = ({
  event,
  conflicts = [],
  alternativeTimes = [],
  onAddToCalendar,
  onViewConflicts,
  onDismiss,
  isLoading = false,
}) => {
  const hasConflicts = conflicts.length > 0;
  const lowConfidence = event.confidence < 0.7;

  // Format date for display (e.g., "Sat, Oct 25")
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display (e.g., "3:00 PM")
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Calculate end time
  const getEndTime = (): string => {
    try {
      const [hours, minutes] = event.time.split(":");
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + event.duration;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      return formatTime(
        `${endHours.toString().padStart(2, "0")}:${endMins
          .toString()
          .padStart(2, "0")}`
      );
    } catch {
      return "Unknown";
    }
  };

  // Get confidence badge
  const getConfidenceBadge = () => {
    if (event.confidence >= 0.9) {
      return { icon: "checkmark-circle", color: "#22C55E", text: "High" };
    } else if (event.confidence >= 0.7) {
      return { icon: "alert-circle", color: "#F59E0B", text: "Medium" };
    } else {
      return { icon: "warning", color: "#EF4444", text: "Low" };
    }
  };

  const confidenceBadge = getConfidenceBadge();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Event Detected</Text>
        </View>
        <Pressable onPress={() => onDismiss()} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.light.textSecondary} />
        </Pressable>
      </View>

      {/* Conflict Warning Banner */}
      {hasConflicts && (
        <Pressable
          onPress={() => onViewConflicts()}
          style={styles.conflictBanner}
        >
          <View style={styles.conflictBannerContent}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <View style={styles.conflictTextContainer}>
              <Text style={styles.conflictTitle}>
                {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""}{" "}
                Detected
              </Text>
              <Text style={styles.conflictSubtitle}>
                Tap to view details and alternatives
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
        </Pressable>
      )}

      {/* Low Confidence Warning */}
      {lowConfidence && !hasConflicts && (
        <View style={styles.lowConfidenceWarning}>
          <Ionicons
            name="information-circle"
            size={18}
            color={colors.light.textSecondary}
          />
          <Text style={styles.lowConfidenceText}>
            Please verify the details below are correct
          </Text>
        </View>
      )}

      {/* Event Details */}
      <View style={styles.eventDetails}>
        {/* Title */}
        <View style={styles.detailRow}>
          <Ionicons
            name="document-text"
            size={18}
            color={colors.light.textSecondary}
          />
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.detailRow}>
          <Ionicons name="time" size={18} color={colors.light.textSecondary} />
          <View>
            <Text style={styles.detailText}>
              {formatDate(event.date)} • {formatTime(event.time)} -{" "}
              {getEndTime()}
            </Text>
            <Text style={styles.durationText}>{event.duration} minutes</Text>
          </View>
        </View>

        {/* Location (if provided) */}
        {event.location && (
          <View style={styles.detailRow}>
            <Ionicons
              name="location"
              size={18}
              color={colors.light.textSecondary}
            />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        )}

        {/* Description (if provided) */}
        {event.description && (
          <View style={styles.detailRow}>
            <Ionicons
              name="information-circle"
              size={18}
              color={colors.light.textSecondary}
            />
            <Text style={styles.detailText} numberOfLines={2}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Confidence Badge */}
        <View style={styles.confidenceContainer}>
          <Ionicons
            name={confidenceBadge.icon as any}
            size={16}
            color={confidenceBadge.color}
          />
          <Text
            style={[styles.confidenceText, { color: confidenceBadge.color }]}
          >
            {confidenceBadge.text} Confidence
          </Text>
        </View>

        {/* Ambiguous Fields Warning */}
        {event.ambiguousFields && event.ambiguousFields.length > 0 && (
          <View style={styles.ambiguousWarning}>
            <Text style={styles.ambiguousText}>
              ⚠️ Please verify: {event.ambiguousFields.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {hasConflicts ? (
          <>
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => onViewConflicts()}
            >
              <Ionicons name="eye" size={18} color={colors.primary} />
              <Text style={styles.buttonTextSecondary}>View Conflicts</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => onAddToCalendar()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.buttonTextPrimary}>Add Anyway</Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
            onPress={() => onAddToCalendar()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.buttonTextPrimary}>Add to Calendar</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  conflictBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F59E0B40",
  },
  conflictBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  conflictTextContainer: {
    flex: 1,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B45309",
    marginBottom: 2,
  },
  conflictSubtitle: {
    fontSize: 12,
    color: "#92400E",
  },
  lowConfidenceWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.light.inputBackground,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  lowConfidenceText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    flex: 1,
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
    flex: 1,
  },
  detailText: {
    fontSize: 15,
    color: colors.light.textPrimary,
    flex: 1,
  },
  durationText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: "500",
  },
  ambiguousWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  ambiguousText: {
    fontSize: 12,
    color: "#92400E",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
