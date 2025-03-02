import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@mock', replacement: path.resolve(__dirname, '.mock') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'vmThreads',
    setupFiles: './tests/setupTests.ts',
    exclude: [
      '**/node_modules/**',
      '**/cypress/**',
      '**/playwright/**',
      '**/*.spec.ts',
      '**/*.test.cy.tsx',
    ],
    coverage: {
      provider: 'istanbul', // or 'v8'
    },
  },
});
