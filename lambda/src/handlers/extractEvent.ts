/**
 * Extract Event Handler
 * Handles POST /ai/extract-event endpoint
 * Enhanced with conflict detection and alternative time suggestions
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { calendar_v3 } from "googleapis";
import moment from "moment-timezone";
import { detectConflicts } from "../services/calendar";
import { extractEventFromText } from "../services/openai";
import { findAlternativeTimes } from "../tools/helpers";
import {
  AppError,
  CalendarEvent,
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

    // Get timezone from request or default to Chicago
    const timezone = request.timezone || "America/Chicago";

    // Extract event using OpenAI (with current date context)
    const extraction = await extractEventFromText(
      request.messageText,
      timezone
    );

    // If no event found, return early
    if (!extraction.hasEvent || !extraction.event) {
      console.log("ℹ️ No event found in message");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: JSON.stringify({
          hasEvent: false,
          needsConfirmation: false,
        } as ExtractEventResponse),
      };
    }

    console.log(
      `✅ Event extracted: ${extraction.event.title} on ${extraction.event.date} at ${extraction.event.time}`
    );

    // Check for conflicts
    console.log("🔍 Checking for calendar conflicts...");
    let conflictsList: CalendarEvent[] = [];
    let alternativeTimes: string[] = [];

    try {
      const conflictResult = await detectConflicts(request.userId, {
        date: extraction.event.date,
        startTime: extraction.event.time,
        duration: extraction.event.duration,
        timezone, // Pass user's timezone for accurate conflict detection
      });

      if (conflictResult.hasConflict) {
        console.log(`⚠️ Found ${conflictResult.conflicts.length} conflict(s)`);

        // Convert Google Calendar events to our CalendarEvent format
        conflictsList = conflictResult.conflicts.map((conflict) =>
          convertGoogleEventToCalendarEvent(
            conflict.event,
            conflict.overlapMinutes,
            timezone // Pass timezone for proper time conversion
          )
        );

        // Find alternative times
        console.log("🔍 Finding alternative time slots...");
        alternativeTimes = await findAlternativeTimes(
          request.userId,
          extraction.event.date,
          extraction.event.duration,
          timezone // Pass timezone for proper time formatting
        );

        console.log(`💡 Found ${alternativeTimes.length} alternative slots`);
      } else {
        console.log("✅ No conflicts detected");
      }
    } catch (conflictError: any) {
      // If calendar access fails, still return the extracted event
      // but indicate that conflict detection couldn't be performed
      console.warn(
        "⚠️ Conflict detection failed:",
        conflictError.message || conflictError
      );

      // Check if it's a calendar access error
      if (
        conflictError.message &&
        conflictError.message.includes("Calendar not connected")
      ) {
        // User needs to connect calendar - this is OK, still return the event
        console.log("ℹ️ Calendar not connected, skipping conflict detection");
      } else {
        // Other error - log but continue
        console.error("Unexpected conflict detection error:", conflictError);
      }
    }

    // Determine if confirmation is needed
    const needsConfirmation =
      extraction.needsConfirmation || // Low confidence from extraction
      extraction.event.confidence < 0.7 || // Below confidence threshold
      conflictsList.length > 0 || // Has conflicts
      (extraction.event.ambiguousFields &&
        extraction.event.ambiguousFields.length > 0); // Has ambiguous fields

    // Build response
    const response: ExtractEventResponse = {
      hasEvent: true,
      event: extraction.event,
      conflicts: conflictsList,
      needsConfirmation,
      alternativeTimes: conflictsList.length > 0 ? alternativeTimes : undefined,
    };

    console.log(
      `✅ Event extraction completed: ${
        conflictsList.length > 0 ? "Conflicts detected" : "No conflicts"
      }, needsConfirmation: ${needsConfirmation}`
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

/**
 * Convert Google Calendar event to our CalendarEvent format
 * Now with proper timezone conversion!
 */
function convertGoogleEventToCalendarEvent(
  googleEvent: calendar_v3.Schema$Event,
  overlapMinutes?: number,
  timezone: string = "America/Chicago"
): CalendarEvent {
  // Extract start and end times
  const startDateTime = googleEvent.start?.dateTime;
  const endDateTime = googleEvent.end?.dateTime;

  if (!startDateTime || !endDateTime) {
    throw new Error("Event missing start or end time");
  }

  // Google Calendar returns times in ISO format with timezone offset
  // e.g., "2025-10-25T14:00:00-05:00"
  // We need to convert these to the user's timezone for display

  const startMoment = moment(startDateTime).tz(timezone);
  const endMoment = moment(endDateTime).tz(timezone);

  // Format date as YYYY-MM-DD
  const date = startMoment.format("YYYY-MM-DD");

  // Format times as HH:MM in user's timezone
  const startTime = startMoment.format("HH:mm");
  const endTime = endMoment.format("HH:mm");

  // Calculate duration
  const duration = endMoment.diff(startMoment, "minutes");

  console.log(
    `🔄 Converted event: ${googleEvent.summary} ${startDateTime} → ${startTime} (${timezone})`
  );

  return {
    id: googleEvent.id,
    title: googleEvent.summary || "Untitled Event",
    date,
    startTime,
    endTime,
    duration,
    description: googleEvent.description,
    location: googleEvent.location,
    overlapMinutes, // Add overlap info if provided
  } as CalendarEvent & { overlapMinutes?: number };
}
