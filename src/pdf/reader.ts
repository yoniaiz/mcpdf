/**
 * PDF loading functionality using pdf-lib
 */

import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import {
  PdfFileNotFoundError,
  PdfInvalidError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfTooLargeError,
} from './errors.js';
import { MAX_PDF_SIZE_BYTES, type LoadedPdf } from './types.js';

/**
 * Load a PDF file from the filesystem.
 *
 * Performs validation:
 * 1. File exists
 * 2. File has .pdf extension
 * 3. File size is within limits (50MB)
 * 4. File is a valid PDF
 * 5. File is not password-protected
 *
 * @param filePath - Path to the PDF file (absolute or relative)
 * @returns LoadedPdf containing the document and metadata
 * @throws {PdfFileNotFoundError} If file does not exist
 * @throws {PdfNotAPdfError} If file does not have .pdf extension
 * @throws {PdfTooLargeError} If file exceeds 50MB
 * @throws {PdfProtectedError} If PDF is password-protected
 * @throws {PdfInvalidError} If PDF is corrupt or malformed
 */
export async function loadPdf(filePath: string): Promise<LoadedPdf> {
  // Resolve to absolute path
  const absolutePath = resolve(filePath);

  // 1. Check file exists
  try {
    await access(absolutePath);
  } catch {
    throw new PdfFileNotFoundError(absolutePath);
  }

  // 2. Validate .pdf extension
  if (!absolutePath.toLowerCase().endsWith('.pdf')) {
    throw new PdfNotAPdfError(absolutePath);
  }

  // 3. Check file size
  const stats = await stat(absolutePath);
  if (stats.size > MAX_PDF_SIZE_BYTES) {
    throw new PdfTooLargeError(absolutePath, stats.size);
  }

  // 4. Read file bytes
  const pdfBytes = await readFile(absolutePath);

  // 5. Load PDF document
  let document: PDFDocument;
  try {
    document = await PDFDocument.load(pdfBytes);
  } catch (error) {
    // Check for encrypted PDF error
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('encrypted')
    ) {
      throw new PdfProtectedError(absolutePath);
    }

    // Other parsing errors
    const reason = error instanceof Error ? error.message : String(error);
    throw new PdfInvalidError(absolutePath, reason);
  }

  // 6. Extract metadata
  const pageCount = document.getPageCount();
  const form = document.getForm();
  const fields = form.getFields();
  const fieldCount = fields.length;
  const hasForm = fieldCount > 0;

  return {
    document,
    path: absolutePath,
    pageCount,
    hasForm,
    fieldCount,
  };
}
