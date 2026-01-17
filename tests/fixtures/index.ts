/**
 * Vitest fixtures for mcpdf testing
 *
 * Uses Vitest's test.extend() to provide reusable fixtures for:
 * - MCP server lifecycle management
 * - MCP client connected via InMemoryTransport
 * - PDF test data file paths
 *
 * Inspired by patterns from:
 * - https://github.com/textlint/textlint/blob/HEAD/packages/textlint/test/mcp/server.test.ts
 * - https://github.com/bytedance/UI-TARS-desktop/blob/HEAD/packages/agent-infra/mcp-servers/browser/tests/tools/download.test.ts
 */

import { test as baseTest } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from '../../src/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDF test data file paths
 */
export interface PdfTestFiles {
  /** Basic form with text field, checkbox, and dropdown */
  simpleForm: string;
  /** Multi-page document with fields on different pages */
  multiPage: string;
  /** PDF with no form fields */
  empty: string;
}

/**
 * Test fixtures interface
 */
export interface McpdfTestFixtures {
  /** MCP server instance */
  server: McpServer;
  /** MCP client connected to server via InMemoryTransport */
  client: Client;
  /** Paths to PDF test data files */
  pdfs: PdfTestFiles;
}

/**
 * Extended test function with mcpdf fixtures.
 *
 * Usage:
 * ```typescript
 * import { test } from './fixtures/index.js';
 *
 * test('should list tools', async ({ client }) => {
 *   const { tools } = await client.listTools();
 *   expect(tools).toHaveLength(7);
 * });
 * ```
 */
export const test = baseTest.extend<McpdfTestFixtures>({
  /**
   * Server fixture - creates a new MCP server instance.
   * Automatically closed after each test.
   */
  // eslint-disable-next-line no-empty-pattern
  server: async ({}, use) => {
    const server = createServer();
    await use(server);
    await server.close();
  },

  /**
   * Client fixture - creates an MCP client connected to the server
   * via InMemoryTransport for fast, synchronous testing.
   * Automatically closed after each test.
   */
  client: async ({ server }, use) => {
    const client = new Client(
      { name: 'mcpdf-test-client', version: '1.0.0' },
      {
        capabilities: {
          elicitation: {},
          sampling: {},
        },
      }
    );

    // Create linked transport pair for in-memory communication
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    // Connect both ends
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    await use(client);

    await client.close();
  },

  /**
   * PDF test data paths fixture.
   * Provides paths to pre-generated PDF files for testing.
   */
  // eslint-disable-next-line no-empty-pattern
  pdfs: async ({}, use) => {
    const pdfsDir = path.join(__dirname, '../pdfs');
    await use({
      simpleForm: path.join(pdfsDir, 'simple-form.pdf'),
      multiPage: path.join(pdfsDir, 'multi-page.pdf'),
      empty: path.join(pdfsDir, 'empty.pdf'),
    });
  },
});

// Re-export common vitest utilities for convenience
export { describe, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
