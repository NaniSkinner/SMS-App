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
 * Generate system prompt with current date/time context
 * @param timezone - IANA timezone string (e.g., "America/Los_Angeles"), defaults to UTC
 */
function getSystemPrompt(timezone: string = "UTC"): string {
  const now = new Date();

  // Format date and time in the user's timezone
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  return `You are a helpful scheduling assistant for busy parents.

CURRENT DATE AND TIME: ${dateStr} at ${timeStr}

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
8. When user says "today", "tomorrow", "next week", use the CURRENT DATE above as reference

When you detect a conflict:
- Explain what conflicts
- Mention when the conflict is
- Suggest alternatives`;
}

/**
 * Simple chat completion (no function calling)
 * For basic queries that don't need calendar operations
 */
export async function simpleChatCompletion(
  userMessage: string,
  conversationHistory?: ConversationTurn[],
  timezone: string = "UTC"
): Promise<string> {
  try {
    const client = await getClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt(timezone) },
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
  tools?: OpenAI.Chat.ChatCompletionTool[],
  timezone: string = "UTC"
): Promise<OpenAI.Chat.ChatCompletionMessage> {
  try {
    const client = await getClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt(timezone) },
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
export async function extractEventFromText(
  messageText: string,
  timezone: string = "America/Chicago"
): Promise<any> {
  try {
    const client = await getClient();

    // Get current date/time in user's timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });

    const prompt = `Extract scheduling information from the following text.

CURRENT DATE: ${currentDate}

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
1. Use the CURRENT DATE above when interpreting "today", "tomorrow", etc.
2. Extract explicit dates/times
3. Infer reasonable defaults (1 hour duration)
4. Flag ambiguous information
5. Be conservative - better to ask than guess wrong

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

/**
 * Summarize group decision from conversation messages
 */
export async function summarizeGroupDecision(
  messages: Array<{ senderId: string; text: string; timestamp: string }>,
  participantNames: { [userId: string]: string },
  timezone: string = "America/Chicago"
): Promise<any> {
  try {
    const client = await getClient();

    // Format messages for AI analysis
    const formattedMessages = messages
      .map((msg) => {
        const name = participantNames[msg.senderId] || "Unknown";
        const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: timezone,
        });
        return `[${time}] ${name}: ${msg.text}`;
      })
      .join("\n");

    // Calculate timeline
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const startTime = new Date(firstMessage.timestamp);
    const endTime = new Date(lastMessage.timestamp);
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    const prompt = `Analyze this group chat conversation and identify if a decision was made.

CONVERSATION:
${formattedMessages}

Output JSON format:
{
  "hasDecision": boolean,
  "question": string,
  "finalDecision": string,
  "participants": {
    "agreed": string[],
    "disagreed": string[],
    "neutral": string[]
  },
  "timeline": {
    "startTime": "HH:MM AM/PM",
    "endTime": "HH:MM AM/PM",
    "durationMinutes": number
  },
  "confidence": number (0-1),
  "keyMessages": string[],
  "consensusLevel": "unanimous" | "strong" | "moderate" | "weak" | "none"
}

Rules:
1. Only return hasDecision=true if there's a clear question and final decision
2. Question should be concise (e.g., "Where to eat?", "What time to meet?")
3. Final decision should be the agreed-upon choice
4. List participant names (not IDs) in agreed/disagreed/neutral arrays
5. Include 2-3 key messages that led to the decision
6. Consensus levels:
   - unanimous: Everyone agreed
   - strong: 80%+ agreed
   - moderate: 60-79% agreed
   - weak: 50-59% agreed
   - none: No clear majority
7. Be conservative - if no clear decision, return hasDecision=false
8. Consider phrases like "let's do X", "sounds good", "I'm in", "agree" as agreement
9. Consider phrases like "no", "I can't", "prefer Y" as disagreement

TIMELINE INFO:
- First message: ${startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    })}
- Last message: ${endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    })}
- Duration: ${durationMinutes} minutes`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("❌ Decision summarization error:", error);
    throw new AppError(
      `Decision summarization failed: ${error.message}`,
      500,
      "SUMMARIZATION_ERROR"
    );
  }
}

/**
 * Detect message priority/urgency level
 */
export async function detectMessagePriority(
  messageText: string,
  timezone: string = "America/Chicago"
): Promise<any> {
  try {
    const client = await getClient();

    // Get current date/time in user's timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });

    const prompt = `Analyze this message and determine its priority/urgency level for a busy parent managing family schedules.

