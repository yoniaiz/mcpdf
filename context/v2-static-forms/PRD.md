# mcpdf v2 - Static Form Support

## 1. Executive Summary

**mcpdf v2** extends the existing MCP PDF server to support **static forms** - PDFs that have visual blank spots (underscores `___`, lines, boxes) instead of interactive AcroForm fields. This enables AI-assisted filling of legacy PDFs, scanned forms, and documents designed for printing.

**Goal:** Add two new tools that enable AI clients to analyze PDF layouts and draw text at specific coordinates, allowing intelligent filling of static/non-interactive forms.

## 2. Background

### What We Have (v1)
- ✅ Full AcroForm support (text, checkbox, radio, dropdown fields)
- ✅ Field detection via pdf-lib
- ✅ Text extraction with positions via pdfjs-dist
- ✅ MCP elicitation for field-by-field filling
- ✅ 181 tests, production-ready

### The Gap
Many real-world PDFs don't have interactive form fields:
- Legacy PDFs designed for print-and-fill
- Scanned documents
- Forms with visual placeholders like `Name: _______________`
- Government forms without AcroForm support

### Solution Approach
Instead of complex pattern detection in the server, we:
1. **Expose text positions** to the AI client
2. **Let AI analyze** the layout and identify blank areas
3. **Provide `draw_text` tool** for AI to place text at coordinates

This follows MCP philosophy: **server provides data + tools, AI does reasoning**.

## 3. Research Validation

### Industry Patterns (Validated via GitHub Research)

| Pattern | Example | Validation |
|---------|---------|------------|
| **Text overlay at coordinates** | `page.drawText('John', {x: 95, y: 700})` | ✅ Used in production (COVID certificate generators) |
| **pdfjs-dist position extraction** | `transform[4]` = x, `transform[5]` = y | ✅ Industry standard |
| **AI-driven detection** | Server exposes data, client reasons | ✅ Matches MCP philosophy |

### Key Reference: q4-certificate (French COVID Form Filler)
```javascript
const drawText = (text, x, y, size = 11) => 
    page.drawText(text, { x, y, size, font })

drawText(`${firstname} ${lastname}`, 92, 702)  // Name at coordinates
drawText(birthday, 92, 684)                     // Birthday below
```

This exact pattern is what we'll implement.

## 4. New Tools

### Tool 1: `get_text_with_positions`

**Purpose:** Return text items with their x, y coordinates for AI analysis

| Attribute | Value |
|-----------|-------|
| Input | `{ page: number }` |
| Output | Array of text items with positions |
| Elicitation | None |

**Input Schema:**
```typescript
{
  page: z.number().describe('Page number (1-indexed)')
}
```

**Output Example:**
```json
{
  "page": 1,
  "width": 612,
  "height": 792,
  "items": [
    { "text": "Name:", "x": 50, "y": 700, "width": 35, "height": 12 },
    { "text": "_______________", "x": 95, "y": 700, "width": 100, "height": 12 },
    { "text": "Date:", "x": 50, "y": 670, "width": 30, "height": 12 },
    { "text": "___/___/______", "x": 90, "y": 670, "width": 80, "height": 12 }
  ]
}
```

**Implementation:** Wraps existing `extractTextWithPositions()` from `src/pdf/text.ts`

---

### Tool 2: `draw_text`

**Purpose:** Draw text at specific coordinates on a PDF page

| Attribute | Value |
|-----------|-------|
| Input | `{ text, x, y, page, fontSize?, fontName? }` |
| Output | Confirmation message |
| Elicitation | None |

**Input Schema:**
```typescript
{
  text: z.string().describe('Text to draw'),
  x: z.number().describe('X coordinate (points from left)'),
  y: z.number().describe('Y coordinate (points from bottom)'),
  page: z.number().describe('Page number (1-indexed)'),
  fontSize: z.number().optional().default(12).describe('Font size in points'),
  fontName: z.enum(['Helvetica', 'TimesRoman', 'Courier']).optional().default('Helvetica')
}
```

**Output Example:**
```json
{
  "content": [{
    "type": "text",
    "text": "Drew \"John Doe\" at (95, 700) on page 1 with Helvetica 12pt"
  }]
}
```

**Implementation:** Uses pdf-lib's `page.drawText()` with embedded standard fonts

## 5. AI Workflow Example

```
User: "Fill out this application form"

AI: [calls open_pdf("application.pdf")]
    → "Opened application.pdf (2 pages, 0 form fields - static form)"
    
AI: "This is a static form without interactive fields. 
     Let me analyze the layout..."
    
AI: [calls get_text_with_positions(1)]
    → Returns items including:
       { text: "Name:", x: 50, y: 700 }
       { text: "_______________", x: 95, y: 700 }
       { text: "Email:", x: 50, y: 670 }
       { text: "_______________", x: 100, y: 670 }

AI: "I found these fields on page 1:
     - Name (blank at x=95, y=700)
     - Email (blank at x=100, y=670)
     
     What name should I fill in?"

User: "John Doe"

AI: [calls draw_text("John Doe", 95, 700, 1)]
    → "Drew 'John Doe' at (95, 700) on page 1"

AI: "Name filled! What email address?"

User: "john@example.com"

AI: [calls draw_text("john@example.com", 100, 670, 1)]
    → "Drew 'john@example.com' at (100, 670) on page 1"

AI: [calls preview_pdf()]
    → Opens PDF for verification

User: "Looks good, save it"

AI: [calls save_pdf()]
    → Saved to "application_filled.pdf"
```

