import { expect, test } from '../../../fixture/pomFixture';
import { SettingsApiRequests } from '../../../api-requests/SettingsApiRequests';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

import { ACTORS, BASELINE_EPOST, IKKE_ADMIN } from './testdata';

const reportArea = { annotation: { type: 'report-area', description: 'Innstillinger' } };

test.describe('Innstillinger - tilgang og validering', reportArea, () => {
  const api = new SettingsApiRequests();

  test.describe('kan ikke fjerne den siste adressen', () => {
    const actor = ACTORS.sisteAdresse;

    test.beforeEach(async () => {
      // Exactly one email and no SMS: emptying the email field then leaves the
      // organisation with no notification address at all, which is what the
      // dialog must refuse to save.
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('kan ikke fjerne den siste adressen', async ({
      innstillingerPage,
      login,
      runAccessibilityTest,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Tøm den eneste e-postadressen', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.emailField(BASELINE_EPOST).clear();
        await innstillingerPage.emailField('').blur();
      });

      await test.step('Feilmeldingen vises og endringen kan ikke lagres', async () => {
        await expect(innstillingerPage.noAddressesError).toBeVisible();
        await expect(innstillingerPage.saveButton).toBeDisabled();
      });

      await runAccessibilityTest.scan('valideringsfeil');

      await test.step('Adressen er uendret etter at dialogen lukkes', async () => {
        await innstillingerPage.lukkDialog();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
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
        await login.selectActor(admin.orgName);
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
      await connections.deleteConnection(admin.pid, admin.org, [bruker.pid]);
    });
  });
});
