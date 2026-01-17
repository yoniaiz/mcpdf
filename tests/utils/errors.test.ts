import { describe, it, expect } from 'vitest';
import { formatToolError, SessionError, McpdfErrorCode } from '../../src/utils/errors.js';
import { PdfFileNotFoundError, PdfInvalidPageError } from '../../src/pdf/errors.js';

describe('Error Utilities', () => {
  describe('formatToolError', () => {
    it('should format PdfError correctly', () => {
      const error = new PdfFileNotFoundError('/path/to/file.pdf');
      expect(formatToolError(error)).toBe('PDF file not found: /path/to/file.pdf');
    });

    it('should format SessionError correctly', () => {
      const error = new SessionError('Custom session error');
      expect(formatToolError(error)).toBe('Custom session error');
    });

    it('should format standard Error correctly', () => {
      const error = new Error('Standard error message');
      expect(formatToolError(error)).toBe('Standard error message');
    });

    it('should format unknown error correctly', () => {
      const error = 'Something went wrong';
      expect(formatToolError(error)).toBe('Unknown error occurred: Something went wrong');
    });

    it('should format complex PdfError correctly', () => {
      const error = new PdfInvalidPageError(5, 3);
      expect(formatToolError(error)).toBe('Invalid page number: 5. PDF has 3 pages (1-indexed).');
    });
  });

  describe('SessionError', () => {
    it('should set default code', () => {
      const error = new SessionError('Message');
      expect(error.code).toBe(McpdfErrorCode.NoSession);
    });

    it('should allow custom code', () => {
      const error = new SessionError('Message', McpdfErrorCode.SessionExpired);
      expect(error.code).toBe(McpdfErrorCode.SessionExpired);
    });
  });
});
