import { test, expect } from '../../fixture/pomFixture';
import { currentEnv } from '../../util/helper';

test.describe('Universell utforming – tilgangsstyring', () => {
  test.skip(currentEnv() !== 'at23', 'UU-baseline for issue #2509 kjøres i AT23.');

  test.beforeEach(async ({ login, accessManagementFrontPage }) => {
    await login.LoginToAccessManagement('20838198385');
    await login.selectActor('Diskret Nær Tiger As');
    await accessManagementFrontPage.goToUsers();
    await expect(accessManagementFrontPage.newUserButton).toBeVisible();
  });

  test('Oversikt over brukere', async ({ runAccessibilityTest }, testInfo) => {
    await test.step('Sjekk WCAG A/AA og legg funn ved rapporten', async () => {
      await runAccessibilityTest.scan(testInfo, 'brukeroversikt');
    });
  });
});
