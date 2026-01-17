/**
 * PDF Reader unit tests
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {
  loadPdf,
  PdfFileNotFoundError,
  PdfNotAPdfError,
  PdfInvalidError,
  PdfProtectedError,
  PdfTooLargeError,
  PdfErrorCode,
  MAX_PDF_SIZE_BYTES,
} from '../../src/pdf/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test PDFs
const pdfsDir = join(__dirname, '../pdfs');

describe('loadPdf', () => {
  describe('successful loading', () => {
    it('should load a valid PDF with form fields', async () => {
      const result = await loadPdf(join(pdfsDir, 'simple-form.pdf'));

      expect(result.document).toBeDefined();
      expect(result.path).toContain('simple-form.pdf');
      expect(result.pageCount).toBe(1);
      expect(result.hasForm).toBe(true);
      expect(result.fieldCount).toBe(4); // name, email, agree_terms, country
    });

    it('should load a multi-page PDF with fields on different pages', async () => {
      const result = await loadPdf(join(pdfsDir, 'multi-page.pdf'));

      expect(result.document).toBeDefined();
      expect(result.pageCount).toBe(3);
      expect(result.hasForm).toBe(true);
      expect(result.fieldCount).toBe(6);
    });

    it('should load a PDF without form fields', async () => {
      const result = await loadPdf(join(pdfsDir, 'empty.pdf'));

      expect(result.document).toBeDefined();
      expect(result.pageCount).toBe(1);
      expect(result.hasForm).toBe(false);
      expect(result.fieldCount).toBe(0);
    });

    it('should resolve relative paths to absolute paths', async () => {
      // Use a relative path
      const relativePath = 'tests/pdfs/simple-form.pdf';
      const result = await loadPdf(relativePath);

      expect(result.path).toMatch(/^[/\\]/); // Starts with / or \ (absolute)
      expect(result.path).toContain('simple-form.pdf');
    });
  });

  describe('file not found', () => {
    it('should throw PdfFileNotFoundError for non-existent file', async () => {
      const nonExistentPath = join(pdfsDir, 'does-not-exist.pdf');

      await expect(loadPdf(nonExistentPath)).rejects.toThrow(
        PdfFileNotFoundError
      );
    });

    it('should include the path in the error message', async () => {
      const nonExistentPath = join(pdfsDir, 'does-not-exist.pdf');

      try {
        await loadPdf(nonExistentPath);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfFileNotFoundError);
        expect((error as PdfFileNotFoundError).message).toContain(
          'does-not-exist.pdf'
        );
        expect((error as PdfFileNotFoundError).code).toBe(
          PdfErrorCode.FileNotFound
        );
      }
    });
  });

  describe('not a PDF file', () => {
    const tempTextFile = join(pdfsDir, 'temp-test.txt');

    beforeEach(async () => {
      await writeFile(tempTextFile, 'This is not a PDF');
    });

    afterEach(async () => {
      try {
        await unlink(tempTextFile);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should throw PdfNotAPdfError for non-.pdf extension', async () => {
      await expect(loadPdf(tempTextFile)).rejects.toThrow(PdfNotAPdfError);
    });

    it('should have correct error code', async () => {
      try {
        await loadPdf(tempTextFile);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfNotAPdfError);
        expect((error as PdfNotAPdfError).code).toBe(PdfErrorCode.NotAPdf);
      }
    });
  });

  describe('invalid PDF content', () => {
    const tempInvalidPdf = join(pdfsDir, 'temp-invalid.pdf');

    beforeEach(async () => {
      // Create a file with .pdf extension but invalid content
      await writeFile(tempInvalidPdf, 'This is not valid PDF content');
    });

    afterEach(async () => {
      try {
        await unlink(tempInvalidPdf);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should throw PdfInvalidError for corrupt PDF', async () => {
      await expect(loadPdf(tempInvalidPdf)).rejects.toThrow(PdfInvalidError);
    });

    it('should have correct error code', async () => {
      try {
        await loadPdf(tempInvalidPdf);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PdfInvalidError);
        expect((error as PdfInvalidError).code).toBe(PdfErrorCode.InvalidPdf);
      }
    });
  });

  describe('file too large', () => {
    it('should have correct MAX_PDF_SIZE_BYTES constant', () => {
      expect(MAX_PDF_SIZE_BYTES).toBe(50 * 1024 * 1024);
    });

    it('should throw PdfTooLargeError with correct message format', () => {
      const error = new PdfTooLargeError('/path/to/file.pdf', 60 * 1024 * 1024);
      expect(error.code).toBe(PdfErrorCode.FileTooLarge);
      expect(error.message).toContain('60.00MB');
      expect(error.message).toContain('50MB');
    });
  });

  describe('password-protected PDF', () => {
    // Note: pdf-lib cannot create encrypted PDFs, so we test the error handling logic
    // by verifying the error class behavior. Integration testing with real encrypted
    // PDFs would require a pre-made fixture.

    it('should have correct error properties for PdfProtectedError', () => {
      const error = new PdfProtectedError('/path/to/protected.pdf');

      expect(error.code).toBe(PdfErrorCode.ProtectedPdf);
      expect(error.message).toContain('password protected');
      expect(error.message).toContain('protected.pdf');
      expect(error.name).toBe('PdfProtectedError');
    });
  });

  describe('metadata extraction', () => {
    it('should correctly count pages', async () => {
      const singlePage = await loadPdf(join(pdfsDir, 'simple-form.pdf'));
      expect(singlePage.pageCount).toBe(1);

      const multiPage = await loadPdf(join(pdfsDir, 'multi-page.pdf'));
      expect(multiPage.pageCount).toBe(3);
    });

    it('should correctly detect form presence', async () => {
      const withForm = await loadPdf(join(pdfsDir, 'simple-form.pdf'));
      expect(withForm.hasForm).toBe(true);

      const withoutForm = await loadPdf(join(pdfsDir, 'empty.pdf'));
      expect(withoutForm.hasForm).toBe(false);
    });

    it('should correctly count fields', async () => {
      const simpleForm = await loadPdf(join(pdfsDir, 'simple-form.pdf'));
      expect(simpleForm.fieldCount).toBe(4);

      const multiPage = await loadPdf(join(pdfsDir, 'multi-page.pdf'));
      expect(multiPage.fieldCount).toBe(6);

      const empty = await loadPdf(join(pdfsDir, 'empty.pdf'));
      expect(empty.fieldCount).toBe(0);
    });

    it('should return the PDFDocument instance', async () => {
      const result = await loadPdf(join(pdfsDir, 'simple-form.pdf'));

      // Verify it's a real PDFDocument by calling a method
      expect(result.document.getPageCount()).toBe(1);
      expect(result.document.getForm()).toBeDefined();
    });
  });

  describe('error inheritance', () => {
    it('all PDF errors should extend Error', () => {
      expect(new PdfFileNotFoundError('/path')).toBeInstanceOf(Error);
      expect(new PdfNotAPdfError('/path')).toBeInstanceOf(Error);
      expect(new PdfInvalidError('/path')).toBeInstanceOf(Error);
      expect(new PdfProtectedError('/path')).toBeInstanceOf(Error);
      expect(new PdfTooLargeError('/path', 100)).toBeInstanceOf(Error);
    });

    it('all PDF errors should have correct name property', () => {
      expect(new PdfFileNotFoundError('/path').name).toBe('PdfFileNotFoundError');
      expect(new PdfNotAPdfError('/path').name).toBe('PdfNotAPdfError');
      expect(new PdfInvalidError('/path').name).toBe('PdfInvalidError');
      expect(new PdfProtectedError('/path').name).toBe('PdfProtectedError');
      expect(new PdfTooLargeError('/path', 100).name).toBe('PdfTooLargeError');
    });
  });
});
