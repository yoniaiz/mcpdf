# Plan: Task 4.1 - Error Handling

## Overview
Implement comprehensive, typed error handling across the application to provide user-friendly error messages and consistent behavior. This involves creating a central error utility, specific error classes for session management, and standardizing tool error responses.

## Dependencies
- Phase 3 complete (✅ Complete)

## Deliverables
1. [x] Create `src/utils/errors.ts` with typed errors and helpers
2. [x] Update `src/state/session.ts` to use typed `SessionError`
3. [x] Update all tools to use consistent error handling wrapper
4. [x] Verify error messages with tests

## Implementation Steps

### Step 1: Create Error Utilities
**Files:** `src/utils/errors.ts`
**Changes:**
- [x] Create `McpdfError` base class
- [x] Create `SessionError` class
- [x] Create `formatToolError` helper function that handles `PdfError`, `SessionError`, and unknown errors consistently
- [x] Define `McpdfErrorCode` enum for non-PDF specific errors (like `NO_SESSION`)

### Step 2: Update Session Management
**Files:** `src/state/session.ts`
**Changes:**
- [x] Import `SessionError` from utils
- [x] Throw `SessionError` instead of generic `Error` in `getActiveSession`

### Step 3: Update Tools Error Handling
**Files:** `src/tools/*.ts` (all 7 tools)
**Changes:**
- [x] Import `formatToolError` from utils
- [x] Wrap tool implementation in try/catch block
- [x] Use `return formatToolError(error)` in catch block
- [x] Ensure `open_pdf` handles initial errors gracefully

### Step 4: Add/Update Tests
**Files:** `tests/utils/errors.test.ts` (new), `tests/tools/*.test.ts`
**Changes:**
- [x] Create `tests/utils/errors.test.ts` to test `formatToolError` formatting logic
- [x] Update existing tool tests (`tests/tools/*.test.ts`) to match new error message format (e.g., checking for "No active PDF session" without the generic "Error:" prefix if changed)

## Files to Create/Modify
- [x] `src/utils/errors.ts` - New file
- [x] `src/state/session.ts` - Update error throwing
- [x] `src/tools/openPdf.ts` - Update catch
- [x] `src/tools/listFields.ts` - Update catch
- [x] `src/tools/getFieldContext.ts` - Update catch
- [x] `src/tools/fillField.ts` - Update catch
- [x] `src/tools/previewPdf.ts` - Update catch
- [x] `src/tools/savePdf.ts` - Update catch
- [x] `src/tools/getPageContent.ts` - Update catch
- [x] `tests/utils/errors.test.ts` - New test file
- [x] `tests/tools/*.test.ts` - Update expected error messages

## Quality Checklist
- [x] `SessionError` provides clear message to "open_pdf first"
- [x] All tools catch both synchronous and asynchronous errors
- [x] `PdfError` messages are preserved and formatted cleanly
- [x] Unknown errors are wrapped safely
- [x] Tests pass

## Notes
- Updated `eslint.config.js` to disable base `no-unused-vars` for TypeScript files, resolving enum linting errors.
- Cleaned up error message assertions in tests to match the new `formatToolError` output (which is cleaner and less verbose than generic Errors).
