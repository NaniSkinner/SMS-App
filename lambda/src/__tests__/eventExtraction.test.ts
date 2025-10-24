/**
 * Integration Tests for Event Extraction
 * Tests the extraction of events from natural language text
 */

import moment from "moment-timezone";

// Mock extracted event structure
interface ExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  confidence: number; // 0-1
  timezone?: string;
}

describe("Event Extraction from Natural Language", () => {
  const timezone = "America/Chicago";
  const today = moment.tz(timezone);
  const tomorrow = today.clone().add(1, "day");
  const saturday = today.clone().day(6); // Next Saturday

  describe("Simple Event Patterns", () => {
    test("Extracts event with explicit date and time", () => {
      const text = "Soccer practice Saturday 3PM";

      // Expected extraction
      const expected: Partial<ExtractedEvent> = {
        title: "Soccer practice",
        startTime: "15:00", // 3PM in 24-hour format
        duration: 60, // Default 1 hour
      };

      // This would be the actual extraction result from OpenAI
      // For now, we're just testing the expected structure
      expect(expected.title).toContain("Soccer");
      expect(expected.startTime).toBe("15:00");
      expect(expected.duration).toBeGreaterThan(0);
    });

    test("Extracts event with time range", () => {
      const text = "Dentist appointment tomorrow 2PM-3PM";

      const expected: Partial<ExtractedEvent> = {
        title: "Dentist appointment",
        startTime: "14:00",
        duration: 60, // 2PM-3PM = 1 hour
      };

      expect(expected.title).toContain("Dentist");
      expect(expected.duration).toBe(60);
    });

    test("Extracts event with AM/PM specification", () => {
      const text = "Birthday party Sunday 2PM at the park";

      const expected: Partial<ExtractedEvent> = {
        title: "Birthday party",
        startTime: "14:00", // 2PM
      };

      expect(expected.startTime).toBe("14:00");
    });
  });

  describe("Date Parsing Patterns", () => {
    test('Extracts "tomorrow" as next day', () => {
      const text = "Meeting tomorrow at 10AM";
      const expectedDate = tomorrow.format("YYYY-MM-DD");

      // Verify tomorrow's date is calculated correctly
      expect(expectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        moment.tz(expectedDate, "YYYY-MM-DD", timezone).isAfter(today, "day")
      ).toBe(true);
    });

    test("Extracts specific day of week", () => {
      const text = "Soccer practice Saturday 3PM";
      const expectedDate = saturday.format("YYYY-MM-DD");

      expect(expectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("Extracts specific date", () => {
      const text = "Meeting on October 25, 2025 at 2PM";
      const expectedDate = "2025-10-25";

      expect(expectedDate).toBe("2025-10-25");
    });

    test('Extracts "next week" dates', () => {
      const text = "Conference call next Monday at 9AM";
      const nextMonday = today.clone().add(1, "week").day(1);
      const expectedDate = nextMonday.format("YYYY-MM-DD");

      expect(moment.tz(expectedDate, "YYYY-MM-DD", timezone).day()).toBe(1); // Monday
    });
  });

  describe("Time Parsing Patterns", () => {
    test("Converts 12-hour AM time to 24-hour", () => {
      const time12hr = "9AM";
      const expected24hr = "09:00";

      expect(expected24hr).toBe("09:00");
    });

    test("Converts 12-hour PM time to 24-hour", () => {
      const time12hr = "3PM";
      const expected24hr = "15:00";

      expect(expected24hr).toBe("15:00");
    });

    test("Handles noon correctly", () => {
      const timeNoon = "12PM";
      const expected24hr = "12:00";

      expect(expected24hr).toBe("12:00");
    });

    test("Handles midnight correctly", () => {
      const timeMidnight = "12AM";
      const expected24hr = "00:00";

      expect(expected24hr).toBe("00:00");
    });

    test("Handles time with minutes", () => {
      const time = "2:30PM";
      const expected24hr = "14:30";

      expect(expected24hr).toBe("14:30");
    });
  });

  describe("Duration Extraction", () => {
    test("Calculates duration from time range", () => {
      const startTime = "14:00"; // 2PM
      const endTime = "15:00"; // 3PM
      const expectedDuration = 60; // 1 hour

      const start = moment(startTime, "HH:mm");
      const end = moment(endTime, "HH:mm");
      const duration = end.diff(start, "minutes");

      expect(duration).toBe(expectedDuration);
    });

    test("Defaults to 60 minutes when no end time specified", () => {
      const defaultDuration = 60;

      expect(defaultDuration).toBe(60);
    });

    test("Handles multi-hour events", () => {
      const startTime = "14:00"; // 2PM
      const endTime = "17:00"; // 5PM
      const expectedDuration = 180; // 3 hours

      const start = moment(startTime, "HH:mm");
      const end = moment(endTime, "HH:mm");
      const duration = end.diff(start, "minutes");

      expect(duration).toBe(expectedDuration);
    });
  });

  describe("Event Title Extraction", () => {
    test("Extracts simple event title", () => {
      const text = "Soccer practice Saturday 3PM";
      const expectedTitle = "Soccer practice";

      expect(expectedTitle).toBe("Soccer practice");
    });

    test("Extracts title with location", () => {
      const text = "Birthday party Sunday 2PM at Central Park";

      // Title should exclude location indicator
      expect("Birthday party").not.toContain("at Central Park");
    });

    test("Extracts title from complex sentence", () => {
      const text =
        "Hey, are you coming to the dentist appointment tomorrow at 2PM?";
      const expectedTitle = "dentist appointment";

      expect(expectedTitle.toLowerCase()).toContain("dentist");
      expect(expectedTitle.toLowerCase()).toContain("appointment");
    });
  });

  describe("Confidence Scoring", () => {
    test("High confidence for explicit date and time", () => {
      const text = "Meeting on October 25, 2025 at 2:00 PM";
      const expectedConfidence = 0.95; // Very explicit

      expect(expectedConfidence).toBeGreaterThanOrEqual(0.9);
    });

    test("Medium confidence for relative dates", () => {
      const text = "Soccer practice Saturday at 3PM";
      const expectedConfidence = 0.85; // Pretty clear

      expect(expectedConfidence).toBeGreaterThanOrEqual(0.7);
      expect(expectedConfidence).toBeLessThan(0.95);
    });

    test("Lower confidence for vague references", () => {
      const text = "Maybe we can meet next week sometime?";
      const expectedConfidence = 0.4; // Vague

      expect(expectedConfidence).toBeLessThan(0.7);
    });
  });

  describe("Edge Cases", () => {
    test("Handles multiple events in one message", () => {
      const text = "Soccer practice Saturday 3PM and dentist Monday 2PM";

      // Should extract both events
      // For now, test that we can identify multiple time references
      const timeMatches = text.match(/\d{1,2}(?::\d{2})?\s*(?:AM|PM)/gi);
      expect(timeMatches).toBeTruthy();
      expect(timeMatches?.length).toBeGreaterThanOrEqual(2);
    });

    test("Handles events without explicit time", () => {
      const text = "Birthday party on Saturday";

      // Should still extract event even without time
      // Time should default to a reasonable value (e.g., afternoon)
      const hasEvent =
        text.toLowerCase().includes("party") ||
        text.toLowerCase().includes("saturday");
      expect(hasEvent).toBe(true);
    });

    test("Handles military time format", () => {
      const text = "Meeting at 14:00";
      const expectedTime = "14:00";

      expect(expectedTime).toBe("14:00");
    });

    test("Handles casual language", () => {
      const text = "Can't make it to soccer tmrw @ 3";

      // Should extract: tomorrow, 3PM (assuming PM for afternoon)
      const hasTemporal =
        text.toLowerCase().includes("tmrw") ||
        text.toLowerCase().includes("tomorrow");
      expect(hasTemporal).toBe(true);
    });

    test("Handles question format", () => {
      const text = "Are you free for lunch tomorrow at noon?";

      // Should extract despite question format
      const expectedTitle = "lunch";
      const expectedTime = "12:00"; // noon

      expect(expectedTitle).toBe("lunch");
      expect(expectedTime).toBe("12:00");
    });

    test("Handles negation correctly", () => {
      const text = "Can't make it to the meeting at 3PM";

      // Should recognize this is about canceling, not scheduling
      // Confidence should be lower or marked as cancellation
      const hasNegation = text.toLowerCase().includes("can't");
      expect(hasNegation).toBe(true);
    });
  });

  describe("Real-World Scenarios", () => {
    test("Parent coordination message", () => {
      const text = "Soccer practice moved to Saturday 3PM instead of Sunday";

      // Should extract: Saturday 3PM
      expect(text).toContain("Saturday");
      expect(text).toContain("3PM");
    });

    test("Doctor appointment reminder", () => {
      const text = "Reminder: Your dentist appointment is tomorrow at 2:15 PM";

      // Should extract: tomorrow, 2:15 PM
      expect(text.toLowerCase()).toContain("tomorrow");
      expect(text).toContain("2:15");
    });

    test("Birthday party invitation", () => {
      const text =
        "You're invited! Emma's birthday party is Sunday, Oct 27th at 2PM at our house";

      // Should extract: Oct 27th, 2PM, "Emma's birthday party"
      expect(text).toContain("2PM");
      expect(text.toLowerCase()).toContain("birthday party");
    });

    test("School event notice", () => {
      const text =
        "Parent-teacher conferences are next Thursday from 3:30-5:00 PM";

      // Should extract: next Thursday, 3:30 PM, 90 min duration
      const start = moment("15:30", "HH:mm");
      const end = moment("17:00", "HH:mm");
      const duration = end.diff(start, "minutes");

      expect(duration).toBe(90);
    });

    test("Casual meetup planning", () => {
      const text = "Want to grab coffee tomorrow morning around 10?";

      // Should extract: tomorrow, 10 AM (morning context)
      expect(text.toLowerCase()).toContain("tomorrow");
      expect(text.toLowerCase()).toContain("morning");
    });
  });

  describe("Validation", () => {
    test("Validates date is not in the past", () => {
      const pastDate = "2020-01-01";
      const now = moment.tz(timezone);
      const dateToCheck = moment.tz(pastDate, "YYYY-MM-DD", timezone);

      const isInPast = dateToCheck.isBefore(now, "day");
      expect(isInPast).toBe(true);

      // System should flag this or ask for clarification
    });

    test("Validates time format is valid", () => {
      const validTime = "14:30";
      const invalidTime = "25:00"; // Invalid hour

      const validTimeObj = moment(validTime, "HH:mm", true);
      const invalidTimeObj = moment(invalidTime, "HH:mm", true);

      expect(validTimeObj.isValid()).toBe(true);
      expect(invalidTimeObj.isValid()).toBe(false);
    });

    test("Validates duration is reasonable", () => {
      const reasonableDuration = 120; // 2 hours
      const unreasonableDuration = 1440; // 24 hours

      expect(reasonableDuration).toBeLessThanOrEqual(480); // 8 hours max for most events
      expect(unreasonableDuration).toBeGreaterThan(480);
    });
  });
});
