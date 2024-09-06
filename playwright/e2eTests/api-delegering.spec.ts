import { expect } from '@playwright/test';

import { test } from './../fixture/pomFixture';

const standardDaglUser = {
  id: '14824497789',
  reportee: 'AKTVERDIG RETORISK APE',
};

const standardApiDetails = {
  name: 'Maskinporten Schema - AM - K6',
  department: 'Testdepartement',
};

const standardOrgUser = {
  orgNumber: '310661414',
  reportee: 'INTERESSANT KOMPATIBEL TIGER AS',
};

test.describe('API-Delegations to organization user', () => {
  test('Delegate api to an organization and verify it in its delegations overview page DEBUG', async ({
    login,
    apiDelegations,
  }) => {
    await login.loginWithUser(standardDaglUser.id);
    await login.chooseReportee(standardDaglUser.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, standardOrgUser);
  });

  test('Delegate api to an organization and supplierOrg verifies it in its Delegations overview page and delete APIs it received', async ({
    login,
    logoutUser,
    apiDelegations,
    context,
  }) => {
    await login.loginWithUser(standardDaglUser.id);
    await login.chooseReportee(standardDaglUser.reportee);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);

    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      { orgNumber: standardOrgUser.orgNumber, reportee: standardOrgUser.reportee },
    );
    await logoutUser.gotoLogoutPage(standardDaglUser.reportee);
    await context.clearCookies();

    //login as DAGL of supplierOrg who recieved API delegation
    const userDagl = '26856499412';
    const supplierOrg = 'INTERESSANT KOMPATIBEL TIGER AS';
    await login.loginWithUser(userDagl);
    await login.chooseReportee(supplierOrg);
    await apiDelegations.verifyAPIOverviewPage(standardDaglUser.reportee, standardApiDetails.name);
  });

  test('Delegate api to organization to which api was delegated before', async ({
    login,
    apiDelegations,
    page,
  }) => {
    await login.loginWithUser(standardDaglUser.id);
    await login.chooseReportee(standardDaglUser.reportee);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, standardOrgUser);

    //Delegate API to same Org to which API was delegated before
    await page.goto(process.env.BASE_URL + '/ui/profile');
    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);

    await apiDelegations.verifyConfirmationPage(standardApiDetails, standardOrgUser);
  });

  test('Verify filtering of API providers in API delagation and verify Forrige/ Neste buttons', async ({
    login,
    apiDelegations,
  }) => {
    await login.loginWithUser(standardDaglUser.id);
    await login.chooseReportee(standardDaglUser.reportee);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);
    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      { orgNumber: standardOrgUser.orgNumber, reportee: standardOrgUser.reportee },
    );
  });

  test('Delegate api to an organization by selecting from API providers filter', async ({
    login,
    apiDelegations,
    page,
  }) => {
    //Login and cleanup state before running test
    await login.loginWithUser(standardDaglUser.id);
    await login.chooseReportee(standardDaglUser.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    //Replace this pls?
    await apiDelegations.delegateAPI(standardApiDetails.name, standardOrgUser.orgNumber);

    await expect(apiDelegations.giveAccessToNewApiHeading).toBeVisible();

    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
    await expect(page.getByText(standardApiDetails.department)).toBeVisible();
    await expect(page.getByText(`Org.nr. ${standardOrgUser.orgNumber}`)).toBeVisible();

    await page.getByRole('button', { name: 'Bekreft' }).click();

    await expect(
      page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
    ).toBeVisible();

    await expect(page.getByText(standardOrgUser.reportee)).toBeVisible();
    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
  });
});

test('Verify adding multiple organizations and APIs and deleting them', async ({
  login,
  apiDelegations,
}) => {
  //Login and cleanup state before running test
  await login.loginWithUser(standardDaglUser.id);
  await login.chooseReportee(standardDaglUser.reportee);

  await apiDelegations.deleteDelegatedAPIs();

  await apiDelegations.goToAccessToApiPageFromFrontPage();

  await apiDelegations.delegateNewApiButton.click();
  await apiDelegations.filterByAgencyButton.click();
  await apiDelegations.testDepartmentLabel.click();
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

test('Verify that Tilgangsstyrer does NOT have access to API delegering panel', async ({
  page,
  login,
  apiDelegations,
}) => {
  const testUser = '14824497789';
  const reporteeWithoutAccess = 'BLÅVEIS SKRAVLETE';
  await login.loginWithUser(testUser);
  await login.chooseReportee(reporteeWithoutAccess);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');

  //Make sure the user is on the correct page
  await expect(page.getByRole('heading', { name: `Profil for SKRAVLETE BLÅVEIS` })).toBeVisible();

  //Verify that the user does not have access to the API delegering panel
  await expect(apiDelegations.getApiAccessButton).not.toBeVisible();
});

// create new test that does exactly the same as the one above, but with a different user
test('Verify reportee with Programmeringsgrensesnitt (API) role does have access to API-delegering panel', async ({
  page,
  login,
  apiDelegations,
}) => {
  //Login as Tilgangsstyrer
  const user = '14824497789';
  const reporteeWithAPIRole = 'AKTVERDIG RETORISK APE';
  await login.loginWithUser(user);
  await page.pause();
  await login.chooseReportee(reporteeWithAPIRole);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');

  //Make sure the user is on the correct page
  await expect(
    page.getByRole('heading', { name: `Profil for ${reporteeWithAPIRole}` }),
  ).toBeVisible();

  //Verify that the user does have access to the API delegering panel
  await expect(apiDelegations.getApiAccessButton).toBeVisible();
});

//Create a test that verifies that user gets an error when trying to delegate an API without the correct rights
test('Verify reportee without API role does not have access to delegate an API', async ({
  page,
  login,
}) => {
  const user = '14824497789';
  const reporteeWithoutAccess = 'AKTVERDIG RETORISK APE';
  await login.loginWithUser(user);
  await login.chooseReportee(reporteeWithoutAccess);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');
  //Make sure the user is on the correct page
  await expect(
    page.getByRole('heading', { name: `Profil for ${reporteeWithoutAccess}` }),
  ).toBeVisible();
});
