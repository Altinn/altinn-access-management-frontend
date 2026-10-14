import { test as base } from '@playwright/test';

import { ApiClient } from 'playwright/api-requests';

// Worker-scoped, so beforeAll/afterAll can use it too. The clients hold no per-test state.
export const apiFixture = base.extend<object, { api: ApiClient }>({
  api: [
    async ({}, use) => {
      await use(new ApiClient());
    },
    { scope: 'worker' },
  ],
});
