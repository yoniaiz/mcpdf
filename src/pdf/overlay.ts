/**
 * PDF text overlay functionality using pdf-lib
 */

import { type PDFDocument, type PDFFont, StandardFonts, rgb } from 'pdf-lib';

import { PdfInvalidPageError, PdfOutOfBoundsError } from './errors.js';
import type { StandardFontName, TextOverlayOptions, TextOverlayResult } from './types.js';

/**
 * Mapping from user-friendly font names to pdf-lib StandardFonts enum values
 */
const FONT_MAP: Record<StandardFontName, (typeof StandardFonts)[keyof typeof StandardFonts]> = {
  Helvetica: StandardFonts.Helvetica,
  TimesRoman: StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

/**
 * Font cache: WeakMap ensures fonts are cleaned up when document is garbage collected
 */
const fontCache = new WeakMap<PDFDocument, Map<StandardFontName, PDFFont>>();

/**
 * Get or embed a standard font for the document.
 * Caches fonts per document to avoid re-embedding.
 *
 * @param doc - The PDFDocument instance
 * @param fontName - The standard font name to embed
 * @returns The embedded PDFFont instance
 */
async function getEmbeddedFont(doc: PDFDocument, fontName: StandardFontName): Promise<PDFFont> {
  let docFonts = fontCache.get(doc);
  if (!docFonts) {
    docFonts = new Map();
    fontCache.set(doc, docFonts);
  }

  const cachedFont = docFonts.get(fontName);
  if (cachedFont) {
    return cachedFont;
  }

  const font = await doc.embedFont(FONT_MAP[fontName]);
  docFonts.set(fontName, font);
  return font;
}

/**
 * Draw text at specific coordinates on a PDF page.
 *
 * @param doc - The PDFDocument instance (from session)
 * @param options - Text overlay options
 * @returns Result with confirmation of what was drawn
 * @throws {PdfInvalidPageError} If page number is out of range
 * @throws {PdfOutOfBoundsError} If coordinates are outside page bounds
 */
export async function drawTextOnPage(
  doc: PDFDocument,
  options: TextOverlayOptions
): Promise<TextOverlayResult> {
  const { text, x, y, page: pageNumber, fontSize = 12, fontName = 'Helvetica' } = options;

  // Validate page number (1-indexed)
  const pageCount = doc.getPageCount();
  if (pageNumber < 1 || pageNumber > pageCount) {
    throw new PdfInvalidPageError(pageNumber, pageCount);
  }

  // Get the page (convert to 0-indexed)
  const page = doc.getPage(pageNumber - 1);
  const { width, height } = page.getSize();

  // Validate coordinates are within page bounds
  if (x < 0 || x > width) {
    throw new PdfOutOfBoundsError('x', x, width);
  }
  if (y < 0 || y > height) {
    throw new PdfOutOfBoundsError('y', y, height);
  }

  // Get or embed the font
  const font = await getEmbeddedFont(doc, fontName);

  // Draw the text
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0), // Black text
  });

  return {
    text,
    x,
    y,
    page: pageNumber,
    fontSize,
    fontName,
  };
}
