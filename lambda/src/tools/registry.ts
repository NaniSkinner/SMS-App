/**
 * Tools Registry
 * Centralized registry of all OpenAI function calling tools
 * with their schemas and implementation handlers
 */

import { calendar_v3 } from "googleapis";
import OpenAI from "openai";
import {
  createCalendarEvent,
  detectConflicts,
  listCalendarEvents,
} from "../services/calendar";
import { findAlternativeTimes } from "./helpers";

/**
 * Tool Definition Interface
 * Combines OpenAI schema with implementation handler
 */
interface Tool {
  definition: OpenAI.Chat.ChatCompletionTool;
  handler: (args: any, userId: string, timezone?: string) => Promise<any>;
}

/**
 * Tool 1: Get Calendar Events
 * Fetches user's calendar events for a specific date range
 */
const getCalendarEvents: Tool = {
  definition: {
    type: "function",
    function: {
      name: "getCalendarEvents",
      description:
        "Fetch user's calendar events for a specific date range. Use this to check what's on the calendar, find free time, or verify event details.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description:
              "Start date in YYYY-MM-DD format (e.g., 2025-10-25). Use the date you computed from the user's query.",
          },
          endDate: {
            type: "string",
            description:
              "End date in YYYY-MM-DD format (e.g., 2025-10-25). For a single day, use the same date as startDate.",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },

  handler: async (
    args: { startDate: string; endDate: string },
    userId: string,
    timezone: string = "UTC"
  ) => {
    try {
      console.log(
        `📅 Tool: getCalendarEvents for ${args.startDate} to ${args.endDate} (timezone: ${timezone})`
      );

      // Validate dates
      if (!args.startDate || !args.endDate) {
        throw new Error("Both startDate and endDate are required");
      }

      // Parse dates
      const startDate = new Date(args.startDate + "T00:00:00");
      const endDate = new Date(args.endDate + "T23:59:59");

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      // Fetch events from Google Calendar
      const events = await listCalendarEvents(userId, startDate, endDate);

      // Format for OpenAI - using user's timezone
      const formattedEvents = events.map((event: calendar_v3.Schema$Event) => {
        const start = event.start?.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;

        return {
          title: event.summary || "Untitled Event",
          date: start ? start.toISOString().split("T")[0] : "Unknown",
          startTime: start
            ? start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: timezone,
              })
            : "Unknown",
          endTime: end
            ? end.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: timezone,
              })
            : "Unknown",
          location: event.location || null,
          description: event.description || null,
        };
      });

      console.log(`✅ Found ${formattedEvents.length} events`);

      return {
        success: true,
        eventCount: formattedEvents.length,
        events: formattedEvents,
        dateRange: {
          start: args.startDate,
          end: args.endDate,
        },
      };
    } catch (error: any) {
      console.error("❌ getCalendarEvents error:", error);

      // Provide helpful error messages based on error type
      let userMessage = error.message;
      if (
        error.message.includes("re-authenticate") ||
        error.message.includes("Calendar not connected")
      ) {
        userMessage =
          "It seems that I can't access your calendar at the moment because of an authentication issue. You might need to reconnect or re-authenticate your calendar to grant access.";
      } else if (error.message.includes("refresh")) {
        userMessage =
          "I'm having trouble refreshing your calendar access. Please disconnect and reconnect your Google Calendar in the app.";
      }

      return {
        success: false,
        error: userMessage,
        hint: "Please go to your profile and reconnect your Google Calendar.",
      };
    }
  },
};

/**
 * Tool 2: Create Calendar Event
 * Creates a new event in the user's Google Calendar
 */
