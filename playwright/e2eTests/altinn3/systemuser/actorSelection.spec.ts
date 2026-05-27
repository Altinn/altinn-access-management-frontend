import { test, expect } from '../../../fixture/pomFixture';
import { FacilitatorRole, loadFacilitator } from '../../../util/loadFacilitators';

test.describe('Actor selection stability', () => {
  const role = FacilitatorRole.Revisor;

  test('Select actor and verify navigation', async ({ login }) => {
    const user = loadFacilitator(role);

    await test.step('Login', async () => {
      await login.LoginToAccessManagement(user.pid);
    });

    await test.step('Choose reportee', async () => {
      await login.selectMainUnitBySearching(user.name);
    });

    await test.step('Verify we left the actor selection page', async () => {
      await expect(login.velgAktoerHeading).not.toBeVisible({ timeout: 15000 });
    });
  });
});
