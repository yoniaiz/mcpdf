# Plan: Task 4.4 - Package Configuration

## Overview

Prepare the `mcpdf` package for npm publishing. This involves configuring package.json with proper metadata, exports, and file inclusion; adding a LICENSE file; and verifying the package contents with `npm pack`.

## Dependencies

- [x] Task 4.3 (Documentation) - ✅ Complete
- [x] Task 1.1 (Project Scaffolding) - ✅ Complete

## Pre-Implementation Verification

**Already in place (verified):**

- [x] `src/index.ts` has shebang line `#!/usr/bin/env node` (line 1)
- [x] `bin` entry exists in package.json: `"mcpdf": "./dist/index.mjs"`
- [x] Package configured as `"type": "module"` for ESM
- [x] Version is `0.1.0` (proper semver for initial release)

**Needs to be added:**

- [x] LICENSE file (required for publishing)
- [x] `repository`, `homepage`, `bugs` metadata fields
- [x] `exports` field for modern module resolution
- [x] `files` array to limit published content
- [x] Expanded `keywords` for discoverability

## Deliverables

1. [x] Configure package.json for publishing
2. [x] Add bin entry for CLI (already exists and verified correct)
3. [x] Set up proper exports
4. [x] Add LICENSE file
5. [x] Test npm pack

## Implementation Steps

### Step 1: Create LICENSE File

**Files:** `LICENSE`

**Changes:**

- Create MIT License file with current year (2026)
- Use standard MIT License text format

**Content:**

```
MIT License

Copyright (c) 2026 mcpdf contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Step 2: Update package.json - Metadata

**Files:** `package.json`

**Changes:**

- Add `repository` field with GitHub URL
- Add `homepage` field pointing to GitHub repository
- Add `bugs` field for issue reporting
- Update `author` field (can use placeholder or leave empty)
- Enhance `keywords` array for npm discoverability

**Note:** The repository URL should use the actual GitHub organization/username. Using a placeholder for now:

**Example additions:**

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_ORG/mcpdf.git"
  },
  "homepage": "https://github.com/YOUR_ORG/mcpdf#readme",
  "bugs": {
    "url": "https://github.com/YOUR_ORG/mcpdf/issues"
  },
  "keywords": [
    "mcp",
    "pdf",
    "forms",
    "model-context-protocol",
    "ai",
    "claude",
    "pdf-forms",
    "form-filling",
    "acroform"
  ]
}
```

**Action Required:** Replace `YOUR_ORG` with the actual GitHub organization or username before publishing.

### Step 3: Update package.json - Exports Field

**Files:** `package.json`

**Changes:**

- Add `exports` field for modern module resolution
- This provides explicit subpath exports for better tooling support

**Addition:**

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  }
}
```

### Step 4: Update package.json - Files Whitelist

**Files:** `package.json`

**Changes:**

- Add `files` array to explicitly whitelist what gets published
- This ensures only necessary files are included in the npm package
- Excludes: `src/`, `tests/`, `context/`, `.cursor/`, config files

**Addition:**

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### Step 5: Verify bin Entry

**Files:** `package.json`

**Current state:**

```json
{
  "bin": {
    "mcpdf": "./dist/index.mjs"
  }
}
```

**Verification:**

- Confirm the bin entry points to the correct built file
- Ensure `src/index.ts` has the shebang line `#!/usr/bin/env node`
- Test that the CLI can be invoked after build

### Step 6: Build and Test npm pack

**Commands:**

```bash
# Clean build
pnpm run build

# Dry-run pack to see what would be included
npm pack --dry-run

# Actually create the tarball for inspection
npm pack
```

**Verification Checklist:**

- [x] Only `dist/`, `README.md`, `LICENSE`, `package.json` are included
- [x] No `src/`, `tests/`, `context/`, `.cursor/` directories
- [x] No config files (`.eslintrc`, `tsconfig.json`, `vitest.config.ts`, etc.)
- [x] Total package size is reasonable (< 500KB compressed)
- [x] Tarball can be extracted and inspected

### Step 7: Test Local Install

**Commands:**

```bash
# Install the packed tarball locally to verify it works
npm install -g ./mcpdf-0.1.0.tgz

# Test the CLI starts correctly
mcpdf --help || echo "Server started (expected - no --help flag)"

# Clean up
npm uninstall -g mcpdf
rm mcpdf-0.1.0.tgz
```

### Step 8: Write Tests for Package Configuration (Optional)

**Files:** `tests/package.test.ts`

**Test cases:**

- Verify package.json has required fields (name, version, description, license)
- Verify bin entry exists
- Verify exports field exists
- Verify files array includes essential files

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `LICENSE` | Create | MIT License file |
| `package.json` | Modify | Add repository, homepage, bugs, exports, files fields |
| `src/index.ts` | Verify | Ensure shebang line exists (already verified) |

## Quality Checklist

- [x] LICENSE file exists and contains correct MIT text
- [x] package.json has complete metadata (repository, homepage, bugs)
- [x] package.json has `exports` field for proper ESM resolution
- [x] package.json has `files` array limiting published content
- [x] `npm pack --dry-run` shows only expected files
- [x] No source code (`src/`), tests, or context files in package
- [x] Built CLI can be invoked (`./dist/index.mjs`)
- [x] All quality checks pass (`pnpm run check`)

## Notes

- The `bin` entry already exists in package.json and points to `./dist/index.mjs`
- The package is already configured as `"type": "module"` for ESM
- Current version is `0.1.0` which is appropriate for initial development
- Node.js engine requirement is `>=24.0.0` (matches project requirements)

## Implementation Notes

**Completed 2026-01-17:**
- Created LICENSE file with MIT license text
- Added `exports` field for ESM module resolution
- Added `files` array: `["dist", "README.md", "LICENSE"]`
- Added repository, homepage, bugs metadata (using AnomalyCo GitHub organization)
- Expanded keywords for better npm discoverability
- Verified npm pack produces 29KB package with 7 files
- Tested global install and CLI invocation (responds correctly to MCP initialize)
- All quality checks pass: lint, typecheck, 181 tests