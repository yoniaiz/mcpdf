# Technical Resources & Libraries

> Reference documentation for libraries, packages, and resources used in mcpdf.

## Core Dependencies

### @modelcontextprotocol/sdk (MCP TypeScript SDK)

**Purpose:** Official SDK for building MCP servers in TypeScript

**Repository:** [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)

**Key Features:**
- McpServer class for server creation
- Tool registration with Zod schemas
- Elicitation support for interactive forms
- stdio and HTTP transports

**Installation:**
```bash
npm install @modelcontextprotocol/sdk
```

**Basic Usage:**
```typescript
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

const server = new McpServer({
  name: 'mcpdf',
  version: '1.0.0'
});

server.registerTool(
  'tool_name',
  {
    description: 'Tool description',
    inputSchema: {
      param: z.string().describe('Parameter description')
    }
  },
  async ({ param }) => {
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
);
```

**Elicitation Example:**
```typescript
// Inside a tool handler
const result = await server.createElicitation({
  message: 'Please provide your name',
  requestedSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Full Name',
        description: 'Your legal name'
      }
    },
    required: ['name']
  }
});

if (result.action === 'accept') {
  const name = result.content.name;
}
```

---

### pdf-lib

**Purpose:** Create and modify PDF documents in JavaScript

**Repository:** [github.com/Hopding/pdf-lib](https://github.com/Hopding/pdf-lib)
**Documentation:** [pdf-lib.js.org](https://pdf-lib.js.org/)

**Key Features:**
- Pure JavaScript (no native dependencies)
- Create PDFs from scratch
- Modify existing PDFs
- Fill and read AcroForm fields
- Works in Node.js and browsers

**Installation:**
```bash
npm install pdf-lib
```

**Loading a PDF:**
```typescript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfBytes = fs.readFileSync('form.pdf');
const pdfDoc = await PDFDocument.load(pdfBytes);
```

**Getting Form Fields:**
```typescript
const form = pdfDoc.getForm();
const fields = form.getFields();

for (const field of fields) {
  const name = field.getName();
  const type = field.constructor.name;
  console.log(`${name}: ${type}`);
}
```

**Filling Fields:**
```typescript
// Text field
const textField = form.getTextField('firstName');
textField.setText('John');

// Checkbox
const checkbox = form.getCheckBox('agreeToTerms');
checkbox.check();

// Dropdown
const dropdown = form.getDropdown('country');
dropdown.select('United States');

// Radio group
const radioGroup = form.getRadioGroup('gender');
radioGroup.select('male');
```

**Saving PDF:**
```typescript
const pdfBytes = await pdfDoc.save();
fs.writeFileSync('filled-form.pdf', pdfBytes);
```

**Field Types:**
| Class | Description |
|-------|-------------|
| `PDFTextField` | Single or multi-line text input |
| `PDFCheckBox` | Checkbox (true/false) |
| `PDFRadioGroup` | Radio button group |
| `PDFDropdown` | Dropdown select |
| `PDFOptionList` | Multi-select list |
| `PDFButton` | Push button |
| `PDFSignature` | Signature field |

---

### pdfjs-dist (Mozilla PDF.js)

**Purpose:** Parse PDFs and extract text content

**Repository:** [github.com/nickersoft/node-pdfjs-dist](https://github.com/nickersoft/node-pdfjs-dist)
**Documentation:** [mozilla.github.io/pdf.js](https://mozilla.github.io/pdf.js/)

**Key Features:**
- Render PDFs to canvas
- Extract text with positions
- Get document metadata
- Page-by-page processing

**Installation:**
```bash
npm install pdfjs-dist
```

**Loading and Extracting Text:**
```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source (required in Node.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

async function extractText(pdfPath: string): Promise<string[]> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  const pageTexts: string[] = [];
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    pageTexts.push(text);
  }
  
  return pageTexts;
}
```

**Getting Text with Positions:**
```typescript
const textContent = await page.getTextContent();

for (const item of textContent.items) {
  if ('str' in item) {
    console.log({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height
    });
  }
}
```

---

### Zod

**Purpose:** TypeScript-first schema validation

**Repository:** [github.com/colinhacks/zod](https://github.com/colinhacks/zod)
**Documentation:** [zod.dev](https://zod.dev/)

**Installation:**
```bash
npm install zod
```

**Usage with MCP:**
```typescript
import * as z from 'zod';

const inputSchema = {
  path: z.string().describe('Path to PDF file'),
  page: z.number().optional().describe('Page number (optional)')
};
```

---

## Development Dependencies

### tsdown

**Purpose:** Fast TypeScript bundler powered by Rolldown

**Repository:** [github.com/rolldown/tsdown](https://github.com/rolldown/tsdown)
**Documentation:** [tsdown.dev](https://tsdown.dev/)

**Key Features:**
- Blazing fast builds (Rolldown + Oxc)
- TypeScript support out of the box
- Declaration file generation
- Compatible with tsup migration

**Installation:**
```bash
npm install -D tsdown
```

**Configuration (tsdown.config.ts):**
```typescript
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node20'
});
```

**Scripts:**
```json
{
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch"
  }
}
```

---

### Vitest

**Purpose:** Fast unit testing framework

**Repository:** [github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)
**Documentation:** [vitest.dev](https://vitest.dev/)

**Installation:**
```bash
npm install -D vitest
```

**Configuration (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
});
```

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';

describe('PDF Reader', () => {
  it('should load a PDF file', async () => {
    const result = await loadPdf('tests/fixtures/sample.pdf');
    expect(result.pageCount).toBeGreaterThan(0);
  });
});
```

---

## Reference Implementations

### pdf-navigator-mcp

**Repository:** [github.com/matsengrp/pdf-navigator-mcp](https://github.com/matsengrp/pdf-navigator-mcp)

**Relevance:** Python MCP server for PDF form filling with similar goals

**Key Patterns:**
- Form field extraction to markdown
- Interactive vs static form detection
- Field context extraction from surrounding text
- Cross-platform PDF viewer integration

**Static Form Detection Pattern:**
```python
def _detect_static_form_fields(self, doc) -> List[Dict]:
    """Detect form fields in static PDFs."""
    fields = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        lines = text.split('\n')
        # Detect patterns like "Label: ___" or "Label _____"
        sections = self._detect_form_sections_with_context(lines, page_num + 1)
        for section in sections:
            fields.extend(section['fields'])
    return fields
```

---

### pdf-reader-mcp

**Repository:** [github.com/SylphxAI/pdf-reader-mcp](https://github.com/SylphxAI/pdf-reader-mcp)

**Relevance:** Production-ready TypeScript PDF MCP server

**Key Patterns:**
- TypeScript project structure
- Parallel PDF processing
- Handler organization

---

## MCP Specification References

### Tools Specification
**URL:** [modelcontextprotocol.io/specification/draft/server/tools](https://modelcontextprotocol.io/specification/draft/server/tools)

### Elicitation Specification
**URL:** [modelcontextprotocol.io/specification/draft/client/elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation)

**Key Points:**
- Form mode for structured data collection
- Schema supports: string, number, boolean, enum
- Supports required fields and defaults
- Client must support elicitation capability

**Elicitation Schema Types:**

```typescript
// String field
{
  type: 'string',
  title: 'Full Name',
  description: 'Your legal name',
  minLength: 1,
  maxLength: 100,
  default: 'John Doe'
}

// Number field
{
  type: 'number',
  title: 'Age',
  minimum: 0,
  maximum: 150
}

// Boolean field
{
  type: 'boolean',
  title: 'Agree to Terms',
  default: false
}

// Enum (dropdown)
{
  type: 'string',
  title: 'Country',
  enum: ['USA', 'Canada', 'UK'],
  default: 'USA'
}

// Enum with titles
{
  type: 'string',
  title: 'Status',
  oneOf: [
    { const: 'active', title: 'Active' },
    { const: 'inactive', title: 'Inactive' }
  ]
}
```

---

## Useful npm Packages

| Package | Purpose | Install |
|---------|---------|---------|
| `open` | Open files with default app | `npm install open` |
| `tmp` | Create temp files/directories | `npm install tmp` |
| `chalk` | Terminal string styling | `npm install chalk` |

---

## Version Requirements

| Dependency | Minimum Version | Notes |
|------------|-----------------|-------|
| Node.js | 20.x | Required by MCP SDK |
| TypeScript | 5.x | Modern features |
| npm | 10.x | Comes with Node 20 |
