import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { basename } from 'node:path';
import { loadPdf } from '../pdf/reader.js';
import { setActiveSession } from '../state/session.js';

export function registerOpenPdfTool(server: McpServer): void {
  server.registerTool(
    'open_pdf',
    {
      description:
        'Open a PDF file and get document summary including page count, form fields, and document type',
      inputSchema: {
        path: z.string().describe('Absolute or relative path to the PDF file'),
      },
    },
    async ({ path }) => {
      try {
        const loadedPdf = await loadPdf(path);

        setActiveSession({
          document: loadedPdf.document,
          filePath: loadedPdf.path,
          originalPath: loadedPdf.path,
          pageCount: loadedPdf.pageCount,
          isModified: false,
        });

        const filename = basename(loadedPdf.path);
        const formStatus = loadedPdf.hasForm
          ? `Interactive Form with ${loadedPdf.fieldCount} field${loadedPdf.fieldCount !== 1 ? 's' : ''}`
          : 'No Interactive Form';

        const summary = [
          `Successfully opened PDF: ${filename}`,
          `Location: ${loadedPdf.path}`,
          `Pages: ${loadedPdf.pageCount}`,
          `Type: ${formStatus}`,
        ].join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error opening PDF: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