CURRENT DATE: ${currentDate}
CURRENT TIME: ${currentTime}

Message: "${messageText}"

Output JSON format:
{
  "priority": "high" | "medium" | "low" | "none",
  "reason": string (one sentence explaining why),
  "urgencyFactors": string[] (list of factors that make this urgent),
  "actionRequired": boolean (does this need immediate action?),
  "confidence": number (0-1),
  "suggestedResponse": string (optional: suggested user response if urgent)
}

PRIORITY LEVELS:
- **high**: Immediate attention needed (emergencies, safety issues, time-critical actions due today/now)
  Examples: "URGENT", "EMERGENCY", "ASAP", "NOW", "school closes early", "pick up sick child", "appointment in 1 hour"
  
- **medium**: Important but not immediate (tasks due soon, coordination needed, actionable items)
  Examples: "by end of day", "tonight", "tomorrow morning", "need to decide", "form due Friday", "doctor appointment next week"
  
- **low**: Informational but worth noting (reminders, updates, non-urgent requests)
  Examples: "FYI", "reminder", "just checking", "next month", "when you get a chance"
  
- **none**: Normal conversation, no urgency (greetings, social chat, questions with no deadline)
  Examples: "how are you?", "thanks!", "sounds good", "maybe we should", general discussion

URGENCY INDICATORS:
- Time pressure: "today", "tonight", "now", "ASAP", "in X hours", "by [time]"
- Action required: "MUST", "NEED TO", "HAVE TO", "required", "mandatory", "please respond"
- Problems: "emergency", "urgent", "critical", "problem", "issue", "broken", "not working", "help needed"
- Health/Safety: "sick", "injured", "doctor", "hospital", "accident", "911"
- School/Childcare: "school", "pickup", "daycare", "teacher", "class", "early dismissal"
- Deadlines: "due", "deadline", "expires", "closes", "ends", "last chance"
- Caps/emphasis: UPPERCASE words, multiple exclamation marks

CONTEXT:
- This is for busy parents coordinating family schedules
- Higher priority for immediate family needs (children, health, safety)
- Lower priority for social planning, general questions, casual conversation
- Consider time sensitivity relative to CURRENT DATE/TIME above

Be conservative: only flag as "high" if truly urgent, most messages should be "none" or "low".`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2, // Very low temperature for consistent priority detection
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("❌ Priority detection error:", error);
    throw new AppError(
      `Priority detection failed: ${error.message}`,
      500,
      "PRIORITY_DETECTION_ERROR"
    );
  }
}

/**
 * Detect if a message is an event invitation
 * Uses GPT-4o to analyze if message contains an invitation to an event
 */
export async function detectInvitation(
  messageText: string,
  timezone: string = "America/Chicago"
): Promise<any> {
  try {
    const client = await getClient();

    // Get current date/time in user's timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });

    const prompt = `Analyze this message to determine if it's an invitation to an event or activity.

CURRENT DATE: ${currentDate}
CURRENT TIME: ${currentTime}

Message: "${messageText}"

