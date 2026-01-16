import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPreviewPdfTool(server: McpServer): void {
  server.registerTool(
    'preview_pdf',
    {
      description:
        'Open the current PDF in the system default PDF viewer for visual inspection',
      inputSchema: {},
    },
    async () => {
      // TODO: Implement in Task 3.5
      return {
        content: [
          {
            type: 'text',
            text: '[Not yet implemented] Would open PDF in system viewer',
          },
        ],
      };
    }
  );
}
