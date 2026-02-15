import { test } from '../../fixture/pomFixture';

test.describe.skip('New brukerflate - EnkelttjenesteDelegering', () => {
  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- Mainpage', async ({
    login,
    runAccessibilityTest,
  }) => {
    await login.LoginToAccessManagement('20838198385');
    await login.chooseReportee('Diskret Nær Tiger As');

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });

  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- delegationPage', async ({
    login,
    runAccessibilityTest,
  }) => {
    await login.LoginToAccessManagement('20838198385');
    await login.chooseReportee('Diskret Nær Tiger As');

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });
});
