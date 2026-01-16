---
name: Task 1.1 Project Scaffolding
overview: Initialize the mcpdf project with TypeScript, npm, tsdown bundler, vitest testing, and ESLint linting - establishing the foundation for the MCP PDF server.
todos:
  - id: init-npm
    content: Initialize npm project with package.json and install dependencies
    status: completed
  - id: config-typescript
    content: Configure TypeScript with tsconfig.json (strict mode, ESM)
    status: completed
    dependencies:
      - init-npm
  - id: config-tsdown
    content: Configure tsdown bundler with tsdown.config.ts
    status: completed
    dependencies:
      - init-npm
  - id: config-vitest
    content: Configure vitest testing with vitest.config.ts
    status: completed
    dependencies:
      - init-npm
  - id: config-eslint
    content: Configure ESLint with flat config (eslint.config.js)
    status: completed
    dependencies:
      - init-npm
  - id: create-src
    content: Create src/index.ts placeholder entry point
    status: completed
    dependencies:
      - config-typescript
  - id: create-test
    content: Create tests/setup.test.ts initial test
    status: completed
    dependencies:
      - config-vitest
  - id: add-gitignore
    content: Add .gitignore for node_modules, dist, etc.
    status: completed
    dependencies:
      - init-npm
  - id: verify-setup
    content: "Run all checks: npm run check (lint + typecheck + test)"
    status: completed
    dependencies:
      - create-src
      - create-test
      - config-eslint
---

# Task 1.1: Project Scaffolding Plan

Set up the mcpdf project foundation with TypeScript, build tools, testing, and linting.

## Directory Structure

```
mcpdf/
├── src/
│   └── index.ts              # Entry point placeholder
├── tests/
│   └── setup.test.ts         # Initial test to verify setup
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts
├── eslint.config.js
└── .gitignore
```

## Implementation Steps

### 1. Initialize npm project

Create `package.json` with:

- Name: `mcpdf`
- Type: `module` (ESM)
- Node engine: `>=20.0.0`
- Entry points: `main`, `bin`, `types`

### 2. Install dependencies

**Runtime:**

- `zod` - Schema validation (needed for MCP tool schemas)

**Dev:**

- `typescript` ^5.x
- `tsdown` - Build/bundle
- `vitest` - Testing
- `eslint` ^9.x with flat config
- `@types/node` ^20.x
- `typescript-eslint` - ESLint TypeScript support

### 3. Configure TypeScript ([tsconfig.json](tsconfig.json))

Key settings from [LIBRARIES.md](context/resources/LIBRARIES.md):

- `target`: `ES2022`
- `module`: `NodeNext`
- `moduleResolution`: `NodeNext`
- `strict`: `true`
- `outDir`: `dist`
- `declaration`: `true`

### 4. Configure tsdown ([tsdown.config.ts](tsdown.config.ts))

Based on [LIBRARIES.md](context/resources/LIBRARIES.md#tsdown):

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

### 5. Configure vitest ([vitest.config.ts](vitest.config.ts))

Based on [LIBRARIES.md](context/resources/LIBRARIES.md#vitest):

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

### 6. Configure ESLint ([eslint.config.js](eslint.config.js))

Flat config format (ESLint 9+) with TypeScript support.

### 7. Create placeholder files

- `src/index.ts` - Simple placeholder that exports version
- `tests/setup.test.ts` - Test that verifies the setup works

### 8. Add npm scripts

| Script | Command | Purpose |

|--------|---------|---------|

| `build` | `tsdown` | Build with tsdown |

| `dev` | `tsdown --watch` | Watch mode |

| `test` | `vitest run` | Run tests once |

| `test:watch` | `vitest` | Run tests in watch mode |

| `lint` | `eslint .` | Run ESLint |

| `lint:fix` | `eslint . --fix` | Auto-fix lint issues |

| `typecheck` | `tsc --noEmit` | Type checking only |

| `check` | `npm run lint && npm run typecheck && npm run test` | All checks |

## Validation

After implementation, verify:

1. `npm run build` - Produces `dist/index.js` and `dist/index.d.ts`
2. `npm run test` - Test passes
3. `npm run lint` - No lint errors
4. `npm run typecheck` - No type errors