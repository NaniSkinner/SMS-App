/**
 * Chat Handler
 * Handles POST /ai/chat endpoint
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { simpleChatCompletion } from "../services/openai";
import { AppError, ChatRequest, ChatResponse } from "../utils/types";

/**
 * Handle chat requests
 * Basic implementation - will add function calling later
 */
export async function handleChat(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("💬 Handling chat request");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }

    const request: ChatRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    if (!request.message || request.message.trim().length === 0) {
      throw new AppError("message is required", 400, "MISSING_MESSAGE");
    }

    console.log(`📨 User ${request.userId}: "${request.message}"`);

    // Call OpenAI for simple chat completion
    const reply = await simpleChatCompletion(
      request.message,
      request.conversationHistory
    );

    // Build response
    const response: ChatResponse = {
      reply,
      reasoning: ["Basic chat completion (function calling coming soon)"],
      toolsCalled: [],
      events: [],
    };

    console.log("✅ Chat request completed successfully");

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
    console.error("❌ Chat handler error:", error);

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
