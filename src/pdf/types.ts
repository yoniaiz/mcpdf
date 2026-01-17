/**
 * PDF-related type definitions for mcpdf
 */

import type { PDFDocument } from 'pdf-lib';

/**
 * Maximum allowed PDF file size in bytes (50MB as per PRD)
 */
export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Error codes for PDF operations
 */
/* eslint-disable no-unused-vars */
export enum PdfErrorCode {
  /** File does not exist at the specified path */
  FileNotFound = 'FILE_NOT_FOUND',
  /** File is not a valid PDF (wrong extension or magic bytes) */
  NotAPdf = 'NOT_A_PDF',
  /** PDF file is corrupt or malformed */
  InvalidPdf = 'INVALID_PDF',
  /** PDF is password-protected */
  ProtectedPdf = 'PROTECTED_PDF',
  /** PDF file exceeds maximum size limit */
  FileTooLarge = 'FILE_TOO_LARGE',
}
/* eslint-enable no-unused-vars */

/**
 * Result of loading a PDF file
 */
export interface LoadedPdf {
  /** The loaded pdf-lib PDFDocument instance */
  document: PDFDocument;
  /** Absolute path to the PDF file */
  path: string;
  /** Total number of pages in the document */
  pageCount: number;
  /** Whether the PDF has an interactive form (AcroForm) */
  hasForm: boolean;
  /** Number of form fields in the document */
  fieldCount: number;
}
