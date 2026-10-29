import { expect, test } from '../../../fixture/pomFixture';

import { BASELINE_EPOST, TESTDATA } from './testdata';

test.describe('Innstillinger - e-postadresser', () => {
  test.describe('legg til e-postadresse', () => {
    const {
      organisasjoner: [actor],
    } = TESTDATA.leggTilEpost;
    const nyEpost = 'playwright-ny-epost@example.com';

    test.beforeEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });

    test('legg til e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.name} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await innstillingerPage.goToInnstillinger();
        await innstillingerPage.verifyPaaInnstillinger();
      });

      await test.step('Legg til en ny e-postadresse', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.klikkLeggTilFlere();
        await innstillingerPage.skrivEpost('', nyEpost);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Virksomheten har nå to e-postadresser', async () => {
        await expect(innstillingerPage.emailAddressCount).toHaveText(/^2\b/);
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailFields).toHaveCount(2);
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
        await expect(innstillingerPage.emailField(nyEpost)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });
  });

  test.describe('endre e-postadresse', () => {
    const {
      organisasjoner: [actor],
    } = TESTDATA.endreAdresse;
    const endretEpost = 'playwright-endret@example.com';

    test.beforeEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });

    test('endre e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.name} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Endre den eksisterende e-postadressen', async () => {
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
        await innstillingerPage.skrivEpost(BASELINE_EPOST, endretEpost);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Den nye adressen er lagret, og den gamle er borte', async () => {
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(endretEpost)).toBeVisible();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toHaveCount(0);
        await expect(innstillingerPage.emailFields).toHaveCount(1);
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });
  });

  test.describe('slett e-postadresse', () => {
    const {
      organisasjoner: [actor],
    } = TESTDATA.slettAdresse;
    const ekstraEpost = 'playwright-skal-slettes@example.com';

    test.beforeEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST, ekstraEpost],
      });
    });

    test('slett e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.name} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Virksomheten har to e-postadresser', async () => {
        await expect(innstillingerPage.emailAddressCount).toHaveText(/^2\b/);
      });

      await test.step('Fjern den ekstra e-postadressen', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.removeEmailButton(ekstraEpost).click();
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Bare én e-postadresse er igjen', async () => {
        await expect(innstillingerPage.emailAddressCount).toHaveText(/^1\b/);
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
        await expect(innstillingerPage.emailField(ekstraEpost)).toHaveCount(0);
        await expect(innstillingerPage.emailFields).toHaveCount(1);
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });
  });

  test.describe('ugyldig e-postadresse', () => {
    const {
      organisasjoner: [actor],
    } = TESTDATA.ugyldigEpost;

    test.beforeEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });

    test('ugyldig e-postadresse kan ikke lagres', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.name} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Skriv inn en ugyldig e-postadresse', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.klikkLeggTilFlere();
        await innstillingerPage.skrivEpost('', 'ikke-en-epost');
      });

      await test.step('Feilmeldingen vises og endringen kan ikke lagres', async () => {
        await expect(innstillingerPage.ugyldigEpostFeilmelding).toBeVisible();
        await expect(innstillingerPage.saveButton).toBeDisabled();
      });

      await test.step('Den opprinnelige adressen er uendret', async () => {
        await innstillingerPage.lukkDialog();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(BASELINE_EPOST)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.orgNo, {
        emails: [BASELINE_EPOST],
      });
    });
  });
});
