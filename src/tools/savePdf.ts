import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerSavePdfTool(server: McpServer): void {
  server.registerTool(
    'save_pdf',
    {
      description:
        'Save the modified PDF to a new file. Original file is never modified',
      inputSchema: {
        outputPath: z
          .string()
          .optional()
          .describe(
            'Output file path. If not provided, saves as {original}_filled.pdf'
          ),
      },
    },
    async ({ outputPath }) => {
      // TODO: Implement in Task 3.6
      const pathInfo = outputPath ?? 'default location';
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would save PDF to: ${pathInfo}`,
          },
        ],
      };
    }
  );
}
