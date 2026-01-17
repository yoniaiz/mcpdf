/**
 * PDF Test Fixture Generator
 *
 * Generates PDF files with various form field configurations for testing.
 * Run with: pnpm generate:fixtures
 */

import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a simple form PDF with common field types.
 * Contains: text field, checkbox, dropdown on a single page.
 */
async function generateSimpleForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size

  // Create the form
  const form = pdfDoc.getForm();

  // Add a text field
  const nameField = form.createTextField('name');
  nameField.setText('');
  nameField.addToPage(page, { x: 50, y: 700, width: 200, height: 20 });

  // Add another text field
  const emailField = form.createTextField('email');
  emailField.setText('');
  emailField.addToPage(page, { x: 50, y: 650, width: 200, height: 20 });

  // Add a checkbox
  const agreeCheckbox = form.createCheckBox('agree_terms');
  agreeCheckbox.addToPage(page, { x: 50, y: 600, width: 15, height: 15 });

  // Add a dropdown
  const countryDropdown = form.createDropdown('country');
  countryDropdown.setOptions(['United States', 'Canada', 'United Kingdom', 'Australia', 'Other']);
  countryDropdown.addToPage(page, { x: 50, y: 550, width: 200, height: 20 });

  // Add some text labels (non-interactive)
  const { height } = page.getSize();
  page.drawText('Simple Form Test PDF', { x: 50, y: height - 50, size: 18 });
  page.drawText('Name:', { x: 50, y: 720, size: 12 });
  page.drawText('Email:', { x: 50, y: 670, size: 12 });
  page.drawText('I agree to the terms:', { x: 70, y: 602, size: 12 });
  page.drawText('Country:', { x: 50, y: 570, size: 12 });

  return pdfDoc.save();
}

/**
 * Generate a multi-page PDF with fields on different pages.
 */
async function generateMultiPage(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const form = pdfDoc.getForm();

  // Page 1 - Personal Information
  const page1 = pdfDoc.addPage([612, 792]);
  page1.drawText('Page 1: Personal Information', { x: 50, y: 750, size: 16 });

  const firstNameField = form.createTextField('first_name');
  firstNameField.setText('');
  firstNameField.addToPage(page1, { x: 50, y: 680, width: 200, height: 20 });
  page1.drawText('First Name:', { x: 50, y: 700, size: 12 });

  const lastNameField = form.createTextField('last_name');
  lastNameField.setText('');
  lastNameField.addToPage(page1, { x: 50, y: 620, width: 200, height: 20 });
  page1.drawText('Last Name:', { x: 50, y: 640, size: 12 });

  // Page 2 - Contact Information
  const page2 = pdfDoc.addPage([612, 792]);
  page2.drawText('Page 2: Contact Information', { x: 50, y: 750, size: 16 });

  const phoneField = form.createTextField('phone');
  phoneField.setText('');
  phoneField.addToPage(page2, { x: 50, y: 680, width: 200, height: 20 });
  page2.drawText('Phone:', { x: 50, y: 700, size: 12 });

  const addressField = form.createTextField('address');
  addressField.setText('');
  addressField.addToPage(page2, { x: 50, y: 620, width: 300, height: 40 });
  page2.drawText('Address:', { x: 50, y: 660, size: 12 });

  // Page 3 - Preferences
  const page3 = pdfDoc.addPage([612, 792]);
  page3.drawText('Page 3: Preferences', { x: 50, y: 750, size: 16 });

  const newsletterCheckbox = form.createCheckBox('subscribe_newsletter');
  newsletterCheckbox.addToPage(page3, { x: 50, y: 700, width: 15, height: 15 });
  page3.drawText('Subscribe to newsletter', { x: 70, y: 702, size: 12 });

  const languageDropdown = form.createDropdown('preferred_language');
  languageDropdown.setOptions(['English', 'Spanish', 'French', 'German', 'Japanese']);
  languageDropdown.addToPage(page3, { x: 50, y: 650, width: 200, height: 20 });
  page3.drawText('Preferred Language:', { x: 50, y: 670, size: 12 });

  return pdfDoc.save();
}

/**
 * Generate an empty PDF with no form fields.
 */
async function generateEmpty(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  page.drawText('Empty PDF Test', { x: 50, y: 750, size: 18 });
  page.drawText('This PDF has no form fields.', { x: 50, y: 700, size: 12 });
  page.drawText('It is used to test behavior when no fields are present.', {
    x: 50,
    y: 680,
    size: 12,
  });

  return pdfDoc.save();
}

/**
 * Main generator function
 */
async function main(): Promise<void> {
  console.log('Generating PDF test fixtures...\n');

  const outputDir = __dirname;

  // Generate simple form
  console.log('  Generating simple-form.pdf...');
  const simpleFormBytes = await generateSimpleForm();
  writeFileSync(join(outputDir, 'simple-form.pdf'), simpleFormBytes);
  console.log('    ✓ simple-form.pdf (4 fields: name, email, agree_terms, country)');

  // Generate multi-page form
  console.log('  Generating multi-page.pdf...');
  const multiPageBytes = await generateMultiPage();
  writeFileSync(join(outputDir, 'multi-page.pdf'), multiPageBytes);
  console.log('    ✓ multi-page.pdf (3 pages, 6 fields)');

  // Generate empty PDF
  console.log('  Generating empty.pdf...');
  const emptyBytes = await generateEmpty();
  writeFileSync(join(outputDir, 'empty.pdf'), emptyBytes);
  console.log('    ✓ empty.pdf (no fields)');

  console.log('\nDone! Generated 3 PDF test fixtures.');
}

main().catch((error) => {
  console.error('Failed to generate PDF fixtures:', error);
  process.exit(1);
});
