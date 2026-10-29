import { test } from 'playwright/fixture/pomFixture';
import { loadTestdata } from 'playwright/util/testdata';

const {
  personer: [bruker],
} = loadTestdata('idporten').innlogging;

test.describe('ID Porten Login', () => {
  test('Login with TestID', async ({ login }) => {
    await test.step('Login to Access Management', async () => {
      await login.LoginToAccessManagement(bruker.pid);
    });
  });
});
