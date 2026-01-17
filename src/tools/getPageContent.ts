import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { extractPageText } from '../pdf/text.js';
import { getActiveSession } from '../state/session.js';

export function registerGetPageContentTool(server: McpServer): void {
  server.registerTool(
    'get_page_content',
    {
      description: 'Extract and return the text content of a specific page in the PDF',
      inputSchema: {
        page: z.number().int().min(1).describe('Page number to extract text from (1-indexed)'),
      },
    },
    async ({ page }) => {
      try {
        const session = getActiveSession();
        if (!session) {
          throw new Error('No active session. Please open a PDF first.');
        }

        if (page > session.pageCount) {
          throw new Error(`Page ${page} is out of range. Document has ${session.pageCount} pages.`);
        }

        // We use the file path instead of the document object because pdfjs-dist 
        // handles its own document loading for text extraction
        const pageText = await extractPageText(session.filePath, page);

        return {
          content: [
            {
              type: 'text',
              text: pageText.text,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error extracting content: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
