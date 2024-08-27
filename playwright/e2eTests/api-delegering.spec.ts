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

  //Can we come up with a better "Functional name or description here?". Why do we need to delegate an api for instance?
  test('Delegate api to an organization by selecting from API providers filter', async ({
    login,
    apiDelegations,
    page,
  }) => {
    //Login and cleanup state before running test
    await login.gotoLoginPage('14824497789', page);
    await login.chooseReportee('AKTVERDIG RETORISK APE', page);
    await apiDelegations.deleteDelegatedAPI();

    await apiDelegations.apiFiltering();

    await expect(
      page.getByRole('heading', { name: 'Du ønsker å gi rettigheter til følgende API' }),
    ).toBeVisible();

    await expect(page.getByText('Maskinporten Schema - AM - K6')).toBeVisible();
    await expect(page.getByText('Testdepartement')).toBeVisible();

    await page.getByRole('button', { name: 'Bekreft' }).click();

    await expect(
      page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
    ).toBeVisible();

    await expect(page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible();
    await expect(page.getByText('Maskinporten Schema - AM - K6')).toBeVisible();
  });
});
