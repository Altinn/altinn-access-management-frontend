/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';

test.describe('ID Porten Login', () => {
  test('Login with TestID', async ({ page }) => {
    const login = new LoginPage(page);

    await test.step('Navigate to base URL', async () => {
      await page.goto(env('BASE_URL'));
    });

    await test.step('Login to Access Management', async () => {
      await login.LoginToAccessManagement('02828698497');
    });
  });
});
