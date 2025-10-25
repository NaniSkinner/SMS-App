/**
 * Summarize Decision Handler
 * Handles POST /ai/summarize-decision endpoint
 * Analyzes group chat messages to extract decision-making information
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { summarizeGroupDecision } from "../services/openai";
import {
  AppError,
  SummarizeDecisionRequest,
  SummarizeDecisionResponse,
} from "../utils/types";

/**
 * Handle decision summarization requests
 */
export async function handleSummarizeDecision(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("💡 Handling summarize decision request");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }

    const request: SummarizeDecisionRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.messages || request.messages.length === 0) {
      throw new AppError(
        "messages array is required and cannot be empty",
        400,
        "MISSING_MESSAGES"
      );
    }

    if (!request.userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    if (!request.conversationId) {
      throw new AppError(
        "conversationId is required",
        400,
        "MISSING_CONVERSATION_ID"
      );
    }

    console.log(
      `📨 Analyzing ${request.messages.length} messages for decision-making`
    );

    // Get timezone from request or default to Chicago
    const timezone = request.timezone || "America/Chicago";

    // Analyze messages using OpenAI
    const summary = await summarizeGroupDecision(
      request.messages,
      request.participantNames || {},
      timezone
    );

    // If no decision found, return early
    if (!summary.hasDecision) {
      console.log("ℹ️ No clear decision found in conversation");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: JSON.stringify({
          hasDecision: false,
          message: "No clear decision was found in this conversation.",
        } as SummarizeDecisionResponse),
      };
    }

    console.log(
      `✅ Decision identified: "${summary.question}" → "${summary.finalDecision}"`
    );

    // Build response
    const response: SummarizeDecisionResponse = {
      hasDecision: true,
      question: summary.question,
      finalDecision: summary.finalDecision,
      participants: summary.participants,
      timeline: summary.timeline,
      confidence: summary.confidence,
      keyMessages: summary.keyMessages,
      consensusLevel: summary.consensusLevel,
    };

    console.log(
      `✅ Decision summary completed: ${summary.participants.agreed.length} agreed, ${summary.participants.disagreed.length} disagreed, consensus: ${summary.consensusLevel}`
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
    console.error("❌ Summarize decision handler error:", error);

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
