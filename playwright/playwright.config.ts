import type { PlaywrightTestConfig } from '@playwright/test';

import { currentEnv, loadEnv } from './util/helper';

// Load env from playwright/config to match repo layout
loadEnv(currentEnv());

const config: PlaywrightTestConfig = {
  fullyParallel: true,
  retries: 1,
  use: {
    trace: 'on',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: { mode: 'retain-on-failure', size: { width: 1900, height: 1500 } },
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
        trace: 'on',
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
      testMatch: 'playwright/uuTests/accessibilityTests/*.spec.ts',
      expect: {
        timeout: 15 * 1000, // 15 seconds for expect assertions
      },
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
  ],
};

export default config;
