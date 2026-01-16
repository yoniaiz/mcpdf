import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

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
      // TODO: Implement in Task 3.2
      const pageInfo = page ? ` for page ${page}` : '';
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would list fields${pageInfo}`,
          },
        ],
      };
    }
  );
}
