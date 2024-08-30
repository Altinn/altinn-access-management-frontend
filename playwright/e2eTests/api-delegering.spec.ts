import exp from 'constants';
import { text } from 'stream/consumers';

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
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

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
    logoutUser,
    context,
    apiDelegations,
    page,
  }) => {
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);

    //delete delegated API
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.apiFiltering();
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
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);
    await apiDelegations.deleteDelegatedAPIs();

    await apiDelegations.apiFiltering();

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
  await login.gotoLoginPage('14824497789', page);
  await login.chooseReportee('AKTVERDIG RETORISK APE', page);

  await apiDelegations.deleteDelegatedAPIs();

  //Step 1: add multiple APIs to list for delegation
  await apiDelegations.apiAccessButton.click();
  await page.getByText('Gi og fjerne API tilganger').click();
  await page.getByRole('button', { name: 'Deleger nytt API' }).click();
  await page.getByRole('button', { name: 'Filtrer på etat' }).click();
  await page.getByLabel('Testdepartement').check();
  await page.getByLabel('Digitaliseringsdirektoratet').isChecked();
  await page.getByRole('button', { name: 'Bruk' }).click();

  //Add all
  await apiDelegations.selectApiAccess();

  // Select users that gets granted access
  await apiDelegations.grantUserAccess();

  await apiDelegations.confirmAccessGranted();

  // Verification page
  await apiDelegations.verify();

  // 31066141;
  //Step 3:   delete API added from API delegerings confirmation page
  //Step 4: verify it is not possible to delete the last API in delegerings confirmation page
  //Step 5:     //delete org added from API delegerings confirmation page
  //Step 6:     //verify it is not possible to delete the last org in delegerings confirmation page
});

// //add multiple orgs to list for delegation
// cy.addMultipleOrgsToDelegateAPI(
//   '310661414',
//   'INTERESSANT KOMPATIBEL TIGER AS',
//   '310110914',
//   'LYKKELIG DRIFTIG APE',
//   '313259412',
//   'UROMANTISK ALTERNATIV KATT GÅS',
// );
