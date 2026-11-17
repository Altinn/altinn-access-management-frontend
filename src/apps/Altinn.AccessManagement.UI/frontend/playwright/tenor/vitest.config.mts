import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { playwright: path.resolve(__dirname, '..') } },
  test: { environment: 'node', include: ['playwright/tenor/**/*.test.ts'] },
});
