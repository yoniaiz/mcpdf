# mcpdf - Product Requirements Document

## 1. Executive Summary

**mcpdf** is a Model Context Protocol (MCP) server that enables AI assistants to intelligently read, understand, and fill PDF forms through conversational interaction. Unlike existing PDF tools that simply extract fields for manual editing, mcpdf provides an AI-assisted interactive form-filling experience using MCP's elicitation feature.

The server reads PDF documents, detects fillable form fields (AcroForms), summarizes document content, and guides users through filling each field one-by-one with contextual explanations. The AI client (Claude/Cursor) handles intelligence and explanations while mcpdf provides the PDF manipulation capabilities.

**MVP Goal:** Deliver a working MCP server that can open PDFs with interactive form fields (AcroForms), present fields to users via elicitation, fill the PDF with user-provided values, and save the completed document.

## 2. Mission

**Mission Statement:** Empower users to fill PDF forms effortlessly through natural conversation with AI, eliminating the friction of manual form navigation and providing intelligent guidance for each field.

**Core Principles:**
1. **Simplicity First** - Easy to install, configure, and use with any MCP client
2. **AI-Assisted** - Let the AI client handle intelligence; mcpdf handles PDF operations
3. **Interactive** - Use elicitation for field-by-field guided filling
4. **Non-Destructive** - Always preserve original PDFs, save to new files
5. **Transparent** - Provide clear context about each field for informed filling

## 3. Target Users

### Primary Persona: Knowledge Worker
- **Description:** Professional who frequently deals with PDF forms (applications, contracts, tax forms, HR documents)
- **Technical Comfort:** Comfortable with AI assistants (Claude, Cursor), basic command line
- **Pain Points:**
  - Tedious manual form filling
  - Unclear field requirements in complex forms
  - Need to switch between PDF viewer and other apps for information
  - Risk of missing required fields

### Secondary Persona: Developer
- **Description:** Developer integrating PDF form capabilities into AI workflows
- **Technical Comfort:** High technical proficiency
- **Pain Points:**
  - Need programmable PDF form access
  - Want to automate document workflows
  - Require reliable, well-documented MCP tools

## 4. MVP Scope

### In Scope (Phase 1 - MVP)

**Core Functionality:**
- ✅ Open and read PDF files from local filesystem
- ✅ Detect interactive form fields (AcroForms)
- ✅ Extract field metadata (name, type, page, current value)
- ✅ Fill form fields via MCP elicitation
- ✅ Save filled PDFs to new files
- ✅ Preview PDFs in system viewer

**Field Types:**
- ✅ Text fields (single-line and multi-line)
- ✅ Checkboxes
- ✅ Radio buttons
- ✅ Dropdown/select fields
- ✅ Date fields (as text input)

**Workflow:**
- ✅ Page-by-page processing
- ✅ Field-by-field elicitation with context
- ✅ Get page content for pages without fields
- ✅ Minimal session state (current PDF tracking)

**Technical:**
- ✅ TypeScript implementation
- ✅ stdio transport
- ✅ MCP tools API
- ✅ Error handling for common failures

### Out of Scope (Future Phases)

**PDF Features:**
- ❌ Static form detection (underlines, boxes as fields)
- ❌ Signature fields
- ❌ File attachment fields
- ❌ Password-protected PDF support
- ❌ PDF creation from scratch
- ❌ OCR for scanned documents

**Advanced Features:**
- ❌ Field validation (email, phone formats)
- ❌ Auto-fill from user profile
- ❌ Form templates/presets
- ❌ Batch processing multiple PDFs
- ❌ MCP completion feature
- ❌ MCP resources API

**Deployment:**
- ❌ HTTP transport
- ❌ Docker container
- ❌ Cloud deployment

## 5. User Stories

### Primary User Stories

**US1: Open and Understand PDF**
> As a user, I want to point the AI to a PDF file, so that it can tell me what the document is about and what fields need to be filled.

*Example:* "Open my tax form at ~/Documents/tax-2025.pdf" → AI responds with document summary and field count.

