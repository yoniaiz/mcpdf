import { test, describe, expect } from '../fixtures/index.js';
import { clearSession, getActiveSession } from '../../src/state/session.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('draw_text tool', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('should draw text with default options', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Hello', x: 100, y: 700, page: 1 },
    });

    expect(result.isError).not.toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Drew "Hello"');
    expect(content[0].text).toContain('(100, 700)');
    expect(content[0].text).toContain('page 1');
    expect(content[0].text).toContain('Helvetica');
    expect(content[0].text).toContain('12pt');
  });

  test('should draw text with custom font and size', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Custom', x: 50, y: 600, page: 1, fontSize: 14, fontName: 'Courier' },
    });

    expect(result.isError).not.toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Drew "Custom"');
    expect(content[0].text).toContain('Courier');
    expect(content[0].text).toContain('14pt');
  });

  test('should fail if no PDF is open', async ({ client }) => {
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Test', x: 100, y: 700, page: 1 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('No active PDF session');
  });

  test('should fail if page is out of range', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Test', x: 100, y: 700, page: 999 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('Invalid page number');
    expect(text).toContain('PDF has 1 page');
  });

  test('should fail if x coordinate is out of bounds', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    // Letter width is 612 points
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Test', x: 700, y: 400, page: 1 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('out of bounds');
  });

  test('should fail if y coordinate is out of bounds', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    // Letter height is 792 points
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Test', x: 100, y: 900, page: 1 },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('out of bounds');
  });

  test('should mark session as modified after successful draw', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.simpleForm } });
    
    // Session should not be modified initially
    let session = getActiveSession();
    expect(session.isModified).toBe(false);

    // Draw text
    await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Test', x: 100, y: 700, page: 1 },
    });

    // Session should now be modified
    session = getActiveSession();
    expect(session.isModified).toBe(true);
  });

  test('should draw on page 2 of multi-page PDF', async ({ client, pdfs }) => {
    await client.callTool({ name: 'open_pdf', arguments: { path: pdfs.multiPage } });
    
    const result = await client.callTool({
      name: 'draw_text',
      arguments: { text: 'Page2Text', x: 200, y: 500, page: 2 },
    });

    expect(result.isError).not.toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('Drew "Page2Text"');
    expect(content[0].text).toContain('page 2');
  });
});
