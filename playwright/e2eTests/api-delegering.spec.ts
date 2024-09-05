import { expect } from '@playwright/test';

import { test } from './../fixture/pomFixture';

test.describe('API-Delegations to org user', () => {
  test('Delegate api to an organization and verify it in his Delegations overview page and delete APIs delegated.', async ({
    login,
    apiDelegations,
  }) => {
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');

    //delete delegated API - cleanup state before running test
    await apiDelegations.deleteDelegatedAPIs();

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
    apiDelegations,
    context,
  }) => {
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI('Maskinporten scheme - AM- K6', '310661414');
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
    await logoutUser.gotoLogoutPage('AKTVERDIG RETORISK APE');
    await context.clearCookies();

    //login as DAGL of supplierOrg who recieved API delegation
    await login.loginWithUser('26856499412');
    await login.chooseReportee('INTERESSANT KOMPATIBEL TIGER AS');
    await apiDelegations.receiverAPIOverviewPage('Maskinporten Schema - AM - K6');
  });

  test('Delegate api to organization to which api was delegated before', async ({
    login,
    apiDelegations,
  }) => {
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

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
    apiDelegations,
  }) => {
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //Test data
    const orgNumber = '310661414';
    const apiName = 'Maskinporten Schema - AM - K6';

    //API-delegations
    await apiDelegations.velgOgDelegerApi(apiName, orgNumber);
    await apiDelegations.delegatedAPIOverviewPage(
      'Maskinporten Schema - AM - K6Testdepartement',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
  });

  test('Delegate api to an organization by selecting from API providers filter', async ({
    login,
    apiDelegations,
    page,
  }) => {
    //Login and cleanup state before running test
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
    await apiDelegations.deleteDelegatedAPIs();

    //Test data
    const orgNumber = '310661414';
    const apiName = 'Maskinporten Schema - AM - K6';

    await apiDelegations.velgOgDelegerApi(apiName, orgNumber);

    await expect(
      page.getByRole('heading', { name: 'Du ønsker å gi rettigheter til følgende API' }),
    ).toBeVisible();

    await expect(page.getByText('Maskinporten Schema - AM - K6')).toBeVisible();
    await expect(page.getByText('Testdepartement')).toBeVisible();
    await expect(page.getByText('Org.nr. 31066141')).toBeVisible();

    await page.getByRole('button', { name: 'Bekreft' }).click();

    await expect(
      page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
    ).toBeVisible();

    await expect(page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible();
    await expect(page.getByText('Maskinporten Schema - AM - K6')).toBeVisible();
  });
});

test('Verify adding multiple organizations and APIs and deleting them', async ({
  login,
  apiDelegations,
  page,
}) => {
  //Login and cleanup state before running test
  await login.loginWithUser('14824497789');
  await login.chooseReportee('AKTVERDIG RETORISK APE');

  await apiDelegations.deleteDelegatedAPIs();

  await apiDelegations.getApiAccessButton.click();
  await apiDelegations.giveAccessButton.click();
  await apiDelegations.delegateNewApiButton.click();
  await apiDelegations.filterByAgencyButton.click();
  await apiDelegations.testDepartmentLabel.click();
  await page.getByRole('button', { name: 'Bruk' }).click();

  //Add all
  await apiDelegations.selectApiAccess();

  //  Select users that gets granted access
  const organizations: [string, string][] = [
    ['310661414', 'INTERESSANT KOMPATIBEL TIGER AS'],
    ['310110914', 'LYKKELIG DRIFTIG APE'],
    ['313259412', 'UROMANTISK ALTERNATIV KATT GÅS'],
  ];

  await apiDelegations.grantUserAccess(organizations);
  await apiDelegations.confirmAccessGranted();

  await apiDelegations.verify();
});

test('Verify that Tilgangsstyrer does NOT have access to API delegering panel', async ({
  page,
  login,
  apiDelegations,
}) => {
  const userWithoutAccess = '14824497789';
  const reportee = 'BLÅVEIS SKRAVLETE';
  await login.loginWithUser(userWithoutAccess);
  await login.chooseReportee(reportee);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');

  //Make sure the user is on the correct page
  await expect(page.getByRole('heading', { name: `Profil for SKRAVLETE BLÅVEIS` })).toBeVisible();

  //Verify that the user does not have access to the API delegering panel
  await expect(apiDelegations.getApiAccessButton).not.toBeVisible();
});

// create new test that does exactly the same as the one above, but with a different user
test('Verify user with Programmeringsgrensesnitt (API) role have access to API delegering panel', async ({
  page,
  login,
  apiDelegations,
}) => {
  //Login as Tilgangsstyrer
  const userWithAccess = '14824497789';
  const reportee = 'AKTVERDIG RETORISK APE';
  await login.loginWithUser(userWithAccess);
  await login.chooseReportee(reportee);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');

  //Make sure the user is on the correct page
  await expect(page.getByRole('heading', { name: `Profil for ${reportee}` })).toBeVisible();

  //Verify that the user does have access to the API delegering panel
  await expect(apiDelegations.getApiAccessButton).toBeVisible();
});

//Create a test that verifies that user gets an error when trying to delegate an API without the correct rights
test('Verify when user does not have access to delegate an API', async ({ page, login }) => {
  const userWithoutAccess = '14824497789';

  //310547891 == reportee
  const reportee = 'AKTVERDIG RETORISK APE';
  await login.loginWithUser(userWithoutAccess);
  await login.chooseReportee(reportee);

  await page.goto((process.env.BASE_URL as string) + '/ui/profile');
  //Make sure the user is on the correct page
  await expect(page.getByRole('heading', { name: `Profil for ${reportee}` })).toBeVisible();
});
