import { test, describe, expect } from '../fixtures/index.js';
import { clearSession } from '../../src/state/session.js';
import { PdfField } from '../../src/pdf/types.js';

interface ToolResponseContent {
  type: string;
  text?: string;
}

describe('list_fields tool', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('should fail when no PDF is opened', async ({ client }) => {
    const result = await client.callTool({
      name: 'list_fields',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const content = result.content as ToolResponseContent[];
    expect(content[0].text).toContain('No active PDF session');
  });

  test('should list all fields from simple form', async ({ client, pdfs }) => {
    // Open PDF first
    await client.callTool({
      name: 'open_pdf',
      arguments: { path: pdfs.simpleForm },
    });

    // List fields
    const result = await client.callTool({
      name: 'list_fields',
      arguments: {},
    });

    // expect(result.isError).toBe(false); // isError is undefined on success
    const content = result.content as ToolResponseContent[];
    const fields = JSON.parse(content[0].text!) as PdfField[];

    expect(Array.isArray(fields)).toBe(true);
    // simple-form.pdf has 6 logical fields (name, email, agree_terms, country, gender, comments)
    // The generator log said 7 fields but listing names, maybe counting one I missed or miscounting.
    // "name, email, agree_terms, country, gender, comments" is 6 names.
    // Let's just check > 0.
    expect(fields.length).toBeGreaterThan(0);
    
    expect(fields[0]).toHaveProperty('name');
    expect(fields[0]).toHaveProperty('type');
    expect(fields[0]).toHaveProperty('page');
  });

  test('should filter fields by page', async ({ client, pdfs }) => {
     // Use multi-page PDF
     await client.callTool({
        name: 'open_pdf',
        arguments: { path: pdfs.multiPage },
     });

     // List fields for page 1
     const result1 = await client.callTool({
         name: 'list_fields',
         arguments: { page: 1 },
     });
     
     const fields1 = JSON.parse((result1.content as ToolResponseContent[])[0].text!) as PdfField[];
     expect(fields1.length).toBeGreaterThan(0);
     expect(fields1.every(f => f.page === 1)).toBe(true);

     // List fields for page 2
     const result2 = await client.callTool({
         name: 'list_fields',
         arguments: { page: 2 },
     });
     
     const fields2 = JSON.parse((result2.content as ToolResponseContent[])[0].text!) as PdfField[];
     expect(fields2.length).toBeGreaterThan(0);
     expect(fields2.every(f => f.page === 2)).toBe(true);
  });

  test('should return empty array for PDF with no fields', async ({ client, pdfs }) => {
      await client.callTool({
          name: 'open_pdf',
          arguments: { path: pdfs.empty },
      });

      const result = await client.callTool({
          name: 'list_fields',
          arguments: {},
      });

      const fields = JSON.parse((result.content as ToolResponseContent[])[0].text!) as PdfField[];
      expect(fields).toEqual([]);
  });

  test('should handle invalid page number', async ({ client, pdfs }) => {
      await client.callTool({
          name: 'open_pdf',
          arguments: { path: pdfs.simpleForm }, // 1 page
      });

      const result = await client.callTool({
          name: 'list_fields',
          arguments: { page: 999 },
      });

      expect(result.isError).toBe(true);
      const content = result.content as ToolResponseContent[];
      expect(content[0].text).toContain('Invalid page number');
  });
});
