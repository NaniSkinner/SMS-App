/**
 * Google Calendar Service
 * Handles all calendar operations with token management and refresh
 */

import { calendar_v3, google } from "googleapis";
import { getFirestore } from "./firebase";
import { getGoogleOAuthCredentials } from "./secrets";

// Cache for calendar clients (keyed by userId)
const clientCache = new Map<string, calendar_v3.Calendar>();

// Cache for calendar events (5 min TTL)
interface CachedEvents {
  events: calendar_v3.Schema$Event[];
  timestamp: number;
}
const eventsCache = new Map<string, CachedEvents>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get OAuth2 client with user's tokens
 * Automatically refreshes token if expired
 */
async function getOAuthClient(userId: string) {
  try {
    // Get OAuth credentials from Secrets Manager
    const { client_id, client_secret } = await getGoogleOAuthCredentials();

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "https://auth.expo.io/@naniskinner/messageapp" // redirect URI (not used server-side)
    );

    // Get user's tokens from Firestore
    const db = getFirestore();
    const tokenDoc = await db
      .collection("users")
      .doc(userId)
      .collection("tokens")
      .doc("google")
      .get();

    if (!tokenDoc.exists) {
      throw new Error("Calendar not connected. User needs to authenticate.");
    }

    const tokenData = tokenDoc.data();
    if (!tokenData) {
      throw new Error("Invalid token data");
    }

    // Set credentials
    oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      expiry_date: tokenData.expiresAt?._seconds
        ? tokenData.expiresAt._seconds * 1000
        : undefined,
    });

    // Check if token is expired and refresh if needed
    const expiryDate = new Date(oauth2Client.credentials.expiry_date || 0);
    const now = new Date();

    if (expiryDate <= now) {
      console.log("🔄 Access token expired, refreshing...");

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Update tokens in Firestore
        const newExpiresAt = new Date(credentials.expiry_date || 0);
        await db
          .collection("users")
          .doc(userId)
          .collection("tokens")
          .doc("google")
          .update({
            accessToken: credentials.access_token,
            expiresAt: newExpiresAt,
            updatedAt: new Date(),
          });

        console.log("✅ Token refreshed successfully");
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        throw new Error(
          "Failed to refresh calendar access token. User needs to re-authenticate."
        );
      }
    }

    return oauth2Client;
  } catch (error) {
    console.error("Error getting OAuth client:", error);
    throw error;
  }
}

/**
 * Get Calendar API client for a user
 */
async function getCalendarClient(
  userId: string
): Promise<calendar_v3.Calendar> {
  // Check cache first
  if (clientCache.has(userId)) {
    return clientCache.get(userId)!;
  }

  const auth = await getOAuthClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  // Cache the client
  clientCache.set(userId, calendar);

  return calendar;
}

/**
 * List calendar events for a date range
 */
