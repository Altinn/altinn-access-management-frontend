import { expect } from '@playwright/test';

import { test } from './../fixture/pomFixture';

const standardApiDetails = {
  name: 'Maskinporten Schema - AM - K6',
  department: 'Testdepartement',
};

test.describe.configure({ mode: 'parallel' });

test.describe('API-Delegations to organization user', () => {
  test('Delegate api to an organization', async ({ apiDelegations, login }) => {
    const userThatDelegates = {
      id: '12917198150',
      reportee: 'AKSEPTABEL MOTLØS TIGER AS',
      orgNumber: '213920812',
    };

    const userToDelegateTo = {
      id: '16880097982',
      reportee: 'NØYTRAL NÆR TIGER AS',
      orgNumber: '312792680',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    await apiDelegations.delegateAPI(standardApiDetails.name, userToDelegateTo.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, userToDelegateTo);
  });

  test('Delegate api to an organization and receiver verifies it', async ({
    login,
    logoutUser,
    apiDelegations,
    context,
  }) => {
    const userThatDelegates = {
      id: '10896594430',
      reportee: 'EFFEKTIV SPESIFIKK MUS',
      orgNumber: '312930846',
    };

    const userThatReceivesDelegation = {
      id: '26856499412',
      reportee: 'INTERESSANT KOMPATIBEL TIGER AS',
      orgNumber: '310661414',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, userThatReceivesDelegation.orgNumber);

    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      {
        orgNumber: userThatReceivesDelegation.orgNumber,
        reportee: userThatReceivesDelegation.reportee,
      },
    );
    await logoutUser.gotoLogoutPage(userThatDelegates.reportee);
    await context.clearCookies();

    await login.loginWithUser(userThatReceivesDelegation.id);
    await login.chooseReportee(userThatReceivesDelegation.reportee);
    await apiDelegations.verifyAPIOverviewPage(userThatDelegates.reportee, standardApiDetails.name);
  });

  test('Delegate api to organization to which api was delegated before', async ({
    apiDelegations,
    page,
    login,
  }) => {
    const userThatDelegates = {
      id: '08814699979',
      reportee: 'STOLT GJENSIDIG KATT HALE',
    };

    const userThatReceivesDelegation = {
      id: '20828099591',
      reportee: 'PRESENTABEL SINDIG TIGER AS',
      orgNumber: '310881740',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    //API-delegations
    await apiDelegations.delegateAPI(standardApiDetails.name, userThatReceivesDelegation.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, userThatReceivesDelegation);

    //Delegate API to same Org to which API was delegated before
    await page.goto(process.env.BASE_URL + '/ui/profile');
    await apiDelegations.delegateAPI(standardApiDetails.name, userThatReceivesDelegation.orgNumber);
    await apiDelegations.verifyConfirmationPage(standardApiDetails, userThatReceivesDelegation);
  });

  test('Verify filtering of API providers in API delagation and verify Forrige/ Neste buttons', async ({
    apiDelegations,
    login,
  }) => {
    const userThatDelegates = {
      id: '22909398634',
      reportee: 'MÅTEHOLDEN USYMMETRISK KATT BADEAND',
    };

    const userThatReceivesDelegation = {
      id: '05823748622',
      reportee: 'BERIKENDE SØVNIG APE',
      orgNumber: '310195030',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();

    await apiDelegations.delegateAPI(standardApiDetails.name, userThatReceivesDelegation.orgNumber);
    await apiDelegations.verifyConfirmationPage(
      { name: standardApiDetails.name, department: standardApiDetails.department },
      {
        orgNumber: userThatReceivesDelegation.orgNumber,
        reportee: userThatReceivesDelegation.reportee,
      },
    );
  });

  test('Delegate api to an organization by selecting from API providers filter', async ({
    apiDelegations,
    page,
    login,
  }) => {
    const userThatDelegates = {
      id: '20828099591',
      reportee: 'PRESENTABEL SINDIG TIGER AS',
    };

    const userThatReceivesDelegation = {
      id: '06842648198',
      reportee: 'ALDRENDE OVERBEVISENDE TIGER AS',
      orgNumber: '313646963',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();
    await apiDelegations.delegateAPI(standardApiDetails.name, userThatReceivesDelegation.orgNumber);

    await expect(apiDelegations.giveAccessToNewApiHeading).toBeVisible();

    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
    await expect(page.getByText(standardApiDetails.department)).toBeVisible();
    await expect(page.getByText(`Org.nr. ${userThatReceivesDelegation.orgNumber}`)).toBeVisible();

    await apiDelegations.confirmButton.click();

    await expect(
      page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
    ).toBeVisible();

    await expect(page.getByText(userThatReceivesDelegation.reportee)).toBeVisible();
    await expect(page.getByText(standardApiDetails.name)).toBeVisible();
  });

  test('Verify adding multiple organizations and APIs and deleting them', async ({
    apiDelegations,
    page,
    login,
  }) => {
    const userThatDelegates = {
      id: '09825699926',
      reportee: 'HYGGELIG RU APE',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);
    await apiDelegations.deleteDelegatedAPIs();

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
    const organizationsToDelegateTo: [string, string][] = [
      ['310214140', 'SKEPTISK KONTANT KATT TOWNSHIP'],
      ['310110914', 'LYKKELIG DRIFTIG APE'],
      ['313259412', 'UROMANTISK ALTERNATIV KATT GÅS'],
    ];

    await apiDelegations.grantUserAccess(organizationsToDelegateTo);
    await apiDelegations.confirmAccessGranted(apiNames, organizationsToDelegateTo);
    await apiDelegations.verifyDelegatedRightsGiven(apiNames, organizationsToDelegateTo);
  });
});

test.describe('API Delegation Access Control Tests', () => {
  test('Verify that Tilgangsstyrer does NOT have access to API delegering panel', async ({
    page,
    login,
    apiDelegations,
  }) => {
    const reporteeWithoutAccess = 'AMBASSADERÅD HUMORISTISK';
    await login.loginWithUser('02828698497');
    await login.chooseReportee(reporteeWithoutAccess);

    await page.goto((process.env.BASE_URL as string) + '/ui/profile');

    //Make sure the user is on the correct page
    await expect(
      page.getByRole('heading', { name: `Profil for HUMORISTISK AMBASSADERÅD` }),
    ).toBeVisible();

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
    const userThatDelegates = {
      id: '11857399392',
      reportee: 'MORSK PROAKTIV TIGER AS',
    };

    await login.loginWithUser(userThatDelegates.id);
    await login.chooseReportee(userThatDelegates.reportee);

    await page.goto((process.env.BASE_URL as string) + '/ui/profile');
    //Make sure the user is on the correct page
    await expect(
      page.getByRole('heading', { name: `Profil for ${userThatDelegates.reportee}` }),
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
