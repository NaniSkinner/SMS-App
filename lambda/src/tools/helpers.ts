/**
 * Tool Helpers
 * Helper functions for tool operations
 */

import moment from "moment-timezone";
import { listCalendarEvents } from "../services/calendar";

/**
 * Find alternative available time slots
 * Strategy: Check same day first, then next day, then next 7 days
 *
 * @param userId - User ID
 * @param proposedDate - Originally proposed date (YYYY-MM-DD)
 * @param duration - Required duration in minutes
 * @returns Array of available time slots
 */
export async function findAlternativeTimes(
  userId: string,
  proposedDate: string,
  duration: number,
  timezone: string = "America/Chicago"
): Promise<string[]> {
  const alternatives: string[] = [];

  try {
    // Define business hours (8 AM to 8 PM)
    const BUSINESS_START = 8; // 8 AM
    const BUSINESS_END = 20; // 8 PM

    // Parse the proposed date
    const [year, month, day] = proposedDate.split("-").map(Number);
    const proposedDateObj = new Date(year, month - 1, day);

    // Strategy 1: Same day alternatives
    console.log("🔍 Looking for alternatives on same day...");
    const sameDaySlots = await findFreeSlotsForDay(
      userId,
      proposedDateObj,
      duration,
      BUSINESS_START,
      BUSINESS_END,
      timezone
    );

    if (sameDaySlots.length > 0) {
      alternatives.push(
        ...sameDaySlots.slice(0, 3).map((slot) => {
          const date = proposedDate;
          const time = formatTime(slot.hour, slot.minute);
          return `${date} at ${time}`;
        })
      );
    }

    // Strategy 2: Next day alternatives
    if (alternatives.length < 3) {
      console.log("🔍 Looking for alternatives on next day...");
      const nextDay = new Date(proposedDateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      const nextDaySlots = await findFreeSlotsForDay(
        userId,
        nextDay,
        duration,
        BUSINESS_START,
        BUSINESS_END,
        timezone
      );

      if (nextDaySlots.length > 0) {
        const nextDateStr = formatDate(nextDay);
        alternatives.push(
          ...nextDaySlots.slice(0, 3 - alternatives.length).map((slot) => {
            const time = formatTime(slot.hour, slot.minute);
            return `${nextDateStr} at ${time}`;
          })
        );
      }
    }

    // Strategy 3: Next 7 days (if still need more options)
    if (alternatives.length < 3) {
      console.log("🔍 Looking for alternatives in next 7 days...");
      for (let i = 2; i <= 7 && alternatives.length < 5; i++) {
        const futureDay = new Date(proposedDateObj);
        futureDay.setDate(futureDay.getDate() + i);

        const daySlots = await findFreeSlotsForDay(
          userId,
          futureDay,
          duration,
          BUSINESS_START,
          BUSINESS_END,
          timezone
        );

        if (daySlots.length > 0) {
          const dateStr = formatDate(futureDay);
          const dayName = futureDay.toLocaleDateString("en-US", {
            weekday: "short",
          });
          alternatives.push(
            ...daySlots.slice(0, 1).map((slot) => {
              const time = formatTime(slot.hour, slot.minute);
              return `${dayName} ${dateStr} at ${time}`;
            })
          );
        }
      }
    }

    console.log(`✅ Found ${alternatives.length} alternative time slots`);
    return alternatives;
  } catch (error) {
    console.error("Error finding alternative times:", error);
    return [];
  }
}

/**
 * Find free time slots for a specific day
 *
 * @param userId - User ID
 * @param date - Date to check
 * @param duration - Required duration in minutes
 * @param startHour - Start of business hours (24-hour format)
 * @param endHour - End of business hours (24-hour format)
 * @param timezone - User's IANA timezone
 * @returns Array of free time slots
 */
async function findFreeSlotsForDay(
  userId: string,
  date: Date,
  duration: number,
  startHour: number,
  endHour: number,
  timezone: string = "America/Chicago"
): Promise<Array<{ hour: number; minute: number }>> {
  // Get day boundaries using moment-timezone
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

  const dayStartMoment = moment
    .tz(dateStr, "YYYY-MM-DD", timezone)
    .startOf("day");
  const dayEndMoment = dayStartMoment.clone().endOf("day");

  const dayStart = dayStartMoment.toDate();
  const dayEnd = dayEndMoment.toDate();

  // Fetch events for the day
  const events = await listCalendarEvents(userId, dayStart, dayEnd);

  console.log(`📅 Found ${events.length} events on ${dateStr}`);

  // Create list of busy time blocks (convert to user's timezone)
  const busyBlocks: Array<{ start: Date; end: Date }> = events
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => {
      const start = new Date(e.start!.dateTime!);
      const end = new Date(e.end!.dateTime!);
      console.log(
        `  📌 Busy: ${
          e.summary
        } from ${start.toISOString()} to ${end.toISOString()}`
      );
      return { start, end };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Find free slots
  const freeSlots: Array<{ hour: number; minute: number }> = [];

  // Start from business hours start in user's timezone
  let currentTimeMoment = moment
    .tz(dateStr, "YYYY-MM-DD", timezone)
    .hour(startHour)
    .minute(0)
    .second(0);
  const businessEndMoment = currentTimeMoment
    .clone()
    .hour(endHour)
    .minute(0)
    .second(0);

  // Iterate through the day in 30-minute increments
  while (currentTimeMoment.isBefore(businessEndMoment)) {
    const slotStart = currentTimeMoment.toDate();
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    // Check if this slot is free (doesn't overlap with any busy block)
    const isFree = !busyBlocks.some((block) => {
      // Overlap check: slot starts before block ends AND slot ends after block starts
      const overlaps = slotStart < block.end && slotEnd > block.start;
      if (overlaps) {
        console.log(
          `  ❌ Slot ${currentTimeMoment.format(
            "HH:mm"
          )} conflicts with ${block.start.toISOString()}`
        );
      }
      return overlaps;
    });

    // Check if slot end is within business hours
    const slotEndMoment = moment(slotEnd).tz(timezone);
    const isWithinBusinessHours =
      slotEndMoment.isSameOrBefore(businessEndMoment);

    if (isFree && isWithinBusinessHours) {
      console.log(`  ✅ Free slot found: ${currentTimeMoment.format("HH:mm")}`);
      freeSlots.push({
        hour: currentTimeMoment.hour(),
        minute: currentTimeMoment.minute(),
      });
    }

    // Move to next 30-minute slot
    currentTimeMoment.add(30, "minutes");
  }

  console.log(`✅ Found ${freeSlots.length} free slots for ${dateStr}`);
  return freeSlots;
}

/**
 * Format time in 12-hour format (e.g., "3:00 PM")
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
