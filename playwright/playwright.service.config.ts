import { defineConfig } from '@playwright/test';
import { getServiceConfig, ServiceOS } from '@azure/microsoft-playwright-testing';

import config from './playwright.config';

/* Learn more about service configuration at https://aka.ms/mpt/config */
export default defineConfig(
  config,
  getServiceConfig(config, {
    exposeNetwork: '<none>',
    timeout: 90000,
    os: ServiceOS.LINUX,
    useCloudHostedBrowsers: true, // Enables Azure Playwright Testing cloud browsers
  }),
  {
    retries: 1, // ✅ Retries once if test fail
    use: {
      trace: 'on', // ✅ Enables tracing (options: 'on', 'on-first-retry', 'retain-on-failure')
    },
    reporter: [
      ['list'],
      [
        '@azure/microsoft-playwright-testing/reporter',
        {
          enableGitHubSummary: true,
        },
      ],
    ],
  },
);
