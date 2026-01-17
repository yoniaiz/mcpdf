import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import os from 'node:os';
import path from 'node:path';
import { getActiveSession } from '../state/session.js';
import { savePdf } from '../pdf/writer.js';
import { openFile } from '../utils/platform.js';
import { formatToolError } from '../utils/errors.js';
import { z } from 'zod';

export function registerPreviewPdfTool(server: McpServer): void {
  server.registerTool(
    'preview_pdf',
    {
      description:
        'Open the current PDF in the system default PDF viewer for visual inspection. If changes have been made, a temporary file will be created and opened.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const session = getActiveSession();
        let previewPath: string;
        let message: string;

        if (session.isModified) {
          // If modified, save to a temp file
          const tempDir = os.tmpdir();
          const fileName = `mcpdf_preview_${Date.now()}.pdf`;
          const tempPath = path.join(tempDir, fileName);
          
          // Pass session.filePath as original and tempPath as the output path
          await savePdf(session.document, session.filePath, tempPath);
          previewPath = tempPath;
          message = `Saved changes to temporary file and opened preview: ${previewPath}`;
        } else {
          // If not modified, open original file
          previewPath = session.filePath;
          message = `Opened original file for preview: ${previewPath}`;
        }

        await openFile(previewPath);

        return {
          content: [
            {
              type: 'text',
              text: message,
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
