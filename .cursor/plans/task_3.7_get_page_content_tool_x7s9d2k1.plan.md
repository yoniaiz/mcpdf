# Plan: Task 3.7 - get_page_content Tool

## Overview
Implement the `get_page_content` tool to allow users (and AI agents) to read the full text content of a specific page in the currently open PDF. This is essential for understanding the context of pages, especially those without interactive form fields (e.g., instruction pages).

## Dependencies
- ✅ Task 3.1: open_pdf Tool (Session management)
- ✅ Task 2.3: Text Extraction (Core PDF text extraction logic)

## Deliverables
1. [x] Implement `src/tools/getPageContent.ts`
2. [x] Write integration tests in `tests/tools/getPageContent.test.ts`
3. [x] Ensure proper error handling (invalid page, no session)

## Implementation Steps

### Step 1: Implement `src/tools/getPageContent.ts`
**Files:** `src/tools/getPageContent.ts`
**Changes:**
- Import `z` from `zod`
- Import `extractPageText` from `../pdf/text.js`
- Import `getActiveSession` from `../state/session.js`
- Define Zod schema for input: `{ page: z.number().int().min(1) }`
- Implement tool handler:
  - Check for active session using `getActiveSession()`
  - Validate page number against `session.pageCount` (if page > pageCount, throw error)
  - Call `extractPageText(session.filePath, page)`
  - Return text content in a structured format:
    ```json
    {
      "content": [
        {
          "type": "text",
          "text": "..." // The extracted text
        }
      ]
    }
    ```
  - Handle errors (try/catch block) and return `isError: true` with friendly message.

### Step 2: Write Integration Tests
**Files:** `tests/tools/getPageContent.test.ts`
**Test cases:**
- **Success:** Extract text from a valid page (e.g., page 1 of simple-form.pdf)
- **Error:** Request page number out of range (e.g., page 99)
- **Error:** Call tool without opening a PDF first
- **Validation:** Verify the returned text matches expected content (use `expect(result.content[0].text).toContain(...)`)

## Files to Create/Modify
- `src/tools/getPageContent.ts` - Implementation of the tool
- `tests/tools/getPageContent.test.ts` - New test file

## Quality Checklist
- [x] Tool is correctly registered (already done in `src/tools/index.ts`, but verify)
- [x] Input validation prevents invalid page numbers
- [x] Uses existing `extractPageText` function to avoid code duplication
- [x] Returns clear error if no PDF is open
- [x] Tests pass `pnpm test`

## Notes
- Implemented `get_page_content` tool using `extractPageText`.
- Verified 4 new tests passing.
- Corrected test expectation for "No active PDF session".
