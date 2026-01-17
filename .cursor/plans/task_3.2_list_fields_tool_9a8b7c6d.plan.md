# Plan: Task 3.2 - List Fields Tool

## Overview
Implement the `list_fields` MCP tool that allows users to view all form fields in the currently opened PDF. This tool will support filtering by page and provide detailed metadata for each field, enabling users to understand what information is required in the form.

## Dependencies
- [x] Task 3.1: open_pdf Tool (Session management and PDF loading)
- [x] Task 2.2: Form Field Detection (PDF field extraction logic)

## Deliverables
1. [ ] Implement `src/tools/listFields.ts` with field extraction logic
2. [ ] Write integration tests in `tests/tools/listFields.test.ts`

## Implementation Steps

### Step 1: Implement `list_fields` Tool
**Files:** `src/tools/listFields.ts`
**Changes:**
- Import `getActiveSession` to retrieve current PDF document
- Import `extractFields`, `getFieldsByPage` from `../pdf/fields.js`
- Import `PdfInvalidPageError` from `../pdf/errors.js`
- Implement handler:
  - Check if session is active (throw error if not)
  - Get the PDF document from the session
  - If `page` arg provided:
    - Validate page number (1 to doc.getPageCount())
    - Throw `PdfInvalidPageError` if invalid
    - Call `getFieldsByPage`
  - If no `page` arg, call `extractFields`
  - Format list of fields as a JSON string for the tool response content
  - Handle no fields found case (return empty array in JSON)

### Step 2: Write Integration Tests
**Files:** `tests/tools/listFields.test.ts`
**Test cases:**
- **No PDF Loaded:** Verify error message when calling tool without opening PDF
- **List All Fields:** Open PDF, call list_fields, verify all fields returned as JSON
- **List Page Fields:** Open PDF, call list_fields with page=1, verify only page 1 fields
- **Empty PDF:** Open PDF with no fields, verify empty array response
- **Invalid Page:** Call with non-existent page number, verify `PdfInvalidPageError`

## Files to Create/Modify
- `src/tools/listFields.ts` - Implementation
- `tests/tools/listFields.test.ts` - New test file

## Quality Checklist
- [ ] Tool uses `getActiveSession` to ensure PDF context
- [ ] Supports optional `page` argument
- [ ] Returns structured text output easy for LLM to parse
- [ ] Handles errors (no session, invalid page) gracefully
- [ ] Integration tests pass
