#!/usr/bin/env node
/**
 * mcpdf - MCP server for intelligently reading and filling PDF forms
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';

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

// Register all tools
registerTools(server);

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
