#!/usr/bin/env node
/**
 * mcpdf - MCP server for intelligently reading and filling PDF forms
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const VERSION = '0.1.0';

// Create the MCP server instance
const server = new McpServer(
  {
    name: 'mcpdf',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// =============================================================================
// Tool Registrations
// =============================================================================

// open_pdf - Load a PDF file and return document summary
server.tool(
  'open_pdf',
  'Open a PDF file and get document summary including page count, form fields, and document type',
  {
    path: z.string().describe('Absolute or relative path to the PDF file'),
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

// list_fields - Get all form fields with metadata
server.tool(
  'list_fields',
  'List all form fields in the currently opened PDF with their metadata (name, type, page, current value)',
  {
    page: z
      .number()
      .optional()
      .describe('Optional page number to filter fields (1-indexed)'),
  },
  async ({ page }) => {
    // TODO: Implement in Task 3.2
    const pageInfo = page ? ` for page ${page}` : '';
    return {
      content: [
        {
          type: 'text',
          text: `[Not yet implemented] Would list fields${pageInfo}`,
        },
      ],
    };
  }
);

// get_field_context - Get detailed context for a specific field
server.tool(
  'get_field_context',
  'Get detailed context for a specific form field including surrounding text, section name, and constraints',
  {
    fieldName: z.string().describe('Name of the field to get context for'),
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

// fill_field - Fill a form field with user input via elicitation
server.tool(
  'fill_field',
  'Fill a form field with user input. Uses elicitation to prompt for the value based on field type',
  {
    fieldName: z.string().describe('Name of the field to fill'),
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

// preview_pdf - Open current PDF state in system viewer
server.tool(
  'preview_pdf',
  'Open the current PDF in the system default PDF viewer for visual inspection',
  {},
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

// save_pdf - Save filled PDF to new file
server.tool(
  'save_pdf',
  'Save the modified PDF to a new file. Original file is never modified',
  {
    outputPath: z
      .string()
      .optional()
      .describe(
        'Output file path. If not provided, saves as {original}_filled.pdf'
      ),
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

// get_page_content - Get text content of a specific page
server.tool(
  'get_page_content',
  'Extract and return the text content of a specific page in the PDF',
  {
    page: z.number().describe('Page number to extract text from (1-indexed)'),
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

// =============================================================================
// Server Startup
// =============================================================================

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error('Failed to start mcpdf server:', error);
  process.exit(1);
});
