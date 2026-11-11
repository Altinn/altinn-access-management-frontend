import { expect, test } from '../../../fixture/pomFixture';

import { ACTORS, BASELINE_EPOST } from './testdata';

test.describe('Innstillinger - SMS-adresser', () => {
  test.describe('legg til SMS-adresse', () => {
    const actor = ACTORS.leggTilSms;
    // Deliberately an obviously-synthetic number, matching the dummy values in
    // the repo's own mock data. Any structurally valid Norwegian mobile number
    // could belong to a real subscriber, and this one is briefly registered as a
    // real notification address before afterEach removes it.
    const nyttNummer = { countryCode: '+47', phone: '99999999' };

    test.beforeEach(async ({ api }) => {
      // Baseline keeps one email and no SMS, so the SMS dialog opens on an
      // empty first row and the org still has the one address it must have.
      await api.settings.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('legg til SMS-adresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Legg til et telefonnummer for varslinger', async () => {
        await innstillingerPage.openSmsDialog();
        await innstillingerPage.leggTilTelefonnummer(nyttNummer);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Telefonnummeret er nå lagret', async () => {
        await innstillingerPage.openSmsDialog();
        await expect(innstillingerPage.smsRows).toHaveCount(1);
        await expect(innstillingerPage.countryCodeFields).toHaveValue(nyttNummer.countryCode);
        await expect(innstillingerPage.phoneFields).toHaveValue(nyttNummer.phone);
      });
    });

    test.afterEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });
  });

  test.describe('ugyldig SMS-adresse', () => {
    // Nothing is saved here, so this can share an organisation with the invalid email test.
    const actor = ACTORS.ugyldigEpost;
    const ugyldigNummer = { countryCode: '+47', phone: '12345678' };

    test.beforeEach(async ({ api }) => {
      await api.settings.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('norsk nummer som ikke er et mobilnummer kan ikke lagres', async ({
      innstillingerPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Skriv inn et nummer Core ikke godtar', async () => {
        await innstillingerPage.openSmsDialog();
        await innstillingerPage.leggTilTelefonnummer(ugyldigNummer);
      });

      await test.step('Feilmeldingen vises og endringen kan ikke lagres', async () => {
        await expect(innstillingerPage.ugyldigMobilnummerFeilmelding).toBeVisible();
        await expect(innstillingerPage.saveButton).toBeDisabled();
      });
    });
  });
});
