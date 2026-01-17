# Plan: Task 3.6 - save_pdf Tool

## Overview

Implement the `save_pdf` MCP tool that allows users to save the currently modified PDF to a new file. This tool exposes the PDF saving functionality implemented in Phase 2.

## Dependencies

- ✅ Task 2.5: PDF Saving (Core implementation)
- ✅ Task 3.4: fill_field Tool (Session management)

## Deliverables

1. [x] Implement `src/tools/savePdf.ts`
2. [x] Support optional custom output path
3. [x] Generate default filename (`_filled.pdf`)
4. [x] Confirm save success
5. [x] Write integration tests

## Implementation Steps

### Step 1: Implement save_pdf Tool

- [x] Files: `src/tools/savePdf.ts`
- [x] Changes:
  - Import `savePdf` from `../pdf/writer.js`
  - Import `getActiveSession` from `../state/session.js`
  - Implement the tool handler

**Notes:**

- Used `z.object` for input schema to match `registerTool` API.
- Used `session.filePath` as the base for default filename generation.

### Step 2: Write Integration Tests

- [x] Files: `tests/tools/savePdf.test.ts`
- [x] Test cases:
  - Save with default path
  - Save with custom path
  - Error when no session is active
  - Error when save fails (e.g., trying to overwrite original)

## Files to Create/Modify

- [x] `src/tools/savePdf.ts` - Implement tool logic
- [x] `tests/tools/savePdf.test.ts` - New test file

## Quality Checklist

- [x] Tool correctly identifies active session
- [x] Default filename generation works as expected
- [x] Custom output path works
- [x] Original file is protected from overwrite (handled by core logic, but verified via tool)
- [x] Returns clear success message with path
