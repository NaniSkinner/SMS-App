/**
 * AI Chat Screen
 * Conversational AI interface with Firestore persistence
 * Uses Zustand store for state management (aiStore.ts)
 */

import { AIMessageBubble } from "@/components/chat/AIMessageBubble";
import { useAIStore } from "@/stores/aiStore";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { AIChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// Thinking indicator component - shows while AI is processing
const ThinkingIndicator = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      createPulseAnimation(dot1Anim, 0),
      createPulseAnimation(dot2Anim, 200),
      createPulseAnimation(dot3Anim, 400),
    ]);

    animations.start();

    return () => animations.stop();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={styles.thinkingContainer}>
      <View style={styles.thinkingBubble}>
        <Ionicons
          name="sparkles"
          size={16}
          color={colors.light.textSecondary}
          style={styles.thinkingIcon}
        />
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      </View>
    </View>
  );
};

export default function AIChatScreen() {
  const { user } = useAuthStore();

  // AI Store (global state with Firestore persistence)
  const { messages, isLoading, sendMessage, submitFeedback, loadConversation } =
    useAIStore();

  // Local UI state (not persisted)
  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(40); // Track input height for auto-grow
  const flatListRef = useRef<FlatList>(null);

  // Load conversation history from Firestore on mount
  useEffect(() => {
    if (user?.id) {
      loadConversation(user.id);
    }
  }, [user?.id, loadConversation]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !user) {
      return;
    }

    const messageContent = inputText.trim();
    setInputText(""); // Clear input immediately for better UX
    setInputHeight(40); // Reset input height

    // Send message via store (handles API call + Firestore persistence)
    await sendMessage(user.id, messageContent);

    // Scroll to bottom after message sent
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Handle input height changes for auto-growing text input
  const handleContentSizeChange = (event: any) => {
    const newHeight = event.nativeEvent.contentSize.height;
    const MIN_HEIGHT = 40;
    const MAX_HEIGHT = 120; // ~5 lines
    const clampedHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT));
    setInputHeight(clampedHeight);
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
          ListFooterComponent={isLoading ? <ThinkingIndicator /> : null}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.light.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          onContentSizeChange={handleContentSizeChange}
          multiline
          maxLength={1000}
          editable={!isLoading}
          returnKeyType="default"
          blurOnSubmit={false}
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
    marginRight: 8,
    color: colors.light.textPrimary,
    minHeight: 40,
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
  thinkingContainer: {
    marginBottom: 12,
    marginTop: 4,
  },
  thinkingBubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.light.messageReceived,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  thinkingIcon: {
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.textSecondary,
  },
});
