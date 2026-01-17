# Plan: Task 3.5 - preview_pdf Tool

## Overview
Implement the `preview_pdf` tool to allow users to open the current PDF in their system's default PDF viewer. This provides a quick way to verify changes during the form filling process.

## Dependencies
- Task 3.1 (Session Management) ✅

## Deliverables
1. [x] Create `src/utils/platform.ts` for cross-platform file opening
2. [x] Implement `src/tools/previewPdf.ts`
3. [x] Register tool in `src/tools/index.ts` (already linked, just need implementation)
4. [x] Integration tests
5. [x] Update error handling for preview failures

## Implementation Steps

### Step 1: Error Handling Types
**Files:** `src/pdf/types.ts`, `src/pdf/errors.ts`
**Changes:**
- Add `PreviewFailed = 'PREVIEW_FAILED'` to `PdfErrorCode` enum in `types.ts`
- Create `PdfPreviewError` class in `errors.ts`

### Step 2: Platform Utilities
**Files:** `src/utils/platform.ts`
**Changes:**
- Create `openFile(path: string): Promise<void>` function
- Implement logic using `child_process.exec` and `os.platform()`:
  - macOS: `open "${path}"`
  - Windows: `start "" "${path}"`
  - Linux: `xdg-open "${path}"`
- Add error handling: wrap `exec` errors in `PdfPreviewError`

### Step 3: Tool Implementation
**Files:** `src/tools/previewPdf.ts`
**Changes:**
- Implement `registerPreviewPdfTool`
- Get active session (throw error if none)
- Check `session.isModified`
- If modified:
  - Generate temp file path (using `os.tmpdir`)
  - Save current document to temp file using `savePdf`
  - Open temp file using `openFile`
- If not modified:
  - Open original `session.filePath` using `openFile`
- Return success message with file path

### Step 4: Integration Tests
**Files:** `tests/tools/previewPdf.test.ts`
**Test cases:**
- Should open original file when not modified
- Should save and open temp file when modified
- Should handle errors (no session, open failure)
- Mock `child_process.exec`, `fs.writeFile`, `os.tmpdir` for testing

## Files to Create/Modify
- `src/pdf/types.ts` - Update enum
- `src/pdf/errors.ts` - Add error class
- `src/utils/platform.ts` - New file
- `src/tools/previewPdf.ts` - Modify existing placeholder
- `tests/tools/previewPdf.test.ts` - New file

## Quality Checklist
- [x] Tool registered successfully
- [x] Works on all major platforms (logic implemented)
- [x] Handles modified vs unmodified states
- [x] Tests pass
- [x] Error messages are user-friendly

## Notes
- Created `src/utils/platform.ts` with `openFile` helper
- Used `vi.hoisted` for mocking in tests to handle module hoisting
- Implemented temp file saving for modified documents
- Added `PdfPreviewError` for proper error handling
