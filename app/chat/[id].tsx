/**
 * Chat Screen
 * Individual conversation screen with messages
 */

import { ConflictModal } from "@/components/chat/ConflictModal";
import { DecisionSummaryCard } from "@/components/chat/DecisionSummaryCard";
import { EventExtractionCard } from "@/components/chat/EventExtractionCard";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { Avatar } from "@/components/common/Avatar";
import {
  extractEventFromText,
  sendAIChat,
  summarizeDecision,
} from "@/services/ai";
import {
  addToOfflineQueue,
  cacheMessages,
  getCachedMessages,
} from "@/services/cache";
import {
  createOptimisticMessage,
  markMessagesAsDelivered,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "@/services/chat";
import { resetUnreadCount, updateLastMessage } from "@/services/conversations";
import { subscribeToUserPresence } from "@/services/presence";
import {
  clearUserTyping,
  setUserTyping,
  subscribeToTypingStatus,
} from "@/services/typing";
import { updateActiveConversation } from "@/services/user";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { colors } from "@/theme/colors";
import { DecisionSummary, Message } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    conversations,
    messages,
    setMessages,
    addMessage,
    replaceOptimisticMessage,
    updateMessageStatus,
    setActiveConversation,
  } = useChatStore();
  const { isOffline } = useUIStore();

  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<Date | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showReadStatusModal, setShowReadStatusModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [decisionSummary, setDecisionSummary] =
    useState<DecisionSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium"
  >("all");

  const conversationId = id!;
  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];

  // Filter messages by priority
  const filteredMessages =
    priorityFilter === "all"
      ? conversationMessages
      : conversationMessages.filter((msg) => msg.priority === priorityFilter);

  // Get other user ID for direct conversations
  const otherUserId =
    conversation?.type === "direct"
      ? conversation.participants.find((id) => id !== user?.id)
      : null;

  useEffect(() => {
    if (!conversationId || !user) return;

    setActiveConversation(conversationId);

    // Update active conversation to prevent push notifications while viewing
    updateActiveConversation(user.id, conversationId);

    // Load cached messages first for instant display
    const loadCachedMessages = async () => {
      const cached = await getCachedMessages(conversationId);
      if (cached.length > 0) {
        setMessages(conversationId, cached);
        setIsLoadingMessages(false);
        console.log(`📂 Loaded ${cached.length} cached messages instantly`);
      }
    };

    loadCachedMessages();

    // Mark messages as delivered when conversation opens
    markMessagesAsDelivered(conversationId, user.id);

    // Mark messages as read when viewing the conversation
    markMessagesAsRead(conversationId, user.id);

    // Reset unread count
    resetUnreadCount(user.id, conversationId);

    // Subscribe to real-time messages
    const unsubscribeMessages = subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(conversationId, newMessages);
        setIsLoadingMessages(false);

        // Cache the new messages
        cacheMessages(conversationId, newMessages);

        // Mark new messages as delivered and read when they arrive
        setTimeout(() => {
          markMessagesAsDelivered(conversationId, user.id);
          markMessagesAsRead(conversationId, user.id);
          resetUnreadCount(user.id, conversationId);
        }, 500);
      }
    );

    // Subscribe to other user's presence (for direct conversations)
    let unsubscribePresence: (() => void) | undefined;
    if (otherUserId) {
      unsubscribePresence = subscribeToUserPresence(
        otherUserId,
        (online, lastSeen) => {
          setOtherUserOnline(online);
          setOtherUserLastSeen(lastSeen);
        }
      );
    }

    // Subscribe to typing status
    const unsubscribeTyping = subscribeToTypingStatus(
      conversationId,
      user.id,
      (typingNames) => {
        setTypingUsers(typingNames);
      }
    );

    // Cleanup
    return () => {
      unsubscribeMessages();
      if (unsubscribePresence) {
        unsubscribePresence();
      }
      unsubscribeTyping();
      // Clear own typing status on unmount
      clearUserTyping(conversationId, user.id);
      setActiveConversation(null);
      // Clear active conversation to allow push notifications again
      updateActiveConversation(user.id, null);
    };
  }, [conversationId, user, otherUserId]);

  const handleSendMessage = async (text: string) => {
    if (!user || !conversation) return;

    setError(null);

    // 1. Create optimistic message
    const optimisticMessage = createOptimisticMessage(
      conversationId,
      text,
      user.id
    );

    // 2. Add to store immediately for instant UI feedback
    addMessage(conversationId, optimisticMessage);

    console.log(
      `⚡ Optimistic message added with localId: ${optimisticMessage.localId}`
    );

    // 3. If offline, add to queue and return
    if (isOffline) {
      console.log("📥 Device offline, adding message to queue");
      await addToOfflineQueue(conversationId, optimisticMessage);
      return;
    }

    // 4. Send to Firestore asynchronously
    try {
      const result = await sendMessage(
        conversationId,
        text,
        user.id,
        optimisticMessage.localId // Pass localId for tracking
      );

      if (result.success && result.data) {
        // 5. Replace optimistic message with server message
        replaceOptimisticMessage(
          conversationId,
          optimisticMessage.localId,
          result.data
        );

        // Update last message in conversation
        await updateLastMessage(conversationId, {
          text,
          senderId: user.id,
          senderName: user.displayName,
        });

        console.log(
          `✅ Optimistic message replaced with server message: ${result.data.id}`
        );
      } else {
        // 6. Mark as failed if send fails
        updateMessageStatus(
          conversationId,
          optimisticMessage.localId,
          "failed"
        );
        setError(result.error || "Failed to send message");
        console.error("❌ Failed to send message:", result.error);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      updateMessageStatus(conversationId, optimisticMessage.localId, "failed");
      setError("Failed to send message");
    }
  };

  const handleRetryMessage = async (failedMessage: Message) => {
    if (!user) return;

    console.log(
      `🔄 Retrying failed message: ${failedMessage.localId || failedMessage.id}`
    );

    // Update status to sending
    const messageId = failedMessage.localId || failedMessage.id;
    updateMessageStatus(conversationId, messageId, "sending");

    // If offline, add to queue
    if (isOffline) {
      console.log("📥 Device offline, adding retry to queue");
      await addToOfflineQueue(conversationId, {
        ...failedMessage,
        status: "sending",
        localId: failedMessage.localId || failedMessage.id,
      } as any);
      return;
    }

    // Try to send again
    try {
      const result = await sendMessage(
        conversationId,
        failedMessage.text,
        user.id,
        failedMessage.localId
      );

      if (result.success && result.data) {
        replaceOptimisticMessage(
          conversationId,
          failedMessage.localId || failedMessage.id,
          result.data
        );

        await updateLastMessage(conversationId, {
          text: failedMessage.text,
          senderId: user.id,
          senderName: user.displayName,
        });

        console.log(`✅ Successfully retried message: ${result.data.id}`);
      } else {
        updateMessageStatus(conversationId, messageId, "failed");
        setError(result.error || "Failed to send message");
        console.error("❌ Retry failed:", result.error);
      }
    } catch (err) {
      console.error("❌ Error retrying message:", err);
      updateMessageStatus(conversationId, messageId, "failed");
      setError("Failed to send message");
    }
  };

  // Get header info with real-time presence
  const getHeaderInfo = () => {
    if (!conversation) return { title: "Chat", subtitle: "" };

    if (conversation.type === "direct") {
      const otherUser = otherUserId
        ? conversation.participantDetails[otherUserId]
        : null;

      return {
        title: otherUser?.displayName || "Unknown User",
        subtitle: otherUserOnline
          ? "Online"
          : otherUserLastSeen
          ? `Last seen ${formatLastSeen(otherUserLastSeen)}`
          : "Offline",
      };
    } else {
      const memberCount = conversation.participants.length;
      return {
        title: conversation.groupName || "Group Chat",
        subtitle: `${memberCount} members`,
      };
    }
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Handle typing start
  const handleTypingStart = () => {
    if (user) {
      setUserTyping(conversationId, user.id, user.displayName);
    }
  };

  // Handle typing stop
  const handleTypingStop = () => {
    if (user) {
      clearUserTyping(conversationId, user.id);
    }
  };

  // Handle AI message analysis
  const handleAnalyzeWithAI = async (message: Message) => {
    if (!user) return;

    setIsAnalyzing(true);
    setSelectedMessage(message);

    try {
      console.log("🤖 Analyzing message with AI:", message.text);

      // Use the AI service function with proper retry logic and error handling
      const result = await extractEventFromText(user.id, message.text);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to analyze message");
      }

      console.log("✅ Analysis result:", result.data);

      setAnalysisResult(result.data);

      // Only show modal if event was found
      if (result.data.hasEvent) {
        setShowAnalysisModal(true);
      } else {
        setError("No calendar event detected in this message.");
      }
    } catch (error) {
      console.error("❌ Error analyzing message:", error);
      setError("Failed to analyze message. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add event to calendar using AI
  const handleAddToCalendar = async (alternativeTime?: string) => {
    if (!user || !analysisResult?.event) return;

    setIsAddingToCalendar(true);
    setError(null);

    try {
      const event = analysisResult.event;

      // Use alternative time if provided (and is a string), otherwise use original time
      const timeToUse =
        typeof alternativeTime === "string" && alternativeTime
          ? alternativeTime
          : event.time;

      // Validate that we have a valid time string
      if (!timeToUse || typeof timeToUse !== "string") {
        throw new Error(`Invalid time format: ${timeToUse}`);
      }

      console.log(
        `📅 Adding event to calendar: ${event.title} at ${timeToUse}`
      );

      // Format the time properly for the AI (convert 24-hour to 12-hour with AM/PM)
      const formatTimeForAI = (time24: string): string => {
        if (!time24 || typeof time24 !== "string" || !time24.includes(":")) {
          console.error("Invalid time format:", time24);
          return time24; // Return as-is if invalid
        }
        const [hours, minutes] = time24.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      const formattedTime = formatTimeForAI(timeToUse);

      console.log(`📤 Formatted time: ${formattedTime}`);

      // Create event via AI chat (which calls the createCalendarEvent tool)
      const message = `Create a calendar event titled "${event.title}" on ${
        event.date
      } at ${formattedTime} for ${event.duration} minutes${
        event.location ? ` at location ${event.location}` : ""
      }${
        event.description ? ` with description: ${event.description}` : ""
      }. Please create this event now.`;

      console.log(`📤 Sending to AI:`, message);

      const result = await sendAIChat(user.id, message, []);

      if (result.success && result.data) {
        console.log("✅ AI Response received");
        console.log("AI Reply:", result.data.reply);
        console.log("Tools Called:", result.data.toolsCalled);

        // Check if the event was actually created (AI should have called createCalendarEvent tool)
        const wasCreated = result.data.toolsCalled?.includes(
          "createCalendarEvent"
        );

        if (wasCreated) {
          console.log("✅ Calendar event created successfully!");

          // Close all modals and clear state
          setShowAnalysisModal(false);
          setShowConflictModal(false);
          setAnalysisResult(null);
          setSelectedMessage(null);

          // Clear any previous errors
          setError(null);

          // Show success in console (in production, this would be a toast notification)
          console.log(`✅ "${event.title}" added to your calendar!`);
        } else {
          // AI didn't create the event, show what it said
          console.log("⚠️ AI did not create the event");
          throw new Error(
            `AI could not create the event. Response: ${result.data.reply}`
          );
        }
      } else {
        throw new Error(result.error || "Failed to create calendar event");
      }
    } catch (error: any) {
      console.error("❌ Error adding to calendar:", error);
      setError(
        error.message || "Failed to add event to calendar. Please try again."
      );
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  // View conflicts in detail modal
  const handleViewConflicts = () => {
    if (analysisResult?.conflicts && analysisResult.conflicts.length > 0) {
      setShowConflictModal(true);
    }
  };

  // Dismiss extraction card
  const handleDismissAnalysis = () => {
    setShowAnalysisModal(false);
    setAnalysisResult(null);
  };

  // Summarize group decisions
  const handleSummarizeDecisions = async () => {
    if (!user || !conversation) return;

    // Only for group chats
    if (conversation.type !== "group") {
      console.log("❌ Decision summarization only available for group chats");
      return;
    }

    // Need at least 5 messages for meaningful analysis
    if (conversationMessages.length < 5) {
      setError(
        "Not enough messages to summarize. Need at least 5 messages for decision analysis."
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      console.log("💡 Starting decision summarization...");

      // Prepare messages for analysis (limit to last 50 messages)
      const messagesToAnalyze = conversationMessages.slice(-50).map((msg) => ({
        senderId: msg.senderId,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      }));

      // Build participant names map
      const participantNames: { [userId: string]: string } = {};
      if (conversation.participantDetails) {
        Object.entries(conversation.participantDetails).forEach(
          ([userId, details]) => {
            participantNames[userId] = details.displayName;
          }
        );
      }

      const result = await summarizeDecision(
        user.id,
        conversationId,
        messagesToAnalyze,
        participantNames
      );

      if (result.success && result.data) {
        if (result.data.hasDecision) {
          console.log(
            "✅ Decision found:",
            result.data.question,
            "→",
            result.data.finalDecision
          );
          setDecisionSummary({
            question: result.data.question!,
            finalDecision: result.data.finalDecision!,
            participants: result.data.participants!,
            timeline: result.data.timeline!,
            confidence: result.data.confidence!,
            keyMessages: result.data.keyMessages!,
            consensusLevel: result.data.consensusLevel!,
          });
        } else {
          console.log("ℹ️ No decision found in conversation");
          setError(
            result.data.message ||
              "No clear decision was found in this conversation. Try discussing a specific topic or question."
          );
          setTimeout(() => setError(null), 4000);
        }
      } else {
        console.error("❌ Decision summarization failed:", result.error);
        setError(
          result.error || "Failed to summarize decision. Please try again."
        );
        setTimeout(() => setError(null), 3000);
      }
    } catch (error: any) {
      console.error("❌ Exception during decision summarization:", error);
      setError("An unexpected error occurred. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Dismiss decision summary card
  const handleDismissDecisionSummary = () => {
    setDecisionSummary(null);
  };

  // Book event anyway despite conflicts
  const handleBookAnyway = async () => {
    await handleAddToCalendar();
  };

  // Select alternative time
  const handleSelectAlternative = async (time: string) => {
    await handleAddToCalendar(time);
  };

  // Format typing indicator text
  const getTypingText = (): string => {
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  // Handle read status press
  const handleReadStatusPress = (message: Message) => {
    setSelectedMessage(message);
    setShowReadStatusModal(true);
  };

  const headerInfo = getHeaderInfo();

  if (!conversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Pressable
          style={styles.headerInfo}
          onPress={() => {
            if (conversation?.type === "group") {
              router.push(`/group/${conversationId}/info` as any);
            }
          }}
          disabled={conversation?.type !== "group"}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerInfo.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {headerInfo.subtitle}
          </Text>
        </Pressable>
        {/* Summarize Decisions Button (Group Chats Only) */}
        {conversation?.type === "group" && (
          <Pressable
            onPress={handleSummarizeDecisions}
            style={({ pressed }) => [
              styles.summarizeButton,
              pressed && styles.summarizeButtonPressed,
            ]}
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={styles.summarizeButtonText}>Summarize</Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Priority Filter Chips (Group Chats Only) */}
      {conversation?.type === "group" && (
        <View style={styles.filterContainer}>
          <Pressable
            onPress={() => setPriorityFilter("all")}
            style={[
              styles.filterChip,
              priorityFilter === "all" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                priorityFilter === "all" && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPriorityFilter("high")}
            style={[
              styles.filterChip,
              styles.filterChipHigh,
              priorityFilter === "high" && styles.filterChipActive,
            ]}
          >
            <Text style={styles.filterChipIcon}>🚨</Text>
            <Text
              style={[
                styles.filterChipText,
                priorityFilter === "high" && styles.filterChipTextActive,
              ]}
            >
              Urgent
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPriorityFilter("medium")}
            style={[
              styles.filterChip,
              styles.filterChipMedium,
              priorityFilter === "medium" && styles.filterChipActive,
            ]}
          >
            <Text style={styles.filterChipIcon}>⚠️</Text>
            <Text
              style={[
                styles.filterChipText,
                priorityFilter === "medium" && styles.filterChipTextActive,
              ]}
            >
              Important
            </Text>
          </Pressable>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {user && (
          <MessageList
            messages={filteredMessages}
            currentUserId={user.id}
            conversation={conversation}
            isLoading={isLoadingMessages}
            onRetry={handleRetryMessage}
            onReadStatusPress={handleReadStatusPress}
            onAnalyzeWithAI={handleAnalyzeWithAI}
          />
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{getTypingText()}</Text>
          </View>
        )}
      </View>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        isSending={isSending}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />

      {/* Read Status Modal */}
      {conversation?.type === "group" && selectedMessage && (
        <Modal
          visible={showReadStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReadStatusModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowReadStatusModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Read By</Text>

              <FlatList
                data={selectedMessage.readBy
                  .map((userId) => conversation.participantDetails[userId])
                  .filter((user) => user)}
                renderItem={({ item }) => (
                  <View style={styles.readStatusItem}>
                    <Avatar
                      displayName={item.displayName}
                      photoURL={item.photoURL}
                      size={40}
                      showOnlineIndicator
                      isOnline={item.isOnline}
                    />
                    <View style={styles.readStatusInfo}>
                      <Text style={styles.readStatusName}>
                        {item.displayName}
                      </Text>
                      <Text style={styles.readStatusText}>Read</Text>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.displayName}
                contentContainerStyle={styles.modalList}
                ListEmptyComponent={
                  <View style={styles.emptyReadStatus}>
                    <Text style={styles.emptyReadStatusText}>
                      No one has read this message yet
                    </Text>
                  </View>
                }
              />

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowReadStatusModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* AI Analysis - Event Extraction Card */}
      {showAnalysisModal &&
        analysisResult?.hasEvent &&
        analysisResult.event && (
          <View style={styles.extractionCardContainer}>
            <EventExtractionCard
              event={analysisResult.event}
              conflicts={analysisResult.conflicts || []}
              alternativeTimes={analysisResult.alternativeTimes}
              onAddToCalendar={handleAddToCalendar}
              onViewConflicts={handleViewConflicts}
              onDismiss={handleDismissAnalysis}
              isLoading={isAddingToCalendar}
            />
          </View>
        )}

      {/* Decision Summary Card */}
      {decisionSummary && (
        <View style={styles.extractionCardContainer}>
          <DecisionSummaryCard
            summary={decisionSummary}
            onDismiss={handleDismissDecisionSummary}
          />
        </View>
      )}

      {/* Conflict Modal */}
      {analysisResult?.event && (
        <ConflictModal
          visible={showConflictModal}
          event={analysisResult.event}
          conflicts={analysisResult.conflicts || []}
          alternativeTimes={analysisResult.alternativeTimes}
          onClose={() => setShowConflictModal(false)}
          onBookAnyway={handleBookAnyway}
          onSelectAlternative={handleSelectAlternative}
          isLoading={isAddingToCalendar}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  summarizeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.light.primaryLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.light.primary + "30",
    gap: 4,
    marginLeft: 8,
  },
  summarizeButtonPressed: {
    opacity: 0.7,
    backgroundColor: colors.light.primary + "20",
  },
  summarizeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.light.primary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: colors.light.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipHigh: {
    // Specific styling if needed
  },
  filterChipMedium: {
    // Specific styling if needed
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterChipIcon: {
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: colors.error + "20",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.background,
  },
  typingText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  readStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  readStatusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  readStatusName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  readStatusText: {
    fontSize: 13,
    color: colors.success,
  },
  emptyReadStatus: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyReadStatusText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  modalCloseButton: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  analysisLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  analysisLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  analysisSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 12,
  },
  eventDetails: {
    backgroundColor: colors.light.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light.textPrimary,
    marginBottom: 8,
  },
  eventDetail: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  conflictHeader: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  conflictHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
  },
  availableHeader: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  availableHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  availableMessage: {
    paddingHorizontal: 12,
  },
  availableMessageText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: "center",
  },
  conflictItem: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  conflictTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E65100",
    marginBottom: 4,
  },
  conflictTime: {
    fontSize: 13,
    color: "#F57C00",
    marginBottom: 2,
  },
  conflictOverlap: {
    fontSize: 12,
    color: "#FF6F00",
    fontStyle: "italic",
  },
  alternativeTime: {
    fontSize: 14,
    color: colors.light.textPrimary,
    paddingVertical: 6,
    paddingLeft: 8,
  },
  analysisEmpty: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  analysisEmptyText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: "center",
  },
  extractionCardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
