/**
 * PDF module - exports all PDF-related functionality
 */

// Types
export {
  MAX_PDF_SIZE_BYTES,
  PdfErrorCode,
  PdfFieldType,
  type LoadedPdf,
  type PdfField,
} from './types.js';

// Errors
export {
  PdfError,
  PdfFieldNotFoundError,
  PdfFileNotFoundError,
  PdfInvalidError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfTooLargeError,
} from './errors.js';

// Reader
export { loadPdf } from './reader.js';

// Fields
export { extractFields, getFieldByName, getFieldsByPage } from './fields.js';
