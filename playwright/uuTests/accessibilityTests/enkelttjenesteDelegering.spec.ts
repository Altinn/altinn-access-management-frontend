import { test } from '../../fixture/pomFixture';
import { loadTestdata } from '../../util/testdata';

const {
  organisasjoner: [avgiver],
} = loadTestdata('uu').enkelttjenestedelegering;

test.describe.skip('New brukerflate - EnkelttjenesteDelegering', () => {
  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- Mainpage', async ({
    login,
  }) => {
    await login.LoginToAccessManagement(avgiver.pid);
    await login.selectActor(avgiver.name);

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });

  test('Skipped until bug is fixed, see Github issue: #1303 Verify accessibility errors in brukerflate GUI for enkelttjenestedelegering- delegationPage', async ({
    login,
  }) => {
    await login.LoginToAccessManagement(avgiver.pid);
    await login.selectActor(avgiver.name);

    //await runAccessibilityTest.brukerflateEnkelttjenesteDelegering();
  });
});
