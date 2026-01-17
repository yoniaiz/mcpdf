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
  type SaveResult,
  type StandardFontName,
  type TextItem,
  type TextOverlayOptions,
  type TextOverlayResult,
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
  PdfOutOfBoundsError,
  PdfProtectedError,
  PdfReadOnlyFieldError,
  PdfSaveError,
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
export { fillField, savePdf } from './writer.js';

// Overlay (text drawing)
export { drawTextOnPage } from './overlay.js';
