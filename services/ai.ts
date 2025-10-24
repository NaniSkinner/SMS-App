/**
 * AI Service
 * Handles communication with the AI Lambda backend
 */

import {
  AIChatRequest,
  AIChatResponse,
  AIExtractEventRequest,
  AIExtractEventResponse,
  ApiResponse,
} from "@/types";

// Lambda API Gateway endpoint
const AI_API_BASE_URL =
  "https://ouydtx31yk.execute-api.us-east-2.amazonaws.com/staging";

/**
 * Send a chat message to the AI and get a response
 */
export const sendAIChat = async (
  userId: string,
  messageText: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ApiResponse<AIChatResponse>> => {
  try {
    // Detect user's timezone automatically
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const request: AIChatRequest = {
      userId,
      message: messageText, // Lambda expects "message" field
      conversationHistory,
      timezone, // Send user's timezone to Lambda
    };

    console.log("🤖 Sending AI chat request:", {
      userId,
      messageLength: messageText.length,
      timezone,
    });

    const response = await fetch(`${AI_API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI chat error:", response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data: AIChatResponse = await response.json();
    console.log("✅ AI chat response received");

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ AI chat service error:", error);
    return {
      success: false,
      error: error.message || "Failed to communicate with AI service",
    };
  }
};

/**
 * Extract event information from natural language text
 */
export const extractEventFromText = async (
  userId: string,
  messageText: string
): Promise<ApiResponse<AIExtractEventResponse>> => {
  try {
    const request: AIExtractEventRequest = {
      userId,
      messageText,
    };

    console.log("📅 Extracting event from text:", {
      userId,
      messageLength: messageText.length,
    });

    const response = await fetch(`${AI_API_BASE_URL}/ai/extract-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Event extraction error:", response.status, errorText);
      throw new Error(`Event extraction failed: ${response.status}`);
    }

    const data: AIExtractEventResponse = await response.json();
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
    return {
      success: false,
      error: error.message || "Failed to extract event information",
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
