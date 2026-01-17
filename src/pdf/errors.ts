/**
 * Custom error classes for PDF operations
 */

import { MAX_PDF_SIZE_BYTES, PdfErrorCode } from './types.js';

/**
 * Base error class for all PDF-related errors
 */
export abstract class PdfError extends Error {
  abstract readonly code: PdfErrorCode;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when a PDF file is not found at the specified path
 */
export class PdfFileNotFoundError extends PdfError {
  readonly code = PdfErrorCode.FileNotFound;

  constructor(path: string) {
    super(`PDF file not found: ${path}`);
  }
}

/**
 * Error thrown when a file is not a valid PDF (wrong extension)
 */
export class PdfNotAPdfError extends PdfError {
  readonly code = PdfErrorCode.NotAPdf;

  constructor(path: string) {
    super(`File is not a PDF: ${path}`);
  }
}

/**
 * Error thrown when a PDF file is corrupt or malformed
 */
export class PdfInvalidError extends PdfError {
  readonly code = PdfErrorCode.InvalidPdf;

  constructor(path: string, reason?: string) {
    const message = reason
      ? `Invalid PDF file: ${path}. Reason: ${reason}`
      : `Invalid PDF file: ${path}`;
    super(message);
  }
}

/**
 * Error thrown when a PDF is password-protected
 */
export class PdfProtectedError extends PdfError {
  readonly code = PdfErrorCode.ProtectedPdf;

  constructor(path: string) {
    super(`PDF is password protected: ${path}`);
  }
}

/**
 * Error thrown when a PDF file exceeds the maximum size limit
 */
export class PdfTooLargeError extends PdfError {
  readonly code = PdfErrorCode.FileTooLarge;

  constructor(path: string, sizeBytes: number) {
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    const maxMB = (MAX_PDF_SIZE_BYTES / 1024 / 1024).toFixed(0);
    super(`PDF file too large: ${path} (${sizeMB}MB exceeds ${maxMB}MB limit)`);
  }
}

/**
 * Error thrown when a form field is not found in the PDF
 */
export class PdfFieldNotFoundError extends PdfError {
  readonly code = PdfErrorCode.FieldNotFound;

  constructor(fieldName: string) {
    super(`Field '${fieldName}' not found in PDF`);
  }
}
