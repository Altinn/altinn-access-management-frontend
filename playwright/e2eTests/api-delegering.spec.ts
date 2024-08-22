import exp from 'constants';

import { expect, selectors } from '@playwright/test';

import { apiDelegation } from 'playwright/pages/profile/apidelegeringPage';

import { test } from './../fixture/pomFixture';

test.describe('API-Delegations to org user', () => {
  test('Delegate api to an organization and verify it in his Delegations overview page and delete APIs delegated.', async ({
    login,
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPI();

    //API-delegations
    await apiDelegations.delegateAPI('maskinporten scheme - AM- K6', '310661414');
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6Testdepartement',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
  });

  test('Delegate api to an organization and supplierOrg verifies it in its Delegations overview page and delete APIs it received', async ({
    login,
    logoutUser,
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPI();

    //API-delegations
    await apiDelegations.delegateAPI('Maskinporten scheme - AM- K6', '310661414');
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
    await logoutUser.gotoLogoutPage('AKTVERDIG RETORISK APE', page);
    await context.clearCookies();

    //login as DAGL of supplierOrg who recieved API delegation
    await login.gotoLoginPage('26856499412', page);
    await login.chooseReportee('INTERESSANT KOMPATIBEL TIGER AS', page);
    await apiDelegations.receiverAPIOverviewPage('Maskinporten Schema - AM - K6');
  });

  test('Delegate api to organization to which api was delegated before', async ({
    login,
    logoutUser,
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPI();

    //API-delegations
    await apiDelegations.delegateAPI('maskinporten scheme - AM- K6', '310661414');
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );

    //Delegate API to same Org to which API was delegated before
    await apiDelegations.chooseApiToDelegate(
      'Automation Regression',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
  });

  test('Verify filtering of API providers in API delagation and verify Forrige/ Neste buttons', async ({
    login,
    logoutUser,
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPI();

    //API-delegations
    await apiDelegations.apiFiltering();
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6Testdepartement',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
  });

  test('Vegard Delegate api to an organization by selecting from API providers filter', async ({
    login,
    apiDelegations,
    page,
  }) => {
    //Login and cleanup state before running test

    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);
    await apiDelegations.deleteDelegatedAPI();

    //navigate to apiDelegering admin-panel
    await page.locator('text=Tilgang til programmeringsgrensesnitt - API').click();

    await page.getByText('Programmerings­grensesnitt - API').scrollIntoViewIfNeeded;

    await page.click('text=Gi og fjerne API tilganger');

    await expect(
      page.getByText(
        'Her finner du oversikt over de API-tilganger din virksomhet har delegert til andre virksomheter.',
      ),
    ).toBeVisible({ timeout: 5000 });

    await page.getByText('Deleger nytt API').click();
    await page.getByText('Filtrer på etat').click();

    // Not sure if this is needed, but was used in Cypress
    await page.waitForTimeout(1000);

    const testDepartmentCheckbox = page
      .locator('button:has-text("Testdepartement")')
      .locator('[type=checkbox]');

    testDepartmentCheckbox.check();
    //Not sure if timeout is needed
    expect(testDepartmentCheckbox).toBeChecked({ timeout: 4000 });

    const brukButton = page.locator('button', { hasText: /^Bruk$/ });
    await expect(brukButton).toBeEnabled();

    await brukButton.click();

    const headerLocator = page.locator('h4:has-text("Maskinporten Schema - AM - K6")');

    // Find the button within the h4 element that has the specific aria-label
    // button name

    const schemaHeader = headerLocator.locator(
      'button[aria-label="Legg til Maskinporten Schema - AM - K6"]',
    );

    // Ensure the button is scrolled into view
    await schemaHeader.scrollIntoViewIfNeeded();
    await schemaHeader.click();

    await page.locator('button:has-text("Neste")').click();
    //  cy.contains('button', 'Neste').click();

    //Søk på organisasjon med dette nummeret: 310661414
    const searchField = page.locator('input[type="search"]:visible').first();

    // Ensure the search field is visible and interactable
    await searchField.waitFor({ state: 'visible' });
    await searchField.click(); // Focuses (highlights) the search field

    // Type the specific text
    await searchField.fill('310661414');

    await page.locator('h4').waitFor({ state: 'visible' });
    await expect(page.locator('h4')).toHaveText(/Virksomheter basert på ditt søk/);

    const organizationName = 'INTERESSANT KOMPATIBEL TIGER AS';

    await page.locator(`p:has-text("${organizationName}")`).isVisible();
    await page.locator('p:has-text("Org.nr. 310661414")').isVisible();

    //Any button descendant of h5 with specific text
    await page.locator(`h5:has-text("${organizationName}") >> button`).click();

    // Trykk neste
    await page.locator('button:has-text("Neste")').click();

    // Ensure the correct h2 element contains the specific text "Du ønsker å gi rettigheter til følgende API"
    await expect(
      page.locator('h2:has-text("Du ønsker å gi rettigheter til følgende API")'),
    ).toBeVisible();

    await expect(page.getByText('Maskinporten Schema - AM - K6')).toBeVisible();
    await expect(page.getByText('Testdepartement')).toBeVisible();

    //Bekreft click
    await page.pause();
    const bekreftButton = page.locator('button:has-text("Bekreft")');
    await bekreftButton.click();

    await page.pause();
    //Verify this text is present:
    await page.locator('h5:has-text("Disse api-delegeringene ble gitt")').isVisible();
    //Todo: INTERESSANT KOMPATIBEL TIGER AS, verify that is present
  });
});
