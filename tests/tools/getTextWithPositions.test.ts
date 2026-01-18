import { test, describe, expect } from '../fixtures/index.js';
import { clearSession } from '../../src/state/session.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

interface TextPositionItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextPositionResponse {
  page: number;
  width: number;
  height: number;
  text: string;
  items: TextPositionItem[];
}

describe('get_text_with_positions tool', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('should extract text with positions', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    const content = result.content as ToolResponseContent[];
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('text');
    
    const response = JSON.parse(content[0].text!) as TextPositionResponse;
    expect(response.page).toBe(1);
    expect(typeof response.width).toBe('number');
    expect(typeof response.height).toBe('number');
    expect(typeof response.text).toBe('string');
    expect(Array.isArray(response.items)).toBe(true);
  });

  test('should return correct page dimensions for letter size', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    const response = JSON.parse((result.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    // US Letter size is 612 x 792 points
    expect(response.width).toBe(612);
    expect(response.height).toBe(792);
  });

  test('should verify item properties have correct types', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.multiPage } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    const response = JSON.parse((result.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    
    // Multi-page PDF has content on page 1
    expect(response.items.length).toBeGreaterThan(0);
    
    // Verify each item has correct structure
    for (const item of response.items) {
      expect(typeof item.text).toBe('string');
      expect(typeof item.x).toBe('number');
      expect(typeof item.y).toBe('number');
      expect(typeof item.width).toBe('number');
      expect(typeof item.height).toBe('number');
    }
  });

  test('should include text concatenation', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.multiPage } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    const response = JSON.parse((result.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    
    // Verify text field contains "Page 1" (from the multi-page PDF content)
    expect(response.text).toContain('Page 1');
  });

  test('should extract from different pages in multi-page PDF', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.multiPage } });
    
    // Page 1
    const result1 = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });
    const response1 = JSON.parse((result1.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    expect(response1.page).toBe(1);
    expect(response1.text).toContain('Page 1');

    // Page 2
    const result2 = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 2 },
    });
    const response2 = JSON.parse((result2.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    expect(response2.page).toBe(2);
    expect(response2.text).toContain('Page 2');
  });

  test('should fail if no PDF is open', async ({ client }) => {
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('No active PDF session');
  });

  test('should fail if page is out of range', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 999 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('Invalid page number');
    expect(text).toContain('PDF has 1 page');
  });

  test('should extract text from empty (no-form-fields) PDF', async ({ client, pdfs }) => {
    // Note: empty.pdf has no form fields but does have text content
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.empty } });
    
    const result = await client.callTool({
      name: 'get_text_with_positions',
      arguments: { page: 1 },
    });

    expect(result.isError).not.toBe(true);
    const response = JSON.parse((result.content as ToolResponseContent[])[0].text!) as TextPositionResponse;
    // empty.pdf contains text about being a test PDF with no form fields
    expect(response.text).toContain('no form fields');
    expect(response.items.length).toBeGreaterThan(0);
  });
});
