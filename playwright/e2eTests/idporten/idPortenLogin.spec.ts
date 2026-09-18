/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from 'playwright/fixture/pomFixture';
import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';

test.describe('ID Porten Login', () => {
  test(
    'Login with TestID',
    {
      annotation: {
        type: 'UU-dekket-av',
        description: 'Sjekk at slettede enheter kan vises/skjules',
      },
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await test.step('Login to Access Management', async () => {
        await login.LoginToAccessManagement('02828698497');
      });
    },
  );
});
