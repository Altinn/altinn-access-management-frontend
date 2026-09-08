import { expect, test } from '../../../fixture/pomFixture';
import { SettingsApiRequests } from '../../../api-requests/SettingsApiRequests';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

/**
 * Innstillinger — varslingsadresser for virksomheten.
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
  leggTilSms: { pid: '24856398710', org: '312939053', orgName: 'KULTURELL UPOPULÆR TIGER AS' },
  endreAdresse: { pid: '23885997783', org: '210486372', orgName: 'NYSGJERRIG FORNEM PUMA BBL' },
  slettAdresse: {
    pid: '11863047716',
    org: '214240432',
    orgName: 'FORSTÅELSESFULL LOGISK TIGER AS',
  },
  sisteAdresse: {
    pid: '22856996909',
    org: '313363376',
    orgName: 'REFLEKTERENDE IHERDIG TIGER AS',
  },
};

/**
 * For the no-access test: `admin` is the organisation's daglig leder, used only
 * to grant `bruker` the right to represent the organisation. `bruker` is then a
 * plain right-holder — able to select the organisation in the header menu, but
 * not a company profile admin, which is what the test asserts.
 */
const IKKE_ADMIN = {
  admin: { pid: '14817198504', org: '314242394', orgName: 'LAV PLEIENDE TIGER AS' },
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

  test.describe('legg til SMS-adresse', () => {
    const actor = ACTORS.leggTilSms;
    // Deliberately an obviously-synthetic number, matching the dummy values in
    // the repo's own mock data. Any structurally valid Norwegian mobile number
    // could belong to a real subscriber, and this one is briefly registered as a
    // real notification address before afterEach removes it.
    const nyttNummer = { countryCode: '+47', phone: '99999999' };

    test.beforeEach(async () => {
      // Baseline keeps one email and no SMS, so the SMS dialog opens on an
      // empty first row and the org still has the one address it must have.
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('legg til SMS-adresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Legg til et telefonnummer for varslinger', async () => {
        await innstillingerPage.openSmsDialog();
        await innstillingerPage.skrivTelefonnummer(0, nyttNummer.countryCode, nyttNummer.phone);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Telefonnummeret er nå lagret', async () => {
        await innstillingerPage.openSmsDialog();
        await expect(innstillingerPage.countryCodeField(0)).toHaveValue(nyttNummer.countryCode);
        await expect(innstillingerPage.phoneField(0)).toHaveValue(nyttNummer.phone);
      });
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, {
          emails: [BASELINE_EPOST],
          phones: [],
        });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });

  test.describe('endre e-postadresse', () => {
    const actor = ACTORS.endreAdresse;
    const endretEpost = 'playwright-endret@example.com';

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
    });

    test('endre e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Endre den eksisterende e-postadressen', async () => {
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(0)).toHaveValue(BASELINE_EPOST);
        await innstillingerPage.skrivEpost(0, endretEpost);
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Den nye adressen er lagret, og den gamle er borte', async () => {
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(0)).toHaveValue(endretEpost);
        await expect(innstillingerPage.emailField(1)).toBeHidden();
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

  test.describe('slett e-postadresse', () => {
    const actor = ACTORS.slettAdresse;
    const ekstraEpost = 'playwright-skal-slettes@example.com';

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST, ekstraEpost],
      });
    });

    test('slett e-postadresse', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Virksomheten har to e-postadresser', async () => {
        await expect(innstillingerPage.addressCountBadge(2)).toBeVisible();
      });

      await test.step('Fjern den andre adressen', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.removeEmailButton(1).click();
        await innstillingerPage.lagreEndringer();
      });

      await test.step('Bare én e-postadresse er igjen', async () => {
        await expect(innstillingerPage.addressCountBadge(1)).toBeVisible();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(0)).toHaveValue(BASELINE_EPOST);
        await expect(innstillingerPage.emailField(1)).toBeHidden();
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

    test('kan ikke fjerne den siste adressen', async ({ innstillingerPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne innstillinger`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await innstillingerPage.goToInnstillinger();
      });

      await test.step('Tøm den eneste e-postadressen', async () => {
        await innstillingerPage.openEpostDialog();
        await innstillingerPage.skrivEpost(0, '');
      });

      await test.step('Feilmeldingen vises og endringen kan ikke lagres', async () => {
        await expect(innstillingerPage.noAddressesError).toBeVisible();
        await expect(innstillingerPage.saveButton).toBeDisabled();
      });

      await test.step('Adressen er uendret etter at dialogen lukkes', async () => {
        await innstillingerPage.lukkDialog();
        await innstillingerPage.openEpostDialog();
        await expect(innstillingerPage.emailField(0)).toHaveValue(BASELINE_EPOST);
      });
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, {
          emails: [BASELINE_EPOST],
          phones: [],
        });
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
