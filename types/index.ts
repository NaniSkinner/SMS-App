/**
 * Core Type Definitions for Messaging App
 */

// ========================================
// USER TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date | null;
  createdAt: Date;
  pushToken?: string;
  theme?: "light" | "dark" | "system";
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// ========================================
// MESSAGE TYPES
// ========================================

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface Message {
  id: string;
  localId?: string; // For optimistic UI
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: MessageStatus;
  readBy: string[]; // Array of user IDs who read the message
  createdAt: Date;
  // Priority detection fields
  priority?: "high" | "medium" | "low" | "none";
  priorityReason?: string;
  priorityDetectedAt?: Date;
  urgencyFactors?: string[];
  actionRequired?: boolean;
  priorityConfidence?: number;
}

export interface OptimisticMessage extends Message {
  localId: string;
  status: "sending";
}

// ========================================
// CONVERSATION TYPES
// ========================================

export type ConversationType = "direct" | "group";

export interface LastMessage {
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: {
      displayName: string;
      photoURL?: string;
      isOnline: boolean;
      lastSeen: Date | null;
    };
  };
  lastMessage?: LastMessage;
  createdAt: Date;
  updatedAt: Date;
  // Group-specific fields
  groupName?: string;
  groupPhoto?: string;
  createdBy?: string;
}

export interface UserConversation {
  conversationId: string;
  unreadCount: number;
  lastMessageTimestamp: Date | null;
  isMuted: boolean;
  isPinned: boolean;
}

// ========================================
// PRESENCE TYPES
// ========================================

export interface PresenceData {
  isOnline: boolean;
  lastSeen: Date | null;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface PushNotificationData {
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  conversationType: ConversationType;
  groupName?: string;
}

// ========================================
// STORE TYPES
// ========================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: { [conversationId: string]: Message[] };
  isLoadingMessages: boolean;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (
    conversationId: string,
    messageId: string,
    status: MessageStatus
  ) => void;
  replaceOptimisticMessage: (
    conversationId: string,
    localId: string,
    message: Message
  ) => void;
  clearMessages: (conversationId: string) => void;
}

export interface UIState {
  theme: "light" | "dark" | "system";
  isOffline: boolean;
  offlineBannerVisible: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setOffline: (offline: boolean) => void;
  setOfflineBannerVisible: (visible: boolean) => void;
}

// ========================================
// CACHE TYPES
// ========================================

export interface CachedConversation extends Conversation {
  cachedAt: Date;
}

export interface CachedMessage extends Message {
  cachedAt: Date;
}

export interface OfflineQueueItem {
  id: string;
  conversationId: string;
  message: OptimisticMessage;
  timestamp: Date;
  retryCount: number;
}

// ========================================
// FIREBASE TYPES
// ========================================

export interface FirebaseUserDoc {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
  pushToken?: string;
  theme?: "light" | "dark" | "system";
}

export interface FirebaseMessageDoc {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: any; // Firestore Timestamp
  status: MessageStatus;
  readBy: string[];
  createdAt: any; // Firestore Timestamp
}

export interface FirebaseConversationDoc {
  id: string;
  type: ConversationType;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      displayName: string;
      photoURL?: string;
      isOnline: boolean;
      lastSeen: any; // Firestore Timestamp
    };
  };
  lastMessage?: {
    text: string;
    timestamp: any; // Firestore Timestamp
    senderId: string;
    senderName: string;
  };
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  groupName?: string;
  groupPhoto?: string;
  createdBy?: string;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// FORM TYPES
// ========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  displayName: string;
}

export interface CreateGroupFormData {
  groupName: string;
  participants: string[];
}

// ========================================
// AI TYPES
// ========================================

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // AI-specific fields (only for assistant messages)
  reasoning?: string[];
  toolsCalled?: string[];
  events?: any[];
  feedback?: "positive" | "negative" | null;
}

export interface AIChatRequest {
  userId: string;
  message: string; // Note: Lambda expects "message" not "messageText"
  conversationHistory?: Array<{ role: string; content: string }>;
  timezone?: string; // IANA timezone (e.g., "America/Los_Angeles")
}

export interface AIChatResponse {
  reply: string;
  reasoning?: string[];
  toolsCalled?: string[];
  events?: any[];
}

export interface AIExtractEventRequest {
  userId: string;
  messageText: string;
  timezone?: string; // User's timezone for accurate date interpretation
}

export interface AIExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  location?: string;
  description?: string;
  confidence: number; // 0-1 score
  ambiguousFields?: string[];
}

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  location?: string;
  description?: string;
  overlapMinutes?: number; // For conflicts
}

export interface AIExtractEventResponse {
  hasEvent: boolean;
  event?: AIExtractedEvent;
  conflicts?: CalendarEvent[];
  needsConfirmation?: boolean;
  alternativeTimes?: string[];
}

// For storing AI suggestions on messages
export interface AISuggestion {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  createdAt: Date;
  type: "event_extracted" | "conflict_detected" | "decision_summary";
  extractedEvent?: AIExtractedEvent;
  conflicts?: CalendarEvent[];
  alternativeTimes?: string[];
  userAction?: "accepted" | "dismissed" | "modified";
  wasHelpful?: boolean;
}

export interface AISummarizeDecisionRequest {
  userId: string;
  conversationId: string;
  messages: Array<{
    senderId: string;
    text: string;
    timestamp: string; // ISO string
  }>;
  participantNames?: { [userId: string]: string };
  timezone?: string;
}

export interface DecisionParticipants {
  agreed: string[];
  disagreed: string[];
  neutral: string[];
}

export interface DecisionTimeline {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export type ConsensusLevel =
  | "unanimous"
  | "strong"
  | "moderate"
  | "weak"
  | "none";

export interface DecisionSummary {
  question: string;
  finalDecision: string;
  participants: DecisionParticipants;
  timeline: DecisionTimeline;
  confidence: number; // 0-1
  keyMessages: string[];
  consensusLevel: ConsensusLevel;
}

export interface AISummarizeDecisionResponse {
  hasDecision: boolean;
  question?: string;
  finalDecision?: string;
  participants?: DecisionParticipants;
  timeline?: DecisionTimeline;
  confidence?: number;
  keyMessages?: string[];
  consensusLevel?: ConsensusLevel;
  message?: string; // For when no decision is found
}
