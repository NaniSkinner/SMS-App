/**
 * Detect Priority Handler
 * Handles POST /ai/detect-priority endpoint
 * Analyzes message text to determine urgency level and priority
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { detectMessagePriority } from "../services/openai";
import {
  AppError,
  DetectPriorityRequest,
  DetectPriorityResponse,
} from "../utils/types";

/**
 * Handle priority detection requests
 */
export async function handleDetectPriority(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("🚨 Handling priority detection request");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }

    const request: DetectPriorityRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.messageText || request.messageText.trim().length === 0) {
      throw new AppError(
        "messageText is required and cannot be empty",
        400,
        "MISSING_MESSAGE_TEXT"
      );
    }

    if (!request.messageId) {
      throw new AppError("messageId is required", 400, "MISSING_MESSAGE_ID");
    }

    if (!request.conversationId) {
      throw new AppError(
        "conversationId is required",
        400,
        "MISSING_CONVERSATION_ID"
      );
    }

    console.log(
      `📨 Analyzing message: "${request.messageText.substring(0, 50)}..."`
    );

    // Get timezone from request or default to Chicago
    const timezone = request.timezone || "America/Chicago";

    // Analyze message priority using OpenAI
    const priorityAnalysis = await detectMessagePriority(
      request.messageText,
      timezone
    );

    // If no priority detected (normal message), return early
    if (priorityAnalysis.priority === "none") {
      console.log("ℹ️ No priority detected - normal message");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: JSON.stringify({
          hasPriority: false,
          priority: "none",
          confidence: priorityAnalysis.confidence,
        } as DetectPriorityResponse),
      };
    }

    console.log(
      `✅ Priority detected: ${priorityAnalysis.priority} (confidence: ${priorityAnalysis.confidence})`
    );

    // Build response
    const response: DetectPriorityResponse = {
      hasPriority: true,
      priority: priorityAnalysis.priority,
      reason: priorityAnalysis.reason,
      urgencyFactors: priorityAnalysis.urgencyFactors,
      actionRequired: priorityAnalysis.actionRequired,
      confidence: priorityAnalysis.confidence,
      suggestedResponse: priorityAnalysis.suggestedResponse,
    };

    console.log(
      `✅ Priority analysis completed: ${priorityAnalysis.priority} - "${priorityAnalysis.reason}"`
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error("❌ Priority detection handler error:", error);

    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: error.message,
          code: error.code,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
    };
  }
}
