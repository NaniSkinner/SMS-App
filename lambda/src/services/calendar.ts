/**
 * Google Calendar Service
 * Handles all calendar operations with token management and refresh
 */

import { calendar_v3, google } from "googleapis";
import moment from "moment-timezone";
import { getFirestore } from "./firebase";
import { getGoogleOAuthCredentials } from "./secrets";

// Cache for calendar clients (keyed by userId)
const clientCache = new Map<string, calendar_v3.Calendar>();

// Cache for calendar events (5 min TTL with smart invalidation)
interface CachedEvents {
  events: calendar_v3.Schema$Event[];
  timestamp: number;
  isStale?: boolean; // For stale-while-revalidate strategy
}
const eventsCache = new Map<string, CachedEvents>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 1 * 60 * 1000; // 1 minute - after this, data is "stale" but still usable

// Prefetch tracking
const prefetchQueue = new Set<string>();
const lastPrefetchTime = new Map<string, number>();
const PREFETCH_DEBOUNCE = 30 * 1000; // 30 seconds between prefetches for same user

/**
 * Get OAuth2 client with user's tokens
 * Automatically refreshes token if expired
 */
async function getOAuthClient(userId: string) {
  try {
    // Get OAuth credentials from Secrets Manager
    const credentials = await getGoogleOAuthCredentials();

    // For iOS native OAuth, we need to use the iOS client credentials
    // The tokens were obtained using iOS client, so we must refresh with the same client
    const { client_id, client_secret } = credentials;

    // Create OAuth2 client
    // Note: redirect_uri doesn't matter for token refresh, only for initial auth
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "com.googleusercontent.apps." +
        client_id.split("-")[0] +
        ":/oauth2redirect/google"
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
    // Handle Firestore Timestamp conversion properly
    let expiryTimestamp: number | undefined;
    if (tokenData.expiresAt) {
      // Firebase Admin SDK stores dates as Firestore Timestamp objects
      if (typeof tokenData.expiresAt.toDate === "function") {
        // It's a Firestore Timestamp
        expiryTimestamp = tokenData.expiresAt.toDate().getTime();
      } else if (tokenData.expiresAt._seconds) {
        // Legacy format with _seconds
        expiryTimestamp = tokenData.expiresAt._seconds * 1000;
      } else if (tokenData.expiresAt instanceof Date) {
        // It's already a Date object
        expiryTimestamp = tokenData.expiresAt.getTime();
      }
    }

    oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      expiry_date: expiryTimestamp,
    });

    console.log(
      `🔑 OAuth credentials set for user ${userId}, expires: ${
        expiryTimestamp ? new Date(expiryTimestamp).toISOString() : "unknown"
      }`
    );

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
 * Enhanced with stale-while-revalidate strategy
 */
