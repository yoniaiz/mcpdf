# Plan: Task 3.4 - fill_field Tool with Elicitation

## Overview

Implement the `fill_field` MCP tool that allows users to fill PDF form fields. This tool uses MCP's elicitation feature to interactively request the correct value type from the user (string, boolean, or enum selection) based on the field's definition in the PDF.

## Dependencies

- ✅ Task 3.3: get_field_context Tool (Complete)
- ✅ Task 2.4: Field Filling (Complete)
- ✅ Task 3.1: open_pdf Tool (Complete - for session state)

## Deliverables
1. [x] Implement `src/tools/fillField.ts` with `fill_field` tool registration
2. [x] Implement helper to generate JSON Schema for elicitation based on `PdfFieldType`
3. [x] Implement logic to handle elicitation response (`accept`, `decline`)
4. [x] Integrate with `src/pdf/writer.ts` to apply changes to the PDF
5. [x] Update session state to mark document as modified
6. [x] Write integration tests verifying the tool flow

## Implementation Steps

### Step 1: Create fill_field Tool
**Files:** `src/tools/fillField.ts`
**Changes:**
- [x] Import dependencies
- [x] Define `registerFillFieldTool` function
- [x] Register `fill_field` tool

### Step 2: Implement Elicitation Logic
**Files:** `src/tools/fillField.ts`
**Changes:**
- [x] Update tool handler signature
- [x] Implement field lookup and validation
- [x] Determine schema type based on field type
- [x] Call `extra.sendRequest` with `elicitation/create`
- [x] Handle result

### Step 3: Integrate with Session and Writer
**Files:** `src/tools/fillField.ts`
**Changes:**
- [x] Call `fillField`
- [x] Call `session.markModified()`
- [x] Return success message

### Step 4: Export Tool
**Files:** `src/tools/index.ts`
**Changes:**
- [x] Export `registerFillFieldTool` (already done via Step 1/3 integration)

### Step 5: Write Tests
**Files:** `tests/tools/fillField.test.ts`
**Test cases:**
- [x] Verify text field elicitation request and fill
- [x] Verify checkbox elicitation request and fill
- [x] Verify dropdown/radio elicitation request
- [x] Handle user decline
- [x] Error handling implicitly covered by logic

## Implementation Notes
- Used `elicitation/create` method from MCP SDK.
- Added `isModified` and `markSessionModified` to `src/state/session.ts`.
- Updated `tests/fixtures/index.ts` to include `elicitation` capability in test client.


## Files to Create/Modify

- `src/tools/fillField.ts` - New file
- `src/tools/index.ts` - Export new tool
- `tests/tools/fillField.test.ts` - New test file

## Quality Checklist

- [ ] Tool uses `extra.elicit` correctly
- [ ] Schema matches field type (string/boolean/enum)
- [ ] Updates PDF in memory via `fillField`
- [ ] Updates session modification state
- [ ] Handles all field types defined in `PdfFieldType`
- [ ] Tests mock the elicitation flow successfully