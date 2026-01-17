import { test, describe, expect } from '../fixtures/index.js';
import {
  getActiveSession,
  isSessionActive,
  clearSession,
} from '../../src/state/session.js';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('open_pdf tool', () => {
  // Clear session before each test to ensure isolation
  test.beforeEach(() => {
    clearSession();
  });

  test('should successfully open a valid PDF', async ({ client, pdfs }) => {
    const result = await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.simpleForm,
      },
    });

    // Verify output
    const content = result.content as ToolResponseContent[];
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('text');
    const text = content[0].text as string;
    expect(text).toContain('Successfully opened PDF');
    expect(text).toContain('simple-form.pdf');
    expect(text).toContain('Pages: 1');
    expect(text).toContain('Interactive Form with 6 fields');

    // Verify session state
    expect(isSessionActive()).toBe(true);
    const session = getActiveSession();
    expect(session.filePath).toBe(pdfs.simpleForm);
    expect(session.pageCount).toBe(1);
  });

  test('should handle non-existent file', async ({ client }) => {
    const nonExistentPath = '/path/to/non-existent.pdf';

    const result = await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: nonExistentPath,
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('PDF file not found');

    expect(isSessionActive()).toBe(false);
  });

  test('should handle invalid PDF file', async ({ client }) => {
    // Create a temp file that is not a PDF
    const tempFile = join(tmpdir(), `test-invalid-${Date.now()}.txt`);
    await writeFile(tempFile, 'Not a PDF');

    try {
      const result = await client.callTool({
        name: 'open_pdf',
        arguments: {
          path: tempFile,
        },
      });

      expect(result.isError).toBe(true);
      const content = result.content as ToolResponseContent[];
      // The error message from loadPdf for wrong extension is "File is not a PDF: ..."
      expect(content[0].text).toContain('File is not a PDF');
    } finally {
      await unlink(tempFile).catch(() => {});
    }

    expect(isSessionActive()).toBe(false);
  });
});