export async function listCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<calendar_v3.Schema$Event[]> {
  try {
    // Check cache
    const cacheKey = `${userId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    const cached = eventsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("📦 Returning cached events");
      return cached.events;
    }

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    const events = response.data.items || [];

    // Cache the results
    eventsCache.set(cacheKey, {
      events,
      timestamp: Date.now(),
    });

    console.log(`✅ Retrieved ${events.length} calendar events`);
    return events;
  } catch (error: any) {
    console.error("Error listing calendar events:", error);

    if (error.code === 401 || error.code === 403) {
      throw new Error(
        "Calendar access denied. Please reconnect your calendar."
      );
    }

    throw error;
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  userId: string,
  eventDetails: {
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    duration: number; // minutes
    description?: string;
    location?: string;
  }
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = await getCalendarClient(userId);

    // Parse date and time
    const [year, month, day] = eventDetails.date.split("-").map(Number);
    const [hour, minute] = eventDetails.startTime.split(":").map(Number);

    const startDateTime = new Date(year, month - 1, day, hour, minute);
    const endDateTime = new Date(
      startDateTime.getTime() + eventDetails.duration * 60 * 1000
    );

    const event: calendar_v3.Schema$Event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      location: eventDetails.location,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/New_York", // TODO: Get user's timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/New_York",
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    // Invalidate cache for this user
    invalidateUserCache(userId);

    console.log("✅ Calendar event created:", response.data.id);
    return response.data;
  } catch (error: any) {
    console.error("Error creating calendar event:", error);

    if (error.code === 401 || error.code === 403) {
      throw new Error(
        "Calendar access denied. Please reconnect your calendar."
      );
    }

    throw error;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: Partial<{
    title: string;
    date: string;
    startTime: string;
    duration: number;
    description: string;
    location: string;
  }>
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = await getCalendarClient(userId);

    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    const event: calendar_v3.Schema$Event = { ...existingEvent.data };

    // Update fields
    if (updates.title) {
      event.summary = updates.title;
    }
    if (updates.description !== undefined) {
      event.description = updates.description;
    }
    if (updates.location !== undefined) {
      event.location = updates.location;
    }

    // Update date/time if provided
    if (updates.date && updates.startTime) {
      const [year, month, day] = updates.date.split("-").map(Number);
      const [hour, minute] = updates.startTime.split(":").map(Number);

      const startDateTime = new Date(year, month - 1, day, hour, minute);
      const duration = updates.duration || 60; // default 1 hour
      const endDateTime = new Date(
        startDateTime.getTime() + duration * 60 * 1000
      );

      event.start = {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/New_York",
      };
      event.end = {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/New_York",
      };
    }

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    // Invalidate cache
    invalidateUserCache(userId);

    console.log("✅ Calendar event updated:", response.data.id);
    return response.data;
  } catch (error: any) {
    console.error("Error updating calendar event:", error);

    if (error.code === 401 || error.code === 403) {
      throw new Error(
        "Calendar access denied. Please reconnect your calendar."
      );
    }
    if (error.code === 404) {
      throw new Error("Event not found");
    }

    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = await getCalendarClient(userId);

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    // Invalidate cache
    invalidateUserCache(userId);

    console.log("✅ Calendar event deleted:", eventId);
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);

    if (error.code === 401 || error.code === 403) {
      throw new Error(
        "Calendar access denied. Please reconnect your calendar."
      );
    }
    if (error.code === 404) {
      throw new Error("Event not found");
    }

    throw error;
  }
}

/**
 * Detect conflicts for a proposed event
 */
export async function detectConflicts(
  userId: string,
  proposedEvent: {
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    duration: number; // minutes
  }
): Promise<{
  hasConflict: boolean;
  conflicts: Array<{
    event: calendar_v3.Schema$Event;
    overlapMinutes: number;
  }>;
}> {
  try {
    // Parse proposed event times
    const [year, month, day] = proposedEvent.date.split("-").map(Number);
    const [hour, minute] = proposedEvent.startTime.split(":").map(Number);

    const proposedStart = new Date(year, month - 1, day, hour, minute);
    const proposedEnd = new Date(
      proposedStart.getTime() + proposedEvent.duration * 60 * 1000
    );

    // Get events for that day
    const dayStart = new Date(year, month - 1, day, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

    const events = await listCalendarEvents(userId, dayStart, dayEnd);

    // Check for overlaps
    const conflicts: Array<{
      event: calendar_v3.Schema$Event;
      overlapMinutes: number;
    }> = [];

    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue;

      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Check if there's an overlap
      const hasOverlap = proposedStart < eventEnd && proposedEnd > eventStart;

      if (hasOverlap) {
        // Calculate overlap duration
        const overlapStart =
          proposedStart > eventStart ? proposedStart : eventStart;
        const overlapEnd = proposedEnd < eventEnd ? proposedEnd : eventEnd;
        const overlapMs = overlapEnd.getTime() - overlapStart.getTime();
        const overlapMinutes = Math.floor(overlapMs / (60 * 1000));

        conflicts.push({
          event,
          overlapMinutes,
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  } catch (error) {
    console.error("Error detecting conflicts:", error);
    throw error;
  }
}

/**
 * Invalidate cache for a user
 */
function invalidateUserCache(userId: string) {
  // Remove client cache
  clientCache.delete(userId);

  // Remove events cache entries for this user
  for (const [key] of eventsCache) {
    if (key.startsWith(userId)) {
      eventsCache.delete(key);
    }
  }
}
