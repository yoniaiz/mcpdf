# Static Form Support - Research Findings

> Research conducted 2026-01-17 using GitHub code search and repository analysis.

## Problem Statement

Many PDFs have visual blank spots (like `___` or lines) instead of proper AcroForm fields. These include:
- Legacy PDFs designed for printing and manual filling
- Scanned documents
- Government forms without AcroForm support
- Forms with visual placeholders

## Approach Evaluation

### Approaches Considered

| Approach | Description | Verdict |
|----------|-------------|---------|
| **Pattern Detection** | Regex to find `___` patterns | ❌ Fragile, many edge cases |
| **Template-based** | JSON templates with coordinates | ⚠️ Works but requires upfront setup |
| **AI-driven** | Expose positions, let AI reason | ✅ **Chosen** - follows MCP philosophy |

### Why AI-Driven Approach

1. **MCP Philosophy**: Server provides data + tools, AI does reasoning
2. **Flexibility**: AI handles any form layout
3. **Minimal Code**: Just expose existing data + add draw_text
4. **Proven**: Used in production (COVID certificates, etc.)

## Industry Validation

### Production Example: q4-certificate

**Repository:** `mycaule/q4-certificate`
**Purpose:** French COVID-19 certificate generator

```javascript
// Load existing PDF template
const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes)
const page1 = pdfDoc.getPages()[0]

// Embed font and create helper
const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
const drawText = (text, x, y, size = 11) => 
    page1.drawText(text, { x, y, size, font })

// Fill at specific coordinates
drawText(`${firstname} ${lastname}`, 92, 702)  // Name
drawText(birthday, 92, 684)                     // Birthday
drawText(placeofbirth, 214, 684)               // Place
drawText(`${address} ${zipcode} ${city}`, 104, 665)  // Address
```

**Key Insight:** Coordinates are hardcoded because the form template is known. In our case, AI figures out coordinates dynamically.

### PyMuPDF (fitz) Pattern

**Repository:** Various (Azure, etc.)

```python
# Insert text at coordinates
point = fitz.Point(rect.width - 100, rect.height - 20)
page.insert_text(point, page_text, fontsize=12, color=(0, 0, 0))
```

Same approach: coordinates + text + styling options.

### pdf-agent-mcp

**Repository:** `vlad-ds/pdf-agent-mcp`
**Relevance:** Existing PDF MCP server

- Uses **pdf-lib** and **pdfjs-dist** (same as us!)
- Extracts text with positions using `transform` matrix
- Currently **read-only** - no write capabilities
- **Our approach fills this gap**

### pdfme

**Repository:** `pdfme/pdfme`
**Approach:** Template-based with JSON schemas

- Defines fields with x, y, width, height in JSON
- More complex but validates coordinates work
- We skip template layer - AI does that reasoning

## Technical Details

### pdf-lib drawText API

```typescript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Embed standard font
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Draw text at coordinates
page.drawText('Hello World', {
  x: 50,          // X from left edge
  y: 700,         // Y from bottom edge
  size: 12,       // Font size in points
  font: font,     // Embedded font
  color: rgb(0, 0, 0),  // Black
});
```

### Available Standard Fonts (pdf-lib)

| Font | Use Case |
|------|----------|
| `StandardFonts.Helvetica` | Clean sans-serif (default) |
| `StandardFonts.TimesRoman` | Serif, formal documents |
| `StandardFonts.Courier` | Monospace, code/data |
| `StandardFonts.HelveticaBold` | Bold variant |
| `StandardFonts.TimesRomanBold` | Bold serif |

### pdfjs-dist Text Position Extraction

```typescript
const textContent = await page.getTextContent();

for (const item of textContent.items) {
  if ('str' in item && 'transform' in item) {
    const text = item.str;
    const x = item.transform[4];  // X position
    const y = item.transform[5];  // Y position
    const width = item.width;
    const height = item.height;
  }
}
```

**We already have this in `src/pdf/text.ts` → `extractTextWithPositions()`**

### PDF Coordinate System

```
PDF Page (Letter: 612 x 792 points)
┌────────────────────────────────────────────────────┐
│ (0, 792)                              (612, 792)   │
│                                                    │
│    Higher Y values = higher on page                │
│                                                    │
│    (50, 700) ← "Name:" label                       │
│    (95, 700) ← draw text here                      │
│                                                    │
│    Lower Y values = lower on page                  │
│                                                    │
│ (0, 0)                                  (612, 0)   │
└────────────────────────────────────────────────────┘
  Origin at BOTTOM-LEFT, Y increases UPWARD
```

**Common Page Sizes:**
| Size | Width × Height (points) |
|------|------------------------|
| Letter | 612 × 792 |
| A4 | 595 × 842 |
| Legal | 612 × 1008 |

## Existing Code to Leverage

### Already Built (v1)

| Module | Function | Reusable? |
|--------|----------|-----------|
| `src/pdf/text.ts` | `extractTextWithPositions()` | ✅ Direct reuse |
| `src/pdf/reader.ts` | `loadPdf()` | ✅ Already used |
| `src/state/session.ts` | Session management | ✅ Extend for overlays |
| `src/pdf/writer.ts` | `savePdf()` | ✅ Works with modifications |

### New Code Needed

| File | Purpose |
|------|---------|
| `src/pdf/overlay.ts` | `drawTextOnPage()` function |
| `src/tools/getTextWithPositions.ts` | Expose position data |
| `src/tools/drawText.ts` | Place text at coordinates |

## Implementation Notes

### Font Embedding Strategy

```typescript
// Cache fonts per document to avoid re-embedding
const fontCache = new Map<string, PDFFont>();

async function getFont(doc: PDFDocument, name: string): Promise<PDFFont> {
  if (!fontCache.has(name)) {
    const font = await doc.embedFont(StandardFonts[name]);
    fontCache.set(name, font);
  }
  return fontCache.get(name)!;
}
```

### Session State Extension

Current session tracks:
- `document: PDFDocument`
- `filePath: string`
- `modified: boolean`

For v2, `modified` already works - drawing text modifies the document.

### Coordinate Validation

```typescript
function validateCoordinates(
  x: number, 
  y: number, 
  pageWidth: number, 
  pageHeight: number
): void {
  if (x < 0 || x > pageWidth) {
    throw new Error(`X coordinate ${x} out of bounds (0-${pageWidth})`);
  }
  if (y < 0 || y > pageHeight) {
    throw new Error(`Y coordinate ${y} out of bounds (0-${pageHeight})`);
  }
}
```

## References

| Resource | URL |
|----------|-----|
| pdf-lib Documentation | https://pdf-lib.js.org/ |
| pdf-lib GitHub | https://github.com/Hopding/pdf-lib |
| pdfjs-dist | https://mozilla.github.io/pdf.js/ |
| q4-certificate Example | https://github.com/mycaule/q4-certificate |
| pdf-agent-mcp | https://github.com/vlad-ds/pdf-agent-mcp |
