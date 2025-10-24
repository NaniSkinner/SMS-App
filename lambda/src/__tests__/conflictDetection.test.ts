/**
 * Unit Tests for Conflict Detection Algorithm
 * Tests the core logic of detecting calendar conflicts
 */

import moment from "moment-timezone";

// Mock types based on Google Calendar API
type MockEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
};

/**
 * Core conflict detection logic (extracted for testing)
 * This is the same algorithm used in calendar.ts
 */
function detectEventConflict(
  proposedStart: Date,
  proposedEnd: Date,
  existingStart: Date,
  existingEnd: Date
): { hasConflict: boolean; overlapMinutes: number } {
  // Check if there's an overlap
  const hasConflict =
    proposedStart < existingEnd && proposedEnd > existingStart;

  if (!hasConflict) {
    return { hasConflict: false, overlapMinutes: 0 };
  }

  // Calculate overlap duration
  const overlapStart =
    proposedStart > existingStart ? proposedStart : existingStart;
  const overlapEnd = proposedEnd < existingEnd ? proposedEnd : existingEnd;
  const overlapMs = overlapEnd.getTime() - overlapStart.getTime();
  const overlapMinutes = Math.floor(overlapMs / (60 * 1000));

  return { hasConflict: true, overlapMinutes };
}

describe("Conflict Detection Algorithm", () => {
  const timezone = "America/Chicago";

  describe("No Conflict Scenarios", () => {
    test("Event before proposed time - no conflict", () => {
      // Existing: 2PM-3PM, Proposed: 4PM-5PM
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(false);
      expect(result.overlapMinutes).toBe(0);
    });

    test("Event after proposed time - no conflict", () => {
      // Proposed: 2PM-3PM, Existing: 4PM-5PM
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingStart = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(false);
      expect(result.overlapMinutes).toBe(0);
    });

    test("Back-to-back events (no gap, no overlap) - no conflict", () => {
      // Existing: 2PM-3PM, Proposed: 3PM-4PM (starts exactly when other ends)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(false);
      expect(result.overlapMinutes).toBe(0);
    });
  });

  describe("Conflict Scenarios", () => {
    test("Complete overlap - proposed event entirely during existing event", () => {
      // Existing: 2PM-5PM, Proposed: 3PM-4PM (completely inside)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // Full hour overlap
    });

    test("Partial overlap - proposed starts during existing", () => {
      // Existing: 2PM-4PM, Proposed: 3PM-5PM (overlaps last hour)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // 1 hour overlap (3PM-4PM)
    });

    test("Partial overlap - proposed ends during existing", () => {
      // Proposed: 1PM-3PM, Existing: 2PM-4PM (overlaps first hour)
      const proposedStart = moment
        .tz("2025-10-25 13:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // 1 hour overlap (2PM-3PM)
    });

    test("Proposed event completely covers existing event", () => {
      // Proposed: 1PM-5PM, Existing: 2PM-3PM (existing inside proposed)
      const proposedStart = moment
        .tz("2025-10-25 13:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // Entire existing event
    });

    test("Exact same time - complete overlap", () => {
      // Both events: 2PM-3PM
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60);
    });

    test("Short overlap - 15 minutes", () => {
      // Existing: 2PM-3PM, Proposed: 2:45PM-3:45PM (15 min overlap)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:45", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:45", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(15);
    });

    test("Long overlap - 2 hours", () => {
      // Existing: 2PM-5PM, Proposed: 3PM-6PM (2 hour overlap)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 18:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(120); // 2 hours
    });
  });

  describe("Timezone Handling", () => {
    test("Same local time, different timezones - correctly detects conflict", () => {
      // Existing: 2PM Chicago, Proposed: 2PM New York (actually 1PM Chicago)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", "America/Chicago")
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", "America/Chicago")
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", "America/New_York")
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", "America/New_York")
        .toDate();

      // In UTC: Existing is 19:00-20:00, Proposed is 18:00-19:00
      // They should NOT conflict (proposed ends when existing starts)
      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(false);
    });

    test("Cross-timezone conflict detection", () => {
      // Existing: 3PM Chicago (20:00 UTC), Proposed: 2PM New York (18:00 UTC)
      // In UTC: Existing 20:00-21:00, Proposed 18:00-20:00
      // Should NOT conflict
      const existingStart = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", "America/Chicago")
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", "America/Chicago")
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", "America/New_York")
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 16:00", "YYYY-MM-DD HH:mm", "America/New_York")
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("1 minute overlap", () => {
      // Existing: 2PM-3PM, Proposed: 2:59PM-3:59PM (1 min overlap)
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:59", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:59", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(1);
    });

    test("All-day events (simulated as long duration)", () => {
      // Existing: 12AM-11:59PM, Proposed: 2PM-3PM
      const existingStart = moment
        .tz("2025-10-25 00:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 23:59", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // Proposed event fully inside all-day
    });

    test("Midnight crossing events", () => {
      // Existing: 11PM-1AM, Proposed: 12AM-1AM (midnight crossing)
      const existingStart = moment
        .tz("2025-10-25 23:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-26 01:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-26 00:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-26 01:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(60); // Full hour overlap
    });

    test("Very short events - 5 minute meeting", () => {
      // Existing: 2PM-2:05PM, Proposed: 2PM-2:05PM
      const existingStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const existingEnd = moment
        .tz("2025-10-25 14:05", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const proposedEnd = moment
        .tz("2025-10-25 14:05", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        proposedStart,
        proposedEnd,
        existingStart,
        existingEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(5);
    });
  });

  describe("Real-World Scenarios", () => {
    test("Soccer practice conflicts with dentist appointment", () => {
      // Dentist: 2PM-3PM, Soccer: 2:30PM-4:30PM (90 min overlap)
      const dentistStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const dentistEnd = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const soccerStart = moment
        .tz("2025-10-25 14:30", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const soccerEnd = moment
        .tz("2025-10-25 16:30", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        soccerStart,
        soccerEnd,
        dentistStart,
        dentistEnd
      );

      expect(result.hasConflict).toBe(true);
      expect(result.overlapMinutes).toBe(30); // 2:30-3PM overlap
    });

    test("Birthday party does not conflict with morning event", () => {
      // Morning workout: 7AM-8AM, Birthday party: 2PM-5PM
      const workoutStart = moment
        .tz("2025-10-25 07:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const workoutEnd = moment
        .tz("2025-10-25 08:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const partyStart = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const partyEnd = moment
        .tz("2025-10-25 17:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        partyStart,
        partyEnd,
        workoutStart,
        workoutEnd
      );

      expect(result.hasConflict).toBe(false);
      expect(result.overlapMinutes).toBe(0);
    });

    test("Back-to-back meetings with buffer time", () => {
      // Meeting 1: 2PM-3PM, Meeting 2: 3:15PM-4:15PM (15 min buffer)
      const meeting1Start = moment
        .tz("2025-10-25 14:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const meeting1End = moment
        .tz("2025-10-25 15:00", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const meeting2Start = moment
        .tz("2025-10-25 15:15", "YYYY-MM-DD HH:mm", timezone)
        .toDate();
      const meeting2End = moment
        .tz("2025-10-25 16:15", "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const result = detectEventConflict(
        meeting2Start,
        meeting2End,
        meeting1Start,
        meeting1End
      );

      expect(result.hasConflict).toBe(false);
      expect(result.overlapMinutes).toBe(0);
    });
  });
});