**US2: View All Form Fields**
> As a user, I want to see all the form fields in the PDF, so that I know what information I'll need to provide.

*Example:* AI lists "15 fields found: First Name (text), Last Name (text), SSN (text), Filing Status (dropdown)..."

**US3: Fill Fields with Guidance**
> As a user, I want the AI to guide me through each field one by one, explaining what's needed, so that I fill the form correctly.

*Example:* "Let's start with page 1. The first field is 'Filing Status' - this determines your tax bracket. Options are: Single, Married Filing Jointly, Married Filing Separately, Head of Household."

**US4: Provide Field Values via Form**
> As a user, I want to enter field values through a structured form (elicitation), so that my input is captured accurately.

*Example:* A form popup appears asking for "First Name" with a text input field.

**US5: Preview Filled Form**
> As a user, I want to preview the filled PDF before saving, so that I can verify everything looks correct.

*Example:* "Preview the form" → System PDF viewer opens showing current state.

**US6: Save Completed Form**
> As a user, I want to save the filled PDF to a new file, so that I keep the original and have the completed version.

*Example:* "Save the form" → Saves to `tax-2025_filled.pdf`.

**US7: Handle Pages Without Fields**
> As a user, I want to know what's on pages that don't have form fields, so that I understand the full document context.

*Example:* "Page 3 has no fillable fields. It contains: Instructions for calculating deductions..."

### Technical User Stories

**US8: Easy Installation**
> As a developer, I want to install mcpdf with a simple npm command, so that I can quickly add it to my MCP setup.

*Example:* `npm install -g mcpdf` or add to Claude/Cursor MCP config.

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────┐     stdio      ┌─────────────────┐
│   MCP Client    │◄──────────────►│     mcpdf       │
│ (Claude/Cursor) │                │   MCP Server    │
└─────────────────┘                └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │   PDF Engine    │
                                   │  (pdf-lib +     │
                                   │   pdfjs-dist)   │
                                   └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  Local Files    │
                                   │   (*.pdf)       │
                                   └─────────────────┘