Output JSON format:
{
  "isInvitation": boolean,
  "invitationType": "party" | "meeting" | "playdate" | "event" | "activity" | "other" | null,
  "eventTitle": string | null (brief title),
  "eventDate": string | null (extracted date),
  "eventTime": string | null (extracted time),
  "eventLocation": string | null (where),
  "invitationText": string | null (the key invitation phrase),
  "requiresRSVP": boolean (does it ask for confirmation?),
  "rsvpDeadline": string | null (when to respond by),
  "confidence": number (0-1)
}

WHAT COUNTS AS AN INVITATION:
✅ Direct invites: "Want to come to...", "You're invited to...", "Join us for..."
✅ Event announcements: "We're having a party...", "Birthday party at..."
✅ Activity proposals: "Let's meet for...", "How about we..."
✅ Playdates: "Kids playdate on Saturday", "Want to bring kids to the park?"
✅ Meetings: "Can we meet to discuss...", "Parent-teacher conference..."
✅ Group activities: "Anyone free for soccer practice?", "Team potluck next week"

❌ NOT invitations:
- Questions about availability ("Are you free Friday?")
- Tentative suggestions ("We should hang out sometime")
- General planning ("We need to schedule...")
- Past event mentions ("Thanks for coming yesterday")
- Event info without invite ("School event is next week")

CONTEXT:
- This is for busy parents coordinating family activities
- Invitations often involve children's activities, school events, social gatherings
- May be casual/informal language
- Often includes date, time, or location details
- Usually implies action: come, attend, join, participate

Be strict: Only mark as invitation if there's a clear invite to a specific event/activity.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("❌ Invitation detection error:", error);
    throw new AppError(
      `Invitation detection failed: ${error.message}`,
      500,
      "INVITATION_DETECTION_ERROR"
    );
  }
}

/**
 * Detect if a message is an RSVP response to an invitation
 * Uses GPT-4o to analyze responses like "yes", "can't make it", "maybe"
 */
export async function detectRSVPResponse(
  messageText: string,
  invitationText: string
): Promise<any> {
  try {
    const client = await getClient();

    const prompt = `Analyze if this message is an RSVP response to the given invitation.

INVITATION:
"${invitationText}"

RESPONSE MESSAGE:
"${messageText}"

Output JSON format:
{
  "isRSVP": boolean,
  "rsvpStatus": "yes" | "no" | "maybe" | null,
  "confidence": number (0-1),
  "reason": string | null (why you classified it this way),
  "numberOfPeople": number | null (how many people, if mentioned),
  "conditions": string | null (any conditions like "only if it's after 3pm")
}

YES responses (affirmative):
- "Yes", "Sure", "Sounds good", "Count me in", "We're in", "I'll be there"
- "We can make it", "I'm coming", "See you there", "Looking forward to it"
- "We'll come", "I'll bring the kids", "We'd love to"
- "+1", "✓", "👍"

NO responses (declining):
- "No", "Sorry", "Can't make it", "Won't be able to", "Have to pass"
- "Not available", "We're busy", "Prior commitment", "Can't attend"
- "Count us out", "We'll skip", "Not this time"
- "❌", "👎"

MAYBE responses (tentative):
- "Maybe", "Not sure", "Tentative", "Possibly", "I'll try"
- "Let me check", "Need to confirm", "Depends", "Might be able to"
- "I'll let you know", "Check calendar", "We'll see"
- "🤔", "❓"

NOT RSVP responses:
- Questions about the event ("What time is it?", "Where is it?")
- Unrelated messages
- General acknowledgments without commitment ("Thanks for inviting us")
- Messages from the event organizer themselves

CONTEXT:
- Responses can be casual/informal
- May include reasons or explanations
- May mention bringing others ("We'll bring the kids", "Family of 4")
- May have conditions ("Only if weather is good")

Be accurate: Match the tone and intent of the response.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("No response from OpenAI", 500, "NO_RESPONSE");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("❌ RSVP detection error:", error);
    throw new AppError(
      `RSVP detection failed: ${error.message}`,
      500,
      "RSVP_DETECTION_ERROR"
    );
  }
}
