import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGetPageContentTool(server: McpServer): void {
  server.registerTool(
    'get_page_content',
    {
      description: 'Extract and return the text content of a specific page in the PDF',
      inputSchema: {
        page: z.number().describe('Page number to extract text from (1-indexed)'),
      },
    },
    async ({ page }) => {
      // TODO: Implement in Task 3.7
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would get content for page: ${page}`,
          },
        ],
      };
    }
  );
}
