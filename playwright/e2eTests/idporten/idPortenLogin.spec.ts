import { test } from 'playwright/fixture/pomFixture';
import { LoginPage } from 'playwright/pages/LoginPage';

const reportArea = { annotation: { type: 'report-area', description: 'Innlogging' } };

test.describe('ID Porten Login', reportArea, () => {
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
