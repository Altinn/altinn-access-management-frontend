import { medTestbrukere } from 'playwright/fixture/pomFixture';

const test = medTestbrukere({ bruker: 'privatperson' });

test.describe('ID Porten Login', () => {
  test('Login with TestID', async ({ bruker, login }) => {
    await test.step('Login to Access Management', async () => {
      await login.LoginToAccessManagement(bruker.pid);
    });
  });
});
