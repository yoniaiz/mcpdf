/**
 * PDF text extraction using pdfjs-dist
 */

import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  PdfFileNotFoundError,
  PdfInvalidError,
  PdfInvalidPageError,
  PdfNotAPdfError,
  PdfProtectedError,
  PdfTooLargeError,
} from './errors.js';
import { MAX_PDF_SIZE_BYTES, type PageText, type TextItem } from './types.js';

/**
 * Load a PDF for text extraction using pdfjs-dist.
 *
 * @param filePath - Path to the PDF file (absolute or relative)
 * @returns PDFDocumentProxy for text extraction
 * @throws {PdfFileNotFoundError} If file does not exist
 * @throws {PdfNotAPdfError} If file does not have .pdf extension
 * @throws {PdfTooLargeError} If file exceeds 50MB
 * @throws {PdfProtectedError} If PDF is password-protected
 * @throws {PdfInvalidError} If PDF is corrupt or malformed
 */
async function loadPdfForText(filePath: string): Promise<PDFDocumentProxy> {
  const absolutePath = resolve(filePath);

  // Check file exists
  try {
    await access(absolutePath);
  } catch {
    throw new PdfFileNotFoundError(absolutePath);
  }

  // Validate .pdf extension
  if (!absolutePath.toLowerCase().endsWith('.pdf')) {
    throw new PdfNotAPdfError(absolutePath);
  }

  // Check file size
  const stats = await stat(absolutePath);
  if (stats.size > MAX_PDF_SIZE_BYTES) {
    throw new PdfTooLargeError(absolutePath, stats.size);
  }

  // Read file bytes
  const pdfBytes = await readFile(absolutePath);

  // Load with pdfjs-dist (disableWorker for Node.js compatibility)
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(pdfBytes),
      useSystemFonts: true,
      isOffscreenCanvasSupported: false,
    });
    return await loadingTask.promise;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('password')
    ) {
      throw new PdfProtectedError(absolutePath);
    }
    const reason = error instanceof Error ? error.message : String(error);
    throw new PdfInvalidError(absolutePath, reason);
  }
}

/**
 * Extract text content from a specific page of a PDF.
 *
 * @param filePath - Path to the PDF file
 * @param page - Page number (1-indexed)
 * @returns PageText with concatenated text content
 * @throws {PdfInvalidPageError} If page number is out of range
 */
export async function extractPageText(
  filePath: string,
  page: number
): Promise<PageText> {
  const doc = await loadPdfForText(filePath);

  try {
    const totalPages = doc.numPages;

    if (page < 1 || page > totalPages) {
      throw new PdfInvalidPageError(page, totalPages);
    }

    const pdfPage = await doc.getPage(page);
    const textContent = await pdfPage.getTextContent();

    const textParts: string[] = [];
    for (const item of textContent.items) {
      if ('str' in item) {
        textParts.push(item.str);
      }
    }

    return {
      page,
      text: textParts.join(' '),
    };
  } finally {
    await doc.destroy();
  }
}

/**
 * Extract text content from all pages of a PDF.
 *
 * @param filePath - Path to the PDF file
 * @returns Array of PageText, one per page
 */
export async function extractAllText(filePath: string): Promise<PageText[]> {
  const doc = await loadPdfForText(filePath);

  try {
    const results: PageText[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const pdfPage = await doc.getPage(pageNum);
      const textContent = await pdfPage.getTextContent();

      const textParts: string[] = [];
      for (const item of textContent.items) {
        if ('str' in item) {
          textParts.push(item.str);
        }
      }

      results.push({
        page: pageNum,
        text: textParts.join(' '),
      });
    }

    return results;
  } finally {
    await doc.destroy();
  }
}

/**
 * Extract text content with position data from a specific page.
 *
 * This function returns individual text items with their x, y coordinates,
 * which is useful for determining text near form fields.
 *
 * @param filePath - Path to the PDF file
 * @param page - Page number (1-indexed)
 * @returns PageText with text and items array containing positions
 * @throws {PdfInvalidPageError} If page number is out of range
 */
export async function extractTextWithPositions(
  filePath: string,
  page: number
): Promise<PageText> {
  const doc = await loadPdfForText(filePath);

  try {
    const totalPages = doc.numPages;

    if (page < 1 || page > totalPages) {
      throw new PdfInvalidPageError(page, totalPages);
    }

    const pdfPage = await doc.getPage(page);
    const textContent = await pdfPage.getTextContent();

    const items: TextItem[] = [];
    const textParts: string[] = [];

    for (const item of textContent.items) {
      if ('str' in item && 'transform' in item) {
        const text = item.str;
        textParts.push(text);

        // Extract position from transform matrix
        // transform[4] = x translation, transform[5] = y translation
        const transform = item.transform as number[];
        const x = transform[4];
        const y = transform[5];
        const width = item.width ?? 0;
        const height = item.height ?? 0;

        items.push({
          text,
          x,
          y,
          width,
          height,
        });
      }
    }

    return {
      page,
      text: textParts.join(' '),
      items,
    };
  } finally {
    await doc.destroy();
  }
}
