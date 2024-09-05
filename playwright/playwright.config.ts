import type { PlaywrightTestConfig } from '@playwright/test';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

// eslint-disable-next-line import/no-named-as-default-member
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
  testMatch: ['playwright/e2eTests/*.spec.ts'],
  //timeout: 5000,
  timeout: 5 * 60 * 1000,
  expect: {
    timeout: 15000, // for all "expect" statements. NOTE - only "toBeVisible". "isVisible" is deprecated and not awaited.
  },
  use: {
    headless: true,
    // screenshot: 'only-on-failure',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: { mode: 'retain-on-failure' },
    launchOptions: {
      args: ['--start-maximized'],
    },
    viewport: null, // Disable Playwright's default viewport setting, required to utilize maximum screen. Mostly useful for viewing test results / screenshots to be able to view the entire screen
  },
  reporter: [
    ['dot'],
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
      },
    ],
  ],
};

export default config;
