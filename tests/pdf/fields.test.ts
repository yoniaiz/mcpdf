/**
 * Tests for PDF form field detection and extraction
 */

import { describe, expect } from '../fixtures/index.js';
import { test } from 'vitest';
import { loadPdf } from '../../src/pdf/reader.js';
import {
  extractFields,
  getFieldByName,
  getFieldsByPage,
} from '../../src/pdf/fields.js';
import { PdfFieldNotFoundError } from '../../src/pdf/errors.js';
import { PdfFieldType } from '../../src/pdf/types.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PDF fixtures paths
const PDFS_DIR = join(__dirname, '../pdfs');
const SIMPLE_FORM = join(PDFS_DIR, 'simple-form.pdf');
const MULTI_PAGE = join(PDFS_DIR, 'multi-page.pdf');
const EMPTY_PDF = join(PDFS_DIR, 'empty.pdf');

describe('extractFields', () => {
  test('extracts all fields from simple-form.pdf', async () => {
    const { document } = await loadPdf(SIMPLE_FORM);
    const fields = extractFields(document);

    // simple-form.pdf has 6 fields: name, email, agree_terms, country, gender (radio group), comments
    expect(fields).toHaveLength(6);

    // Verify field names
    const fieldNames = fields.map((f) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('email');
    expect(fieldNames).toContain('agree_terms');
    expect(fieldNames).toContain('country');
    expect(fieldNames).toContain('gender');
    expect(fieldNames).toContain('comments');
  });

  test('extracts all fields from multi-page.pdf', async () => {
    const { document } = await loadPdf(MULTI_PAGE);
    const fields = extractFields(document);

    // multi-page.pdf has 6 fields across 3 pages
    expect(fields).toHaveLength(6);

    const fieldNames = fields.map((f) => f.name);
    expect(fieldNames).toContain('first_name');
    expect(fieldNames).toContain('last_name');
    expect(fieldNames).toContain('phone');
    expect(fieldNames).toContain('address');
    expect(fieldNames).toContain('subscribe_newsletter');
    expect(fieldNames).toContain('preferred_language');
  });

  test('returns empty array for PDF with no fields', async () => {
    const { document } = await loadPdf(EMPTY_PDF);
    const fields = extractFields(document);

    expect(fields).toHaveLength(0);
    expect(fields).toEqual([]);
  });

  describe('field type detection', () => {
    test('detects text fields correctly', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const nameField = fields.find((f) => f.name === 'name');
      expect(nameField).toBeDefined();
      expect(nameField?.type).toBe(PdfFieldType.Text);

      const emailField = fields.find((f) => f.name === 'email');
      expect(emailField).toBeDefined();
      expect(emailField?.type).toBe(PdfFieldType.Text);
    });

    test('detects multiline text fields correctly', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const commentsField = fields.find((f) => f.name === 'comments');
      expect(commentsField).toBeDefined();
      expect(commentsField?.type).toBe(PdfFieldType.Multiline);
    });

    test('detects checkbox fields correctly', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const agreeField = fields.find((f) => f.name === 'agree_terms');
      expect(agreeField).toBeDefined();
      expect(agreeField?.type).toBe(PdfFieldType.Checkbox);
    });

    test('detects dropdown fields correctly', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const countryField = fields.find((f) => f.name === 'country');
      expect(countryField).toBeDefined();
      expect(countryField?.type).toBe(PdfFieldType.Dropdown);
    });

    test('detects radio button groups correctly', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const genderField = fields.find((f) => f.name === 'gender');
      expect(genderField).toBeDefined();
      expect(genderField?.type).toBe(PdfFieldType.Radio);
    });
  });

  describe('field options', () => {
    test('extracts options for dropdown fields', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const countryField = fields.find((f) => f.name === 'country');
      expect(countryField?.options).toBeDefined();
      expect(countryField?.options).toEqual([
        'United States',
        'Canada',
        'United Kingdom',
        'Australia',
        'Other',
      ]);
    });

    test('extracts options for radio button groups', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const genderField = fields.find((f) => f.name === 'gender');
      expect(genderField?.options).toBeDefined();
      expect(genderField?.options).toEqual(['male', 'female', 'other']);
    });

    test('text fields do not have options', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const nameField = fields.find((f) => f.name === 'name');
      expect(nameField?.options).toBeUndefined();
    });

    test('checkbox fields do not have options', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const agreeField = fields.find((f) => f.name === 'agree_terms');
      expect(agreeField?.options).toBeUndefined();
    });
  });

  describe('field values', () => {
    test('empty text fields have null value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const nameField = fields.find((f) => f.name === 'name');
      // Empty text fields may return empty string or null depending on pdf-lib
      expect(nameField?.currentValue === null || nameField?.currentValue === '').toBe(true);
    });

    test('unchecked checkbox has false value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const agreeField = fields.find((f) => f.name === 'agree_terms');
      expect(agreeField?.currentValue).toBe(false);
    });

    test('unselected dropdown has null value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const countryField = fields.find((f) => f.name === 'country');
      expect(countryField?.currentValue).toBeNull();
    });

    test('unselected radio group has null value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      const genderField = fields.find((f) => f.name === 'gender');
      expect(genderField?.currentValue).toBeNull();
    });
  });

  describe('page detection', () => {
    test('all fields on single-page PDF have page 1', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      for (const field of fields) {
        expect(field.page).toBe(1);
      }
    });

    test('correctly identifies field pages on multi-page PDF', async () => {
      const { document } = await loadPdf(MULTI_PAGE);
      const fields = extractFields(document);

      // Page 1: first_name, last_name
      const firstName = fields.find((f) => f.name === 'first_name');
      const lastName = fields.find((f) => f.name === 'last_name');
      expect(firstName?.page).toBe(1);
      expect(lastName?.page).toBe(1);

      // Page 2: phone, address
      const phone = fields.find((f) => f.name === 'phone');
      const address = fields.find((f) => f.name === 'address');
      expect(phone?.page).toBe(2);
      expect(address?.page).toBe(2);

      // Page 3: subscribe_newsletter, preferred_language
      const newsletter = fields.find((f) => f.name === 'subscribe_newsletter');
      const language = fields.find((f) => f.name === 'preferred_language');
      expect(newsletter?.page).toBe(3);
      expect(language?.page).toBe(3);
    });
  });

  describe('field flags', () => {
    test('fields have required flag', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      // Our test PDFs don't mark fields as required
      for (const field of fields) {
        expect(typeof field.required).toBe('boolean');
        expect(field.required).toBe(false);
      }
    });

    test('fields have readOnly flag', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);
      const fields = extractFields(document);

      // Our test PDFs don't have read-only fields
      for (const field of fields) {
        expect(typeof field.readOnly).toBe('boolean');
        expect(field.readOnly).toBe(false);
      }
    });
  });
});

