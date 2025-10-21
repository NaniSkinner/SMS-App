/**
 * Chat Store
 * Zustand store for managing chat conversations and messages
 */

import { ChatState } from "@/types";
import { create } from "zustand";

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingMessages: false,

  /**
   * Set all conversations
   */
  setConversations: (conversations) => {
    set({ conversations });
  },

  /**
   * Add a new conversation
   */
  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },

  /**
   * Update an existing conversation
   */
  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ),
    }));
  },

  /**
   * Set the active conversation
   */
  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
  },

  /**
   * Set messages for a conversation
   */
  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    }));
  },

  /**
   * Add a single message to a conversation
   */
  addMessage: (conversationId, message) => {
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];

      // Check if message already exists (by id or localId)
      const messageExists = existingMessages.some(
        (m) =>
          m.id === message.id ||
          (message.localId && m.localId === message.localId)
      );

      if (messageExists) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
      };
    });
  },

  /**
   * Update message status
   */
  updateMessageStatus: (conversationId, messageId, status) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId];
      if (!conversationMessages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: conversationMessages.map((msg) =>
            msg.id === messageId || msg.localId === messageId
              ? { ...msg, status }
              : msg
          ),
        },
      };
    });
  },

  /**
   * Replace optimistic message with server message
   */
  replaceOptimisticMessage: (conversationId, localId, message) => {
    set((state) => {
      const conversationMessages = state.messages[conversationId];
      if (!conversationMessages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: conversationMessages.map((msg) =>
            msg.localId === localId ? message : msg
          ),
        },
      };
    });
  },

  /**
   * Clear messages for a conversation
   */
  clearMessages: (conversationId) => {
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[conversationId];
      return { messages: newMessages };
    });
  },
}));
