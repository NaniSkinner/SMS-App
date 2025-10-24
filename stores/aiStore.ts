/**
 * AI Store
 * Zustand store for managing AI chat conversations and messages
 * Follows same pattern as chatStore.ts for consistency
 */

import { sendAIChat } from "@/services/ai";
import { db } from "@/services/firebase.config";
import { AIChatMessage } from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { create } from "zustand";

interface AIState {
  // State
  messages: AIChatMessage[];
  conversationId: string; // Always "main" for single conversation approach
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (
    userId: string,
    content: string,
    timezone?: string
  ) => Promise<void>;
  loadConversation: (userId: string) => Promise<void>;
  submitFeedback: (
    userId: string,
    messageId: string,
    sentiment: "positive" | "negative",
    comment?: string
  ) => Promise<void>;
  setMessages: (messages: AIChatMessage[]) => void;
  addMessage: (message: AIChatMessage) => void;
  updateMessageFeedback: (
    messageId: string,
    sentiment: "positive" | "negative"
  ) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  // Initial State
  messages: [],
  conversationId: "main", // Single conversation per user
  isLoading: false,
  error: null,

  /**
   * Send a message to the AI assistant
   * Follows optimistic UI pattern like chatStore.ts
   */
  sendMessage: async (userId: string, content: string, timezone?: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !userId) {
      console.warn("⚠️ Cannot send empty message or missing userId");
      return;
    }

    // Create user message (optimistic)
    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedContent,
      timestamp: new Date(),
    };

    // Add user message immediately (optimistic UI)
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Build conversation history for context (last 10 messages)
      const conversationHistory = get()
        .messages.slice(-10)
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));

      // Call AI service
      const response = await sendAIChat(
        userId,
        trimmedContent,
        conversationHistory,
        timezone
      );

      if (response.success && response.data) {
        // Create AI message
        const aiMessage: AIChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: response.data.reply,
          timestamp: new Date(),
          reasoning: response.data.reasoning,
          toolsCalled: response.data.toolsCalled,
          events: response.data.events,
        };

        // Add AI message to state
        set((state) => ({
          messages: [...state.messages, aiMessage],
          isLoading: false,
        }));

        // Save conversation to Firestore (async, don't block UI)
        await saveConversationToFirestore(userId, get().messages);
      } else {
        // Handle API error
        const errorMessage: AIChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `❌ Error: ${response.error || "Failed to get AI response"}`,
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, errorMessage],
          isLoading: false,
          error: response.error || "Failed to get AI response",
        }));
      }
    } catch (error: any) {
      console.error("❌ Error in sendMessage:", error);

      // Add error message to chat
      const errorMessage: AIChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "❌ Error: Failed to communicate with AI service",
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
        error: error.message || "Unknown error",
      }));
    }
  },

  /**
   * Load conversation history from Firestore
   * Called on app launch
   */
  loadConversation: async (userId: string) => {
    if (!userId) {
      console.warn("⚠️ Cannot load conversation without userId");
      return;
    }

    try {
      const conversationRef = doc(
        db,
        "users",
        userId,
        "ai_conversations",
        "main"
      );
      const conversationSnap = await getDoc(conversationRef);

      if (conversationSnap.exists()) {
        const data = conversationSnap.data();
        const messages = (data.turns || []).map((turn: any) => ({
          id: turn.id,
          role: turn.role,
          content: turn.content,
          timestamp: turn.timestamp?.toDate
            ? turn.timestamp.toDate()
            : new Date(turn.timestamp),
          reasoning: turn.reasoning,
          toolsCalled: turn.toolsCalled,
          events: turn.events,
          feedback: turn.feedback,
        }));

        set({ messages });
        console.log(`✅ Loaded ${messages.length} messages from Firestore`);
      } else {
        console.log("📝 No existing conversation found, starting fresh");
        set({ messages: [] });
      }
    } catch (error: any) {
      console.error("❌ Error loading conversation:", error);
      set({ error: error.message });
    }
  },

  /**
   * Submit feedback for an AI message
   * Saves to global ai_feedback collection for analytics
   */
  submitFeedback: async (
    userId: string,
    messageId: string,
    sentiment: "positive" | "negative",
    comment?: string
  ) => {
    if (!userId || !messageId) {
      console.warn("⚠️ Cannot submit feedback without userId or messageId");
      return;
    }

    try {
      // Find the message to get context
      const message = get().messages.find((m) => m.id === messageId);
      const previousMessage = get().messages.find(
        (m) => m.id === String(Number(messageId) - 1)
      );

      // Save to global feedback collection
      await addDoc(collection(db, "ai_feedback"), {
        userId,
        messageId,
        conversationId: "main",
        sentiment,
        comment: comment || null,
        aiResponse: message?.content || "",
        userQuery: previousMessage?.content || "",
        toolsCalled: message?.toolsCalled || [],
        hadConflicts: false, // TODO: Add conflict tracking
        eventCreated:
          message?.toolsCalled?.includes("createCalendarEvent") || false,
        timestamp: serverTimestamp(),
      });

      // Update message in state
      get().updateMessageFeedback(messageId, sentiment);

      // Save updated conversation to Firestore
      await saveConversationToFirestore(userId, get().messages);

      console.log(`✅ Feedback submitted: ${sentiment}`);
    } catch (error: any) {
      console.error("❌ Error submitting feedback:", error);
      set({ error: error.message });
    }
  },

  /**
   * Set all messages (used when loading)
   */
  setMessages: (messages: AIChatMessage[]) => {
    set({ messages });
  },

  /**
   * Add a single message
   */
  addMessage: (message: AIChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  /**
   * Update feedback on a message
   */
  updateMessageFeedback: (
    messageId: string,
    sentiment: "positive" | "negative"
  ) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: sentiment } : msg
      ),
    }));
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store (useful for logout)
   */
  reset: () => {
    set({
      messages: [],
      conversationId: "main",
      isLoading: false,
      error: null,
    });
  },
}));

/**
 * Helper: Save conversation to Firestore
 * Structure: /users/{userId}/ai_conversations/main
 */
async function saveConversationToFirestore(
  userId: string,
  messages: AIChatMessage[]
): Promise<void> {
  try {
    const conversationRef = doc(
      db,
      "users",
      userId,
      "ai_conversations",
      "main"
    );

    // Convert messages to Firestore format
    const turns = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Timestamp.fromDate(msg.timestamp),
      reasoning: msg.reasoning || null,
      toolsCalled: msg.toolsCalled || null,
      events: msg.events || null,
      feedback: msg.feedback || null,
    }));

    // Calculate metadata
    const metadata = {
      totalTurns: messages.length,
      toolsCalled: Array.from(
        new Set(
          messages.flatMap((m) => m.toolsCalled || []).filter((tool) => tool)
        )
      ),
      eventsCreated: messages.filter((m) =>
        m.toolsCalled?.includes("createCalendarEvent")
      ).length,
    };

    // Save to Firestore
    await setDoc(conversationRef, {
      id: "main",
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
      turns,
      metadata,
    });

    console.log("💾 Conversation saved to Firestore");
  } catch (error: any) {
    console.error("❌ Error saving conversation:", error);
    throw error;
  }
}
