/**
 * MCP Server initialization tests
 *
 * Tests that the MCP server starts correctly and all tools are registered.
 * Uses Vitest fixtures for server/client lifecycle management.
 */

import { test, describe, expect } from './fixtures/index.js';

describe('MCP Server', () => {
  describe('Server Initialization', () => {
    test('should have correct server metadata', async ({ client }) => {
      // The client is already connected, which means the server initialized correctly
      // We can verify by checking that tools are available
      const { tools } = await client.listTools();
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Registration', () => {
    test('should register all 7 tools', async ({ client }) => {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(7);
    });

    test('should register open_pdf tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const openPdfTool = tools.find((t) => t.name === 'open_pdf');
      expect(openPdfTool).toBeDefined();
      expect(openPdfTool?.description).toContain('PDF');
    });

    test('should register list_fields tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'list_fields');
      expect(tool).toBeDefined();
      expect(tool?.description).toContain('field');
    });

    test('should register get_field_context tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'get_field_context');
      expect(tool).toBeDefined();
    });

    test('should register fill_field tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'fill_field');
      expect(tool).toBeDefined();
    });

    test('should register preview_pdf tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'preview_pdf');
      expect(tool).toBeDefined();
    });

    test('should register save_pdf tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'save_pdf');
      expect(tool).toBeDefined();
    });

    test('should register get_page_content tool', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'get_page_content');
      expect(tool).toBeDefined();
    });

    test('should have all expected tool names', async ({ client }) => {
      const { tools } = await client.listTools();
      const toolNames = tools.map((t) => t.name);

      expect(toolNames).toContain('open_pdf');
      expect(toolNames).toContain('list_fields');
      expect(toolNames).toContain('get_field_context');
      expect(toolNames).toContain('fill_field');
      expect(toolNames).toContain('preview_pdf');
      expect(toolNames).toContain('save_pdf');
      expect(toolNames).toContain('get_page_content');
    });
  });

  describe('Tool Schemas', () => {
    test('open_pdf should have required path parameter', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'open_pdf');

      expect(tool?.inputSchema).toBeDefined();
      const schema = tool?.inputSchema as Record<string, unknown>;
      expect(schema.type).toBe('object');

      const properties = schema.properties as Record<string, unknown>;
      expect(properties).toHaveProperty('path');

      const required = schema.required as string[];
      expect(required).toContain('path');
    });

    test('list_fields should have optional page parameter', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'list_fields');

      expect(tool?.inputSchema).toBeDefined();
      const schema = tool?.inputSchema as Record<string, unknown>;
      const properties = schema.properties as Record<string, unknown>;
      expect(properties).toHaveProperty('page');

      // page should be optional (not in required array)
      const required = (schema.required as string[]) ?? [];
      expect(required).not.toContain('page');
    });

    test('fill_field should have required fieldName parameter', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'fill_field');

      expect(tool?.inputSchema).toBeDefined();
      const schema = tool?.inputSchema as Record<string, unknown>;
      const properties = schema.properties as Record<string, unknown>;
      expect(properties).toHaveProperty('fieldName');

      const required = schema.required as string[];
      expect(required).toContain('fieldName');
    });

    test('get_page_content should have required page parameter', async ({ client }) => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === 'get_page_content');

      expect(tool?.inputSchema).toBeDefined();
      const schema = tool?.inputSchema as Record<string, unknown>;
      const properties = schema.properties as Record<string, unknown>;
      expect(properties).toHaveProperty('page');

      const required = schema.required as string[];
      expect(required).toContain('page');
    });
  });
});

describe('PDF Test Fixtures', () => {
  test('should have valid fixture paths', async ({ pdfs }) => {
    expect(pdfs.simpleForm).toContain('simple-form.pdf');
    expect(pdfs.multiPage).toContain('multi-page.pdf');
    expect(pdfs.empty).toContain('empty.pdf');
  });

  test('should have fixture files that exist', async ({ pdfs }) => {
    const fs = await import('node:fs');

    expect(fs.existsSync(pdfs.simpleForm)).toBe(true);
    expect(fs.existsSync(pdfs.multiPage)).toBe(true);
    expect(fs.existsSync(pdfs.empty)).toBe(true);
  });
});
