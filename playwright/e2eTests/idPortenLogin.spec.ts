/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { chromium, test } from '@playwright/test';

import { loginWithUser } from 'playwright/pages/loginPage';

test('Login with TestID', async ({ page, context }) => {
  const login = new loginWithUser(page);

  await login.gotoLoginPage('03835898554', page);
});
