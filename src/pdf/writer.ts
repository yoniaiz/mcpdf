/**
 * Form field filling and PDF saving operations
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
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
  PdfSaveError,
} from './errors.js';
import { FilledField, PdfFieldType, SaveResult } from './types.js';

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

/**
 * Save a PDF document to a file.
 *
 * Creates the output directory if it doesn't exist. By default, saves to
 * `{originalPath}_filled.pdf` if no output path is provided.
 *
 * @param document - The PDFDocument to save
 * @param originalPath - Path to the original PDF (used for default output name)
 * @param outputPath - Optional custom output path (defaults to `{original}_filled.pdf`)
 * @returns SaveResult with output path and bytes written
 * @throws {PdfSaveError} If output path equals original path or write fails
 */
export async function savePdf(
  document: PDFDocument,
  originalPath: string,
  outputPath?: string
): Promise<SaveResult> {
  // 1. Generate default output path if not provided
  const defaultOutput = originalPath.replace(/\.pdf$/i, '_filled.pdf');
  const targetPath = outputPath ?? defaultOutput;

  // 2. Resolve to absolute paths
  const absoluteOriginalPath = resolve(originalPath);
  const absoluteOutputPath = resolve(targetPath);

  // 3. Validate output path is not the same as original
  if (absoluteOutputPath === absoluteOriginalPath) {
    throw new PdfSaveError(
      absoluteOutputPath,
      'Output path cannot be the same as original file'
    );
  }

  try {
    // 4. Create parent directory if it doesn't exist
    await mkdir(dirname(absoluteOutputPath), { recursive: true });

    // 5. Serialize PDF to bytes
    const pdfBytes = await document.save();

    // 6. Write to file (overwrites if exists)
    await writeFile(absoluteOutputPath, pdfBytes);

    // 7. Return result
    return {
      outputPath: absoluteOutputPath,
      bytesWritten: pdfBytes.length,
    };
  } catch (error) {
    if (error instanceof PdfSaveError) {
      throw error;
    }
    throw new PdfSaveError(
      absoluteOutputPath,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
