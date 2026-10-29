import { medTestbrukere } from '../../fixture/pomFixture';

const test = medTestbrukere({ avgiver: 'dagligLeder' });

test.describe.skip('New brukerflate - EnkelttjenesteDelegering', () => {
  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- Mainpage', async ({
    avgiver,
    login,
  }) => {
    await login.LoginToAccessManagement(avgiver.pid);
    await login.selectActor(avgiver.name);

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });

  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- delegationPage', async ({
    avgiver,
    login,
  }) => {
    await login.LoginToAccessManagement(avgiver.pid);
    await login.selectActor(avgiver.name);

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });
});
