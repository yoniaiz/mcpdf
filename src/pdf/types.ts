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
  /** Form field not found in PDF */
  FieldNotFound = 'FIELD_NOT_FOUND',
  /** Page number is out of range */
  InvalidPage = 'INVALID_PAGE',
  /** Field is read-only and cannot be modified */
  ReadOnlyField = 'READ_ONLY_FIELD',
  /** Invalid value for field (e.g., option not in dropdown/radio options) */
  InvalidFieldValue = 'INVALID_FIELD_VALUE',
}

/**
 * Types of form fields supported by mcpdf
 */
export enum PdfFieldType {
  /** Single-line text input */
  Text = 'text',
  /** Multi-line text input */
  Multiline = 'multiline',
  /** Boolean checkbox */
  Checkbox = 'checkbox',
  /** Radio button group (mutually exclusive options) */
  Radio = 'radio',
  /** Dropdown/select list */
  Dropdown = 'dropdown',
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

/**
 * Metadata for a single form field in a PDF
 */
export interface PdfField {
  /** Unique field name within the PDF */
  name: string;
  /** Type of the form field */
  type: PdfFieldType;
  /** Page number where the field appears (1-indexed) */
  page: number;
  /** Whether the field is marked as required */
  required: boolean;
  /** Whether the field is read-only */
  readOnly: boolean;
  /** Current value of the field (null if empty) */
  currentValue: string | boolean | null;
  /** Available options for dropdown and radio fields */
  options?: string[];
}

/**
 * A single text item extracted from a PDF page with position data
 */
export interface TextItem {
  /** The text content */
  text: string;
  /** X coordinate (left position) on the page */
  x: number;
  /** Y coordinate (bottom position) on the page */
  y: number;
  /** Width of the text in points */
  width: number;
  /** Height of the text in points */
  height: number;
}

/**
 * Extracted text content from a PDF page
 */
export interface PageText {
  /** Page number (1-indexed) */
  page: number;
  /** Concatenated text content from the page */
  text: string;
  /** Individual text items with positions (only included when positions are requested) */
  items?: TextItem[];
}

/**
 * Result of filling a form field
 */
export interface FilledField {
  /** Name of the field that was filled */
  name: string;
  /** Type of the field */
  type: PdfFieldType;
  /** The new value that was set */
  value: string | boolean;
  /** The previous value before filling (null if was empty) */
  previousValue: string | boolean | null;
}
