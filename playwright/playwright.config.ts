import type { PlaywrightTestConfig } from '@playwright/test';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

dotenv.config({
  path: [
    `config/.env`,
    `config/.env.${process.env.environment ?? 'at22'}`,
    `config/.env.local`,
    `config/.env.${process.env.environment ?? 'at22'}.local`,
  ],
  override: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const config: PlaywrightTestConfig = {
  fullyParallel: true,
  use: {
    trace: 'on',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: { mode: 'retain-on-failure', size: { width: 1600, height: 1300 } },
    launchOptions: {
      args: ['--start-maximized'],
    },
    viewport: null, // Disable Playwright's default viewport setting, required to utilize maximum screen. Mostly useful for viewing test results / screenshots to be able to view the entire screen
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
        outputDir: `playwright-report/${process.env.environment?.toUpperCase() ?? 'AT24'}`,
        outputFolder: `playwright-report/${process.env.environment?.toUpperCase() ?? 'AT24'}`,
      },
    ],
  ],

  projects: [
    {
      name: 'e2e-tests',
      testMatch: 'playwright/e2eTests/**/*.spec.ts',
      timeout: 60 * 1000, //30 seconds default timeout
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
    {
      name: 'accessibility-tests',
      testMatch: 'playwright/uuTests/accessibilityTests/*.spec.ts',
      use: {
        browserName: 'chromium',
        headless: true,
      },
    },
  ],
};

export default config;
