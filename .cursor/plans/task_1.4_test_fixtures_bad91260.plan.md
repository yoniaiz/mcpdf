---
name: Task 1.4 Test Fixtures
overview: Create a static form PDF test fixture that has visual blank patterns (underscores) but no AcroForm fields, enabling testing of the v2 static form workflow.
todos:
  - id: add-generator
    content: Add generateStaticForm() function to tests/pdfs/generator.ts
    status: pending
  - id: update-main
    content: Update main() to generate and write static-form.pdf
    status: pending
  - id: update-interface
    content: Add staticForm to PdfTestFiles interface in tests/fixtures/index.ts
    status: pending
  - id: update-fixture
    content: Add staticForm path to pdfs fixture
    status: pending
  - id: generate-verify
    content: Run pnpm generate:fixtures and pnpm run check
    status: pending
---

# Task 1.4: Test Fixtures - Create Static Form PDF Generator

## Overview

Add a new test fixture `static-form.pdf` that contains visual form patterns (labels with underscores) but no interactive AcroForm fields. This enables testing the v2 static form workflow: `get_text_with_positions` -> AI identifies blanks -> `draw_text`.

## Implementation

### Step 1: Add `generateStaticForm()` function

In [`tests/pdfs/generator.ts`](tests/pdfs/generator.ts), add a new generator function following the existing `generateEmpty()` pattern (text only, no AcroForm):

```typescript
/**
 * Generate a static form PDF with visual blank patterns but no AcroForm fields.
 * Used to test AI-driven static form filling workflow.
 */
async function generateStaticForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size

  // Title
  page.drawText('Static Form Test PDF', { x: 50, y: 750, size: 18 });
  page.drawText('This PDF has visual form patterns but no AcroForm fields.', { x: 50, y: 720, size: 10 });

  // Form patterns (label + underscores on same line)
  // Coordinates match PRD examples for consistency
  page.drawText('Name:', { x: 50, y: 700, size: 12 });
  page.drawText('_______________', { x: 95, y: 700, size: 12 });

  page.drawText('Email:', { x: 50, y: 670, size: 12 });
  page.drawText('_______________', { x: 100, y: 670, size: 12 });

  page.drawText('Date:', { x: 50, y: 640, size: 12 });
  page.drawText('___/___/______', { x: 90, y: 640, size: 12 });

  return pdfDoc.save();
}
```

### Step 2: Update `main()` function

Add generation and file writing for static-form.pdf (after `generateEmpty` block):

```typescript
// Generate static form (no AcroForm fields)
console.log('  Generating static-form.pdf...');
const staticFormBytes = await generateStaticForm();
writeFileSync(join(outputDir, 'static-form.pdf'), staticFormBytes);
console.log('    ✓ static-form.pdf (visual patterns, no fields)');
```

Update the final count message:

```typescript
// Change from:
console.log('\nDone! Generated 3 PDF test fixtures.');

// To:
console.log('\nDone! Generated 4 PDF test fixtures.');
```

### Step 3: Update fixtures interface

In [`tests/fixtures/index.ts`](tests/fixtures/index.ts), add the new property with JSDoc (matching existing style):

```typescript
export interface PdfTestFiles {
  /** Basic form with text field, checkbox, and dropdown */
  simpleForm: string;
  /** Multi-page document with fields on different pages */
  multiPage: string;
  /** PDF with no form fields */
  empty: string;
  /** Static form with visual patterns but no AcroForm fields */
  staticForm: string;
}
```

And update the `pdfs` fixture:

```typescript
pdfs: async ({}, use) => {
  const pdfsDir = path.join(__dirname, '../pdfs');
  await use({
    simpleForm: path.join(pdfsDir, 'simple-form.pdf'),
    multiPage: path.join(pdfsDir, 'multi-page.pdf'),
    empty: path.join(pdfsDir, 'empty.pdf'),
    staticForm: path.join(pdfsDir, 'static-form.pdf'),
  });
},
```

### Step 4: Generate and verify

Run the fixture generator:

```bash
pnpm generate:fixtures
```

Run quality checks:

```bash
pnpm run check
```

## Files to Change

| File | Change |

|------|--------|

| [`tests/pdfs/generator.ts`](tests/pdfs/generator.ts) | Add `generateStaticForm()`, update `main()` |

| [`tests/fixtures/index.ts`](tests/fixtures/index.ts) | Add `staticForm` to interface and fixture |

| `tests/pdfs/static-form.pdf` | Generated file (not manually edited) |

## Key Constraints

- No AcroForm fields - only `page.drawText()` for visual elements
- Coordinate system: origin at bottom-left, Y increases upward
- Letter size page: 612 x 792 points
- Patterns must match PRD examples for AI detection testing