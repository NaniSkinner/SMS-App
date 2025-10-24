/**
 * OpenAI Service
 * Handles all interactions with OpenAI API including function calling
 */

import OpenAI from "openai";
import { AppError, ConversationTurn } from "../utils/types";
import { getOpenAIKey } from "./secrets";

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client (lazy initialization)
 */
async function getClient(): Promise<OpenAI> {
  if (openaiClient) {
    return openaiClient;
  }

  try {
    const apiKey = await getOpenAIKey();
    openaiClient = new OpenAI({ apiKey });
    console.log("✅ OpenAI client initialized");
    return openaiClient;
  } catch (error: any) {
    console.error("❌ Failed to initialize OpenAI client:", error);
    throw new AppError(
      "Failed to initialize OpenAI service",
      500,
      "OPENAI_INIT_ERROR"
    );
  }
}

/**
 * System prompt for the scheduling assistant
 */
const SYSTEM_PROMPT = `You are a helpful scheduling assistant for busy parents.

Your capabilities:
- Check calendar events
- Create new events
- Detect scheduling conflicts
- Suggest available times

Guidelines:
1. Always confirm before modifying calendar
2. Be concise but friendly
3. Show your reasoning when suggesting times
4. Ask clarifying questions for ambiguous dates
5. Prioritize user's explicit preferences
6. Default to 1-hour duration if not specified
7. Use 12-hour time format (3 PM, not 15:00)

When you detect a conflict:
- Explain what conflicts
- Mention when the conflict is
- Suggest alternatives`;

/**
 * Simple chat completion (no function calling)
 * For basic queries that don't need calendar operations
 */
export async function simpleChatCompletion(
  userMessage: string,
  conversationHistory?: ConversationTurn[]
): Promise<string> {
  try {
    const client = await getClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history if provided
    if (conversationHistory) {
      for (const turn of conversationHistory) {
        messages.push({
          role: turn.role as "system" | "user" | "assistant",
          content: turn.content,
        });
      }
    }

    // Add current user message
    messages.push({ role: "user", content: userMessage });

    console.log(`🤖 Calling OpenAI with ${messages.length} messages`);

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "I apologize, but I could not generate a response.";

    console.log("✅ OpenAI response received");
    return reply;
  } catch (error: any) {
    console.error("❌ OpenAI API error:", error);

    if (error.code === "rate_limit_exceeded") {
      throw new AppError(
        "AI assistant is busy. Please try again in a moment.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }

    if (error.code === "context_length_exceeded") {
      throw new AppError(
        "Conversation is too long. Please start a new conversation.",
        400,
        "CONTEXT_LENGTH_EXCEEDED"
      );
    }

    throw new AppError(
      `OpenAI API error: ${error.message}`,
      500,
      "OPENAI_API_ERROR"
    );
  }
}

/**
 * Chat completion with function calling support
 * For queries that may need calendar operations
 */
export async function chatWithFunctions(
  userMessage: string,
  conversationHistory?: ConversationTurn[],
  tools?: OpenAI.Chat.ChatCompletionTool[]
): Promise<OpenAI.Chat.ChatCompletionMessage> {
  try {
    const client = await getClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (conversationHistory) {
      for (const turn of conversationHistory) {
        messages.push({
          role: turn.role as "system" | "user" | "assistant",
          content: turn.content,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: userMessage });

    console.log(
      `🤖 Calling OpenAI with function calling (${messages.length} messages)`
    );

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const message = response.choices[0]?.message;

    if (!message) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    console.log("✅ OpenAI response received");
    if (message.tool_calls) {
      console.log(`🔧 Function calls requested: ${message.tool_calls.length}`);
    }

    return message;
  } catch (error: any) {
    console.error("❌ OpenAI API error:", error);

    if (error.code === "rate_limit_exceeded") {
      throw new AppError(
        "AI assistant is busy. Please try again in a moment.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }

    throw new AppError(
      `OpenAI API error: ${error.message}`,
      500,
      "OPENAI_API_ERROR"
    );
  }
}

/**
 * Chat completion with messages array and tools
 * For multi-turn orchestration where we need full control over the messages
 */
export async function chatWithMessagesAndTools(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  tools?: OpenAI.Chat.ChatCompletionTool[]
): Promise<OpenAI.Chat.ChatCompletionMessage> {
  try {
    const client = await getClient();

    console.log(`🤖 Calling OpenAI with ${messages.length} messages and tools`);

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const message = response.choices[0]?.message;

    if (!message) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    console.log("✅ OpenAI response received");
    if (message.tool_calls) {
      console.log(`🔧 Function calls requested: ${message.tool_calls.length}`);
    }

    return message;
  } catch (error: any) {
    console.error("❌ OpenAI API error:", error);

    if (error.code === "rate_limit_exceeded") {
      throw new AppError(
        "AI assistant is busy. Please try again in a moment.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }

    throw new AppError(
      `OpenAI API error: ${error.message}`,
      500,
      "OPENAI_API_ERROR"
    );
  }
}

/**
 * Extract event information from text
 */
export async function extractEventFromText(messageText: string): Promise<any> {
  try {
    const client = await getClient();

    const prompt = `Extract scheduling information from the following text.

Output JSON format:
{
  "hasEvent": boolean,
  "event": {
    "title": string,
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "duration": number (minutes),
    "confidence": number (0-1)
  },
  "ambiguousFields": string[],
  "needsConfirmation": boolean
}

Rules:
1. Extract explicit dates/times
2. Infer reasonable defaults (1 hour duration)
3. Flag ambiguous information
4. Be conservative - better to ask than guess wrong

Text: "${messageText}"`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("❌ Event extraction error:", error);
    throw new AppError(
      `Event extraction failed: ${error.message}`,
      500,
      "EXTRACTION_ERROR"
    );
  }
}
