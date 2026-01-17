---
name: "Task 2.5: PDF Saving"
overview: Implement PDF saving functionality with automatic directory creation, file overwrite support, and default `_filled.pdf` filename generation while ensuring the original file is never modified.
todos:
  - id: types
    content: Add SaveFailed error code and SaveResult interface to types.ts
    status: pending
  - id: error
    content: Add PdfSaveError class to errors.ts
    status: pending
    dependencies:
      - types
  - id: savePdf
    content: Implement savePdf() function in writer.ts
    status: pending
    dependencies:
      - error
  - id: exports
    content: Export savePdf, PdfSaveError, SaveResult from index.ts
    status: pending
    dependencies:
      - savePdf
  - id: tests
    content: Write unit tests for savePdf in writer.test.ts
    status: pending
    dependencies:
      - savePdf
---

# Task 2.5: PDF Saving - Implementation Plan

## Overview

Add `savePdf()` function to serialize and save modified PDFs to disk, with support for:

- Default output filename (`{original}_filled.pdf`)
- Custom output paths
- Automatic directory creation
- File overwrite (by default)
- Protection against overwriting the original file

## Implementation Steps

### 1. Add Error Code and Types

**[`src/pdf/types.ts`](src/pdf/types.ts):**

- Add `SaveFailed = 'SAVE_FAILED'` to `PdfErrorCode` enum
- Add `SaveResult` interface:
```typescript
export interface SaveResult {
  outputPath: string;
  bytesWritten: number;
}
```


### 2. Add Save Error Class

**[`src/pdf/errors.ts`](src/pdf/errors.ts):**

Add `PdfSaveError` class following the existing pattern (e.g., `PdfInvalidError`):

```typescript
/**
 * Error thrown when saving a PDF fails
 */
export class PdfSaveError extends PdfError {
  readonly code = PdfErrorCode.SaveFailed;

  constructor(path: string, reason?: string) {
    const message = reason
      ? `Failed to save PDF: ${path}. Reason: ${reason}`
      : `Failed to save PDF: ${path}`;
    super(message);
  }
}
```

### 3. Implement `savePdf()` Function

**[`src/pdf/writer.ts`](src/pdf/writer.ts):**

**New imports to add at top of file:**

```typescript
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
```

**Import from local modules:**

```typescript
import { PdfSaveError } from './errors.js';
import { SaveResult } from './types.js';
```

**Function signature with JSDoc:**

```typescript
/**
 * Save a PDF document to a file.
 *
 * Creates the output directory if it doesn't exist. By default, saves to
 * `{originalPath}_filled.pdf` if no output path is provided.
 *
 * @param document - The PDFDocument to save
 * @param originalPath - Path to the original PDF (used for default output name)
 * @param outputPath - Optional custom output path (defaults to `{original}_filled.pdf`)
 * @returns SaveResult with output path and bytes written
 * @throws {PdfSaveError} If output path equals original path or write fails
 */
export async function savePdf(
  document: PDFDocument,
  originalPath: string,
  outputPath?: string
): Promise<SaveResult>
```

**Logic flow:**

1. Generate default output path if not provided: `originalPath.replace(/\.pdf$/i, '_filled.pdf')`
2. Resolve to absolute paths using `path.resolve()`
3. Validate output path is not the same as original path (throw `PdfSaveError`)
4. Create parent directory if it doesn't exist (`mkdir -p` equivalent)
5. Call `document.save()` to get PDF bytes
6. Write bytes to output file (overwrites if exists)
7. Return `SaveResult` with path and bytes written

**Note:** Path comparison is case-sensitive. On case-insensitive filesystems (macOS, Windows), paths like `/path/file.pdf` and `/path/FILE.PDF` may refer to the same file but would pass validation. This is acceptable for MVP.

### 4. Export New Function

**[`src/pdf/index.ts`](src/pdf/index.ts):**

- Export `savePdf` from writer
- Export `PdfSaveError` from errors
- Export `SaveResult` type

### 5. Write Unit Tests

**[`tests/pdf/writer.test.ts`](tests/pdf/writer.test.ts):**

**Test Setup/Teardown (temp directory management):**

```typescript
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('savePdf', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcpdf-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // ... tests use tempDir for output paths
});
```

**Test cases to implement:**

| Test Case | Description |

|-----------|-------------|

| saves with default output path | Verify `_filled.pdf` suffix generation |

| saves with custom output path | Verify custom path works |

| creates parent directories | Verify nested dirs are created |

| overwrites existing files | Verify existing files are replaced |

| throws when output equals original | Protect original file |

| preserves filled field values | Load saved PDF, verify fields |

| works with multi-page PDFs | Save and verify multi-page |

| returns correct bytesWritten | Verify bytesWritten matches file size |

## Files to Change

| File | Change |

|------|--------|

| [`src/pdf/types.ts`](src/pdf/types.ts) | Add `SaveFailed` error code, `SaveResult` interface |

| [`src/pdf/errors.ts`](src/pdf/errors.ts) | Add `PdfSaveError` class |

| [`src/pdf/writer.ts`](src/pdf/writer.ts) | Add `savePdf()` function |

| [`src/pdf/index.ts`](src/pdf/index.ts) | Export new function, error, and type |

| [`tests/pdf/writer.test.ts`](tests/pdf/writer.test.ts) | Add save test suite |

## Key Implementation Details

**Full `savePdf` implementation:**

```typescript
export async function savePdf(
  document: PDFDocument,
  originalPath: string,
  outputPath?: string
): Promise<SaveResult> {
  // 1. Generate default output path if not provided
  const defaultOutput = originalPath.replace(/\.pdf$/i, '_filled.pdf');
  const targetPath = outputPath ?? defaultOutput;

  // 2. Resolve to absolute paths
  const absoluteOriginalPath = resolve(originalPath);
  const absoluteOutputPath = resolve(targetPath);

  // 3. Validate output path is not the same as original
  if (absoluteOutputPath === absoluteOriginalPath) {
    throw new PdfSaveError(
      absoluteOutputPath,
      'Output path cannot be the same as original file'
    );
  }

  try {
    // 4. Create parent directory if it doesn't exist
    await mkdir(dirname(absoluteOutputPath), { recursive: true });

    // 5. Serialize PDF to bytes
    const pdfBytes = await document.save();

    // 6. Write to file (overwrites if exists)
    await writeFile(absoluteOutputPath, pdfBytes);

    // 7. Return result
    return {
      outputPath: absoluteOutputPath,
      bytesWritten: pdfBytes.length,
    };
  } catch (error) {
    if (error instanceof PdfSaveError) {
      throw error;
    }
    throw new PdfSaveError(
      absoluteOutputPath,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
```

**Test helper for loading saved PDF:**

```typescript
// Helper to verify saved PDF can be loaded and has expected fields
async function verifySavedPdf(path: string, expectedFields: Record<string, unknown>) {
  const { document } = await loadPdf(path);
  const fields = extractFields(document);
  for (const [name, value] of Object.entries(expectedFields)) {
    const field = fields.find(f => f.name === name);
    expect(field?.currentValue).toBe(value);
  }
}
```