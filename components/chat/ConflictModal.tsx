/**
 * ConflictModal Component
 * Shows conflict details and alternative time suggestions
 * Allows user to book anyway, choose alternative, or dismiss
 */

import { colors } from "@/theme/colors";
import { AIExtractedEvent, CalendarEvent } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ConflictModalProps {
  visible: boolean;
  event: AIExtractedEvent;
  conflicts: CalendarEvent[];
  alternativeTimes?: string[];
  onClose: () => void;
  onBookAnyway: () => void;
  onSelectAlternative?: (time: string) => void;
  isLoading?: boolean;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  visible,
  event,
  conflicts,
  alternativeTimes = [],
  onClose,
  onBookAnyway,
  onSelectAlternative,
  isLoading = false,
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(
    null
  );

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

  // Get overlap severity color
  const getOverlapColor = (overlapMinutes: number = 0): string => {
    if (overlapMinutes >= 60) return "#EF4444"; // Red - high conflict
    if (overlapMinutes >= 30) return "#F59E0B"; // Orange - medium conflict
    return "#FBBF24"; // Yellow - low conflict
  };

  // Calculate total overlap time
  const totalOverlapMinutes = conflicts.reduce(
    (sum, c) => sum + (c.overlapMinutes || 0),
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.headerTitle}>Schedule Conflict</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={colors.light.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Proposed Event */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proposed Event</Text>
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.proposedBadge}>
                    <Text style={styles.proposedBadgeText}>New</Text>
                  </View>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons
                    name="time"
                    size={16}
                    color={colors.light.textSecondary}
                  />
                  <Text style={styles.eventDetailText}>
                    {formatDate(event.date)} • {formatTime(event.time)}
                  </Text>
                </View>
                {event.location && (
                  <View style={styles.eventDetail}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={colors.light.textSecondary}
                    />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Conflicts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Conflicting Events ({conflicts.length})
                </Text>
                <Text style={styles.overlapText}>
                  {totalOverlapMinutes} min overlap
                </Text>
              </View>

              {conflicts.map((conflict, index) => (
                <View
                  key={conflict.id || index}
                  style={[
                    styles.conflictCard,
                    {
                      borderLeftColor: getOverlapColor(conflict.overlapMinutes),
                    },
                  ]}
                >
                  <View style={styles.conflictHeader}>
                    <Text style={styles.conflictTitle} numberOfLines={1}>
                      {conflict.title}
                    </Text>
                    <View
                      style={[
                        styles.overlapBadge,
                        {
                          backgroundColor:
                            getOverlapColor(conflict.overlapMinutes) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.overlapBadgeText,
                          {
                            color: getOverlapColor(conflict.overlapMinutes),
                          },
                        ]}
                      >
                        {conflict.overlapMinutes} min
                      </Text>
                    </View>
                  </View>
                  <View style={styles.conflictDetail}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.light.textSecondary}
                    />
                    <Text style={styles.conflictDetailText}>
                      {formatTime(conflict.startTime)} -{" "}
                      {formatTime(conflict.endTime)}
                    </Text>
                  </View>
                  {conflict.location && (
                    <View style={styles.conflictDetail}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={colors.light.textSecondary}
                      />
                      <Text style={styles.conflictDetailText}>
                        {conflict.location}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Alternative Times */}
            {alternativeTimes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  💡 Suggested Alternative Times
                </Text>
                <View style={styles.alternativesGrid}>
                  {alternativeTimes.map((time, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.alternativeChip,
                        selectedAlternative === time &&
                          styles.alternativeChipSelected,
                      ]}
                      onPress={() => setSelectedAlternative(time)}
                    >
                      <Ionicons
                        name="time"
                        size={16}
                        color={
                          selectedAlternative === time
                            ? colors.primary
                            : colors.light.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.alternativeText,
                          selectedAlternative === time &&
                            styles.alternativeTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                      {selectedAlternative === time && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.primary}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {selectedAlternative && onSelectAlternative ? (
              <Pressable
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => onSelectAlternative(selectedAlternative)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={styles.buttonTextPrimary}>
                      Book at {selectedAlternative}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonTextSecondary}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonDanger]}
                  onPress={onBookAnyway}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="warning" size={18} color="#fff" />
                      <Text style={styles.buttonTextPrimary}>Book Anyway</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
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
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 12,
  },
  overlapText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#F59E0B",
  },
  eventCard: {
    backgroundColor: colors.primary + "10",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
    flex: 1,
  },
  proposedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proposedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.light.textPrimary,
  },
  conflictCard: {
    backgroundColor: colors.light.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  conflictHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  conflictTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.light.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  overlapBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overlapBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  conflictDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  conflictDetailText: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  alternativesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  alternativeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.light.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  alternativeChipSelected: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
  },
  alternativeText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontWeight: "500",
  },
  alternativeTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: "#F59E0B",
  },
  buttonSecondary: {
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: colors.light.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
