import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerFillFieldTool(server: McpServer): void {
  server.registerTool(
    'fill_field',
    {
      description:
        'Fill a form field with user input. Uses elicitation to prompt for the value based on field type',
      inputSchema: {
        fieldName: z.string().describe('Name of the field to fill'),
      },
    },
    async ({ fieldName }) => {
      // TODO: Implement in Task 3.4 with elicitation
      return {
        content: [
          {
            type: 'text',
            text: `[Not yet implemented] Would fill field: ${fieldName}`,
          },
        ],
      };
    }
  );
}
