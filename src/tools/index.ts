import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerOpenPdfTool } from './openPdf.js';
import { registerListFieldsTool } from './listFields.js';
import { registerGetFieldContextTool } from './getFieldContext.js';
import { registerFillFieldTool } from './fillField.js';
import { registerPreviewPdfTool } from './previewPdf.js';
import { registerSavePdfTool } from './savePdf.js';
import { registerGetPageContentTool } from './getPageContent.js';
import { registerGetTextWithPositionsTool } from './getTextWithPositions.js';

export function registerTools(server: McpServer): void {
  registerOpenPdfTool(server);
  registerListFieldsTool(server);
  registerGetFieldContextTool(server);
  registerFillFieldTool(server);
  registerPreviewPdfTool(server);
  registerSavePdfTool(server);
  registerGetPageContentTool(server);
  registerGetTextWithPositionsTool(server);
}