## 6. Technical Implementation

### Directory Structure (New Files)

```
src/
├── tools/
│   ├── getTextWithPositions.ts   # NEW
│   └── drawText.ts               # NEW
├── pdf/
│   └── overlay.ts                # NEW - text overlay operations
tests/
├── tools/
│   ├── getTextWithPositions.test.ts  # NEW
│   └── drawText.test.ts              # NEW
├── pdf/
│   └── overlay.test.ts               # NEW
└── pdfs/
    └── static-form.pdf               # NEW test fixture
```

### PDF Coordinate System

```
PDF Page (Letter size: 612 x 792 points)
┌────────────────────────────────────────────┐
│ (0, 792)                        (612, 792) │ ← Top
│                                            │
│  (50, 700) "Name:"                         │
│  (95, 700) ← draw_text target              │
│                                            │
│                                            │
│ (0, 0)                            (612, 0) │ ← Bottom
└────────────────────────────────────────────┘
        ↑ Origin is BOTTOM-LEFT
```

**Key:** PDF coordinates start from bottom-left, Y increases upward.

### Dependencies

No new dependencies needed:
- **pdf-lib** - Already installed, has `page.drawText()` and `StandardFonts`
- **pdfjs-dist** - Already installed, has `getTextContent()` with positions

## 7. Scope

### In Scope (v2)
- ✅ `get_text_with_positions` tool
- ✅ `draw_text` tool with standard fonts
- ✅ Integration with existing session management
- ✅ Tests for new tools
- ✅ Documentation updates

### Out of Scope (Future)
- ❌ Custom font embedding
- ❌ Image/logo insertion
- ❌ Automatic blank detection (AI handles this)
- ❌ OCR for scanned documents
- ❌ Pattern matching in server

## 8. Success Criteria

### Functional
- [ ] `get_text_with_positions` returns accurate coordinates
- [ ] `draw_text` places text at exact coordinates
- [ ] Text persists when PDF is saved
- [ ] Works with existing tools (open_pdf, save_pdf, preview_pdf)

### Quality
- [ ] All new code has tests
- [ ] Existing 181 tests still pass
- [ ] `pnpm run check` passes
- [ ] Documentation updated

### User Experience
- [ ] AI can successfully fill a static form end-to-end
- [ ] Coordinate math is intuitive (no complex transforms needed)
- [ ] Preview shows text in correct positions

## 9. Implementation Phases

### Phase 1: Core Tools
**Tasks:**
1. Create `src/pdf/overlay.ts` with `drawTextOnPage()` function
2. Create `src/tools/getTextWithPositions.ts`
3. Create `src/tools/drawText.ts`
4. Register new tools in server
5. Add test fixture (static-form.pdf)
6. Write unit tests

### Phase 2: Integration & Polish
**Tasks:**
1. Integration testing with full workflow
2. Update README with static form examples
3. Edge case handling (out of bounds, empty pages)
4. Documentation updates

## 10. Risks & Mitigations

### Risk 1: Coordinate Precision
**Risk:** AI miscalculates coordinates, text appears in wrong place
**Mitigation:** 
- Return page dimensions in `get_text_with_positions`
- Encourage use of `preview_pdf` before saving
- Clear coordinate documentation

### Risk 2: Font Rendering Differences
**Risk:** Standard fonts may render slightly differently than original
**Mitigation:**
- Use common standard fonts (Helvetica, TimesRoman, Courier)
- Document font limitations
- Future: Add custom font support

### Risk 3: Text Overlap
**Risk:** AI draws text over existing content
**Mitigation:**
- AI responsibility (not server's job to validate)
- Preview tool allows verification
- Could add optional overlap detection in future

## 11. Appendix

### Existing Code to Leverage

**`src/pdf/text.ts` - extractTextWithPositions()**
```typescript
// Already extracts text items with positions
export async function extractTextWithPositions(
  filePath: string,
  page: number
): Promise<PageText> {
  // Returns { page, text, items: TextItem[] }
  // TextItem has: text, x, y, width, height
}
```

**pdf-lib drawText API**
```typescript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello World', {
  x: 50,
  y: 700,
  size: 12,
  font: font,
  color: rgb(0, 0, 0),
});
```

### Test PDF Requirements

Create `tests/pdfs/static-form.pdf` with:
- "Name: _______________" on page 1
- "Email: _______________" below name
- "Date: ___/___/______" pattern
- No AcroForm fields (purely visual)
