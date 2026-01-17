import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getActiveSession } from '../state/session.js';
import { extractFields, getFieldsByPage } from '../pdf/fields.js';
import { PdfInvalidPageError } from '../pdf/errors.js';
import { formatToolError } from '../utils/errors.js';

export function registerListFieldsTool(server: McpServer): void {
  server.registerTool(
    'list_fields',
    {
      description:
        'List all form fields in the currently opened PDF with their metadata (name, type, page, current value)',
      inputSchema: {
        page: z
          .number()
          .optional()
          .describe('Optional page number to filter fields (1-indexed)'),
      },
    },
    async ({ page }) => {
      try {
        const session = getActiveSession();
        const { document } = session;

        let fields;
        if (page !== undefined) {
          const pageCount = document.getPageCount();
          if (page < 1 || page > pageCount) {
            throw new PdfInvalidPageError(page, pageCount);
          }
          fields = getFieldsByPage(document, page);
        } else {
          fields = extractFields(document);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(fields, null, 2),
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
