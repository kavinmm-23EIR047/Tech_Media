/**
 * Centralized CRM API Error Handling System
 */

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiErrorContext {
  module: string;
  operation: string;
  endpoint: string;
  status?: number;
  requestId?: string;
  originalError?: unknown;
  requestPayload?: unknown;
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly userMessage: string;
  public readonly developerMessage: string;
  public readonly context: ApiErrorContext;
  public readonly timestamp: string;
  public readonly isRetryable: boolean;

  constructor(
    code: ApiErrorCode,
    userMessage: string,
    developerMessage: string,
    context: ApiErrorContext,
    isRetryable: boolean = true
  ) {
    super(developerMessage);
    this.name = "ApiError";
    this.code = code;
    this.userMessage = userMessage;
    this.developerMessage = developerMessage;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isRetryable = isRetryable;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Generates formatted developer debug output
   */
  public toDebugString(): string {
    return `[${this.context.module} API]
Operation: ${this.context.operation}
Endpoint: ${this.context.endpoint}
Status: ${this.context.status || "N/A"}
Request ID: ${this.context.requestId || "req_" + Math.random().toString(36).substr(2, 6)}
Code: ${this.code}
Message: ${this.developerMessage}
Timestamp: ${this.timestamp}`;
  }
}

/**
 * Normalizes any error or response into a structured ApiError
 */
export function normalizeApiError(
  error: unknown,
  context: ApiErrorContext
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Network / fetch failures (e.g. offline, CORS blocked, DNS failure)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new ApiError(
      "NETWORK_ERROR",
      "Unable to connect to the CRM server. Please check your internet connection and try again.",
      `Network connection failed to ${context.endpoint}: ${error.message}`,
      context,
      true
    );
  }

  // Abort / Timeout
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError(
      "TIMEOUT_ERROR",
      "The request took too long to complete. Please try again.",
      `Request timed out after limit for ${context.endpoint}`,
      context,
      true
    );
  }

  // Generic Error object
  if (error instanceof Error) {
    return new ApiError(
      "UNKNOWN_ERROR",
      "An unexpected error occurred. Please try again or contact support.",
      error.message,
      context,
      true
    );
  }

  // Fallback for non-error throws
  return new ApiError(
    "UNKNOWN_ERROR",
    "An unexpected error occurred while processing your request.",
    String(error),
    context,
    true
  );
}
