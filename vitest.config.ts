import path from 'node:path';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@mock', replacement: path.resolve(__dirname, '.mock') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
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
    pool: 'vmThreads',
  },
});
