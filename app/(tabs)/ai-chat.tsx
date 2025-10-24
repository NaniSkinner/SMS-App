/**
 * AI Chat Screen
 * Simple interface to test AI chat functionality with GPT-4o
 */

import { AIMessageBubble } from "@/components/chat/AIMessageBubble";
import { sendAIChat } from "@/services/ai";
import {
  isCalendarConnected,
  useGoogleCalendarAuth,
} from "@/services/googleAuth";
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
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Google Calendar OAuth hook
  const { promptAsync, isLoading: isAuthLoading } = useGoogleCalendarAuth();

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

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Send to AI
      const response = await sendAIChat(
        user.id,
        userMessage.content,
        conversationHistory
      );

      if (response.success && response.data) {
        const aiMessage: AIChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.reply,
          timestamp: new Date(),
          reasoning: response.data.reasoning,
          toolsCalled: response.data.toolsCalled,
          events: response.data.events,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Scroll to bottom after AI response
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Show error message
        const errorMessage: AIChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ Error: ${response.error || "Failed to get AI response"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending AI message:", error);
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Error: Failed to communicate with AI service",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (
    messageId: string,
    sentiment: "positive" | "negative"
  ) => {
    console.log(`📊 Feedback submitted for message ${messageId}: ${sentiment}`);

    // Update local state to reflect feedback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: sentiment } : msg
      )
    );

    // TODO: Save feedback to Firestore in Epic 1.5
    // await firestore.collection("ai_feedback").add({
    //   userId: user?.id,
    //   messageId,
    //   sentiment,
    //   timestamp: new Date(),
    // });
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
});
