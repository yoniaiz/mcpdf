/**
 * PDF module - exports all PDF-related functionality
 */

// Types
export {
  MAX_PDF_SIZE_BYTES,
  PdfErrorCode,
  PdfFieldType,
  type LoadedPdf,
  type PageText,
  type PdfField,
  type TextItem,
} from './types.js';

// Errors
export {
  PdfError,
  PdfFieldNotFoundError,
  PdfFileNotFoundError,
  PdfInvalidError,
  PdfInvalidPageError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfTooLargeError,
} from './errors.js';

// Reader
export { loadPdf } from './reader.js';

// Fields
export { extractFields, getFieldByName, getFieldsByPage } from './fields.js';

// Text extraction
export {
  extractAllText,
  extractPageText,
  extractTextWithPositions,
} from './text.js';
