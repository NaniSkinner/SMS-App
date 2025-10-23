/**
 * AI Chat Screen
 * Simple interface to test AI chat functionality with GPT-4o
 */

import { sendAIChat } from "@/services/ai";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/colors";
import { AIChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AIChatScreen() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const renderMessage = ({ item }: { item: AIChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[styles.messageText, isUser ? styles.userText : styles.aiText]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestampText,
            isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
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
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.light.messageReceived,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.light.textInverse,
  },
  aiText: {
    color: colors.light.textPrimary,
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
  aiTimestamp: {
    color: colors.light.textSecondary,
    textAlign: "left",
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
});
