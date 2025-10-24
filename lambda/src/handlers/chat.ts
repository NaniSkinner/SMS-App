/**
 * Chat Handler
 * Handles POST /ai/chat endpoint with function calling support
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import OpenAI from "openai";
import {
  chatWithFunctions,
  chatWithMessagesAndTools,
} from "../services/openai";
import { executeTool, getToolDefinitions } from "../tools/registry";
import { AppError, ChatRequest, ChatResponse } from "../utils/types";

/**
 * Handle chat requests with multi-turn function calling orchestration
 */
export async function handleChat(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("💬 Handling chat request with function calling");

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

    // Get tool definitions for OpenAI
    const tools = getToolDefinitions();

    // Track reasoning and tools called for transparency
    const reasoning: string[] = [];
    const toolsCalled: string[] = [];

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Add conversation history if provided
    if (request.conversationHistory) {
      for (const turn of request.conversationHistory) {
        messages.push({
          role: turn.role as "system" | "user" | "assistant",
          content: turn.content || "",
        });
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: request.message,
    });

    // Multi-turn orchestration loop
    let response = await chatWithFunctions(
      request.message,
      request.conversationHistory,
      tools
    );

    const MAX_ITERATIONS = 5; // Prevent infinite loops
    let iterations = 0;

    while (response.tool_calls && iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`🔄 Tool calling iteration ${iterations}`);

      // Add assistant's response with tool calls to messages
      messages.push({
        role: "assistant",
        content: response.content || null,
        tool_calls: response.tool_calls,
      });

      // Execute each tool call
      for (const toolCall of response.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`🔧 Calling tool: ${toolName}`);
        console.log(`📋 Arguments:`, toolArgs);

        reasoning.push(
          `Called ${toolName} with parameters: ${JSON.stringify(toolArgs)}`
        );
        toolsCalled.push(toolName);

        try {
          // Execute the tool
          const toolResult = await executeTool(
            toolName,
            toolArgs,
            request.userId
          );

          console.log(`✅ Tool result:`, toolResult);

          // Add tool result to messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });

          reasoning.push(
            `${toolName} result: ${JSON.stringify(toolResult).substring(
              0,
              100
            )}...`
          );
        } catch (error: any) {
          console.error(`❌ Tool execution error:`, error);

          // Add error as tool result
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: error.message,
              success: false,
            }),
          });

          reasoning.push(`${toolName} failed: ${error.message}`);
        }
      }

      // Call OpenAI again with tool results
      console.log("🤖 Calling OpenAI with tool results...");
      response = await chatWithMessagesAndTools(messages, tools);
    }

    // Final response from AI (natural language)
    const finalReply =
      response.content ||
      "I've completed the operation, but I don't have additional details to share.";

    console.log("✅ Chat request completed successfully");
    console.log(`📊 Tools called: ${toolsCalled.join(", ") || "none"}`);

    // Build response
    const chatResponse: ChatResponse = {
      reply: finalReply,
      reasoning,
      toolsCalled,
      events: [], // Events are embedded in the AI's response
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: JSON.stringify(chatResponse),
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
