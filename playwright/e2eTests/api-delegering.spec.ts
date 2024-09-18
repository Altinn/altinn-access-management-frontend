import { expect } from '@playwright/test';

import { test } from './../fixture/pomFixture';

const orgUser = {
  id: '14824497789',
  reportee: 'AKTVERDIG RETORISK APE',
};

const standardApiDetails = {
  name: 'Maskinporten Schema - AM - K6',
  department: 'Testdepartement',
};

const orgUserToDelegateTo = {
  orgNumber: '310661414',
  reportee: 'INTERESSANT KOMPATIBEL TIGER AS',
};

test.describe('API-Delegations to organization user', () => {
  test.beforeEach(async ({ apiDelegations, login }) => {
    await login.loginWithUser(orgUser.id);
    await login.chooseReportee(orgUser.reportee);
    await apiDelegations.deleteDelegatedAPIs();
  });

  test('Delegate api to an organization and verify it in its delegations overview page Debug', async ({
    apiDelegations,
  }) => {
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, orgUserToDelegateTo);
  });

  test('Delegate api to an organization and supplierOrg verifies it in its Delegations overview page and delete APIs it received', async ({
    login,
    logoutUser,
    apiDelegations,
    context,
  }) => {
    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);

    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      { orgNumber: orgUserToDelegateTo.orgNumber, reportee: orgUserToDelegateTo.reportee },
    );
    await logoutUser.gotoLogoutPage(orgUser.reportee);
    await context.clearCookies();

    //login as DAGL of supplierOrg who recieved API delegation
    const userDagl = '26856499412';
    const supplierOrg = 'INTERESSANT KOMPATIBEL TIGER AS';
    await login.loginWithUser(userDagl);
    await login.chooseReportee(supplierOrg);
    await apiDelegations.verifyAPIOverviewPage(orgUser.reportee, standardApiDetails.name);
  });

  test('Delegate api to organization to which api was delegated before', async ({
    apiDelegations,
    page,
  }) => {
    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, orgUserToDelegateTo);

    //Delegate API to same Org to which API was delegated before
    await page.goto(process.env.BASE_URL + '/ui/profile');
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, orgUserToDelegateTo);
  });

  test('Verify filtering of API providers in API delagation and verify Forrige/ Neste buttons', async ({
    apiDelegations,
  }) => {
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);
    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      { orgNumber: orgUserToDelegateTo.orgNumber, reportee: orgUserToDelegateTo.reportee },
    );
  });

  test('Delegate api to an organization by selecting from API providers filter', async ({
    apiDelegations,
    page,
  }) => {
    await apiDelegations.delegateAPI(standardApiDetails.name, orgUserToDelegateTo.orgNumber);

    await expect(apiDelegations.giveAccessToNewApiHeading).toBeVisible();

    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
    await expect(page.getByText(standardApiDetails.department)).toBeVisible();
    await expect(page.getByText(`Org.nr. ${orgUserToDelegateTo.orgNumber}`)).toBeVisible();

    await apiDelegations.confirmButton.click();

    await expect(
      page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
    ).toBeVisible();

    await expect(page.getByText(orgUserToDelegateTo.reportee)).toBeVisible();
    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
  });

  test('Verify adding multiple organizations and APIs and deleting them', async ({
    apiDelegations,
    page,
  }) => {
    await apiDelegations.goToAccessToApiPageFromFrontPage();

    await apiDelegations.delegateNewApiButton.click();
    await apiDelegations.filterByAgencyButton.click();

    await page.getByLabel(standardApiDetails.department).click();
    await apiDelegations.applyButton.click();

    const apiNames = [
      'AuthorizedParties: Mainunit to Organization Maskinporten Schema for utviklingstester',
      'Automation Regression',
      'AuthorizedParties: Subunit to Organization Maskinporten Schema for utviklingstester',
    ];

    await apiDelegations.selectApiAccess(apiNames);

    //  Select users that gets granted access
    const organizations: [string, string][] = [
      ['310661414', 'INTERESSANT KOMPATIBEL TIGER AS'],
      ['310110914', 'LYKKELIG DRIFTIG APE'],
      ['313259412', 'UROMANTISK ALTERNATIV KATT GÅS'],
    ];

    await apiDelegations.grantUserAccess(organizations);
    await apiDelegations.confirmAccessGranted(apiNames, organizations);
    await apiDelegations.verifyDelegatedRightsGiven(apiNames, organizations);
  });
});

test.describe('API Delegation Access Control Tests', () => {
  test('Verify that Tilgangsstyrer does NOT have access to API delegering panel', async ({
    page,
    login,
    apiDelegations,
  }) => {
    const reporteeWithoutAccess = 'BLÅVEIS SKRAVLETE';
    await login.loginWithUser(orgUser.id);
    await login.chooseReportee(reporteeWithoutAccess);

    await page.goto((process.env.BASE_URL as string) + '/ui/profile');

    //Make sure the user is on the correct page
    await expect(page.getByRole('heading', { name: `Profil for SKRAVLETE BLÅVEIS` })).toBeVisible();

    //Verify that the user does not have access to the API delegering panel
    await expect(apiDelegations.getApiAccessButton).not.toBeVisible();
  });

  test('Verify reportee with Programmeringsgrensesnitt (API) role does have access to API-delegering panel', async ({
    page,
    login,
    apiDelegations,
  }) => {
    //Login as Tilgangsstyrer
    const user = '14824497789';
    const reporteeWithAPIRole = 'AKTVERDIG RETORISK APE';
    await login.loginWithUser(user);
    await login.chooseReportee(reporteeWithAPIRole);

    await page.goto((process.env.BASE_URL as string) + '/ui/profile');

    //Make sure the user is on the correct page
    await expect(
      page.getByRole('heading', { name: `Profil for ${reporteeWithAPIRole}` }),
    ).toBeVisible();

    //Verify that the user does have access to the API delegering panel
    await expect(apiDelegations.getApiAccessButton).toBeVisible();
  });

  test('User is not able to delegate an API if they do not have the rights to the API it attempts to delegate', async ({
    page,
    login,
    apiDelegations,
  }) => {
    await login.loginWithUser(orgUser.id);
    await login.chooseReportee(orgUser.reportee);

    await page.goto((process.env.BASE_URL as string) + '/ui/profile');
    //Make sure the user is on the correct page
    await expect(
      page.getByRole('heading', { name: `Profil for ${orgUser.reportee}` }),
    ).toBeVisible();

    //Cleanup
    await apiDelegations.deleteDelegatedAPIs();

    //Attempt to delegate NUF API
    await apiDelegations.attemptToDelegateNonDelegableApi('Maskinporten Schema - AM - K6 - NUF');

    await expect(
      page.getByText(
        `Du har ikke de nødvendige rettighetene til å gjennomføre denne delegeringen. Daglig leder eller hovedadministrator kan hjelpe deg med dette`,
      ),
    ).toBeVisible();
  });
});
