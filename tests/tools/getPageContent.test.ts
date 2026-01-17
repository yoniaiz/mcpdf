import { test, describe, expect } from '../fixtures/index.js';
import { clearSession } from '../../src/state/session.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('get_page_content tool', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('should extract text from a valid page', async ({ client, pdfs }) => {
    // 1. Open PDF
    await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.simpleForm,
      },
    });

    // 2. Get page content
    const result = await client.callTool({
      name: 'get_page_content',
      arguments: {
        page: 1,
      },
    });

    const content = result.content as ToolResponseContent[];
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('text');
    const text = content[0].text as string;
    
    // Expect some text from the simple-form PDF
    // Based on previous tasks, simple-form usually has some content.
    // We can just check that it returns a string.
    expect(typeof text).toBe('string');
    // If we knew the exact content we could test it, but for now checking it's not empty is good
    // However, the simple-form might be empty of text if it's just fields.
    // Let's use multiPage which likely has text or page numbers.
  });

  test('should extract text from multi-page PDF', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.multiPage,
      },
    });

    // Page 1
    const result1 = await client.callTool({
      name: 'get_page_content',
      arguments: {
        page: 1,
      },
    });
    
    const text1 = (result1.content as ToolResponseContent[])[0].text;
    expect(text1).toContain('Page 1');

    // Page 2
    const result2 = await client.callTool({
      name: 'get_page_content',
      arguments: {
        page: 2,
      },
    });
    const text2 = (result2.content as ToolResponseContent[])[0].text;
    expect(text2).toContain('Page 2');
  });

  test('should fail if page is out of range', async ({ client, pdfs }) => {
    await client.callTool({
      name: 'open_pdf',
      arguments: {
        path: pdfs.simpleForm,
      },
    });

    const result = await client.callTool({
      name: 'get_page_content',
      arguments: {
        page: 999,
      },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('Invalid page number');
    expect(text).toContain('PDF has 1 page');
  });

  test('should fail if no PDF is open', async ({ client }) => {
    const result = await client.callTool({
      name: 'get_page_content',
      arguments: {
        page: 1,
      },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as ToolResponseContent[])[0].text;
    expect(text).toContain('No active PDF session');
  });
});
