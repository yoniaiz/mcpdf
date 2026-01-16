import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGetFieldContextTool(server: McpServer): void {
  server.registerTool(
    'get_field_context',
    {
      description:
        'Get detailed context for a specific form field including surrounding text, section name, and constraints',
      inputSchema: {
        fieldName: z.string().describe('Name of the field to get context for'),
      },
    },
    async ({ fieldName }) => {
      // TODO: Implement in Task 3.3
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would get context for field: ${fieldName}`,
          },
        ],
      };
    }
  );
}