const createCalendarEvent_Tool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "createCalendarEvent",
      description:
        "Create a new event in the user's Google Calendar. Always detect conflicts FIRST before creating an event. Get explicit user confirmation before calling this.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description:
              "Event title/summary (e.g., 'Family time', 'Dentist appointment')",
          },
          date: {
            type: "string",
            description: "Event date in YYYY-MM-DD format",
          },
          startTime: {
            type: "string",
            description:
              "Event start time in HH:MM format (24-hour, e.g., '15:00' for 3 PM)",
          },
          duration: {
            type: "number",
            description:
              "Event duration in minutes. Default to 60 if not specified.",
            default: 60,
          },
          description: {
            type: "string",
            description: "Optional event description/notes",
          },
          location: {
            type: "string",
            description: "Optional event location",
          },
        },
        required: ["title", "date", "startTime"],
      },
    },
  },

  handler: async (
    args: {
      title: string;
      date: string;
      startTime: string;
      duration?: number;
      description?: string;
      location?: string;
    },
    userId: string,
    timezone: string = "UTC"
  ) => {
    try {
      console.log(`📝 Tool: createCalendarEvent - "${args.title}"`);

      // Validate required fields
      if (!args.title || !args.date || !args.startTime) {
        throw new Error("title, date, and startTime are required");
      }

      // Set default duration if not provided
      const duration = args.duration || 60;

      // Create event via calendar service
      const createdEvent = await createCalendarEvent(userId, {
        title: args.title,
        date: args.date,
        startTime: args.startTime,
        duration,
        description: args.description,
        location: args.location,
      });

      console.log(`✅ Event created: ${createdEvent.id}`);

      return {
        success: true,
        message: "Event created successfully",
        event: {
          id: createdEvent.id,
          title: args.title,
          date: args.date,
          startTime: args.startTime,
          duration,
          location: args.location,
        },
      };
    } catch (error: any) {
      console.error("❌ createCalendarEvent error:", error);
      return {
        success: false,
        error: error.message,
        hint: "The event could not be created. The user may need to reconnect their calendar.",
      };
    }
  },
};

/**
 * Tool 3: Detect Conflicts
 * Checks if a proposed event conflicts with existing calendar events
 * and suggests alternative times if conflicts are found
 */
const detectConflicts_Tool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "detectConflicts",
      description:
        "Check if a proposed event conflicts with existing calendar events. Always call this BEFORE creating an event. Returns conflicts and suggests alternative times.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Proposed event date in YYYY-MM-DD format",
          },
          startTime: {
            type: "string",
            description: "Proposed start time in HH:MM format (24-hour)",
          },
          duration: {
            type: "number",
            description:
              "Proposed duration in minutes. Default to 60 if not specified.",
            default: 60,
          },
          title: {
            type: "string",
            description: "Optional: Event title for reference",
          },
        },
        required: ["date", "startTime"],
      },
    },
  },

  handler: async (
    args: {
      date: string;
      startTime: string;
      duration?: number;
      title?: string;
    },
    userId: string,
    timezone: string = "UTC"
  ) => {
    try {
      console.log(
        `🔍 Tool: detectConflicts for ${args.date} at ${args.startTime} (timezone: ${timezone})`
      );

      const duration = args.duration || 60;

      // Check for conflicts
      const result = await detectConflicts(userId, {
        date: args.date,
        startTime: args.startTime,
        duration,
      });

      if (!result.hasConflict) {
        console.log("✅ No conflicts detected");
        return {
          success: true,
          hasConflict: false,
          message: "No conflicts found. The time slot is available.",
        };
      }

      // Format conflicts - using user's timezone
      const conflicts = result.conflicts.map((c) => {
        const start = c.event.start?.dateTime
          ? new Date(c.event.start.dateTime)
          : null;
        const end = c.event.end?.dateTime
          ? new Date(c.event.end.dateTime)
          : null;

        return {
          title: c.event.summary || "Untitled Event",
          start: start
            ? start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: timezone,
              })
            : "Unknown",
          end: end
            ? end.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: timezone,
              })
            : "Unknown",
          overlapMinutes: c.overlapMinutes,
        };
      });

      console.log(`⚠️ Found ${conflicts.length} conflicts`);

      // Find alternative times
      const alternatives = await findAlternativeTimes(
        userId,
        args.date,
        duration
      );

      return {
        success: true,
        hasConflict: true,
        conflictCount: conflicts.length,
        conflicts,
        alternativeTimes: alternatives,
        suggestion:
          "The proposed time conflicts with existing events. Here are alternative available times.",
      };
    } catch (error: any) {
      console.error("❌ detectConflicts error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

/**
 * Tools Registry
 * Maps tool names to their definitions and handlers
 */
export const TOOLS: Record<string, Tool> = {
  getCalendarEvents,
  createCalendarEvent: createCalendarEvent_Tool,
  detectConflicts: detectConflicts_Tool,
};

/**
 * Get all tool definitions for OpenAI
 * Returns array of tool schemas to pass to the API
 */
export function getToolDefinitions(): OpenAI.Chat.ChatCompletionTool[] {
  return Object.values(TOOLS).map((tool) => tool.definition);
}

/**
 * Execute a tool by name
 * @param toolName - Name of the tool to execute
 * @param args - Tool arguments
 * @param userId - User ID for context
 * @returns Tool execution result
 */
export async function executeTool(
  toolName: string,
  args: any,
  userId: string,
  timezone: string = "UTC"
): Promise<any> {
  const tool = TOOLS[toolName];

  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  console.log(`🔧 Executing tool: ${toolName} (timezone: ${timezone})`);
  return await tool.handler(args, userId, timezone);
}
