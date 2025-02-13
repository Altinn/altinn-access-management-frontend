import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  test: {
    environment: 'jsdom',
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
