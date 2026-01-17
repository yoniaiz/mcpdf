/**
 * PDF module - exports all PDF-related functionality
 */

// Types
export {
  MAX_PDF_SIZE_BYTES,
  PdfErrorCode,
  type LoadedPdf,
} from './types.js';

// Errors
export {
  PdfError,
  PdfFileNotFoundError,
  PdfInvalidError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfTooLargeError,
} from './errors.js';

// Reader
export { loadPdf } from './reader.js';
