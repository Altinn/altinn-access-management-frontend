/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from '@playwright/test';

import { loginWithUser } from 'playwright/pages/loginPage';

test('Login with TestID', async ({ page }) => {
  const login = new loginWithUser(page);

  await login.loginWithUser('02828698497');
});
