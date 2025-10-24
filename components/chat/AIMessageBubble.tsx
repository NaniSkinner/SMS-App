/**
 * AI Message Bubble Component
 * Enhanced message bubble for AI assistant with reasoning, events, and feedback
 */

import { colors } from "@/theme/colors";
import { AIChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AIMessageBubbleProps {
  message: AIChatMessage;
  onFeedback?: (messageId: string, sentiment: "positive" | "negative") => void;
  showFeedback?: boolean; // Only show for event-related responses
}

export function AIMessageBubble({
  message,
  onFeedback,
  showFeedback = false,
}: AIMessageBubbleProps) {
  const [submittedFeedback, setSubmittedFeedback] = useState<
    "positive" | "negative" | null
  >(message.feedback || null);

  // Fade-in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFeedback = async (sentiment: "positive" | "negative") => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSubmittedFeedback(sentiment);
    onFeedback?.(message.id, sentiment);
  };

  const hasEvents = message.events && message.events.length > 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* AI Icon */}
      <View style={styles.aiIcon}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>

      {/* Message Content */}
      <View style={styles.bubble}>
        {/* Main Message Text */}
        <Text style={styles.messageText}>{message.content}</Text>

        {/* Events List */}
        {hasEvents && (
          <View style={styles.eventsContainer}>
            <View style={styles.eventsHeader}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.eventsTitle}>Calendar Events</Text>
            </View>
            {message.events!.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.dateTime && (
                  <Text style={styles.eventTime}>{event.dateTime}</Text>
                )}
                {event.location && (
                  <Text style={styles.eventLocation}>📍 {event.location}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {/* Feedback Buttons - Only show for event-related responses */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                submittedFeedback === "positive" && styles.feedbackButtonActive,
              ]}
              onPress={() => handleFeedback("positive")}
              disabled={submittedFeedback !== null}
            >
              <Text
                style={[
                  styles.feedbackEmoji,
                  submittedFeedback === "positive" &&
                    styles.feedbackEmojiActive,
                ]}
              >
                👍
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.feedbackButton,
                submittedFeedback === "negative" && styles.feedbackButtonActive,
              ]}
              onPress={() => handleFeedback("negative")}
              disabled={submittedFeedback !== null}
            >
              <Text
                style={[
                  styles.feedbackEmoji,
                  submittedFeedback === "negative" &&
                    styles.feedbackEmojiActive,
                ]}
              >
                👎
              </Text>
            </TouchableOpacity>

            {submittedFeedback && (
              <Text style={styles.feedbackThanks}>
                Thanks for your feedback!
              </Text>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.light.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.light.messageReceived,
    borderRadius: 16,
    padding: 12,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  eventsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  eventCard: {
    backgroundColor: colors.light.inputBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 8,
    textAlign: "left",
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  feedbackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  feedbackButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.light.background,
  },
  feedbackEmoji: {
    fontSize: 16,
    opacity: 0.6,
  },
  feedbackEmojiActive: {
    opacity: 1,
  },
  feedbackThanks: {
    fontSize: 11,
    color: colors.light.textSecondary,
    fontStyle: "italic",
    marginLeft: 4,
  },
});
