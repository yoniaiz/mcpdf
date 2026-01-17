import { test, describe, expect } from '../fixtures/index.js';
import {
  getActiveSession,
  clearSession,
} from '../../src/state/session.js';
import { ElicitRequestSchema } from '@modelcontextprotocol/sdk/types.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

interface ExpectedPropertySchema {
  type: string;
  enum?: unknown[];
}

describe('fill_field tool', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('should fill a text field via elicitation', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // 2. Set up elicitation handler
    let elicitationReceived = false;
    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      elicitationReceived = true;
      
      if (request.params.mode === 'url') {
        throw new Error('Unexpected URL mode elicitation');
      }

      expect(request.params.mode).toBe('form');
      expect(request.params.message).toContain('field "name"');
      
      const requestedSchema = request.params.requestedSchema;
      expect(requestedSchema.properties.name).toBeDefined();
      expect((requestedSchema.properties.name as unknown as ExpectedPropertySchema).type).toBe('string');

      return {
        action: 'accept',
        content: {
          name: 'John Doe'
        }
      };
    });

    // 3. Call fill_field
    const result = await client.callTool({
      name: 'fill_field',
      arguments: { fieldName: 'name' },
    });

    // 4. Verify result
    expect(elicitationReceived).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Successfully filled field "name"');
    expect(content[0].text).toContain('John Doe');

    // 5. Verify session state
    const session = getActiveSession();
    expect(session.isModified).toBe(true);
  });

  test('should fill a checkbox field via elicitation', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      if (request.params.mode === 'url') throw new Error('Unexpected URL mode');
      
      expect(request.params.message).toContain('field "agree_terms"');
      const requestedSchema = request.params.requestedSchema;
      expect((requestedSchema.properties.agree_terms as unknown as ExpectedPropertySchema).type).toBe('boolean');

      return {
        action: 'accept',
        content: {
          agree_terms: true
        }
      };
    });

    const result = await client.callTool({
      name: 'fill_field',
      arguments: { fieldName: 'agree_terms' },
    });

    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Successfully filled field "agree_terms"');
    expect(content[0].text).toContain('true');
  });

  test('should fill a dropdown field via elicitation', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      if (request.params.mode === 'url') throw new Error('Unexpected URL mode');

      expect(request.params.message).toContain('field "country"');
      const schema = request.params.requestedSchema.properties.country as unknown as ExpectedPropertySchema;
      expect(schema.type).toBe('string');
      expect(schema.enum).toContain('Canada');

      return {
        action: 'accept',
        content: {
          country: 'Canada'
        }
      };
    });

    const result = await client.callTool({
      name: 'fill_field',
      arguments: { fieldName: 'country' },
    });

    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Successfully filled field "country"');
    expect(content[0].text).toContain('Canada');
  });

  test('should handle user decline', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    client.setRequestHandler(ElicitRequestSchema, async () => {
      return {
        action: 'decline'
      };
    });

    const result = await client.callTool({
      name: 'fill_field',
      arguments: { fieldName: 'name' },
    });

    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('cancelled or declined');
    
    // Verify session state NOT modified
    const session = getActiveSession();
    expect(session.isModified).toBe(false);
  });
});
