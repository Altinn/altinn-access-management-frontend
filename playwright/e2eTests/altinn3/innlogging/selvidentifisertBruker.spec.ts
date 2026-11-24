import { expect, test } from 'playwright/fixture/pomFixture';
import { env } from 'playwright/util/helper';

/**
 * Selvidentifisert bruker logger inn med e-post og engangskode i stedet for fødselsnummer.
 * Adressene er "burnere" på example.com, så ingen innboks får engangskoder.
 */

/**
 * Én fast adresse per miljø: MinID rate-limiter innlogging per e-postadresse på tvers av
 * testmiljøene ("For mange forsøk"), så en felles adresse ville fått kjøringene til å
 * spise av samme kvote. Registrert i AT23 og TT02; i et nytt miljø registreres den ved
 * første innlogging.
 */
const KNOWN_SELF_IDENTIFIED_EMAIL = `playwright-e2e-si-${env('ENV_NAME').toLowerCase()}@example.com`;

test.describe('Selvidentifisert bruker', () => {
  test('Kjent bruker skal kunne logge inn på Tilgangsstyring', async ({
    login,
    accessManagementFrontPage,
  }) => {
    await test.step('Logg inn med e-post og engangskode', async () => {
      await login.loginAsSelfIdentifiedUser(KNOWN_SELF_IDENTIFIED_EMAIL);
    });

    await test.step('Verifiser at Tilgangsstyring vises for brukeren', async () => {
      // Altinn viser e-posten med stor forbokstav; navnematching i getByRole er case-insensitiv
      await expect(
        accessManagementFrontPage.pageHeading(KNOWN_SELF_IDENTIFIED_EMAIL),
      ).toBeVisible();
      await expect(accessManagementFrontPage.usersLink).toBeVisible();
    });
  });

  test('Ny bruker skal registreres ved første innlogging og komme inn på Tilgangsstyring', async ({
    login,
    accessManagementFrontPage,
  }) => {
    // Ny adresse hver kjøring, så Altinn må opprette identiteten under innloggingen
    const newEmail = `playwright-e2e-si-${Date.now()}@example.com`;

    await test.step('Logg inn med en e-post Altinn ikke kjenner fra før', async () => {
      await login.loginAsSelfIdentifiedUser(newEmail);
    });

    await test.step('Verifiser at Tilgangsstyring vises for den nye brukeren', async () => {
      await expect(accessManagementFrontPage.pageHeading(newEmail)).toBeVisible();
      await expect(accessManagementFrontPage.usersLink).toBeVisible();
    });
  });
});
