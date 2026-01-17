#!/usr/bin/env node
/**
 * mcpdf - MCP server for intelligently reading and filling PDF forms
 *
 * CLI entry point that starts the MCP server with stdio transport.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer, VERSION, SERVER_NAME } from './server.js';

// Re-export for backwards compatibility
export { VERSION, SERVER_NAME, createServer };

// =============================================================================
// Server Startup
// =============================================================================

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error('Failed to start mcpdf server:', error);
  process.exit(1);
});
