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
  timeout: 5000,
  reporter: 'html',
  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    launchOptions: {},
  },
};

export default config;
