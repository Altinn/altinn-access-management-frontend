import { expect, medTestbrukere } from '../../../fixture/pomFixture';

import { BASELINE_EPOST } from './testdata';

const test = medTestbrukere({ actor: 'dagligLeder', admin: 'dagligLeder', bruker: 'privatperson' });

test.describe('Innstillinger - tilgang og validering', () => {
  test.describe('kan ikke fjerne den siste adressen', () => {
    test.beforeEach(async ({ actor, api }) => {
      // Exactly one email and no SMS: emptying the email field then leaves the
      // organisation with no notification address at all, which is what the
      // dialog must refuse to save.
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('kan ikke fjerne den siste adressen', async ({ actor, innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.name} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
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

    test.afterEach(async ({ actor, api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });
  });

  test.describe('bruker uten tilgang', () => {
    test.beforeEach(async ({ admin, bruker, api }) => {
      // Make `bruker` a plain right-holder so the organisation is selectable in
      // the header menu, without granting any administrator right.
      await api.connections.addConnection(admin.pid, admin.orgNo, bruker.pid);
    });

    test('bruker uten administratorrettighet får ikke redigere varslingsadresser', async ({
      admin,
      bruker,
      innstillingerPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${admin.name}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectActor(admin.name);
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

    test.afterEach(async ({ admin, bruker, api }) => {
      await api.connections.deleteConnection(admin.pid, admin.orgNo, [bruker.pid]);
    });
  });
});
