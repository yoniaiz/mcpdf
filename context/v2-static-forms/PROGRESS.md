# mcpdf v2 - Static Form Support Progress

> **Last Updated:** 2026-01-18
> 
> This file tracks development tasks for mcpdf v2 (static form support).

## Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Core Tools | 🔄 In Progress | 2/4 |
| Phase 2: Integration & Polish | ⏳ Pending | 0/3 |

**Total Progress:** 2/7 tasks completed

---

## Phase 1: Core Tools

### Task 1.1: Text Overlay Foundation
- **Status:** ✅ Complete
- **Plan:** [`.cursor/plans/text_overlay_foundation_021aaf5d.plan.md`](.cursor/plans/text_overlay_foundation_021aaf5d.plan.md)
- **Description:** Create the PDF text overlay functionality using pdf-lib
- **Deliverables:**
  - [x] Create `src/pdf/overlay.ts`
  - [x] Implement `drawTextOnPage()` function with pdf-lib
  - [x] Support standard fonts (Helvetica, TimesRoman, Courier)
  - [x] Handle page bounds validation
  - [x] Write unit tests in `tests/pdf/overlay.test.ts`
- **Dependencies:** None (builds on existing pdf-lib setup)
- **Notes:** Added `StandardFontName`, `TextOverlayOptions`, `TextOverlayResult` types. Added `PdfOutOfBoundsError` for coordinate validation. 27 unit tests added.

### Task 1.2: get_text_with_positions Tool
- **Status:** ✅ Complete
- **Plan:** [`.cursor/plans/get_text_with_positions_tool_0a4ac450.plan.md`](.cursor/plans/get_text_with_positions_tool_0a4ac450.plan.md)
- **Description:** Create MCP tool that exposes text positions for AI analysis
- **Deliverables:**
  - [x] Create `src/tools/getTextWithPositions.ts`
  - [x] Return text items with x, y, width, height
  - [x] Include page dimensions in response
  - [x] Register tool in server
  - [x] Write integration tests in `tests/tools/getTextWithPositions.test.ts`
- **Dependencies:** Task 1.1
- **Notes:** Implemented tool returning JSON with page, width, height, text, and items array. Each item has text, x, y, width, height. 8 integration tests added covering extraction, dimensions, multi-page, and error cases.

### Task 1.3: draw_text Tool
- **Status:** ⏳ Pending
- **Plan:** —
- **Description:** Create MCP tool to draw text at coordinates
- **Deliverables:**
  - [ ] Create `src/tools/drawText.ts`
  - [ ] Accept text, x, y, page, fontSize, fontName parameters
  - [ ] Use overlay module for rendering
  - [ ] Track modifications in session
  - [ ] Register tool in server
  - [ ] Write integration tests in `tests/tools/drawText.test.ts`
- **Dependencies:** Task 1.1, Task 1.2
- **Notes:**

### Task 1.4: Test Fixtures
- **Status:** ⏳ Pending
- **Plan:** —
- **Description:** Create test PDF with static form patterns
- **Deliverables:**
  - [ ] Update `tests/pdfs/generator.ts` with static form generator
  - [ ] Generate `tests/pdfs/static-form.pdf` with:
    - "Name: _______________" pattern
    - "Email: _______________" pattern
    - "Date: ___/___/______" pattern
    - No AcroForm fields
  - [ ] Add to `tests/fixtures/index.ts`
- **Dependencies:** None
- **Notes:**

---

## Phase 2: Integration & Polish

### Task 2.1: End-to-End Testing
- **Status:** ⏳ Pending
- **Plan:** —
- **Description:** Full workflow integration testing
- **Deliverables:**
  - [ ] Test complete workflow: open → get_text_with_positions → draw_text → save
  - [ ] Verify text appears at correct coordinates
  - [ ] Test with preview_pdf
  - [ ] Test error scenarios (no session, invalid page, out of bounds)
- **Dependencies:** Phase 1 complete
- **Notes:**

### Task 2.2: Documentation
- **Status:** ⏳ Pending
- **Plan:** —
- **Description:** Update documentation for static form support
- **Deliverables:**
  - [ ] Update README.md with static form workflow example
  - [ ] Add coordinate system explanation
  - [ ] Document new tools
  - [ ] Add troubleshooting for common coordinate issues
- **Dependencies:** Task 2.1
- **Notes:**

### Task 2.3: Edge Cases & Polish
- **Status:** ⏳ Pending
- **Plan:** —
- **Description:** Handle edge cases and polish
- **Deliverables:**
  - [ ] Handle empty pages gracefully
  - [ ] Validate coordinates are within page bounds
  - [ ] Handle multi-page workflows
  - [ ] Ensure all existing tests still pass
  - [ ] Final `pnpm run check` verification
- **Dependencies:** Task 2.1
- **Notes:**

---

## Change Log

| Date | Task | Change Description |
|------|------|-------------------|
| 2026-01-18 | Task 1.2 | Completed get_text_with_positions tool: returns text items with x, y, width, height coordinates and page dimensions. 8 integration tests. |
| 2026-01-17 | Task 1.1 | Completed text overlay foundation: `drawTextOnPage()`, font support, bounds validation, 27 tests |
| 2026-01-17 | Initial | Created PROGRESS.md for v2 static form support |

---

## Notes for Agents

1. **Read phase context first** - Check `context/ACTIVE_PHASE.md` → read this directory's files
2. **Shared resources** - Common libraries in `context/resources/LIBRARIES.md`
3. **Phase-specific resources** - Static form research in `context/v2-static-forms/resources/`
4. **Existing code** - v1 is complete, reuse `src/pdf/text.ts` and session management
5. **Quality gates** - Same as v1: `pnpm run check` must pass before marking complete
