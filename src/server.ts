/**
 * MCP Server factory for mcpdf
 *
 * Provides a createServer() function that can be used by both
 * the CLI entry point and tests.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools/index.js';

export const VERSION = '0.1.0';
export const SERVER_NAME = 'mcpdf';

export interface ServerOptions {
  name?: string;
  version?: string;
}

/**
 * Creates a new MCP server instance with all tools registered.
 * This factory function allows tests to create isolated server instances.
 */
export function createServer(options: ServerOptions = {}): McpServer {
  const server = new McpServer(
    {
      name: options.name ?? SERVER_NAME,
      version: options.version ?? VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tools
  registerTools(server);

  return server;
}
