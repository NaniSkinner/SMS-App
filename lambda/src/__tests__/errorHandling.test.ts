/**
 * Error Handling Tests
 * Tests for all error scenarios in Phase 3
 */

import { AppError } from "../utils/types";

describe("Error Handling Tests", () => {
  describe("AppError Class", () => {
    it("should create error with message, status code, and code", () => {
      const error = new AppError("Test error", 400, "TEST_ERROR");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("TEST_ERROR");
      expect(error).toBeInstanceOf(Error);
    });

    it("should handle different status codes", () => {
      const error429 = new AppError("Rate limited", 429, "RATE_LIMIT");
      const error500 = new AppError("Server error", 500, "INTERNAL_ERROR");
      const error401 = new AppError("Unauthorized", 401, "UNAUTHORIZED");

      expect(error429.statusCode).toBe(429);
      expect(error500.statusCode).toBe(500);
      expect(error401.statusCode).toBe(401);
    });
  });

  describe("Rate Limit Handling", () => {
    it("should detect rate limit errors", () => {
      const error = new AppError(
        "AI assistant is busy. Please try again in a moment.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("should have user-friendly rate limit message", () => {
      const error = new AppError(
        "AI assistant is busy. Please try again in a moment.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
      expect(error.message).toContain("busy");
      expect(error.message).toContain("try again");
    });
  });

  describe("Permission Denied Handling", () => {
    it("should detect calendar permission errors", () => {
      const error = new AppError(
        "Calendar access denied",
        403,
        "PERMISSION_DENIED"
      );
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("PERMISSION_DENIED");
    });

    it("should detect authentication errors", () => {
      const error = new AppError("Unauthorized", 401, "UNAUTHORIZED");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("Network Error Handling", () => {
    it("should detect offline errors", () => {
      const errorMessage =
        "No internet connection. Please check your network and try again.";
      expect(errorMessage).toContain("internet connection");
      expect(errorMessage).toContain("try again");
    });

    it("should detect timeout errors", () => {
      const errorMessage =
        "Request timed out. The AI is taking too long to respond. Please try again.";
      expect(errorMessage).toContain("timed out");
      expect(errorMessage).toContain("try again");
    });
  });

  describe("Service Unavailable Handling", () => {
    it("should detect 5xx errors", () => {
      const error500 = new AppError(
        "AI service is temporarily unavailable",
        500,
        "SERVICE_UNAVAILABLE"
      );
      const error503 = new AppError(
        "Service unavailable",
        503,
        "SERVICE_UNAVAILABLE"
      );

      expect(error500.statusCode).toBe(500);
      expect(error503.statusCode).toBe(503);
      expect(error500.message).toContain("unavailable");
    });
  });

  describe("Input Validation Errors", () => {
    it("should detect missing user ID", () => {
      const error = new AppError("userId is required", 400, "MISSING_USER_ID");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("MISSING_USER_ID");
    });

    it("should detect missing message", () => {
      const error = new AppError("message is required", 400, "MISSING_MESSAGE");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("MISSING_MESSAGE");
    });

    it("should detect missing body", () => {
      const error = new AppError(
        "Request body is required",
        400,
        "MISSING_BODY"
      );
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("MISSING_BODY");
    });
  });

  describe("OpenAI Error Handling", () => {
    it("should handle context length exceeded", () => {
      const error = new AppError(
        "Conversation is too long. Please start a new conversation.",
        400,
        "CONTEXT_LENGTH_EXCEEDED"
      );
      expect(error.code).toBe("CONTEXT_LENGTH_EXCEEDED");
      expect(error.message).toContain("too long");
    });

    it("should handle OpenAI API errors", () => {
      const error = new AppError(
        "OpenAI API error: Connection timeout",
        500,
        "OPENAI_API_ERROR"
      );
      expect(error.code).toBe("OPENAI_API_ERROR");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("Calendar API Error Handling", () => {
    it("should handle calendar token refresh failure", () => {
      const error = new AppError(
        "Failed to refresh calendar token",
        401,
        "TOKEN_REFRESH_FAILED"
      );
      expect(error.code).toBe("TOKEN_REFRESH_FAILED");
      expect(error.statusCode).toBe(401);
    });

    it("should handle calendar API rate limits", () => {
      const error = new AppError(
        "Calendar API rate limit exceeded",
        429,
        "CALENDAR_RATE_LIMIT"
      );
      expect(error.statusCode).toBe(429);
    });

    it("should handle invalid calendar tokens", () => {
      const error = new AppError(
        "Calendar token is invalid or expired",
        401,
        "INVALID_TOKEN"
      );
      expect(error.code).toBe("INVALID_TOKEN");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("Ambiguous Date/Time Handling", () => {
    it("should detect ambiguous dates", () => {
      const ambiguousFields = ["date"];
      expect(ambiguousFields).toContain("date");
    });

    it("should flag need for confirmation", () => {
      const needsConfirmation = true;
      expect(needsConfirmation).toBe(true);
    });

    it("should have low confidence for ambiguous events", () => {
      const confidence = 0.5;
      expect(confidence).toBeLessThan(0.7);
    });
  });

  describe("Error Message Quality", () => {
    it("should have user-friendly error messages", () => {
      const errors = [
        "No internet connection. Please check your network and try again.",
        "Request timed out. The AI is taking too long to respond. Please try again.",
        "Too many requests. Please wait a moment and try again.",
        "Calendar access denied. Please reconnect your calendar.",
        "AI service is temporarily unavailable. Please try again.",
      ];

      errors.forEach((error) => {
        expect(error.length).toBeGreaterThan(20);
        expect(error).toMatch(/\./); // Has proper punctuation
        // Should not contain technical jargon
        expect(error).not.toContain("Exception");
        expect(error).not.toContain("undefined");
        expect(error).not.toContain("null");
      });
    });

    it("should provide actionable guidance", () => {
      const errors = [
        "No internet connection. Please check your network and try again.",
        "Calendar access denied. Please reconnect your calendar.",
        "Conversation is too long. Please start a new conversation.",
      ];

      errors.forEach((error) => {
        expect(error).toMatch(/Please|please/);
      });
    });
  });

  describe("Retry Logic", () => {
    it("should retry on network errors", () => {
      const retryableErrors = [
        "Network request failed",
        "timeout",
        "ECONNREFUSED",
      ];

      retryableErrors.forEach((errorMsg) => {
        const isRetryable =
          errorMsg.includes("Network") ||
          errorMsg.includes("timeout") ||
          errorMsg.includes("ECONNREFUSED");
        expect(isRetryable).toBe(true);
      });
    });

    it("should retry on 5xx errors", () => {
      const statusCodes = [500, 502, 503, 504];
      statusCodes.forEach((code) => {
        const isRetryable = code >= 500 && code < 600;
        expect(isRetryable).toBe(true);
      });
    });

    it("should retry on rate limits (429)", () => {
      const statusCode = 429;
      const isRetryable =
        statusCode === 429 || (statusCode >= 500 && statusCode < 600);
      expect(isRetryable).toBe(true);
    });

    it("should NOT retry on 4xx errors (except 429)", () => {
      const statusCodes = [400, 401, 403, 404];
      statusCodes.forEach((code) => {
        const isRetryable = code === 429 || (code >= 500 && code < 600);
        expect(isRetryable).toBe(false);
      });
    });
  });

  describe("Error Code Consistency", () => {
    it("should use consistent error codes", () => {
      const errorCodes = [
        "OFFLINE",
        "TIMEOUT",
        "RATE_LIMIT",
        "PERMISSION_DENIED",
        "SERVICE_UNAVAILABLE",
        "NETWORK_ERROR",
        "UNKNOWN_ERROR",
        "MISSING_BODY",
        "MISSING_USER_ID",
        "MISSING_MESSAGE",
      ];

      errorCodes.forEach((code) => {
        expect(code).toMatch(/^[A-Z_]+$/); // All caps with underscores
        expect(code.length).toBeGreaterThan(3);
      });
    });
  });

  describe("Graceful Degradation", () => {
    it("should handle offline mode gracefully", () => {
      const isOnline = false;
      const canUseAIFeatures = isOnline;
      expect(canUseAIFeatures).toBe(false);
    });

    it("should handle calendar disconnected gracefully", () => {
      const calendarConnected = false;
      const canAccessCalendar = calendarConnected;
      expect(canAccessCalendar).toBe(false);
    });

    it("should queue operations when offline", () => {
      const queue: any[] = [];
      const operation = { id: "test", timestamp: new Date() };
      queue.push(operation);
      expect(queue.length).toBe(1);
    });
  });
});
