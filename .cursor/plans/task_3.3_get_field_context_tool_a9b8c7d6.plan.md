# Plan: Task 3.3 - get_field_context Tool

## Overview

Implement the `get_field_context` tool to provide detailed information about a specific form field. This involves extracting the field's physical location (rectangle) to identify surrounding text that serves as a label or description, giving the LLM context for what needs to be filled. It also includes extracting the field's tooltip (description) if available.

## Dependencies

- ✅ Task 3.1: open_pdf Tool (for session management)
- ✅ Task 2.3: Text Extraction (for `extractTextWithPositions`)
- ✅ Task 2.2: Form Field Detection (for `getFieldByName`)

## Deliverables

1. [ ] Update `PdfField` type to include position data (rect) and description (tooltip)
2. [ ] Update field detection to extract widget coordinates and tooltip
3. [ ] Implement `get_field_context` tool logic with spatial analysis
4. [ ] Write integration tests verifying label extraction

## Implementation Steps

### Step 1: Add Position and Description to Field Types

**Files:** `src/pdf/types.ts`
**Changes:**

- Add `PdfRect` interface `{ x, y, width, height }`
- Update `PdfField` interface:
- Add optional `rect: PdfRect` property
- Add optional `description: string` property (for tooltip)

### Step 2: Extract Field Coordinates and Description

**Files:** `src/pdf/fields.ts`
**Changes:**

- In `convertField`:
- Get the first widget from `field.acroField.getWidgets()`
- Extract the rectangle using `widget.getRectangle()`
- Extract tooltip (TU) if available (via `field.acroField.dict.lookup(PDFName.of('TU'))`)
- Map to the `PdfField` format

### Step 3: Implement Tool Logic

**Files:** `src/tools/getFieldContext.ts`
**Changes:**

- Import `getActiveSession`, `getFieldByName`, `extractTextWithPositions`
- Implement spatial logic to find text near the field:
- Define a search area (e.g., 50-100pt above and left of the field)
- Filter `TextItem`s from `extractTextWithPositions` that fall in this area
- Sort by proximity to find the most likely label
- Construct a rich context response including:
- Field metadata (name, type, constraints, description/tooltip)
- Inferred label from surrounding text
- Section header (if identifiable - optional)

### Step 4: Write Tests

**Files:** `tests/tools/getFieldContext.test.ts`
**Test cases:**

- **Happy Path:** Get context for a known field in `simple-form.pdf` (e.g., "First Name") and verify it returns the correct label "First Name".
- **Tooltip:** Verify description is returned if present in the PDF.
- **Error:** Request context for non-existent field (should throw `PdfFieldNotFoundError`).
- **No Session:** Request context without opening PDF (should throw).

## Files to Create/Modify

- `src/pdf/types.ts` - Add `PdfRect`, `description`
- `src/pdf/fields.ts` - Extract rect and tooltip
- `src/tools/getFieldContext.ts` - Implement tool
- `tests/tools/getFieldContext.test.ts` - New test file

## Quality Checklist

- [ ] Tool returns meaningful context (label/surrounding text)
- [ ] Tooltip/description is included if present
- [ ] Handles fields without visual widgets gracefully
- [ ] Validates session and field existence
- [ ] Tests pass using `pnpm test`