import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getActiveSession } from '../state/session.js';
import { savePdf } from '../pdf/writer.js';
import { formatToolError } from '../utils/errors.js';

export function registerSavePdfTool(server: McpServer): void {
  server.registerTool(
    'save_pdf',
    {
      description:
        'Save the current PDF document to a file. If no output path is provided, it will save to a new file with "_filled" appended to the original filename.',
      inputSchema: z.object({
        outputPath: z
          .string()
          .optional()
          .describe('Optional custom path to save the PDF to'),
      }),
    },
    async ({ outputPath }) => {
      try {
        const session = getActiveSession();
        
        // Save the PDF
        // We use session.filePath as the "originalPath" so that default naming
        // is based on the current file.
        const result = await savePdf(session.document, session.filePath, outputPath);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully saved PDF to ${result.outputPath} (${result.bytesWritten} bytes)`,
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
