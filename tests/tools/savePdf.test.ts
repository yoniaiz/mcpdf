import { vi } from 'vitest';
import { test, describe, expect } from '../fixtures/index.js';
import { clearSession } from '../../src/state/session.js';
import { PdfSaveError } from '../../src/pdf/errors.js';

// Mock dependencies
const mocks = vi.hoisted(() => ({
  savePdf: vi.fn(),
}));

vi.mock('../../src/pdf/writer.js', () => ({
  savePdf: mocks.savePdf,
}));

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('save_pdf tool', () => {
  test.beforeEach(() => {
    clearSession();
    mocks.savePdf.mockReset();
    // Default success behavior
    mocks.savePdf.mockResolvedValue({
      outputPath: '/path/to/saved.pdf',
      bytesWritten: 1234,
    });
  });

  test('should save with default path when no output path provided', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Call save_pdf
    const result = await client.callTool({
      name: 'save_pdf',
      arguments: {},
    });

    // Verify response
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Successfully saved PDF');
    expect(content[0].text).toContain('/path/to/saved.pdf');

    // Verify savePdf called with correct args
    // First arg is document (complex object, check it exists)
    // Second arg is originalPath (pdfs.simpleForm)
    // Third arg is outputPath (undefined)
    expect(mocks.savePdf).toHaveBeenCalled();
    const args = mocks.savePdf.mock.calls[0];
    expect(args[0]).toBeDefined();
    expect(args[1]).toBe(pdfs.simpleForm);
    expect(args[2]).toBeUndefined();
  });

  test('should save with custom path', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Call save_pdf with custom path
    const customPath = '/custom/path/out.pdf';
    mocks.savePdf.mockResolvedValueOnce({
      outputPath: customPath,
      bytesWritten: 5678,
    });

    const result = await client.callTool({
      name: 'save_pdf',
      arguments: { outputPath: customPath },
    });

    // Verify response
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain(customPath);

    // Verify mocks
    expect(mocks.savePdf).toHaveBeenCalled();
    const args = mocks.savePdf.mock.calls[0];
    expect(args[1]).toBe(pdfs.simpleForm);
    expect(args[2]).toBe(customPath);
  });

  test('should handle no active session', async ({ client }) => {
    const result = await client.callTool({
      name: 'save_pdf',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('No active PDF session');
  });

  test('should handle save error', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Mock save failure
    mocks.savePdf.mockRejectedValueOnce(new PdfSaveError('/path/to/fail.pdf', 'Write failed'));

    // 3. Call save_pdf
    const result = await client.callTool({
      name: 'save_pdf',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Error saving PDF');
    expect(content[0].text).toContain('Write failed');
  });
});