describe('getFieldByName', () => {
  test('returns field when it exists', async () => {
    const { document } = await loadPdf(SIMPLE_FORM);
    const field = getFieldByName(document, 'name');

    expect(field).toBeDefined();
    expect(field.name).toBe('name');
    expect(field.type).toBe(PdfFieldType.Text);
  });

  test('throws PdfFieldNotFoundError when field does not exist', async () => {
    const { document } = await loadPdf(SIMPLE_FORM);

    expect(() => getFieldByName(document, 'nonexistent_field')).toThrow(
      PdfFieldNotFoundError
    );
  });

  test('error message includes field name', async () => {
    const { document } = await loadPdf(SIMPLE_FORM);

    try {
      getFieldByName(document, 'nonexistent_field');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(PdfFieldNotFoundError);
      expect((error as Error).message).toContain('nonexistent_field');
    }
  });
});

describe('getFieldsByPage', () => {
  test('returns all fields on specified page', async () => {
    const { document } = await loadPdf(MULTI_PAGE);

    const page1Fields = getFieldsByPage(document, 1);
    expect(page1Fields).toHaveLength(2);
    expect(page1Fields.map((f) => f.name)).toContain('first_name');
    expect(page1Fields.map((f) => f.name)).toContain('last_name');

    const page2Fields = getFieldsByPage(document, 2);
    expect(page2Fields).toHaveLength(2);
    expect(page2Fields.map((f) => f.name)).toContain('phone');
    expect(page2Fields.map((f) => f.name)).toContain('address');

    const page3Fields = getFieldsByPage(document, 3);
    expect(page3Fields).toHaveLength(2);
    expect(page3Fields.map((f) => f.name)).toContain('subscribe_newsletter');
    expect(page3Fields.map((f) => f.name)).toContain('preferred_language');
  });

  test('returns empty array for page with no fields', async () => {
    const { document } = await loadPdf(MULTI_PAGE);

    // Page 4 doesn't exist, but we handle it gracefully
    const page4Fields = getFieldsByPage(document, 4);
    expect(page4Fields).toHaveLength(0);
  });

  test('returns empty array for PDF with no fields', async () => {
    const { document } = await loadPdf(EMPTY_PDF);

    const page1Fields = getFieldsByPage(document, 1);
    expect(page1Fields).toHaveLength(0);
  });
});
