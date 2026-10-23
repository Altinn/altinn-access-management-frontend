import { expect, test } from '../../../fixture/pomFixture';

import { ACTORS, BASELINE_EPOST, IKKE_ADMIN } from './testdata';

test.describe('Innstillinger - tilgang og validering', () => {
  test.describe('kan ikke fjerne den siste adressen', () => {
    const actor = ACTORS.sisteAdresse;

    test.beforeEach(async ({ api }) => {
      // Exactly one email and no SMS: emptying the email field then leaves the
      // organisation with no notification address at all, which is what the
      // dialog must refuse to save.
      await api.settings.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('kan ikke fjerne den siste adressen', async ({ innstillingerPage, login }) => {
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

      await test.step('Adressen er uendret etter at dialogen lukkes', async () => {
        await innstillingerPage.lukkDialog();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });
  });

  test.describe('bruker uten tilgang', () => {
    const { admin, bruker } = IKKE_ADMIN;

    test.beforeEach(async ({ api }) => {
      // Make `bruker` a plain right-holder so the organisation is selectable in
      // the header menu, without granting any administrator right.
      await api.connections.addConnection(admin.pid, admin.org, bruker.pid);
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

    test.afterEach(async ({ api }) => {
      await api.connections.deleteConnection(admin.pid, admin.org, [bruker.pid]);
    });
  });
});
