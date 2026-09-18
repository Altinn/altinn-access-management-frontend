import type { PlaywrightTestConfig } from '@playwright/test';

import { currentEnv, loadEnv } from './util/helper';

// Load env from playwright/config to match repo layout
loadEnv(currentEnv());
const uuRun = process.env.UU_SCAN === '1';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const config: PlaywrightTestConfig = {
  fullyParallel: true,
  retries: uuRun ? 0 : 1,
  use: {
    trace: uuRun ? 'off' : 'on',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'off',
    launchOptions: {
      args: ['--start-maximized'],
    },
    viewport: { width: 1600, height: 1200 },
  },
  reporter: [
    process.env.CI ? ['line'] : ['dot'],
    [
      'json',
      {
        outputFile: 'jsonReports/jsonReport.json',
      },
    ],
    [
      'html',
      {
        open: 'on-failure',
        outputDir: `playwright-report/${currentEnv().toUpperCase()}`,
        outputFolder: `playwright-report/${currentEnv().toUpperCase()}`,
      },
    ],
  ],

  projects: [
    {
      name: 'e2e-tests',
      testMatch: 'playwright/e2eTests/**/*.spec.ts',
      timeout: 90 * 1000,
      expect: {
        timeout: 15 * 1000, // 15 seconds for expect assertions
      },
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
    {
      name: 'accessibility-tests',
      retries: 0,
      testMatch: 'playwright/uuTests/accessibilityTests/*.spec.ts',
      timeout: 90 * 1000,
      expect: {
        timeout: 15 * 1000, // 15 seconds for expect assertions
      },
      use: {
        trace: 'off',
        browserName: 'chromium',
        headless: true,
      },
    },
  ],
};

export default config;
