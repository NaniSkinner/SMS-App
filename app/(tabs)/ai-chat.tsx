/**
 * AI Chat Screen
 * Conversational AI interface with Firestore persistence
 * Uses Zustand store for state management (aiStore.ts)
 */

import { AIMessageBubble } from "@/components/chat/AIMessageBubble";
import {
  isCalendarConnected,
  useGoogleCalendarAuth,
} from "@/services/googleAuth";
import { useAIStore } from "@/stores/aiStore";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { AIChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// User message bubble component - defined outside to prevent re-creation
const UserMessageBubble = React.memo(
  ({ message }: { message: AIChatMessage }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      // Only animate once per message
      if (!hasAnimated) {
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
        setHasAnimated(true);
      }
    }, [hasAnimated, fadeAnim, slideAnim]);

    return (
      <Animated.View
        style={[
          styles.messageBubble,
          styles.userBubble,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.messageText, styles.userText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestampText, styles.userTimestamp]}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Animated.View>
    );
  }
);

export default function AIChatScreen() {
  const { user } = useAuthStore();

  // AI Store (global state with Firestore persistence)
  const { messages, isLoading, sendMessage, submitFeedback, loadConversation } =
    useAIStore();

  // Local UI state (not persisted)
  const [inputText, setInputText] = useState("");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Google Calendar OAuth hook
  const { promptAsync, isLoading: isAuthLoading } = useGoogleCalendarAuth();

  // Load conversation history from Firestore on mount
  useEffect(() => {
    if (user?.id) {
      loadConversation(user.id);
    }
  }, [user?.id, loadConversation]);

  // Check calendar connection status on mount
  useEffect(() => {
    checkCalendarConnection();
  }, []);

  const checkCalendarConnection = async () => {
    setCheckingCalendar(true);
    const connected = await isCalendarConnected();
    setCalendarConnected(connected);
    setCheckingCalendar(false);
  };

  const handleConnectCalendar = async () => {
    try {
      const result = await promptAsync();

      if (result?.type === "success") {
        Alert.alert(
          "✅ Calendar Connected",
          "Your Google Calendar has been connected successfully!",
          [{ text: "OK", onPress: () => checkCalendarConnection() }]
        );
      } else if (result?.type === "error") {
        Alert.alert(
          "❌ Connection Failed",
          "Failed to connect Google Calendar. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      Alert.alert(
        "❌ Error",
        "An error occurred while connecting your calendar.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !user) {
      return;
    }

    const messageContent = inputText.trim();
    setInputText(""); // Clear input immediately for better UX

    // Get user's timezone (Chicago)
    const timezone = "America/Chicago";

    // Send message via store (handles API call + Firestore persistence)
    await sendMessage(user.id, messageContent, timezone);

    // Scroll to bottom after message sent
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleFeedback = async (
    messageId: string,
    sentiment: "positive" | "negative"
  ) => {
    if (!user?.id) return;

    console.log(`📊 Feedback submitted for message ${messageId}: ${sentiment}`);

    // Submit feedback via store (updates state + saves to Firestore)
    await submitFeedback(user.id, messageId, sentiment);
  };

  // Detect if message is event-related (for showing feedback)
  const isEventRelated = (message: AIChatMessage): boolean => {
    if (message.role !== "assistant") return false;

    // ONLY show feedback if the AI actually performed an event action:
    // 1. Tool calls include createCalendarEvent, updateCalendarEvent, or deleteCalendarEvent
    const hasEventActionTools = message.toolsCalled?.some(
      (tool) =>
        tool.includes("createCalendarEvent") ||
        tool.includes("updateCalendarEvent") ||
        tool.includes("deleteCalendarEvent")
    );

    return hasEventActionTools || false;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: AIChatMessage;
    index: number;
  }) => {
    const isUser = item.role === "user";

    // Use enhanced AI bubble for assistant messages
    if (!isUser) {
      return (
        <AIMessageBubble
          message={item}
          onFeedback={handleFeedback}
          showFeedback={isEventRelated(item)}
        />
      );
    }

    // Simple bubble for user messages with animation
    return <UserMessageBubble message={item} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubbles"
        size={64}
        color={colors.light.textTertiary}
      />
      <Text style={styles.emptyStateTitle}>AI Assistant</Text>
      <Text style={styles.emptyStateText}>Powered by GPT-4o</Text>
      <Text style={styles.emptyStateHint}>
        Send a message to start chatting with the AI
      </Text>

      {/* Calendar Connection Status */}
      <View style={styles.calendarSection}>
        <Ionicons
          name={calendarConnected ? "calendar" : "calendar-outline"}
          size={24}
          color={
            calendarConnected ? colors.primary : colors.light.textSecondary
          }
        />
        <Text style={styles.calendarStatusText}>
          {checkingCalendar
            ? "Checking calendar..."
            : calendarConnected
            ? "✅ Calendar Connected"
            : "Calendar not connected"}
        </Text>
      </View>

      {!calendarConnected && !checkingCalendar && (
        <TouchableOpacity
          style={styles.connectCalendarButton}
          onPress={handleConnectCalendar}
          disabled={isAuthLoading}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="link" size={20} color="#fff" />
              <Text style={styles.connectCalendarText}>
                Connect Google Calendar
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {calendarConnected && (
        <Text style={styles.calendarHint}>
          💡 Now you can ask me about your schedule, create events, and check
          for conflicts!
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Calendar connection banner - shows when not connected */}
      {!calendarConnected && !checkingCalendar && messages.length > 0 && (
        <View style={styles.calendarBanner}>
          <View style={styles.calendarBannerContent}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.light.textSecondary}
            />
            <Text style={styles.calendarBannerText}>
              Calendar not connected
            </Text>
          </View>
          <TouchableOpacity
            style={styles.connectBannerButton}
            onPress={handleConnectCalendar}
            disabled={isAuthLoading}
          >
            {isAuthLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.connectBannerButtonText}>Connect</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {messages.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.light.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!isLoading}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.light.textInverse} />
          ) : (
            <Ionicons name="send" size={20} color={colors.light.textInverse} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.light.textInverse,
  },
  timestampText: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: colors.light.textInverse,
    opacity: 0.7,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    color: colors.light.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.light.buttonDisabled,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: colors.light.textTertiary,
    textAlign: "center",
  },
  calendarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.inputBackground,
    borderRadius: 12,
    gap: 8,
  },
  calendarStatusText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontWeight: "500",
  },
  connectCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    minWidth: 200,
  },
  connectCalendarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarHint: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
    paddingHorizontal: 32,
  },
  calendarBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE4B5",
  },
  calendarBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  calendarBannerText: {
    fontSize: 14,
    color: colors.light.textPrimary,
    fontWeight: "500",
  },
  connectBannerButton: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 80,
    alignItems: "center",
  },
  connectBannerButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
