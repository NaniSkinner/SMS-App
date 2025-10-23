/**
 * Extract Event Handler
 * Handles POST /ai/extract-event endpoint
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { extractEventFromText } from "../services/openai";
import {
  AppError,
  ExtractEventRequest,
  ExtractEventResponse,
} from "../utils/types";

/**
 * Handle event extraction requests
 */
export async function handleExtractEvent(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("📅 Handling extract event request");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }

    const request: ExtractEventRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.messageText || request.messageText.trim().length === 0) {
      throw new AppError(
        "messageText is required",
        400,
        "MISSING_MESSAGE_TEXT"
      );
    }

    if (!request.userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    console.log(`📨 Extracting event from: "${request.messageText}"`);

    // Extract event using OpenAI
    const extraction = await extractEventFromText(request.messageText);

    // Build response
    const response: ExtractEventResponse = {
      hasEvent: extraction.hasEvent,
      event: extraction.event,
      conflicts: [], // TODO: Add conflict detection in next phase
      needsConfirmation: extraction.needsConfirmation,
    };

    console.log(
      `✅ Event extraction completed: ${
        extraction.hasEvent ? "Event found" : "No event"
      }`
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
    console.error("❌ Extract event handler error:", error);

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
