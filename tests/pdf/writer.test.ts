/**
 * Tests for PDF form field filling operations
 */

import { describe, expect } from '../fixtures/index.js';
import { test } from 'vitest';
import { loadPdf } from '../../src/pdf/reader.js';
import { fillField } from '../../src/pdf/writer.js';
import { extractFields, getFieldByName } from '../../src/pdf/fields.js';
import {
  PdfFieldNotFoundError,
  PdfInvalidFieldValueError,
  PdfReadOnlyFieldError,
} from '../../src/pdf/errors.js';
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

describe('fillField', () => {
  describe('text fields', () => {
    test('fills empty text field with string value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'name', 'John Doe');

      expect(result.name).toBe('name');
      expect(result.type).toBe(PdfFieldType.Text);
      expect(result.value).toBe('John Doe');
      // Previous value should be null or empty string
      expect(result.previousValue === null || result.previousValue === '').toBe(
        true
      );
    });

    test('fills text field and trims whitespace', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'name', '  Jane Doe  ');

      expect(result.value).toBe('Jane Doe');
    });

    test('fills email text field', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'email', 'test@example.com');

      expect(result.name).toBe('email');
      expect(result.type).toBe(PdfFieldType.Text);
      expect(result.value).toBe('test@example.com');
    });

    test('overwrites existing text field value', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      // Fill first time
      fillField(document, 'name', 'First Value');

      // Fill second time
      const result = fillField(document, 'name', 'Second Value');

      expect(result.value).toBe('Second Value');
      expect(result.previousValue).toBe('First Value');
    });

    test('converts boolean to string for text fields', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'name', true);

      expect(result.value).toBe('true');
    });
  });

  describe('multiline text fields', () => {
    test('fills multiline text field with multiline content', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const multilineText = 'Line 1\nLine 2\nLine 3';
      const result = fillField(document, 'comments', multilineText);

      expect(result.name).toBe('comments');
      expect(result.type).toBe(PdfFieldType.Multiline);
      expect(result.value).toBe(multilineText);
    });

    test('fills multiline text field with single line content', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'comments', 'Single line comment');

      expect(result.type).toBe(PdfFieldType.Multiline);
      expect(result.value).toBe('Single line comment');
    });
  });

  describe('checkbox fields', () => {
    test('checks unchecked checkbox with true', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'agree_terms', true);

      expect(result.name).toBe('agree_terms');
      expect(result.type).toBe(PdfFieldType.Checkbox);
      expect(result.value).toBe(true);
      expect(result.previousValue).toBe(false);
    });

    test('unchecks checkbox with false', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      // First check it
      fillField(document, 'agree_terms', true);

      // Then uncheck it
      const result = fillField(document, 'agree_terms', false);

      expect(result.value).toBe(false);
      expect(result.previousValue).toBe(true);
    });

    test('accepts string "true" for checkbox', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'agree_terms', 'true');

      expect(result.value).toBe(true);
    });

    test('accepts string "false" for checkbox', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      // First check it
      fillField(document, 'agree_terms', true);

      // Then use string "false"
      const result = fillField(document, 'agree_terms', 'false');

      expect(result.value).toBe(false);
    });

    test('checkbox on multi-page PDF', async () => {
      const { document } = await loadPdf(MULTI_PAGE);

      const result = fillField(document, 'subscribe_newsletter', true);

      expect(result.name).toBe('subscribe_newsletter');
      expect(result.type).toBe(PdfFieldType.Checkbox);
      expect(result.value).toBe(true);
    });
  });

  describe('radio group fields', () => {
    test('selects valid radio option', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'gender', 'male');

      expect(result.name).toBe('gender');
      expect(result.type).toBe(PdfFieldType.Radio);
      expect(result.value).toBe('male');
      expect(result.previousValue).toBeNull();
    });

    test('changes radio selection', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      // Select first option
      fillField(document, 'gender', 'male');

      // Change to another option
      const result = fillField(document, 'gender', 'female');

      expect(result.value).toBe('female');
      expect(result.previousValue).toBe('male');
    });

    test('throws PdfInvalidFieldValueError for invalid radio option', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      expect(() => fillField(document, 'gender', 'invalid_option')).toThrow(
        PdfInvalidFieldValueError
      );
    });

    test('error message includes valid options for radio', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      try {
        fillField(document, 'gender', 'invalid_option');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(PdfInvalidFieldValueError);
        const message = (error as Error).message;
        expect(message).toContain('invalid_option');
        expect(message).toContain('gender');
        expect(message).toContain('male');
        expect(message).toContain('female');
        expect(message).toContain('other');
      }
    });
  });

  describe('dropdown fields', () => {
    test('selects valid dropdown option', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      const result = fillField(document, 'country', 'Canada');

      expect(result.name).toBe('country');
      expect(result.type).toBe(PdfFieldType.Dropdown);
      expect(result.value).toBe('Canada');
      expect(result.previousValue).toBeNull();
    });

    test('changes dropdown selection', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      // Select first option
      fillField(document, 'country', 'United States');

      // Change to another option
      const result = fillField(document, 'country', 'Australia');

      expect(result.value).toBe('Australia');
      expect(result.previousValue).toBe('United States');
    });

    test('throws PdfInvalidFieldValueError for invalid dropdown option', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      expect(() => fillField(document, 'country', 'Invalid Country')).toThrow(
        PdfInvalidFieldValueError
      );
    });

    test('error message includes valid options for dropdown', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      try {
        fillField(document, 'country', 'Germany');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(PdfInvalidFieldValueError);
        const message = (error as Error).message;
        expect(message).toContain('Germany');
        expect(message).toContain('country');
        expect(message).toContain('United States');
        expect(message).toContain('Canada');
      }
    });

    test('dropdown on multi-page PDF', async () => {
      const { document } = await loadPdf(MULTI_PAGE);

      const result = fillField(document, 'preferred_language', 'Spanish');

      expect(result.name).toBe('preferred_language');
      expect(result.type).toBe(PdfFieldType.Dropdown);
      expect(result.value).toBe('Spanish');
    });
  });

  describe('error cases', () => {
    test('throws PdfFieldNotFoundError when field does not exist', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      expect(() => fillField(document, 'nonexistent_field', 'value')).toThrow(
        PdfFieldNotFoundError
      );
    });

    test('error message includes field name for not found', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      try {
        fillField(document, 'nonexistent_field', 'value');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(PdfFieldNotFoundError);
        expect((error as Error).message).toContain('nonexistent_field');
      }
    });

    test('throws PdfFieldNotFoundError for PDF with no fields', async () => {
      const { document } = await loadPdf(EMPTY_PDF);

      expect(() => fillField(document, 'any_field', 'value')).toThrow(
        PdfFieldNotFoundError
      );
    });
  });

  describe('value persistence', () => {
    test('text field value persists after filling', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      fillField(document, 'name', 'Persisted Name');

      // Re-extract and verify
      const field = getFieldByName(document, 'name');
      expect(field.currentValue).toBe('Persisted Name');
    });

    test('checkbox value persists after filling', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      fillField(document, 'agree_terms', true);

      // Re-extract and verify
      const field = getFieldByName(document, 'agree_terms');
      expect(field.currentValue).toBe(true);
    });

    test('radio value persists after filling', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      fillField(document, 'gender', 'female');

      // Re-extract and verify
      const field = getFieldByName(document, 'gender');
      expect(field.currentValue).toBe('female');
    });

    test('dropdown value persists after filling', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      fillField(document, 'country', 'United Kingdom');

      // Re-extract and verify
      const field = getFieldByName(document, 'country');
      expect(field.currentValue).toBe('United Kingdom');
    });

    test('multiple fields can be filled and persist', async () => {
      const { document } = await loadPdf(SIMPLE_FORM);

      fillField(document, 'name', 'John Smith');
      fillField(document, 'email', 'john@example.com');
      fillField(document, 'agree_terms', true);
      fillField(document, 'country', 'Canada');
      fillField(document, 'gender', 'male');
      fillField(document, 'comments', 'Test comment');

      // Re-extract all fields and verify
      const fields = extractFields(document);

      const nameField = fields.find((f) => f.name === 'name');
      expect(nameField?.currentValue).toBe('John Smith');

      const emailField = fields.find((f) => f.name === 'email');
      expect(emailField?.currentValue).toBe('john@example.com');

      const agreeField = fields.find((f) => f.name === 'agree_terms');
      expect(agreeField?.currentValue).toBe(true);

      const countryField = fields.find((f) => f.name === 'country');
      expect(countryField?.currentValue).toBe('Canada');

      const genderField = fields.find((f) => f.name === 'gender');
      expect(genderField?.currentValue).toBe('male');

      const commentsField = fields.find((f) => f.name === 'comments');
      expect(commentsField?.currentValue).toBe('Test comment');
    });
  });

  describe('multi-page PDF', () => {
    test('fills fields on different pages', async () => {
      const { document } = await loadPdf(MULTI_PAGE);

      // Page 1 fields
      const firstName = fillField(document, 'first_name', 'Jane');
      const lastName = fillField(document, 'last_name', 'Smith');

      // Page 2 fields
      const phone = fillField(document, 'phone', '555-1234');
      const address = fillField(document, 'address', '123 Main St');

      // Page 3 fields
      const newsletter = fillField(document, 'subscribe_newsletter', true);
      const language = fillField(document, 'preferred_language', 'French');

      // Verify all fills
      expect(firstName.value).toBe('Jane');
      expect(lastName.value).toBe('Smith');
      expect(phone.value).toBe('555-1234');
      expect(address.value).toBe('123 Main St');
      expect(newsletter.value).toBe(true);
      expect(language.value).toBe('French');
    });

    test('field values persist across pages', async () => {
      const { document } = await loadPdf(MULTI_PAGE);

      // Fill fields on all pages
      fillField(document, 'first_name', 'Test');
      fillField(document, 'phone', '555-0000');
      fillField(document, 'preferred_language', 'English');

      // Re-extract and verify
      const fields = extractFields(document);

      const firstName = fields.find((f) => f.name === 'first_name');
      expect(firstName?.currentValue).toBe('Test');

      const phone = fields.find((f) => f.name === 'phone');
      expect(phone?.currentValue).toBe('555-0000');

      const language = fields.find((f) => f.name === 'preferred_language');
      expect(language?.currentValue).toBe('English');
    });
  });
});

describe('PdfReadOnlyFieldError', () => {
  test('error has correct code', () => {
    const error = new PdfReadOnlyFieldError('test_field');

    expect(error.code).toBe('READ_ONLY_FIELD');
    expect(error.message).toContain('test_field');
    expect(error.message).toContain('read-only');
  });
});

describe('PdfInvalidFieldValueError', () => {
  test('error has correct code and includes options', () => {
    const error = new PdfInvalidFieldValueError('test_field', 'bad_value', [
      'option1',
      'option2',
      'option3',
    ]);

    expect(error.code).toBe('INVALID_FIELD_VALUE');
    expect(error.message).toContain('test_field');
    expect(error.message).toContain('bad_value');
    expect(error.message).toContain('option1');
    expect(error.message).toContain('option2');
    expect(error.message).toContain('option3');
  });
});
