/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';

test('Login with TestID', async ({ page }) => {
  const login = new LoginPage(page);
  await page.goto(env('BASE_URL'));
  await login.LoginToAccessManagement('02828698497');
});
