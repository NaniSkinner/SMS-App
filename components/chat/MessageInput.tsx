/**
 * MessageInput Component
 * Multi-line text input for sending messages
 */

import { colors } from "@/theme/colors";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface MessageInputProps {
  onSend: (text: string) => void;
  isSending?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isSending = false,
  placeholder = "Type a message...",
}) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !isSending) {
      onSend(text.trim());
      setText("");
    }
  };

  const isDisabled = !text.trim() || isSending;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
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
    paddingVertical: 8,
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
