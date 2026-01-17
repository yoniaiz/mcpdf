/**
 * PDF module - exports all PDF-related functionality
 */

// Types
export {
  MAX_PDF_SIZE_BYTES,
  PdfErrorCode,
  PdfFieldType,
  type FilledField,
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
  PdfInvalidFieldValueError,
  PdfInvalidPageError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfReadOnlyFieldError,
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

// Writer
export { fillField } from './writer.js';
