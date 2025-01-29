import { test } from '../../fixture/pomFixture';

test.describe('New brukerflate - EnkelttjenesteDelegering', () => {
  test('Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- Mainpage', async ({
    login,
    runAccessibilityTest,
  }) => {
    await login.loginWithUser('20838198385');
    await login.chooseReportee('Diskret Nær Tiger As');

    await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });

  test('Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- delegationPage', async ({
    login,
    runAccessibilityTest,
  }) => {
    await login.loginWithUser('20838198385');
    await login.chooseReportee('Diskret Nær Tiger As');

    await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });
});
