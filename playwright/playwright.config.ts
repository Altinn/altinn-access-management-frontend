import type { PlaywrightTestConfig } from '@playwright/test';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';
import path from 'path';

// Load env from playwright/config to match repo layout
const envName = process.env.environment ?? 'at23';
const envPaths = [
  path.join(__dirname, 'config/.env'),
  path.join(__dirname, `config/.env.${envName}`),
  path.join(__dirname, 'config/.env.local'),
  path.join(__dirname, `config/.env.${envName}.local`),
];

// Load env from playwright/config to match repo layout
dotenv.config({
  path: envPaths,
  override: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const config: PlaywrightTestConfig = {
  fullyParallel: true,
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
        outputDir: `playwright-report/${process.env.environment?.toUpperCase() ?? 'AT24'}`,
        outputFolder: `playwright-report/${process.env.environment?.toUpperCase() ?? 'AT24'}`,
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
