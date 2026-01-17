import { test, describe, expect } from '../fixtures/index.js';
import {
  clearSession,
} from '../../src/state/session.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

interface ContextResponse {
  field: {
    name: string;
    type: string;
    description?: string;
  };
  context: {
    inferredLabel?: string;
    nearbyText?: string[];
    pageNumber: number;
  };
}

describe('get_field_context tool', () => {
  // Clear session before each test
  test.beforeEach(() => {
    clearSession();
  });

  test('should return context for a known field', async ({ client, pdfs }) => {
    // First open the PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.simpleForm,
      },
    });

    // Get context for 'name' field
    const result = await client.callTool({
      name: 'get_field_context',
      arguments: {
        fieldName: 'name',
      },
    });

    const content = result.content as ToolResponseContent[];
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('text');
    
    const response = JSON.parse(content[0].text as string) as ContextResponse;
    
    // Check field metadata
    expect(response.field.name).toBe('name');
    expect(response.field.type).toBe('text');
    
    // Check context - assuming the PDF generation places "Name:" above the field
    expect(response.context.pageNumber).toBe(1);
    
    // Note: Text extraction might return "Name:" or "Name" depending on how pdfjs-dist processes it
    if (response.context.inferredLabel) {
      expect(response.context.inferredLabel).toContain('Name');
    }
  });

  test('should handle non-existent field', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.simpleForm,
      },
    });

    const result = await client.callTool({
      name: 'get_field_context',
      arguments: {
        fieldName: 'non_existent_field',
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain("Field 'non_existent_field' not found");
  });

  test('should fail if no session is active', async ({ client }) => {
    const result = await client.callTool({
      name: 'get_field_context',
      arguments: {
        fieldName: 'name',
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('No active PDF session');
  });
});
