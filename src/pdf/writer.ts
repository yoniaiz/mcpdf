/**
 * Form field filling operations for PDF documents
 */

import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFField,
  PDFRadioGroup,
  PDFTextField,
} from 'pdf-lib';
import {
  PdfFieldNotFoundError,
  PdfInvalidFieldValueError,
  PdfReadOnlyFieldError,
} from './errors.js';
import { FilledField, PdfFieldType } from './types.js';

/**
 * Detect the field type from a pdf-lib PDFField instance.
 *
 * @param field - The pdf-lib field instance
 * @returns The PdfFieldType for this field
 */
function detectFieldType(field: PDFField): PdfFieldType {
  if (field instanceof PDFTextField) {
    return field.isMultiline() ? PdfFieldType.Multiline : PdfFieldType.Text;
  }
  if (field instanceof PDFCheckBox) {
    return PdfFieldType.Checkbox;
  }
  if (field instanceof PDFRadioGroup) {
    return PdfFieldType.Radio;
  }
  if (field instanceof PDFDropdown) {
    return PdfFieldType.Dropdown;
  }
  // Default to text for any unknown field types
  return PdfFieldType.Text;
}

/**
 * Extract the current value from a field based on its type.
 *
 * @param field - The pdf-lib field instance
 * @returns The current value (string, boolean, or null if empty)
 */
function extractFieldValue(field: PDFField): string | boolean | null {
  if (field instanceof PDFTextField) {
    const text = field.getText();
    return text ?? null;
  }
  if (field instanceof PDFCheckBox) {
    return field.isChecked();
  }
  if (field instanceof PDFRadioGroup) {
    const selected = field.getSelected();
    return selected ?? null;
  }
  if (field instanceof PDFDropdown) {
    const selected = field.getSelected();
    // getSelected() returns string[] for dropdowns
    return selected.length > 0 ? selected[0] : null;
  }
  return null;
}

/**
 * Fill a text field with the provided value.
 *
 * @param field - The PDFTextField to fill
 * @param value - The value to set (will be converted to string and trimmed)
 * @returns The value that was set
 */
function fillTextField(field: PDFTextField, value: string | boolean): string {
  const textValue = String(value).trim();
  field.setText(textValue);
  return textValue;
}

/**
 * Fill a checkbox field with the provided value.
 *
 * @param field - The PDFCheckBox to fill
 * @param value - Boolean value to set (true = checked, false = unchecked)
 * @returns The value that was set
 */
function fillCheckbox(field: PDFCheckBox, value: string | boolean): boolean {
  const boolValue = typeof value === 'boolean' ? value : value === 'true';
  if (boolValue) {
    field.check();
  } else {
    field.uncheck();
  }
  return boolValue;
}

/**
 * Fill a radio group field with the provided option.
 *
 * @param field - The PDFRadioGroup to fill
 * @param fieldName - Name of the field (for error messages)
 * @param value - The option value to select
 * @returns The value that was set
 * @throws {PdfInvalidFieldValueError} If the value is not a valid option
 */
function fillRadioGroup(
  field: PDFRadioGroup,
  fieldName: string,
  value: string | boolean
): string {
  const stringValue = String(value);
  const options = field.getOptions();

  if (!options.includes(stringValue)) {
    throw new PdfInvalidFieldValueError(fieldName, stringValue, options);
  }

  field.select(stringValue);
  return stringValue;
}

/**
 * Fill a dropdown field with the provided option.
 *
 * @param field - The PDFDropdown to fill
 * @param fieldName - Name of the field (for error messages)
 * @param value - The option value to select
 * @returns The value that was set
 * @throws {PdfInvalidFieldValueError} If the value is not a valid option
 */
function fillDropdown(
  field: PDFDropdown,
  fieldName: string,
  value: string | boolean
): string {
  const stringValue = String(value);
  const options = field.getOptions();

  if (!options.includes(stringValue)) {
    throw new PdfInvalidFieldValueError(fieldName, stringValue, options);
  }

  field.select(stringValue);
  return stringValue;
}

/**
 * Fill a form field in a PDF document.
 *
 * This function locates a field by name, validates it can be modified,
 * and sets the appropriate value based on the field type.
 *
 * @param document - The loaded PDFDocument
 * @param fieldName - The name of the field to fill
 * @param value - The value to set (string for text/dropdown/radio, boolean for checkbox)
 * @returns FilledField with details about the operation
 * @throws {PdfFieldNotFoundError} If the field does not exist
 * @throws {PdfReadOnlyFieldError} If the field is read-only
 * @throws {PdfInvalidFieldValueError} If the value is not valid for dropdown/radio fields
 */
export function fillField(
  document: PDFDocument,
  fieldName: string,
  value: string | boolean
): FilledField {
  // Get the form from the document
  const form = document.getForm();
  const fields = form.getFields();

  // Find the field by name
  const field = fields.find((f) => f.getName() === fieldName);
  if (!field) {
    throw new PdfFieldNotFoundError(fieldName);
  }

  // Check if the field is read-only
  if (field.isReadOnly()) {
    throw new PdfReadOnlyFieldError(fieldName);
  }

  // Get the previous value before filling
  const previousValue = extractFieldValue(field);

  // Detect the field type
  const type = detectFieldType(field);

  // Fill based on field type
  let newValue: string | boolean;

  if (field instanceof PDFTextField) {
    newValue = fillTextField(field, value);
  } else if (field instanceof PDFCheckBox) {
    newValue = fillCheckbox(field, value);
  } else if (field instanceof PDFRadioGroup) {
    newValue = fillRadioGroup(field, fieldName, value);
  } else if (field instanceof PDFDropdown) {
    newValue = fillDropdown(field, fieldName, value);
  } else {
    // Default: treat as text field
    // This shouldn't happen with standard PDF forms, but handle gracefully
    newValue = String(value).trim();
  }

  return {
    name: fieldName,
    type,
    value: newValue,
    previousValue,
  };
}
