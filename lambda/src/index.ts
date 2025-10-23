/**
 * MessageAI Lambda Function
 * AI-powered scheduling assistant
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Main Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const path = event.path;
  const method = event.httpMethod;

  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  // Handle OPTIONS (CORS preflight)
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Route requests
    if (path === "/health" && method === "GET") {
      return handleHealth();
    } else if (path === "/ai/chat" && method === "POST") {
      return handleAIChat(event, headers);
    } else if (path === "/ai/extract-event" && method === "POST") {
      return handleExtractEvent(event, headers);
    } else if (path === "/ai/detect-conflicts" && method === "POST") {
      return handleDetectConflicts(event, headers);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Not found" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

// Health check endpoint
function handleHealth(): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      service: "messageai-lambda",
    }),
  };
}

// AI Chat endpoint (placeholder)
async function handleAIChat(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const { userId, message, conversationHistory } = body;

  // Validate request
  if (!userId || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing userId or message" }),
    };
  }

  // TODO: Call OpenAI API (Phase 0.2)
  // For now, return mock response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      reply: `Hello! You said: "${message}". I'm your AI scheduling assistant. (OpenAI integration coming in Phase 0.2)`,
      reasoning: ["Received your message", "Ready to assist with scheduling"],
      toolsCalled: [],
      events: [],
    }),
  };
}

// Extract event endpoint (placeholder)
async function handleExtractEvent(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const { messageText, userId } = body;

  if (!messageText || !userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing messageText or userId" }),
    };
  }

  // TODO: Implement event extraction (Phase 2)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      hasEvent: false,
      message: "Event extraction coming in Phase 2",
    }),
  };
}

// Detect conflicts endpoint (placeholder)
async function handleDetectConflicts(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const { userId, proposedEvent } = body;

  if (!userId || !proposedEvent) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing userId or proposedEvent" }),
    };
  }

  // TODO: Implement conflict detection (Phase 2)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      hasConflict: false,
      conflicts: [],
      message: "Conflict detection coming in Phase 2",
    }),
  };
}
