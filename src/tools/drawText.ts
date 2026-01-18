import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { drawTextOnPage } from '../pdf/overlay.js';
import { getActiveSession, markSessionModified } from '../state/session.js';
import { formatToolError } from '../utils/errors.js';

/**
 * Register the draw_text tool for placing text at specific coordinates.
 * This enables AI clients to fill static forms by drawing text at positions.
 */
export function registerDrawTextTool(server: McpServer): void {
  server.registerTool(
    'draw_text',
    {
      description: 'Draw text at specific coordinates on a PDF page',
      inputSchema: {
        text: z.string().describe('Text to draw on the page'),
        x: z.number().describe('X coordinate (points from left edge)'),
        y: z.number().describe('Y coordinate (points from bottom edge)'),
        page: z.number().int().min(1).describe('Page number (1-indexed)'),
        fontSize: z.number().optional().default(12).describe('Font size in points'),
        fontName: z.enum(['Helvetica', 'TimesRoman', 'Courier']).optional().default('Helvetica').describe('Standard font name'),
      },
    },
    async ({ text, x, y, page, fontSize, fontName }) => {
      try {
        // 1. Get active session (throws if no PDF open)
        const session = getActiveSession();

        // 2. Draw text using overlay module
        const result = await drawTextOnPage(session.document, {
          text,
          x,
          y,
          page,
          fontSize,
          fontName,
        });

        // 3. Mark session as modified
        markSessionModified();

        // 4. Return success message
        return {
          content: [
            {
              type: 'text',
              text: `Drew "${result.text}" at (${result.x}, ${result.y}) on page ${result.page} with ${result.fontName} ${result.fontSize}pt`,
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
