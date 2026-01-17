/**
 * Form field detection and extraction from PDF documents
 */

import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFField,
  PDFRadioGroup,
  PDFTextField,
} from 'pdf-lib';
import { PdfFieldNotFoundError } from './errors.js';
import { PdfField, PdfFieldType } from './types.js';

/**
 * Determine which page a field appears on.
 * Returns 1-indexed page number (1 = first page).
 *
 * @param document - The PDF document
 * @param field - The field to find the page for
 * @returns Page number (1-indexed), defaults to 1 if cannot be determined
 */
function getFieldPage(document: PDFDocument, field: PDFField): number {
  const widgets = field.acroField.getWidgets();
  if (widgets.length === 0) return 1;

  const firstWidget = widgets[0];
  const widgetPageRef = firstWidget.P();

  if (!widgetPageRef) return 1;

  const pages = document.getPages();
  for (let i = 0; i < pages.length; i++) {
    // Compare PDFRef using tag property (e.g., "5 0 R")
    if (pages[i].ref.tag === widgetPageRef.tag) {
      return i + 1; // 1-indexed
    }
  }

  return 1;
}

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
 * Extract options from fields that have them (dropdown, radio).
 *
 * @param field - The pdf-lib field instance
 * @returns Array of options, or undefined if not applicable
 */
function extractFieldOptions(field: PDFField): string[] | undefined {
  if (field instanceof PDFDropdown) {
    return field.getOptions();
  }
  if (field instanceof PDFRadioGroup) {
    return field.getOptions();
  }
  return undefined;
}

/**
 * Convert a pdf-lib PDFField to our PdfField metadata format.
 *
 * @param document - The PDF document (needed for page detection)
 * @param field - The pdf-lib field instance
 * @returns PdfField metadata object
 */
function convertField(document: PDFDocument, field: PDFField): PdfField {
  const type = detectFieldType(field);
  const options = extractFieldOptions(field);

  return {
    name: field.getName(),
    type,
    page: getFieldPage(document, field),
    required: field.isRequired(),
    readOnly: field.isReadOnly(),
    currentValue: extractFieldValue(field),
    ...(options !== undefined && { options }),
  };
}

/**
 * Extract all form fields from a PDF document.
 *
 * @param document - The loaded PDFDocument
 * @returns Array of PdfField metadata objects
 */
export function extractFields(document: PDFDocument): PdfField[] {
  const form = document.getForm();
  const fields = form.getFields();

  return fields.map((field) => convertField(document, field));
}

/**
 * Get a specific field by name from a PDF document.
 *
 * @param document - The loaded PDFDocument
 * @param fieldName - The name of the field to find
 * @returns PdfField metadata for the found field
 * @throws {PdfFieldNotFoundError} If the field does not exist
 */
export function getFieldByName(
  document: PDFDocument,
  fieldName: string
): PdfField {
  const form = document.getForm();
  const fields = form.getFields();

  const field = fields.find((f) => f.getName() === fieldName);

  if (!field) {
    throw new PdfFieldNotFoundError(fieldName);
  }

  return convertField(document, field);
}

/**
 * Get all fields on a specific page.
 *
 * @param document - The loaded PDFDocument
 * @param page - The page number (1-indexed)
 * @returns Array of PdfField metadata for fields on that page
 */
export function getFieldsByPage(
  document: PDFDocument,
  page: number
): PdfField[] {
  const allFields = extractFields(document);
  return allFields.filter((field) => field.page === page);
}
