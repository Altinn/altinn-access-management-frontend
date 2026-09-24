import { test } from '@playwright/test';

import { LoginPage } from 'playwright/pages/LoginPage';

test.describe('ID Porten Login', () => {
  test('Login with TestID', async ({ page }) => {
    const login = new LoginPage(page);

    await test.step('Login to Access Management', async () => {
      await login.LoginToAccessManagement('02828698497');
    });
  });
});
