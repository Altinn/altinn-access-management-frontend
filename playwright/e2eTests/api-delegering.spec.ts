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
    await apiDelegations.chooseApiToDelegate(
      'Automation Regression',
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. 310661414',
    );
  });
});
