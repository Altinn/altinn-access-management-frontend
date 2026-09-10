import { expect, test } from '../../../fixture/pomFixture';
import { SettingsApiRequests } from '../../../api-requests/SettingsApiRequests';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

/**
 * Innstillinger — varslingsadresser for virksomheten.
 *
 * Deliberately thin: one happy path through the route a user actually takes, and
 * one role check. That is what needs a browser — the control exists, it is shown
 * to the right role, and saving reaches the right endpoint. The rules and error
 * cases (SMS, edit, delete, "must keep one address") live in
 * apiTests/innstillinger/varslingsadresser.spec.ts, where they run faster and
 * with less to go wrong.
 *
 * Each describe block has its OWN organisation, because the tests mutate that
 * organisation's notification addresses and the suite runs fully parallel — two
 * blocks sharing an org would see each other's addresses.
 *
 * Every `pid` below is the organisation's daglig leder, which is what makes them
 * company profile admin (`GET user/isCompanyProfileAdmin` returns true). To
 * source replacements, `yarn tenor:virksomhet --env <env>` prints an
 * organisation with its daglig leder; check the pair against
 * `isCompanyProfileAdmin` before using it, as not every daglig leder qualifies.
 *
 * The organisations do not need notification addresses set up in advance —
 * `setNotificationAddresses` seeds the first one when an org has none.
 */
const ACTORS = {
  leggTilEpost: { pid: '14817198504', org: '314242394', orgName: 'LAV PLEIENDE TIGER AS' },
};

/**
 * For the no-access test: `admin` is the organisation's daglig leder, used only
 * to grant `bruker` the right to represent the organisation. `bruker` is then a
 * plain right-holder — able to select the organisation in the header menu, but
 * not a company profile admin, which is what the test asserts.
 */
const IKKE_ADMIN = {
  admin: { pid: '12897599595', org: '312810336', orgName: 'EKSTRA KONKRET PUMA' },
  bruker: { pid: '14871748749' },
};

const BASELINE_EPOST = 'playwright-baseline@example.com';

test.describe('Innstillinger - varslingsadresser', () => {
  const api = new SettingsApiRequests();

  test.describe('legg til e-postadresse', () => {
    const actor = ACTORS.leggTilEpost;
    const nyEpost = 'playwright-ny-epost@example.com';

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
    });

    test('legg til e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await innstillingerPage.goToInnstillinger();
        await innstillingerPage.verifyPaaInnstillinger();
      });

      await test.step('Legg til en ny e-postadresse', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.klikkLeggTilFlere();
        await innstillingerPage.skrivEpost(1, nyEpost);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Virksomheten har nå to e-postadresser', async () => {
        await expect(innstillingerPage.addressCountBadge(2)).toBeVisible();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(0)).toHaveValue(BASELINE_EPOST);
        await expect(innstillingerPage.emailField(1)).toHaveValue(nyEpost);
      });
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });

  test.describe('bruker uten tilgang', () => {
    const { admin, bruker } = IKKE_ADMIN;
    const connections = new EnduserConnection();

    test.beforeEach(async () => {
      // Make `bruker` a plain right-holder so the organisation is selectable in
      // the header menu, without granting any administrator right.
      await connections.addConnection(admin.pid, admin.org, bruker.pid);
    });

    test('bruker uten administratorrettighet får ikke redigere varslingsadresser', async ({
      innstillingerPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${admin.orgName}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectMainUnitBySearching(admin.orgName);
        await innstillingerPage.goToInnstillingerViaUrl();
      });

      await test.step('Brukeren ser varselet om manglende tilgang', async () => {
        await expect(innstillingerPage.notAdminAlert).toBeVisible();
      });

      await test.step('og ingen varslingsadresser kan redigeres', async () => {
        await expect(innstillingerPage.sectionHeading).toBeHidden();
        await expect(innstillingerPage.emailRow).toBeHidden();
        await expect(innstillingerPage.smsRow).toBeHidden();
      });
    });

    test.afterEach(async () => {
      try {
        await connections.deleteConnection(admin.pid, admin.org, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
