import { vi } from 'vitest';
import { test, describe, expect } from '../fixtures/index.js';
import {
  clearSession,
  markSessionModified,
} from '../../src/state/session.js';
import { tmpdir } from 'node:os';

// Mock dependencies using vi.hoisted to handle hoisting correctly
const mocks = vi.hoisted(() => ({
  openFile: vi.fn(),
  savePdf: vi.fn(),
}));

vi.mock('../../src/utils/platform.js', () => ({
  openFile: mocks.openFile,
}));

vi.mock('../../src/pdf/writer.js', () => ({
  savePdf: mocks.savePdf,
}));

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('preview_pdf tool', () => {
  test.beforeEach(() => {
    clearSession();
    mocks.openFile.mockReset();
    mocks.savePdf.mockReset();
  });

  test('should open original file when session is unmodified', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Call preview_pdf
    const result = await client.callTool({
      name: 'preview_pdf',
      arguments: {},
    });

    // Verify response
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Opened original file');
    expect(content[0].text).toContain(pdfs.simpleForm);

    // Verify mocks
    expect(mocks.savePdf).not.toHaveBeenCalled();
    expect(mocks.openFile).toHaveBeenCalledWith(pdfs.simpleForm);
  });

  test('should save and open temp file when session is modified', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Mark as modified
    markSessionModified();

    // 3. Call preview_pdf
    const result = await client.callTool({
      name: 'preview_pdf',
      arguments: {},
    });

    // Verify response
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Saved changes to temporary file');
    
    // Verify mocks
    expect(mocks.savePdf).toHaveBeenCalled();
    // Verify savePdf was called with (document, originalPath, tempPath)
    const [, originalPath, tempPath] = mocks.savePdf.mock.calls[0];
    expect(originalPath).toBe(pdfs.simpleForm);
    expect(tempPath).toContain(tmpdir());
    expect(tempPath).toContain('mcpdf_preview_');
    expect(tempPath).toContain('.pdf');

    expect(mocks.openFile).toHaveBeenCalledWith(tempPath);
  });

  test('should handle no active session', async ({ client }) => {
    const result = await client.callTool({
      name: 'preview_pdf',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('No active PDF session');
  });

  test('should handle open failure', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Mock open failure
    mocks.openFile.mockRejectedValueOnce(new Error('Open failed'));

    // 3. Call preview_pdf
    const result = await client.callTool({
      name: 'preview_pdf',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Error: Open failed');
  });
});
