/**
 * Lambda Handler: Detect RSVP Response
 * Analyzes messages to detect yes/no/maybe responses to event invitations
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { detectRSVPResponse as analyzeRSVP } from "../services/openai";
import {
  AppError,
  DetectRSVPRequest,
  DetectRSVPResponse,
} from "../utils/types";

export async function handleDetectRSVP(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("✅ Detect RSVP handler invoked");

  try {
    // Parse request body
    if (!event.body) {
      throw new AppError("Request body is required", 400);
    }

    const request: DetectRSVPRequest = JSON.parse(event.body);
    const {
      messageText,
      invitationText,
      senderId,
      senderName,
      conversationId,
    } = request;

    // Validate required fields
    if (!messageText) {
      throw new AppError("messageText is required", 400);
    }
    if (!invitationText) {
      throw new AppError("invitationText is required", 400);
    }

    console.log(
      `📨 Analyzing RSVP response from ${senderName}: "${messageText.substring(
        0,
        50
      )}..."`
    );

    // Call OpenAI to detect RSVP
    const result = await analyzeRSVP(messageText, invitationText);

    // Build response
    const response: DetectRSVPResponse = {
      isRSVP: result.isRSVP,
      rsvpStatus: result.rsvpStatus,
      confidence: result.confidence,
      reason: result.reason,
      numberOfPeople: result.numberOfPeople,
      conditions: result.conditions,
    };

    console.log(
      `✅ RSVP detection complete: ${
        result.isRSVP ? result.rsvpStatus : "NOT AN RSVP"
      }`
    );
    if (result.isRSVP) {
      console.log(
        `   Confidence: ${result.confidence}, People: ${
          result.numberOfPeople || 1
        }`
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
    console.error("❌ Error in detectRSVP handler:", error);

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
