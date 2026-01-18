import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { extractTextWithPositions } from '../pdf/text.js';
import { getActiveSession } from '../state/session.js';
import { PdfInvalidPageError } from '../pdf/errors.js';
import { formatToolError } from '../utils/errors.js';

/**
 * Register the get_text_with_positions tool for extracting text with coordinates.
 * This enables AI clients to analyze PDF layouts for static form filling.
 */
export function registerGetTextWithPositionsTool(server: McpServer): void {
  server.registerTool(
    'get_text_with_positions',
    {
      description: 'Get text content with x, y coordinates for each text item on a page',
      inputSchema: {
        page: z.number().int().min(1).describe('Page number (1-indexed)')
      }
    },
    async ({ page }) => {
      try {
        // 1. Get active session (throws if no PDF open)
        const session = getActiveSession();

        // 2. Validate page number BEFORE calling extractTextWithPositions (fail fast)
        if (page > session.pageCount) {
          throw new PdfInvalidPageError(page, session.pageCount);
        }

        // 3. Get page dimensions from pdf-lib (0-indexed)
        const pdfPage = session.document.getPage(page - 1);
        const width = pdfPage.getWidth();
        const height = pdfPage.getHeight();

        // 4. Extract text with positions using pdfjs-dist
        const pageText = await extractTextWithPositions(session.filePath, page);

        // 5. Return JSON response with page info, dimensions, and text items
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                page,
                width,
                height,
                text: pageText.text,
                items: pageText.items ?? [],
              }, null, 2),
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
