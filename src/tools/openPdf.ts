import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

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
      // TODO: Implement in Task 3.1
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would open PDF: ${path}`,
          },
        ],
      };
    }
  );
}
