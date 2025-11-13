/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from '@playwright/test';

import { LoginPage } from 'playwright/pages/LoginPage';

test('Login with TestID', async ({ page }) => {
  const login = new LoginPage(page);
  await login.LoginWithUserFromFrontpage('02828698497');
});
