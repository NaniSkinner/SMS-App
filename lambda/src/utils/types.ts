/**
 * TypeScript type definitions for MessageAI Lambda
 */

// API Request/Response Types
export interface ChatRequest {
  userId: string;
  message: string;
  conversationHistory?: ConversationTurn[];
  timezone?: string; // IANA timezone (e.g., "America/Los_Angeles")
}

export interface ChatResponse {
  reply: string;
  reasoning?: string[];
  toolsCalled?: string[];
  events?: CalendarEvent[];
}

export interface ExtractEventRequest {
  messageText: string;
  userId: string;
  conversationId?: string;
  messageId?: string;
  timezone?: string; // User's timezone for date interpretation
}

export interface ExtractEventResponse {
  hasEvent: boolean;
  event?: ExtractedEvent;
  conflicts?: CalendarEvent[];
  needsConfirmation?: boolean;
  alternativeTimes?: string[]; // Suggested alternative time slots when conflicts exist
}

export interface DetectConflictsRequest {
  userId: string;
  proposedEvent: ProposedEvent;
}

export interface DetectConflictsResponse {
  hasConflict: boolean;
  conflicts?: CalendarEvent[];
  alternativeTimes?: string[];
}

// AI/OpenAI Types
export interface ConversationTurn {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
  reasoning?: string[];
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
  executedAt?: Date;
}

// Calendar Types
export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  description?: string;
  location?: string;
  overlapMinutes?: number; // For conflicts: how many minutes overlap with proposed event
}

export interface ExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  confidence: number; // 0-1
  ambiguousFields?: string[];
}

export interface ProposedEvent {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  title?: string;
}

// Secrets Types
export interface OpenAISecrets {
  apiKey: string;
}

export interface FirebaseSecrets {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export interface GoogleOAuthSecrets {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
