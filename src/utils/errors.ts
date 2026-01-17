import { PdfError } from '../pdf/errors.js';

/**
 * Base error class for all mcpdf errors
 */
export abstract class McpdfError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

/**
 * Error codes for McpdfError
 */
export enum McpdfErrorCode {
  NoSession = 'NO_SESSION',
  SessionExpired = 'SESSION_EXPIRED',
  Unknown = 'UNKNOWN_ERROR',
}

/**
 * Error thrown when a session operation fails or no session exists
 */
export class SessionError extends McpdfError {
  readonly code: string;

  constructor(message: string, code: McpdfErrorCode = McpdfErrorCode.NoSession) {
    super(message);
    this.code = code;
  }
}

/**
 * Formats any error into a user-friendly string for MCP tool response
 */
export function formatToolError(error: unknown): string {
  // Handle PDF errors (already have good messages)
  if (error instanceof PdfError) {
    return error.message;
  }

  // Handle Session errors
  if (error instanceof SessionError) {
    return error.message;
  }

  // Handle standard errors
  if (error instanceof Error) {
    return error.message;
  }

  // Handle unknown errors
  return `Unknown error occurred: ${String(error)}`;
}
