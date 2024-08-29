import type { PlaywrightTestConfig } from '@playwright/test';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

// eslint-disable-next-line import/no-named-as-default-member
dotenv.config({
  path: [
    `config/.env`,
    `config/.env.${process.env.environment ?? 'at24'}`,
    `config/.env.local`,
    `config/.env.${process.env.environment ?? 'at22'}.local`,
  ],
  override: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const config: PlaywrightTestConfig = {
  testMatch: ['playwright/e2eTests/*.spec.ts'],
  //timeout: 5000,
  timeout: 3 * 60 * 1000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {},
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
