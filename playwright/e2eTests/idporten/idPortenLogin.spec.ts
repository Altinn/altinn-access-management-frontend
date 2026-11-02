import { test } from 'playwright/fixture/pomFixture';

test.describe('ID Porten Login', () => {
  test('Login with TestID', async ({ login }) => {
    await test.step('Login to Access Management', async () => {
      await login.LoginToAccessManagement('02828698497');
    });
  });
});
