/**
 * AI Service
 * Handles communication with the AI Lambda backend
 * Includes retry logic, timeout handling, and comprehensive error handling
 */

import {
  AIChatRequest,
  AIChatResponse,
  AIExtractEventRequest,
  AIExtractEventResponse,
  AISummarizeDecisionRequest,
  AISummarizeDecisionResponse,
  ApiResponse,
} from "@/types";

// Lambda API Gateway endpoint
const AI_API_BASE_URL =
  "https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging";

// Configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

/**
 * Create a fetch request with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - AI service took too long to respond");
    }
    throw error;
  }
};

/**
 * Retry logic for transient failures
 * Returns true if error is retryable, false otherwise
 */
const isRetryableError = (error: any, statusCode?: number): boolean => {
  // Retry on network errors
  if (error.message?.includes("Network request failed")) return true;
  if (error.message?.includes("timeout")) return true;

  // Retry on 5xx server errors (not 4xx client errors)
  if (statusCode && statusCode >= 500) return true;

  // Don't retry on 4xx errors (bad request, auth issues, etc)
  return false;
};

/**
 * Execute request with retry logic
 */
const executeWithRetry = async <T>(
  requestFn: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: any) {
    const shouldRetry =
      retryCount < MAX_RETRY_ATTEMPTS &&
      isRetryableError(error, error.statusCode);

    if (shouldRetry) {
      const delay = RETRY_DELAYS[retryCount] || 4000;
      console.log(
        `⚠️ Request failed, retrying in ${delay}ms (attempt ${
          retryCount + 1
        }/${MAX_RETRY_ATTEMPTS})...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return executeWithRetry(requestFn, retryCount + 1);
    }

    throw error;
  }
};

/**
 * Validate input before making API calls
 */
const validateChatInput = (
  userId: string,
  messageText: string
): { valid: boolean; error?: string } => {
  if (!userId || userId.trim().length === 0) {
    return { valid: false, error: "User ID is required" };
  }

  if (!messageText || messageText.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (messageText.length > 5000) {
    return {
      valid: false,
      error: "Message is too long (max 5000 characters)",
    };
  }

  return { valid: true };
};

/**
 * Send a chat message to the AI and get a response
 * Includes input validation, retry logic, and timeout handling
 */
export const sendAIChat = async (
  userId: string,
  messageText: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ApiResponse<AIChatResponse>> => {
  try {
    // Validate input
    const validation = validateChatInput(userId, messageText);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Detect user's timezone automatically
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const request: AIChatRequest = {
      userId,
      message: messageText.trim(), // Lambda expects "message" field
      conversationHistory,
      timezone, // Send user's timezone to Lambda
    };

    console.log("🤖 Sending AI chat request:", {
      userId,
      messageLength: messageText.length,
      timezone,
      hasHistory: !!conversationHistory?.length,
    });

    // Execute with retry logic
    const data = await executeWithRetry(async () => {
      const response = await fetchWithTimeout(
        `${AI_API_BASE_URL}/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ AI chat error:", response.status, errorText);

        // Attach status code for retry logic
        const error: any = new Error(
          `AI request failed: ${response.status} - ${errorText.substring(
            0,
            100
          )}`
        );
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    });

    console.log("✅ AI chat response received");

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ AI chat service error:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to communicate with AI service";

    if (error.message?.includes("timeout")) {
      errorMessage =
        "Request timed out. The AI is taking too long to respond. Please try again.";
    } else if (error.message?.includes("Network request failed")) {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (error.statusCode === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.statusCode >= 500) {
      errorMessage = "AI service is temporarily unavailable. Please try again.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Extract event information from natural language text
 * Includes input validation, retry logic, and timeout handling
 */
export const extractEventFromText = async (
  userId: string,
  messageText: string
): Promise<ApiResponse<AIExtractEventResponse>> => {
  try {
    // Validate input
    const validation = validateChatInput(userId, messageText);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Detect user's timezone automatically
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const request: AIExtractEventRequest = {
      userId,
      messageText: messageText.trim(),
      timezone, // Send timezone for accurate date interpretation
    };

    console.log("📅 Extracting event from text:", {
      userId,
      messageLength: messageText.length,
      timezone,
    });

    // Execute with retry logic
    const data = await executeWithRetry(async () => {
      const response = await fetchWithTimeout(
        `${AI_API_BASE_URL}/ai/extract-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Event extraction error:", response.status, errorText);

        const error: any = new Error(
          `Event extraction failed: ${response.status} - ${errorText.substring(
            0,
            100
          )}`
        );
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    });

    console.log("✅ Event extraction response:", {
      hasEvent: data.hasEvent,
      eventTitle: data.event?.title,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ Event extraction service error:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to extract event information";

    if (error.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.message?.includes("Network request failed")) {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (error.statusCode >= 500) {
      errorMessage =
        "Event extraction service is temporarily unavailable. Please try again.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Summarize decision from group chat messages
 * Includes input validation, retry logic, and timeout handling
 */
export const summarizeDecision = async (
  userId: string,
  conversationId: string,
  messages: Array<{ senderId: string; text: string; timestamp: string }>,
  participantNames?: { [userId: string]: string }
): Promise<ApiResponse<AISummarizeDecisionResponse>> => {
  try {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    if (!conversationId || conversationId.trim().length === 0) {
      return {
        success: false,
        error: "Conversation ID is required",
      };
    }

    if (!messages || messages.length === 0) {
      return {
        success: false,
        error: "Messages are required",
      };
    }

    // Detect user's timezone automatically
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const request: AISummarizeDecisionRequest = {
      userId,
      conversationId,
      messages,
      participantNames,
      timezone,
    };

    console.log("💡 Summarizing decision from chat:", {
      userId,
      conversationId,
      messageCount: messages.length,
      timezone,
    });

    // Execute with retry logic
    const data = await executeWithRetry(async () => {
      const response = await fetchWithTimeout(
        `${AI_API_BASE_URL}/ai/summarize-decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Decision summarization error:",
          response.status,
          errorText
        );

        const error: any = new Error(
          `Decision summarization failed: ${
            response.status
          } - ${errorText.substring(0, 100)}`
        );
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    });

    console.log("✅ Decision summarization response:", {
      hasDecision: data.hasDecision,
      question: data.question,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ Decision summarization service error:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to summarize decision";

    if (error.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.message?.includes("Network request failed")) {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (error.statusCode >= 500) {
      errorMessage =
        "Decision summarization service is temporarily unavailable. Please try again.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Detect message priority
 * Analyzes a message to determine its urgency level
 */
export const detectPriority = async (
  messageText: string,
  messageId: string,
  conversationId: string,
  userId?: string,
  timezone?: string
): Promise<
  ApiResponse<{
    hasPriority: boolean;
    priority: "high" | "medium" | "low" | "none";
    reason?: string;
    urgencyFactors?: string[];
    actionRequired?: boolean;
    confidence?: number;
  }>
> => {
  try {
    console.log("🚨 Detecting priority for message:", messageId);

    const requestBody = {
      messageText,
      messageId,
      conversationId,
      userId,
      timezone: timezone || "America/Chicago",
    };

    const response = await executeWithRetry(async () => {
      return await fetchWithTimeout(
        `${AI_API_BASE_URL}/ai/detect-priority`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
        REQUEST_TIMEOUT
      );
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        message: errorData.error || "Priority detection failed",
        statusCode: response.status,
        code: errorData.code,
      };
    }

    const data = await response.json();

    console.log(
      `✅ Priority detection complete: ${data.priority}`,
      data.hasPriority ? `- "${data.reason}"` : ""
    );

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ Priority detection error:", error);

    // User-friendly error messages
    let errorMessage = "Failed to detect priority. Please try again.";

    if (error.code === "RATE_LIMIT_EXCEEDED") {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message?.includes("timeout")) {
      errorMessage =
        "Request timed out. The AI service is taking too long to respond.";
    } else if (error.message?.includes("Network request failed")) {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (error.statusCode >= 500) {
      errorMessage =
        "Priority detection service is temporarily unavailable. Please try again.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Health check for AI service
 */
export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ AI service health:", data);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ AI service health check failed:", error);
    return false;
  }
};
