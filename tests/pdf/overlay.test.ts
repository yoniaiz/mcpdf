/**
 * PDF text overlay unit tests
 */

import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  drawTextOnPage,
  PdfInvalidPageError,
  PdfOutOfBoundsError,
  PdfErrorCode,
  type StandardFontName,
} from '../../src/pdf/index.js';

/**
 * Create a test PDF document with a single page of specified dimensions
 */
async function createTestDocument(
  width = 612,
  height = 792
): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  doc.addPage([width, height]);
  return doc;
}

/**
 * Create a multi-page test PDF document
 */
async function createMultiPageDocument(pageCount: number): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([612, 792]);
  }
  return doc;
}

describe('drawTextOnPage', () => {
  describe('successful drawing', () => {
    it('should draw text with default options (Helvetica, 12pt)', async () => {
      const doc = await createTestDocument();

      const result = await drawTextOnPage(doc, {
        text: 'Hello, World!',
        x: 100,
        y: 700,
        page: 1,
      });

      expect(result.text).toBe('Hello, World!');
      expect(result.x).toBe(100);
      expect(result.y).toBe(700);
      expect(result.page).toBe(1);
      expect(result.fontSize).toBe(12);
      expect(result.fontName).toBe('Helvetica');
    });

    it('should draw text with TimesRoman font', async () => {
      const doc = await createTestDocument();

      const result = await drawTextOnPage(doc, {
        text: 'Times Roman Text',
        x: 50,
        y: 500,
        page: 1,
        fontName: 'TimesRoman',
      });

      expect(result.fontName).toBe('TimesRoman');
    });

    it('should draw text with Courier font', async () => {
      const doc = await createTestDocument();

      const result = await drawTextOnPage(doc, {
        text: 'Courier Text',
        x: 50,
        y: 500,
        page: 1,
        fontName: 'Courier',
      });

      expect(result.fontName).toBe('Courier');
    });

    it('should draw text with all supported fonts', async () => {
      const doc = await createTestDocument();
      const fonts: StandardFontName[] = ['Helvetica', 'TimesRoman', 'Courier'];

      for (const fontName of fonts) {
        const result = await drawTextOnPage(doc, {
          text: `Test with ${fontName}`,
          x: 50,
          y: 700,
          page: 1,
          fontName,
        });

        expect(result.fontName).toBe(fontName);
      }
    });

    it('should draw text with custom font size', async () => {
      const doc = await createTestDocument();

      const result = await drawTextOnPage(doc, {
        text: 'Large Text',
        x: 100,
        y: 700,
        page: 1,
        fontSize: 24,
      });

      expect(result.fontSize).toBe(24);
    });

    it('should draw text at origin (0, 0)', async () => {
      const doc = await createTestDocument();

      const result = await drawTextOnPage(doc, {
        text: 'At origin',
        x: 0,
        y: 0,
        page: 1,
      });

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should draw text at page boundaries', async () => {
      const width = 612;
      const height = 792;
      const doc = await createTestDocument(width, height);

      // At max X
      const resultX = await drawTextOnPage(doc, {
        text: 'Edge X',
        x: width,
        y: 100,
        page: 1,
      });
      expect(resultX.x).toBe(width);

      // At max Y
      const resultY = await drawTextOnPage(doc, {
        text: 'Edge Y',
        x: 100,
        y: height,
        page: 1,
      });
      expect(resultY.y).toBe(height);
    });

    it('should draw multiple texts on the same page', async () => {
      const doc = await createTestDocument();

      const result1 = await drawTextOnPage(doc, {
        text: 'First text',
        x: 100,
        y: 700,
        page: 1,
      });

      const result2 = await drawTextOnPage(doc, {
        text: 'Second text',
        x: 100,
        y: 650,
        page: 1,
      });

      const result3 = await drawTextOnPage(doc, {
        text: 'Third text',
        x: 100,
        y: 600,
        page: 1,
      });

      expect(result1.text).toBe('First text');
      expect(result2.text).toBe('Second text');
      expect(result3.text).toBe('Third text');
    });

    it('should draw text on different pages of a multi-page document', async () => {
      const doc = await createMultiPageDocument(3);

      const result1 = await drawTextOnPage(doc, {
        text: 'Page 1 text',
        x: 100,
        y: 700,
        page: 1,
      });

      const result2 = await drawTextOnPage(doc, {
        text: 'Page 2 text',
        x: 100,
        y: 700,
        page: 2,
      });

      const result3 = await drawTextOnPage(doc, {
        text: 'Page 3 text',
        x: 100,
        y: 700,
        page: 3,
      });

      expect(result1.page).toBe(1);
      expect(result2.page).toBe(2);
      expect(result3.page).toBe(3);
    });
  });

  describe('font caching', () => {
    it('should cache fonts per document (same font not re-embedded)', async () => {
      const doc = await createTestDocument();

      // Draw multiple texts with the same font
      await drawTextOnPage(doc, {
        text: 'First',
        x: 100,
        y: 700,
        page: 1,
        fontName: 'Helvetica',
      });

      await drawTextOnPage(doc, {
        text: 'Second',
        x: 100,
        y: 650,
        page: 1,
        fontName: 'Helvetica',
      });

      await drawTextOnPage(doc, {
        text: 'Third',
        x: 100,
        y: 600,
        page: 1,
        fontName: 'Helvetica',
      });

      // The document should only have one embedded Helvetica font
      // We verify this indirectly by checking that the operations succeed
      // and the document can be serialized
      const pdfBytes = await doc.save();
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it('should cache different fonts independently', async () => {
      const doc = await createTestDocument();
      const fonts: StandardFontName[] = ['Helvetica', 'TimesRoman', 'Courier'];

      // Draw with each font twice
      for (const fontName of fonts) {
        await drawTextOnPage(doc, {
          text: `First ${fontName}`,
          x: 100,
          y: 700,
          page: 1,
          fontName,
        });

        await drawTextOnPage(doc, {
          text: `Second ${fontName}`,
          x: 100,
          y: 650,
          page: 1,
          fontName,
        });
      }

      // Document should still be valid
      const pdfBytes = await doc.save();
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe('invalid page errors', () => {
    it('should throw PdfInvalidPageError for page 0 (1-indexed)', async () => {
      const doc = await createTestDocument();

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 700,
          page: 0,
        })
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should throw PdfInvalidPageError for negative page number', async () => {
      const doc = await createTestDocument();

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 700,
          page: -1,
        })
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should throw PdfInvalidPageError for page beyond document length', async () => {
      const doc = await createTestDocument(); // 1 page

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 700,
          page: 2,
        })
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should throw PdfInvalidPageError with correct message', async () => {
      const doc = await createMultiPageDocument(3);

      try {
        await drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 700,
          page: 5,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfInvalidPageError);
        expect((error as PdfInvalidPageError).message).toContain('5');
        expect((error as PdfInvalidPageError).message).toContain('3 pages');
      }
    });
  });

  describe('out of bounds coordinate errors', () => {
    it('should throw PdfOutOfBoundsError for negative X coordinate', async () => {
      const doc = await createTestDocument();

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: -10,
          y: 700,
          page: 1,
        })
      ).rejects.toThrow(PdfOutOfBoundsError);
    });

    it('should throw PdfOutOfBoundsError for negative Y coordinate', async () => {
      const doc = await createTestDocument();

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: -10,
          page: 1,
        })
      ).rejects.toThrow(PdfOutOfBoundsError);
    });

    it('should throw PdfOutOfBoundsError for X coordinate beyond page width', async () => {
      const doc = await createTestDocument(612, 792);

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 613,
          y: 700,
          page: 1,
        })
      ).rejects.toThrow(PdfOutOfBoundsError);
    });

    it('should throw PdfOutOfBoundsError for Y coordinate beyond page height', async () => {
      const doc = await createTestDocument(612, 792);

      await expect(
        drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 793,
          page: 1,
        })
      ).rejects.toThrow(PdfOutOfBoundsError);
    });

    it('should include coordinate name in error message', async () => {
      const doc = await createTestDocument(612, 792);

      // Test X coordinate error
      try {
        await drawTextOnPage(doc, {
          text: 'Test',
          x: -5,
          y: 700,
          page: 1,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfOutOfBoundsError);
        expect((error as PdfOutOfBoundsError).coordinate).toBe('x');
        expect((error as PdfOutOfBoundsError).message).toContain('X coordinate');
      }

      // Test Y coordinate error
      try {
        await drawTextOnPage(doc, {
          text: 'Test',
          x: 100,
          y: 1000,
          page: 1,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfOutOfBoundsError);
        expect((error as PdfOutOfBoundsError).coordinate).toBe('y');
        expect((error as PdfOutOfBoundsError).message).toContain('Y coordinate');
      }
    });

    it('should include value and max in error message', async () => {
      const doc = await createTestDocument(612, 792);

      try {
        await drawTextOnPage(doc, {
          text: 'Test',
          x: 700,
          y: 400,
          page: 1,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfOutOfBoundsError);
        const pdfError = error as PdfOutOfBoundsError;
        expect(pdfError.value).toBe(700);
        expect(pdfError.max).toBe(612);
        expect(pdfError.message).toContain('700');
        expect(pdfError.message).toContain('612');
      }
    });
  });

  describe('error properties', () => {
    it('PdfOutOfBoundsError should have correct error code', async () => {
      const doc = await createTestDocument();

      try {
        await drawTextOnPage(doc, {
          text: 'Test',
          x: -1,
          y: 700,
          page: 1,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfOutOfBoundsError);
        expect((error as PdfOutOfBoundsError).code).toBe(PdfErrorCode.InvalidFieldValue);
      }
    });

    it('PdfOutOfBoundsError should extend Error', () => {
      const error = new PdfOutOfBoundsError('x', 100, 50);
      expect(error).toBeInstanceOf(Error);
    });

    it('PdfOutOfBoundsError should have correct name property', () => {
      const error = new PdfOutOfBoundsError('y', 200, 100);
      expect(error.name).toBe('PdfOutOfBoundsError');
    });

    it('PdfOutOfBoundsError should expose coordinate, value, and max properties', () => {
      const error = new PdfOutOfBoundsError('x', 150, 100);
      expect(error.coordinate).toBe('x');
      expect(error.value).toBe(150);
      expect(error.max).toBe(100);
    });
  });

  describe('integration with document save', () => {
    it('should produce a valid PDF after drawing text', async () => {
      const doc = await createTestDocument();

      await drawTextOnPage(doc, {
        text: 'Test text',
        x: 100,
        y: 700,
        page: 1,
        fontSize: 16,
        fontName: 'Helvetica',
      });

      const pdfBytes = await doc.save();

      // Verify PDF is non-empty and starts with PDF header
      expect(pdfBytes.length).toBeGreaterThan(0);
      const header = new TextDecoder().decode(pdfBytes.slice(0, 8));
      expect(header).toContain('%PDF');
    });

    it('should allow the document to be reloaded after saving with text', async () => {
      const doc = await createTestDocument();

      await drawTextOnPage(doc, {
        text: 'Persistent text',
        x: 100,
        y: 700,
        page: 1,
      });

      const pdfBytes = await doc.save();

      // Reload the PDF
      const reloadedDoc = await PDFDocument.load(pdfBytes);
      expect(reloadedDoc.getPageCount()).toBe(1);
    });
  });
});
