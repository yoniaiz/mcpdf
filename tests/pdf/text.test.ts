/**
 * PDF Text Extraction unit tests
 */

import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {
  extractPageText,
  extractAllText,
  extractTextWithPositions,
  PdfFileNotFoundError,
  PdfNotAPdfError,
  PdfInvalidPageError,
  PdfErrorCode,
} from '../../src/pdf/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test PDFs
const pdfsDir = join(__dirname, '../pdfs');

describe('extractPageText', () => {
  describe('successful extraction', () => {
    it('should extract text from a single page PDF', async () => {
      const result = await extractPageText(join(pdfsDir, 'simple-form.pdf'), 1);

      expect(result.page).toBe(1);
      expect(result.text).toContain('Simple Form Test PDF');
      expect(result.text).toContain('Name:');
      expect(result.text).toContain('Email:');
    });

    it('should extract text from a specific page of a multi-page PDF', async () => {
      // Page 1 - Personal Information
      const page1 = await extractPageText(join(pdfsDir, 'multi-page.pdf'), 1);
      expect(page1.page).toBe(1);
      expect(page1.text).toContain('Personal Information');
      expect(page1.text).toContain('First Name');

      // Page 2 - Contact Information
      const page2 = await extractPageText(join(pdfsDir, 'multi-page.pdf'), 2);
      expect(page2.page).toBe(2);
      expect(page2.text).toContain('Contact Information');
      expect(page2.text).toContain('Phone');

      // Page 3 - Preferences
      const page3 = await extractPageText(join(pdfsDir, 'multi-page.pdf'), 3);
      expect(page3.page).toBe(3);
      expect(page3.text).toContain('Preferences');
      expect(page3.text).toContain('newsletter');
    });

    it('should extract text from empty PDF (PDF with no form fields)', async () => {
      const result = await extractPageText(join(pdfsDir, 'empty.pdf'), 1);

      expect(result.page).toBe(1);
      expect(result.text).toContain('Empty PDF Test');
      expect(result.text).toContain('no form fields');
    });

    it('should not include items array when positions not requested', async () => {
      const result = await extractPageText(join(pdfsDir, 'simple-form.pdf'), 1);

      expect(result.items).toBeUndefined();
    });
  });

  describe('invalid page number', () => {
    it('should throw PdfInvalidPageError for page 0', async () => {
      await expect(
        extractPageText(join(pdfsDir, 'simple-form.pdf'), 0)
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should throw PdfInvalidPageError for negative page', async () => {
      await expect(
        extractPageText(join(pdfsDir, 'simple-form.pdf'), -1)
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should throw PdfInvalidPageError for page beyond document', async () => {
      await expect(
        extractPageText(join(pdfsDir, 'simple-form.pdf'), 2) // single page PDF
      ).rejects.toThrow(PdfInvalidPageError);
    });

    it('should include page count in error message', async () => {
      try {
        await extractPageText(join(pdfsDir, 'simple-form.pdf'), 5);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfInvalidPageError);
        expect((error as PdfInvalidPageError).message).toContain('1 page');
        expect((error as PdfInvalidPageError).code).toBe(PdfErrorCode.InvalidPage);
      }
    });
  });

  describe('file errors', () => {
    it('should throw PdfFileNotFoundError for non-existent file', async () => {
      await expect(
        extractPageText(join(pdfsDir, 'does-not-exist.pdf'), 1)
      ).rejects.toThrow(PdfFileNotFoundError);
    });

    it('should throw PdfNotAPdfError for non-.pdf extension', async () => {
      const tempTextFile = join(pdfsDir, 'temp-text-test.txt');
      await writeFile(tempTextFile, 'This is not a PDF');

      try {
        await expect(extractPageText(tempTextFile, 1)).rejects.toThrow(
          PdfNotAPdfError
        );
      } finally {
        await unlink(tempTextFile).catch(() => {});
      }
    });
  });
});

describe('extractAllText', () => {
  describe('successful extraction', () => {
    it('should extract text from all pages of a single page PDF', async () => {
      const results = await extractAllText(join(pdfsDir, 'simple-form.pdf'));

      expect(results).toHaveLength(1);
      expect(results[0].page).toBe(1);
      expect(results[0].text).toContain('Simple Form Test PDF');
    });

    it('should extract text from all pages of a multi-page PDF', async () => {
      const results = await extractAllText(join(pdfsDir, 'multi-page.pdf'));

      expect(results).toHaveLength(3);

      // Verify page ordering
      expect(results[0].page).toBe(1);
      expect(results[1].page).toBe(2);
      expect(results[2].page).toBe(3);

      // Verify content from each page
      expect(results[0].text).toContain('Personal Information');
      expect(results[1].text).toContain('Contact Information');
      expect(results[2].text).toContain('Preferences');
    });

    it('should return empty array items on each page', async () => {
      const results = await extractAllText(join(pdfsDir, 'simple-form.pdf'));

      for (const page of results) {
        expect(page.items).toBeUndefined();
      }
    });
  });

  describe('file errors', () => {
    it('should throw PdfFileNotFoundError for non-existent file', async () => {
      await expect(
        extractAllText(join(pdfsDir, 'does-not-exist.pdf'))
      ).rejects.toThrow(PdfFileNotFoundError);
    });
  });
});

describe('extractTextWithPositions', () => {
  describe('successful extraction', () => {
    it('should extract text with position data', async () => {
      const result = await extractTextWithPositions(
        join(pdfsDir, 'simple-form.pdf'),
        1
      );

      expect(result.page).toBe(1);
      expect(result.text).toContain('Simple Form Test PDF');
      expect(result.items).toBeDefined();
      expect(result.items!.length).toBeGreaterThan(0);
    });

    it('should include x, y, width, height for each text item', async () => {
      const result = await extractTextWithPositions(
        join(pdfsDir, 'simple-form.pdf'),
        1
      );

      for (const item of result.items!) {
        expect(typeof item.text).toBe('string');
        expect(typeof item.x).toBe('number');
        expect(typeof item.y).toBe('number');
        expect(typeof item.width).toBe('number');
        expect(typeof item.height).toBe('number');
      }
    });

    it('should have reasonable position values', async () => {
      const result = await extractTextWithPositions(
        join(pdfsDir, 'simple-form.pdf'),
        1
      );

      // PDF page is Letter size (612x792 points)
      for (const item of result.items!) {
        expect(item.x).toBeGreaterThanOrEqual(0);
        expect(item.y).toBeGreaterThanOrEqual(0);
        expect(item.x).toBeLessThan(700); // Allow some margin
        expect(item.y).toBeLessThan(850);
      }
    });

    it('should match text content between extractPageText and extractTextWithPositions', async () => {
      const withoutPositions = await extractPageText(
        join(pdfsDir, 'simple-form.pdf'),
        1
      );
      const withPositions = await extractTextWithPositions(
        join(pdfsDir, 'simple-form.pdf'),
        1
      );

      // Text content should be identical
      expect(withPositions.text).toBe(withoutPositions.text);
    });
  });

  describe('invalid page number', () => {
    it('should throw PdfInvalidPageError for page beyond document', async () => {
      await expect(
        extractTextWithPositions(join(pdfsDir, 'simple-form.pdf'), 10)
      ).rejects.toThrow(PdfInvalidPageError);
    });
  });

  describe('file errors', () => {
    it('should throw PdfFileNotFoundError for non-existent file', async () => {
      await expect(
        extractTextWithPositions(join(pdfsDir, 'does-not-exist.pdf'), 1)
      ).rejects.toThrow(PdfFileNotFoundError);
    });
  });
});

describe('PdfInvalidPageError', () => {
  it('should have correct error code', () => {
    const error = new PdfInvalidPageError(5, 3);
    expect(error.code).toBe(PdfErrorCode.InvalidPage);
  });

  it('should format message correctly for single page', () => {
    const error = new PdfInvalidPageError(5, 1);
    expect(error.message).toContain('5');
    expect(error.message).toContain('1 page');
  });

  it('should format message correctly for multiple pages', () => {
    const error = new PdfInvalidPageError(10, 3);
    expect(error.message).toContain('10');
    expect(error.message).toContain('3 pages');
  });

  it('should have correct name property', () => {
    const error = new PdfInvalidPageError(1, 1);
    expect(error.name).toBe('PdfInvalidPageError');
  });

  it('should extend Error', () => {
    const error = new PdfInvalidPageError(1, 1);
    expect(error).toBeInstanceOf(Error);
  });
});
