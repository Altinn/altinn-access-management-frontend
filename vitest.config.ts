import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/cypress/**',
      '**/playwrite/**',
      '**/*.spec.ts',
      '**/*.test.cy.tsx',
    ],
    coverage: {
      provider: 'istanbul', // or 'v8'
    },
  },
});