export async function listCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date,
  options: {
    forceRefresh?: boolean;
    allowStale?: boolean;
  } = {}
): Promise<calendar_v3.Schema$Event[]> {
  try {
    const cacheKey = `${userId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    const cached = eventsCache.get(cacheKey);
    const now = Date.now();

    // Force refresh bypasses all cache
    if (options.forceRefresh) {
      console.log("🔄 Force refreshing calendar events");
      return await fetchAndCacheEvents(userId, startDate, endDate, cacheKey);
    }

    // If cached and fresh, return immediately
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log("📦 Returning fresh cached events");

      // Trigger background refresh if data is getting stale (but still valid)
      if (now - cached.timestamp > STALE_TIME) {
        console.log("🔄 Triggering background refresh (data is stale)");
        // Don't await - refresh in background
        refreshInBackground(userId, startDate, endDate, cacheKey).catch((err) =>
          console.error("Background refresh failed:", err)
        );
      }

      return cached.events;
    }

    // If cached but expired, but allowStale is true, return stale data while fetching
    if (cached && options.allowStale) {
      console.log("📦 Returning stale cached events while refreshing");
      // Refresh in background
      refreshInBackground(userId, startDate, endDate, cacheKey).catch((err) =>
        console.error("Background refresh failed:", err)
      );
      return cached.events;
    }

    // If we have stale cache but API fails, return stale as fallback
    try {
      return await fetchAndCacheEvents(userId, startDate, endDate, cacheKey);
    } catch (error) {
      // If API fails but we have stale cache, return it
      if (cached) {
        console.warn("⚠️ API failed, returning stale cache as fallback");
        return cached.events;
      }
      throw error;
    }
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
 * Helper: Fetch events from API and cache them
 */
async function fetchAndCacheEvents(
  userId: string,
  startDate: Date,
  endDate: Date,
  cacheKey: string
): Promise<calendar_v3.Schema$Event[]> {
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
    isStale: false,
  });

  console.log(`✅ Retrieved ${events.length} calendar events`);
  return events;
}

/**
 * Helper: Refresh cache in background (non-blocking)
 */
async function refreshInBackground(
  userId: string,
  startDate: Date,
  endDate: Date,
  cacheKey: string
): Promise<void> {
  // Mark as stale immediately
  const cached = eventsCache.get(cacheKey);
  if (cached) {
    cached.isStale = true;
  }

  // Fetch fresh data
  await fetchAndCacheEvents(userId, startDate, endDate, cacheKey);
  console.log("✅ Background refresh completed");
}

/**
 * Prefetch calendar events for upcoming dates
 * Useful to warm the cache before user needs the data
 */
export async function prefetchCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const now = Date.now();
  const prefetchKey = `${userId}-${startDate.toISOString()}`;

  // Check if we recently prefetched for this user/date
  const lastPrefetch = lastPrefetchTime.get(prefetchKey);
  if (lastPrefetch && now - lastPrefetch < PREFETCH_DEBOUNCE) {
    console.log("⏭️ Skipping prefetch (too soon since last prefetch)");
    return;
  }

  // Check if already in prefetch queue
  if (prefetchQueue.has(prefetchKey)) {
    console.log("⏭️ Skipping prefetch (already in queue)");
    return;
  }

  prefetchQueue.add(prefetchKey);
  lastPrefetchTime.set(prefetchKey, now);

  console.log(
    `🔮 Prefetching calendar events for ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  try {
    // Use allowStale to avoid blocking
    await listCalendarEvents(userId, startDate, endDate, { allowStale: true });
    console.log("✅ Prefetch completed");
  } catch (error) {
    console.error("⚠️ Prefetch failed:", error);
  } finally {
    prefetchQueue.delete(prefetchKey);
  }
}

/**
 * Smart cache invalidation - invalidate only relevant caches
 * Called after create/update/delete operations
 */
export function invalidateEventsCacheForDate(
  userId: string,
  eventDate: Date
): void {
  console.log(`🗑️ Invalidating event cache for ${eventDate.toISOString()}`);

  // Find all cache entries for this user that overlap with the event date
  const startOfDay = new Date(eventDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(eventDate);
  endOfDay.setHours(23, 59, 59, 999);

  let invalidatedCount = 0;
  for (const [key] of eventsCache) {
    if (key.startsWith(userId)) {
      // Parse the date range from cache key
      // Format: userId-startDate-endDate
      const parts = key.split("-");
      if (parts.length >= 3) {
        try {
          // Reconstruct the date strings (they might have hyphens in them)
          const startDateStr = parts.slice(1, parts.length - 1).join("-");
          const endDateStr = parts[parts.length - 1];

          const cachedStart = new Date(startDateStr);
          const cachedEnd = new Date(endDateStr);

          // Check if event date overlaps with cached range
          if (eventDate >= cachedStart && eventDate <= cachedEnd) {
            eventsCache.delete(key);
            invalidatedCount++;
          }
        } catch (error) {
          // If parsing fails, invalidate to be safe
          eventsCache.delete(key);
          invalidatedCount++;
        }
      }
    }
  }

  console.log(`✅ Invalidated ${invalidatedCount} cache entries`);
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
    // Format for Google Calendar: YYYY-MM-DDTHH:MM:SS in local timezone
    // Google Calendar will interpret this in the specified timeZone
    const dateTimeString = `${eventDetails.date}T${eventDetails.startTime}:00`;

    // Calculate end time
    const [hour, minute] = eventDetails.startTime.split(":").map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + eventDetails.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTimeString = `${eventDetails.date}T${String(endHour).padStart(
      2,
      "0"
    )}:${String(endMinute).padStart(2, "0")}:00`;

    // Use America/Chicago timezone (user's timezone)
    const userTimezone = "America/Chicago";

    const event: calendar_v3.Schema$Event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      location: eventDetails.location,
      start: {
        dateTime: dateTimeString,
        timeZone: userTimezone,
      },
      end: {
        dateTime: endTimeString,
        timeZone: userTimezone,
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    // Smart cache invalidation - only invalidate caches for this date
    const eventDateObj = new Date(eventDetails.date);
    invalidateEventsCacheForDate(userId, eventDateObj);

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
      const dateTimeString = `${updates.date}T${updates.startTime}:00`;

      // Calculate end time
      const [hour, minute] = updates.startTime.split(":").map(Number);
      const startMinutes = hour * 60 + minute;
      const duration = updates.duration || 60; // default 1 hour
      const endMinutes = startMinutes + duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTimeString = `${updates.date}T${String(endHour).padStart(
        2,
        "0"
      )}:${String(endMinute).padStart(2, "0")}:00`;

      const userTimezone = "America/Chicago";

      event.start = {
        dateTime: dateTimeString,
        timeZone: userTimezone,
      };
      event.end = {
        dateTime: endTimeString,
        timeZone: userTimezone,
      };
    }

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    // Smart cache invalidation - invalidate old and new dates
    // Invalidate old date
    if (existingEvent.data.start?.dateTime) {
      const oldDate = new Date(existingEvent.data.start.dateTime);
      invalidateEventsCacheForDate(userId, oldDate);
    }
    // Invalidate new date if it changed
    if (updates.date) {
      const newDate = new Date(updates.date);
      invalidateEventsCacheForDate(userId, newDate);
    }

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

    // Get event details before deleting (to know which cache to invalidate)
    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    // Smart cache invalidation - only invalidate caches for the event's date
    if (existingEvent.data.start?.dateTime) {
      const eventDate = new Date(existingEvent.data.start.dateTime);
      invalidateEventsCacheForDate(userId, eventDate);
    }

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
    timezone?: string; // IANA timezone (e.g., "America/Chicago")
  }
): Promise<{
  hasConflict: boolean;
  conflicts: Array<{
    event: calendar_v3.Schema$Event;
    overlapMinutes: number;
  }>;
}> {
  try {
    // Get user's timezone
    const timezone = proposedEvent.timezone || "America/Chicago";

    console.log(`🌍 Detecting conflicts in timezone: ${timezone}`);
    console.log(
      `📋 Proposed event: ${proposedEvent.date} at ${proposedEvent.startTime}`
    );

    // Use moment-timezone for accurate timezone handling
    // Create the proposed start time in the user's timezone
    const proposedStartMoment = moment.tz(
      `${proposedEvent.date} ${proposedEvent.startTime}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    // Calculate end time
    const proposedEndMoment = proposedStartMoment
      .clone()
      .add(proposedEvent.duration, "minutes");

    // Convert to JavaScript Date objects (in UTC)
    const proposedStart = proposedStartMoment.toDate();
    const proposedEnd = proposedEndMoment.toDate();

    console.log(`⏰ Proposed start (UTC): ${proposedStart.toISOString()}`);
    console.log(`⏰ Proposed end (UTC): ${proposedEnd.toISOString()}`);

    // Get events for that day (use full day in user's timezone)
    const dayStartMoment = moment
      .tz(proposedEvent.date, "YYYY-MM-DD", timezone)
      .startOf("day");
    const dayEndMoment = dayStartMoment.clone().endOf("day");

    const dayStart = dayStartMoment.toDate();
    const dayEnd = dayEndMoment.toDate();

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
 * Invalidate all caches for a user (use sparingly - prefer invalidateEventsCacheForDate)
 * @deprecated Use invalidateEventsCacheForDate for more targeted cache invalidation
 */
export function invalidateUserCache(userId: string): void {
  console.log(`🗑️ Invalidating ALL caches for user ${userId}`);

  // Remove client cache
  clientCache.delete(userId);

  // Remove all events cache entries for this user
  let invalidatedCount = 0;
  for (const [key] of eventsCache) {
    if (key.startsWith(userId)) {
      eventsCache.delete(key);
      invalidatedCount++;
    }
  }

  console.log(`✅ Invalidated ${invalidatedCount} cache entries`);
}
