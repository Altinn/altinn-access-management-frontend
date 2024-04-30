import type { PlaywrightTestConfig } from '@playwright/test';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

// eslint-disable-next-line import/no-named-as-default-member
dotenv.config({
  path: `config/.env.${process.env.environment}`,
  override: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const config: PlaywrightTestConfig = {
  testMatch: ['playwright/e2eTests/idPortenLogin.spec.ts'],
  reporter: process.env.CI ? 'dot' : 'list',
  timeout: 5 * 60 * 1000,
  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    launchOptions: {},
  },
};

export default config;
