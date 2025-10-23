/**
 * MessageAI Lambda Handler
 * Main entry point for the AI-powered scheduling assistant
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { handleChat } from "./handlers/chat";
import { handleExtractEvent } from "./handlers/extractEvent";
import { initializeFirebase } from "./services/firebase";

// Initialize Firebase on cold start
let firebaseInitialized = false;

async function ensureFirebaseInitialized() {
  if (!firebaseInitialized) {
    await initializeFirebase();
    firebaseInitialized = true;
  }
}

/**
 * Main Lambda handler
 * Routes requests to appropriate handlers based on path and method
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("🚀 Lambda invoked:", {
    path: event.path,
    method: event.httpMethod,
    requestId: context.awsRequestId,
  });

  const startTime = Date.now();

  try {
    // Initialize Firebase if not already done
    await ensureFirebaseInitialized();

    // Handle OPTIONS for CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        body: "",
      };
    }

    // Route to appropriate handler
    const path = event.path;
    const method = event.httpMethod;

    // Health check endpoint
    if (path === "/health" && method === "GET") {
      const duration = Date.now() - startTime;
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          status: "ok",
          version: "1.1.0",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "unknown",
          responseTime: `${duration}ms`,
          features: {
            openaiIntegration: true,
            firebaseIntegration: true,
            secretsManager: true,
          },
        }),
      };
    }

    // AI Chat endpoint
    if (path === "/ai/chat" && method === "POST") {
      return await handleChat(event);
    }

    // Extract Event endpoint
    if (path === "/ai/extract-event" && method === "POST") {
      return await handleExtractEvent(event);
    }

    // Detect Conflicts endpoint (placeholder)
    if (path === "/ai/detect-conflicts" && method === "POST") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          hasConflict: false,
          conflicts: [],
          message:
            "Conflict detection coming in Phase 0.3 (Google Calendar integration)",
        }),
      };
    }

    // Unknown endpoint
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Endpoint not found",
        path,
        method,
      }),
    };
  } catch (error: any) {
    console.error("❌ Unhandled error in Lambda handler:", error);

    const duration = Date.now() - startTime;

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
        requestId: context.awsRequestId,
        responseTime: `${duration}ms`,
      }),
    };
  }
};
