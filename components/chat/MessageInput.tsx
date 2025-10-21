/**
 * MessageInput Component
 * Multi-line text input for sending messages with typing indicators
 */

import { colors } from "@/theme/colors";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MessageInputProps {
  onSend: (text: string) => void;
  isSending?: boolean;
  placeholder?: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isSending = false,
  placeholder = "Type a message...",
  onTypingStart,
  onTypingStop,
}) => {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Handle text change with typing detection
  const handleTextChange = (newText: string) => {
    setText(newText);

    // Start typing indicator
    if (!isTyping && newText.trim() && onTypingStart) {
      setIsTyping(true);
      onTypingStart();
    }

    // Reset timeout for typing stop
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
      setIsTyping(false);
    }, 3000) as unknown as number;
  };

  const handleSend = () => {
    if (text.trim() && !isSending) {
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && onTypingStop) {
        onTypingStop();
      }
      setIsTyping(false);

      onSend(text.trim());
      setText("");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isDisabled = !text.trim() || isSending;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom, 8) : 8,
        },
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.light.textTertiary}
          multiline
          maxLength={1000}
          editable={!isSending}
          returnKeyType="default"
          blurOnSubmit={false}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.sendButton,
          isDisabled && styles.sendButtonDisabled,
          pressed && !isDisabled && styles.sendButtonPressed,
        ]}
        onPress={handleSend}
        disabled={isDisabled}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.sendIconContainer}>
            <View style={styles.sendIcon} />
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.light.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: colors.light.textPrimary,
    maxHeight: 100,
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
    backgroundColor: colors.light.textTertiary,
    opacity: 0.5,
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
  sendIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
});
