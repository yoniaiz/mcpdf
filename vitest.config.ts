import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/pdfs/**', 'tests/**/.gitkeep'],
    // Timeout for tests (some MCP operations may take time)
    testTimeout: 10000,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      // Thresholds (can be adjusted as we add more tests)
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
