import { expect } from '@playwright/test';

import { test } from 'playwright/fixture/pomFixture';

/**
 * Selvidentifisert bruker logger inn med e-post og engangskode i stedet for fødselsnummer.
 * Adressen er en "burner" på example.com, så ingen innboks får engangskoder.
 * Den er registrert i AT23 og TT02. I et nytt miljø registreres den ved første innlogging.
 */
const SELF_IDENTIFIED_EMAIL = 'playwright-e2e-si@example.com';

test.describe('Selvidentifisert bruker', () => {
  test('Skal kunne logge inn på Tilgangsstyring', async ({ login, accessManagementFrontPage }) => {
    await test.step('Logg inn med e-post og engangskode', async () => {
      await login.loginAsSelfIdentifiedUser(SELF_IDENTIFIED_EMAIL);
    });

    await test.step('Verifiser at Tilgangsstyring vises for brukeren', async () => {
      // Altinn viser e-posten med stor forbokstav; rollenavn-matching er uansett case-insensitiv
      await expect(accessManagementFrontPage.pageHeading(SELF_IDENTIFIED_EMAIL)).toBeVisible();
      await expect(accessManagementFrontPage.usersLink).toBeVisible();
    });
  });
});
