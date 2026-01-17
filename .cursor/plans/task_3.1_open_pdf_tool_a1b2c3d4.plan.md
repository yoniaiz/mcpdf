# Plan: Task 3.1 - open_pdf Tool

## Overview

Implement the `open_pdf` tool which serves as the entry point for the mcpdf workflow. This tool allows users to load a PDF file from the filesystem, extracts its metadata (page count, form fields), generates a human-readable summary, and initializes the session state for subsequent operations.

## Dependencies

- Phase 2: PDF Engine (Complete) ✅

## Deliverables

1. [ ] Create session state management module
2. [ ] Implement `open_pdf` tool logic
3. [ ] Add integration tests for the tool

## Implementation Steps

### Step 1: Create Session State Management

**Files:** `src/state/session.ts`
**Changes:**

- Create `PdfSession` interface to track:
- `document`: The loaded PDFDocument
- `filePath`: Absolute path to the file
- `originalPath`: Path when first opened (for save naming)
- `pageCount`: Number of pages
- Implement singleton/module-level state management:
- `setActiveSession(session)`
- `getActiveSession()`
- `clearSession()`
- `isSessionActive()`

### Step 2: Implement open_pdf Tool

**Files:** `src/tools/openPdf.ts`
**Changes:**

- Import `loadPdf` from `../pdf/reader.js`
- Import session management from `../state/session.js`
- Implement tool handler:

1. Call `loadPdf(path)` to load the file
2. Store result in session state
3. Generate text summary (Filename, Pages, Fields, Form status)
4. Return formatted content

- Handle errors:
- Catch PDF loading errors and return user-friendly messages

### Step 3: Write Integration Tests

**Files:** `tests/tools/openPdf.test.ts`
**Test cases:**

- **Success:** Open valid PDF (simple-form.pdf) -> returns summary, sets session
- **Error:** Open non-existent file -> returns error
- **Error:** Open invalid file (not PDF) -> returns error
- **State:** Verify session contains correct document after open

## Files to Create/Modify

- `src/state/session.ts` - New file for state management
- `src/tools/openPdf.ts` - Implement tool logic
- `tests/tools/openPdf.test.ts` - New test file

## Quality Checklist

- [ ] `open_pdf` successfully loads PDF files
- [ ] Session state is correctly initialized
- [ ] Output summary provides useful context (pages, fields count)
- [ ] Invalid paths/files are handled gracefully
- [ ] Tests pass