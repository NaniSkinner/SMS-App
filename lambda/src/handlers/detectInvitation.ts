/**
 * Lambda Handler: Detect Event Invitation
 * Analyzes messages to determine if they contain an event invitation
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { detectInvitation as analyzeInvitation } from "../services/openai";
import {
  AppError,
  DetectInvitationRequest,
  DetectInvitationResponse,
} from "../utils/types";

export async function handleDetectInvitation(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("🎉 Detect invitation handler invoked");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400);
    }

    const request: DetectInvitationRequest = JSON.parse(event.body);
    const { messageText, conversationId, senderId, timezone } = request;

    // Validate required fields
    if (!messageText) {
      throw new AppError("messageText is required", 400);
    }

    console.log(
      `📨 Analyzing message for invitation: "${messageText.substring(
        0,
        50
      )}..."`
    );

    // Call OpenAI to detect invitation
    const result = await analyzeInvitation(
      messageText,
      timezone || "America/Chicago"
    );

    // Build response
    const response: DetectInvitationResponse = {
      isInvitation: result.isInvitation,
      invitationType: result.invitationType,
      eventTitle: result.eventTitle,
      eventDate: result.eventDate,
      eventTime: result.eventTime,
      eventLocation: result.eventLocation,
      invitationText: result.invitationText,
      requiresRSVP: result.requiresRSVP,
      rsvpDeadline: result.rsvpDeadline,
      confidence: result.confidence,
    };

    console.log(
      `✅ Invitation detection complete: ${result.isInvitation ? "YES" : "NO"}`
    );
    if (result.isInvitation) {
      console.log(
        `   Type: ${result.invitationType}, Title: ${result.eventTitle}`
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("❌ Error in detectInvitation handler:", error);

    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
