import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { extractPageText } from '../pdf/text.js';
import { getActiveSession } from '../state/session.js';
import { PdfInvalidPageError } from '../pdf/errors.js';
import { formatToolError } from '../utils/errors.js';

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

        if (page > session.pageCount) {
          throw new PdfInvalidPageError(page, session.pageCount);
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
              text: formatToolError(error),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