```

### Directory Structure

```
mcpdf/
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── server.ts             # MCP server configuration
│   ├── tools/                # MCP tool implementations
│   │   ├── index.ts          # Tool exports
│   │   ├── openPdf.ts        # open_pdf tool
│   │   ├── listFields.ts     # list_fields tool
│   │   ├── getFieldContext.ts# get_field_context tool
│   │   ├── fillField.ts      # fill_field tool
│   │   ├── previewPdf.ts     # preview_pdf tool
│   │   ├── savePdf.ts        # save_pdf tool
│   │   └── getPageContent.ts # get_page_content tool
│   ├── pdf/                  # PDF operations
│   │   ├── index.ts          # PDF engine exports
│   │   ├── reader.ts         # PDF reading/parsing
│   │   ├── writer.ts         # PDF modification/saving
│   │   ├── fields.ts         # Form field operations
│   │   └── types.ts          # PDF-related types
│   ├── state/                # Session state management
│   │   └── session.ts        # Current PDF state
│   └── utils/                # Utilities
│       ├── platform.ts       # OS-specific operations
│       └── errors.ts         # Error definitions
├── tests/                    # Test files
│   ├── tools/                # Tool tests
│   ├── pdf/                  # PDF operation tests
│   └── fixtures/             # Test PDF files
├── context/                  # Project context docs
├── package.json
├── tsconfig.json
├── tsdown.config.ts
└── vitest.config.ts
```

### Design Patterns

1. **Tool Pattern** - Each MCP tool is a self-contained module with:
   - Input schema (Zod validation)
   - Handler function
   - Result formatting

2. **Session State** - Minimal singleton pattern for tracking:
   - Currently loaded PDF document
   - PDF file path
   - Modified state

3. **PDF Engine Abstraction** - Unified interface over pdf-lib and pdfjs-dist:
   - Reader for extraction (pdfjs-dist)
   - Writer for modification (pdf-lib)

4. **Error Handling** - Typed errors with user-friendly messages:
   - PdfNotLoadedError
   - PdfProtectedError
   - FieldNotFoundError
   - SaveError

## 7. Tools/Features

### Tool Specifications

#### `open_pdf`
**Purpose:** Load a PDF file and return document summary

| Attribute | Value |
|-----------|-------|
| Input | `{ path: string }` |
| Output | Document summary, page count, field count, form type |
| Elicitation | None |

**Operations:**
- Validate file exists and is readable
- Load PDF with pdf-lib
- Detect form fields (AcroForms)
- Store in session state
- Return summary

#### `list_fields`
**Purpose:** Get all form fields with metadata

| Attribute | Value |
|-----------|-------|
| Input | `{ page?: number }` (optional filter) |
| Output | Array of field metadata |
| Elicitation | None |

**Field Metadata:**
```typescript
{
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'multiline';
  page: number;
  required: boolean;
  currentValue: string | boolean | null;
  options?: string[];  // For dropdowns/radios
}
```

#### `get_field_context`
**Purpose:** Get detailed context for a specific field

| Attribute | Value |
|-----------|-------|
| Input | `{ fieldName: string }` |
| Output | Field details with surrounding context |
| Elicitation | None |

**Context includes:**
- Field label/prompt (extracted from nearby text)
- Section name (if detectable)
- Field constraints
- Tooltip/description (if present in PDF)

#### `fill_field`
**Purpose:** Fill a single field with user input via elicitation

| Attribute | Value |
|-----------|-------|
| Input | `{ fieldName: string }` |
| Output | Confirmation of filled value |
| Elicitation | **Yes** - Form matching field type |

**Elicitation Schema by Field Type:**
- Text: `{ type: 'string', title: 'Field Name' }`
- Checkbox: `{ type: 'boolean', title: 'Field Name' }`
- Dropdown: `{ type: 'string', enum: [...options] }`

#### `preview_pdf`
**Purpose:** Open current PDF state in system viewer

| Attribute | Value |
|-----------|-------|
| Input | None |
| Output | Confirmation message |
| Elicitation | None |

**Operations:**
- Save to temp file if modified
- Open with platform-appropriate command
- macOS: `open`
- Windows: `start`
- Linux: `xdg-open`

#### `save_pdf`
**Purpose:** Save filled PDF to new file

| Attribute | Value |
|-----------|-------|
| Input | `{ outputPath?: string }` |
| Output | Saved file path confirmation |
| Elicitation | None |

**Default naming:** `{original}_filled.pdf`

#### `get_page_content`
**Purpose:** Get text content of a specific page

| Attribute | Value |
|-----------|-------|
| Input | `{ page: number }` |
| Output | Page text content |
| Elicitation | None |

Used for pages without form fields to provide context.

## 8. Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.x | MCP server SDK |
| `pdf-lib` | ^1.17.x | PDF creation/modification, form filling |
| `pdfjs-dist` | ^4.x | PDF text extraction |
| `zod` | ^3.x | Schema validation |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.x | Language |
| `tsdown` | ^0.x | Build/bundle |
| `vitest` | ^2.x | Testing |
| `@types/node` | ^20.x | Node.js types |

### Runtime Requirements

- Node.js >= 20.x
- npm >= 10.x

## 9. Security & Configuration

### Configuration

**MCP Client Configuration (Claude/Cursor):**
```json
{
  "mcpServers": {
    "mcpdf": {
      "command": "npx",
      "args": ["mcpdf"]
    }
  }
}
```

**Or with global install:**
```json
{
  "mcpServers": {
    "mcpdf": {
      "command": "mcpdf"
    }
  }
}
```

### Security Scope

**In Scope:**
- ✅ File path validation (no directory traversal)
- ✅ File type validation (only .pdf)
- ✅ Read-only access to original files
- ✅ User consent via elicitation for each field

**Out of Scope (Phase 1):**
- ❌ PDF decryption/password handling
- ❌ Remote file access
- ❌ User authentication
- ❌ Audit logging

### Error Handling

| Error | Message | HTTP-like Code |
|-------|---------|----------------|
| File not found | "PDF file not found: {path}" | 404 |
| Not a PDF | "File is not a valid PDF" | 400 |
| Protected PDF | "PDF is password protected" | 403 |
| No PDF loaded | "No PDF currently loaded. Use open_pdf first." | 400 |
| Field not found | "Field '{name}' not found in PDF" | 404 |
| Save failed | "Failed to save PDF: {reason}" | 500 |

## 10. API Specification

### MCP Tool Schemas

#### open_pdf
```typescript
{
  name: "open_pdf",
  description: "Open a PDF file and get document summary",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute or relative path to PDF file"
      }
    },
    required: ["path"]
  }
}
```

**Response Example:**
```json
{
  "content": [{
    "type": "text",
    "text": "Opened: tax-form-2025.pdf\n\nDocument Summary:\n- Pages: 4\n- Form Type: Interactive (AcroForm)\n- Total Fields: 23\n- Filled Fields: 0\n\nThis appears to be a federal tax return form (Form 1040)."
  }]
}
```

#### fill_field (with elicitation)
```typescript
{
  name: "fill_field",
  description: "Fill a form field with user input",
  inputSchema: {
    type: "object",
    properties: {
      fieldName: {
        type: "string",
        description: "Name of the field to fill"
      }
    },
    required: ["fieldName"]
  }
}
```

**Elicitation Request:**
```json
{
  "method": "elicitation/create",
  "params": {
    "message": "Please provide your first name",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "value": {
          "type": "string",
          "title": "First Name",
          "description": "Your legal first name as it appears on official documents"
        }
      },
      "required": ["value"]
    }
  }
}
```

## 11. Success Criteria

### MVP Success Definition
The MVP is successful when a user can:
1. Load a PDF with form fields via an MCP client
2. Understand what fields need to be filled
3. Fill each field through guided elicitation
4. Preview the filled form
5. Save to a new file

### Functional Requirements

- ✅ Successfully load PDFs up to 50MB
- ✅ Detect all standard AcroForm field types
- ✅ Fill text fields with any UTF-8 content
- ✅ Fill checkboxes and radio buttons
- ✅ Fill dropdown selections
- ✅ Preview opens correct page
- ✅ Saved PDF maintains all formatting
- ✅ Original PDF is never modified

### Quality Indicators

- ✅ All tools respond in < 2 seconds for typical PDFs
- ✅ Clear error messages for all failure cases
- ✅ No crashes on malformed PDFs (graceful errors)
- ✅ Works on macOS, Windows, Linux

### User Experience Goals

- ✅ Zero configuration needed for basic usage
- ✅ Field context helps user understand requirements
- ✅ Elicitation forms match field types appropriately
- ✅ Progress is clear (which page, which field)

## 12. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Project setup with working MCP server skeleton

**Deliverables:**
- ✅ Project scaffolding (TypeScript, tsdown, vitest)
- ✅ MCP server with stdio transport
- ✅ Basic tool registration (placeholder implementations)
- ✅ Test infrastructure with sample PDFs
- ✅ Build and development scripts

**Validation:**
- Server starts and responds to MCP initialize
- Can be added to Claude/Cursor config
- Tests run successfully

### Phase 2: PDF Engine (Week 2)
**Goal:** Core PDF reading and writing capabilities

**Deliverables:**
- ✅ PDF loading with pdf-lib
- ✅ Text extraction with pdfjs-dist
- ✅ AcroForm field detection
- ✅ Field metadata extraction
- ✅ Field filling operations
- ✅ PDF saving functionality

**Validation:**
- Can read fields from test PDFs
- Can fill and save test PDFs
- Unit tests pass for all PDF operations

### Phase 3: MCP Tools (Week 3)
**Goal:** Complete tool implementations with elicitation

**Deliverables:**
- ✅ open_pdf tool with summary generation
- ✅ list_fields tool with filtering
- ✅ get_field_context tool
- ✅ fill_field tool with elicitation
- ✅ preview_pdf tool (cross-platform)
- ✅ save_pdf tool
- ✅ get_page_content tool

**Validation:**
- All tools work end-to-end
- Elicitation triggers correctly
- Integration tests pass

### Phase 4: Polish & Release (Week 4)
**Goal:** Production-ready release

**Deliverables:**
- ✅ Error handling and edge cases
- ✅ Documentation (README, examples)
- ✅ npm package configuration
- ✅ CI/CD setup
- ✅ Real-world PDF testing

**Validation:**
- Works with 10+ real-world PDF forms
- Published to npm
- Documentation complete

## 13. Future Considerations

### Phase 2 Features (Post-MVP)
- **Static Form Detection:** Detect underlines/boxes as fillable areas
- **Signature Fields:** Support for text-based signatures
- **Field Validation:** Email, phone, date format validation
- **Completion Feature:** Autocomplete suggestions for fields

### Phase 3 Features
- **Password-Protected PDFs:** Prompt for password via elicitation
- **Batch Processing:** Fill multiple PDFs with same data
- **Templates:** Save and reuse field mappings
- **HTTP Transport:** Remote server deployment

### Integration Opportunities
- **Form Templates:** Pre-built templates for common forms (W-9, I-9, etc.)
- **Data Sources:** Pull data from contacts, calendar, etc.
- **Workflow Automation:** Integrate with document management systems

## 14. Risks & Mitigations

### Risk 1: PDF Library Limitations
**Risk:** pdf-lib may not support all PDF form variations
**Impact:** High - Could prevent filling certain PDFs
**Mitigation:** 
- Test with diverse real-world PDFs early
- Document unsupported scenarios clearly
- Plan fallback to alternative libraries if needed

### Risk 2: Elicitation Client Support
**Risk:** Not all MCP clients may support elicitation fully
**Impact:** Medium - Core feature depends on it
**Mitigation:**
- Test with Claude Desktop and Cursor early
- Provide fallback tool for clients without elicitation
- Document client requirements

### Risk 3: Cross-Platform Preview
**Risk:** Opening PDFs in system viewer may fail on some systems
**Impact:** Low - Preview is convenience feature
**Mitigation:**
- Test on macOS, Windows, common Linux distros
- Graceful error if viewer not found
- Document manual preview option

### Risk 4: Large PDF Performance
**Risk:** Very large PDFs may cause timeout or memory issues
**Impact:** Medium - Some forms are very large
**Mitigation:**
- Set reasonable size limits (50MB)
- Lazy load pages as needed
- Add progress indication for long operations

### Risk 5: Field Detection Accuracy
**Risk:** Some fields may not be properly detected or contextualized
**Impact:** Medium - Affects user experience
**Mitigation:**
- Expose raw field names as fallback
- Allow manual field specification
- Iterate based on real-world testing

## 15. Appendix

### Key Dependencies

| Dependency | Link | Notes |
|------------|------|-------|
| MCP TypeScript SDK | [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Official SDK |
| pdf-lib | [pdf-lib.js.org](https://pdf-lib.js.org/) | PDF manipulation |
| pdfjs-dist | [mozilla.github.io/pdf.js](https://mozilla.github.io/pdf.js/) | PDF parsing |
| tsdown | [github.com/rolldown/tsdown](https://github.com/rolldown/tsdown) | Build tool |

### Reference Implementations

| Project | Link | Relevance |
|---------|------|-----------|
| pdf-navigator-mcp | [github.com/matsengrp/pdf-navigator-mcp](https://github.com/matsengrp/pdf-navigator-mcp) | PDF MCP patterns |
| pdf-reader-mcp | [github.com/SylphxAI/pdf-reader-mcp](https://github.com/SylphxAI/pdf-reader-mcp) | Production PDF MCP |

### MCP Specification References

| Document | Link |
|----------|------|
| MCP Tools | [modelcontextprotocol.io/specification/draft/server/tools](https://modelcontextprotocol.io/specification/draft/server/tools) |
| MCP Elicitation | [modelcontextprotocol.io/specification/draft/client/elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation) |
