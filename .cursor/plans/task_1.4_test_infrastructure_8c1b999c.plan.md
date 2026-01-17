---
name: Task 1.4 Test Infrastructure
overview: Set up comprehensive test infrastructure using Vitest fixtures (test.extend) to provide MCP server/client lifecycle management via InMemoryTransport, plus PDF test data files for integration testing.
todos:
  - id: install-deps
    content: Install pdf-lib dependency
    status: completed
  - id: create-server-factory
    content: Create src/server.ts with createServer() factory function
    status: completed
  - id: refactor-index
    content: Refactor src/index.ts to use server factory
    status: completed
    dependencies:
      - create-server-factory
  - id: create-fixtures
    content: Create tests/fixtures/index.ts with Vitest test.extend()
    status: completed
    dependencies:
      - create-server-factory
  - id: create-pdf-generator
    content: Create tests/pdfs/generator.ts to generate test PDFs
    status: completed
    dependencies:
      - install-deps
  - id: generate-pdfs
    content: Run generator to create simple-form.pdf, multi-page.pdf, empty.pdf
    status: completed
    dependencies:
      - create-pdf-generator
  - id: write-server-tests
    content: Create tests/server.test.ts using fixtures
    status: completed
    dependencies:
      - create-fixtures
      - generate-pdfs
  - id: update-vitest-config
    content: Enhance vitest.config.ts with coverage settings
    status: completed
  - id: quality-check
    content: Run pnpm test && pnpm run lint && pnpm run build
    status: completed
    dependencies:
      - write-server-tests
---

# Task 1.4: Test Infrastructure (Updated)

## Overview

Set up a scalable testing architecture using Vitest's `test.extend()` fixtures for MCP server lifecycle management, inspired by patterns from [textlint](https://github.com/textlint/textlint/blob/HEAD/packages/textlint/test/mcp/server.test.ts) and [bytedance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop/blob/HEAD/packages/agent-infra/mcp-servers/browser/tests/tools/download.test.ts).

## Key Pattern: InMemoryTransport

The MCP SDK provides `InMemoryTransport` for testing without stdio:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);
await client.connect(clientTransport);
```

## Directory Structure

```
tests/
├── fixtures/              # Vitest fixtures using test.extend()
│   └── index.ts           # Exports extended test with server, client, pdfs
├── pdfs/                  # PDF test data files
│   ├── simple-form.pdf    # Basic form (text, checkbox, dropdown)
│   ├── multi-page.pdf     # Multi-page document
│   ├── empty.pdf          # No form fields
│   └── generator.ts       # Script to generate PDFs
├── tools/                 # Tool-specific tests (placeholder for Phase 3)
├── pdf/                   # PDF operation tests (placeholder for Phase 2)
├── server.test.ts         # Server initialization tests
└── setup.test.ts          # Existing basic tests
```

## Implementation Plan

### 1. Install Dependencies

- `pdf-lib` - For generating test PDFs (also needed in Phase 2)

### 2. Create Vitest Fixtures ([`tests/fixtures/index.ts`](tests/fixtures/index.ts))

```typescript
import { test as baseTest } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';

export const test = baseTest.extend<{
  server: McpServer;
  client: Client;
  pdfs: { simpleForm: string; multiPage: string; empty: string };
}>({
  // Server fixture with lifecycle
  server: async ({}, use) => {
    const server = createServer();
    await use(server);
    await server.close();
  },
  
  // Connected MCP client fixture
  client: async ({ server }, use) => {
    const client = new Client({ name: 'test-client', version: '1.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    await use(client);
    await client.close();
  },
  
  // PDF test data paths
  pdfs: async ({}, use) => {
    await use({
      simpleForm: path.join(__dirname, '../pdfs/simple-form.pdf'),
      multiPage: path.join(__dirname, '../pdfs/multi-page.pdf'),
      empty: path.join(__dirname, '../pdfs/empty.pdf'),
    });
  },
});
```

### 3. Refactor Server for Testability

Create [`src/server.ts`](src/server.ts) with a `createServer()` factory function that can be imported by tests. Update [`src/index.ts`](src/index.ts) to use this factory.

### 4. Create PDF Test Data Generator ([`tests/pdfs/generator.ts`](tests/pdfs/generator.ts))

Using pdf-lib to create:

- `simple-form.pdf` - Text field, checkbox, dropdown
- `multi-page.pdf` - Fields on multiple pages  
- `empty.pdf` - No form fields

Add npm script: `"generate:fixtures": "tsx tests/pdfs/generator.ts"`

### 5. Write Server Initialization Tests ([`tests/server.test.ts`](tests/server.test.ts))

Using the fixtures:

```typescript
import { describe, expect } from 'vitest';
import { test } from './fixtures/index.js';

describe('MCP Server', () => {
  test('should list all registered tools', async ({ client }) => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(7);
    expect(tools.map(t => t.name)).toContain('open_pdf');
  });
  
  test('should have correct server info', async ({ client }) => {
    // Test server name/version
  });
});
```

### 6. Update Vitest Config

Add coverage, aliases, and ensure fixtures directory is included.

## Key Files

| File | Action |

|------|--------|

| [`package.json`](package.json) | Add pdf-lib, generate:fixtures script |

| [`src/server.ts`](src/server.ts) | New - createServer() factory |

| [`src/index.ts`](src/index.ts) | Refactor to use server.ts |

| [`tests/fixtures/index.ts`](tests/fixtures/index.ts) | Vitest fixtures with test.extend() |

| [`tests/pdfs/generator.ts`](tests/pdfs/generator.ts) | PDF fixture generator |

| [`tests/pdfs/*.pdf`](tests/pdfs/) | Generated test PDFs |

| [`tests/server.test.ts`](tests/server.test.ts) | Server tests using fixtures |

| [`vitest.config.ts`](vitest.config.ts) | Enhanced config |

## Benefits of This Architecture

1. **Scalable** - Fixtures automatically handle server/client lifecycle
2. **Fast** - InMemoryTransport avoids subprocess overhead
3. **Reusable** - Same fixtures for tool tests in Phase 3
4. **Type-safe** - Full TypeScript support with fixture types
5. **Clean** - Tests focus on assertions, not setup/teardown